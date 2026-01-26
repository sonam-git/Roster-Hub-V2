const { AuthenticationError, UserInputError } = require("apollo-server-express");
const { Game, Formation, Profile, Organization } = require("../models");
const pubsub = require("../pubsub"); // Use shared PubSub instance

// Subscription event names
const GAME_CREATED = "GAME_CREATED";
const GAME_CONFIRMED = "GAME_CONFIRMED";
const GAME_COMPLETED = "GAME_COMPLETED";
const GAME_CANCELLED = "GAME_CANCELLED";
const GAME_DELETED = "GAME_DELETED";
const GAME_UPDATED = "GAME_UPDATED";
const FORMATION_CREATED = "FORMATION_CREATED";
const FORMATION_UPDATED = "FORMATION_UPDATED";
const FORMATION_DELETED = "FORMATION_DELETED";
const FORMATION_LIKED = "FORMATION_LIKED";
const FORMATION_COMMENT_ADDED = "FORMATION_COMMENT_ADDED";
const FORMATION_COMMENT_UPDATED = "FORMATION_COMMENT_UPDATED";
const FORMATION_COMMENT_DELETED = "FORMATION_COMMENT_DELETED";
const FORMATION_COMMENT_LIKED = "FORMATION_COMMENT_LIKED";

/**
 * Game Resolvers for Multi-Tenant Architecture
 * 
 * These resolvers handle all game-related operations including:
 * - Creating and managing games
 * - Game responses (availability)
 * - Game status changes (confirm, cancel, complete)
 * - Formation management
 * - Feedback system
 */

