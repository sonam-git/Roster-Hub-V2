import { gql } from '@apollo/client';

export const MARK_CHAT_AS_SEEN = gql`
  mutation MarkChatAsSeen($userId: ID!) {
    markChatAsSeen(userId: $userId)
  }
`;
