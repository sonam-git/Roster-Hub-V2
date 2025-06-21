import { gql } from "@apollo/client";

export const QUERY_PROFILES = gql`
  query allProfiles {
    profiles {
      _id
      name
      jerseyNumber
      position
      phoneNumber
      profilePic
      averageRating
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
  query singleProfile($profileId: ID!) {
    profile(profileId: $profileId) {
      _id
      name
      jerseyNumber
      position
      phoneNumber
      profilePic
      averageRating
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
  query Posts {
    posts {
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
  query Games($status: GameStatus) {
    games(status: $status) {
      _id
      creator {
        _id
        name
      }
      date
      time
      venue
      notes
      status
      score
      opponent
      result
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
        createdAt
      }
      averageRating
    }
  }
`;
//Fetch a single game by ID (with votes and counts)
export const QUERY_GAME = gql`
  query Game($gameId: ID!) {
    game(gameId: $gameId) {
      _id
      date
      time
      venue
      notes
      score
      opponent
      result
      status
      creator {
        _id
        name
      }
      responses {
        user {
          _id
          name
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
        createdAt
      }
      averageRating
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
    }
  }
`;
