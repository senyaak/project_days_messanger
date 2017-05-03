var mongoose = require('mongoose');
var crypto = require('crypto');

var Schema = mongoose.Schema;

// create a user schema
var userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  authtoken: String,
  socket: String,
  contactList: [String],
});

var User = mongoose.model('User', userSchema);

exports = {
  CreateUser: (userName) => {
    return new Promise((res, rej) => {
      var newUser = new User({
        username: userName,
      });
      newUser.save((err) => {
        if (err) {
          rej(err);
          return;
        }

        exports.SetToken(userName).then(token => res(token));
      });
    });
  },
  IsUserExists: (userName) => {
    return new Promise((res, rej) => {
      User.findOne({username: userName}, (err, user) => {
        if (err) {
          rej(err);
          return;
        }

        if(user !== null) {
          res(true);
        } else {
          res(false);
        }

      })
    });
  },
  CheckToken: (token) => {
    return new Promise((res, rej) => {
      User.findOne({ authtoken: token }, (err, user) => {
        if (err) {
          rej(err);
          return;
        }

        res(user);
      });
    });
  },
  CheckSocket: (socketId) => {
    return new Promise((res, rej) => {
      User.findOne({ socket: socketId }, (err, user) => {
        if (err) {
          rej(err);
          return;
        }

        res(user);
      });
    });
  },
  SetToken: (userName) => {
    return new Promise((res, rej) => {
      User.findOne({username: userName}, (err, user) => {
        if(err || !user) {
          rej(err);
          return;
        }

        var newToken = crypto.randomBytes(48).toString('base64');

        user.authtoken = newToken;
        user.save((err) => {
          if(err) {
            rej(err);
            return;
          }

          res(user.authtoken);
        });
      });
    });
  },
  ConnectSocket: (token, socketId) => {
    exports.CheckToken(token).then(user => {
      user.socket = socketId;
      user.save();
    });
  },
  DisconnectSocket: (socketId) => {
    User.findOne({socket: socketId}, (err, user) => {
      user.socket = null;
      user.save();
    });
  },
  AddUserToList: (socketId, userName) => {
    return exports.IsUserExists(userName).then((result) => {
      if(!result) {
        return false;
      } else {
        return exports.CheckSocket(socketId).then(user => {
          if(user.contactList.indexOf(userName) === -1) {
            user.contactList.push(userName);
            return user.save().then(() => true);
          } else {
            return false;
          }
        });
      }
    })
  }
};

module.exports.User = exports;
