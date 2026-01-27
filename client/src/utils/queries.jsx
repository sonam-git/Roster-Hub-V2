import { gql } from "@apollo/client";

export const QUERY_PROFILES = gql`
  query allProfiles($organizationId: ID!) {
    profiles(organizationId: $organizationId) {
      _id
      name
      jerseyNumber
      position
      phoneNumber
      profilePic
      averageRating
      online
      posts {
        _id
        postText
        postAuthor
        createdAt
        userId {
          _id
          name
          profilePic
        }
        comments {
          _id
          commentText
          commentAuthor
          createdAt
          userId
          likes
          likedBy {
            _id
            name
          }
        }
      }
      socialMediaLinks {
        _id
        userId
        type
        link
      }
      skills {
        _id
        skillText
        skillAuthor
        createdAt
        recipient {
          _id
          name
        }
        reactions {
          emoji
          user {
            _id
            name
          }
        }
      }
      receivedMessages {
        _id
        text
        createdAt
        sender {
          _id
          name
        }
        recipient {
          _id
          name
        }
      }
    }
  }
`;

export const QUERY_SINGLE_PROFILE = gql`
  query singleProfile($profileId: ID!, $organizationId: ID!) {
    profile(profileId: $profileId, organizationId: $organizationId) {
      _id
      name
      jerseyNumber
      position
      phoneNumber
      profilePic
      averageRating
      online
      posts {
        _id
        postText
        postAuthor
        createdAt
        userId {
          _id
          name
          profilePic
        }
        comments {
          _id
          commentText
          commentAuthor
          createdAt
          userId
          likes
          likedBy {
            _id
            name
          }
        }
      }
      socialMediaLinks {
        _id
        userId
        type
        link
      }
      skills {
        _id
        skillText
        skillAuthor
        createdAt
        recipient {
          _id
          name
        }
        reactions {
          emoji
          user {
            _id
            name
          }
        }
      }
      receivedMessages {
        _id
        text
        createdAt
        sender {
          _id
          name
        }
        recipient {
          _id
          name
        }
      }
    }
  }
`;

export const QUERY_ME = gql`
  query me {
    me {
      _id
      name
      jerseyNumber
      position
      phoneNumber
      profilePic
      averageRating
      currentOrganization {
        _id
        name
        slug
        inviteCode
        owner {
          _id
          name
        }
        members {
          _id
          name
          email
          jerseyNumber
          position
          profilePic
        }
        subscription {
          plan
          status
          trialEndsAt
        }
        usage {
          memberCount
          gameCount
          storageUsed
        }
        limits {
          maxMembers
          maxGames
          maxStorage
        }
      }
      organizations {
        _id
        name
        slug
        inviteCode
        subscription {
          plan
        }
      }
      socialMediaLinks {
        _id
        userId
        type
        link
      }
      skills {
        _id
        skillText
        skillAuthor
        createdAt
        recipient {
          _id
          name
        }
        reactions {
          emoji
          user {
            _id
            name
          }
        }
      }
      posts {
        _id
        postText
        postAuthor
        createdAt
        userId {
          _id
          name
          profilePic
        }
        comments {
          _id
          commentText
          commentAuthor
          createdAt
          userId
          likes
          likedBy {
            _id
            name
          }
        }
      }
      receivedMessages {
        _id
        text
        createdAt
        sender {
          _id
          name
        }
        recipient {
          _id
          name
        }
      }
      sentMessages {
        _id
        text
        createdAt
        sender {
          _id
          name
        }
        recipient {
          _id
          name
        }
      }
    }
  }
`;

export const RECEIVED_MESSAGES = gql`
  query ReceivedMessages {
    receivedMessages {
      _id
      text
      createdAt
      sender {
        _id
        name
      }
      recipient {
        _id
        name
      }
    }
  }
`;

export const GET_POSTS = gql`
  query Posts($organizationId: ID!) {
    posts(organizationId: $organizationId) {
      _id
      userId {
        _id
        name
        profilePic
      }
      postAuthor
      postText
      createdAt
      comments {
        commentText
        _id
        commentAuthor
        createdAt
        userId
        likes
        likedBy {
          _id
          name
        }
      }
      likes
      likedBy {
        _id
        name
      }
    }
  }
`;

export const GET_POST = gql`
  query Post($postId: ID!) {
    post(postId: $postId) {
      _id
      userId {
        _id
        name
        profilePic
      }
      createdAt
      postAuthor
      postText
      comments {
        commentText
        _id
        commentAuthor
        createdAt
        userId
        likes
        likedBy {
          _id
          name
        }
      }
      likes
      likedBy {
        _id
        name
      }
    }
  }
`;

export const GET_SKILLS = gql`
  query Skills {
    skills {
      _id
      skillText
      skillAuthor
      createdAt
      recipient {
        _id
        name
      }
      reactions {
        emoji
        user {
          _id
          name
        }
      }
    }
  }
`;

export const GET_COMMENTS = gql`
  query Comments {
    comments {
      _id
      commentText
      commentAuthor
      createdAt
      userId
      likes
      likedBy {
        _id
        name
      }
    }
  }
`;

