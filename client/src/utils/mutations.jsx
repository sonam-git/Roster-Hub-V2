import { gql } from "@apollo/client";

export const ADD_PROFILE = gql`
  mutation addProfile($name: String!, $email: String!, $password: String!) {
    addProfile(name: $name, email: $email, password: $password) {
      token
      profile {
        _id
        name
        skills {
          skillText
          skillAuthor
          _id
          createdAt
        }
      }
    }
  }
`;

export const ADD_INFO = gql`
  mutation addInfo(
    $profileId: ID!
    $jerseyNumber: Int!
    $position: String!
    $phoneNumber: String!
  ) {
    addInfo(
      profileId: $profileId
      jerseyNumber: $jerseyNumber
      position: $position
      phoneNumber: $phoneNumber
    ) {
      _id
      name
      jerseyNumber
      position
      phoneNumber
    }
  }
`;

export const UPLOAD_PROFILE_PIC = gql`
  mutation uploadProfilePic($profileId: ID!, $profilePic: Upload!) {
    uploadProfilePic(profileId: $profileId, profilePic: $profilePic) {
      _id
      profilePic
    }
  }
`;

export const ADD_SKILL = gql`
  mutation addSkill($profileId: ID!, $skillText: String!) {
    addSkill(profileId: $profileId, skillText: $skillText) {
      _id
      skillText
      skillAuthor
      createdAt
    }
  }
`;

export const LOGIN_USER = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      profile {
        _id
        name
      }
    }
  }
`;

export const REMOVE_SKILL = gql`
  mutation removeSkill($skillId: ID!) {
    removeSkill(skillId: $skillId) {
      _id
      skillText
      skillAuthor
      createdAt
    }
  }
`;

export const REMOVE_MESSAGE = gql`
  mutation Mutation($messageId: ID!) {
    removeMessage(messageId: $messageId) {
      _id
      text
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($recipientId: ID!, $text: String!) {
    sendMessage(recipientId: $recipientId, text: $text) {
      text
      _id
      createdAt
      recipient {
        _id
        name
      }
      sender {
        _id
        name
      }
    }
  }
`;
export const SAVE_SOCIAL_MEDIA_LINK = gql`
  mutation saveSocialMediaLink($userId: ID!, $type: String!, $link: String!) {
    saveSocialMediaLink(userId: $userId, type: $type, link: $link) {
      _id
      userId
      type
      link
    }
  }
`;

export const UPDATE_NAME_MUTATION = gql`
  mutation UpdateName($name: String!) {
    updateName(name: $name) {
      _id
      name
    }
  }
`;

// Mutation to update the password
export const UPDATE_PASSWORD_MUTATION = gql`
  mutation UpdatePassword($currentPassword: String!, $newPassword: String!) {
    updatePassword(
      currentPassword: $currentPassword
      newPassword: $newPassword
    ) {
      _id
      name
    }
  }
`;
export const DELETE_PROFILE = gql`
  mutation DeleteProfile($profileId: ID!) {
    deleteProfile(profileId: $profileId) {
      _id
    }
  }
`;

export const SEND_RESET_PASSWORD_EMAIL = gql`
  mutation sendResetPasswordEmail($email: String!) {
    sendResetPasswordEmail(email: $email) {
      message
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation resetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword) {
      message
    }
  }
`;

export const ADD_POST = gql`
  mutation addPost($profileId: ID!, $postText: String!) {
    addPost(profileId: $profileId, postText: $postText) {
      _id
      userId
      postText
      postAuthor
      createdAt
      userId
      comments {
        _id
        userId
        commentText
        commentAuthor
        createdAt
      }
    }
  }
`;

export const REMOVE_POST = gql`
  mutation RemovePost($postId: ID!) {
    removePost(postId: $postId) {
      _id
      postText
      postAuthor
    }
  }
`;

export const UPDATE_POST = gql`
  mutation updatePost($postId: ID!, $postText: String!) {
    updatePost(postId: $postId, postText: $postText) {
      _id
      postText
    }
  }
`;

export const ADD_COMMENT = gql`
  mutation addComment($postId: ID!, $commentText: String!) {
    addComment(postId: $postId, commentText: $commentText) {
      _id
      comments {
        _id
        commentText
        commentAuthor
        createdAt
      }
    }
  }
`;

export const UPDATE_COMMENT = gql`
  mutation updateComment($commentId: ID!, $commentText: String!) {
    updateComment(commentId: $commentId, commentText: $commentText) {
      _id
      commentText
      commentAuthor
      createdAt
      userId
    }
  }
`;

export const REMOVE_COMMENT = gql`
  mutation removeComment($postId: ID!, $commentId: ID!) {
    removeComment(postId: $postId, commentId: $commentId) {
      _id
      postText
      postAuthor
      createdAt
      comments {
        commentText
        commentAuthor
        createdAt
      }
    }
  }
`;

export const LIKE_POST = gql`
  mutation likePost($postId: ID!) {
    likePost(postId: $postId) {
      _id
      likes
      likedBy {
        _id
        name
      }
    }
  }
`;

export const RATE_PLAYER = gql`
  mutation ratePlayer($profileId: ID!, $ratingInput: RatingInput!) {
    ratePlayer(profileId: $profileId, ratingInput: $ratingInput) {
      _id
      ratings {
        user
        rating
      }
      averageRating
    }
  }
`;

export const CREATE_CHAT = gql`
  mutation CreateChat($from: ID!, $to: ID!, $content: String!) {
    createChat(from: $from, to: $to, content: $content) {
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
// 1. Create a new game poll
export const CREATE_GAME = gql`
  mutation CreateGame($input: CreateGameInput!) {
    createGame(input: $input) {
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

// 2. Respond (Yes/No) to a game
export const RESPOND_TO_GAME = gql`
  mutation RespondToGame($input: RespondToGameInput!) {
    respondToGame(input: $input) {
      _id
      status
      notes
      responses {
        user {
          _id
          name
        }
        isAvailable
      }
      availableCount
      unavailableCount
    }
  }
`;
// 3. Confirm a pending game (only creator), now with an optional `note` argument
export const CONFIRM_GAME = gql`
  mutation ConfirmGame($gameId: ID!, $note: String) {
    confirmGame(gameId: $gameId, note: $note) {
      _id
      status
      notes
      availableCount
      unavailableCount
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
    }
  }
`;

// 4. Cancel a pending game (only creator), now with an optional `note` argument
export const CANCEL_GAME = gql`
  mutation CancelGame($gameId: ID!, $note: String) {
    cancelGame(gameId: $gameId, note: $note) {
      _id
      status
      notes
      availableCount
      unavailableCount
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
    }
  }
`;

// 5. Unvote or change response to a game
export const UNVOTE_GAME = gql`
  mutation UnvoteGame($gameId: ID!) {
    unvoteGame(gameId: $gameId) {
      _id
      status
      notes
      responses {
        user {
          _id
          name
        }
        isAvailable
      }
      availableCount
      unavailableCount
    }
  }
`;
// 5. Delete a game (only for creator)
export const DELETE_GAME = gql`
  mutation DeleteGame($gameId: ID!) {
    deleteGame(gameId: $gameId) {
      _id
    }
  }
`;
