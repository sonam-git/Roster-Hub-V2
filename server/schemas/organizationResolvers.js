const {
  AuthenticationError,
  UserInputError,
} = require("apollo-server-express");
const { Organization, Profile } = require("../models");
const { signToken } = require("../utils/auth");

/**
 * Organization Resolvers for Multi-Tenant Architecture
 * 
 * These resolvers handle all organization-related operations including:
 * - Creating and managing organizations
 * - Member management
 * - Invitations
 * - Organization switching
 */

const organizationResolvers = {
  // ############ QUERIES ########## //
  Query: {
    /**
     * Get all organizations the current user belongs to
     */
    myOrganizations: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      const profile = await Profile.findById(context.user._id)
        .populate({
          path: 'organizations.organization',
          model: 'Organization'
        });
      
      // Extract just the organization objects from the organizations array
      return profile.organizations.map(org => org.organization).filter(org => org !== null);
    },

    /**
     * Get organization by ID
     */
    organization: async (parent, { organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      const org = await Organization.findById(organizationId)
        .populate('owner')
        .populate('admins')
        .populate('members')
        .populate('invitations.createdBy')
        .populate('invitations.usedBy');

      if (!org) {
        throw new UserInputError("Organization not found!");
      }

      // Check if user has access to this organization
      if (!org.isUserMember(context.user._id)) {
        throw new AuthenticationError("You don't have access to this organization!");
      }

      return org;
    },

    /**
     * Get organization by slug
     */
    organizationBySlug: async (parent, { slug }, context) => {
      const org = await Organization.findOne({ slug })
        .populate('owner')
        .populate('admins')
        .populate('members');

      if (!org) {
        throw new UserInputError("Organization not found!");
      }

      return org;
    },

    /**
     * Get organization by subdomain
     */
    organizationBySubdomain: async (parent, { subdomain }, context) => {
      const org = await Organization.findOne({ subdomain })
        .populate('owner')
        .populate('admins')
        .populate('members');

      if (!org) {
        throw new UserInputError("Organization not found!");
      }

      return org;
    },

    /**
     * Check if slug is available
     */
    isSlugAvailable: async (parent, { slug }) => {
      const org = await Organization.findOne({ slug });
      return !org;
    },

    /**
     * Get organization members
     */
    organizationMembers: async (parent, { organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      const org = await Organization.findById(organizationId).populate('members');
      
      if (!org) {
        throw new UserInputError("Organization not found!");
      }

      // Check if user has access to this organization
      if (!org.isUserMember(context.user._id)) {
        throw new AuthenticationError("You don't have access to this organization!");
      }

      return org.members;
    },

    /**
     * Get organization invitations (admin only)
     */
    organizationInvitations: async (parent, { organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      const org = await Organization.findById(organizationId)
        .populate('invitations.createdBy')
        .populate('invitations.usedBy');
      
      if (!org) {
        throw new UserInputError("Organization not found!");
      }

      // Check if user is admin
      if (!org.isUserAdmin(context.user._id)) {
        throw new AuthenticationError("You must be an admin to view invitations!");
      }

      return org.invitations;
    },
  },

  // ############ MUTATIONS ########## //
  Mutation: {
    /**
     * Create a new organization
     * Automatically makes the creator the owner and adds them to the organization
     */
    createOrganization: async (parent, { input }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      // Check if slug is already taken
      const existingOrg = await Organization.findOne({ slug: input.slug });
      if (existingOrg) {
        throw new UserInputError("This slug is already taken!");
      }

      // Create organization
      const organization = await Organization.create({
        ...input,
        owner: context.user._id,
        members: [context.user._id],
        usage: {
          memberCount: 1,
          gameCount: 0,
          storageUsed: 0,
        },
      });

      // Update user's profile to include this organization
      const profile = await Profile.findById(context.user._id);
      profile.organizations.push({
        organization: organization._id,
        role: 'owner',
      });
      profile.currentOrganization = organization._id;
      await profile.save();

      // Populate organization data
      await organization.populate('owner');

      // Generate new token with organization context
      const token = signToken({
        email: profile.email,
        name: profile.name,
        _id: profile._id,
        organizationId: organization._id,
      });

      return { token, profile, organization };
    },

    /**
     * Update organization details (admin only)
     */
    updateOrganization: async (parent, { organizationId, input }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      const org = await Organization.findById(organizationId);
      
      if (!org) {
        throw new UserInputError("Organization not found!");
      }

      // Check if user is admin
      if (!org.isUserAdmin(context.user._id)) {
        throw new AuthenticationError("You must be an admin to update this organization!");
      }

      // Check if new slug is available (if slug is being changed)
      if (input.slug && input.slug !== org.slug) {
        const existingOrg = await Organization.findOne({ slug: input.slug });
        if (existingOrg) {
          throw new UserInputError("This slug is already taken!");
        }
      }

      // Update organization
      Object.assign(org, input);
      await org.save();

      await org.populate(['owner', 'admins', 'members']);
      return org;
    },

    /**
     * Update organization settings (admin only)
     */
    updateOrganizationSettings: async (parent, { organizationId, settings }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      const org = await Organization.findById(organizationId);
      
      if (!org) {
        throw new UserInputError("Organization not found!");
      }

      // Check if user is admin
      if (!org.isUserAdmin(context.user._id)) {
        throw new AuthenticationError("You must be an admin to update settings!");
      }

      // Update settings
      if (settings.theme) {
        org.settings.theme = { ...org.settings.theme.toObject(), ...settings.theme };
      }
      if (settings.features) {
        org.settings.features = { ...org.settings.features.toObject(), ...settings.features };
      }
      if (settings.general) {
        org.settings.general = { ...org.settings.general.toObject(), ...settings.general };
      }

      await org.save();
      await org.populate(['owner', 'admins', 'members']);
      
      return org;
    },

    /**
     * Add a member to the organization (admin only)
     */
    addOrganizationMember: async (parent, { organizationId, userId, role }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      const org = await Organization.findById(organizationId);
      
      if (!org) {
        throw new UserInputError("Organization not found!");
      }

      // Check if user is admin
      if (!org.isUserAdmin(context.user._id)) {
        throw new AuthenticationError("You must be an admin to add members!");
      }

      // Check member limit
      if (org.hasReachedMemberLimit()) {
        throw new UserInputError("Organization has reached its member limit!");
      }

      const profile = await Profile.findById(userId);
      if (!profile) {
        throw new UserInputError("User not found!");
      }

      // Check if already a member
      if (org.isUserMember(userId)) {
        throw new UserInputError("User is already a member!");
      }

      // Add to members or admins based on role
      if (role === 'admin') {
        org.admins.push(userId);
      }
      org.members.push(userId);
      org.usage.memberCount += 1;

      await org.save();

      // Update user's profile
      profile.organizations.push({
        organization: org._id,
        role: role || 'member',
      });
      await profile.save();

      await org.populate(['owner', 'admins', 'members']);
      return org;
    },

    /**
     * Remove a member from the organization (admin only)
     */
    removeOrganizationMember: async (parent, { organizationId, userId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      const org = await Organization.findById(organizationId);
      
      if (!org) {
        throw new UserInputError("Organization not found!");
      }

      // Check if user is admin
      if (!org.isUserAdmin(context.user._id)) {
        throw new AuthenticationError("You must be an admin to remove members!");
      }

      // Can't remove owner
      if (org.owner.toString() === userId) {
        throw new UserInputError("Cannot remove the organization owner!");
      }

      // Remove from members and admins
      org.members = org.members.filter(m => m.toString() !== userId);
      org.admins = org.admins.filter(a => a.toString() !== userId);
      org.usage.memberCount = Math.max(0, org.usage.memberCount - 1);

      await org.save();

      // Update user's profile
      const profile = await Profile.findById(userId);
      if (profile) {
        profile.organizations = profile.organizations.filter(
          o => o.organizationId.toString() !== organizationId
        );
        if (profile.currentOrganization?.toString() === organizationId) {
          profile.currentOrganization = profile.organizations[0]?.organizationId || null;
        }
        await profile.save();
      }

      await org.populate(['owner', 'admins', 'members']);
      return org;
    },

    /**
     * Update member role (admin only)
     */
    updateMemberRole: async (parent, { organizationId, userId, role }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      const org = await Organization.findById(organizationId);
      
      if (!org) {
        throw new UserInputError("Organization not found!");
      }

      // Check if user is admin
      if (!org.isUserAdmin(context.user._id)) {
        throw new AuthenticationError("You must be an admin to update roles!");
      }

      // Can't change owner role
      if (org.owner.toString() === userId) {
        throw new UserInputError("Cannot change the owner's role!");
      }

      // Check if user is a member
      if (!org.isUserMember(userId)) {
        throw new UserInputError("User is not a member of this organization!");
      }

      // Update role
      if (role === 'admin') {
        if (!org.admins.some(a => a.toString() === userId)) {
          org.admins.push(userId);
        }
      } else {
        org.admins = org.admins.filter(a => a.toString() !== userId);
      }

      await org.save();

      // Update user's profile
      const profile = await Profile.findById(userId);
      if (profile) {
        const orgIndex = profile.organizations.findIndex(
          o => o.organizationId.toString() === organizationId
        );
        if (orgIndex !== -1) {
          profile.organizations[orgIndex].role = role;
          await profile.save();
        }
      }

      await org.populate(['owner', 'admins', 'members']);
      return org;
    },

    /**
     * Create an invitation code (admin only)
     */
    createInvitation: async (parent, { organizationId, email, role }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      const org = await Organization.findById(organizationId);
      
      if (!org) {
        throw new UserInputError("Organization not found!");
      }

      // Check if user is admin
      if (!org.isUserAdmin(context.user._id)) {
        throw new AuthenticationError("You must be an admin to create invitations!");
      }

      // Generate unique invitation code
      let code;
      let isUnique = false;
      while (!isUnique) {
        code = Organization.generateInvitationCode();
        const existingInvite = org.invitations.find(inv => inv.code === code);
        isUnique = !existingInvite;
      }

      // Create invitation
      const invitation = {
        code,
        email: email || null,
        role: role || 'member',
        createdBy: context.user._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'pending',
      };

      org.invitations.push(invitation);
      await org.save();

      await org.populate(['invitations.createdBy', 'invitations.usedBy']);
      
      // Return the created invitation
      return org.invitations[org.invitations.length - 1];
    },

    /**
     * Accept an invitation and join the organization
     */
    acceptInvitation: async (parent, { invitationCode }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      // Find organization with this invitation
      const org = await Organization.findOne({
        'invitations.code': invitationCode,
      });

      if (!org) {
        throw new UserInputError("Invalid invitation code!");
      }

      // Find the specific invitation
      const invitation = org.invitations.find(inv => inv.code === invitationCode);

      if (!invitation) {
        throw new UserInputError("Invitation not found!");
      }

      if (invitation.status !== 'pending') {
        throw new UserInputError("This invitation has already been used or expired!");
      }

      if (invitation.expiresAt < new Date()) {
        invitation.status = 'expired';
        await org.save();
        throw new UserInputError("This invitation has expired!");
      }

      // Check if already a member
      if (org.isUserMember(context.user._id)) {
        throw new UserInputError("You are already a member of this organization!");
      }

      // Check member limit
      if (org.hasReachedMemberLimit()) {
        throw new UserInputError("Organization has reached its member limit!");
      }

      // Add user to organization
      if (invitation.role === 'admin') {
        org.admins.push(context.user._id);
      }
      org.members.push(context.user._id);
      org.usage.memberCount += 1;

      // Update invitation
      invitation.status = 'accepted';
      invitation.usedBy = context.user._id;
      invitation.usedAt = new Date();

      await org.save();

      // Update user's profile
      const profile = await Profile.findById(context.user._id);
      profile.organizations.push({
        organization: org._id,
        role: invitation.role,
      });
      profile.currentOrganization = org._id;
      await profile.save();

      await org.populate('owner');

      // Generate new token with organization context
      const token = signToken({
        email: profile.email,
        name: profile.name,
        _id: profile._id,
        organizationId: org._id,
      });

      return { token, profile, organization: org };
    },

    /**
     * Delete an invitation (admin only)
     */
    deleteInvitation: async (parent, { organizationId, invitationCode }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      const org = await Organization.findById(organizationId);
      
      if (!org) {
        throw new UserInputError("Organization not found!");
      }

      // Check if user is admin
      if (!org.isUserAdmin(context.user._id)) {
        throw new AuthenticationError("You must be an admin to delete invitations!");
      }

      // Remove invitation
      org.invitations = org.invitations.filter(inv => inv.code !== invitationCode);
      await org.save();

      return true;
    },

    /**
     * Switch current organization
     */
    switchOrganization: async (parent, { organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      const org = await Organization.findById(organizationId).populate('owner');
      
      if (!org) {
        throw new UserInputError("Organization not found!");
      }

      // Check if user is a member
      if (!org.isUserMember(context.user._id)) {
        throw new AuthenticationError("You are not a member of this organization!");
      }

      // Update user's current organization
      const profile = await Profile.findById(context.user._id);
      profile.currentOrganization = organizationId;
      await profile.save();

      // Generate new token with updated organization context
      const token = signToken({
        email: profile.email,
        name: profile.name,
        _id: profile._id,
        organizationId: organizationId,
      });

      return { token, profile, organization: org };
    },

    /**
     * Delete organization (owner only)
     */
    deleteOrganization: async (parent, { organizationId }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      const org = await Organization.findById(organizationId);
      
      if (!org) {
        throw new UserInputError("Organization not found!");
      }

      // Check if user is owner
      if (org.owner.toString() !== context.user._id.toString()) {
        throw new AuthenticationError("Only the owner can delete this organization!");
      }

      // Remove organization from all members' profiles
      await Profile.updateMany(
        { 'organizations.organizationId': organizationId },
        { 
          $pull: { organizations: { organizationId } },
          $unset: { currentOrganization: '' }
        }
      );

      // Delete organization
      await Organization.findByIdAndDelete(organizationId);

      return true;
    },
  },

  // ############ FIELD RESOLVERS ########## //
  Profile: {
    /**
     * Get user's organizations (transform from array of objects to array of Organizations)
     */
    organizations: async (parent) => {
      try {
        if (!parent.organizations || parent.organizations.length === 0) {
          return [];
        }
        
        // Extract organization IDs from the array of objects
        const orgIds = parent.organizations
          .map(org => org.organization)
          .filter(id => id != null);
        
        if (orgIds.length === 0) {
          return [];
        }
        
        // Fetch all organizations
        const orgs = await Organization.find({ _id: { $in: orgIds } });
        return orgs;
      } catch (error) {
        console.error('❌ Error in organizations resolver:', error);
        return [];
      }
    },
    
    /**
     * Get user's role in a specific organization
     */
    roleInOrganization: async (parent, { organizationId }) => {
      const orgData = parent.organizations.find(
        o => o.organizationId.toString() === organizationId
      );
      return orgData ? orgData.role : null;
    },
    
    /**
     * Get user's current organization with full details
     */
    currentOrganization: async (parent) => {
      try {
        console.log('🔍 currentOrganization resolver called');
        console.log('  parent.currentOrganization:', parent.currentOrganization);
        
        if (!parent.currentOrganization) {
          console.log('  ⚠️ No currentOrganization on parent, returning null');
          return null;
        }
        
        const org = await Organization.findById(parent.currentOrganization)
          .populate('owner')
          .populate('members');
        
        console.log('  ✅ Organization found:', {
          id: org?._id,
          name: org?.name,
          inviteCode: org?.inviteCode,
          ownerId: org?.owner?._id,
          memberCount: org?.members?.length
        });
        
        return org;
      } catch (error) {
        console.error('❌ Error in currentOrganization resolver:', error);
        throw error;
      }
    },
  },
};

module.exports = organizationResolvers;
