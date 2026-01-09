import { gql } from '@apollo/client';

export const CHAT_SEEN_SUBSCRIPTION = gql`
  subscription OnChatSeen($to: ID!) {
    chatSeen(to: $to) {
      id
      seen
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
