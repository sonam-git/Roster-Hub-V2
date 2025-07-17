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
  const [showReactionModal, setShowReactionModal] = useState(null);
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
    return <h3 className="text-center italic">You have No endorsed skill yet </h3>;
  }

  return (
    <>
      {!isLoggedInUser && (
        <h2 className=" text-xs font-thin dark:text-white">
          {profile.name}'s friends have endorsed {profile.skills?.length ?? 0}{" "}
          skill
          {profile.skills?.length === 1 ? "" : "s"}
        </h2>
      )}

      {isPending && (
        <div className="text-center text-gray-500 mb-2 animate-pulse">
          Updating…
        </div>
      )}

      <div
        className={`grid grid-cols-1${
          columns === 2 ? " sm:grid-cols-2" : columns > 1 ? ` sm:grid-cols-${columns}` : ""
        } gap-4`}
      >
        {deferredSkills.map((skill) => {
          return (
            <div
              key={skill._id}
              className="shadow rounded overflow-hidden flex flex-col justify-between h-32"
            >
              <div
                className={`px-3 py-2 text-xs font-semibold tracking-wide border-b ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-100"
                    : "bg-blue-100 text-blue-800"
                }`}
                style={{ letterSpacing: "0.05em" }}
              >
                <span className="inline-block align-middle">
                  {skill.skillAuthor[0].toUpperCase() + skill.skillAuthor.slice(1)}
                </span>
                <span className="ml-1 text-gray-400 font-normal">endorsed </span>
                <span className="text-xs text-gray-500 italic">
                  {skill.recipient?._id === Auth.getProfile()?.data?._id
                    ? <strong>You</strong>
                    : skill.recipient?.name
                      ? <strong>{skill.recipient.name}</strong>
                      : "—"}
                </span>
              </div>
              <div
                className={`flex-1 flex items-center justify-between text-lg font-bold ${
                  isDarkMode ? "bg-gray-800 text-gray-100" : "bg-blue-200 text-gray-900"
                }`}
                style={{ minHeight: "2.5rem" }}
              >
                <span className="text-left w-1/2 pl-2 truncate">{skill.skillText[0].toUpperCase() + skill.skillText.slice(1)}</span>
                <div className="flex items-center justify-end w-1/2">
                  {skill.reactions && skill.reactions.length > 0 && (
                    <div className="flex space-x-1 mr-2">
                      {skill.reactions.map((r, i) => (
                        <span key={i} title={r.user?.name || ""} className="text-xl">{r.emoji}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className={`flex items-center justify-between px-3 py-2 border-t ${isDarkMode ? "bg-gray-700" : "bg-blue-50"}`}> 
                <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow ${isDarkMode ? "bg-gray-700 text-gray-100" : "bg-blue-300 text-blue-900"}`}>{skill.createdAt}</span>
                <div className="flex items-center ml-2">
                  {/* React button for skill view, improved style */}
                  <SkillReaction
                    onReact={emoji => apolloClient.mutate({ mutation: REACT_TO_SKILL, variables: { skillId: skill._id, emoji } })}
                    buttonClass={`transition-colors duration-150 px-3 py-1 rounded-full font-semibold shadow focus:outline-none focus:ring-2 focus:ring-gray-400 hover:bg-gray-500 hover:text-white ${isDarkMode ? 'bg-gray-600 text-gray-100' : 'bg-blue-300 text-blue-900'}`}
                  />
                  {/* Delete button logic remains unchanged */}
                  {isLoggedInUser && (
                    <button
                      onClick={() => handleRemoveSkill(skill._id)}
                      disabled={isPending}
                      title="Delete skill"
                      className={`transition ml-2 ${
                        isDarkMode
                          ? "text-red-400 hover:text-red-200"
                          : "text-red-600 hover:text-red-800"
                      }`}
                    >
                      <AiOutlineDelete size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white font-semibold shadow disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span className="font-bold text-base">Page {currentPage} of {totalPages}</span>
          <button
            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white font-semibold shadow disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {error && (
        <div className="my-3 p-3 bg-red-500 text-white rounded">
          {error.message}
        </div>
      )}

      {/* Single emoji modal for all skills, centered and only shown when showReactionModal is set */}
      {showReactionModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-gradient-to-br from-blue-200 via-green-100 to-yellow-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 opacity-70 backdrop-blur-sm"
            onClick={() => setShowReactionModal(null)}
          />
          <div className="relative flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 rounded-3xl shadow-2xl border-4 border-blue-300 dark:border-blue-800 max-w-md w-full animate-fade-in mx-4">
            <h3 className="text-lg font-bold mb-4 text-gray-700 dark:text-gray-200">
              React with an Emoji
            </h3>
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              {[
                { emoji: "👍", label: "Thumbs Up" },
                { emoji: "🔥", label: "Fire" },
                { emoji: "👏", label: "Clap" },
                { emoji: "😍", label: "Love" },
                { emoji: "💯", label: "100" },
                { emoji: "🎉", label: "Party Popper" },
                { emoji: "😄", label: "Smile" },
                { emoji: "😢", label: "Sad" },
                { emoji: "🤔", label: "Thinking" },
                { emoji: "🙌", label: "Hands Up" },
                { emoji: "💪", label: "Flexed Biceps" },
                { emoji: "😎", label: "Cool" },
                { emoji: "🤩", label: "Star-Struck" },
                { emoji: "🤗", label: "Hugging Face" },
                { emoji: "😇", label: "Smiling Face with Halo" },
              ].map(({ emoji, label }) => (
                <button
                  key={label}
                  className="px-4 py-2 text-3xl rounded-full bg-blue-100 dark:bg-blue-900 hover:bg-blue-300 dark:hover:bg-blue-700 shadow-lg transition-transform focus:outline-none border-2 border-blue-200 dark:border-blue-700 hover:scale-125 focus:ring-2 focus:ring-blue-400"
                  title={label}
                  aria-label={label}
                  onClick={async () => {
                    await apolloClient.mutate({
                      mutation: REACT_TO_SKILL,
                      variables: { skillId: showReactionModal, emoji },
                    });
                    setShowReactionModal(null);
                  }}
                  type="button"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <button
              className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold"
              onClick={() => setShowReactionModal(null)}
              aria-label="Close"
            >
              ×
            </button>
            <button
              className="mt-2 px-6 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold shadow"
              onClick={() => setShowReactionModal(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-gradient-to-br from-red-200 via-yellow-100 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 opacity-70 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(null)}
          />
          <div className="relative flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 rounded-3xl shadow-2xl border-4 border-red-300 dark:border-red-800 max-w-md w-full animate-fade-in mx-4">
            <h3 className="text-lg font-bold mb-4 text-gray-700 dark:text-gray-200">
              Confirm Skill Deletion
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">Are you sure you want to delete this skill endorsement?</p>
            <div className="flex gap-4">
              <button
                className="px-6 py-2 rounded-full bg-red-500 text-white font-semibold shadow hover:bg-red-600"
                onClick={() => confirmRemoveSkill(showDeleteModal)}
              >
                Delete
              </button>
              <button
                className="px-6 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold shadow"
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
