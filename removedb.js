var mongoose = require("mongoose");

mongoose.connect('mongodb://localhost/messagerDB', () => {
  mongoose.connection.db.dropDatabase(() => {

    process.exit();
  });
});
