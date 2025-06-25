import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import SkillsList from "../components/SkillsList";
import SkillForm from "../components/SkillForm";
import { QUERY_ME } from "../utils/queries";

const Skill = ({ isDarkMode }) => {
  const { profileId } = useParams();

  const { loading, data, error } = useQuery(QUERY_ME);
  const profile = data?.me || {};

  if (loading) {
    return <div className="text-center mt-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-4">Error: {error.message}</div>;
  }

  return (
    <div className="container mx-auto px-4 mt-5">
      <div className="max-w mx-auto space-y-6">
        {profile.skills?.length > 0 ? (
          <>
            <div className="p-4 mb-4 bg-gray-100 rounded-lg shadow-lg dark:bg-gray-800">
              <h2 className="text-center font-medium text-md md:text-lg xl:text-xl pt-2">
                {profileId ? `${profile.name}'s` : "You & Your"} friends have
                endorsed {profile.skills.length} skill
                {profile.skills.length === 1 ? "" : "s"}
              </h2>
            </div>

            <SkillsList
              skills={profile?.skills || []}
              isLoggedInUser={!profileId && true}
              profile={profile}
              isDarkMode={isDarkMode}
            />
          </>
        ) : (
          <div className="p-4 bg-gray-200 rounded-lg shadow-lg dark:bg-gray-800">
            <h3 className="text-center font-bold text-lg md:text-xl xl:text-2xl">
              No endorsed skill yet
            </h3>
          </div>
        )}

        <div className="p-4 bg-gray-100 dark:bg-gray-600 rounded-lg shadow">
          <SkillForm profileId={profile._id} />
        </div>
      </div>
    </div>
  );
};

export default Skill;
