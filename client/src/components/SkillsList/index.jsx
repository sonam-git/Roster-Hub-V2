import React, { useState, useEffect, useTransition, useDeferredValue } from "react";
import { useMutation, useSubscription } from "@apollo/client";
import { REMOVE_SKILL } from "../../utils/mutations";
import { QUERY_ME } from "../../utils/queries";
import { AiOutlineDelete } from "react-icons/ai";
import {
  SKILL_ADDED_SUBSCRIPTION,
  SKILL_DELETED_SUBSCRIPTION,
} from "../../utils/subscription";

const SkillsList = ({
  profile,
  skills: initialSkills,
  isLoggedInUser = false,
  isDarkMode,
}) => {
  // —— keep pagination state at the top
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  // —— mirror incoming skills into local state for real-time updates
  const [localSkills, setLocalSkills] = useState(initialSkills);
  useEffect(() => {
    setLocalSkills(initialSkills);
  }, [initialSkills]);

// —— subscribe to new skills
useSubscription(SKILL_ADDED_SUBSCRIPTION, {
  onData: ({ data }) => {
    const added = data?.skillAdded;
    if (added && !localSkills.some((s) => s._id === added._id)) {
      setLocalSkills((prev) => [added, ...prev]);
    }
  },
});


// —— subscribe to deleted skills
useSubscription(SKILL_DELETED_SUBSCRIPTION, {
  onData: ({ data }) => {
    const deletedId = data?.skillDeleted;
    if (deletedId) {
      setLocalSkills(prev => prev.filter(s => s._id !== deletedId));
    }
  },
});


  // —— mutation to remove skill
  const [removeSkill, { error }] = useMutation(REMOVE_SKILL, {
    update(cache, { data: { removeSkill } }) {
      try {
        const { me } = cache.readQuery({ query: QUERY_ME });
        const updated = me.skills.filter((s) => s._id !== removeSkill._id);
        cache.writeQuery({
          query: QUERY_ME,
          data: { me: { ...me, skills: updated } },
        });
      } catch (e) {
        console.error(e);
      }
    },
    onCompleted({ removeSkill }) {
      // also remove locally
      setLocalSkills((prev) => prev.filter((s) => s._id !== removeSkill._id));
    },
  });

  const handleRemoveSkill = (skillId) => {
    startTransition(async () => {
      try {
        await removeSkill({ variables: { skillId } });
      } catch (err) {
        console.error(err);
      }
    });
  };

  // —— pagination
  const PAGE_SIZE = 4;
  const totalPages = Math.ceil(localSkills.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginated = localSkills.slice(startIndex, startIndex + PAGE_SIZE);
  const deferredSkills = useDeferredValue(paginated);

  if (!localSkills.length) {
    return (
      <h3 className="text-center font-italic text-sm md:text-md">
        No endorsed Skill yet
      </h3>
    );
  }

  return (
    <>
      {!isLoggedInUser && (
        <h2 className="text-center font-bold text-sm lg:text-lg">
          {profile.name}'s friends have endorsed{" "}
          {profile.skills?.length ?? 0} skill
          {profile.skills?.length === 1 ? "" : "s"}
        </h2>
      )}

      {isPending && (
        <div className="text-center text-sm text-gray-500 mb-2 animate-pulse">
          Updating...
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2">
        {deferredSkills.map((skill) => (
          <div key={skill._id} className="col-span-1">
            <div
              className={`mb-2 shadow-2xl rounded-md ${
                isDarkMode ? "bg-gray-500 text-white" : "bg-white text-black"
              }`}
            >
              <div className="p-2 font-bold border-b border-gray-300 dark:border-gray-600">
                {skill.skillText[0].toUpperCase() + skill.skillText.slice(1)}
              </div>
              <div className="flex justify-between items-center px-2 py-1 text-xs">
                <span>
                  By:{" "}
                  {skill.skillAuthor[0].toUpperCase() +
                    skill.skillAuthor.slice(1)}{" "}
                  on {skill.createdAt}
                </span>
                {isLoggedInUser && (
                  <button
                    aria-label="Delete skill"
                    className="dark:text-red-500 hover:dark:text-white text-red-600 hover:text-red-800 transition disabled:opacity-50"
                    onClick={() => handleRemoveSkill(skill._id)}
                    disabled={isPending}
                  >
                    <AiOutlineDelete size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="my-3 p-3 bg-red-500 text-white rounded" role="alert">
          {error.message}
        </div>
      )}

 
      {/* Prev / Next controls */}
      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() =>
            startTransition(() => setCurrentPage((p) => Math.max(p - 1, 1)))
          }
          disabled={currentPage === 1}
          className={`px-4 py-1 rounded ${
            currentPage === 1
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Prev
        </button>
        <button
          onClick={() =>
            startTransition(() =>
              setCurrentPage((p) => Math.min(p + 1, totalPages))
            )
          }
          disabled={currentPage === totalPages}
          className={`px-4 py-1 rounded ${
            currentPage === totalPages
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Next
        </button>
      </div>
    </>
  );
};

export default SkillsList;
