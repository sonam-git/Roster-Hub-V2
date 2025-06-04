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
});

const SocialMediaLink = model("SocialMediaLink", socialMediaLinkSchema);

module.exports = SocialMediaLink;