const gameResolvers = {
  // ############ MUTATIONS ########## //
  Mutation: {
    /**
     * Create a new game
     */
    createGame: async (_, { input, organizationId }, context) => {
      console.log('🎮 createGame mutation called:', { input, organizationId, hasUser: !!context.user });
      
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      if (!organizationId) {
        throw new UserInputError("Organization ID is required!");
      }

      try {
        // Validate organization membership
        const org = await Organization.findById(organizationId);
        if (!org) {
          throw new UserInputError("Organization not found!");
        }

        if (!org.isUserMember(context.user._id)) {
          throw new AuthenticationError("You are not a member of this organization!");
        }

        // Create the game
        const game = await Game.create({
          ...input,
          creator: context.user._id,
          organizationId: organizationId,
          status: "PENDING",
          result: "NOT_PLAYED",
          score: "0 - 0",
          responses: [],
          feedbacks: [],
          averageRating: 0,
        });

        // Populate creator reference
        await game.populate('creator');

        console.log('✅ Game created successfully:', game._id);

        // Publish subscription event
        pubsub.publish(GAME_CREATED, { gameCreated: game });

        // Update organization usage count
        org.usage.gameCount += 1;
        await org.save();

        return game;
      } catch (error) {
        console.error('❌ Error creating game:', error);
        throw new Error(`Failed to create game: ${error.message}`);
      }
    },

    /**
     * Respond to game availability
     */
    respondToGame: async (_, { input, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      if (!organizationId) {
        throw new UserInputError("Organization ID is required!");
      }

      const { gameId, isAvailable } = input;

      try {
        // Find the game and validate organization
        const game = await Game.findOne({ _id: gameId, organizationId });
        
        if (!game) {
          throw new UserInputError("Game not found!");
        }

        // Check if user already responded
        const existingResponseIndex = game.responses.findIndex(
          (r) => r.user.toString() === context.user._id
        );

        if (existingResponseIndex !== -1) {
          // Update existing response
          game.responses[existingResponseIndex].isAvailable = isAvailable;
        } else {
          // Add new response
          game.responses.push({
            user: context.user._id,
            isAvailable,
          });
        }

        await game.save();
        await game.populate('creator responses.user');

        // Publish update
        pubsub.publish(GAME_UPDATED, { gameUpdated: game });

        return game;
      } catch (error) {
        console.error('Error responding to game:', error);
        throw new Error(`Failed to respond to game: ${error.message}`);
      }
    },

    /**
     * Remove user's vote from game
     */
    unvoteGame: async (_, { gameId, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      if (!organizationId) {
        throw new UserInputError("Organization ID is required!");
      }

      try {
        const game = await Game.findOne({ _id: gameId, organizationId });
        
        if (!game) {
          throw new UserInputError("Game not found!");
        }

        // Remove user's response
        game.responses = game.responses.filter(
          (r) => r.user.toString() !== context.user._id
        );

        await game.save();
        await game.populate('creator responses.user');

        // Publish update
        pubsub.publish(GAME_UPDATED, { gameUpdated: game });

        return game;
      } catch (error) {
        console.error('Error unvoting game:', error);
        throw new Error(`Failed to unvote game: ${error.message}`);
      }
    },

    /**
     * Confirm a game (creator only)
     */
    confirmGame: async (_, { gameId, organizationId, note }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      if (!organizationId) {
        throw new UserInputError("Organization ID is required!");
      }

      try {
        const game = await Game.findOne({ _id: gameId, organizationId });
        
        if (!game) {
          throw new UserInputError("Game not found!");
        }

        // Check if user is the creator
        if (game.creator.toString() !== context.user._id) {
          throw new AuthenticationError("Only the game creator can confirm the game!");
        }

        game.status = "CONFIRMED";
        if (note) {
          game.notes = note;
        }

        await game.save();
        await game.populate('creator responses.user');

        // Publish subscription
        pubsub.publish(GAME_CONFIRMED, { gameConfirmed: game });
        pubsub.publish(GAME_UPDATED, { gameUpdated: game });

        return game;
      } catch (error) {
        console.error('Error confirming game:', error);
        throw new Error(`Failed to confirm game: ${error.message}`);
      }
    },

    /**
     * Cancel a game (creator only)
     */
    cancelGame: async (_, { gameId, organizationId, note }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      if (!organizationId) {
        throw new UserInputError("Organization ID is required!");
      }

      try {
        const game = await Game.findOne({ _id: gameId, organizationId });
        
        if (!game) {
          throw new UserInputError("Game not found!");
        }

        // Check if user is the creator
        if (game.creator.toString() !== context.user._id) {
          throw new AuthenticationError("Only the game creator can cancel the game!");
        }

        game.status = "CANCELLED";
        if (note) {
          game.notes = note;
        }

        await game.save();
        await game.populate('creator responses.user');

        // Publish subscription
        pubsub.publish(GAME_CANCELLED, { gameCancelled: game });
        pubsub.publish(GAME_UPDATED, { gameUpdated: game });

        return game;
      } catch (error) {
        console.error('Error cancelling game:', error);
        throw new Error(`Failed to cancel game: ${error.message}`);
      }
    },

    /**
     * Complete a game (creator only)
     */
    completeGame: async (_, { gameId, organizationId, score, note, result }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      if (!organizationId) {
        throw new UserInputError("Organization ID is required!");
      }

      try {
        const game = await Game.findOne({ _id: gameId, organizationId });
        
        if (!game) {
          throw new UserInputError("Game not found!");
        }

        // Check if user is the creator
        if (game.creator.toString() !== context.user._id) {
          throw new AuthenticationError("Only the game creator can complete the game!");
        }

        game.status = "COMPLETED";
        game.score = score;
        game.result = result;
        if (note) {
          game.notes = note;
        }

        await game.save();
        await game.populate('creator responses.user feedbacks.user feedbacks.playerOfTheMatch');

        // Publish subscription
        pubsub.publish(GAME_COMPLETED, { gameCompleted: game });
        pubsub.publish(GAME_UPDATED, { gameUpdated: game });

        return game;
      } catch (error) {
        console.error('Error completing game:', error);
        throw new Error(`Failed to complete game: ${error.message}`);
      }
    },

    /**
     * Update a game (creator only)
     */
    updateGame: async (_, { gameId, organizationId, input }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      if (!organizationId) {
        throw new UserInputError("Organization ID is required!");
      }

      try {
        const game = await Game.findOne({ _id: gameId, organizationId });
        
        if (!game) {
          throw new UserInputError("Game not found!");
        }

        // Check if user is the creator
        if (game.creator.toString() !== context.user._id) {
          throw new AuthenticationError("Only the game creator can update the game!");
        }

        // Update game fields
        Object.keys(input).forEach((key) => {
          if (input[key] !== undefined && input[key] !== null) {
            game[key] = input[key];
          }
        });

        await game.save();
        await game.populate('creator responses.user');

        // Publish update
        pubsub.publish(GAME_UPDATED, { gameUpdated: game });

        return game;
      } catch (error) {
        console.error('Error updating game:', error);
        throw new Error(`Failed to update game: ${error.message}`);
      }
    },

    /**
     * Delete a game (creator only)
     */
    deleteGame: async (_, { gameId, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      if (!organizationId) {
        throw new UserInputError("Organization ID is required!");
      }

      try {
        const game = await Game.findOne({ _id: gameId, organizationId });
        
        if (!game) {
          throw new UserInputError("Game not found!");
        }

        // Check if user is the creator
        if (game.creator.toString() !== context.user._id) {
          throw new AuthenticationError("Only the game creator can delete the game!");
        }

        // Delete associated formation
        await Formation.deleteMany({ game: gameId });

        // Delete the game
        await Game.findByIdAndDelete(gameId);

        // Publish deletion event
        pubsub.publish(GAME_DELETED, { gameDeleted: gameId });

        // Update organization usage count
        const org = await Organization.findById(organizationId);
        if (org) {
          org.usage.gameCount = Math.max(0, org.usage.gameCount - 1);
          await org.save();
        }

        return game;
      } catch (error) {
        console.error('Error deleting game:', error);
        throw new Error(`Failed to delete game: ${error.message}`);
      }
    },

    /**
     * Add feedback to a completed game
     */
    addFeedback: async (_, { gameId, organizationId, comment, rating, playerOfTheMatchId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      if (!organizationId) {
        throw new UserInputError("Organization ID is required!");
      }

      try {
        const game = await Game.findOne({ _id: gameId, organizationId });
        
        if (!game) {
          throw new UserInputError("Game not found!");
        }

        if (game.status !== "COMPLETED") {
          throw new UserInputError("Can only add feedback to completed games!");
        }

        // Check if user already gave feedback
        const existingFeedbackIndex = game.feedbacks.findIndex(
          (f) => f.user.toString() === context.user._id
        );

        const feedback = {
          user: context.user._id,
          comment: comment || "",
          rating,
          playerOfTheMatch: playerOfTheMatchId || null,
          createdAt: new Date(),
        };

        if (existingFeedbackIndex !== -1) {
          // Update existing feedback
          game.feedbacks[existingFeedbackIndex] = feedback;
        } else {
          // Add new feedback
          game.feedbacks.push(feedback);
        }

        // Calculate average rating
        const totalRating = game.feedbacks.reduce((sum, f) => sum + f.rating, 0);
        game.averageRating = totalRating / game.feedbacks.length;

        await game.save();
        await game.populate('creator responses.user feedbacks.user feedbacks.playerOfTheMatch');

        // Publish update
        pubsub.publish(GAME_UPDATED, { gameUpdated: game });

        return game;
      } catch (error) {
        console.error('Error adding feedback:', error);
        throw new Error(`Failed to add feedback: ${error.message}`);
      }
    },

    /**
     * Create a formation for a game (creator only)
     */
    createFormation: async (_, { gameId, formationType, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      if (!organizationId) {
        throw new UserInputError("Organization ID is required!");
      }

      try {
        const game = await Game.findOne({ _id: gameId, organizationId });
        
        if (!game) {
          throw new UserInputError("Game not found!");
        }

        // Check if user is the creator
        if (game.creator.toString() !== context.user._id) {
          throw new AuthenticationError("Only the game creator can create formations!");
        }

        // Check if formation already exists
        const existingFormation = await Formation.findOne({ game: gameId, organizationId });
        if (existingFormation) {
          throw new UserInputError("Formation already exists for this game!");
        }

        // Determine number of positions based on formation type
        const formationMap = {
          "4-4-2": 11,
          "4-3-3": 11,
          "3-5-2": 11,
          "4-5-1": 11,
          "3-4-3": 11,
          "5-3-2": 11,
          "5-4-1": 11,
        };

        const positionCount = formationMap[formationType] || 11;
        const positions = Array.from({ length: positionCount }, (_, i) => ({
          slot: i + 1,
          player: null,
        }));

        // Create formation
        const formation = await Formation.create({
          game: gameId,
          organizationId: organizationId,
          formationType,
          positions,
          comments: [],
          likes: 0,
          likedBy: [],
        });

        await formation.populate({
          path: 'game',
          populate: [
            { path: 'creator' },
            { path: 'responses.user' },
            { path: 'feedbacks.user' },
            { path: 'feedbacks.playerOfTheMatch' }
          ]
        });
        await formation.populate('positions.player');

        // Publish subscription
        console.log('📡 Publishing FORMATION_CREATED for gameId:', gameId);
        console.log('🔍 Formation.game after populate:', {
          hasGame: !!formation.game,
          gameId: formation.game?._id?.toString(),
          gameCreator: formation.game?.creator?.name,
          gameType: typeof formation.game
        });
        pubsub.publish(FORMATION_CREATED, { formationCreated: formation });

        return formation;
      } catch (error) {
        console.error('Error creating formation:', error);
        throw new Error(`Failed to create formation: ${error.message}`);
      }
    },

    /**
     * Update formation positions (creator only)
     */
    updateFormation: async (_, { gameId, positions, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      if (!organizationId) {
        throw new UserInputError("Organization ID is required!");
      }

      try {
        const game = await Game.findOne({ _id: gameId, organizationId });
        
        if (!game) {
          throw new UserInputError("Game not found!");
        }

        // Check if user is the creator
        if (game.creator.toString() !== context.user._id) {
          throw new AuthenticationError("Only the game creator can update formations!");
        }

        const formation = await Formation.findOne({ game: gameId, organizationId });
        
        if (!formation) {
          throw new UserInputError("Formation not found!");
        }

        // Update positions
        formation.positions = positions.map(pos => ({
          slot: pos.slot,
          player: pos.playerId || null,
        }));

        await formation.save();
        await formation.populate({
          path: 'game',
          populate: [
            { path: 'creator' },
            { path: 'responses.user' },
            { path: 'feedbacks.user' },
            { path: 'feedbacks.playerOfTheMatch' }
          ]
        });
        await formation.populate('positions.player');

        // Publish subscription
        console.log('📡 Publishing FORMATION_UPDATED for gameId:', gameId);
        console.log('🔍 Formation.game after populate:', {
          hasGame: !!formation.game,
          gameId: formation.game?._id?.toString(),
          gameCreator: formation.game?.creator?.name,
          gameType: typeof formation.game
        });
        pubsub.publish(FORMATION_UPDATED, { formationUpdated: formation });

        return formation;
      } catch (error) {
        console.error('Error updating formation:', error);
        throw new Error(`Failed to update formation: ${error.message}`);
      }
    },

    /**
     * Delete a formation (creator only)
     */
    deleteFormation: async (_, { gameId, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      if (!organizationId) {
        throw new UserInputError("Organization ID is required!");
      }

      try {
        const game = await Game.findOne({ _id: gameId, organizationId });
        
        if (!game) {
          throw new UserInputError("Game not found!");
        }

        // Check if user is the creator
        if (game.creator.toString() !== context.user._id) {
          throw new AuthenticationError("Only the game creator can delete formations!");
        }

        const formation = await Formation.findOne({ game: gameId, organizationId });
        
        if (!formation) {
          throw new UserInputError("Formation not found!");
        }

        await Formation.findByIdAndDelete(formation._id);

        // Publish subscription
        console.log('📡 Publishing FORMATION_DELETED for gameId:', gameId);
        console.log('🔍 Deleted formation ID:', formation._id.toString());
        pubsub.publish(FORMATION_DELETED, { 
          formationDeleted: gameId,  // Send gameId so frontend can match
          gameId: gameId 
        });

        return true;
      } catch (error) {
        console.error('Error deleting formation:', error);
        throw new Error(`Failed to delete formation: ${error.message}`);
      }
    },

    /**
     * Add comment to formation
     */
    addFormationComment: async (_, { formationId, commentText, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      if (!organizationId) {
        throw new UserInputError("Organization ID is required!");
      }

      try {
        const formation = await Formation.findOne({ _id: formationId, organizationId });
        
        if (!formation) {
          throw new UserInputError("Formation not found!");
        }

        const comment = {
          commentText,
          commentAuthor: context.user.name,
          user: context.user._id,
          likes: 0,
          likedBy: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        formation.comments.push(comment);
        await formation.save();
        
        // Get the newly created comment with its _id (last comment in array)
        const newComment = formation.comments[formation.comments.length - 1];
        
        await formation.populate({
          path: 'game',
          populate: [
            { path: 'creator' },
            { path: 'responses.user' },
            { path: 'feedbacks.user' },
            { path: 'feedbacks.playerOfTheMatch' }
          ]
        });
        await formation.populate('positions.player comments.user comments.likedBy');

        // Publish subscription with the comment that has _id
        console.log('➕ Publishing ADD subscription for formationId:', formationId, 'commentId:', newComment._id);
        pubsub.publish(FORMATION_COMMENT_ADDED, { 
          formationCommentAdded: newComment.toObject(), // Convert to plain object
          formationId: formationId 
        });

        return formation;
      } catch (error) {
        console.error('Error adding formation comment:', error);
        throw new Error(`Failed to add formation comment: ${error.message}`);
      }
    },

    /**
     * Update formation comment
     */
    updateFormationComment: async (_, { commentId, commentText, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      if (!organizationId) {
        throw new UserInputError("Organization ID is required!");
      }

      try {
        const formation = await Formation.findOne({ 
          organizationId,
          'comments._id': commentId 
        });
        
        if (!formation) {
          throw new UserInputError("Formation or comment not found!");
        }

        const comment = formation.comments.id(commentId);
        
        if (!comment) {
          throw new UserInputError("Comment not found!");
        }

        // Check if user is the comment author
        if (comment.user.toString() !== context.user._id) {
          throw new AuthenticationError("You can only edit your own comments!");
        }

        comment.commentText = commentText;
        comment.updatedAt = new Date();

        await formation.save();
        await formation.populate('comments.user comments.likedBy');

        // Publish subscription
        console.log('🔄 Publishing UPDATE subscription for formationId:', formation._id);
        pubsub.publish(FORMATION_COMMENT_UPDATED, { 
          formationCommentUpdated: comment,
          formationId: formation._id 
        });

        return comment;
      } catch (error) {
        console.error('Error updating formation comment:', error);
        throw new Error(`Failed to update formation comment: ${error.message}`);
      }
    },

    /**
     * Delete formation comment
     */
    deleteFormationComment: async (_, { formationId, commentId, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      if (!organizationId) {
        throw new UserInputError("Organization ID is required!");
      }

      try {
        const formation = await Formation.findOne({ _id: formationId, organizationId });
        
        if (!formation) {
          throw new UserInputError("Formation not found!");
        }

        const comment = formation.comments.id(commentId);
        
        if (!comment) {
          throw new UserInputError("Comment not found!");
        }

        // Check if user is the comment author
        if (comment.user.toString() !== context.user._id) {
          throw new AuthenticationError("You can only delete your own comments!");
        }

        // ✅ FIXED: Use pull() method to remove comment from array
        // Old deprecated method: comment.remove()
        // New correct method: formation.comments.pull(commentId)
        console.log('🗑️ Removing comment:', commentId, 'from formation:', formationId);
        formation.comments.pull(commentId);
        await formation.save();
        console.log('✅ Comment removed and formation saved');

        // Publish subscription
        console.log('🗑️ Publishing DELETE subscription for formationId:', formationId);
        pubsub.publish(FORMATION_COMMENT_DELETED, { 
          formationCommentDeleted: commentId,
          formationId: formationId 
        });

        return commentId;
      } catch (error) {
        console.error('❌ Error deleting formation comment:', error);
        console.error('❌ Error stack:', error.stack);
        throw new Error(`Failed to delete formation comment: ${error.message}`);
      }
    },

    /**
     * Like/Unlike formation comment
     */
    likeFormationComment: async (_, { commentId, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      if (!organizationId) {
        throw new UserInputError("Organization ID is required!");
      }

      try {
        const formation = await Formation.findOne({ 
          organizationId,
          'comments._id': commentId 
        });
        
        if (!formation) {
          throw new UserInputError("Formation or comment not found!");
        }

        const comment = formation.comments.id(commentId);
        
        if (!comment) {
          throw new UserInputError("Comment not found!");
        }

        const alreadyLiked = comment.likedBy.some(
          userId => userId.toString() === context.user._id
        );

        if (alreadyLiked) {
          comment.likedBy = comment.likedBy.filter(
            userId => userId.toString() !== context.user._id
          );
          comment.likes = Math.max(0, comment.likes - 1);
        } else {
          comment.likedBy.push(context.user._id);
          comment.likes += 1;
        }

        await formation.save();
        await formation.populate('comments.user comments.likedBy');

        // Publish subscription
        console.log('❤️ Publishing LIKE subscription for formationId:', formation._id, 'likes:', comment.likes);
        pubsub.publish(FORMATION_COMMENT_LIKED, { 
          formationCommentLiked: comment,
          formationId: formation._id 
        });

        return comment;
      } catch (error) {
        console.error('Error liking formation comment:', error);
        throw new Error(`Failed to like formation comment: ${error.message}`);
      }
    },

    /**
     * Like/Unlike formation
     */
    likeFormation: async (_, { formationId, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      if (!organizationId) {
        throw new UserInputError("Organization ID is required!");
      }

      try {
        const formation = await Formation.findOne({ _id: formationId, organizationId });
        
        if (!formation) {
          throw new UserInputError("Formation not found!");
        }

        const alreadyLiked = formation.likedBy.some(
          userId => userId.toString() === context.user._id
        );

        if (alreadyLiked) {
          formation.likedBy = formation.likedBy.filter(
            userId => userId.toString() !== context.user._id
          );
          formation.likes = Math.max(0, formation.likes - 1);
        } else {
          formation.likedBy.push(context.user._id);
          formation.likes += 1;
        }

        await formation.save();
        await formation.populate({
          path: 'game',
          populate: [
            { path: 'creator' },
            { path: 'responses.user' },
            { path: 'feedbacks.user' },
            { path: 'feedbacks.playerOfTheMatch' }
          ]
        });
        await formation.populate('positions.player likedBy');

        // Publish subscription
        pubsub.publish(FORMATION_LIKED, { 
          formationLiked: formation,
          formationId: formationId 
        });

        return formation;
      } catch (error) {
        console.error('Error liking formation:', error);
        throw new Error(`Failed to like formation: ${error.message}`);
      }
    },
  },

  // ############ TYPE RESOLVERS ########## //
  /**
   * Type resolvers ensure nested Profile references are properly populated
   * This fixes the flickering name issue where names would sometimes show null
   */
  Game: {
    creator: async (parent) => {
      if (!parent.creator) return null;
      if (typeof parent.creator === 'object' && parent.creator.name) {
        return parent.creator; // Already populated
      }
      return await Profile.findById(parent.creator);
    },
    responses: async (parent) => {
      if (!parent.responses) return [];
      // Filter out responses where user is null (orphaned responses)
      return parent.responses.filter((r) => r.user != null);
    },
    feedbacks: async (parent) => {
      if (!parent.feedbacks) return [];
      return parent.feedbacks;
    },
    availableCount: (parent) => {
      if (!parent.responses) return 0;
      return parent.responses.filter((r) => r.user && r.isAvailable).length;
    },
    unavailableCount: (parent) => {
      if (!parent.responses) return 0;
      return parent.responses.filter((r) => r.user && !r.isAvailable).length;
    },
    averageRating: (parent) => {
      return typeof parent.averageRating === "number" ? parent.averageRating : 0;
    },
    formation: async (parent) => {
      if (!parent.formation) return null;
      if (typeof parent.formation === 'object' && parent.formation._id) {
        return parent.formation; // Already populated
      }
      const formation = await Formation.findOne({ game: parent._id, organizationId: parent.organizationId });
      if (formation) {
        await formation.populate('positions.player likedBy comments.user comments.likedBy');
      }
      return formation;
    },
  },

  Response: {
    user: async (parent) => {
      if (!parent.user) return null;
      if (typeof parent.user === 'object' && parent.user.name) {
        return parent.user; // Already populated
      }
      return await Profile.findById(parent.user);
    },
  },

  Feedback: {
    user: async (parent) => {
      if (!parent.user) return null;
      if (typeof parent.user === 'object' && parent.user.name) {
        return parent.user; // Already populated
      }
      return await Profile.findById(parent.user);
    },
    playerOfTheMatch: async (parent) => {
      if (!parent.playerOfTheMatch) return null;
      if (typeof parent.playerOfTheMatch === 'object' && parent.playerOfTheMatch.name) {
        return parent.playerOfTheMatch; // Already populated
      }
      return await Profile.findById(parent.playerOfTheMatch);
    },
  },

  Formation: {
    game: async (parent) => {
      if (!parent.game) return null;
      if (typeof parent.game === 'object' && parent.game._id) {
        const game = parent.game;
        // Ensure game has creator populated
        if (game.creator && typeof game.creator !== 'object') {
          await game.populate('creator');
        }
        return game;
      }
      const game = await Game.findById(parent.game);
      if (game) {
        await game.populate('creator responses.user feedbacks.user feedbacks.playerOfTheMatch');
      }
      return game;
    },
    positions: async (parent) => {
      if (!parent.positions) return [];
      return parent.positions;
    },
    comments: async (parent) => {
      if (!parent.comments) return [];
      return parent.comments;
    },
    likedBy: async (parent) => {
      if (!parent.likedBy) return [];
      // If likedBy contains IDs that aren't populated, populate them
      const populated = [];
      for (const user of parent.likedBy) {
        if (typeof user === 'object' && user.name) {
          populated.push(user);
        } else {
          const profile = await Profile.findById(user);
          if (profile) populated.push(profile);
        }
      }
      return populated;
    },
  },

  Position: {
    player: async (parent) => {
      if (!parent.player) return null;
      if (typeof parent.player === 'object' && parent.player.name) {
        return parent.player; // Already populated
      }
      return await Profile.findById(parent.player);
    },
  },

  FormationComment: {
    user: async (parent) => {
      if (!parent.user) return null;
      if (typeof parent.user === 'object' && parent.user.name) {
        return parent.user; // Already populated
      }
      return await Profile.findById(parent.user);
    },
    likedBy: async (parent) => {
      if (!parent.likedBy) return [];
      // If likedBy contains IDs that aren't populated, populate them
      const populated = [];
      for (const user of parent.likedBy) {
        if (typeof user === 'object' && user.name) {
          populated.push(user);
        } else {
          const profile = await Profile.findById(user);
          if (profile) populated.push(profile);
        }
      }
      return populated;
    },
  },
};

module.exports = { gameResolvers, pubsub };
