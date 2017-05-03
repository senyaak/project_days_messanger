var fs = require("fs");
var path = require("path");
var mongoose = require("mongoose");
var express = require("express");
var cookieParser = require("cookie-parser");
var socket = require("socket.io");
var app = express();


var User = require("./user.js").User;


var conf = JSON.parse(fs.readFileSync("config/config.json", "utf8"));


// connect to db
mongoose.connect("mongodb://localhost/messagerDB");

// start server
const server = app.listen(conf.port, conf.host, () => {
  var address = server.address().address;
  var port = server.address().port;
  console.log(`Listening on http://localhost:${port}\nAdress ${address}`);
});



app.use(cookieParser());

// Index page
app.get("/", (req, res, next) => {
  res.status(200).sendFile(path.resolve(__dirname + "/../Client/index.html"));
});

// Authentication
app.use((req, res, next) => {
  if (/\/login\/?/.test(req.url) && req.method == "POST") {
    // login with username
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
  } else {
    // login with token
    User.CheckToken(req.cookies.token).then((user) => {
      req.user = user;
      console.log("set cookie")
      next();
    }, () => {
      res.sendStatus(401);
    })
  }
});


app.get("/messages", (req, res, next) => {
  console.log(req.user);
  res.json([]);
});
// define js folder
app.use("/js", express.static(__dirname + "/../Client/js"));
app.use(express.static("node_modules/jquery/dist"));
app.use(express.static("node_modules/jquery.cookie"));

// init socket
var io = socket(server);
io.on("connection", (socket) => {
  socket.on("loggedin", (token) => {
    User.ConnectSocket(token, socket.id);
  });

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