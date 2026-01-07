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

  ########## ORGANIZATION TYPES ##########

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
`;

module.exports = typeDefs;
