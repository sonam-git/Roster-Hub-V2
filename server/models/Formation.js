const { Schema, model } = require("mongoose");

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
    positions: [PositionSchema],  
  },
  { timestamps: true }
);

module.exports = model("Formation", FormationSchema);
