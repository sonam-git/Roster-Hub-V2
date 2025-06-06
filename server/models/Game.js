// models/Game.js

const { Schema, model } = require("mongoose");

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
      type: String,         // e.g. "18:30"
      required: true,
    },
    venue: {
      type: String,
      trim: true,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED"],
      default: "PENDING",
    },
    responses: [ResponseSchema],  // array of { user, isAvailable }
  },
  { timestamps: true }
);

module.exports = model("Game", GameSchema);
