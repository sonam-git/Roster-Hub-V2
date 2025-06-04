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



