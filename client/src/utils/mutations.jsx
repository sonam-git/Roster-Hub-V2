import { gql } from "@apollo/client";
//  Mutation to add a new profile
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
// Mutation to add additional information to a profile
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
// Mutation to upload a profile picture
export const UPLOAD_PROFILE_PIC = gql`
  mutation uploadProfilePic($profileId: ID!, $profilePic: Upload!) {
    uploadProfilePic(profileId: $profileId, profilePic: $profilePic) {
      _id
      profilePic
    }
  }
`;
// Mutation to add a skill
export const ADD_SKILL = gql`
  mutation addSkill($profileId: ID!, $skillText: String!) {
    addSkill(profileId: $profileId, skillText: $skillText) {
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
// Mutation to login a user
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
// Mutation to update a skill
export const REMOVE_SKILL = gql`
  mutation removeSkill($skillId: ID!) {
    removeSkill(skillId: $skillId) {
      _id
    }
  }
`;
// Mutation to remove a message
export const REMOVE_MESSAGE = gql`
  mutation Mutation($messageId: ID!) {
    removeMessage(messageId: $messageId) {
      _id
      text
    }
  }
`;
// Mutation to delete a conversation history
export const DELETE_CONVERSATION = gql`
  mutation deleteConversation($userId: ID!) {
    deleteConversation(userId: $userId)
  }
`;
// Mutation to send a message
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
// Mutation to save a social media link
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
// Mutation to remove a social media link
export const REMOVE_SOCIAL_MEDIA_LINK = gql`
  mutation removeSocialMediaLink($userId: ID!, $type: String!) {
    removeSocialMediaLink(userId: $userId, type: $type)
  }
`;
// Mutation to update the name
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
// Mutation to delete a profile
export const DELETE_PROFILE = gql`
  mutation DeleteProfile($profileId: ID!) {
    deleteProfile(profileId: $profileId) {
      _id
    }
  }
`;
// Mutation to send a reset password email
export const SEND_RESET_PASSWORD_EMAIL = gql`
  mutation sendResetPasswordEmail($email: String!) {
    sendResetPasswordEmail(email: $email) {
      message
    }
  }
`;
// Mutation to reset the password using a token
export const RESET_PASSWORD = gql`
  mutation resetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword) {
      message
    }
  }
