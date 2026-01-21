import React, { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import ProfileList from '../components/ProfileList';
import { QUERY_PROFILES } from '../utils/queries';
import Auth from '../utils/auth'; 
import { ThemeContext } from '../components/ThemeContext';
import { useOrganization } from '../contexts/OrganizationContext';

const Roster = () => {
  const { currentOrganization } = useOrganization();
  const { loading, data, refetch, error } = useQuery(QUERY_PROFILES, {
    variables: {
      organizationId: currentOrganization?._id
    },
    skip: !currentOrganization,
    fetchPolicy: 'network-only', // Always fetch fresh data
  });
  
  // Debug logging
  useEffect(() => {
    if (data) {
      console.log("🔍 Roster Page Debug:", {
        organizationId: currentOrganization?._id,
        organizationName: currentOrganization?.name,
        profilesCount: data?.profiles?.length,
        profiles: data?.profiles,
      });
    }
    if (error) {
      console.error("❌ Roster Query Error:", error);
    }
  }, [data, error, currentOrganization]);
  
  // Refetch when organization changes
  useEffect(() => {
    if (currentOrganization) {
      refetch({ organizationId: currentOrganization._id });
    }
  }, [currentOrganization, refetch]);
  
  const profiles = data?.profiles || [];
  const year = new Date().getFullYear();

  const { isDarkMode } = React.useContext(ThemeContext);
  
  // Check if the user is logged in
  const isLoggedIn = Auth.loggedIn();

  // Loading state for organization
  if (!currentOrganization) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            Loading organization...
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            Loading roster...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-red-50 dark:bg-red-900/20 p-8 rounded-lg max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
            Error Loading Roster
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-4">
            {error.message}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full px-1 sm:px-2 md:px-4 lg:px-6 xl:px-8 2xl:max-w-7xl"> 
      <div className="flex-row justify-center">
        <div className="col-12 "> 
          {/* Conditional rendering based on authentication status */}
          {isLoggedIn && (
            <ProfileList profiles={profiles} title={`The ${currentOrganization.name} Roster ${year}`} isDarkMode={isDarkMode} />
          )}
        </div>
      </div>
    </main>
  );
};

export default Roster;
