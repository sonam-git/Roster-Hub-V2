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
  const { loading, data, subscribeToMore } = useQuery(GET_SKILLS);

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

  // show the top 5 by createdAt
  const sorted = [...data.skills].sort(
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
        {data?.skills?.length === 0 ? "No Skills available" : "Latest Skills"}
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
                <div className="p-2 font-semibold border-b border-gray-300 dark:border-gray-600">
                  {skill.skillText[0].toUpperCase() + skill.skillText.slice(1)}
                </div>
                <div className="flex justify-between items-center px-2 py-1 text-xs">
                  <span>
                    By:{" "}
                    {skill.skillAuthor[0].toUpperCase() +
                      skill.skillAuthor.slice(1)}{" "}
                    on {skill.createdAt}
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
