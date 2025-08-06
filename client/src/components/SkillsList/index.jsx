// src/components/SkillsList.jsx
import { useState, useEffect, useTransition, useDeferredValue } from "react";
import { useMutation, useSubscription, useApolloClient } from "@apollo/client";
import { REMOVE_SKILL, REACT_TO_SKILL } from "../../utils/mutations";
import { GET_SKILLS } from "../../utils/queries";
import {
  SKILL_ADDED_SUBSCRIPTION,
  SKILL_DELETED_SUBSCRIPTION,
  SKILL_REACTION_UPDATED_SUBSCRIPTION,
} from "../../utils/subscription";
import { AiOutlineDelete } from "react-icons/ai";
import Auth from "../../utils/auth";
import SkillReaction from "./SkillReaction";

const PAGE_SIZE = 6; // 3 rows x 2 columns

const SkillsList = ({
  profile,
  skills: initialSkills,
  isLoggedInUser = false,
  isDarkMode,
  columns = 0, // default to 0 columns
}) => {
  const apolloClient = useApolloClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [localSkills, setLocalSkills] = useState(initialSkills);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  // keep localSkills in sync
  useEffect(() => {
    setLocalSkills(initialSkills);
  }, [initialSkills]);

  // real-time add / remove
  useSubscription(SKILL_ADDED_SUBSCRIPTION, {
    onData: ({ data }) => {
      const added = data.data?.skillAdded;
      if (added && !localSkills.some((s) => s._id === added._id)) {
        setLocalSkills((prev) => [added, ...prev]);
      }
    },
  });
  useSubscription(SKILL_DELETED_SUBSCRIPTION, {
    onData: ({ data }) => {
      const deletedId = data.data?.skillDeleted;
      if (deletedId) {
        setLocalSkills((prev) => prev.filter((s) => s._id !== deletedId));
      }
    },
  });

  // Subscribe to reaction updates for each skill
  useEffect(() => {
    if (!localSkills.length) return;
    const unsubscribers = localSkills.map(
      (skill) =>
        apolloClient &&
        apolloClient
          .subscribe({
            query: SKILL_REACTION_UPDATED_SUBSCRIPTION,
            variables: { skillId: skill._id },
          })
          .subscribe({
            next({ data }) {
              const updated = data?.skillReactionUpdated;
              if (updated) {
                setLocalSkills((prev) =>
                  prev.map((s) =>
                    s._id === updated._id
                      ? { ...s, reactions: updated.reactions }
                      : s
                  )
                );
              }
            },
          })
    );
    return () => unsubscribers.forEach((sub) => sub && sub.unsubscribe());
  }, [localSkills, apolloClient]);

  // remove mutation
  const [removeSkill, { error }] = useMutation(REMOVE_SKILL, {
    update(cache, { data: { removeSkill: removed } }) {
      // 1️⃣ remove from the normalized Profile.skills field
      cache.modify({
        id: cache.identify({ __typename: "Profile", _id: profile._id }),
        fields: {
          skills(existingRefs = [], { readField }) {
            return existingRefs.filter(
              (ref) => readField("_id", ref) !== removed._id
            );
          },
        },
      });
      // 2️⃣ also drop from our local list
      setLocalSkills((prev) => prev.filter((s) => s._id !== removed._id));
      // 3️⃣ force refetch of all skills for recents list
      if (apolloClient) {
        apolloClient.refetchQueries({ include: [GET_SKILLS] });
      }
    },
  });

  const handleRemoveSkill = (skillId) => {
    setShowDeleteModal(skillId);
  };

  const confirmRemoveSkill = (skillId) => {
    setShowDeleteModal(null);
    startTransition(() => removeSkill({ variables: { skillId } }));
  };

  // Filter skills for /skill-list page: only show skills received from other users for the logged-in user
  const filteredSkills =
    columns === 1 && profile?._id === Auth.getProfile()?.data?._id
      ? localSkills.filter(
          (skill) =>
            skill.recipient?._id === Auth.getProfile()?.data?._id &&
            skill.skillAuthor !== profile.name
        )
      : localSkills;

  // pagination
  const totalPages = Math.ceil(filteredSkills.length / PAGE_SIZE);
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const deferredSkills = useDeferredValue(
    filteredSkills.slice(startIdx, startIdx + PAGE_SIZE)
  );

  if (!filteredSkills.length) {
    return (
      <div className={`text-center p-8 rounded-2xl shadow-lg ${
        isDarkMode ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-50 text-gray-500'
      }`}>
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <span className="text-2xl">🎯</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">No Skills Yet</h3>
        <p className="text-sm">No endorsed skills to display</p>
      </div>
    );
  }

  return (
    <>
      {isPending && (
        <div className={`text-center py-3 px-4 mb-4 rounded-lg ${
          isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
        } animate-pulse`}>
          <span className="inline-flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            Updating skills...
          </span>
        </div>
      )}

      <div
        className={`grid grid-cols-1${
          columns === 2 ? " sm:grid-cols-2" : columns > 1 ? ` sm:grid-cols-${columns}` : ""
        } gap-4 sm:gap-6`}
      >
        {deferredSkills.map((skill) => {
          return (
            <div
              key={skill._id}
              className={`group relative rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden border ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-gray-600' 
                  : 'bg-gradient-to-br from-white to-blue-50 border-gray-200 hover:border-blue-300'
              }`}
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
                    {skill.recipient?._id === Auth.getProfile()?.data?._id
                      ? "You"
                      : skill.recipient?.name || "—"}
                  </div>
                </div>
              </div>

              {/* Skill content with modern typography */}
              <div
                className={`flex-1 flex items-center justify-between p-4 min-h-[80px] ${
                  isDarkMode ? "bg-gradient-to-r from-gray-800 to-gray-900" : "bg-gradient-to-r from-blue-50 to-white"
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
                <div className="flex items-center gap-2">
                  <SkillReaction
                    onReact={emoji => apolloClient.mutate({ 
                      mutation: REACT_TO_SKILL, 
                      variables: { skillId: skill._id, emoji } 
                    })}
                    isDarkMode={isDarkMode}
                    skillId={skill._id}
                  />
                  {isLoggedInUser && (
                    <button
                      onClick={() => handleRemoveSkill(skill._id)}
                      disabled={isPending}
                      title="Delete skill"
                      className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                        isDarkMode
                          ? "text-red-400 hover:text-red-300 hover:bg-red-900/30"
                          : "text-red-500 hover:text-red-600 hover:bg-red-50"
                      }`}
                    >
                      <AiOutlineDelete size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Modern Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              currentPage === 1
                ? isDarkMode 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white hover:scale-105 shadow-lg'
                  : 'bg-white hover:bg-gray-50 text-gray-700 hover:scale-105 shadow-lg border border-gray-200'
            }`}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <span className="text-sm">←</span>
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${
            isDarkMode 
              ? 'bg-blue-900/50 text-blue-300 border border-blue-700' 
              : 'bg-blue-100 text-blue-700 border border-blue-200'
          }`}>
            <span className="text-sm">Page</span>
            <span>{currentPage}</span>
            <span className="text-sm">of</span>
            <span>{totalPages}</span>
          </div>

          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              currentPage === totalPages
                ? isDarkMode 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white hover:scale-105 shadow-lg'
                  : 'bg-white hover:bg-gray-50 text-gray-700 hover:scale-105 shadow-lg border border-gray-200'
            }`}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <span className="hidden sm:inline">Next</span>
            <span className="text-sm">→</span>
          </button>
        </div>
      )}

      {error && (
        <div className={`mt-4 p-4 rounded-xl shadow-lg border ${
          isDarkMode 
            ? 'bg-red-900/30 text-red-200 border-red-700' 
            : 'bg-red-100 text-red-800 border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <h4 className="font-semibold">Error occurred</h4>
              <p className="text-sm">{error.message}</p>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowDeleteModal(null)}
          />
          <div className={`relative flex flex-col items-center justify-center p-6 rounded-3xl shadow-2xl border-2 max-w-md w-full animate-modal-pop ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600' 
              : 'bg-gradient-to-br from-white to-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-xl text-white">⚠️</span>
              </div>
              <h3 className={`text-xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Delete Skill?
              </h3>
            </div>
            
            <p className={`text-center mb-6 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Are you sure you want to delete this skill endorsement? This action cannot be undone.
            </p>
            
            <div className="flex gap-3 w-full">
              <button
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-all duration-200 hover:scale-105"
                onClick={() => confirmRemoveSkill(showDeleteModal)}
              >
                Delete
              </button>
              <button
                className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                onClick={() => setShowDeleteModal(null)}
              >
                Cancel
              </button>
            </div>
            
            {/* Close button */}
            <button
              className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setShowDeleteModal(null)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SkillsList;
