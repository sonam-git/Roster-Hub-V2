import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import SkillsList from "../components/SkillsList";
import { QUERY_ME } from "../utils/queries";

const Skill = ({ isDarkMode }) => {
  const { profileId } = useParams();

  const { loading, data, error } = useQuery(QUERY_ME);
  const profile = data?.me || {};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className={`text-center p-8 rounded-2xl shadow-lg ${
          isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
        }`}>
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading skills...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
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
    <main className="mx-auto w-full px-1 sm:px-2 md:px-4 lg:px-6 xl:px-8 2xl:max-w-7xl transition-all duration-300">
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
        {filteredSkills.length > 0 && (
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
        )}
      </div>
    </main>
  );
};

export default Skill;
