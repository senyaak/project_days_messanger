var fs = require("fs");
var path = require("path");
var mongoose = require("mongoose");
var express = require("express");
var cookieParser = require("cookie-parser");
var socket = require("socket.io");
var app = express();


var User = require("./user.js").User;
var Message = require("./message.js").Message;


var conf = JSON.parse(fs.readFileSync("config/config.json", "utf8"));


// connect to db
mongoose.connect("mongodb://localhost/messangerDB");

// start server
const server = app.listen(conf.port, conf.host, () => {
  var address = server.address().address;
  var port = server.address().port;
  console.log(`Listening on http://localhost:${port}\nAdress ${address}`);
});



app.use(cookieParser());


// define public folders
app.use("/js", express.static(__dirname + "/../Client/js"));
app.use("/css", express.static(__dirname + "/../Client/style/css"));
app.use("/image", express.static(__dirname + "/../Client/style/image"));
app.use(express.static("node_modules/jquery/dist"));
app.use(express.static("node_modules/jquery.cookie"));

// Index page
app.get("/", (req, res, next) => {
  res.status(200).sendFile(path.resolve(__dirname + "/../Client/index.html"));
});

// Authentication
app.use((req, res, next) => {
  if (/\/login\/?/.test(req.url) && req.method == "POST") {
    // login with username\
    if(req.headers.user) {
      User.SetToken(req.headers.user).then((token) => {
        res.send({token: token});
      }, () => {
        res.sendStatus(401);
      })
    } else {
      res.sendStatus(401);
    }
  } else if(/\/signin\/?/.test(req.url) && req.method == "POST" && req.headers.user) {
    // sign in
    User.CreateUser(req.headers.user).then((token) => {
      res.cookie("token", token).sendStatus(201);
    }, () => {
      res.status(400).send("User already exists");
    });
  } else if(/\/logout\/?/.test(req.url) && req.method == "POST") {
    User.Logout(req.cookies.token).then(() => {
      res.cookie("token", "");
      res.sendStatus(200);
      next();
    }, (err) => {
      res.status(400).json(err);
    });
  } else {
    if(!req.cookies.token) {
      res.sendStatus(401);
    } else {
      User.CheckToken(req.cookies.token).then((user) => {
        req.user = user;
        next();
      }, () => {
        res.sendStatus(401);
      })
    }

  }
});


app.get("/messages", (req, res, next) => {
  Message.GetMessagesOfUser(req.user.authtoken).then((msgs) => {
    res.json(msgs);
  });
});

app.get("/messages/:name", (req, res, next) => {
  Message.GetDialog(req.user.authtoken, req.params.name).then((msgs) => {
    res.json(msgs);
    next();
  });
});

app.put("/message/:id", (req, res, next) => {
  Message.SetReadStatus(req.params.id, req.user.authtoken).then((sender) => {
    if(sender && sender.socket) {
      io.to(sender.socket).emit("messageread", req.params.id);
    }

    res.sendStatus(200);
    next();
  }).catch((err) => {
    console.log(err)
    res.sendStatus(400);
  });
});

app.get("/contactlist", (req, res, next) => {
  User.GetContactList(req.user.authtoken).then((list) => {
    res.json(list);
  }, (err) => {
    res.sendStatus(400);
  });
});

app.put("/contactlist/:name", (req, res, next) => {
  User.AddToContactList(req.user.authtoken, req.params.name).then((list) => {
    res.sendStatus(200);
  }, (err) => {
    if(err.message === "already done") {
      res.sendStatus(304);
    } else {
      res.sendStatus(400);
    }
  });
});

app.delete("/contactlist/:name", (req, res, next) => {
  User.RemoveFromContactList(req.user.authtoken, req.params.name).then((list) => {
    res.sendStatus(200);
  }, (err) => {
    if(err.message === "Nothing to delete") {
      res.sendStatus(304);
    } else {
      res.sendStatus(400);
    }
  });
});



// init socket
var io = socket(server);
io.on("connection", (socket) => {
  socket.on("loggedin", (token) => {
    User.ConnectSocket(token, socket.id).then(() => {
      return Message.GetMessagesOfUser(token).ca;
    }).catch(() => {
      socket.emit("unauthorized");
    });

    //===== Messaging ===
  });

  socket.on("sendMessage", (toUser, msg) => {
    Message.sendMessage(socket.id, toUser, msg).then((res) => {
      if(res.toSocket) {
        io.to(res.toSocket).emit("newMessage", res.msg);
      }
      socket.emit("newMessage", res.msg);
    }, () => {
      socket.emit("sendingFail");
    });
  });

  // socket.on("");
  //===================

  socket.on("disconnect", () => {
    User.DisconnectSocket(socket.id);
  })
  // TODO init events
  // TODO messages - send read
  // TODO contactlist - add, remove
  socket.on("addUserToList", (userName) => {
    User.AddUserToList(socket.id, userName);
  });

});
