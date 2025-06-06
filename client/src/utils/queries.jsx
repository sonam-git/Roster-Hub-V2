import { gql } from '@apollo/client';

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
        userId
        comments {
          _id
          commentText
          commentAuthor
          createdAt
          userId
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
        userId
        comments {
          _id
          commentText
          commentAuthor
          createdAt
          userId
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
      }
      posts {
        _id
        postText
        postAuthor
        createdAt
        userId
        comments {
          _id
          commentText
          commentAuthor
          createdAt
          userId
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
    userId
    postAuthor
    postText
    createdAt
    comments {
      commentText
      _id
      commentAuthor
      createdAt
      userId
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
    userId
    createdAt
    postAuthor
    postText
    comments {
      commentText
      _id
      commentAuthor
      createdAt
      userId
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
  }
}`;

export const GET_COMMENT = gql`
query Comment($commentId: ID!) {
  comment(commentId: $commentId) {
    _id
    commentText
    commentAuthor
    createdAt
    userId
  }
}`;

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
}`;

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
// 1. Fetch all games (optionally filter by status)
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
      availableCount
      unavailableCount
    }
  }
`;

// 2. Fetch a single game by ID (with votes and counts)
export const QUERY_GAME = gql`
  query Game($gameId: ID!) {
    game(gameId: $gameId) {
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
      responses {
        user {
          _id
          name
        }
        isAvailable
      }
      availableCount
      unavailableCount
      createdAt
      updatedAt
    }
  }
`;