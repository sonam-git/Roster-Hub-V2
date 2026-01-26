const { AuthenticationError, UserInputError } = require("apollo-server-express");
const { Asset, Profile, Organization } = require("../models");
const pubsub = require("../pubsub");

// Subscription event names
const ASSET_CREATED = "ASSET_CREATED";
const ASSET_UPDATED = "ASSET_UPDATED";
const ASSET_DELETED = "ASSET_DELETED";

const assetResolvers = {
  Query: {
    // Get all assets for an organization
    assets: async (_, { organizationId }, context) => {
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

        const assets = await Asset.find({ organizationId })
          .populate('createdBy')
          .sort({ category: 1, name: 1 });

        return assets;
      } catch (error) {
        console.error('Error fetching assets:', error);
        throw new Error(`Failed to fetch assets: ${error.message}`);
      }
    },

    // Get a single asset
    asset: async (_, { assetId, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      if (!organizationId) {
        throw new UserInputError("Organization ID is required!");
      }

      try {
        const asset = await Asset.findOne({ _id: assetId, organizationId })
          .populate('createdBy');

        if (!asset) {
          throw new UserInputError("Asset not found!");
        }

        return asset;
      } catch (error) {
        console.error('Error fetching asset:', error);
        throw new Error(`Failed to fetch asset: ${error.message}`);
      }
    },
  },

  Mutation: {
    // Create a new asset (Admin only)
    createAsset: async (_, { input, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      if (!organizationId) {
        throw new UserInputError("Organization ID is required!");
      }

      try {
        // Validate organization membership and admin rights
        const org = await Organization.findById(organizationId);
        if (!org) {
          throw new UserInputError("Organization not found!");
        }

        if (!org.isUserMember(context.user._id)) {
          throw new AuthenticationError("You are not a member of this organization!");
        }

        // Check if user is admin or owner
        const isOwner = org.owner.toString() === context.user._id.toString();
        const isAdmin = org.admins.some(adminId => adminId.toString() === context.user._id.toString());

        if (!isOwner && !isAdmin) {
          throw new AuthenticationError("Only admins can create assets!");
        }

        // Create the asset
        const asset = await Asset.create({
          ...input,
          organizationId,
          createdBy: context.user._id,
        });

        await asset.populate('createdBy');

        // Publish subscription event
        pubsub.publish(ASSET_CREATED, {
          assetCreated: asset,
          organizationId,
        });

        return asset;
      } catch (error) {
        console.error('Error creating asset:', error);
        throw new Error(`Failed to create asset: ${error.message}`);
      }
    },

    // Update an asset (Admin only)
    updateAsset: async (_, { assetId, input, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      if (!organizationId) {
        throw new UserInputError("Organization ID is required!");
      }

      try {
        // Validate organization membership and admin rights
        const org = await Organization.findById(organizationId);
        if (!org) {
          throw new UserInputError("Organization not found!");
        }

        if (!org.isUserMember(context.user._id)) {
          throw new AuthenticationError("You are not a member of this organization!");
        }

        // Check if user is admin or owner
        const isOwner = org.owner.toString() === context.user._id.toString();
        const isAdmin = org.admins.some(adminId => adminId.toString() === context.user._id.toString());

        if (!isOwner && !isAdmin) {
          throw new AuthenticationError("Only admins can update assets!");
        }

        // Find and update the asset
        const asset = await Asset.findOne({ _id: assetId, organizationId });
        
        if (!asset) {
          throw new UserInputError("Asset not found!");
        }

        // Update fields
        Object.keys(input).forEach(key => {
          if (input[key] !== undefined) {
            asset[key] = input[key];
          }
        });

        await asset.save();
        await asset.populate('createdBy');

        // Publish subscription event
        pubsub.publish(ASSET_UPDATED, {
          assetUpdated: asset,
          organizationId,
        });

        return asset;
      } catch (error) {
        console.error('Error updating asset:', error);
        throw new Error(`Failed to update asset: ${error.message}`);
      }
    },

    // Delete an asset (Admin only)
    deleteAsset: async (_, { assetId, organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      if (!organizationId) {
        throw new UserInputError("Organization ID is required!");
      }

      try {
        // Validate organization membership and admin rights
        const org = await Organization.findById(organizationId);
        if (!org) {
          throw new UserInputError("Organization not found!");
        }

        if (!org.isUserMember(context.user._id)) {
          throw new AuthenticationError("You are not a member of this organization!");
        }

        // Check if user is admin or owner
        const isOwner = org.owner.toString() === context.user._id.toString();
        const isAdmin = org.admins.some(adminId => adminId.toString() === context.user._id.toString());

        if (!isOwner && !isAdmin) {
          throw new AuthenticationError("Only admins can delete assets!");
        }

        // Delete the asset
        const asset = await Asset.findOneAndDelete({ _id: assetId, organizationId });
        
        if (!asset) {
          throw new UserInputError("Asset not found!");
        }

        // Publish subscription event
        pubsub.publish(ASSET_DELETED, {
          assetDeleted: assetId,
          organizationId,
        });

        return true;
      } catch (error) {
        console.error('Error deleting asset:', error);
        throw new Error(`Failed to delete asset: ${error.message}`);
      }
    },
  },

  Subscription: {
    assetCreated: {
      subscribe: (_, { organizationId }) => {
        return pubsub.asyncIterator(ASSET_CREATED);
      },
    },
    assetUpdated: {
      subscribe: (_, { organizationId }) => {
        return pubsub.asyncIterator(ASSET_UPDATED);
      },
    },
    assetDeleted: {
      subscribe: (_, { organizationId }) => {
        return pubsub.asyncIterator(ASSET_DELETED);
      },
    },
  },

  // Type resolvers
  Asset: {
    createdBy: async (parent) => {
      if (!parent.createdBy) return null;
      if (typeof parent.createdBy === 'object' && parent.createdBy.name) {
        return parent.createdBy;
      }
      return await Profile.findById(parent.createdBy);
    },
  },
};

module.exports = { assetResolvers };
