import { gql } from '@apollo/client';

export const CHAT_SEEN_SUBSCRIPTION = gql`
  subscription OnChatSeen($chatId: ID!, $to: ID!) {
    chatSeen(chatId: $chatId, to: $to) {
      id
      seen
      from { _id }
      to { _id }
      content
      createdAt
    }
  }
`;
