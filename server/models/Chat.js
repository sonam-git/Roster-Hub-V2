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
});

const Chat = model("Chat", chatSchema);

module.exports = Chat;
