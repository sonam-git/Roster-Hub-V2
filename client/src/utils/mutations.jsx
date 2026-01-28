import { gql } from "@apollo/client";
//  Mutation to add a new profile
export const ADD_PROFILE = gql`
  mutation addProfile($name: String!, $email: String!, $password: String!, $organizationName: String, $inviteCode: String) {
    addProfile(name: $name, email: $email, password: $password, organizationName: $organizationName, inviteCode: $inviteCode) {
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
      organization {
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

// Mutation to update jersey number only
export const UPDATE_JERSEY_NUMBER = gql`
  mutation updateJerseyNumber($profileId: ID!, $jerseyNumber: Int!) {
    updateJerseyNumber(profileId: $profileId, jerseyNumber: $jerseyNumber) {
      _id
      jerseyNumber
    }
  }
`;

// Mutation to update position only
export const UPDATE_POSITION = gql`
  mutation updatePosition($profileId: ID!, $position: String!) {
    updatePosition(profileId: $profileId, position: $position) {
      _id
      position
    }
  }
`;

// Mutation to update phone number only
export const UPDATE_PHONE_NUMBER = gql`
  mutation updatePhoneNumber($profileId: ID!, $phoneNumber: String!) {
    updatePhoneNumber(profileId: $profileId, phoneNumber: $phoneNumber) {
      _id
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
  mutation addSkill($profileId: ID!, $skillText: String!, $organizationId: ID!) {
    addSkill(profileId: $profileId, skillText: $skillText, organizationId: $organizationId) {
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
  mutation removeSkill($skillId: ID!, $organizationId: ID!) {
    removeSkill(skillId: $skillId, organizationId: $organizationId) {
      _id
    }
  }
`;
// Mutation to remove a message
export const REMOVE_MESSAGE = gql`
  mutation Mutation($messageId: ID!, $organizationId: ID!) {
    removeMessage(messageId: $messageId, organizationId: $organizationId) {
      _id
      text
    }
  }
`;
// Mutation to delete a conversation history
export const DELETE_CONVERSATION = gql`
  mutation deleteConversation($userId: ID!, $organizationId: ID!) {
    deleteConversation(userId: $userId, organizationId: $organizationId)
  }
`;
// Mutation to send a message
export const SEND_MESSAGE = gql`
  mutation SendMessage($recipientId: ID!, $text: String!, $organizationId: ID!) {
    sendMessage(recipientId: $recipientId, text: $text, organizationId: $organizationId) {
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
  mutation saveSocialMediaLink($userId: ID!, $type: String!, $link: String!, $organizationId: ID!) {
    saveSocialMediaLink(userId: $userId, type: $type, link: $link, organizationId: $organizationId) {
      _id
      userId
      type
      link
    }
  }
`;
// Mutation to remove a social media link
export const REMOVE_SOCIAL_MEDIA_LINK = gql`
  mutation removeSocialMediaLink($userId: ID!, $type: String!, $organizationId: ID!) {
    removeSocialMediaLink(userId: $userId, type: $type, organizationId: $organizationId)
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
// Mutation to send team invite emails
export const SEND_TEAM_INVITE = gql`
  mutation sendTeamInvite($emails: [String!]!, $organizationId: ID!) {
    sendTeamInvite(emails: $emails, organizationId: $organizationId) {
      message
    }
  }
`;
// Mutation to add a post
export const ADD_POST = gql`
  mutation addPost($profileId: ID!, $postText: String!, $organizationId: ID!) {
    addPost(profileId: $profileId, postText: $postText, organizationId: $organizationId) {
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
  mutation RemovePost($postId: ID!, $organizationId: ID!) {
    removePost(postId: $postId, organizationId: $organizationId) {
      _id
      postText
      postAuthor
    }
  }
`;
// Mutation to update a post
export const UPDATE_POST = gql`
  mutation updatePost($postId: ID!, $postText: String!, $organizationId: ID!) {
    updatePost(postId: $postId, postText: $postText, organizationId: $organizationId) {
      _id
      postText
    }
  }
`;
// Mutation to add a comment to a post
export const ADD_COMMENT = gql`
  mutation addComment($postId: ID!, $commentText: String!, $organizationId: ID!) {
    addComment(postId: $postId, commentText: $commentText, organizationId: $organizationId) {
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
  mutation updateComment($commentId: ID!, $commentText: String!, $organizationId: ID!) {
    updateComment(commentId: $commentId, commentText: $commentText, organizationId: $organizationId) {
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
  mutation removeComment($postId: ID!, $commentId: ID!, $organizationId: ID!) {
    removeComment(postId: $postId, commentId: $commentId, organizationId: $organizationId)
  }
`;
// like post mutation
export const LIKE_POST = gql`
  mutation likePost($postId: ID!, $organizationId: ID!) {
    likePost(postId: $postId, organizationId: $organizationId) {
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
  mutation likeComment($commentId: ID!, $organizationId: ID!) {
    likeComment(commentId: $commentId, organizationId: $organizationId) {
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
  mutation ratePlayer($profileId: ID!, $ratingInput: RatingInput!, $organizationId: ID!) {
    ratePlayer(profileId: $profileId, ratingInput: $ratingInput, organizationId: $organizationId) {
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
  mutation CreateChat($from: ID!, $to: ID!, $content: String!, $organizationId: ID!) {
    createChat(from: $from, to: $to, content: $content, organizationId: $organizationId) {
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
  mutation CreateGame($input: CreateGameInput!, $organizationId: ID!) {
    createGame(input: $input, organizationId: $organizationId) {
      _id
      creator {
        _id
        name
      }
      date
      time
      venue
      city
      notes
      opponent
      jerseyColor
      score
      result
      status
      availableCount
      unavailableCount
      createdAt
      updatedAt
      feedbacks {
        _id
        rating
        comment
        user {
          _id
          name
        }
        createdAt
      }
      averageRating
      responses {
        user {
          _id
          name
        }
        isAvailable
      }
      formation {
        _id
        formationType
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
//update game date, time, venue, notes, and status
export const UPDATE_GAME = gql`
  mutation UpdateGame($gameId: ID!, $organizationId: ID!, $input: UpdateGameInput!) {
    updateGame(gameId: $gameId, organizationId: $organizationId, input: $input) {
      _id
      creator {
        _id
        name
      }
      date
      time
      venue
      city
      notes
      opponent
      jerseyColor
      score
      result
      status
      availableCount
      unavailableCount
      createdAt
      updatedAt
      responses {
        user {
          _id
          name
        }
        isAvailable
      }
      feedbacks {
        _id
        rating
        comment
        user {
          _id
          name
        }
        createdAt
      }
      averageRating
      formation {
        _id
        formationType
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
//Respond (Yes/No) to a game
export const RESPOND_TO_GAME = gql`
  mutation RespondToGame($input: RespondToGameInput!, $organizationId: ID!) {
    respondToGame(input: $input, organizationId: $organizationId) {
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
  mutation ConfirmGame($gameId: ID!, $organizationId: ID!, $note: String) {
    confirmGame(gameId: $gameId, organizationId: $organizationId, note: $note) {
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
  mutation CancelGame($gameId: ID!, $organizationId: ID!, $note: String) {
    cancelGame(gameId: $gameId, organizationId: $organizationId, note: $note) {
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
    $organizationId: ID!
    $score: String!
    $result: GameResult!
    $note: String
  ) {
    completeGame(
      gameId: $gameId
      organizationId: $organizationId
      score: $score
      result: $result
      note: $note
    ) {
      _id
      status
      score
      result
      opponent
      jerseyColor
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
  mutation UnvoteGame($gameId: ID!, $organizationId: ID!) {
    unvoteGame(gameId: $gameId, organizationId: $organizationId) {
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
  mutation DeleteGame($gameId: ID!, $organizationId: ID!) {
    deleteGame(gameId: $gameId, organizationId: $organizationId) {
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
  mutation AddFeedback($gameId: ID!, $organizationId: ID!, $comment: String, $rating: Int!, $playerOfTheMatchId: ID) {
    addFeedback(gameId: $gameId, organizationId: $organizationId, comment: $comment, rating: $rating, playerOfTheMatchId: $playerOfTheMatchId) {
      _id
      feedbacks {
        _id
        user { _id name }
        comment
        rating
        playerOfTheMatch { _id name }
      }
      averageRating
    }
  }
`;
// Mutation to create formation for a game
export const CREATE_FORMATION = gql`
  mutation createFormation($gameId: ID!, $formationType: String!, $organizationId: ID!) {
    createFormation(gameId: $gameId, formationType: $formationType, organizationId: $organizationId) {
      _id
      formationType
      positions { slot player { _id name } }
    }
  }
`;
// Mutation to add or update a player to a formation
export const UPDATE_FORMATION = gql`
  mutation updateFormation($gameId: ID!, $positions: [PositionInput!]!, $organizationId: ID!) {
    updateFormation(gameId: $gameId, positions: $positions, organizationId: $organizationId) {
      _id
      formationType
      positions { slot player { _id name } }
    }
  }
`;
// Mutation to delete a formation for a game
export const DELETE_FORMATION = gql`
  mutation deleteFormation($gameId: ID!, $organizationId: ID!) {
    deleteFormation(gameId: $gameId, organizationId: $organizationId)
  }
`;
// Mutation to like a formation
export const LIKE_FORMATION = gql`
  mutation LikeFormation($formationId: ID!, $organizationId: ID!) {
    likeFormation(formationId: $formationId, organizationId: $organizationId) {
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
    $organizationId: ID!
  ) {
    addFormationComment(
      formationId: $formationId
      commentText: $commentText
      organizationId: $organizationId
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
    $organizationId: ID!
  ) {
    updateFormationComment(
      commentId: $commentId
      commentText: $commentText
      organizationId: $organizationId
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
    $organizationId: ID!
  ) {
    deleteFormationComment(
      formationId: $formationId,
      commentId:   $commentId
      organizationId: $organizationId
    )
  }
`;
// Mutation to like a formation comment
export const LIKE_FORMATION_COMMENT = gql`
  mutation LikeFormationComment($commentId: ID!, $organizationId: ID!) {
    likeFormationComment(commentId: $commentId, organizationId: $organizationId) {
      _id
      likes
      likedBy { _id name }
    }
  }
`;
// Mutation to react to a skill with an emoji
export const REACT_TO_SKILL = gql`
  mutation ReactToSkill($skillId: ID!, $emoji: String!, $organizationId: ID!) {
    reactToSkill(skillId: $skillId, emoji: $emoji, organizationId: $organizationId) {
      _id
      reactions {
        emoji
        user { _id name }
      }
    }
  }
`;

// ########## ASSET MUTATIONS ########## //
export const CREATE_ASSET = gql`
  mutation CreateAsset($input: CreateAssetInput!, $organizationId: ID!) {
    createAsset(input: $input, organizationId: $organizationId) {
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

export const UPDATE_ASSET = gql`
  mutation UpdateAsset($assetId: ID!, $input: UpdateAssetInput!, $organizationId: ID!) {
    updateAsset(assetId: $assetId, input: $input, organizationId: $organizationId) {
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

export const DELETE_ASSET = gql`
  mutation DeleteAsset($assetId: ID!, $organizationId: ID!) {
    deleteAsset(assetId: $assetId, organizationId: $organizationId)
  }
`;
