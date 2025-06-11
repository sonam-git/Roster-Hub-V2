const { gql } = require("apollo-server-express");

const typeDefs = gql`
  scalar Upload
  type Profile {
    _id: ID
    name: String
    email: String
    jerseyNumber: Int
    position: String
    phoneNumber: String
    profilePic: String
    skills: [Skill]
    posts: [Post]
    socialMediaLinks: [SocialMediaLink]
    receivedMessages: [Message]
    sentMessages: [Message]
    ratings: [Rating]
    averageRating: Float
  }

  type Rating {
    user: ID!
    rating: Int!
  }

  type Skill {
    _id: ID!
    skillText: String
    skillAuthor: String
    createdAt: String!
  }

  type Post {
    _id: ID!
    postText: String
    postAuthor: String!
    createdAt: String!
    comments: [Comment]
    userId: Profile!
    likes: Int
    likedBy: [Profile]
  }

  type Comment {
    _id: ID!
    commentText: String!
    commentAuthor: String!
    createdAt: String!
    userId: ID!
  }

  type Message {
    _id: ID!
    sender: Profile!
    recipient: Profile!
    text: String!
    createdAt: String!
  }

  type Chat {
    id: ID!
    from: Profile
    to: Profile
    content: String
    seen: Boolean
    createdAt: String!
  }

  type SocialMediaLink {
    _id: ID!
    userId: ID!
    type: String!
    link: String!
  }

  type ResponseMessage {
    message: String!
  }
  ############ TYPES & ENUMS ############

  enum GameStatus {
    PENDING
    CONFIRMED
    CANCELLED
  }

  type Response {
    user: Profile!
    isAvailable: Boolean!
  }

  type Game {
    _id: ID!
    creator: Profile!
    date: String! # ISO-formatted Date
    time: String! # e.g. "18:30"
    venue: String!
    notes: String
    status: GameStatus!
    responses: [Response!]!
    availableCount: Int! # computed
    unavailableCount: Int! # computed
    createdAt: String!
    updatedAt: String!
  }

  ########## INPUT TYPES ##########

  input CreateGameInput {
    date: String! # ISO string (e.g. "2025-06-15T00:00:00.000Z")
    time: String! # e.g. "18:30"
    venue: String!
    notes: String
  }

  input UpdateGameInput {
   date: String
   time: String
   venue: String
   notes: String
 }

  input RespondToGameInput {
    gameId: ID!
    isAvailable: Boolean!
  }

  input RatingInput {
    user: ID!
    rating: Int!
  }

  type Auth {
    token: ID!
    profile: Profile
  }

  type Query {
    profiles: [Profile]!
    profile(profileId: ID!): Profile
    me: Profile
    skills: [Skill]
    skill(skillId: ID!): Skill
    receivedMessages: [Message]!
    socialMediaLinks(userId: ID!): [SocialMediaLink]!
    posts: [Post]
    post(postId: ID!): Post
    comments: [Comment]
    comment(commentId: ID!): Comment
    getPlayerRating(profileId: ID!): Float
    getChatByUser(to: ID!): [Chat]
    getAllChats: [Chat]
    getChatsBetweenUsers(userId1: ID!, userId2: ID!): [Chat]
    games(status: GameStatus): [Game!]!
    game(gameId: ID!): Game
  }

  type Mutation {
    addProfile(name: String!, email: String!, password: String!): Auth
    login(email: String!, password: String!): Auth
    addInfo(
      profileId: ID!
      jerseyNumber: Int!
      position: String!
      phoneNumber: String!
    ): Profile
    uploadProfilePic(profileId: ID!, profilePic: Upload!): Profile
    addSkill(profileId: ID!, skillText: String!): Skill
    sendMessage(recipientId: ID!, text: String!): Message!
    removeSkill(skillId: ID!): Skill
    removeMessage(messageId: ID!): Message
    saveSocialMediaLink(
      userId: ID!
      type: String!
      link: String!
    ): SocialMediaLink!
    updateName(name: String!): Profile
    updatePassword(currentPassword: String!, newPassword: String!): Profile
    deleteProfile(profileId: ID!): Profile
    addPost(profileId: ID!, postText: String!): Post
    updatePost(postId: ID!, postText: String!): Post
    removePost(postId: ID!): Post
    addComment(postId: ID!, commentText: String!): Post
    updateComment(commentId: ID!, commentText: String!): Comment
    removeComment(postId: ID!, commentId: ID!): Post
    sendResetPasswordEmail(email: String!): ResponseMessage!
    resetPassword(token: String!, newPassword: String!): ResponseMessage!
    likePost(postId: ID!): Post
    ratePlayer(profileId: ID!, ratingInput: RatingInput!): Profile
    createChat(from: ID!, to: ID!, content: String!): Chat
    # Create a new game poll (authenticated)
    createGame(input: CreateGameInput!): Game!
    # Cast or update a vote (Yes/No)
    respondToGame(input: RespondToGameInput!): Game!
    # Confirm a pending game (only the creator)
    confirmGame(gameId: ID!, note: String): Game
    # Cancel a pending game (only the creator)
    cancelGame(gameId: ID!, note: String): Game
    # Remove the current user's vote on a game
    unvoteGame(gameId: ID!): Game!
    deleteGame(gameId: ID!): Game!
    updateGame(gameId: ID!, input: UpdateGameInput!): Game!
  }
  type Subscription {
    chatCreated: Chat
  }
`;

module.exports = typeDefs;
