import React from "react";
import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { QUERY_ME, QUERY_SINGLE_PROFILE } from "../utils/queries";
import MessageList from "../components/MessageList";

const Message = ({ isDarkMode }) => {
  const { profileId } = useParams();
  const { loading, data, error } = useQuery(
    profileId ? QUERY_SINGLE_PROFILE : QUERY_ME,
    {
      variables: { profileId },
      pollInterval: profileId ? undefined : 5000,
    }
  );

  if (loading) return <div className="text-center mt-4">Loading...</div>;
  if (error) return <div className="text-center mt-4">Error: {error.message}</div>;

  const profile = data?.me || data?.profile || {};

  return (
    <div className="container mx-auto lg:mt-5">
      <MessageList
        messages={profile?.messages || []}
        isLoggedInUser={!profileId}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default Message;