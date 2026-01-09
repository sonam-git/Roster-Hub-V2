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

// Organization Provider Component
export const OrganizationProvider = ({ children }) => {
  const [currentOrganization, setCurrentOrganization] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Update login status when it changes
  useEffect(() => {
    try {
      const loggedIn = Auth.loggedIn();
      setIsLoggedIn(loggedIn);
      if (!loggedIn) {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error checking login status:', err);
      setIsLoggedIn(false);
      setLoading(false);
    }
  }, []);

  // Query user's organizations - only define if logged in
  const { refetch: refetchOrganizations } = useQuery(GET_MY_ORGANIZATIONS, {
    skip: !isLoggedIn,
    fetchPolicy: 'network-only', // Always fetch fresh data
    notifyOnNetworkStatusChange: true,
    context: {
      headers: {
        authorization: isLoggedIn ? `Bearer ${Auth.getToken()}` : '',
      },
    },
    onCompleted: (data) => {
      console.log('Organizations fetched:', data);
      setOrganizations(data?.myOrganizations || []);
      
      // Get current organization from token
      if (Auth.loggedIn()) {
        const profile = Auth.getProfile();
        const orgId = profile?.data?.organizationId;
        
        console.log('Current org ID from token:', orgId);
        
        if (orgId && data?.myOrganizations) {
          const currentOrg = data.myOrganizations.find(org => org._id === orgId);
          if (currentOrg) {
            setCurrentOrganization(currentOrg);
          } else if (data.myOrganizations.length > 0) {
            // Fallback to first organization if current not found
            console.log('Using first organization as fallback');
            setCurrentOrganization(data.myOrganizations[0]);
          }
        } else if (data.myOrganizations && data.myOrganizations.length > 0) {
          // If no orgId in token, use first organization
          console.log('No org in token, using first organization');
          setCurrentOrganization(data.myOrganizations[0]);
        }
      }
      setLoading(false);
    },
    onError: (error) => {
      console.error('Error fetching organizations:', error);
      setLoading(false);
    },
  });

  // Switch organization mutation
  const [switchOrganizationMutation, { loading: switchingOrg }] = useMutation(SWITCH_ORGANIZATION, {
    onCompleted: (data) => {
      // Update token
      const newToken = data.switchOrganization.token;
      localStorage.setItem('id_token', newToken);
      
      // Update current organization
      const newOrg = data.switchOrganization.organization;
      setCurrentOrganization(newOrg);
      
      // Reload page to refresh all queries with new organization context
      window.location.reload();
    },
  });

  // Switch to a different organization
  const switchOrganization = async (organizationId) => {
    try {
      await switchOrganizationMutation({
        variables: { organizationId },
      });
    } catch (error) {
      console.error('Error switching organization:', error);
      throw error;
    }
  };

  // Refresh organizations list
  const refreshOrganizations = async () => {
    try {
      const { data } = await refetchOrganizations();
      setOrganizations(data?.myOrganizations || []);
    } catch (error) {
      console.error('Error refreshing organizations:', error);
    }
  };

  // Check if user has reached limits
  const hasReachedGameLimit = () => {
    if (!currentOrganization) return false;
    return currentOrganization.usage.gameCount >= currentOrganization.limits.maxGames;
  };

  const hasReachedMemberLimit = () => {
    if (!currentOrganization) return false;
    return currentOrganization.usage.memberCount >= currentOrganization.limits.maxMembers;
  };

  // Get remaining capacity
  const getRemainingGames = () => {
    if (!currentOrganization) return 0;
    return Math.max(0, currentOrganization.limits.maxGames - currentOrganization.usage.gameCount);
  };

  const getRemainingMembers = () => {
    if (!currentOrganization) return 0;
    return Math.max(0, currentOrganization.limits.maxMembers - currentOrganization.usage.memberCount);
  };

  // Initialize on mount
  useEffect(() => {
    if (Auth.loggedIn()) {
      const profile = Auth.getProfile();
      const orgId = profile?.data?.organizationId;
      
      // If we have organizations data and an orgId, set current org
      if (orgId && organizations.length > 0 && !currentOrganization) {
        const org = organizations.find(o => o._id === orgId);
        if (org) {
          setCurrentOrganization(org);
        }
      }
    } else {
      setLoading(false);
    }
  }, [organizations, currentOrganization]);

  const value = {
    currentOrganization,
    organizations,
    loading,
    switchingOrg,
    switchOrganization,
    refreshOrganizations,
    hasReachedGameLimit,
    hasReachedMemberLimit,
    getRemainingGames,
    getRemainingMembers,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

export default OrganizationContext;
