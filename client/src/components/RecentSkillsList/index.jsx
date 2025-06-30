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
                  <div
                    className={`card shadow rounded-md p-2 ${
                      isDarkMode
                        ? "bg-gray-700 text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    <div className="text-xs mb-1">
                      Date : {skill.createdAt}
                    </div>
                    <div className="font-semibold mb-1 ">
                      {skill.skillText[0].toUpperCase() +
                        skill.skillText.slice(1)}
                    </div>
                    <div className="text-xs">
                      {skill.skillAuthor[0].toUpperCase() +
                        skill.skillAuthor.slice(1)}{" "}
                      endorsed{" "}
                      <strong>{skill.recipient?.name || "—"}</strong>
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
