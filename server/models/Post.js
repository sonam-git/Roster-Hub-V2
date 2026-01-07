const { Schema, model } = require("mongoose");

const postSchema = new Schema({
  // Multi-tenant field
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  
  postText: {
    type: String,
    required: "You need to leave a post!",
    minlength: 1,
    maxlength: 280,
    trim: true,
  },
  postAuthor: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  likes: {
    type:Number,
    default: 0,
  },
  likedBy: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
      default: [],
    },
  ],
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
  },
});

const Post = model("Post", postSchema);

module.exports = Post;
