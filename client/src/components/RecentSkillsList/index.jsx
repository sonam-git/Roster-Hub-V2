// src/components/RecentSkillsList.jsx
import React, { useContext, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_SKILLS } from "../../utils/queries";
import {
  SKILL_ADDED_SUBSCRIPTION,
  SKILL_DELETED_SUBSCRIPTION,
} from "../../utils/subscription";
import { ThemeContext } from "../ThemeContext";
import { useOrganization } from "../../contexts/OrganizationContext";
import { FaFutbol } from "react-icons/fa";
import SkillReaction from "../SkillsList/SkillReaction";
import { REACT_TO_SKILL } from "../../utils/mutations";

export default function RecentSkillsList() {
  const { isDarkMode } = useContext(ThemeContext);
  const { currentOrganization } = useOrganization();
  const { loading, error, data, subscribeToMore } = useQuery(GET_SKILLS);
  const [reactToSkill] = useMutation(REACT_TO_SKILL);

  useEffect(() => {
    const unsubAdd = subscribeToMore({
      document: SKILL_ADDED_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        const added = subscriptionData.data?.skillAdded;
        if (!added) return prev;
        if (prev.skills.find((s) => s._id === added._id)) return prev;
        return { skills: [added, ...prev.skills] };
      },
    });
    const unsubDel = subscribeToMore({
      document: SKILL_DELETED_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        const deletedId = subscriptionData.data?.skillDeleted;
        if (!deletedId) return prev;
        return {
          skills: prev.skills.filter((s) => s._id !== deletedId),
        };
      },
    });
    return () => {
      unsubAdd();
      unsubDel();
    };
  }, [subscribeToMore]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`text-center p-8 rounded-2xl shadow-2xl backdrop-blur-sm border ${
          isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/80 border-gray-200'
        }`}>
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading latest skills...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
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

  // safely grab the array (or default to [])
  const skills = Array.isArray(data?.skills) ? data.skills : [];

  // Filter out skills with missing author or text, and reactions with missing user
  const validSkills = skills.filter(
    (skill) => skill.skillAuthor && skill.skillText
  );

  return (
    <div className="w-full mt-6">
      {/* Modern Header */}
      <div className={`mb-6 text-center p-3 sm:p-4 ${
        isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/80 border-gray-200'
      }`}>
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Recent skill endorsements from team members.
        </p>
      </div>

      {validSkills.length === 0 ? (
        <div className={`rounded-2xl shadow-xl p-4 sm:p-6 border-2 text-center backdrop-blur-sm ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700 text-gray-100"
            : "bg-gradient-to-br from-white/90 to-blue-50/90 border-blue-200 text-blue-900"
        }`}>
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-gray-700' : 'bg-blue-100'
          }`}>
            <FaFutbol className={`text-2xl ${isDarkMode ? 'text-gray-400' : 'text-blue-500'}`} />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Skills Yet</h3>
          <p className="text-sm opacity-75">Skills will be displayed here when teammates start endorsing each other.</p>
        </div>
      ) : (
        <div className="w-full">
          <div className="max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {validSkills
                .slice()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 6)
                .map((skill, index) => (
                <div
                  key={skill._id}
                  className={`group relative rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden border backdrop-blur-sm ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700 hover:border-gray-600' 
                      : 'bg-gradient-to-br from-white/90 to-blue-50/90 border-gray-200 hover:border-blue-300'
                  }`}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.5s ease-out forwards'
                  }}
                >
                  {/* Modern header with glassmorphism effect */}
                  <div className={`px-4 py-3 backdrop-blur-sm border-b relative ${
                    isDarkMode
                      ? "bg-gray-800/80 text-gray-100 border-gray-700"
                      : "bg-white/80 text-gray-800 border-gray-200"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                        }`}>
                          {skill.skillAuthor[0].toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-sm truncate block">
                            {skill.skillAuthor[0].toUpperCase() + skill.skillAuthor.slice(1)}
                          </span>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            endorsed
                          </span>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${
                        isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {skill.recipient?.name ? (
                          <span className="truncate max-w-[80px] inline-block">
                            {skill.recipient.name}
                          </span>
                        ) : (
                          "—"
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Skill content with modern typography */}
                  <div className={`flex-1 flex items-center justify-between p-4 min-h-[70px] ${
                    isDarkMode ? "bg-gradient-to-r from-gray-800/60 to-gray-900/60" : "bg-gradient-to-r from-blue-50/60 to-white/60"
                  }`}>
                    <div className="flex-1 min-w-0 pr-3">
                      <h3 className={`text-base font-bold leading-tight line-clamp-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        {skill.skillText[0].toUpperCase() + skill.skillText.slice(1)}
                      </h3>
                    </div>
                    {skill.reactions && skill.reactions.length > 0 && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <div className="flex -space-x-1">
                          {skill.reactions.filter(r => r.user).slice(0, 2).map((r, i) => (
                            <span 
                              key={i} 
                              title={r.user?.name || "Unknown User"} 
                              className="text-xl bg-gray-50 rounded-full shadow-sm border-2 border-white"
                            >
                              {r.emoji}
                            </span>
                          ))}
                        </div>
                        {skill.reactions.filter(r => r.user).length > 2 && (
                          <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            +{skill.reactions.filter(r => r.user).length - 2}
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
                      isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600 shadow-sm'
                    }`}>
                      {skill.createdAt}
                    </span>
                    <div className="flex items-center">
                      <SkillReaction
                        onReact={(emoji) => {
                          if (!currentOrganization) {
                            console.error('No organization selected');
                            return;
                          }
                          reactToSkill({ 
                            variables: { 
                              skillId: skill._id, 
                              emoji,
                              organizationId: currentOrganization._id
                            } 
                          });
                        }}
                        isDarkMode={isDarkMode}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}