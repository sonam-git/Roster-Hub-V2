import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import Auth from '../utils/auth';

// GraphQL Queries
export const GET_MY_ORGANIZATIONS = gql`
  query MyOrganizations {
    myOrganizations {
      _id
      name
      slug
      logo
      description
      isActive
      subscription {
        plan
        status
      }
      limits {
        maxMembers
        maxGames
        maxStorage
      }
      usage {
        memberCount
        gameCount
        storageUsed
      }
      createdAt
      updatedAt
    }
  }
`;

export const SWITCH_ORGANIZATION = gql`
  mutation SwitchOrganization($organizationId: ID!) {
    switchOrganization(organizationId: $organizationId) {
      token
      profile {
        _id
        name
        email
      }
      organization {
        _id
        name
        slug
        logo
        description
        isActive
        subscription {
          plan
          status
        }
        limits {
          maxMembers
          maxGames
          maxStorage
        }
        usage {
          memberCount
          gameCount
          storageUsed
        }
      }
    }
  }
`;

// Create Context
const OrganizationContext = createContext();

// Export as named export as well for components that need it
export { OrganizationContext };

// Custom hook to use the Organization Context
export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider');
  }
  return context;
};

// Organization Provider Component - SIMPLIFIED FOR DEBUGGING
export const OrganizationProvider = ({ children }) => {
  console.log('OrganizationProvider: Starting to render');
  
  // Simple default values
  const value = {
    currentOrganization: null,
    organizations: [],
    loading: false,
    switchingOrg: false,
    switchOrganization: async () => { console.log('switchOrganization called'); },
    refreshOrganizations: async () => { console.log('refreshOrganizations called'); },
    hasReachedGameLimit: () => false,
    hasReachedMemberLimit: () => false,
    getRemainingGames: () => 100,
    getRemainingMembers: () => 100,
  };

  console.log('OrganizationProvider: Rendering with value:', value);

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

export default OrganizationContext;
