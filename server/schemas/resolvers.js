require("dotenv").config();
const axios = require("axios");
const { PubSub, withFilter } = require("graphql-subscriptions");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const {
  AuthenticationError,
  UserInputError,
} = require("apollo-server-express");
const {
  Profile,
  Skill,
  Message,
  SocialMediaLink,
  Post,
  Comment,
  Chat,
  Game,
  Formation,
  Organization,
} = require("../models");
const { signToken } = require("../utils/auth");
const cloudinary = require("../utils/cloudinary");
const secret = process.env.JWT_SECRET;
const { OAuth2Client } = require("google-auth-library");
const { subscribe } = require("diagnostics_channel");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// Subscription event names
const POST_ADDED = "POST_ADDED";
const COMMENT_ADDED = "COMMENT_ADDED";
const POST_LIKED = "POST_LIKED";
const POST_UPDATED = "POST_UPDATED";
const POST_DELETED = "POST_DELETED";
const COMMENT_UPDATED = "COMMENT_UPDATED";
const COMMENT_DELETED = "COMMENT_DELETED";
const COMMENT_LIKED = "COMMENT_LIKED";
const SKILL_ADDED = "SKILL_ADDED";
const SKILL_DELETED = "SKILL_DELETED";
const GAME_CREATED = "GAME_CREATED";
const GAME_CONFIRMED = "GAME_CONFIRMED";
const GAME_COMPLETED = "GAME_COMPLETED";
const GAME_CANCELLED = "GAME_CANCELLED";
const GAME_DELETED = "GAME_DELETED";
const GAME_UPDATED = "GAME_UPDATED";
const FORMATION_CREATED = "FORMATION_CREATED";
const FORMATION_UPDATED = "FORMATION_UPDATED";
const FORMATION_DELETED = "FORMATION_DELETED";
const FORMATION_COMMENT_ADDED = "FORMATION_COMMENT_ADDED";
const FORMATION_COMMENT_UPDATED = "FORMATION_COMMENT_UPDATED";
const FORMATION_COMMENT_DELETED = "FORMATION_COMMENT_DELETED";
const FORMATION_LIKED = "FORMATION_LIKED";
const FORMATION_COMMENT_LIKED = "FORMATION_COMMENT_LIKED";
const SKILL_REACTION_UPDATED = "SKILL_REACTION_UPDATED";

const pubsub = require("../pubsub"); // Use shared PubSub instance
const FOOTBALL_API = "https://api.football-data.org/v4";

// In-memory set to track online users
const onlineUsers = require("../utils/onlineUsers");

// ########## HELPER FUNCTIONS FOR MULTI-TENANT SUPPORT ########## //

/**
 * Validates that the user is authenticated and has an active organization
 * @param {Object} context - GraphQL context containing user and organizationId
 * @throws {AuthenticationError} If user is not logged in or has no active organization
 */
const requireOrganizationContext = (context) => {
  if (!context.user) {
    throw new AuthenticationError("You need to be logged in!");
  }
  if (!context.organizationId) {
    throw new AuthenticationError("You need to have an active organization! Please select or create an organization.");
  }
};

/**
 * Validates organization membership for a user
 * @param {String} organizationId - Organization ID to check
 * @param {String} userId - User ID to validate
 * @throws {AuthenticationError} If user is not a member of the organization
 */
const validateOrganizationMembership = async (organizationId, userId) => {
  const org = await Organization.findById(organizationId);
  if (!org) {
    throw new UserInputError("Organization not found!");
  }
  if (!org.isUserMember(userId)) {
    throw new AuthenticationError("You are not a member of this organization!");
  }
  return org;
};

