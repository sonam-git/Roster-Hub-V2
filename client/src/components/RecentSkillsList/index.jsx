// src/components/RecentSkillsList.jsx
import React, { useContext, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_SKILLS } from "../../utils/queries";
import {
  SKILL_ADDED_SUBSCRIPTION,
  SKILL_DELETED_SUBSCRIPTION,
} from "../../utils/subscription";
import { ThemeContext } from "../ThemeContext";

export default function RecentSkillsList() {
  const { isDarkMode } = useContext(ThemeContext);
  const { loading, error, data, subscribeToMore } = useQuery(GET_SKILLS, {
    fetchPolicy: "network-only",
  });

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
      updateQuery: (prev, { subscriptionData, client }) => {
        const deletedId = subscriptionData.data?.skillDeleted;
        if (!deletedId) return prev;
        const filtered = prev.skills.filter(
          (s) => String(s._id) !== String(deletedId)
        );
        // Always refetch to ensure UI is in sync
        if (client) {
          client.refetchQueries({ include: [GET_SKILLS] });
        }
        return { skills: filtered };
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
    <div>
     <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md shadow-md mb-4">
        <h3 className="text-center font-bold text-lg">
          {skills.length === 0 ? "No Skills available" : "Latest Skills"}
        </h3>
      </div>

      {skills.length === 0 ? (
        <p className="text-center italic">No Skills endorsed yet.</p>
      ) : (
        <div className="w-full overflow-y-auto" style={{ height: 250 }}>
          <ul>
            {skills
              .slice()
              .sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
              )
              .slice(0, 5)
              .map((skill) => (
                <li key={skill._id} className="mb-2">
                  <div className={`shadow rounded overflow-hidden flex flex-col justify-between h-32 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
                    {/* Author on top */}
                    <div
                      className={`px-3 py-2 text-xs font-semibold tracking-wide border-b ${
                        isDarkMode ? "bg-gray-900 text-green-300" : "bg-green-100 text-yellow-800"
                      }`}
                      style={{ letterSpacing: '0.05em' }}
                    >
                      <span className="inline-block align-middle ">
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
                    <div className={`flex items-center justify-end px-3 py-2 border-t ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow ${isDarkMode ? "bg-gray-700 text-green-200" : "bg-green-300 text-yellow-900"}`}>
                        {skill.createdAt}
                      </span>
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
