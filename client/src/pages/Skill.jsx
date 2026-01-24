import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import SkillsList from "../components/SkillsList";
import Spinner from "../components/Spinner";
import { QUERY_ME } from "../utils/queries";
import { useOrganization } from "../contexts/OrganizationContext";

const Skill = ({ isDarkMode }) => {
  const { profileId } = useParams();
  const { currentOrganization } = useOrganization();

  const { loading, data, error, refetch } = useQuery(QUERY_ME, {
    variables: {
      organizationId: currentOrganization?._id
    },
    skip: !currentOrganization
  });
  
  // Refetch when organization changes
  useEffect(() => {
    if (currentOrganization) {
      refetch({ organizationId: currentOrganization._id });
    }
  }, [currentOrganization, refetch]);
  
  const profile = data?.me || {};

  // Loading state for organization
  if (!currentOrganization) {
    return <Spinner />;
  }

  if (loading) {
    return <Spinner />;
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] pt-20 lg:pt-24">
        <div className={`text-center p-8 rounded-2xl shadow-lg ${
          isDarkMode ? 'bg-red-900/30 text-red-200' : 'bg-red-100 text-red-800'
        }`}>
          <span className="text-3xl mb-4 block">⚠️</span>
          <h3 className="text-lg font-semibold mb-2">Error Loading Skills</h3>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  // Show skills received by the logged-in user from other users (not self-endorsed)
  const filteredSkills =
    profile.skills?.filter(
      (skill) =>
        skill.recipient?._id === profile._id &&
        skill.skillAuthor !== profile.name
    ) || [];

  return (
    <main className="mx-auto w-full pt-20 lg:pt-24 px-1 sm:px-2 md:px-4 lg:px-6 xl:px-8 2xl:max-w-7xl transition-all duration-300">
      <div className="w-full mx-auto space-y-6 mt-4 mb-6">
        {/* Simple Header like Game.jsx */}
        <div className={`mb-6 text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          <h1 className="text-2xl sm:text-3xl font-bold dark:text-white bg-clip-text">
            Skill Endorsements
          </h1>
          <p className={`text-sm md:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            View skills endorsed by your teammates and track your progress
          </p>
        </div>

        {/* Skills Grid */}
        {filteredSkills.length > 0 ? (
          <div className={`rounded-2xl shadow-xl border-2 p-2 sm:p-3 lg:p-4 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
              : 'bg-gradient-to-br from-white to-blue-50 border-gray-200'
          }`}>
            <SkillsList
              profile={profile}
              skills={filteredSkills}
              isLoggedInUser={!profileId && true}
              isDarkMode={isDarkMode}
              columns={2}
            />
          </div>
        ) : (
          <div className={`p-8 sm:p-12 text-center `}>
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-6 flex items-center justify-center mx-auto ${
              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'
            }`}>
              <span className="text-3xl sm:text-4xl">⚡</span>
            </div>
            <h3 className={`text-xl sm:text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              No Skills Yet
            </h3>
            <p className={`text-base sm:text-lg leading-relaxed max-w-2xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Your friends haven't endorsed you yet. Once they endorsed it will display here, where you can react to the skill for appreciation, also delete if you don't want to see it.
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Skill;
