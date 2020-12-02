const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const replySchema = new Schema({
  _id        : Schema.Types.ObjectId,
  text       : { type: String, required: true, maxlength: 3000 },
  password   : { type: String, required: true, minlength: 4, maxlength: 15 },
  created_on : { type: Date, default: Date.now },
  reported   : { type: Boolean, default: false },
  threads     : { type: mongoose.Schema.Types.ObjectId, ref: 'Thread', required: true }
});

module.exports = mongoose.model('Reply', replySchema);