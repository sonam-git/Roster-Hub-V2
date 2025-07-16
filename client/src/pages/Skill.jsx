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
    return <div className="text-center mt-4 animate-fade-in">Loading...</div>;
  }
  if (error) {
    return <div className="text-center mt-4 animate-fade-in">Error: {error.message}</div>;
  }

  // Show skills received by the logged-in user from other users (not self-endorsed)
  const filteredSkills = profile.skills?.filter(
    (skill) =>
      skill.recipient?._id === profile._id &&
      skill.skillAuthor !== profile.name
  ) || [];

  return (
    <main className="w-full px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 mx-auto transition-all duration-300 animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-8 mt-8 flex flex-col min-h-[80vh]">
        <div>
          <div className={`rounded-2xl shadow-xl p-8 mb-8 border-2 bg-gradient-to-br
            ${isDarkMode ? "from-gray-900 via-gray-800 to-gray-700 border-gray-700 text-blue-100" : "from-blue-50 via-white to-blue-100 border-blue-300 text-blue-900"}
          `}>
            <h1 className={`text-2xl md:text-3xl font-bold text-center mb-3 tracking-tight drop-shadow-lg ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>Skill Endorsements</h1>
            <p className="text-center text-base font-medium mb-2">
              {profileId ? `${profile.name}'s` : "You & Your"} friends have endorsed <span className="font-bold text-blue-500">{filteredSkills.length || 0}</span> skill{filteredSkills.length === 1 ? "" : "s"}
            </p>
          </div>
          {filteredSkills.length > 0 ? (
            <SkillsList
              skills={filteredSkills}
              isLoggedInUser={!profileId && true}
              profile={profile}
              isDarkMode={isDarkMode}
              columns={1} // Force Skill-list page to always use columns=1
            />
          ) : (
            <div className={`rounded-2xl shadow-xl p-8 border-2 text-center bg-gradient-to-br
              ${isDarkMode ? "from-gray-800 via-gray-700 to-gray-900 border-gray-700 text-blue-100" : "from-blue-100 via-white to-blue-50 border-blue-300 text-blue-900"}
            `}>
              <h3 className="font-bold text-xl md:text-2xl xl:text-3xl mb-2">No endorsed skill yet</h3>
              <p className="italic text-base">Be the first to endorse a skill!</p>
            </div>
          )}
        </div>
        {/* Decorative SVG wave divider */}
        <div className="w-full -mb-2">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-8 md:h-12 animate-wave">
            <path fill={isDarkMode ? '#1e293b' : '#e0f2fe'} fillOpacity="1" d="M0,32L60,37.3C120,43,240,53,360,53.3C480,53,600,43,720,37.3C840,32,960,32,1080,32C1200,32,1320,32,1380,32L1440,32L1440,60L1380,60C1320,60,1200,60,1080,60C960,60,840,60,720,60C600,60,480,60,360,60C240,60,120,60,60,60L0,60Z"></path>
          </svg>
        </div>
        {/* Divider and SkillForm section */}
        <div className="mt-auto">
        
          <div className={`rounded-2xl shadow-xl p-8 border-2 bg-gradient-to-br
            ${isDarkMode ? "from-gray-900 via-gray-800 to-gray-700 border-gray-700 text-blue-100" : "from-blue-50 via-white to-blue-100 border-blue-300 text-blue-900"}
            animate-slide-up
          `}>
            <h2 className="text-lg font-bold mb-4 text-center">Add a Skill</h2>
            <SkillForm profileId={profile._id} />
          </div>
        </div>
      </div>
      {/* Animations */}
      <style>{`
        .animate-fade-in { animation: fadeIn 0.7s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .animate-wave { animation: waveMove 2.5s infinite linear alternate; }
        @keyframes waveMove { 0% { transform: translateX(0); } 100% { transform: translateX(-20px); } }
        .animate-divider { animation: dividerPulse 2s infinite alternate; }
        @keyframes dividerPulse { 0% { opacity: 0.7; } 100% { opacity: 1; } }
        .animate-slide-up { animation: slideUp 0.8s cubic-bezier(.4,0,.2,1); }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: none; } }
      `}</style>
    </main>
  );
};

export default Skill;
