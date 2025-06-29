// src/components/SkillsList.jsx
import React, { useState, useEffect, useTransition, useDeferredValue } from "react";
import { useMutation, useSubscription } from "@apollo/client";
import { REMOVE_SKILL } from "../../utils/mutations";
import { QUERY_ME } from "../../utils/queries";
import {
  SKILL_ADDED_SUBSCRIPTION,
  SKILL_DELETED_SUBSCRIPTION,
} from "../../utils/subscription";
import { AiOutlineDelete } from "react-icons/ai";

const PAGE_SIZE = 4;

const SkillsList = ({
  profile,
  skills: initialSkills,
  isLoggedInUser = false,
  isDarkMode,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [localSkills, setLocalSkills] = useState(initialSkills);
  

  // keep localSkills in sync
  useEffect(() => {
    setLocalSkills(initialSkills);
  }, [initialSkills]);

  // real-time add / remove
  useSubscription(SKILL_ADDED_SUBSCRIPTION, {
    onData: ({ data }) => {
      const added = data.data?.skillAdded;
      if (added && !localSkills.some(s => s._id === added._id)) {
        setLocalSkills(prev => [added, ...prev]);
      }
    },
  });
  useSubscription(SKILL_DELETED_SUBSCRIPTION, {
    onData: ({ data }) => {
      const deletedId = data.data?.skillDeleted;
      if (deletedId) {
        setLocalSkills(prev => prev.filter(s => s._id !== deletedId));
      }
    },
  });

  // remove mutation
  const [removeSkill, { error }] = useMutation(REMOVE_SKILL, {
    update(cache, { data: { removeSkill: removed } }) {
      // 1️⃣ remove from the normalized Profile.skills field
      cache.modify({
        id: cache.identify({ __typename: "Profile", _id: profile._id }),
        fields: {
          skills(existingRefs = [], { readField }) {
            return existingRefs.filter(
              ref => readField("_id", ref) !== removed._id
            );
          }
        }
      });
      // 2️⃣ also drop from our local list
      setLocalSkills(prev => prev.filter(s => s._id !== removed._id));
    },
  });

  const handleRemoveSkill = skillId => {
    startTransition(() => removeSkill({ variables: { skillId } }));
  };

  // pagination
  const totalPages = Math.ceil(localSkills.length / PAGE_SIZE);
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const deferredSkills = useDeferredValue(
    localSkills.slice(startIdx, startIdx + PAGE_SIZE)
  );

  if (!localSkills.length) {
    return <h3 className="text-center italic">No endorsed Skill yet</h3>;
  }

  return (
    <>
      {!isLoggedInUser && (
        <h2 className=" text-xs font-thin">
          {profile.name}'s friends have endorsed{" "}
          {profile.skills?.length ?? 0} skill
          {profile.skills?.length === 1 ? "" : "s"}
        </h2>
      )}

      {isPending && (
        <div className="text-center text-gray-500 mb-2 animate-pulse">
          Updating…
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {deferredSkills.map(skill => (
          <div key={skill._id} className="shadow rounded overflow-hidden">
            <div
              className={`p-2 font-bold border-b ${
                isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"
              }`}
            >
              {skill.skillText[0].toUpperCase() + skill.skillText.slice(1)}
            </div>
            <div
              className={`flex justify-between items-center px-2 py-1 text-xs ${
                isDarkMode ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-700"
              }`}
            >
              <span>
                By {skill.skillAuthor} on {skill.createdAt}
              </span>
              {isLoggedInUser && (
                <button
                  onClick={() => handleRemoveSkill(skill._id)}
                  disabled={isPending}
                  title="Delete skill"
                  className={`transition ${
                    isDarkMode ? "text-red-400 hover:text-red-200" : "text-red-600 hover:text-red-800"
                  }`}
                >
                  <AiOutlineDelete size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="my-3 p-3 bg-red-500 text-white rounded">
          {error.message}
        </div>
      )}

      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() =>
            startTransition(() => setCurrentPage(p => Math.max(p - 1, 1)))
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
            startTransition(() => setCurrentPage(p => Math.min(p + 1, totalPages)))
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
