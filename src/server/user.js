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
        contactList: [],
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
  FindUser: (userData) => {
    return new Promise((res, rej) => {
      User.findOne(userData, (err, user) => {
        if(err) {
          rej(err);
        } else if(user === null) {
          rej(new Error("User not found"));
        } else {
          res(user);
        }
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
        if (err || user === null) {
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
      // console.log(user)
      user.socket = socketId;
      user.save();
    });
  },
  DisconnectSocket: (socketId) => {
    User.findOne({socket: socketId}, (err, user) => {
      if(err || user === null) {
        return;
      }
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
  },
  Logout: (token) => {
    return new Promise((res, rej) => {
      User.findOne({authtoken: token}, (err, user) => {
        if(err || user === null) {
          rej(err);
          return;
        } else {
          user.authtoken = null;
          user.save((err, user) => {
            if(err) {
              rej(err);
            } else {
              res();
            }
          });
        }
      });
    });
  },
  GetContactList: (token) => {
    return exports.FindUser({authtoken: token}).then((user) => {
      return user.contactList;
    }, (err) => {
      return err;
    });
  },
  AddToContactList: (token, addUsername) => {
    return Promise.all([
      exports.FindUser({authtoken: token}),
      exports.FindUser({username: addUsername}),
    ]).then((users) => {
      if(users[0].username === users[1].username) {
        return Promise.reject(new Error("can't add yourself"));
      } else if(users[0].contactList.indexOf(addUsername) !== -1) {
        return Promise.reject(new Error("already done"));
      } else {
        users[0].contactList.push(addUsername);
        return users[0].save((err, user) => {
          if(err) {
            return Promise.reject(err);
          } else {
            return Promise.resolve();
          }
        });
      }
    });
  },
  RemoveFromContactList: (token, removeUsername) => {
    return exports.FindUser({authtoken: token}).then((user) => {
      var index = user.contactList.indexOf(removeUsername);
      if(index !== -1) {
        user.contactList.splice(index, 1);
        return user.save();
      } else {
        return Promise.reject(new Error("Nothing to delete"));
      }
    })
  }
};

module.exports.User = exports;
