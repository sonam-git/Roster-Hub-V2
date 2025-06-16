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
    likes: Int
    likedBy: [Profile]
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
    COMPLETED
    CANCELLED
  }

  enum GameResult {
    HOME_WIN
    AWAY_WIN
    DRAW
    NOT_PLAYED
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
    opponent: String!
    score: String # e.g. "2 - 1"
    result: GameResult!
    status: GameStatus!
    responses: [Response!]!
    availableCount: Int! # computed
    unavailableCount: Int! # computed
    createdAt: String!
    updatedAt: String!
  }

  type SoccerScore {
    homeTeam: String!
    awayTeam: String!
    homeGoals: Int
    awayGoals: Int
    status: String
    matchday: Int
    utcDate: String!
  }

  ########## INPUT TYPES ##########

  input CreateGameInput {
    date: String! # ISO string (e.g. "2025-06-15T00:00:00.000Z")
    time: String! # e.g. "18:30"
    venue: String!
    notes: String
    opponent: String!
  }

  input UpdateGameInput {
    date: String
    time: String
    venue: String
    notes: String
    opponent: String
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
    soccerMatches(
      competitionCode: String!
      status: String!
      dateFrom: String
      dateTo: String
    ): [SoccerScore!]!
  }

  type Mutation {
    addProfile(name: String!, email: String!, password: String!): Auth
    login(email: String!, password: String!): Auth
    loginWithGoogle(idToken: String!): Auth
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
    deleteConversation(userId: ID!): Boolean!
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
    removeComment(postId: ID!, commentId: ID!): ID!
    sendResetPasswordEmail(email: String!): ResponseMessage!
    resetPassword(token: String!, newPassword: String!): ResponseMessage!
    likePost(postId: ID!): Post
    likeComment(commentId: ID!): Comment
    ratePlayer(profileId: ID!, ratingInput: RatingInput!): Profile
    createChat(from: ID!, to: ID!, content: String!): Chat
    createGame(input: CreateGameInput!): Game!
    respondToGame(input: RespondToGameInput!): Game!
    confirmGame(gameId: ID!, note: String): Game
    cancelGame(gameId: ID!, note: String): Game
    completeGame(gameId: ID!, score: String!, result:GameResult! ): Game!
    unvoteGame(gameId: ID!): Game!
    deleteGame(gameId: ID!): Game!
    updateGame(gameId: ID!, input: UpdateGameInput!): Game!
  }
  type Subscription {
    chatCreated: Chat
    skillAdded: Skill
    skillDeleted: ID
    postAdded: Post
    postLiked(postId: ID!): Post
    postUpdated: Post
    postDeleted: ID
    commentAdded(postId: ID!): Comment
    commentUpdated: Comment
    commentDeleted: ID
    commentLiked(commentId: ID!): Comment
  }
`;

module.exports = typeDefs;
