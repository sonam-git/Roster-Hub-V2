// models/Game.js

const { Schema, model } = require("mongoose");


// Schema for responses to the game poll
const ResponseSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "Profile",     // refers to  Profile model
      required: true,
    },
    isAvailable: {
      type: Boolean,
      required: true,
    },
  },
  { _id: false }
);

// feedback schema for game
const FeedbackSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "Profile", required: true },
  comment: { type: String, trim: true },
  rating: { type: Number, min: 0, max: 10, required: true },
  playerOfTheMatch: { type: Schema.Types.ObjectId, ref: "Profile" },
  createdAt: { type: Date, default: Date.now }
});

const GameSchema = new Schema(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: "Profile",       // who created this game poll
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,       
      required: true,
    },
    venue: {
      type: String,
      trim: true,
      required: true,
    },
      city: {
      type: String,
      trim: true,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    opponent: {
      type: String,
      trim: true,
      required: true,
    },
    score:{
      type: String,
      trim: true,
      default: "0 - 0", // default score
    },
    result: {
      type: String,
      enum: ["HOME_WIN", "AWAY_WIN", "DRAW", "NOT_PLAYED"],
      default: "NOT_PLAYED",
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "COMPLETED","CANCELLED"],
      default: "PENDING",
    },
    averageRating: {
      type: Number,
      default: 0
    },
    responses: [ResponseSchema],  // array of { user, isAvailable }
    feedbacks: [FeedbackSchema], // array of feedbacks
  },
  { timestamps: true }
);

module.exports = model("Game", GameSchema);