export const GET_COMMENT = gql`
  query Comment($commentId: ID!) {
    comment(commentId: $commentId) {
      _id
      commentText
      commentAuthor
      createdAt
      userId
      likes
      likedBy {
        _id
        name
      }
    }
  }
`;

export const GET_ALL_CHATS = gql`
  query GetAllChats {
    getAllChats {
      id
      content
      createdAt
      from {
        _id
        name
      }
      to {
        _id
        name
      }
    }
  }
`;

export const GET_CHATS_BETWEEN_USERS = gql`
  query GetChatsBetweenUsers($userId1: ID!, $userId2: ID!) {
    getChatsBetweenUsers(userId1: $userId1, userId2: $userId2) {
      id
      from {
        _id
        name
      }
      to {
        _id
        name
      }
      content
      createdAt
    }
  }
`;

export const GET_CHAT_BY_USER = gql`
  query GetChatByUser($to: ID!) {
    getChatByUser(to: $to) {
      id
      content
      createdAt
      seen
      from {
        _id
        name
        profilePic
      }
      to {
        _id
        name
        profilePic
      }
    }
  }
`;
//Fetch all games (optionally filter by status)
export const QUERY_GAMES = gql`
  query Games($organizationId: ID!, $status: GameStatus) {
    games(organizationId: $organizationId, status: $status) {
      _id
      organizationId
      creator {
        _id
        name
      }
      date
      time
      venue
      city
      notes
      status
      score
      opponent
      result
      availableCount
      unavailableCount
      createdAt
      updatedAt
      responses {
        user {
          _id
          name
          jerseyNumber
          position
        }
        isAvailable
      }
      feedbacks {
        _id
        user {
          _id
          name
        }
        comment
        rating
        createdAt
        playerOfTheMatch {
          _id
          name
        }
      }
      averageRating
      formation {
        _id
        formationType
        organizationId
        positions {
          slot
          player {
            _id
            name
          }
        }
        comments {
          _id
          commentText
          commentAuthor
          user {
            _id
            name
          }
          likes
          likedBy {
            _id
            name
          }
          createdAt
          updatedAt
        }
        likes
        likedBy {
          _id
          name
        }
      }
    }
  }
`;
//Fetch a single game by ID (with votes and counts)
export const QUERY_GAME = gql`
  query Game($gameId: ID!, $organizationId: ID!) {
    game(gameId: $gameId, organizationId: $organizationId) {
      _id
      organizationId
      date
      time
      venue
      city
      notes
      score
      opponent
      result
      status
      createdAt
      updatedAt
      creator {
        _id
        name
      }
      responses {
        user {
          _id
          name
          jerseyNumber
          position
        }
        isAvailable
      }
      availableCount
      unavailableCount
      feedbacks {
        _id
        user {
          _id
          name
        }
        comment
        rating
        playerOfTheMatch {
          _id
          name
        }
        createdAt
      }
      averageRating
      formation {
        _id
        formationType
        organizationId
        positions {
          slot
          player {
            _id
            name
          }
        }
        comments {
          _id
          commentText
          commentAuthor
          user {
            _id
            name
          }
          likes
          likedBy {
            _id
            name
          }
          createdAt
          updatedAt
        }
        likes
        likedBy {
          _id
          name
        }
      }
    }
  }
`;
// Fetch soccer matches
export const GET_MATCHES = gql`
  query getMatches(
    $code: String!
    $status: String!
    $dateFrom: String
    $dateTo: String
  ) {
    soccerMatches(
      competitionCode: $code
      status: $status
      dateFrom: $dateFrom
      dateTo: $dateTo
    ) {
      homeTeam
      awayTeam
      homeGoals
      awayGoals
      status
      utcDate
      matchday
      venue
      venueCity
      venueAddress
      referee
      duration
      halfTimeScore {
        home
        away
      }
      fullTimeScore {
        home
        away
      }
      extraTimeScore {
        home
        away
      }
      penaltiesScore {
        home
        away
      }
    }
  }
`;
// Fetch formation by game ID
export const QUERY_FORMATION = gql`
  query QUERY_FORMATION($gameId: ID!, $organizationId: ID!) {
    formation(gameId: $gameId, organizationId: $organizationId) {
      _id
      organizationId
      formationType
      positions {
        slot
        player { _id name }
      }
      likes
      likedBy { _id name }
      comments {
        _id
        commentText
        commentAuthor
        createdAt
        updatedAt
        user { _id name }
        likes
        likedBy { _id name }
      }
      createdAt
      updatedAt
    }
  }
`;

// ########## ASSET QUERIES ########## //
export const QUERY_ASSETS = gql`
  query getAssets($organizationId: ID!) {
    assets(organizationId: $organizationId) {
      _id
      name
      quantity
      category
      condition
      notes
      organizationId
      createdBy {
        _id
        name
      }
      createdAt
      updatedAt
    }
  }
`;

export const QUERY_ASSET = gql`
  query getAsset($assetId: ID!, $organizationId: ID!) {
    asset(assetId: $assetId, organizationId: $organizationId) {
      _id
      name
      quantity
      category
      condition
      notes
      organizationId
      createdBy {
        _id
        name
      }
      createdAt
      updatedAt
    }
  }
`;

