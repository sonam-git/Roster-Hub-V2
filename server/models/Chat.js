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
});

const Chat = model("Chat", chatSchema);

module.exports = Chat;
