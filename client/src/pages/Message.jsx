import React, { useEffect } from "react";
import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { QUERY_ME, QUERY_SINGLE_PROFILE } from "../utils/queries";
import { useOrganization } from "../contexts/OrganizationContext";
import Spinner from "../components/Spinner";
import MessageList from "../components/MessageList";

const Message = ({ isDarkMode }) => {
  const { profileId } = useParams();
  const { currentOrganization } = useOrganization();
  
  const { loading, data, error, refetch } = useQuery(
    profileId ? QUERY_SINGLE_PROFILE : QUERY_ME,
    {
      variables: { 
        profileId,
        organizationId: currentOrganization?._id 
      },
      skip: !currentOrganization,
      pollInterval: profileId ? undefined : 5000,
    }
  );
  
  // Refetch when organization changes
  useEffect(() => {
    if (currentOrganization) {
      refetch({ 
        profileId,
        organizationId: currentOrganization._id 
      });
    }
  }, [currentOrganization, profileId, refetch]);

  // Loading state for organization
  if (!currentOrganization) {
    return <Spinner fullScreen />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 lg:pt-24">
        <div className={`text-center p-8 rounded-2xl shadow-xl ${
          isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading messages...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 lg:pt-24">
        <div className={`text-center p-8 rounded-2xl shadow-xl ${
          isDarkMode ? 'bg-red-900/20 border border-red-700' : 'bg-red-100 border border-red-200'
        }`}>
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-xl text-white">⚠️</span>
          </div>
          <p className={`font-semibold mb-2 ${isDarkMode ? 'text-red-200' : 'text-red-800'}`}>
            Error Loading Messages
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  const profile = data?.me || data?.profile || {};

  return (
    <div className={`min-h-screen transition-colors duration-200 pt-20 lg:pt-24 ${
      isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
        <MessageList
          messages={profile?.messages || []}
          isLoggedInUser={!profileId}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
};

export default Message;