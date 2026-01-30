import React, { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { QUERY_SINGLE_PROFILE, QUERY_ME } from "../utils/queries";
import { useOrganization } from "../contexts/OrganizationContext";
import Spinner from "../components/Spinner";

import Auth from "../utils/auth";
import UserProfile from "../components/UserProfile";
import MyProfile from "../components/MyProfile";

const Profile = () => {
  const { profileId } = useParams();
  const { currentOrganization } = useOrganization();

  // Debug logging for URL params and organization
  console.log('🔍 Profile Page Debug:', {
    profileId,
    organizationId: currentOrganization?._id,
    organizationName: currentOrganization?.name,
    hasOrganization: !!currentOrganization
  });

  // If there is no `profileId` in the URL as a parameter, execute the `QUERY_ME` query instead for the logged in user's information
  const { loading, data, error, refetch } = useQuery(
    profileId ? QUERY_SINGLE_PROFILE : QUERY_ME,
    {
      variables: { 
        profileId: profileId,
        organizationId: currentOrganization?._id 
      },
      skip: !currentOrganization,
      fetchPolicy: 'network-only' // Always fetch fresh data to avoid cache issues
    }
  );
  
  // Debug logging for query results
  useEffect(() => {
    console.log('🔍 Profile Query Debug:', {
      loading,
      hasData: !!data,
      hasError: !!error,
      errorMessage: error?.message,
      profileData: data?.profile,
      meData: data?.me
    });
  }, [loading, data, error]);
  
  // Refetch when organization changes
  useEffect(() => {
    if (currentOrganization) {
      console.log('🔄 Refetching profile with:', {
        profileId,
        organizationId: currentOrganization._id
      });
      refetch({ 
        profileId: profileId,
        organizationId: currentOrganization._id 
      });
    }
  }, [currentOrganization, profileId, refetch]);

  // Check if data is returning from the `QUERY_ME` query, then the `QUERY_SINGLE_PROFILE` query
  const profile = data?.me || data?.profile || {};

  // Use React Router's `<Navigate />` component to redirect to personal profile page if username is yours
  if (Auth.loggedIn() && Auth.getProfile().data._id === profileId) {
    return <Navigate to="/me" />;
  }

  // Loading state for organization
  if (!currentOrganization) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
      <Spinner />
      </div>
    );
  }

  if (loading) {
    return    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
      <Spinner />
      </div>
  }

  if (error) {
    return <div className="text-center text-red-500 mt-4">Error: {error.message}</div>;
  }

  // Only show fallback if not loading and not error
  if (!profile?.name && !loading && !error) {
    return (
      <div className="text-center mt-4">
        <h4>
          You need to be logged in to see your profile page. Use the navigation
          links above to sign up or log in!
        </h4>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full px-1 sm:px-2 md:px-4 lg:px-6 xl:px-8 2xl:max-w-7xl pt-20 lg:pt-24">
      {profileId ? (
        <UserProfile profile={profile} />
      ) : (
        <MyProfile isLoggedInUser={!profileId && true}  />
      )}
    </main>
  );
};

export default Profile;
