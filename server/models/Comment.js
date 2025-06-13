const { Schema, model } = require("mongoose");

const commentSchema = new Schema({
  commentText: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 280,
  },
  commentAuthor: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: [
    {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      default: [],
    },
  ],
  userId: {
    type: Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
});

const Comment = model("Comment", commentSchema);

module.exports = Comment;
