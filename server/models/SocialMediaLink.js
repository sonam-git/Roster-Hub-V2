const { Schema, model } = require("mongoose");

const socialMediaLinkSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "Profile", 
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["twitter", "facebook", "linkedin"], 
  },
  link: {
    type: String,
    required: true,
  },
  // Multi-tenant: Organization this social media link belongs to
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
    index: true,
  },
});

// Index for efficient organization-scoped queries
socialMediaLinkSchema.index({ organizationId: 1, userId: 1 });

const SocialMediaLink = model("SocialMediaLink", socialMediaLinkSchema);

module.exports = SocialMediaLink;
