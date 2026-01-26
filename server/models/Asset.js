const { Schema, model } = require("mongoose");

const assetSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: ["Balls", "Training Equipment", "Goals", "Jerseys", "Other"],
      default: "Other",
    },
    condition: {
      type: String,
      enum: ["Excellent", "Good", "Fair", "Poor", "Needs Replacement"],
      default: "Good",
    },
    notes: {
      type: String,
      trim: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
assetSchema.index({ organizationId: 1 });
assetSchema.index({ category: 1 });

const Asset = model("Asset", assetSchema);

module.exports = Asset;
