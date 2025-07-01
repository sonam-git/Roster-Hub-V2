const { Schema, model } = require('mongoose');
const dateFormat = require('../utils/dateFormat');

const messageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    get: (timestamp) => dateFormat(timestamp),
  },
  deletedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'Profile',
    default: []
  }],
});

module.exports = model('Message', messageSchema);
