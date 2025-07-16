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

const pubsub = new PubSub(); // Ensure this instance is used in the resolvers
const FOOTBALL_API = "https://api.football-data.org/v4";

// In-memory set to track online users
const onlineUsers = require("../utils/onlineUsers");

// If using Apollo Server subscriptions, add hooks for connect/disconnect
// This example assumes you use Apollo Server's onConnect/onDisconnect in your server setup (not shown here)
// You would add/remove user IDs to/from onlineUsers there.

const resolvers = {
  // ############ QUERIES ########## //
  Query: {
    // ************************** QUERY ALL PROFILES *******************************************//
    profiles: async () => {
      return Profile.find()
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
      // .populate("posts");
    },
    // ************************** QUERY SINGLE PROFILE *******************************************//
    profile: async (parent, { profileId }) => {
      return Profile.findOne({ _id: profileId })
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
    posts: async () => {
      try {
        const posts = await Post.find()
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
    skills: async () => {
      try {
        return await Skill.find()
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
    games: async (_, { status }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in to view games");
      }
      const filter = {};
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
    game: async (_, { gameId }, context) => {
      if (!context.user) {
        throw new AuthenticationError(
          "You need to be logged in to view a game"
        );
      }
      return Game.findById(gameId)
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
    formation: async (_, { gameId }, context) => {
      if (!context.user) throw new AuthenticationError("Not logged in");
      return Formation.findOne({ game: gameId })
        .populate("game")
        .populate("positions.player")
        .populate("likedBy")
        .populate("comments.user");
    },
  },

  // ########## MUTAIIONS ########### //
  Mutation: {
    // **************************  SIGN UP / ADD USER *******************************************//
    addProfile: async (parent, { name, email, password }) => {
      const profile = await Profile.create({ name, email, password });
      const token = signToken(profile);

      return { token, profile };
    },
    // ************************** LOGIN  *******************************************//
    login: async (parent, { email, password }) => {
      const profile = await Profile.findOne({ email });

      if (!profile) {
        throw new AuthenticationError("No profile with this email found!");
      }

      const correctPw = await profile.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect password!");
      }

      const token = signToken(profile);
      return { token, profile };
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
      let profile = await Profile.findOne({ email });
      if (!profile) {
        profile = await Profile.create({
          name,
          email,
          password: googleId,
          profilePic,
        });
      }

      // Sign JWT
      const token = signToken(profile);
      return { token, profile };
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
    // ************************** ADD RATING *******************************************//
    ratePlayer: async (parent, { profileId, ratingInput }, context) => {
      if (context.user) {
        const profile = await Profile.findById(profileId);

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
      }
      throw new AuthenticationError("You need to be logged in!");
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
    addSkill: async (parent, { profileId, skillText }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }
      if (skillText.trim() === "") {
        throw new Error("skillText must not be empty");
      }

      // create the raw skill
      const skill = await Skill.create({
        skillText,
        skillAuthor: context.user.name,
        recipient: profileId,
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
    removeSkill: async (parent, { skillId }, context) => {
      if (!context.user._id) {
        throw new AuthenticationError("You need to be logged in!");
      }
      try {
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
    // ************************** SEND MESSAGE (its different functionality, not related to the chat functionality)*******************************************//
    sendMessage: async (_, { recipientId, text }, { user }) => {
      // Check if the user is authenticated
      if (!user) {
        throw new AuthenticationError(
          "You need to be logged in to send messages"
        );
      }

      try {
        // Find the recipient user
        const recipient = await Profile.findById(recipientId);
        if (!recipient) {
          throw new Error("Recipient user not found");
        }

        // Create a new message with the sender set to the authenticated user's ID
        const message = new Message({
          sender: user._id, // Set the sender to the authenticated user's ID
          recipient: recipientId, // Set the recipient to the provided user ID
          text,
          createdAt: new Date().toISOString(), // Format the current date and time
        });

        // Save the message to the database
        const savedMessage = await message.save();
        // Update sender's sentMessages and recipient's receivedMessages
        await Profile.findByIdAndUpdate(
          user._id,
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
    removeMessage: async (parent, { messageId }, context) => {
      if (!context.user._id) {
        throw new AuthenticationError("You need to be logged in!");
      }

      try {
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
    deleteConversation: async (_, { userId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You must be logged in");
      }
      const me = context.user._id;
      try {
        // Add the current user's ID to the deletedBy array for all relevant chats
        await Chat.updateMany(
          {
            $or: [
              { from: me, to: userId },
              { from: userId, to: me },
            ],
            deletedBy: { $ne: me },
          },
          { $push: { deletedBy: me } }
        );
        // remove every message where sender↔recipient is this pair
        await Message.deleteMany({
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
    createChat: async (parent, { from, to, content }, context) => {
      if (!context.user) {
        throw new AuthenticationError(
          "You need to be logged in to create a chat!"
        );
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
    saveSocialMediaLink: async (_, { userId, type, link }) => {
      try {
        // Save or update the social media link in the SocialMediaLink model
        let socialMediaLink = await SocialMediaLink.findOneAndUpdate(
          { userId, type },
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
    removeSocialMediaLink: async (_, { userId, type }, context) => {
      // Optional: check if context.user._id === userId for security
      // Find the SocialMediaLink document
      const linkDoc = await SocialMediaLink.findOne({ userId, type });
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
    addPost: async (parent, { profileId, postText }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
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
    updatePost: async (_, { postId, postText }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      try {
        // Find the post by postId
        const post = await Post.findById(postId);

        if (!post) {
          throw new Error("Post not found.");
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
    removePost: async (parent, { postId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }
      try {
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
    likePost: async (parent, { postId }, context) => {
      if (context.user) {
        const post = await Post.findById(postId);
        const userId = context.user._id;

        if (!post) {
          throw new Error("Post not found");
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
      }

      throw new AuthenticationError("Not logged in");
    },
    // ************************** ADD COMMENT *******************************************//
    addComment: async (parent, { postId, commentText }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }
      try {
        // 1️⃣ create the comment
        const newComment = await Comment.create({
          commentText,
          commentAuthor: context.user.name,
          userId: context.user._id,
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
    updateComment: async (parent, { commentId, commentText }, context) => {
      if (context.user) {
        try {
          const updatedComment = await Comment.findOneAndUpdate(
            { _id: commentId, userId: context.user._id },
            { commentText },
            { new: true }
          );

          if (!updatedComment) {
            throw new Error("Comment not found or not authorized");
          }

          pubsub.publish(COMMENT_UPDATED, { commentUpdated: updatedComment });

          return updatedComment;
        } catch (err) {
          console.error(err);
          throw new Error("Error updating comment");
        }
      }
      throw new AuthenticationError("You need to be logged in!");
    },
    // ************************** REMOVE COMMENT *******************************************//
    removeComment: async (parent, { postId, commentId }, context) => {
      if (!context.user)
        throw new AuthenticationError("You need to be logged in!");
      if (context.user) {
        try {
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
      }
      throw new AuthenticationError("You need to be logged in!");
    },
    // ************************** LIKE COMMENT *******************************************//
    likeComment: async (parent, { commentId }, context) => {
      // Check if the user is authenticated
      if (context.user) {
        const comment = await Comment.findById(commentId);
        const userId = context.user._id;

        if (!comment) {
          throw new Error("Comment not found");
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
      }

      throw new AuthenticationError("Not logged in");
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
        // Delete all skills associated with the deleted profile
        await Skill.deleteMany({ _id: { $in: profile.skills } });

        // Delete all social media links associated with the deleted profile
        await SocialMediaLink.deleteMany({ userId: profileId });
        // Delete messages where the deleted profile is either sender or recipient
        await Message.deleteMany({
          $or: [{ sender: profileId }, { recipient: profileId }],
        });
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
                   http://localhost:3000/reset-password/${resetToken}\n\n
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
    // ************************** CREATE GAME *******************************************//
    createGame: async (_, { input }, context) => {
      if (!context.user) {
        throw new AuthenticationError(
          "You need to be logged in to create a game"
        );
      }
      const { date, time, venue, notes, opponent } = input;
      if (!date || !time || !venue || !opponent) {
        throw new UserInputError("Date, time, opponent and venue are required");
      }
      const newGame = await Game.create({
        creator: context.user._id,
        date,
        time,
        venue,
        notes: notes || "",
        opponent,
        status: "PENDING",
        responses: [],
      });
      const populated = await newGame.populate("creator");

      // publish creation
      pubsub.publish(GAME_CREATED, { gameCreated: populated });

      return populated;
    },
    // ************************** RESPOND YES / NO TO GAME *******************************************//
    respondToGame: async (_, { input }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in to vote");
      }
      const { gameId, isAvailable } = input;
      const game = await Game.findById(gameId);
      if (!game) {
        throw new UserInputError("Game not found");
      }
      if (game.status !== "PENDING") {
        throw new UserInputError("Cannot vote on a game that is not pending");
      }
      const existingIndex = game.responses.findIndex((r) =>
        r.user.equals(context.user._id)
      );
      if (existingIndex !== -1) {
        // update existing vote
        game.responses[existingIndex].isAvailable = isAvailable;
      } else {
        game.responses.push({
          user: context.user._id,
          isAvailable,
        });
      }
      await game.save();
      return Game.findById(gameId)
        .populate("creator")
        .populate("responses.user");
    },
    // ************************** UNVOTE GAME POLL *******************************************//
    unvoteGame: async (_, { gameId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in to unvote");
      }
      const game = await Game.findById(gameId);
      if (!game) {
        throw new UserInputError("Game not found");
      }
      const beforeCount = game.responses.length;
      game.responses = game.responses.filter(
        (r) => !r.user.equals(context.user._id)
      );
      if (game.responses.length === beforeCount) {
        throw new UserInputError("You have not voted on this game");
      }
      await game.save();
      return Game.findById(gameId)
        .populate("creator")
        .populate("responses.user");
    },
    // ************************** CONFIRM A GAME | ONLY BY CREATOR *******************************************//
    confirmGame: async (_, { gameId, note }, context) => {
      if (!context.user) {
        throw new AuthenticationError(
          "You need to be logged in to confirm a game"
        );
      }
      const game = await Game.findById(gameId);
      if (!game) throw new UserInputError("Game not found");
      if (!game.creator.equals(context.user._id)) {
        throw new AuthenticationError("Not authorized");
      }
      if (game.status === "CONFIRMED") {
        throw new UserInputError("Game is already confirmed");
      }

      game.status = "CONFIRMED";
      if (note !== undefined) game.notes = note;
      await game.save();
      const updated = await Game.findById(gameId)
        .populate("creator")
        .populate("responses.user");

      pubsub.publish(GAME_CONFIRMED, { gameConfirmed: updated });
      return updated;
    },
    // ************************** COMPLETE A GAME | ONLY BY CREATOR *******************************************//
    completeGame: async (_, { gameId, score, result, note }, context) => {
      if (!context.user) throw new AuthenticationError("You must be logged in");
      const game = await Game.findById(gameId);
      if (!game) throw new Error("Game not found");
      if (!game.creator.equals(context.user._id)) {
        throw new AuthenticationError("Not authorized");
      }

      game.status = "COMPLETED";
      if (typeof note === "string") game.notes = note;
      game.score = score;
      game.result = result;
      await game.save();
      const updated = await Game.findById(gameId)
        .populate("creator")
        .populate("responses.user");

      pubsub.publish(GAME_COMPLETED, { gameCompleted: updated });
      return updated;
    },
    // ************************** CANCEL  A GAME | ONLY BY CREATOR *******************************************//
    cancelGame: async (_, { gameId, note }, context) => {
      if (!context.user) {
        throw new AuthenticationError(
          "You need to be logged in to cancel a game"
        );
      }
      const game = await Game.findById(gameId);
      if (!game) throw new UserInputError("Game not found");
      if (!game.creator.equals(context.user._id)) {
        throw new AuthenticationError("Not authorized");
      }
      if (game.status === "CANCELLED") {
        throw new UserInputError("Game is already cancelled");
      }

      game.status = "CANCELLED";
      if (note !== undefined) game.notes = note;
      await game.save();
      const updated = await Game.findById(gameId)
        .populate("creator")
        .populate("responses.user");

      pubsub.publish(GAME_CANCELLED, { gameCancelled: updated });
      return updated;
    },
    // ************************** UPDATE A GAME | ONLY BY CREATOR *******************************************//
    updateGame: async (_, { gameId, input }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You must be logged in");
      }
      // load the game
      const game = await Game.findById(gameId);
      if (!game) {
        throw new UserInputError("Game not found");
      }
      // only creator can edit
      if (game.creator.toString() !== context.user._id) {
        throw new AuthenticationError("Not authorized");
      }

      // update only the provided fields
      if (input.date !== undefined) game.date = input.date;
      if (input.time !== undefined) game.time = input.time;
      if (input.venue !== undefined) game.venue = input.venue;
      if (input.notes !== undefined) game.notes = input.notes;
      if (input.opponent !== undefined) game.opponent = input.opponent;

      await game.save();

      // return with populated creator and responses
      await Game.findById(gameId)
        .populate("creator", "name")
        .populate("responses.user", "name");
      pubsub.publish(GAME_UPDATED, { gameUpdated: game });
      return game;
    },
    // ************************** DELETE A GAME | ONLY BY CREATOR *******************************************//
    deleteGame: async (_, { gameId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You must be logged in to delete games");
      }
      const game = await Game.findById(gameId);
      if (!game) throw new Error("Game not found");
      if (!game.creator.equals(context.user._id)) {
        throw new AuthenticationError("Not authorized");
      }

      await Game.findByIdAndDelete(gameId);
      // publish only the ID
      pubsub.publish(GAME_DELETED, { gameDeleted: gameId });
      return game;
    },
    // ************************** ADD A FEEDBACK TO COMPLETED GAME *******************************************//
    addFeedback: async (_, { gameId, comment, rating }, context) => {
      if (!context.user) {
        throw new AuthenticationError("Must be logged in");
      }

      const game = await Game.findById(gameId).populate("feedbacks.user");
      if (!game) {
        throw new Error("Game not found");
      }
      if (game.status !== "COMPLETED") {
        throw new Error("Can only leave feedback on completed games");
      }

      // **NEW CHECK**: has this user already left feedback?
      if (
        game.feedbacks.some((f) => f.user._id.toString() === context.user._id)
      ) {
        throw new Error("You have already left feedback for this game");
      }

      // push new feedback
      game.feedbacks.push({
        user: context.user._id,
        comment,
        rating,
      });

      // recalc average
      const sum = game.feedbacks.reduce((sum, f) => sum + f.rating, 0);
      game.averageRating = sum / game.feedbacks.length;

      await game.save();
      return game;
    },
    // ************************** CREATE A FORMATION | ONLY BY CREATOR *******************************************//
    createFormation: async (_, { gameId, formationType }, context) => {
      if (!context.user) throw new AuthenticationError("Not logged in");

      const game = await Game.findById(gameId);
      if (!game) throw new UserInputError("Game not found");

      if (game.creator.toString() !== context.user._id)
        throw new AuthenticationError("Only creator can make formation");

      const existing = await Formation.findOne({ game: gameId });
      if (existing) throw new UserInputError("Formation already exists");

      const formation = await Formation.create({
        game: gameId,
        formationType,
        positions: [],
      });

      const full = await Formation.findById(formation._id)
        .populate("game")
        .populate("positions.player");

      pubsub.publish("FORMATION_CREATED", {
        formationCreated: full,
        gameId: gameId.toString(),
      });

      return full;
    },
    // ************************** UPDATE FORMATION | ONLY BY CREATOR *******************************************//
    updateFormation: async (_, { gameId, positions }, context) => {
      if (!context.user) throw new AuthenticationError("Not logged in");

      const formation = await Formation.findOne({ game: gameId });
      if (!formation) throw new UserInputError("No formation to update");

      const game = await Game.findById(gameId);
      if (!game) throw new UserInputError("Game not found");

      if (game.creator.toString() !== context.user._id)
        throw new AuthenticationError("Only creator can update");

      formation.positions = positions.map((p) => ({
        slot: p.slot,
        player: p.playerId || null,
      }));
      await formation.save();

      const full = await Formation.findById(formation._id)
        .populate("game")
        .populate("positions.player");

      pubsub.publish("FORMATION_UPDATED", {
        formationUpdated: full,
        gameId: gameId.toString(),
      });

      return full;
    },
    // ************************** DELETE A FORMATION | ONLY BY CREATOR *******************************************//
    deleteFormation: async (_, { gameId }, context) => {
      if (!context.user) throw new AuthenticationError("Not logged in");

      const formation = await Formation.findOne({ game: gameId });
      if (!formation) return false;

      const game = await Game.findById(gameId);
      if (!game) throw new UserInputError("Game not found");

      if (game.creator.toString() !== context.user._id)
        throw new AuthenticationError("Only creator can delete");

      await Formation.deleteOne({ game: gameId });

      pubsub.publish("FORMATION_DELETED", {
        formationDeleted: gameId,
        gameId,
      });

      return true;
    },
    // ************************** LIKE / UNLIKE FORMATION *******************************************//
    likeFormation: async (_, { formationId }, { user }) => {
      if (!user) throw new AuthenticationError("Login required");

      const formation = await Formation.findById(formationId);
      if (!formation) throw new Error("Formation not found");

      const alreadyLiked = formation.likedBy.includes(user._id);

      if (alreadyLiked) {
        // UNLIKE
        formation.likes = Math.max(0, formation.likes - 1);
        formation.likedBy.pull(user._id);
      } else {
        // LIKE
        formation.likes += 1;
        formation.likedBy.push(user._id);
      }

      await formation.save();

      const full = await Formation.findById(formationId)
        .populate("game")
        .populate("positions.player")
        .populate("likedBy")
        .populate("comments.user");

      pubsub.publish(FORMATION_LIKED, {
        formationLiked: full,
        formationId: formationId.toString(),
      });

      return full;
    },
    // ************************** ADD FORMATION COMMENT *******************************************//
    addFormationComment: async (_, { formationId, commentText }, { user }) => {
      if (!user) throw new AuthenticationError("Login required");
      if (!commentText.trim())
        throw new UserInputError("Comment cannot be empty");

      // build the new subdoc
      const newComment = {
        commentText,
        commentAuthor: user.name,
        user: user._id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
        likedBy: [],
      };

      // push it onto the formation.comments array
      const updatedFormation = await Formation.findByIdAndUpdate(
        formationId,
        { $push: { comments: newComment } },
        { new: true }
      ).populate("comments.user");

      if (!updatedFormation) throw new Error("Formation not found");

      // pull out the comment we just added
      const added =
        updatedFormation.comments[updatedFormation.comments.length - 1];

      // publish just that subdoc
      pubsub.publish(FORMATION_COMMENT_ADDED, {
        formationCommentAdded: added,
        formationId,
      });

      // return the full formation (with comments populated)
      return updatedFormation;
    },
    // ************************** UPDATE FORMATION COMMENT *******************************************//
    updateFormationComment: async (_, { commentId, commentText }, { user }) => {
      if (!user) throw new AuthenticationError("Login required");
      if (!commentText.trim())
        throw new UserInputError("Comment cannot be empty");

      // atomically update the matching comment subdoc
      const updatedFormation = await Formation.findOneAndUpdate(
        { "comments._id": commentId, "comments.user": user._id },
        {
          $set: {
            "comments.$.commentText": commentText,
            "comments.$.updatedAt": new Date().toISOString(),
          },
        },
        { new: true }
      ).populate("comments.user");

      if (!updatedFormation)
        throw new Error("Comment not found or not authorized");

      // pull out the updated subdoc
      const updated = updatedFormation.comments.id(commentId);

      // publish just that subdoc
      pubsub.publish(FORMATION_COMMENT_UPDATED, {
        formationCommentUpdated: updated,
        formationId: updatedFormation._id.toString(),
      });

      return updated;
    },
    // ************************** DELETE FORMATION COMMENT *******************************************//
    deleteFormationComment: async (_, { formationId, commentId }, { user }) => {
      if (!user) throw new AuthenticationError("Login required");

      // pull it out of the array
      const updatedFormation = await Formation.findByIdAndUpdate(
        formationId,
        { $pull: { comments: { _id: commentId, user: user._id } } },
        { new: true }
      );

      if (!updatedFormation) throw new Error("Formation not found");

      // publish the ID
      pubsub.publish(FORMATION_COMMENT_DELETED, {
        formationCommentDeleted: commentId,
        formationId: formationId.toString(),
      });

      return commentId;
    },
    // ************************** LIKE / UNLIKE FORMATION COMMENT *******************************************//
    likeFormationComment: async (_, { commentId }, { user }) => {
      if (!user) throw new AuthenticationError("Login required");

      // first, find which formation holds that comment
      const formation = await Formation.findOne({ "comments._id": commentId });
      if (!formation) throw new Error("Comment not found");

      // find the comment subdoc
      const comment = formation.comments.id(commentId);
      const userId = user._id.toString();

      // decide if we should like or unlike
      const already = comment.likedBy
        .map((id) => id.toString())
        .includes(userId);
      const operator = already ? "$pull" : "$push";
      const inc = already ? -1 : +1;

      // atomically update that one comment’s likes and likedBy
      await Formation.findOneAndUpdate(
        { "comments._id": commentId },
        {
          $inc: { "comments.$.likes": inc },
          [operator]: { "comments.$.likedBy": user._id },
        },
        { new: true }
      );

      // re-fetch and populate
      const updatedFormation = await Formation.findOne({
        "comments._id": commentId,
      }).populate("comments.user");
      const updatedComment = updatedFormation.comments.id(commentId);

      // publish the new subdoc
      pubsub.publish(FORMATION_COMMENT_LIKED, {
        formationCommentLiked: updatedComment,
        formationId: updatedFormation._id.toString(),
      });

      return updatedComment;
    },
    // ************************** MARK CHAT AS SEEN *******************************************//
    markChatAsSeen: async (_, { userId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You must be logged in");
      }
      const me = context.user._id;
      // Mark all messages sent FROM userId TO me as seen (i.e., userId is the sender, me is the recipient)
      const result = await Chat.updateMany(
        { from: userId, to: me, seen: false },
        { $set: { seen: true } }
      );
      // Publish chatSeen event for all updated chats
      const updatedChats = await Chat.find({
        from: userId,
        to: me,
        seen: true,
      });
      updatedChats.forEach((chat) => {
        pubsub.publish("CHAT_SEEN", {
          chatSeen: chat,
          to: chat.from, // notify the sender
        });
      });
      return true;
    },
    // ************************** REACT TO SKILL *******************************************//
    reactToSkill: async (_, { skillId, emoji }, context) => {
      if (!context.user)
        throw new AuthenticationError("You need to be logged in!");
      const skill = await Skill.findById(skillId);
      if (!skill) throw new UserInputError("Skill not found");
      // Check if user already reacted
      const idx = skill.reactions.findIndex(
        (r) => r.user.toString() === context.user._id.toString()
      );
      if (idx > -1) {
        // Update existing reaction
        skill.reactions[idx].emoji = emoji;
      } else {
        // Add new reaction
        skill.reactions.push({ user: context.user._id, emoji });
      }
      await skill.save();
      const populatedSkill = await Skill.findById(skillId)
        .populate("recipient")
        .populate("reactions.user");
      pubsub.publish(SKILL_REACTION_UPDATED, {
        skillReactionUpdated: populatedSkill,
        skillId,
      });
      return populatedSkill;
    },
  },
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
        (payload, variables) =>
          payload?.formationCreated?.game?._id.toString() ===
          variables?.gameId?.toString()
      ),
      resolve: (payload) => payload.formationCreated,
    },

    formationUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([FORMATION_UPDATED]),
        (payload, variables) =>
          payload?.formationUpdated?.game?._id.toString() ===
          variables?.gameId?.toString()
      ),
      resolve: (payload) => payload.formationUpdated,
    },

    formationDeleted: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([FORMATION_DELETED]),
        (payload, variables) => payload.gameId === variables.gameId
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
        (payload, vars) => payload.formationId === vars.formationId
      ),
    },

    formationCommentUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(FORMATION_COMMENT_UPDATED),
        (p, v) => p.formationId === v.formationId
      ),
      resolve: (payload) => payload.formationCommentUpdated,
    },

    formationCommentDeleted: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([FORMATION_COMMENT_DELETED]),
        (payload, variables) => payload.formationId === variables.formationId
      ),
      resolve: (payload) => payload.formationCommentDeleted,
    },

    formationCommentLiked: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(FORMATION_COMMENT_LIKED),

        (p, v) => p.formationId === v.formationId
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
      return parent.responses.filter((r) => r.isAvailable).length;
    },
    unavailableCount: (parent) => {
      return parent.responses.filter((r) => !r.isAvailable).length;
    },
    creator: (parent) => parent.creator,
    responses: (parent) => parent.responses,
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
  SkillReaction: {
    user: async (parent) => {
      // parent.user is the Profile object or ID
      if (typeof parent.user === "object") return parent.user;
      return await Profile.findById(parent.user);
    },
  },
};

module.exports = resolvers;