`;
// Mutation to add a post
export const ADD_POST = gql`
  mutation addPost($profileId: ID!, $postText: String!) {
    addPost(profileId: $profileId, postText: $postText) {
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
        userId
        commentText
        commentAuthor
        createdAt
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
// Mutation to remove a post
export const REMOVE_POST = gql`
  mutation RemovePost($postId: ID!) {
    removePost(postId: $postId) {
      _id
      postText
      postAuthor
    }
  }
`;
// Mutation to update a post
export const UPDATE_POST = gql`
  mutation updatePost($postId: ID!, $postText: String!) {
    updatePost(postId: $postId, postText: $postText) {
      _id
      postText
    }
  }
`;
// Mutation to add a comment to a post
export const ADD_COMMENT = gql`
  mutation addComment($postId: ID!, $commentText: String!) {
    addComment(postId: $postId, commentText: $commentText) {
      _id
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
  }
`;
// Mutation to update a comment on a post
export const UPDATE_COMMENT = gql`
  mutation updateComment($commentId: ID!, $commentText: String!) {
    updateComment(commentId: $commentId, commentText: $commentText) {
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
// Mutation to remove a comment from a post
export const REMOVE_COMMENT = gql`
  mutation removeComment($postId: ID!, $commentId: ID!) {
    removeComment(postId: $postId, commentId: $commentId)
  }
`;
// like post mutation
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
// like post mutation
export const LIKE_COMMENT = gql`
  mutation likeComment($commentId: ID!) {
    likeComment(commentId: $commentId) {
      _id
      likes
          likedBy {
            _id
            name
          }
    }
  }
`;
// rating mutation
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
// create chat
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
//Create a new game poll
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
      opponent
      score
      result
      status
      availableCount
      unavailableCount
    }
  }
`;
//update game date, time, venue, notes, and status
export const UPDATE_GAME = gql`
  mutation UpdateGame($gameId: ID!, $input: UpdateGameInput!) {
    updateGame(gameId: $gameId, input: $input) {
      _id
      date
      time
      venue
      notes
      status
      opponent
      availableCount
      unavailableCount
      creator { _id name }
    }
  }
`;
//Respond (Yes/No) to a game
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
//Confirm a pending game (only creator), now with an optional `note` argument
export const CONFIRM_GAME = gql`
  mutation ConfirmGame($gameId: ID!, $note: String) {
    confirmGame(gameId: $gameId, note: $note) {
      _id
      status
      notes
      opponent
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
//Cancel a pending game (only creator), now with an optional `note` argument
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
//complete a game (only creator),
export const COMPLETE_GAME = gql`
  mutation CompleteGame(
    $gameId: ID!
    $score: String!
    $result: GameResult!
    $note: String
  ) {
    completeGame(
      gameId: $gameId
      score: $score
      result: $result
      note: $note
    ) {
      _id
      status
      score
      result
      opponent
      notes 
      availableCount
      unavailableCount
      creator { _id name }
      responses {
        user { _id name }
        isAvailable
      }
    }
  }
`;
//Unvote or change response to a game
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
//Delete a game (only for creator)
export const DELETE_GAME = gql`
  mutation DeleteGame($gameId: ID!) {
    deleteGame(gameId: $gameId) {
      _id
    }
  }
`;
// Login with Google mutation
export const LOGIN_WITH_GOOGLE = gql`
  mutation loginWithGoogle($idToken: String!) {
    loginWithGoogle(idToken: $idToken) {
      token
      profile {
        _id
        name
        email
        profilePic
      }
    }
  }
`;
// Mutation to add feedback for a game
export const ADD_FEEDBACK = gql`
  mutation AddFeedback($gameId: ID!, $comment: String, $rating: Int!) {
    addFeedback(gameId: $gameId, comment: $comment, rating: $rating) {
      _id
      feedbacks {
        _id
        user { _id name }
        comment
        rating
      }
      averageRating
    }
  }
`;
// Mutation to create formation for a game
export const CREATE_FORMATION = gql`
  mutation createFormation($gameId: ID!, $formationType: String!) {
    createFormation(gameId: $gameId, formationType: $formationType) {
      _id
      formationType
      positions { slot player { _id name } }
    }
  }
`;
// Mutation to add or update a player to a formation
export const UPDATE_FORMATION = gql`
  mutation updateFormation($gameId: ID!, $positions: [PositionInput!]!) {
    updateFormation(gameId: $gameId, positions: $positions) {
      _id
      formationType
      positions { slot player { _id name } }
    }
  }
`;
// Mutation to delete a formation for a game
export const DELETE_FORMATION = gql`
  mutation deleteFormation($gameId: ID!) {
    deleteFormation(gameId: $gameId)
  }
`;
// Mutation to like a formation
export const LIKE_FORMATION = gql`
  mutation LikeFormation($formationId: ID!) {
    likeFormation(formationId: $formationId) {
      _id
      likes
      likedBy {
        _id
        name
      }
    }
  }
`;
// Mutation to add a comment to a formation
export const ADD_FORMATION_COMMENT = gql`
  mutation AddFormationComment(
    $formationId: ID!
    $commentText: String!
  ) {
    addFormationComment(
      formationId: $formationId
      commentText: $commentText
    ) {
      _id
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
    }
  }
`;
// Mutation to update a formation comment
export const UPDATE_FORMATION_COMMENT = gql`
  mutation UpdateFormationComment(
    $commentId: ID!
    $commentText: String!
  ) {
    updateFormationComment(
      commentId: $commentId
      commentText: $commentText
    ) {
      _id
      commentText
      updatedAt
      likes
      likedBy { _id name }
    }
  }
`;

// Mutation to delete a formation comment
export const DELETE_FORMATION_COMMENT = gql`
  mutation DeleteFormationComment(
    $formationId: ID!
    $commentId:   ID!
  ) {
    deleteFormationComment(
      formationId: $formationId,
      commentId:   $commentId
    )
  }
`;
// Mutation to like a formation comment
export const LIKE_FORMATION_COMMENT = gql`
  mutation LikeFormationComment($commentId: ID!) {
    likeFormationComment(commentId: $commentId) {
      _id
      likes
      likedBy { _id name }
    }
  }
`;

