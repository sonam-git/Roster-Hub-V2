import { gql } from "@apollo/client";

export const CHAT_SUBSCRIPTION = gql`
  subscription onChatCreated {
    chatCreated {
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
export const POST_ADDED_SUBSCRIPTION = gql`
  subscription {
    postAdded {
      _id
      postText
      createdAt
      postAuthor
      userId {
        _id
        name
        profilePic
      }
      likes
      likedBy {
        _id
        name
      }
      comments {
        _id
        commentText
        commentAuthor
        userId
        createdAt
      }
    }
  }
`;
export const POST_LIKED_SUBSCRIPTION = gql`
  subscription OnPostLiked($postId: ID!) {
    postLiked(postId: $postId) {
      _id
      likes
      likedBy {
        _id
        name
      }
    }
  }
`;
export const POST_UPDATED_SUBSCRIPTION = gql`
  subscription {
    postUpdated {
      _id
      postText
      createdAt
      postAuthor
      userId {
        _id
        name
        profilePic
      }
      likes
      likedBy {
        _id
        name
      }
      comments {
        _id
        commentText
        commentAuthor
        createdAt
        userId
      }
    }
  }
`;
export const POST_DELETED_SUBSCRIPTION = gql`
  subscription {
    postDeleted
  }
`;
export const COMMENT_ADDED_SUBSCRIPTION = gql`
  subscription OnCommentAdded($postId: ID!) {
    commentAdded(postId: $postId) {
      _id
      commentText
      commentAuthor
      createdAt
      userId
    }
  }
`;
export const COMMENT_UPDATED_SUBSCRIPTION = gql`
  subscription {
    commentUpdated {
      _id
      commentText
      commentAuthor
      createdAt
      userId
    }
  }
`;
export const COMMENT_DELETED_SUBSCRIPTION = gql`
  subscription {
    commentDeleted
  }
`;
export const COMMENT_LIKED_SUBSCRIPTION = gql`
  subscription OnCommentLiked($commentId: ID!) {
    commentLiked(commentId: $commentId) {
      _id
      likes
      likedBy {
        _id
        name
      }
    }
  }
`;
export const SKILL_ADDED_SUBSCRIPTION = gql`
  subscription {
    skillAdded {
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
export const SKILL_DELETED_SUBSCRIPTION = gql`
  subscription {
    skillDeleted
  }
`;
export const GAME_CREATED_SUBSCRIPTION = gql`
  subscription OnGameCreated {
    gameCreated {
      _id
      creator {
        _id
        name
      }
      date
      time
      venue
      notes
      opponent
      score
      result
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
      createdAt
      updatedAt
    }
  }
`;
export const GAME_CONFIRMED_SUBSCRIPTION = gql`
  subscription OnGameConfirmed {
    gameConfirmed {
      _id
      status
      notes
      date
      time
      venue
      opponent
    }
  }
`;
export const GAME_UPDATED_SUBSCRIPTION = gql`
  subscription OnGameConfirmed {
    gameUpdated {
      _id
      status
      notes
      date
      time
      venue
      opponent
    }
  }
`;
export const GAME_COMPLETED_SUBSCRIPTION = gql`
  subscription OnGameCompleted {
    gameCompleted {
      _id
      status
      score
      result
      notes
      date
      time
    }
  }
`;
export const GAME_CANCELLED_SUBSCRIPTION = gql`
  subscription OnGameCancelled {
    gameCancelled {
      _id
      status
      notes
      date
      time
      venue
      opponent
    }
  }
`;
export const GAME_DELETED_SUBSCRIPTION = gql`
  subscription OnGameDeleted {
    gameDeleted
  }
`;
export const FORMATION_CREATED_SUBSCRIPTION = gql`
  subscription formationCreated($gameId: ID!) {
    formationCreated(gameId: $gameId) {
      _id
      formationType
      positions {
        slot
        player {
          _id
          name
        }
      }
    }
  }
`;
export const FORMATION_UPDATED_SUBSCRIPTION = gql`
  subscription formationUpdated($gameId: ID!) {
    formationUpdated(gameId: $gameId) {
      _id
      formationType
      positions {
        slot
        player {
          _id
          name
        }
      }
    }
  }
`;
export const FORMATION_DELETED_SUBSCRIPTION = gql`
  subscription formationDeleted($gameId: ID!) {
    formationDeleted(gameId: $gameId)
  }
`;

export const FORMATION_LIKED_SUBSCRIPTION = gql`
  subscription OnFormationLiked($formationId: ID!) {
    formationLiked(formationId: $formationId) {
      _id
      likes
      likedBy {
        _id
        name
      }
    }
  }
`;

export const FORMATION_COMMENT_ADDED_SUBSCRIPTION = gql`
  subscription OnFormationCommentAdded($formationId: ID!) {
    formationCommentAdded(formationId: $formationId) {
      _id
      commentText
      commentAuthor
      createdAt
      updatedAt
      user { _id name }
      likes
      likedBy { _id name }
    }
  }
`;

export const FORMATION_COMMENT_UPDATED_SUBSCRIPTION = gql`
  subscription OnFormationCommentUpdated($formationId: ID!) {
    formationCommentUpdated(formationId: $formationId) {
      _id
      commentText
      updatedAt
      likes
      likedBy { _id name }
    }
  }
`;

// This subscription is used to notify when a formation comment is deleted.
export const FORMATION_COMMENT_DELETED_SUBSCRIPTION = gql`
  subscription OnFormationCommentDeleted($formationId: ID!) {
    formationCommentDeleted(formationId: $formationId)
  }
`;

export const FORMATION_COMMENT_LIKED_SUBSCRIPTION = gql`
  subscription OnFormationCommentLiked($formationId: ID!) {
    formationCommentLiked(formationId: $formationId) {
      _id
      likes
      likedBy { _id name }
    }
  }
`;
export const SKILL_REACTION_UPDATED_SUBSCRIPTION = gql`
  subscription OnSkillReactionUpdated($skillId: ID!) {
    skillReactionUpdated(skillId: $skillId) {
      _id
      reactions {
        emoji
        user { _id name }
      }
    }
  }
`;
