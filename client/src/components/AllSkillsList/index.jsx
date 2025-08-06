import { useQuery, useSubscription, useMutation } from "@apollo/client";
import { QUERY_PROFILES } from "../../utils/queries";
import { SKILL_ADDED_SUBSCRIPTION, SKILL_DELETED_SUBSCRIPTION } from "../../utils/subscription";
import SkillReaction from "../SkillsList/SkillReaction";
import { REACT_TO_SKILL } from "../../utils/mutations";

export default function AllSkillsList({ isDarkMode }) {
  const { loading, error, data } = useQuery(QUERY_PROFILES);
  const [reactToSkill] = useMutation(REACT_TO_SKILL, {
    refetchQueries: [{ query: QUERY_PROFILES }],
  });

  // Subscribe to real-time skill add/delete
  useSubscription(SKILL_ADDED_SUBSCRIPTION, {
    onData: ({ client }) => {
      client.refetchQueries({ include: [QUERY_PROFILES] });
    },
  });
  useSubscription(SKILL_DELETED_SUBSCRIPTION, {
    onData: ({ client }) => {
      client.refetchQueries({ include: [QUERY_PROFILES] });
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className={`text-center p-8 rounded-2xl shadow-2xl backdrop-blur-sm border ${
          isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/80 border-gray-200'
        }`}>
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading skills...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className={`text-center p-8 rounded-2xl shadow-2xl backdrop-blur-sm border ${
          isDarkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-100 border-red-200'
        }`}>
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-xl text-white">⚠️</span>
          </div>
          <p className={`font-semibold ${isDarkMode ? 'text-red-200' : 'text-red-800'}`}>Error loading skills</p>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>{error.message}</p>
        </div>
      </div>
    );
  }

  // Flatten all skills from all profiles
  const allSkills = (data?.profiles || []).flatMap(profile =>
    (profile.skills || []).map(skill => ({ ...skill, profile }))
  );

  if (!allSkills.length) {
    return (
      <div className={`text-center p-8 rounded-2xl shadow-2xl backdrop-blur-sm border mt-8 ${
        isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-400' : 'bg-white/80 border-gray-200 text-gray-500'
      }`}>
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <span className="text-3xl">🎯</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">No Skills Yet</h3>
        <p className="text-sm">Be the first to endorse someone's skills!</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto mb-4 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 mt-8 max-w-7xl">
      {/* Modern Header */}
      <div className={`mb-8 text-center p-6 rounded-2xl backdrop-blur-sm border shadow-lg ${
        isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/80 border-gray-200'
      }`}>
        <h1 className={`text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
          🌟 Endorsed Skills
        </h1>
        <p className={`text-sm md:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Discover the amazing skills endorsed by our team members
        </p>
      </div>

      {/* Skills Grid - Three columns on medium+ screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {allSkills.map(skill => (
          <div
            key={skill._id}
            className={`group relative rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden border backdrop-blur-sm ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700 hover:border-gray-600' 
                : 'bg-gradient-to-br from-white/90 to-blue-50/90 border-gray-200 hover:border-blue-300'
            }`}
            style={{ minHeight: '160px' }}
          >
            {/* Modern header with glassmorphism effect */}
            <div
              className={`px-4 py-3 backdrop-blur-sm border-b relative ${
                isDarkMode
                  ? "bg-gray-800/80 text-gray-100 border-gray-700"
                  : "bg-white/80 text-gray-800 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  }`}>
                    {skill.skillAuthor[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-sm">
                      {skill.skillAuthor[0].toUpperCase() + skill.skillAuthor.slice(1)}
                    </span>
                    <span className={`ml-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      endorsed
                    </span>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}>
                  {skill.recipient?.name ? skill.recipient.name : "—"}
                </div>
              </div>
            </div>

            {/* Skill content with modern typography */}
            <div
              className={`flex-1 flex items-center justify-between p-4 min-h-[80px] ${
                isDarkMode ? "bg-gradient-to-r from-gray-800/60 to-gray-900/60" : "bg-gradient-to-r from-blue-50/60 to-white/60"
              }`}
            >
              <div className="flex-1">
                <h3 className={`text-lg font-bold leading-tight ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  {skill.skillText[0].toUpperCase() + skill.skillText.slice(1)}
                </h3>
              </div>
              {skill.reactions && skill.reactions.length > 0 && (
                <div className="flex items-center gap-1 ml-3">
                  <div className="flex -space-x-1">
                    {skill.reactions.slice(0, 3).map((r, i) => (
                      <span 
                        key={i} 
                        title={r.user?.name || ""} 
                        className="text-2xl bg-white rounded-full shadow-sm border-2 border-white"
                      >
                        {r.emoji}
                      </span>
                    ))}
                  </div>
                  {skill.reactions.length > 3 && (
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      +{skill.reactions.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Modern footer with actions */}
            <div className={`px-4 py-3 border-t flex items-center justify-between ${
              isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50/80 border-gray-200'
            }`}>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600 shadow-sm'
              }`}>
                {skill.createdAt}
              </span>
              <div className="flex items-center">
                <SkillReaction 
                  onReact={emoji => reactToSkill({ variables: { skillId: skill._id, emoji } })}
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
