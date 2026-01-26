const { gql } = require("apollo-server-express");

const assetTypeDefs = gql`
  enum AssetCategory {
    Balls
    Training_Equipment
    Goals
    Jerseys
    Other
  }

  enum AssetCondition {
    Excellent
    Good
    Fair
    Poor
    Needs_Replacement
  }

  type Asset {
    _id: ID!
    name: String!
    quantity: Int!
    category: AssetCategory!
    condition: AssetCondition!
    notes: String
    organizationId: ID!
    createdBy: Profile!
    createdAt: String!
    updatedAt: String!
  }

  input CreateAssetInput {
    name: String!
    quantity: Int!
    category: AssetCategory!
    condition: AssetCondition
    notes: String
  }

  input UpdateAssetInput {
    name: String
    quantity: Int
    category: AssetCategory
    condition: AssetCondition
    notes: String
  }

  extend type Query {
    assets(organizationId: ID!): [Asset!]!
    asset(assetId: ID!, organizationId: ID!): Asset
  }

  extend type Mutation {
    createAsset(input: CreateAssetInput!, organizationId: ID!): Asset!
    updateAsset(assetId: ID!, input: UpdateAssetInput!, organizationId: ID!): Asset!
    deleteAsset(assetId: ID!, organizationId: ID!): Boolean!
  }

  extend type Subscription {
    assetCreated(organizationId: ID!): Asset!
    assetUpdated(organizationId: ID!): Asset!
    assetDeleted(organizationId: ID!): ID!
  }
`;

module.exports = assetTypeDefs;
