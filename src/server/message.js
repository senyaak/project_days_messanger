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


// FIXME
messageSchema.pre('save', (next) => {
  if(this.isNew) {
    this.created_at = new Date();
    this.read = false;
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
              res({toSocket: toUser.socket, msg: message.message, msgId: message.id});
            });
          }
        });
      }, (err) => {
        rej(err);
      });
    });
  },
  readMessage: (id) => {
    // Message.findById
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
  }
};

module.exports.Message = exports;
