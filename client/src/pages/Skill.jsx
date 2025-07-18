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
    return <div className="text-center mt-4 animate-fade-in">Loading...</div>;
  }
  if (error) {
    return (
      <div className="text-center mt-4 animate-fade-in">
        Error: {error.message}
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
    <main className="w-full px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 mx-auto transition-all duration-300 animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-8 mt-8 flex flex-col min-h-[80vh]">
        <div>
          <div
            className={`rounded-2xl shadow-xl p-8 mb-8 border-2 bg-gradient-to-br
            ${
              isDarkMode
                ? "from-gray-900 via-gray-800 to-gray-700 border-gray-700 text-blue-100"
                : "from-blue-50 via-white to-blue-100 border-blue-300 text-blue-900"
            }
          `}
          >
            <h1
              className={`text-2xl md:text-3xl font-bold text-center mb-3 tracking-tight drop-shadow-lg ${
                isDarkMode ? "text-blue-200" : "text-blue-700"
              }`}
            >
              Skill Endorsements
            </h1>
            <p className="text-center text-base font-medium mb-2">
              {profileId ? `${profile.name}'s` : "Your"} friends have
              endorsed you{" "}  
              <span className="font-bold text-blue-500">
                {filteredSkills.length || 0}
              </span>{" "}
              skill{filteredSkills.length === 1 ? "" : "s"}
            </p>
          </div>
          {filteredSkills.length > 0 && (
            <div className="rounded-2xl shadow-2xl border-2 p-6 bg-gradient-to-br from-blue-100 via-white to-blue-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
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
      </div>
    </main>
  );
};

export default Skill;
