require("dotenv").config();
const { PubSub } = require('graphql-subscriptions');
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
} = require("../models");
const { signToken } = require("../utils/auth");
const cloudinary = require("../utils/cloudinary");
const secret = process.env.JWT_SECRET;

const pubsub = new PubSub();

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
        return Profile.findById(context.user._id)
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
          .populate("likedBy");
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },
    // finds a post by its posttId
    post: async (parent, { postId }) => {
      try {
        const post = await Post.findById(postId)
          .populate("comments")
          .populate("likedBy");
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
        const comments = await Comment.find().sort({ createdAt: -1 });

        return comments;
      } catch (err) {
        throw new Error(err);
      }
    },
    // finds a comment by its commentId
    comment: async (parent, { commentId }) => {
      try {
        const comment = await Comment.findById(commentId);
        return comment;
      } catch (err) {
        throw new Error(err);
      }
    },
    // ************************** QUERY SKILLS *******************************************//
    skills: async () => {
      try {
        const skills = await Skill.find().sort({ createdAt: -1 });
        return skills;
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
    getChatByUser : async (parent, { to }, context) => {
      const userId = context.user._id;
      // console.log(userId)
      // Check if user is authenticated
      if (!userId) {
        throw new AuthenticationError(
          "You need to be logged in to view chat conversation"
        );
      }
    
      try {
        // Query for chat using Chat model
        const chat = await Chat.find({
          $or: [
            { from: userId, to },
            { from: to, to: userId }
          ]
        }).populate('from to'); // Assuming 'from' and 'to' are references to User model
    
        return chat;
      } catch (error) {
        console.error('Error fetching chat:', error);
        throw new Error('Failed to fetch chat');
      }
    },

    getAllChats: async () => {
      return await Chat.find().populate("from to");
    },
    getChatsBetweenUsers: async (parent, { userId1, userId2 }) => {
      return await Chat.find({
        $or: [
          { from: userId1, to: userId2 },
          { from: userId2, to: userId1 },
        ],
      }).populate("from to");
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
      if (context.user) {
        if (skillText.trim() === "") {
          throw new Error("skilltext must not be empty");
        }
        const skill = await Skill.create({
          skillText,
          skillAuthor: context.user.name,
          createdAt: new Date().toISOString(),
        });

        await Profile.findOneAndUpdate(
          { _id: profileId },
          { $addToSet: { skills: skill._id } }
        );

        return skill;
      }
      throw new AuthenticationError("You need to be logged in!");
    },
    // ************************** REMOVE SKILL *******************************************//
    removeSkill: async (parent, { skillId }, context) => {
      // console.log('line143',context.user)
      if (!context.user._id) {
        throw new AuthenticationError("You need to be logged in!");
      }
      try {
        return Skill.findOneAndDelete({ _id: skillId });
      } catch (error) {
        console.error("Error deleting skill:", error);
        throw new Error("Error deleting Skill.");
      }
    },
    // ************************** SEND MESSAGE *******************************************//
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
        // console.log('recipient',recipient.name)
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
        await Profile.findByIdAndUpdate(user._id, {
          $push: { sentMessages: savedMessage._id },
        });
        await Profile.findByIdAndUpdate(recipientId, {
          $push: { receivedMessages: savedMessage._id },
        });
        return savedMessage;
      } catch (error) {
        console.error("Error sending message:", error);
        throw new Error("Failed to send message");
      }
    },
    // ************************** REMOVE MESSAGE *******************************************//
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
   
// ************************** CREATE CHAT AND SEND CHAT  *******************************************//
createChat: async (parent, { from, to, content }, context) => {
  if (!context.user) {
    throw new AuthenticationError("You need to be logged in to create a chat!");
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
      content
    });

    const populatedChat = await Chat.findById(newChat._id).populate("from to");

    // Publish the new chat event
    pubsub.publish('CHAT_CREATED', { chatCreated: populatedChat });

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
        return post;
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

        return post;
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
        return Post.findOneAndDelete({ _id: postId });
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

        return post;
      }

      throw new AuthenticationError("Not logged in");
    },
    // ************************** ADD COMMENT *******************************************//
    addComment: async (parent, { postId, commentText }, context) => {
      if (context.user) {
        try {
          const newComment = await Comment.create({
            commentText,
            commentAuthor: context.user.name,
            userId: context.user._id,
          });

          const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { $push: { comments: newComment._id } },
            { new: true }
          ).populate("comments");

          return updatedPost;
        } catch (err) {
          console.error(err);
          throw new Error("Error adding comment");
        }
      }
      throw new AuthenticationError("Not logged in");
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
      if (context.user) {
        try {
          const deletedComment = await Comment.findOneAndDelete({
            _id: commentId,
            userId: context.user._id,
          });

          if (!deletedComment) {
            throw new Error("Comment not found or not authorized");
          }

          const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { $pull: { comments: commentId } },
            { new: true }
          ).populate("comments");

          return updatedPost;
        } catch (err) {
          console.error(err);
          throw new Error("Error removing comment");
        }
      }
      throw new AuthenticationError("You need to be logged in!");
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
  },
  Subscription: {
    chatCreated: {
      subscribe: () => pubsub.asyncIterator(['CHAT_CREATED']) 
    },
  },
  
  Chat: {
    from: async (chat) => {
      return await Profile.findById(chat.from);
    },
    to: async (chat) => {
      return await Profile.findById(chat.to);
    },
  },
};

module.exports = resolvers;
