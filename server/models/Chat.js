const { Schema, model } = require("mongoose");

const chatSchema = new Schema({
  from: {
    type: Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  seen: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  deletedBy: [
    {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      default: [],
    },
  ],
  // Multi-tenant: Organization this chat message belongs to
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
    index: true,
  },
});

// Indexes for efficient organization-scoped queries
chatSchema.index({ organizationId: 1, from: 1, createdAt: -1 });
chatSchema.index({ organizationId: 1, to: 1, createdAt: -1 });

const Chat = model("Chat", chatSchema);

module.exports = Chat;
