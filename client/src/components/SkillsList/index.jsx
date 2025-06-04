import React, { useState } from "react";
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

  const [currentPage, setCurrentPage] = useState(1);

  const handleRemoveSkill = async (skillId) => {
    try {
      await removeSkill({
        variables: { skillId },
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (!skills.length) {
    return (
      <h3 className="text-center font-bold text-sm md:text-lg ">
        No endorsed Skill yet
      </h3>
    );
  }
  // Number of skills per page (2 columns x 2 rows = 4)
  const PAGE_SIZE = 4;

  // Calculate total number of pages
  const totalPages = Math.ceil(skills.length / PAGE_SIZE);

  // Get skills for the current page
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedSkills = skills.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <>
      {!isLoggedInUser && (
        <h2 className="text-center font-bold text-sm lg:text-lg">
          {profile.name}'s friends have endorsed these{" "}
          {profile?.skills ? profile?.skills.length : 0} skill
          {profile?.skills && profile?.skills.length === 1 ? "" : "s"}
        </h2>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 my-2 ">
        {paginatedSkills?.map((skill) => (
          <div key={skill?._id} className="col-span-1">
            <div
              className={`card mb-1 shadow-2xl rounded-md ${
                isDarkMode ? "bg-gray-500 text-white" : "bg-white text-black"
              }`}
            >
              <div className="card-header text-light p-2">
                <div
                  className={`mb-2 font-bold p-2 ${
                    isDarkMode
                      ? "bg-gray-800 text-white"
                      : "bg-white text-black"
                  }`}
                >
                  <span>
                    {skill?.skillText[0].toUpperCase() +
                      skill?.skillText.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <div>
                    <span className={`mr-1 text-xs text-white `}>
                      By :{" "}
                      {skill?.skillAuthor[0].toUpperCase() +
                        skill?.skillAuthor.slice(1)}{" "}
                      on {skill?.createdAt}
                    </span>
                  </div>
                  {isLoggedInUser && (
                    <button
                      className="btn btn-sm btn-danger hover:bg-red-700 transition duration-300"
                      onClick={() => handleRemoveSkill(skill?._id)}
                    >
                      <AiOutlineDelete />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="my-3 p-3 bg-red-500 text-white">{error.message}</div>
      )}

      <div className="flex justify-center mt-4">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            className={`px-3 py-1 mx-1 ${
              currentPage === index + 1
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            } rounded`}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </>
  );
};

export default SkillsList;
