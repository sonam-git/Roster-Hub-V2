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
import { useOrganization } from "../../contexts/OrganizationContext";

const PAGE_SIZE = 6; // 3 rows x 2 columns

const SkillsList = ({
  profile,
  skills: initialSkills,
  isLoggedInUser = false,
  isDarkMode,
  columns = 0, // default to 0 columns
}) => {
  const { currentOrganization } = useOrganization();
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
    if (!currentOrganization) {
      console.error('No organization selected');
      alert('Please select an organization to remove skill.');
      return;
    }
    
    setShowDeleteModal(null);
    startTransition(() => 
      removeSkill({ 
        variables: { 
          skillId,
          organizationId: currentOrganization._id
        } 
      })
    );
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
      <div className={`text-center p-8 rounded-md border ${
        isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'
      }`}>
        <div className={`w-16 h-16 mx-auto mb-4 rounded-md flex items-center justify-center ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
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
        <div className={`text-center py-3 px-4 mb-4 rounded-md border ${
          isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-700'
        }`}>
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
              className={`group relative rounded-md border transition-colors duration-150 overflow-hidden ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Header */}
              <div
                className={`px-4 py-3 border-b ${
                  isDarkMode
                    ? "bg-gray-800 text-gray-100 border-gray-700"
                    : "bg-white text-gray-800 border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-semibold ${
                      isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {skill.skillAuthor[0].toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium text-sm">
                        {skill.skillAuthor[0].toUpperCase() + skill.skillAuthor.slice(1)}
                      </span>
                      <span className={`ml-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        endorsed
                      </span>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-md text-xs font-medium border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}>
                    {skill.recipient?._id === Auth.getProfile()?.data?._id
                      ? "You"
                      : skill.recipient?.name || "—"}
                  </div>
                </div>
              </div>

              {/* Skill content */}
              <div
                className={`flex-1 flex items-center justify-between p-4 min-h-[80px] ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <div className="flex-1">
                  <h3 className={`text-base font-medium leading-tight ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
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
                          className="text-xl"
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

              {/* Footer with actions */}
              <div className={`px-4 py-3 border-t flex items-center justify-between ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <span className={`px-2 py-1 rounded-md text-xs font-medium border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-600'
                }`}>
                  {skill.createdAt}
                </span>
                <div className="flex items-center gap-2">
                  <SkillReaction
                    onReact={emoji => {
                      if (!currentOrganization) {
                        console.error('No organization selected');
                        return;
                      }
                      return apolloClient.mutate({
                        mutation: REACT_TO_SKILL,
                        variables: { 
                          skillId: skill._id, 
                          emoji,
                          organizationId: currentOrganization._id
                        }
                      });
                    }}
                    isDarkMode={isDarkMode}
                    buttonClass={`transition-colors duration-150 px-3 py-1.5 rounded-md text-sm font-medium border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  />
                  {isLoggedInUser && (
                    <button
                      onClick={() => handleRemoveSkill(skill._id)}
                      disabled={isPending}
                      title="Delete skill"
                      className={`p-2 rounded-md transition-colors duration-150 ${
                        isDarkMode
                          ? "text-red-400 hover:bg-gray-700"
                          : "text-red-600 hover:bg-gray-100"
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
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
              currentPage === 1
                ? isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                : isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
            isDarkMode 
              ? 'bg-blue-600 text-white' 
              : 'bg-blue-600 text-white'
          }`}>
            <span>{currentPage}</span>
            <span>of</span>
            <span>{totalPages}</span>
          </div>

          <button
            className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
              currentPage === totalPages
                ? isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                : isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {error && (
        <div className={`mt-4 p-4 rounded-md border ${
          isDarkMode 
            ? 'bg-gray-800 text-red-400 border-gray-700' 
            : 'bg-red-50 text-red-800 border-red-200'
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
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDeleteModal(null)}
          />
          <div className={`relative flex flex-col p-6 rounded-md border max-w-md w-full ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-md bg-red-600 flex items-center justify-center">
                <span className="text-lg text-white">⚠️</span>
              </div>
              <h3 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Delete Skill?
              </h3>
            </div>
            
            <p className={`mb-6 text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Are you sure you want to delete this skill endorsement? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                className="flex-1 px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
                onClick={() => confirmRemoveSkill(showDeleteModal)}
              >
                Delete
              </button>
              <button
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setShowDeleteModal(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SkillsList;
