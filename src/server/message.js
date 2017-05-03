var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// create a message schema
var messageSchema = new Schema({
  from: { type: String, required: true},
  to: { type: String, required: true},
  message: String,
  read: Boolean,
  created_at: Date,
});

messageSchema.pre('save', (next) => {
  if(this.isNew) {
    this.created_at = new Date();
    this.read = false;
  };
});

var Message = mongoose.model('Message', messageSchema);
