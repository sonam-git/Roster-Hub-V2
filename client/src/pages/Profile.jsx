import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { QUERY_SINGLE_PROFILE, QUERY_ME } from "../utils/queries";

import Auth from "../utils/auth";
import UserProfile from "../components/UserProfile";
import MyProfile from "../components/MyProfile";

const Profile = () => {
  const { profileId } = useParams();

  // Always fetch fresh data for profile views
  const { loading, data, error } = useQuery(
    profileId ? QUERY_SINGLE_PROFILE : QUERY_ME,
    {
      variables: { profileId: profileId },
      fetchPolicy: "network-only",
      pollInterval: 5000, // Refetch every 5 seconds
    }
  );

  // Check if data is returning from the `QUERY_ME` query, then the `QUERY_SINGLE_PROFILE` query
  const profile = data?.me || data?.profile || {};

  // Use React Router's `<Navigate />` component to redirect to personal profile page if username is yours
  if (Auth.loggedIn() && Auth.getProfile().data._id === profileId) {
    return <Navigate to="/me" />;
  }

  if (loading) {
    return <div className="text-center mt-4">Loading...</div>;
  }
  if (error) {
    return <div className="text-center text-red-500 mt-4">Error: {error.message}</div>;
  }
  if (!profile?.name) {
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
    <main className="container mx-auto  lg:mt-5">
      {profileId ? (
        <UserProfile profile={profile} />
      ) : (
        <MyProfile isLoggedInUser={!profileId && true}  />
      )}
    </main>
  );
};

export default Profile;
