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
  // Multi-tenant: Organization this message belongs to
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  // deletedBy: [{
  //   type: Schema.Types.ObjectId,
  //   ref: 'Profile',
  //   default: []
  // }],
});

// Indexes for efficient organization-scoped queries
messageSchema.index({ organizationId: 1, sender: 1, createdAt: -1 });
messageSchema.index({ organizationId: 1, recipient: 1, createdAt: -1 });

module.exports = model('Message', messageSchema);
