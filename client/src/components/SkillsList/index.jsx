import React, { useState, useTransition, useDeferredValue } from "react";
import { useMutation } from "@apollo/client";
import { REMOVE_SKILL } from "../../utils/mutations";
import { QUERY_ME } from "../../utils/queries";
import { AiOutlineDelete } from "react-icons/ai";

const SkillsList = ({
  profile,
  skills,
  isLoggedInUser = false,
  isDarkMode,
}) => {
  const [removeSkill, { error }] = useMutation(REMOVE_SKILL, {
    update(cache, { data: { removeSkill } }) {
      try {
        const { me } = cache.readQuery({ query: QUERY_ME });
        const updatedSkills = me?.skills.filter(
          (skill) => skill._id !== removeSkill._id
        );
        cache.writeQuery({
          query: QUERY_ME,
          data: { me: { ...me, skills: updatedSkills } },
        });
      } catch (e) {
        console.error(e);
      }
    },
  });

  const [isPending, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(1);

  const handleRemoveSkill = (skillId) => {
    startTransition(async () => {
      try {
        await removeSkill({ variables: { skillId } });
      } catch (err) {
        console.error(err);
      }
    });
  };

  const PAGE_SIZE = 4;
  const totalPages = Math.ceil(skills.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;

  const paginatedSkills = skills.slice(startIndex, startIndex + PAGE_SIZE);
  const deferredSkills = useDeferredValue(paginatedSkills);

  if (!skills.length) {
    return (
      <h3 className="text-center font-bold text-sm md:text-lg">
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
                    className="dark:text-red-500  hover:dark:text-white text-red-600 hover:text-red-800 transition disabled:opacity-50"
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

      <div className="flex justify-center mt-4">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() =>
              startTransition(() => setCurrentPage(index + 1))
            }
            disabled={isPending}
            className={`px-3 py-1 mx-1 rounded transition ${
              currentPage === index + 1
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </>
  );
};

export default SkillsList;
