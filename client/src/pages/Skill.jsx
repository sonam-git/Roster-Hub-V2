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
    <main className="w-full px-4 sm:px-6 lg:px-8 mx-auto transition-all duration-300">
      <div className="max-w-6xl mx-auto space-y-6 mt-8 mb-8">
        {/* Modern Header */}
        <div
          className={`relative rounded-3xl shadow-2xl p-6 sm:p-8 border-2 overflow-hidden ${
            isDarkMode
              ? "bg-gradient-to-br from-gray-800 via-gray-900 to-black border-gray-600 text-white"
              : "bg-gradient-to-br from-white via-blue-50 to-indigo-100 border-blue-300 text-gray-800"
          }`}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 animate-pulse"></div>
          
          <div className="relative z-1 text-center">
            <div className="flex items-center justify-center gap-3 mb-4 ">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
              }`}>
                <span className="text-2xl text-white">🎯</span>
              </div>
              <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight ${
                isDarkMode ? 'text-blue-200' : 'text-blue-700'
              }`}>
                Skill Endorsements
              </h1>
            </div>
            
            <div className={`p-4 rounded-2xl border backdrop-blur-sm ${
              isDarkMode 
                ? 'bg-gray-800/30 border-gray-700' 
                : 'bg-white/70 border-blue-200'
            }`}>
              <p className="text-base sm:text-lg font-medium mb-2">
                {profileId ? `${profile.name}'s` : "Your"} friends have endorsed you
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className={`text-2xl sm:text-3xl font-bold ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {filteredSkills.length || 0}
                </span>
                <span className="text-base sm:text-lg">
                  skill{filteredSkills.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Grid */}
        {filteredSkills.length > 0 && (
          <div className={`rounded-2xl shadow-xl border-2 p-4 sm:p-6 ${
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
