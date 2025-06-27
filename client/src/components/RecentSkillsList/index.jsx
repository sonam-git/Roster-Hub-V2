// src/components/RecentSkillsList.jsx
import React, { useContext, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_SKILLS } from "../../utils/queries";
import {
  SKILL_ADDED_SUBSCRIPTION,
  SKILL_DELETED_SUBSCRIPTION,
} from "../../utils/subscription";
import { ThemeContext } from "../ThemeContext";

const RecentSkillsList = () => {
  const { isDarkMode } = useContext(ThemeContext);

  // pull in the basic list
  const { loading, error, data, subscribeToMore }  = useQuery(GET_SKILLS);

  // subscribe to additions and deletions
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

  if (loading) return <div>Loading...</div>;
  if (error) return (
       <div className="text-red-500">Error loading skills.</div>
      );
     // Ensure data.skills exists and is an array
 const skillsData = data?.skills;
 if (!Array.isArray(skillsData)) return <div>No Skills available</div>;

  // show the top 5 by createdAt
  const sorted = [...skillsData].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const topFive = sorted.slice(0, 5);

  return (
    <>
      <div
        className={`top-0 mb-2 shadow-md p-2 rounded-md z-10 ${
          isDarkMode ? "bg-gray-700 text-white" : "bg-white text-black"
        }`}
      >
        <h3 className="text-center font-bold mb-2 text-sm md:text-xl lg:text-2xl xl:text-2xl">
          {skillsData.length === 0 ? "No Skills available" : "Latest Skills"}
        </h3>
      </div>

      <div className="w-full overflow-y-auto" style={{ height: "250px" }}>
        <ul>
          {topFive.map((skill) => (
            <li key={skill._id} className="mb-2">
              <div
                className={`card shadow-2xl rounded-md ${
                  isDarkMode ? "bg-gray-700 text-white" : "bg-white text-black"
                }`}
              >
                {/* date row */}
                <div
                  className={`flex justify-between items-center px-2 py-2 text-xs ${
                    isDarkMode ? "bg-gray-800" : "bg-green-700 text-white"
                  }`}
                >
                  <span>Date: {skill.createdAt}</span>
                </div>

                {/* skill text */}
                <div className="p-2 font-semibold border-b border-gray-300 dark:border-gray-600">
                  {skill.skillText[0].toUpperCase() + skill.skillText.slice(1)}
                </div>

                {/* author → recipient row */}
                <div
                  className={`flex justify-between items-center px-2 py-2 text-xs ${
                    isDarkMode ? "bg-gray-800" : "bg-yellow-700 text-white"
                  }`}
                >
                  <span>
                    {skill.skillAuthor[0].toUpperCase() + skill.skillAuthor.slice(1)}{" "}
                    endorsed{" "}
                    <strong>
                      {skill.recipient?.name || "—"}
                    </strong>
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default RecentSkillsList;
