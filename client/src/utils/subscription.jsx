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
    }
  }
`;
export const SKILL_DELETED_SUBSCRIPTION = gql`
  subscription {
    skillDeleted
  }
`;
