const { Schema, model } = require("mongoose");
// const bcrypt = require("bcrypt");
const bcrypt = require('bcryptjs');


const ratingSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
});

const profileSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+@.+\..+/, "Must match an email address!"],
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
  },
  
  // Multi-tenant fields
  currentOrganization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    default: null
  },
  organizations: [{
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization'
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  jerseyNumber: {
    type: Number,
    required: false,
  },
  position: {
    type: String,
    required: false,
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  profilePic: {
    type: String,
    required: false,
  },
  skills: [
    {
      type: Schema.Types.ObjectId,
      ref: "Skill",
    },
  ],
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    }
  ],

  socialMediaLinks: [ 
    {
      type: Schema.Types.ObjectId,
      ref: "SocialMediaLink",
    },
  ],

  sentMessages: [
    {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  ],
  receivedMessages: [
    {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  ],
  averageRating: {
    type: Number,
    default: 0,
  },
   // field to store ratings
  ratings: [ratingSchema],
});

// set up pre-save middleware to create password
profileSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

// compare the incoming password with the hashed password
profileSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Calculate and update the average rating
profileSchema.methods.updateAverageRating = function () {
  const totalRatings = this.ratings.length;
  const sumRatings = this.ratings.reduce((sum, { rating }) => sum + rating, 0);
  this.averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;
};

// Check if user belongs to an organization
profileSchema.methods.belongsToOrganization = function (organizationId) {
  return this.organizations.some(
    org => org.organization.toString() === organizationId.toString()
  );
};

// Get user's role in an organization
profileSchema.methods.getRoleInOrganization = function (organizationId) {
  const org = this.organizations.find(
    org => org.organization.toString() === organizationId.toString()
  );
  return org ? org.role : null;
};

// Check if user is admin or owner in an organization
profileSchema.methods.isAdminInOrganization = function (organizationId) {
  const role = this.getRoleInOrganization(organizationId);
  return role === 'admin' || role === 'owner';
};

const Profile = model("Profile", profileSchema);

module.exports = Profile;