const resolvers = {
  // ############ QUERIES ########## //
  Query: {
    // ************************** QUERY ALL PROFILES *******************************************//
    profiles: async (parent, args, context) => {
      // Use organizationId from args if provided, otherwise use context
      const organizationId = args.organizationId || context.organizationId;
      
      if (!organizationId) {
        throw new AuthenticationError("Organization ID is required!");
      }
      
      // Get organization to filter by members
      const org = await Organization.findById(organizationId);
      if (!org) {
        throw new UserInputError("Organization not found!");
      }

      // Return only profiles that are members of the current organization
      const profiles = await Profile.find({ _id: { $in: org.members } })
        .populate({
          path: "receivedMessages",
          populate: { path: "sender" },
        })
        .populate("skills")
        .populate({
          path: "socialMediaLinks",
          populate: { path: "link" },
        })
        .populate({
          path: "sentMessages",
          populate: [{ path: "sender" }, { path: "recipient" }],
        })
        .populate({
          path: "posts",
          populate: { path: "comments" },
        });
      
      return profiles;
    },
    // ************************** QUERY SINGLE PROFILE *******************************************//
    profile: async (parent, { profileId, organizationId }, context) => {
      // Use organizationId from args if provided, otherwise use context
      const orgId = organizationId || context.organizationId;
      
      const profile = await Profile.findOne({ _id: profileId })
        .populate({
          path: "receivedMessages",
          populate: { path: "sender" },
        })
        .populate("skills")
        .populate({
          path: "socialMediaLinks",
          populate: { path: "link" },
        })
        .populate({
          path: "posts",
          populate: { path: "comments" },
        });
      
      // If organizationId is provided, verify the profile is a member of that organization
      if (orgId && profile) {
        const org = await Organization.findById(orgId);
        if (org && !org.members.some(memberId => memberId.toString() === profileId.toString())) {
          throw new UserInputError("Profile not found in this organization");
        }
      }
      
      return profile;
    },
    // ************************** QUERY ME (LOGIN USER) *******************************************//
    me: async (parent, args, context) => {
      if (context.user) {
        const userId = context.user._id;
        return Profile.findById(userId)
          .populate({
            path: "receivedMessages",
            populate: { path: "sender" },
          })
          .populate({
            path: "sentMessages",
            populate: { path: "recipient" },
          })
          .populate("skills")
          .populate({
            path: "socialMediaLinks",
            populate: { path: "link" },
          })
          .populate({
            path: "posts",
            populate: { path: "comments" },
          });
      }
      throw new AuthenticationError("You need to be logged in!");
    },
    // ************************** QUERY RECIEVED MESSAGES *******************************************//
    receivedMessages: async (_, __, { user }) => {
      // Check if the user is authenticated
      if (!user) {
        throw new AuthenticationError(
          "You need to be logged in to view messages"
        );
      }

      try {
        // Retrieve messages received by the authenticated user
        const messages = await Message.find({ recipient: user._id });
        return messages;
      } catch (error) {
        console.error("Error fetching messages:", error);
        throw new Error("Failed to fetch messages");
      }
    },
    // ************************** QUERY SOCIAL MEDIA LINKS *******************************************//
    socialMediaLinks: async (_, { userId }, context) => {
      try {
        // Fetch social media links from the SocialMediaLink model based on the user's ID
        const socialMediaLinks = await SocialMediaLink.find({ userId });
        return socialMediaLinks;
      } catch (error) {
        throw new Error("Failed to fetch social media links: " + error.message);
      }
    },
    // ************************** QUERY POSTS *******************************************//
    posts: async (parent, { organizationId }, context) => {
      // Use organizationId from args if provided, otherwise use context
      const orgId = organizationId || context.organizationId;
      
      if (!orgId) {
        throw new AuthenticationError("Organization ID is required!");
      }
      
      try {
        const posts = await Post.find({ organizationId: orgId })
          .sort({ createdAt: -1 })
          .populate("comments")
          .populate("likedBy")
          .populate("userId", "name profilePic");
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },
    // ************************** QUERY SINGLE POST  *******************************************//
    post: async (parent, { postId }) => {
      try {
        const post = await Post.findById(postId)
          .populate("comments")
          .populate("likedBy")
          .populate("userId", "name profilePic");
        if (post) {
          return post;
        } else {
          throw new Error("Post not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    // ************************** QUERY COMMENTS *******************************************//
    comments: async () => {
      try {
        const comments = await Comment.find()
          .sort({ createdAt: -1 })
          .populate("likedBy");

        return comments;
      } catch (err) {
        throw new Error(err);
      }
    },
    // ************************** QUERY SINGLE COMMENT *******************************************//
    comment: async (parent, { commentId }) => {
      try {
        const comment = await Comment.findById(commentId).populate("likedBy");
        return comment;
      } catch (err) {
        throw new Error(err);
      }
    },
    // ************************** QUERY SKILLS *******************************************//
    skills: async (parent, { organizationId }, context) => {
      // Use organizationId from args if provided, otherwise use context
      const orgId = organizationId || context.organizationId;
      
      if (!orgId) {
        throw new AuthenticationError("Organization ID is required!");
      }
      
      try {
        return await Skill.find({ organizationId: orgId })
          .sort({ createdAt: -1 })
          .populate("recipient", "name");
      } catch (err) {
        throw new Error(err);
      }
    },
    // ************************** QUERY RATING *******************************************//
    getPlayerRating: async (_, { profileId }) => {
      const profile = await Profile.findById(profileId);
      if (!profile) {
        throw new Error("Profile not found");
      }
      const totalRatings = profile.ratings.reduce(
        (sum, r) => sum + r.rating,
        0
      );
      return profile.ratings.length ? totalRatings / profile.ratings.length : 0;
    },
    // ************************** QUERY CHAT *******************************************//
    getChatByUser: async (parent, { to }, context) => {
      const userId = context.user._id;
      // Check if user is authenticated
      if (!userId) {
        throw new AuthenticationError(
          "You need to be logged in to view chat conversation"
        );
      }

      try {
        // Query for chat using Chat model, only messages not deleted by current user
        const chat = await Chat.find({
          $or: [
            { from: userId, to },
            { from: to, to: userId },
          ],
          deletedBy: { $ne: userId },
        }).populate("from to"); // 'from' and 'to' are references to User model

        return chat;
      } catch (error) {
        console.error("Error fetching chat:", error);
        throw new Error("Failed to fetch chat");
      }
    },
    // ************************** QUERY ALL CHATS *******************************************//
    getAllChats: async () => {
      return await Chat.find().populate("from to");
    },
    // ************************** QUERY CHATS BETWEEN TWO USERS *******************************************//
    getChatsBetweenUsers: async (parent, { userId1, userId2 }) => {
      return await Chat.find({
        $or: [
          { from: userId1, to: userId2 },
          { from: userId2, to: userId1 },
        ],
      }).populate("from to");
    },
    // ************************** QUERY GAMES *******************************************//
    games: async (_, { organizationId, status }, context) => {
      // Use organizationId from args if provided, otherwise use context
      const orgId = organizationId || context.organizationId;
      
      if (!orgId) {
        throw new AuthenticationError("Organization ID is required!");
      }
      
      const filter = { organizationId: orgId };
      if (status) {
        filter.status = status;
      }
      return Game.find(filter)
        .populate("creator")
        .populate("responses.user")
        .populate("feedbacks.user")
        .sort({ date: 1, time: 1 });
    },
    // ************************** QUERY SINGLE GAME *******************************************//
    game: async (_, { gameId, organizationId }, context) => {
      // Use organizationId from args if provided, otherwise use context
      const orgId = organizationId || context.organizationId;
      
      if (!orgId) {
        throw new AuthenticationError("Organization ID is required!");
      }
      
      return Game.findOne({ _id: gameId, organizationId: orgId })
        .populate("creator")
        .populate("responses.user")
        .populate("feedbacks.user");
    },
    // ************************** QUERY SOCCER SCORES *******************************************//
    soccerMatches: async (_, { competitionCode, status, dateFrom, dateTo }) => {
      let url = `${FOOTBALL_API}/competitions/${competitionCode}/matches?status=${status}`;
      if (dateFrom) url += `&dateFrom=${dateFrom}`;
      if (dateTo) url += `&dateTo=${dateTo}`;

      const res = await axios.get(url, {
        headers: { "X-Auth-Token": process.env.FOOTBALL_DATA_KEY },
      });

      return res.data.matches.map((m) => ({
        homeTeam: m.homeTeam.name,
        awayTeam: m.awayTeam.name,
        homeGoals: m.score.fullTime.home,
        awayGoals: m.score.fullTime.away,
        status: m.status,
        matchday: m.matchday,
        utcDate: m.utcDate,
      }));
    },
    // ************************** QUERY FORMATION *******************************************//
    formation: async (_, { gameId, organizationId }, context) => {
      if (!context.user) throw new AuthenticationError("Not logged in");
      
      // Use organizationId from args if provided, otherwise use context
      const orgId = organizationId || context.organizationId;
      
      if (!orgId) {
        throw new AuthenticationError("Organization ID is required!");
      }
      
      return Formation.findOne({ game: gameId, organizationId: orgId })
        .populate("game")
        .populate("positions.player")
        .populate("likedBy")
        .populate("comments.user");
    },
    // ************************** QUERY MY ORGANIZATIONS *******************************************//
    myOrganizations: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }
      
      console.log('🔍 myOrganizations resolver called for user:', context.user._id);
      
      // Find all organizations where the user is a member
      const organizations = await Organization.find({
        members: context.user._id
      });
      
      console.log('✅ Found organizations:', organizations.length);
      return organizations;
    },
  },

  // ########## MUTAIIONS ########### //
  Mutation: {
    // **************************  SIGN UP / ADD USER *******************************************//
    addProfile: async (parent, { name, email, password, organizationName, inviteCode }) => {
      // Check if profile with this email already exists
      let existingProfile = await Profile.findOne({ email });
      
      let profile;
      let organization;
      let role = 'owner';

      // If inviteCode provided, join existing organization
      if (inviteCode) {
        organization = await Organization.findOne({ inviteCode });
        
        if (!organization) {
          throw new AuthenticationError('Invalid invitation code');
        }

        // Check member limit for the organization's plan
        const planLimits = {
          free: 10,
          starter: 50,
          pro: 200,
          enterprise: Infinity
        };
        
        const memberLimit = planLimits[organization.plan] || 10;
        if (organization.members.length >= memberLimit) {
          throw new AuthenticationError(`Organization has reached its member limit (${memberLimit} members)`);
        }

        // If profile exists, use it (user is joining another team)
        if (existingProfile) {
          profile = existingProfile;
          
          // Check if already a member of this organization
          const alreadyMember = organization.members.some(
            memberId => memberId.toString() === profile._id.toString()
          );
          
          if (alreadyMember) {
            throw new AuthenticationError('You are already a member of this team');
          }
        } else {
          // Create new profile for first-time user
          profile = await Profile.create({ name, email, password });
        }

        // Add user to existing organization as member
        organization.members.push(profile._id);
        organization.usage.memberCount = organization.members.length;
        await organization.save();
        
        role = 'member';
      } else {
        // Creating new team - profile must NOT already exist
        if (existingProfile) {
          throw new AuthenticationError('This email is already registered. Please login instead.');
        }
        
        // Create new profile for team creator
        profile = await Profile.create({ name, email, password });
        // Create new organization for user
        const orgName = organizationName || `${name}'s Team`;
        const slugBase = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        
        // Generate unique invite code
        const generateInviteCode = () => {
          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
          let code = '';
          for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return code;
        };
        
        let inviteCodeUnique = false;
        let newInviteCode;
        
        while (!inviteCodeUnique) {
          newInviteCode = generateInviteCode();
          const existing = await Organization.findOne({ inviteCode: newInviteCode });
          if (!existing) inviteCodeUnique = true;
        }

        organization = await Organization.create({
          name: orgName,
          slug: `${slugBase}-${Date.now()}`,
          owner: profile._id,
          members: [profile._id],
          inviteCode: newInviteCode,
          usage: { 
            memberCount: 1, 
            gameCount: 0, 
            storageUsed: 0 
          },
        });
      }

      // Update profile with organization
      // Check if profile already has this organization
      const hasOrg = profile.organizations?.some(
        org => org.organization.toString() === organization._id.toString()
      );
      
      if (!hasOrg) {
        // Add new organization to profile
        if (!profile.organizations) {
          profile.organizations = [];
        }
        profile.organizations.push({
          organization: organization._id,
          role: role,
        });
      }
      
      // Set as current organization if it's the first or if they're creating it
      if (!profile.currentOrganization || role === 'owner') {
        profile.currentOrganization = organization._id;
      }
      
      await profile.save();

      // Populate organization for response
      await organization.populate('owner');

      const token = signToken({
        email: profile.email,
        name: profile.name,
        _id: profile._id,
        organizationId: organization._id,
      });

      return { token, profile, organization };
    },
    // ************************** LOGIN  *******************************************//
    login: async (parent, { email, password }) => {
      const profile = await Profile.findOne({ email }).populate('currentOrganization');

      if (!profile) {
        throw new AuthenticationError(
          "No profile with this email and password found!"
        );
      }

      const correctPw = await profile.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect email or password!");
      }

      // Get current organization or first organization
      let organizationId = null;
      let organization = null;
      
      if (profile.currentOrganization) {
        organizationId = profile.currentOrganization._id;
        organization = profile.currentOrganization;
      } else if (profile.organizations && profile.organizations.length > 0) {
        organizationId = profile.organizations[0].organizationId;
        organization = await Organization.findById(organizationId);
      }

      const token = signToken({
        email: profile.email,
        name: profile.name,
        _id: profile._id,
        organizationId: organizationId,
      });

      return { token, profile, organization };
    },
    // ************************** LOGIN WITH GOOGLE  *******************************************//
    loginWithGoogle: async (parent, { idToken }) => {
      // Verify Google ID token
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const {
        email,
        name,
        picture: profilePic,
        sub: googleId,
      } = ticket.getPayload();

      // Find or create user
      let profile = await Profile.findOne({ email }).populate('currentOrganization');
      let organization = null;
      let isNewUser = false;

      if (!profile) {
        // Create new profile
        profile = await Profile.create({
          name,
          email,
          password: googleId,
          profilePic,
        });
        isNewUser = true;

        // Create default organization for new user
        const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        organization = await Organization.create({
          name: `${name}'s Team`,
          slug: `${slugBase}-${Date.now()}`,
          owner: profile._id,
          members: [profile._id],
          usage: { 
            memberCount: 1, 
            gameCount: 0, 
            storageUsed: 0 
          },
        });

        // Update profile with organization
        profile.organizations = [{
          organizationId: organization._id,
          role: 'owner',
        }];
        profile.currentOrganization = organization._id;
        await profile.save();
        await organization.populate('owner');
      } else {
        // Existing user - get their organization
        if (profile.currentOrganization) {
          organization = profile.currentOrganization;
        } else if (profile.organizations && profile.organizations.length > 0) {
          organization = await Organization.findById(profile.organizations[0].organizationId);
        }
      }

      // Get organization ID for token
      const organizationId = organization ? organization._id : null;

      // Sign JWT
      const token = signToken({
        email: profile.email,
        name: profile.name,
        _id: profile._id,
        organizationId: organizationId,
      });

      return { token, profile, organization };
    },
    // ************************** ADD INFO *******************************************//
    addInfo: async (
      parent,
      { profileId, jerseyNumber, position, phoneNumber },
      context
    ) => {
      // Check if the user is logged in
      if (!context.user) {
        throw new AuthenticationError(
          "You need to be logged in to update profile information"
        );
      }
      try {
        // Check if the profile exists
        const profile = await Profile.findById(profileId);
        if (!profile) {
          throw new Error("Profile not found!");
        }

        // Update the profile with the additional information
        profile.jerseyNumber = jerseyNumber;
        profile.position = position;
        profile.phoneNumber = phoneNumber;

        // Save the updated profile
        await profile.save();

        return profile;
      } catch (error) {
        console.error("Error updating profile information:", error);
        throw new Error("Failed to update profile information");
      }
    },
    // ************************** UPDATE JERSEY NUMBER *******************************************//
    updateJerseyNumber: async (
      parent,
      { profileId, jerseyNumber },
      context
    ) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in");
      }
      console.log("Update jersey number called with:", {
        profileId,
        jerseyNumber,
      });
      try {
        const profile = await Profile.findByIdAndUpdate(
          profileId,
          { jerseyNumber },
          { new: true, runValidators: true }
        );
        if (!profile) {
          throw new Error("Profile not found!");
        }
        console.log(
          "Jersey number updated successfully:",
          profile.jerseyNumber
        );
        return profile;
      } catch (error) {
        console.error("Error updating jersey number:", error);
        console.error("Error details:", error.message, error.stack);
        throw new Error(`Failed to update jersey number: ${error.message}`);
      }
    },
    // ************************** UPDATE POSITION *******************************************//
    updatePosition: async (parent, { profileId, position }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in");
      }
      console.log("Update position called with:", { profileId, position });
      try {
        const profile = await Profile.findByIdAndUpdate(
          profileId,
          { position },
          { new: true, runValidators: true }
        );
        if (!profile) {
          throw new Error("Profile not found!");
        }
        console.log("Position updated successfully:", profile.position);
        return profile;
      } catch (error) {
        console.error("Error updating position:", error);
        console.error("Error details:", error.message, error.stack);
        throw new Error(`Failed to update position: ${error.message}`);
      }
    },
    // ************************** UPDATE PHONE NUMBER *******************************************//
    updatePhoneNumber: async (parent, { profileId, phoneNumber }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in");
      }
      console.log("Update phone number called with:", {
        profileId,
        phoneNumber,
      });
      try {
        const profile = await Profile.findByIdAndUpdate(
          profileId,
          { phoneNumber },
          { new: true, runValidators: true }
        );
        if (!profile) {
          throw new Error("Profile not found!");
        }
        console.log("Phone number updated successfully:", profile.phoneNumber);
        return profile;
      } catch (error) {
        console.error("Error updating phone number:", error);
        console.error("Error details:", error.message, error.stack);
        throw new Error(`Failed to update phone number: ${error.message}`);
      }
    },
    // ************************** ADD RATING *******************************************//
    ratePlayer: async (parent, { profileId, ratingInput, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      // Validate organizationId
      if (!organizationId || context.organizationId !== organizationId) {
        throw new AuthenticationError("Invalid organization access");
      }

      // Validate user is member of organization
      const org = await Organization.findById(organizationId);
      if (!org || !org.isUserMember(context.user._id)) {
        throw new AuthenticationError("You are not a member of this organization");
      }

      const profile = await Profile.findById(profileId);
      if (!profile) {
        throw new Error("Profile not found!");
      }

      // Find existing rating from the user
      const existingRatingIndex = profile.ratings.findIndex(
        (rating) => rating.user.toString() === ratingInput.user
      );

      if (existingRatingIndex !== -1) {
        // Update existing rating
        profile.ratings[existingRatingIndex].rating = ratingInput.rating;
      } else {
        // Add new rating
        profile.ratings.push(ratingInput);
      }

      // Calculate and update the average rating
      profile.updateAverageRating();

      await profile.save();

      return profile;
    },
    // ************************** UPLOAD PROFILE PIC USING CLOUDINARY  *******************************************//
    uploadProfilePic: async (_, { profileId, profilePic }, context) => {
      if (!context.user) {
        throw new AuthenticationError(
          "You need to be logged in to update profile picture"
        );
      }

      try {
        let imageUrl = null;
        // Upload the image to Cloudinary only if an image was provided
        if (profilePic) {
          const { secure_url: uploadedImageUrl } =
            await cloudinary.uploader.upload(profilePic, {
              allowed_formats: [
                "png",
                "jpg",
                "jpeg",
                "svg",
                "ico",
                "jifif",
                "webp",
              ],
            });
          imageUrl = uploadedImageUrl;
        }

        // Find the profile by ID
        const profile = await Profile.findById(profileId);
        if (!profile) {
          throw new Error("Profile not found!");
        }

        // Update the profile's profilePic property with the Cloudinary URL
        profile.profilePic = imageUrl;

        // Save the updated profile
        await profile.save();

        return profile;
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        throw new Error("Failed to upload profile picture");
      }
    },
    // ************************** ADD SKILL  *******************************************//
    addSkill: async (parent, { profileId, skillText, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      // Validate organizationId
      if (!organizationId || context.organizationId !== organizationId) {
        throw new AuthenticationError("Invalid organization access");
      }
      
      if (skillText.trim() === "") {
        throw new Error("skillText must not be empty");
      }

      // create the raw skill
      const skill = await Skill.create({
        skillText,
        skillAuthor: context.user.name,
        recipient: profileId,
        organizationId: organizationId,
        createdAt: new Date().toISOString(),
      });

      // attach to the profile
      await Profile.findByIdAndUpdate(profileId, {
        $addToSet: { skills: skill._id },
      });

      // now populate the recipient on the new document
      const fullSkill = await Skill.findById(skill._id).populate(
        "recipient",
        "name"
      );

      // publish the populated version
      pubsub.publish(SKILL_ADDED, { skillAdded: fullSkill });

      return fullSkill;
    },
    // ************************** REMOVE SKILL *******************************************//
    removeSkill: async (parent, { skillId, organizationId }, context) => {
      if (!context.user._id) {
        throw new AuthenticationError("You need to be logged in!");
      }

      // Validate organizationId
      if (!organizationId || context.organizationId !== organizationId) {
        throw new AuthenticationError("Invalid organization access");
      }

      try {
        const skill = await Skill.findById(skillId);
        if (!skill) {
          throw new Error("Skill not found");
        }

        // Validate skill belongs to organization
        if (skill.organizationId.toString() !== organizationId) {
          throw new AuthenticationError("Skill does not belong to this organization");
        }

        const deleteSkill = await Skill.findOneAndDelete({ _id: skillId });
        if (deleteSkill) {
          pubsub.publish(SKILL_DELETED, { skillDeleted: skillId });
        }
        return deleteSkill;
      } catch (error) {
        console.error("Error deleting skill:", error);
        throw new Error("Error deleting Skill.");
      }
    },
    // ************************** REACT TO SKILL *******************************************//
    reactToSkill: async (parent, { skillId, emoji, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      // Validate organizationId
      if (!organizationId || context.organizationId !== organizationId) {
        throw new AuthenticationError("Invalid organization access");
      }

      try {
        const skill = await Skill.findById(skillId);
        if (!skill) {
          throw new Error("Skill not found");
        }

        // Validate skill belongs to organization
        if (skill.organizationId.toString() !== organizationId) {
          throw new AuthenticationError("Skill does not belong to this organization");
        }

        // Check if user already reacted
        const existingReactionIndex = skill.reactions.findIndex(
          (reaction) => reaction.user.toString() === context.user._id.toString()
        );

        if (existingReactionIndex !== -1) {
          // Update existing reaction
          skill.reactions[existingReactionIndex].emoji = emoji;
        } else {
          // Add new reaction
          skill.reactions.push({
            user: context.user._id,
            emoji: emoji,
          });
        }

        await skill.save();

        // Populate user details for reactions
        const populatedSkill = await Skill.findById(skillId)
          .populate("recipient", "name")
          .populate("reactions.user", "name");

        // Publish update via subscription
        pubsub.publish('SKILL_REACTION_UPDATED', {
          skillReactionUpdated: populatedSkill,
          skillId: skillId,
        });

        return populatedSkill;
      } catch (error) {
        console.error("Error reacting to skill:", error);
        throw new Error("Error reacting to skill");
      }
    },
    // ************************** SEND MESSAGE (its different functionality, not related to the chat functionality)*******************************************//
    sendMessage: async (_, { recipientId, text, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      // Validate organizationId
      if (!organizationId || context.organizationId !== organizationId) {
        throw new AuthenticationError("Invalid organization access");
      }

      try {
        // Find the recipient user
        const recipient = await Profile.findById(recipientId);
        if (!recipient) {
          throw new Error("Recipient user not found");
        }

        // Create a new message with the sender set to the authenticated user's ID
        const message = new Message({
          sender: context.user._id, // Set the sender to the authenticated user's ID
          recipient: recipientId, // Set the recipient to the provided user ID
          text,
          organizationId: organizationId,
          createdAt: new Date().toISOString(), // Format the current date and time
        });

        // Save the message to the database
        const savedMessage = await message.save();
        // Update sender's sentMessages and recipient's receivedMessages
        await Profile.findByIdAndUpdate(
          context.user._id,
          {
            $push: { sentMessages: savedMessage._id },
          },
          { new: true }
        );
        await Profile.findByIdAndUpdate(
          recipientId,
          {
            $push: { receivedMessages: savedMessage._id },
          },
          { new: true }
        );
        return savedMessage;
      } catch (error) {
        console.error("Error sending message:", error);
        throw new Error("Failed to send message");
      }
    },
    // ************************** REMOVE MESSAGE (its different functionality,not related to the chat functionality) *******************************************//
    removeMessage: async (parent, { messageId, organizationId }, context) => {
      if (!context.user._id) {
        throw new AuthenticationError("You need to be logged in!");
      }

      // Validate organizationId
      if (!organizationId || context.organizationId !== organizationId) {
        throw new AuthenticationError("Invalid organization access");
      }

      try {
        const message = await Message.findById(messageId);
        if (!message) {
          throw new Error("Message not found");
        }

        // Validate message belongs to organization
        if (message.organizationId.toString() !== organizationId) {
          throw new AuthenticationError("Message does not belong to this organization");
        }

        const deletedMessage = await Message.findOneAndDelete({
          _id: messageId,
        });

        if (!deletedMessage) {
          throw new Error("Message not found");
        }

        return deletedMessage; // Return the deleted message object
      } catch (error) {
        console.error("Error deleting Message:", error);
        throw new Error("Error deleting Message.");
      }
    },
    // ************************** DELETE CONVERSATION HISTORY IN THE CHAT *******************************************//
    deleteConversation: async (_, { userId, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You must be logged in");
      }

      // Validate organizationId
      if (!organizationId || context.organizationId !== organizationId) {
        throw new AuthenticationError("Invalid organization access");
      }

      // Validate user is member of organization
      const org = await Organization.findById(organizationId);
      if (!org || !org.isUserMember(context.user._id)) {
        throw new AuthenticationError("You are not a member of this organization");
      }

      const me = context.user._id;
      try {
        // Add the current user's ID to the deletedBy array for all relevant chats
        await Chat.updateMany(
          {
            organizationId: organizationId,
            $or: [
              { from: me, to: userId },
              { from: userId, to: me },
            ],
            deletedBy: { $ne: me },
          },
          { $push: { deletedBy: me } }
        );
        // remove every message where sender↔recipient is this pair within organization
        await Message.deleteMany({
          organizationId: organizationId,
          $or: [
            { sender: me, recipient: userId },
            { sender: userId, recipient: me },
          ],
        });
        return true;
      } catch (error) {
        console.error("Error deleting conversation:", error);
        throw new Error("Error deleting conversation.");
      }
    },

    // ************************** CREATE CHAT AND SEND CHAT  *******************************************//
    createChat: async (parent, { from, to, content, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      // Validate organizationId
      if (!organizationId || context.organizationId !== organizationId) {
        throw new AuthenticationError("Invalid organization access");
      }

      // Validate user is member of organization
      const org = await Organization.findById(organizationId);
      if (!org || !org.isUserMember(context.user._id)) {
        throw new AuthenticationError("You are not a member of this organization");
      }
      
      try {
        // Ensure the from, to, and content fields are provided
        if (!from || !to || !content) {
          throw new Error("All fields (from, to, content) are required.");
        }

        // Create the new chat document
        const newChat = await Chat.create({
          from,
          to,
          content,
          organizationId: organizationId,
        });

        const populatedChat = await Chat.findById(newChat._id).populate(
          "from to"
        );

        // Publish the new chat event
        pubsub.publish("CHAT_CREATED", { chatCreated: populatedChat });

        return populatedChat;
      } catch (error) {
        console.error("Error creating chat:", error);
        throw new Error("Failed to create chat");
      }
    },

    // ************************** SAVE SOCIAL MEDIA LINK  *******************************************//
    saveSocialMediaLink: async (_, { userId, type, link, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      // Validate organizationId
      if (!organizationId || context.organizationId !== organizationId) {
        throw new AuthenticationError("Invalid organization access");
      }

      // Validate user is member of organization
      const org = await Organization.findById(organizationId);
      if (!org || !org.isUserMember(context.user._id)) {
        throw new AuthenticationError("You are not a member of this organization");
      }

      try {
        // Save or update the social media link in the SocialMediaLink model
        let socialMediaLink = await SocialMediaLink.findOneAndUpdate(
          { userId, type, organizationId },
          { link },
          { upsert: true, new: true }
        );

        // Find the Profile by its ID and update the socialMediaLinks array
        const updatedProfile = await Profile.findOneAndUpdate(
          { _id: userId },
          { $addToSet: { socialMediaLinks: socialMediaLink._id } },
          { new: true }
        ).populate("socialMediaLinks");

        if (!updatedProfile) {
          throw new Error("Profile not found!");
        }

        return socialMediaLink;
      } catch (error) {
        throw new Error("Failed to save social media link: " + error.message);
      }
    },
    // ************************** REMOVE SOCIAL MEDIA LINK *******************************************//
    removeSocialMediaLink: async (_, { userId, type, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      // Validate organizationId
      if (!organizationId || context.organizationId !== organizationId) {
        throw new AuthenticationError("Invalid organization access");
      }

      // Validate user is member of organization
      const org = await Organization.findById(organizationId);
      if (!org || !org.isUserMember(context.user._id)) {
        throw new AuthenticationError("You are not a member of this organization");
      }

      // Find the SocialMediaLink document
      const linkDoc = await SocialMediaLink.findOne({ userId, type, organizationId });
      if (linkDoc) {
        await SocialMediaLink.deleteOne({ _id: linkDoc._id });
        // Remove the reference from the Profile
        await Profile.findByIdAndUpdate(userId, {
          $pull: { socialMediaLinks: linkDoc._id },
        });
      }
      return true;
    },
    // ************************** UPDATE USER NAME *******************************************//
    updateName: async (_, { name }, context) => {
      if (!context.user) {
        throw new AuthenticationError(
          "You need to be logged in to update name!"
        );
      }

      try {
        const profile = await Profile.findById(context.user._id);

        if (!profile) {
          throw new Error("Profile not found!");
        }

        profile.name = name;
        await profile.save();
        return profile;
      } catch (error) {
        console.error("Error updating name:", error);
        throw new Error("Failed to update name.");
      }
    },
    // ************************** UPDATE PASSWORD *******************************************//
    updatePassword: async (_, { currentPassword, newPassword }, context) => {
      // Check if the user is authenticated
      if (!context.user) {
        throw new AuthenticationError(
          "You need to be logged in to update the password!"
        );
      }
      try {
        // Find the user's profile
        const profile = await Profile.findById(context.user._id);
        if (!profile) {
          throw new Error("Profile not found!");
        }

        // Check if the current password matches
        const isMatch = await profile.isCorrectPassword(currentPassword);
        if (!isMatch) {
          throw new Error("Incorrect current password!");
        }

        profile.password = newPassword;
        await profile.save();
        return profile;
      } catch (error) {
        console.error("Error updating password:", error);
        throw new Error("Failed to update password.");
      }
    },
    // ************************** ADD POST *******************************************//
    addPost: async (parent, { profileId, postText, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      // Validate organizationId
      if (!organizationId || context.organizationId !== organizationId) {
        throw new AuthenticationError("Invalid organization access");
      }

      // Validate user is member of organization
      const org = await Organization.findById(organizationId);
      if (!org || !org.isUserMember(context.user._id)) {
        throw new AuthenticationError("You are not a member of this organization");
      }

      if (postText.trim() === "") {
        throw new Error("Post body must not be empty");
      }

      try {
        // Create the post
        const post = await Post.create({
          postText,
          postAuthor: context.user.name,
          createdAt: new Date().toISOString(),
          userId: context.user._id,
          organizationId: organizationId,
        });

        // Update the profile to include the post
        await Profile.findOneAndUpdate(
          { _id: profileId },
          { $addToSet: { posts: post._id } }
        );
        const populated = await Post.findById(post._id)
          .populate("userId", "name profilePic")
          .populate("comments")
          .populate("likedBy");
        pubsub.publish(POST_ADDED, { postAdded: populated });
        return populated;
      } catch (err) {
        console.error("Error creating post:", err);
        throw new Error("Error creating post");
      }
    },
    // ************************** UPDATE POST  *******************************************//
    updatePost: async (_, { postId, postText, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      // Validate organizationId
      if (!organizationId || context.organizationId !== organizationId) {
        throw new AuthenticationError("Invalid organization access");
      }

      try {
        // Find the post by postId
        const post = await Post.findById(postId);

        if (!post) {
          throw new Error("Post not found.");
        }

        // Validate post belongs to organization
        if (post.organizationId.toString() !== organizationId) {
          throw new AuthenticationError("Post does not belong to this organization");
        }

        // Check if the current user is the author of the post
        if (post.userId.toString() !== context.user._id) {
          // Ensure types match
          throw new AuthenticationError("You are not the author of this post.");
        }

        // Update the postText
        post.postText = postText;

        // Save the updated post
        await post.save();

        const populated = await Post.findById(postId)
          .populate("userId", "name profilePic")
          .populate("comments")
          .populate("likedBy");

        pubsub.publish(POST_UPDATED, { postUpdated: populated });

        return populated;
      } catch (error) {
        throw new Error("Failed to update the post.");
      }
    },
    // ************************** DELETE POST *******************************************//
    removePost: async (parent, { postId, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      // Validate organizationId
      if (!organizationId || context.organizationId !== organizationId) {
        throw new AuthenticationError("Invalid organization access");
      }

      try {
        const post = await Post.findById(postId);
        
        if (!post) {
          throw new Error("Post not found.");
        }

        // Validate post belongs to organization
        if (post.organizationId.toString() !== organizationId) {
          throw new AuthenticationError("Post does not belong to this organization");
        }

        // Check if the current user is the author of the post
        if (post.userId.toString() !== context.user._id) {
          throw new AuthenticationError("You are not the author of this post.");
        }

        const deletedPost = await Post.findOneAndDelete({ _id: postId });
        if (deletedPost) {
          pubsub.publish(POST_DELETED, { postDeleted: postId });
        }

        return deletedPost;
      } catch (error) {
        console.error("Error deleting post:", error);
        throw new Error("Error deleting post.");
      }
    },
    // ************************** LIKE POST *******************************************//
    likePost: async (parent, { postId, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("Not logged in");
      }

      // Validate organizationId
      if (!organizationId || context.organizationId !== organizationId) {
        throw new AuthenticationError("Invalid organization access");
      }

      const post = await Post.findById(postId);
      const userId = context.user._id;

      if (!post) {
        throw new Error("Post not found");
      }

      // Validate post belongs to organization
      if (post.organizationId.toString() !== organizationId) {
        throw new AuthenticationError("Post does not belong to this organization");
      }

      const alreadyLiked = post.likedBy.includes(userId);

      if (alreadyLiked) {
        post.likes -= 1;
        post.likedBy = post.likedBy.filter((id) => id.toString() !== userId);
      } else {
        post.likes += 1;
        post.likedBy.push(userId);
      }

      await post.save();
      await post.populate("likedBy"); // Populate the likedBy field
      pubsub.publish(POST_LIKED, { postLiked: post });
      return post;
    },
    // ************************** ADD COMMENT *******************************************//
    addComment: async (parent, { postId, commentText, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      // Validate organizationId
      if (!organizationId || context.organizationId !== organizationId) {
        throw new AuthenticationError("Invalid organization access");
      }
      
      try {
        // 1️⃣ create the comment
        const newComment = await Comment.create({
          commentText,
          commentAuthor: context.user.name,
          userId: context.user._id,
          organizationId: organizationId,
        });

        // 2️⃣ push its _id into the Post.comments array
        const updatedPost = await Post.findByIdAndUpdate(
          postId,
          { $addToSet: { comments: newComment._id } },
          { new: true }
        )
          // only populate the comments array itself—not the nested userId
          .populate("comments");

        // 3️⃣ broadcast the raw comment (with userId:ObjectId) to all watchers
        pubsub.publish(COMMENT_ADDED, {
          commentAdded: newComment,
          postId: postId.toString(),
        });

        // 4️⃣ return the updated post
        return updatedPost;
      } catch (err) {
        console.error("Error adding comment:", err);
        throw new Error("Error adding comment");
      }
    },
    // ************************** UPDATE COMMENT *******************************************//
    updateComment: async (parent, { commentId, commentText, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      // Validate organizationId
      if (!organizationId || context.organizationId !== organizationId) {
        throw new AuthenticationError("Invalid organization access");
      }

      try {
        const comment = await Comment.findById(commentId);
        
        if (!comment) {
          throw new Error("Comment not found");
        }

        // Validate comment belongs to organization
        if (comment.organizationId.toString() !== organizationId) {
          throw new AuthenticationError("Comment does not belong to this organization");
        }

        // Validate user is author
        if (comment.userId.toString() !== context.user._id) {
          throw new AuthenticationError("Not authorized");
        }

        const updatedComment = await Comment.findOneAndUpdate(
          { _id: commentId, userId: context.user._id },
          { commentText },
          { new: true }
        );

        pubsub.publish(COMMENT_UPDATED, { commentUpdated: updatedComment });

        return updatedComment;
      } catch (err) {
        console.error(err);
        throw new Error("Error updating comment");
      }
    },
    // ************************** REMOVE COMMENT *******************************************//
    removeComment: async (parent, { postId, commentId, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      // Validate organizationId
      if (!organizationId || context.organizationId !== organizationId) {
        throw new AuthenticationError("Invalid organization access");
      }

      try {
        const comment = await Comment.findById(commentId);
        
        if (!comment) {
          throw new Error("Comment not found");
        }

        // Validate comment belongs to organization
        if (comment.organizationId.toString() !== organizationId) {
          throw new AuthenticationError("Comment does not belong to this organization");
        }

        const deletedComment = await Comment.findOneAndDelete({
          _id: commentId,
          userId: context.user._id,
        });

        if (!deletedComment) {
          throw new Error("Comment not found or not authorized");
        }

        await Post.findByIdAndUpdate(postId, {
          $pull: { comments: commentId },
        });

        pubsub.publish(COMMENT_DELETED, { commentDeleted: commentId });

        return commentId;
      } catch (err) {
        console.error(err);
        throw new Error("Error removing comment");
      }
    },
    // ************************** LIKE COMMENT *******************************************//
    likeComment: async (parent, { commentId, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("Not logged in");
      }

      // Validate organizationId
      if (!organizationId || context.organizationId !== organizationId) {
        throw new AuthenticationError("Invalid organization access");
      }

      const comment = await Comment.findById(commentId);
      const userId = context.user._id;

      if (!comment) {
        throw new Error("Comment not found");
      }

      // Validate comment belongs to organization
      if (comment.organizationId.toString() !== organizationId) {
        throw new AuthenticationError("Comment does not belong to this organization");
      }

      const alreadyLiked = comment.likedBy.includes(userId);

      if (alreadyLiked) {
        comment.likes -= 1;
        comment.likedBy = comment.likedBy.filter(
          (id) => id.toString() !== userId
        );
      } else {
        comment.likes += 1;
        comment.likedBy.push(userId);
      }

      await comment.save();
      await comment.populate("likedBy"); // Populate the likedBy field
      pubsub.publish(COMMENT_LIKED, { commentLiked: comment });
      return comment;
    },
    // ************************** DELETE PROFILE *******************************************//
    deleteProfile: async (_, { profileId }, context) => {
      if (!context.user) {
        throw new AuthenticationError(
          "You need to be logged in first to remove profile "
        );
      }
      try {
        // Find the profile by ID and delete it
        const profile = await Profile.findByIdAndDelete(profileId);
        if (!profile) {
          throw new Error("Profile not found");
        }
        
        // Delete all skills associated with the deleted profile (skills received)
        await Skill.deleteMany({ _id: { $in: profile.skills } });
        
        // Delete all skills created/endorsed BY the deleted user (where they are the author)
        // This ensures skills they gave to others are also removed
        const skillsCreatedByUser = await Skill.find({ skillAuthor: profile.name });
        const skillIdsCreatedByUser = skillsCreatedByUser.map(s => s._id);
        await Skill.deleteMany({ skillAuthor: profile.name });
        
        // Remove these skill references from other profiles
        await Profile.updateMany(
          {},
          { $pull: { skills: { $in: skillIdsCreatedByUser } } }
        );
        
        // Delete all social media links associated with the deleted profile
        await SocialMediaLink.deleteMany({ userId: profileId });
        // Delete messages where the deleted profile is either sender or recipient
        await Message.deleteMany({
          $or: [{ sender: profileId }, { recipient: profileId }],
        });
        //delete chats where the deleted profile is either from or to
        await Chat.deleteMany({
          $or: [{ from: profileId }, { to: profileId }],
        });
        // Delete all posts created by the user
        const userPosts = await Post.find({ userId: profileId });
        const postIds = userPosts.map((p) => p._id);
        await Post.deleteMany({ userId: profileId });
        // Remove post references from all profiles
        await Profile.updateMany({}, { $pull: { posts: { $in: postIds } } });
        // Remove post references from all comments
        await Comment.updateMany({}, { $pull: { postId: { $in: postIds } } });

        // Delete all comments created by the user
        const userComments = await Comment.find({ userId: profileId });
        const commentIds = userComments.map((c) => c._id);
        await Comment.deleteMany({ userId: profileId });
        // Remove comment references from all posts
        await Post.updateMany({}, { $pull: { comments: { $in: commentIds } } });
        // Remove post likes from all posts
        await Post.updateMany(
          {},
          { $pull: { likedBy: profileId }, $inc: { likes: -1 } }
        );
        // Remove comment likes from all comments
        await Comment.updateMany(
          {},
          { $pull: { likedBy: profileId }, $inc: { likes: -1 } }
        );

        // Delete all games created by the user
        const userGames = await Game.find({ creator: profileId });
        const gameIds = userGames.map((g) => g._id);
        await Game.deleteMany({ creator: profileId });
        // Remove game references from formations
        await Formation.deleteMany({ game: { $in: gameIds } });
        // Remove game references from other places if needed (add more if your schema has them)

        return profile;
      } catch (error) {
        console.error("Error removing profile:", error);
        throw new Error("Failed to remove profile");
      }
    },
    // ************************** FORGOT PASSWORD FUNCTIONALITY *******************************************//
    sendResetPasswordEmail: async (_, { email }) => {
      try {
        const user = await Profile.findOne({ email });
        if (!user) {
          return {
            message:
              "If an account with that email exists, a reset link has been sent.",
          };
        }

        const resetToken = signToken({
          email: user.email,
          name: user.name,
          _id: user._id,
        });

        const transporter = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Password Reset",
          text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                   Please click on the following link, or paste this into your browser to complete the process:\n\n
                   https://roster-hub-v2-y6j2.vercel.app/reset-password/${resetToken}\n\n
                   If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };

        await transporter.sendMail(mailOptions);

        return {
          message:
            "If an account with that email exists, a reset link has been sent.",
        };
      } catch (error) {
        console.error(error);
        return { message: "An error occurred while sending the reset email." };
      }
    },
    // ************************** RESET PASSWORD FUNCTIONALITY *******************************************//
    resetPassword: async (_, { token, newPassword }) => {
      try {
        const decoded = jwt.verify(token, secret);
        const user = await Profile.findOne({ email: decoded.data.email });

        if (!user) {
          throw new UserInputError("Invalid token or user does not exist");
        }

        // Set the new password using the method defined in the Profile model
        user.password = newPassword;
        await user.save();

        return { message: "Password has been successfully reset." };
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          throw new AuthenticationError("Password reset token has expired.");
        } else if (error instanceof jwt.JsonWebTokenError) {
          throw new AuthenticationError("Password reset token is invalid.");
        } else {
          throw new AuthenticationError(
            "An error occurred during password reset."
          );
        }
      }
    },
    // ************************** SEND TEAM INVITE EMAILS *******************************************//
    sendTeamInvite: async (_, { emails, organizationId }, context) => {
      try {
        // Get organization details
        const organization = await Organization.findById(organizationId).populate('owner');
        
        if (!organization) {
          throw new AuthenticationError('Organization not found');
        }

        // Verify the sender is the owner or admin
        if (!context.user || context.user._id.toString() !== organization.owner._id.toString()) {
          throw new AuthenticationError('Only team owners can send invites');
        }

        // Setup email transporter
        const transporter = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });

        // Get the app URL from environment or use default
        const appUrl = process.env.APP_URL || 'https://roster-hub-v2-y6j2.vercel.app';
        const joinUrl = `${appUrl}/login?inviteCode=${organization.inviteCode}`;

        // Send email to each recipient
        const sendPromises = emails.map(async (email) => {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `You're invited to join ${organization.name} on RosterHub!`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <h2 style="color: #059669; margin-bottom: 20px;">🎉 You're Invited to Join a Team!</h2>
                  
                  <p style="font-size: 16px; color: #374151; margin-bottom: 15px;">
                    <strong>${organization.owner.name}</strong> has invited you to join <strong>${organization.name}</strong> on RosterHub.
                  </p>
                  
                  <p style="font-size: 14px; color: #6b7280; margin-bottom: 25px;">
                    RosterHub is where teams connect, communicate, and manage games together.
                  </p>
                  
                  <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                    <p style="font-size: 14px; color: #065f46; margin-bottom: 10px; font-weight: bold;">
                      Your Team Invite Code:
                    </p>
                    <p style="font-size: 24px; font-weight: bold; color: #059669; letter-spacing: 2px; margin: 0;">
                      ${organization.inviteCode}
                    </p>
                  </div>
                  
                  <div style="margin-bottom: 25px;">
                    <a href="${joinUrl}" style="display: inline-block; background-color: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      Join ${organization.name}
                    </a>
                  </div>
                  
                  <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 25px;">
                    <p style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">
                      <strong>How to join:</strong>
                    </p>
                    <ol style="font-size: 13px; color: #6b7280; margin: 0; padding-left: 20px;">
                      <li style="margin-bottom: 5px;">Click the button above or visit <a href="${appUrl}/login" style="color: #059669;">${appUrl}/login</a></li>
                      <li style="margin-bottom: 5px;">Click the "Join Team" tab</li>
                      <li style="margin-bottom: 5px;">Enter your name, email, password, and the invite code above</li>
                      <li>Start collaborating with your team!</li>
                    </ol>
                  </div>
                  
                  <p style="font-size: 12px; color: #9ca3af; margin-top: 25px; text-align: center;">
                    If you didn't expect this invitation, you can safely ignore this email.
                  </p>
                </div>
              </div>
            `,
            text: `
You're invited to join ${organization.name} on RosterHub!

${organization.owner.name} has invited you to join their team.

Your Team Invite Code: ${organization.inviteCode}

To join:
1. Visit ${appUrl}/login
2. Click "Join Team"
3. Enter your details and the invite code: ${organization.inviteCode}

Or click this link: ${joinUrl}

If you didn't expect this invitation, you can safely ignore this email.
            `,
          };

          return transporter.sendMail(mailOptions);
        });

        // Wait for all emails to send
        await Promise.all(sendPromises);

        return {
          message: `Invitations sent successfully to ${emails.length} email(s)`,
        };
      } catch (error) {
        console.error('Error sending team invites:', error);
        return { 
          message: "An error occurred while sending invitations. Please try again." 
        };
      }
    },
  },

  // ############  SUBSCRIPTION  ############ //
  Subscription: {
    // chat related subscription
    chatCreated: {
      subscribe: () => pubsub.asyncIterator(["CHAT_CREATED"]),
    },
    chatSeen: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(["CHAT_SEEN"]),
        (payload, variables) => {
          // Only notify the user who sent the message
          return String(payload.to) === String(variables.to);
        }
      ),
    },
    // skill related subscription
    skillAdded: {
      subscribe: () => pubsub.asyncIterator(SKILL_ADDED),
    },
    skillDeleted: {
      subscribe: () => pubsub.asyncIterator(SKILL_DELETED),
    },
    // posts related subscription
    postAdded: {
      subscribe: () => pubsub.asyncIterator([POST_ADDED]),
    },
    postLiked: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(POST_LIKED),
        (payload, variables) =>
          payload.postLiked._id.toString() === variables.postId
      ),
    },
    postUpdated: {
      subscribe: () => pubsub.asyncIterator(POST_UPDATED),
    },
    postDeleted: {
      subscribe: () => pubsub.asyncIterator(POST_DELETED),
    },
    // post's comment related subscriptions
    commentAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([COMMENT_ADDED]),
        (payload, variables) => payload.postId === variables.postId
      ),
      resolve: (payload) => payload.commentAdded,
    },
    commentUpdated: {
      subscribe: () => pubsub.asyncIterator(COMMENT_UPDATED),
    },
    commentDeleted: {
      subscribe: () => pubsub.asyncIterator(COMMENT_DELETED),
    },
    commentLiked: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(COMMENT_LIKED),
        (payload, variables) =>
          payload.commentLiked._id.toString() === variables.commentId
      ),
    },
    // game related subscriptions
    gameCreated: {
      subscribe: () => pubsub.asyncIterator(GAME_CREATED),
    },
    gameConfirmed: {
      subscribe: () => pubsub.asyncIterator(GAME_CONFIRMED),
    },
    gameCompleted: {
      subscribe: () => pubsub.asyncIterator(GAME_COMPLETED),
    },
    gameCancelled: {
      subscribe: () => pubsub.asyncIterator(GAME_CANCELLED),
    },
    gameDeleted: {
      subscribe: () => pubsub.asyncIterator(GAME_DELETED),
    },
    gameUpdated: {
      subscribe: () => pubsub.asyncIterator(GAME_UPDATED),
    },
    // formation related subscription
    formationCreated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([FORMATION_CREATED]),
        (payload, variables) => {
          console.log('🔍 FORMATION_CREATED filter called with:', {
            hasPayload: !!payload,
            hasFormationCreated: !!payload?.formationCreated,
            hasGame: !!payload?.formationCreated?.game,
            payloadGameId: payload?.formationCreated?.game?._id?.toString(),
            payloadGameType: typeof payload?.formationCreated?.game,
            variableGameId: variables?.gameId?.toString(),
            variablesKeys: Object.keys(variables || {})
          });
          
          const match = payload?.formationCreated?.game?._id.toString() === variables?.gameId?.toString();
          console.log('🔍 FORMATION_CREATED filter result:', { match });
          return match;
        }
      ),
      resolve: (payload) => payload.formationCreated,
    },

    formationUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([FORMATION_UPDATED]),
        (payload, variables) => {
          console.log('🔍 FORMATION_UPDATED filter called with:', {
            hasPayload: !!payload,
            hasFormationUpdated: !!payload?.formationUpdated,
            hasGame: !!payload?.formationUpdated?.game,
            payloadGameId: payload?.formationUpdated?.game?._id?.toString(),
            payloadGameType: typeof payload?.formationUpdated?.game,
            variableGameId: variables?.gameId?.toString(),
            variablesKeys: Object.keys(variables || {})
          });
          
          const match = payload?.formationUpdated?.game?._id.toString() === variables?.gameId?.toString();
          console.log('🔍 FORMATION_UPDATED filter result:', { match });
          return match;
        }
      ),
      resolve: (payload) => payload.formationUpdated,
    },

    formationDeleted: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([FORMATION_DELETED]),
        (payload, variables) => {
          console.log('🔍 FORMATION_DELETED filter called with:', {
            hasPayload: !!payload,
            payloadGameId: payload.gameId,
            payloadFormationDeleted: payload.formationDeleted,
            variableGameId: variables.gameId,
            variablesKeys: Object.keys(variables || {})
          });
          
          const match = payload.gameId === variables.gameId;
          console.log('🔍 FORMATION_DELETED filter result:', { match });
          return match;
        }
      ),
      resolve: (payload) => payload.formationDeleted,
    },

    formationLiked: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([FORMATION_LIKED]),
        (payload, variables) =>
          payload.formationId === variables.formationId.toString()
      ),
      resolve: (payload) => payload.formationLiked,
    },
    // formation comments related subscriptions
    formationCommentAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(FORMATION_COMMENT_ADDED),
        (payload, vars) => {
          const match = payload.formationId?.toString() === vars.formationId?.toString();
          console.log('➕ Subscription filter - payload formationId:', payload.formationId, 'vars:', vars.formationId, 'match:', match);
          return match;
        }
      ),
      resolve: (payload) => payload.formationCommentAdded,
    },

    formationCommentUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(FORMATION_COMMENT_UPDATED),
        (p, v) => {
          const match = p.formationId?.toString() === v.formationId?.toString();
          console.log('🔄 Subscription filter - payload formationId:', p.formationId, 'vars:', v.formationId, 'match:', match);
          return match;
        }
      ),
      resolve: (payload) => payload.formationCommentUpdated,
    },

    formationCommentDeleted: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([FORMATION_COMMENT_DELETED]),
        (payload, variables) => {
          const match = payload.formationId?.toString() === variables.formationId?.toString();
          console.log('🗑️ Subscription filter - payload formationId:', payload.formationId, 'vars:', variables.formationId, 'match:', match);
          return match;
        }
      ),
      resolve: (payload) => payload.formationCommentDeleted,
    },

    formationCommentLiked: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(FORMATION_COMMENT_LIKED),
        (p, v) => {
          const match = p.formationId?.toString() === v.formationId?.toString();
          console.log('❤️ Subscription filter - payload formationId:', p.formationId, 'vars:', v.formationId, 'match:', match);
          return match;
        }
      ),
      resolve: (payload) => payload.formationCommentLiked,
    },
    // skill reaction subscription
    skillReactionUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(SKILL_REACTION_UPDATED),
        (payload, variables) => payload.skillId === variables.skillId
      ),
      resolve: (payload) => payload.skillReactionUpdated,
    },
    onlineStatusChanged: {
      subscribe: withFilter(
        () => pubsub.asyncIterator("ONLINE_STATUS_CHANGED"),
        (payload, variables) => {
          // Only notify for the relevant profile
          return (
            String(payload.onlineStatusChanged._id) ===
            String(variables.profileId)
          );
        }
      ),
      resolve: (payload) => payload.onlineStatusChanged,
    },
  },
  // ############  Type‐level resolvers for Chat ############## //
  Chat: {
    from: async (chat) => {
      return await Profile.findById(chat.from);
    },
    to: async (chat) => {
      return await Profile.findById(chat.to);
    },
  },
  // ############  Type‐level resolvers for Game ############ //
  Game: {
    availableCount: (parent) => {
      return parent.responses.filter((r) => r.user && r.isAvailable).length;
    },
    unavailableCount: (parent) => {
      return parent.responses.filter((r) => r.user && !r.isAvailable).length;
    },
    creator: (parent) => parent.creator,
    responses: (parent) => {
      // Filter out responses where user is null (orphaned responses)
      return parent.responses.filter((r) => r.user != null);
    },
    averageRating(game) {
      return typeof game.averageRating === "number" ? game.averageRating : 0;
    },
    formation: async (parent) => {
      return await Formation.findOne({ game: parent._id }).populate(
        "positions.player"
      );
    },
  },
  // ############  Type‐level resolvers for Profile ############## //
  Profile: {
    online: (parent) => {
      // parent._id may be an ObjectId, so convert to string for Set comparison
      return onlineUsers.has(String(parent._id));
    },
    // ...other field resolvers if needed...
  },
  // ############  Type‐level resolvers for Skill ############ //
  Skill: {
    reactions: async (parent) => {
      // parent is the Skill document
      // populate user in each reaction
      return parent.reactions.map(async (reaction) => {
        const user = await Profile.findById(reaction.user);
        return { ...reaction.toObject(), user };
      });
    },
  },
  // ############  Type‐level resolvers for SkillReaction ############ //
  SkillReaction: {
    user: async (parent) => {
      // parent.user is the Profile object or ID
      if (typeof parent.user === "object") return parent.user;
      return await Profile.findById(parent.user);
    },
  },
};

// ########## INTEGRATE ORGANIZATION RESOLVERS ########## //
const organizationResolvers = require('./organizationResolvers');

// Merge organization queries
resolvers.Query = {
  ...resolvers.Query,
  ...organizationResolvers.Query,
};

// Merge organization mutations
resolvers.Mutation = {
  ...resolvers.Mutation,
  ...organizationResolvers.Mutation,
};

// Merge Profile field resolvers
if (!resolvers.Profile) {
  resolvers.Profile = {};
}
resolvers.Profile = {
  ...resolvers.Profile,
  ...organizationResolvers.Profile,
};

// ########## INTEGRATE GAME RESOLVERS ########## //
const { gameResolvers } = require('./gameResolvers');

// Merge game mutations
resolvers.Mutation = {
  ...resolvers.Mutation,
  ...gameResolvers.Mutation,
};

console.log('✅ Game resolvers integrated successfully');

module.exports = resolvers;
