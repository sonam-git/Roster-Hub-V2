import { gql } from '@apollo/client';

export const ONLINE_STATUS_CHANGED_SUBSCRIPTION = gql`
  subscription onlineStatusChanged($profileId: ID!) {
    onlineStatusChanged(profileId: $profileId) {
      _id
      online
    }
  }
`;
