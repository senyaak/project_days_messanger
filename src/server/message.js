var User = require("./user.js").User;
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// create a message schema
var messageSchema = new Schema({
  from: { type: String, required: true},
  to: { type: String, required: true},
  message: { type: String, required: true},
  read: Boolean,
  created_at: Date,
});

messageSchema.pre('save', function(next) {
  if(this.isNew) {
    this.created_at = new Date();
    this.read = false;
    this.save();
  };
  next();
});

var Message = mongoose.model('Message', messageSchema);

exports = {
  sendMessage:(socket, toUserName, msg) => {
    return new Promise((res, rej) => {
      User.FindUser({socket: socket}).then((fromUser) => {
        var fromUsername = fromUser.username;

        var newMessage = new Message({
          from: fromUsername,
          to: toUserName,
          message: msg,
        });
        newMessage.save((err,message) => {
          if(err) {
            rej(err);
            return;
          } else {
            User.FindUser({username: toUserName}).then((toUser) => {
              res({toSocket: toUser.socket, msg: message});
            });
          }
        });
      }, (err) => {
        rej(err);
      });
    });
  },
  GetMessagesOfUser: (token) => {
    return new Promise((res, rej) => {
      User.FindUser({authtoken: token}).then((user) => {
        Message.find({$or: [{from: user.username}, {to: user.username}]}, (err, msgs) => {
          if(err) {
            res([])
          } else {
            res(msgs);
          }
        }, () => res([]));
      });
    });
  },
  GetDialog: (token, secondUserName) => {
    return new Promise((res, rej) => {
      User.FindUser({authtoken: token}).then((user) => {
        Message.find({$or: [
          {from: user.username, to: secondUserName},
          {from: secondUserName, to: user.username},
        ]}, (err, msgs) => {
          if(err) {
            console.log("fail");
            res([])
          } else {
            console.log("success");
            res(msgs);
          }
        }, () => res([]));
      })
    });
  },
  SetReadStatus: (id, token) => {
    return User.FindUser({authtoken: token}).then((user) => {
      return new Promise((res, rej) => {
        Message.findOne({_id: id}, (err, message) => {
          if (message.to !== user.username) {
            rej(400);
          } else {
            message.read = true;
            message.save((err, message) => {
              if(err) {
                rej(err);
              } else {
                res(User.FindUser({username: message.from}).then((user) => user).catch(err => null));
              }
            });
          }
        });
      });
    })
  },
};

module.exports.Message = exports;
