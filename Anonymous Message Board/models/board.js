const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const boardSchema = Schema({
  _id        : Schema.Types.ObjectId,
  board_name : { type: String, required: true, minlength: 3, maxlength: 10 },
  threads    : [{ type: Schema.Types.ObjectId, ref: 'Thread' }]
});

boardSchema.pre('remove', function(next) {
  this.model('Thread').remove({ board: this._id }, next);
});

module.exports = mongoose.model('Board', boardSchema);