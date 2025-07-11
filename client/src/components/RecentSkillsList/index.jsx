// src/components/RecentSkillsList.jsx
import React, { useContext, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_SKILLS } from "../../utils/queries";
import {
  SKILL_ADDED_SUBSCRIPTION,
  SKILL_DELETED_SUBSCRIPTION,
} from "../../utils/subscription";
import { ThemeContext } from "../ThemeContext";
import { FaFutbol } from "react-icons/fa";

export default function RecentSkillsList() {
  const { isDarkMode } = useContext(ThemeContext);
  const { loading, error, data, subscribeToMore } = useQuery(GET_SKILLS);

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

  if (loading) return <div>Loading latest skills…</div>;
  if (error) return <div className="text-red-500">Error loading skills.</div>;

  // safely grab the array (or default to [])
  const skills = Array.isArray(data?.skills) ? data.skills : [];

  return (
    <div className="w-full">
      <div
        className={`mb-2 shadow-xl rounded-2xl p-4 border-2 bg-gradient-to-br ${
          isDarkMode
            ? "from-gray-800 via-gray-700 to-gray-900 border-gray-700 text-blue-100"
            : "from-blue-100 via-white to-blue-50 border-blue-300 text-blue-900"
        }`}
      >
            <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <FaFutbol className="text-yellow-500 dark:text-yellow-300 text-xl animate-bounce" />
                        <span className="font-bold text-lg dark:text-white">
                         {skills.length === 0 ? "No Skills available" : "Latest Skills"}
                        </span>
                      </div>
      </div>
      {skills.length === 0 ? (
        <div
          className={`rounded-2xl shadow-xl p-6 border-2 text-center bg-gradient-to-br ${
            isDarkMode
              ? "from-gray-800 via-gray-700 to-gray-900 border-gray-700 text-blue-100"
              : "from-blue-100 via-white to-blue-50 border-blue-300 text-blue-900"
          }`}
        >
          <p className="italic text-base">Nothing here yet.</p>
        </div>
      ) : (
        <div className="w-full overflow-y-auto" style={{ height: 350 }}>
          <ul className="space-y-4">
            {skills
              .slice()
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 5)
              .map((skill) => (
                <li key={skill._id} className="mb-2">
                  <div
                    className={`card shadow-xl rounded-2xl border-2 bg-gradient-to-br transition-all duration-300 hover:border-blue-400 p-4 flex flex-col justify-between h-28 relative ${
                      isDarkMode
                        ? "from-gray-900 via-gray-800 to-gray-700 border-gray-700 text-blue-100"
                        : "from-blue-50 via-white to-blue-100 border-blue-300 text-blue-900"
                    }`}
                  >
                    <div className="text-xs mb-1 font-semibold tracking-wide border-b pb-1 rounded-t-2xl bg-opacity-80">
                      Date :{" "}
                      <span className="font-bold">{skill.createdAt}</span>
                    </div>
                    <div className="font-semibold mb-1 text-base break-words whitespace-normal">
                      {skill.skillText}
                    </div>
                    <div className="text-xs flex items-center gap-1">
                      <span className="font-bold">
                        {skill.skillAuthor[0].toUpperCase() + skill.skillAuthor.slice(1)}
                      </span>
                      <span className="ml-1 text-gray-400 font-normal">
                        endorsed
                      </span>
                      <strong className="italic text-blue-500 dark:text-yellow-300">
                        {skill.recipient?.name || "—"}
                      </strong>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
