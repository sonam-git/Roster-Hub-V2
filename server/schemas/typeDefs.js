const { gql } = require("apollo-server-express");
const assetTypeDefs = require("./assetTypeDefs");

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
    # Multi-tenant fields
    organizations: [Organization]
    currentOrganization: Organization
    roleInOrganization(organizationId: ID!): String
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
    organizationId: ID!
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
    organizationId: ID!
  }

  type Comment {
    _id: ID!
    commentText: String!
    commentAuthor: String!
    createdAt: String!
    userId: ID!
    likes: Int
    likedBy: [Profile]
    organizationId: ID!
  }

  type Message {
    _id: ID!
    sender: Profile!
    recipient: Profile!
    text: String!
    createdAt: String!
    organizationId: ID!
  }

  type Chat {
    id: ID!
    from: Profile
    to: Profile
    content: String
    seen: Boolean
    createdAt: String!
    organizationId: ID!
  }

  type SocialMediaLink {
    _id: ID!
    userId: ID!
    type: String!
    link: String!
    organizationId: ID!
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
    jerseyColor: String!
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
    organizationId: ID!
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
    organizationId: ID!
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
    jerseyColor: String!
  }

  input UpdateGameInput {
    date: String
    time: String
    venue: String
    city: String
    notes: String
    opponent: String
    jerseyColor: String
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

  ########## ORGANIZATION TYPES ##########

  type Organization {
    _id: ID!
    name: String!
    slug: String!
    description: String
    logo: String
    subdomain: String
    customDomain: String
    inviteCode: String
    settings: OrganizationSettings
    owner: Profile!
    admins: [Profile!]
    members: [Profile!]
    subscription: OrganizationSubscription
    limits: OrganizationLimits
    usage: OrganizationUsage
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

  type OrganizationSubscription {
    plan: String!
    status: String!
    trialEndsAt: String
    currentPeriodStart: String
    currentPeriodEnd: String
  }

  type OrganizationLimits {
    maxMembers: Int!
    maxGames: Int!
    maxStorage: Int!
  }

  type OrganizationUsage {
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

  ########## ORGANIZATION INPUT TYPES ##########

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

  type Auth {
    token: ID!
    profile: Profile
    organization: Organization
  }

  type Query {
    profiles(organizationId: ID!): [Profile]!
    profile(profileId: ID!, organizationId: ID): Profile
    me: Profile
    skills(organizationId: ID): [Skill]
    skill(skillId: ID!): Skill
    receivedMessages: [Message]!
    socialMediaLinks(userId: ID!): [SocialMediaLink]!
    posts(organizationId: ID): [Post]
    post(postId: ID!): Post
    comments: [Comment]
    comment(commentId: ID!): Comment
    getPlayerRating(profileId: ID!): Float
    getChatByUser(to: ID!): [Chat]
    getAllChats: [Chat]
    getChatsBetweenUsers(userId1: ID!, userId2: ID!): [Chat]
    games(organizationId: ID!, status: GameStatus): [Game!]!
    game(gameId: ID!, organizationId: ID!): Game
    soccerMatches(
      competitionCode: String!
      status: String!
      dateFrom: String
      dateTo: String
    ): [SoccerScore!]!
    formation(gameId: ID!, organizationId: ID!): Formation
    # Organization queries
    myOrganizations: [Organization]
    organization(organizationId: ID!): Organization
    organizationBySlug(slug: String!): Organization
    organizationBySubdomain(subdomain: String!): Organization
    isSlugAvailable(slug: String!): Boolean!
    organizationMembers(organizationId: ID!): [Profile]
    organizationInvitations(organizationId: ID!): [Invitation]
  }

  type Mutation {
    addProfile(name: String!, email: String!, password: String!, organizationName: String, inviteCode: String): Auth
    login(email: String!, password: String!): Auth
    loginWithGoogle(idToken: String!): Auth
    sendTeamInvite(emails: [String!]!, organizationId: ID!): ResponseMessage!
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
    addSkill(profileId: ID!, skillText: String!, organizationId: ID!): Skill
    sendMessage(recipientId: ID!, text: String!, organizationId: ID!): Message!
    removeSkill(skillId: ID!, organizationId: ID!): Skill
    removeMessage(messageId: ID!, organizationId: ID!): Message
    deleteConversation(userId: ID!, organizationId: ID!): Boolean!
    deleteChatConversation(userId: ID!, organizationId: ID!): Boolean!
    deleteMessageConversation(userId: ID!, organizationId: ID!): Boolean!
    saveSocialMediaLink(
      userId: ID!
      type: String!
      link: String!
      organizationId: ID!
    ): SocialMediaLink!
    updateName(name: String!): Profile
    updatePassword(currentPassword: String!, newPassword: String!): Profile
    deleteProfile(profileId: ID!): Profile
    addPost(profileId: ID!, postText: String!, organizationId: ID!): Post
    updatePost(postId: ID!, postText: String!, organizationId: ID!): Post
    removePost(postId: ID!, organizationId: ID!): Post
    addComment(postId: ID!, commentText: String!, organizationId: ID!): Post
    updateComment(commentId: ID!, commentText: String!, organizationId: ID!): Comment
    removeComment(postId: ID!, commentId: ID!, organizationId: ID!): ID!
    sendResetPasswordEmail(email: String!): ResponseMessage!
    resetPassword(token: String!, newPassword: String!): ResponseMessage!
    likePost(postId: ID!, organizationId: ID!): Post
    likeComment(commentId: ID!, organizationId: ID!): Comment
    ratePlayer(profileId: ID!, ratingInput: RatingInput!, organizationId: ID!): Profile
    createChat(from: ID!, to: ID!, content: String!, organizationId: ID!): Chat
    createGame(input: CreateGameInput!, organizationId: ID!): Game!
    respondToGame(input: RespondToGameInput!, organizationId: ID!): Game!
    confirmGame(gameId: ID!, organizationId: ID!, note: String): Game
    cancelGame(gameId: ID!, organizationId: ID!, note: String): Game
    completeGame(
      gameId: ID!
      organizationId: ID!
      score: String!
      note: String
      result: GameResult!
    ): Game!
    unvoteGame(gameId: ID!, organizationId: ID!): Game!
    deleteGame(gameId: ID!, organizationId: ID!): Game!
    updateGame(gameId: ID!, organizationId: ID!, input: UpdateGameInput!): Game!
    addFeedback(
      gameId: ID!
      organizationId: ID!
      comment: String
      rating: Int!
      playerOfTheMatchId: ID
    ): Game!
    createFormation(gameId: ID!, formationType: String!, organizationId: ID!): Formation!
    updateFormation(gameId: ID!, positions: [PositionInput!]!, organizationId: ID!): Formation!
    deleteFormation(gameId: ID!, organizationId: ID!): Boolean!
    addFormationComment(formationId: ID!, commentText: String!, organizationId: ID!): Formation
    updateFormationComment(
      commentId: ID!
      commentText: String!
      organizationId: ID!
    ): FormationComment
    deleteFormationComment(formationId: ID!, commentId: ID!, organizationId: ID!): ID!
    likeFormationComment(commentId: ID!, organizationId: ID!): FormationComment
    likeFormation(formationId: ID!, organizationId: ID!): Formation
    removeSocialMediaLink(userId: ID!, type: String!, organizationId: ID!): Boolean
    markChatAsSeen(userId: ID!, organizationId: ID!): Boolean
    reactToSkill(skillId: ID!, emoji: String!, organizationId: ID!): Skill!
    # Organization mutations
    createOrganization(input: OrganizationInput!): Auth!
    updateOrganization(organizationId: ID!, input: OrganizationInput!): Organization!
    updateOrganizationSettings(organizationId: ID!, settings: OrganizationSettingsInput!): Organization!
    addOrganizationMember(organizationId: ID!, userId: ID!, role: String): Organization!
    removeOrganizationMember(organizationId: ID!, userId: ID!): Organization!
    updateMemberRole(organizationId: ID!, userId: ID!, role: String!): Organization!
    createInvitation(organizationId: ID!, email: String, role: String): Invitation!
    acceptInvitation(invitationCode: String!): Auth!
    deleteInvitation(organizationId: ID!, invitationCode: String!): Boolean!
    switchOrganization(organizationId: ID!): Auth!
    deleteOrganization(organizationId: ID!): Boolean!
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
    # Organization subscriptions
    organizationMemberAdded(organizationId: ID!): Profile!
    organizationMemberRemoved(organizationId: ID!): Profile!
    organizationUpdated(organizationId: ID!): Organization!
  }
  
  ${assetTypeDefs}
`;

module.exports = typeDefs;
