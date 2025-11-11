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
    online: Boolean # Indicates if the user is currently online
  }

  type Rating {
    user: ID!
    rating: Int!
  }

  type SkillReaction {
    user: Profile!
    emoji: String!
  }

  type Skill {
    _id: ID!
    skillText: String
    skillAuthor: String
    recipient: Profile!
    createdAt: String!
    reactions: [SkillReaction!]!
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
  type Game {
    _id: ID!
    creator: Profile!
    date: String!
    time: String!
    venue: String!
    city: String!
    notes: String
    opponent: String!
    score: String
    result: GameResult!
    status: GameStatus!
    responses: [Response!]!
    availableCount: Int!
    unavailableCount: Int!
    createdAt: String!
    updatedAt: String!
    feedbacks: [Feedback!]!
    averageRating: Float!
    formation: Formation
  }

  type Position {
    slot: Int!
    player: Profile
  }

  type Formation {
    _id: ID!
    game: Game!
    formationType: String!
    positions: [Position!]!
    comments: [FormationComment!]!
    likes: Int!
    likedBy: [Profile!]!
    createdAt: String!
    updatedAt: String!
  }

  type FormationComment {
    _id: ID!
    commentText: String!
    commentAuthor: String!
    user: Profile!
    likes: Int!
    likedBy: [Profile!]!
    createdAt: String!
    updatedAt: String!
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

  type Feedback {
    _id: ID!
    user: Profile!
    comment: String
    rating: Int!
    playerOfTheMatch: Profile
    createdAt: String!
  }

  type ScoreDetail {
    home: Int
    away: Int
  }

  type SoccerScore {
    homeTeam: String!
    awayTeam: String!
    homeGoals: Int
    awayGoals: Int
    status: String!
    utcDate: String!
    matchday: Int
    venue: String
    venueCity: String
    venueAddress: String
    referee: String
    duration: String
    halfTimeScore: ScoreDetail
    fullTimeScore: ScoreDetail
    extraTimeScore: ScoreDetail
    penaltiesScore: ScoreDetail
  }

  ########## INPUT TYPES ##########

  input CreateGameInput {
    date: String!
    time: String!
    venue: String!
    city: String!
    notes: String
    opponent: String!
  }

  input UpdateGameInput {
    date: String
    time: String
    venue: String
    city: String
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

  input PositionInput {
    slot: Int!
    playerId: ID
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
    formation(gameId: ID!): Formation
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
    updateJerseyNumber(profileId: ID!, jerseyNumber: Int!): Profile
    updatePosition(profileId: ID!, position: String!): Profile
    updatePhoneNumber(profileId: ID!, phoneNumber: String!): Profile
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
    completeGame(
      gameId: ID!
      score: String!
      note: String
      result: GameResult!
    ): Game!
    unvoteGame(gameId: ID!): Game!
    deleteGame(gameId: ID!): Game!
    updateGame(gameId: ID!, input: UpdateGameInput!): Game!
    addFeedback(
      gameId: ID!
      comment: String
      rating: Int!
      playerOfTheMatchId: ID
    ): Game!
    createFormation(gameId: ID!, formationType: String!): Formation!
    updateFormation(gameId: ID!, positions: [PositionInput!]!): Formation!
    deleteFormation(gameId: ID!): Boolean!
    addFormationComment(formationId: ID!, commentText: String!): Formation
    updateFormationComment(
      commentId: ID!
      commentText: String!
    ): FormationComment
    deleteFormationComment(formationId: ID!, commentId: ID!): ID!
    likeFormationComment(commentId: ID!): FormationComment
    likeFormation(formationId: ID!): Formation
    removeSocialMediaLink(userId: ID!, type: String!): Boolean
    markChatAsSeen(userId: ID!): Boolean
    reactToSkill(skillId: ID!, emoji: String!): Skill!
  }
  type Subscription {
    chatCreated: Chat
    chatSeen(chatId: ID!, to: ID!): Chat
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
    gameCreated: Game
    gameConfirmed: Game
    gameCompleted: Game
    gameCancelled: Game
    gameDeleted: ID
    gameUpdated: Game
    formationCreated(gameId: ID!): Formation
    formationUpdated(gameId: ID!): Formation
    formationDeleted(gameId: ID!): ID
    formationLiked(formationId: ID!): Formation
    formationCommentAdded(formationId: ID!): FormationComment
    formationCommentUpdated(formationId: ID!): FormationComment
    formationCommentDeleted(formationId: ID!): ID!
    formationCommentLiked(formationId: ID!): FormationComment
    onlineStatusChanged(profileId: ID!): Profile
    skillReactionUpdated(skillId: ID!): Skill
  }
`;

module.exports = typeDefs;
