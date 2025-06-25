const { Schema, model } = require("mongoose");

// position schema in the formation
const PositionSchema = new Schema({
  slot: {        // unique index from 1…11
    type: Number,
    required: true,
  },
  player: {
    type: Schema.Types.ObjectId,
    ref: "Profile",
  },
});
// formation comment and likes schema

const FormationCommentSchema = new Schema(
  {
    commentText:  { type: String, required: true, trim: true },
    commentAuthor:{ type: String, required: true },
    user:         { type: Schema.Types.ObjectId, ref: 'Profile', required: true },

    // likes on the comment itself
    likes:   { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'Profile' }],
  },
  { timestamps: true }
);

const FormationSchema = new Schema(
  {
    game: {
      type: Schema.Types.ObjectId,
      ref: "Game",
      required: true,
      unique: true,           // one formation per game
    },
    formationType: {
      type: String,
      enum: ["1-4-3-3", "1-3-5-2", "1-4-2-3-1","1-4-1-4-1", "1-5-3-2"],
      required: true,
    },
    likes: {
      type:Number,
      default: 0,
    },
    likedBy: 
    [
      {
        type: Schema.Types.ObjectId,
        ref: 'Profile',
        default: [],
      },
    ],
    positions: [PositionSchema],  
    comments:  [FormationCommentSchema],
  },

  { timestamps: true }
);

module.exports = model("Formation", FormationSchema);
