// src/components/SkillsList.jsx
import { useState, useEffect, useTransition, useDeferredValue } from "react";
import { useMutation, useSubscription } from "@apollo/client";
import { REMOVE_SKILL } from "../../utils/mutations";
import { GET_SKILLS } from "../../utils/queries";
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
  columns = 2, // default to 2 columns for profile, 1 for homepage
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
  const [removeSkill, { error, client }] = useMutation(REMOVE_SKILL, {
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
      // 3️⃣ force refetch of all skills for recents list
      if (client) {
        client.refetchQueries({ include: [GET_SKILLS] });
      }
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

      <div className={`grid grid-cols-1${columns > 1 ? ` sm:grid-cols-${columns}` : ""} gap-2`}>
        {deferredSkills.map(skill => (
          <div key={skill._id} className="shadow rounded overflow-hidden flex flex-col justify-between h-32">
            {/* Author on top */}
            <div
              className={`px-3 py-2 text-xs font-semibold tracking-wide border-b ${
                isDarkMode ? "bg-gray-900 text-green-300" : "bg-green-100 text-yellow-800"
              }`}
              style={{ letterSpacing: '0.05em' }}
            >
              <span className="inline-block align-middle">
                {skill.skillAuthor[0].toUpperCase() + skill.skillAuthor.slice(1)}
              </span>
              <span className="ml-1 text-gray-400 font-normal">endorsed </span> 
               <span className="text-xs text-gray-500 italic">
                {skill.recipient?.name ? <strong>{skill.recipient.name}</strong> : "—"}
              </span>
            </div>
            {/* Skill text in the middle */}
            <div
              className={`flex-1 flex items-center justify-center text-lg font-bold ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-green-200 text-gray-900"
              }`}
              style={{ minHeight: '2.5rem' }}
            >
              {skill.skillText[0].toUpperCase() + skill.skillText.slice(1)}
            </div>
            {/* Date at the bottom in a pill/button */}
            <div className={`flex items-center justify-between px-3 py-2 border-t ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
            
              <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow ${isDarkMode ? "bg-gray-700 text-green-200" : "bg-green-300 text-yellow-900"}`}>
                {skill.createdAt}
              </span>
              {isLoggedInUser && (
                <button
                  onClick={() => handleRemoveSkill(skill._id)}
                  disabled={isPending}
                  title="Delete skill"
                  className={`transition ml-2 ${
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
