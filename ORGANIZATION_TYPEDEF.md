# Multi-Tenant GraphQL Type Definitions for Organization

## Organization Type Definitions

This file contains the GraphQL schema additions for multi-tenant support.
Add these to your existing typeDefs.js file.

```graphql
# Organization Types
type Organization {
  _id: ID!
  name: String!
  slug: String!
  description: String
  logo: String
  subdomain: String
  customDomain: String
  settings: OrganizationSettings
  owner: Profile!
  admins: [Profile]
  members: [Profile]
  subscription: Subscription
  limits: Limits
  usage: Usage
  invitations: [Invitation]
  isActive: Boolean!
  isVerified: Boolean!
  createdAt: String!
  updatedAt: String!
}

type OrganizationSettings {
  theme: ThemeSettings
  features: FeatureSettings
  general: GeneralSettings
}

type ThemeSettings {
  primaryColor: String
  secondaryColor: String
  logo: String
  favicon: String
}

type FeatureSettings {
  enableFormations: Boolean
  enableChat: Boolean
  enablePosts: Boolean
  enableWeather: Boolean
  enableSkills: Boolean
  enableFeedback: Boolean
}

type GeneralSettings {
  timezone: String
  language: String
  dateFormat: String
}

type Subscription {
  plan: String!
  status: String!
  trialEndsAt: String
  currentPeriodStart: String
  currentPeriodEnd: String
}

type Limits {
  maxMembers: Int!
  maxGames: Int!
  maxStorage: Int!
}

type Usage {
  memberCount: Int!
  gameCount: Int!
  storageUsed: Int!
}

type Invitation {
  code: String!
  email: String
  role: String!
  createdBy: Profile
  expiresAt: String
  usedBy: Profile
  usedAt: String
  status: String!
}

# Input Types
input OrganizationInput {
  name: String!
  slug: String!
  description: String
  logo: String
}

input OrganizationSettingsInput {
  theme: ThemeSettingsInput
  features: FeatureSettingsInput
  general: GeneralSettingsInput
}

input ThemeSettingsInput {
  primaryColor: String
  secondaryColor: String
  logo: String
  favicon: String
}

input FeatureSettingsInput {
  enableFormations: Boolean
  enableChat: Boolean
  enablePosts: Boolean
  enableWeather: Boolean
  enableSkills: Boolean
  enableFeedback: Boolean
}

input GeneralSettingsInput {
  timezone: String
  language: String
  dateFormat: String
}

# Queries
extend type Query {
  # Get current user's organizations
  myOrganizations: [Organization]
  
  # Get organization by ID
  organization(organizationId: ID!): Organization
  
  # Get organization by slug
  organizationBySlug(slug: String!): Organization
  
  # Get organization by subdomain
  organizationBySubdomain(subdomain: String!): Organization
  
  # Check if slug is available
  isSlugAvailable(slug: String!): Boolean!
  
  # Get organization members
  organizationMembers(organizationId: ID!): [Profile]
  
  # Get pending invitations
  organizationInvitations(organizationId: ID!): [Invitation]
}

# Mutations
extend type Mutation {
  # Create a new organization
  createOrganization(input: OrganizationInput!): AuthPayload!
  
  # Update organization details
  updateOrganization(organizationId: ID!, input: OrganizationInput!): Organization!
  
  # Update organization settings
  updateOrganizationSettings(organizationId: ID!, settings: OrganizationSettingsInput!): Organization!
  
  # Add member to organization
  addOrganizationMember(organizationId: ID!, userId: ID!, role: String): Organization!
  
  # Remove member from organization
  removeOrganizationMember(organizationId: ID!, userId: ID!): Organization!
  
  # Update member role
  updateMemberRole(organizationId: ID!, userId: ID!, role: String!): Organization!
  
  # Create invitation
  createInvitation(organizationId: ID!, email: String, role: String): Invitation!
  
  # Accept invitation
  acceptInvitation(invitationCode: String!): AuthPayload!
  
  # Delete invitation
  deleteInvitation(organizationId: ID!, invitationCode: String!): Boolean!
  
  # Switch current organization
  switchOrganization(organizationId: ID!): AuthPayload!
  
  # Delete organization (owner only)
  deleteOrganization(organizationId: ID!): Boolean!
}

# Subscriptions
extend type Subscription {
  # Organization member added
  organizationMemberAdded(organizationId: ID!): Profile!
  
  # Organization member removed
  organizationMemberRemoved(organizationId: ID!): Profile!
  
  # Organization settings updated
  organizationUpdated(organizationId: ID!): Organization!
}

# Update AuthPayload to include organization info
type AuthPayload {
  token: String!
  user: Profile!
  organization: Organization
}
```

## Notes:
1. Add these types to your existing typeDefs.js
2. Make sure to use `extend type Query/Mutation/Subscription` to add to existing types
3. Update AuthPayload to include organization if it doesn't already
4. These types support the full multi-tenant architecture
