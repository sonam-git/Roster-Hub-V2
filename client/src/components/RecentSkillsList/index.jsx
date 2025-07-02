// src/components/RecentSkillsList.jsx
import React, { useContext, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_SKILLS } from "../../utils/queries";
import {
  SKILL_ADDED_SUBSCRIPTION,
  SKILL_DELETED_SUBSCRIPTION,
} from "../../utils/subscription";
import { ThemeContext } from "../ThemeContext";
import SkillReaction from "../SkillsList/SkillReaction";
import { REACT_TO_SKILL } from "../../utils/mutations";

export default function RecentSkillsList() {
  const { isDarkMode } = useContext(ThemeContext);
  const { loading, error, data, subscribeToMore } = useQuery(GET_SKILLS, {
    fetchPolicy: "network-only",
  });

  // Add react mutation
  const [reactToSkill] = useMutation(REACT_TO_SKILL);

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
      <h3 className="text-center font-bold text-lg">
        {skills.length === 0 ? "No Skills available" : " "}
      </h3>
      {skills.length === 0 ? (
        <p className="text-center italic">No Skills endorsed yet.</p>
      ) : (
        <div className="w-full overflow-y-auto" style={{ height: 250 }}>
          <ul>
            {skills
              .slice()
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 5)
              .map((skill) => (
                <li key={skill._id} className="mb-2">
                  <div
                    className={`shadow rounded overflow-hidden flex flex-col justify-between h-36 relative ${
                      isDarkMode ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    {/* 1. Author and recipient */}
                    <div
                      className={`px-3 py-2 text-xs font-semibold tracking-wide border-b ${
                        isDarkMode
                          ? "bg-gray-600 text-green-300"
                          : "bg-green-100 text-yellow-800"
                      }`}
                      style={{ letterSpacing: "0.05em" }}
                    >
                      <span className="inline-block align-middle ">
                        {skill.skillAuthor[0].toUpperCase() +
                          skill.skillAuthor.slice(1)}
                      </span>
                      <span className="ml-1 text-gray-400 font-normal">
                        endorsed{" "}
                      </span>
                      <span className="text-xs text-gray-800 dark:text-yellow-300 italic">
                        {skill.recipient?.name &&
                        skill.recipient?.name === skill.skillAuthor ? (
                          <strong>himself</strong>
                        ) : skill.recipient?.name ? (
                          <strong>{skill.recipient.name}</strong>
                        ) : (
                          "—"
                        )}
                      </span>
                    </div>
                    {/* 2. Skill text and emoji row in one flex div */}
                    <div
                      className={`flex flex-row items-center justify-between gap-2 px-3 py-2 text-base sm:text-md font-semibold border-b border-gray-200 dark:border-gray-700 ${
                        isDarkMode
                          ? "bg-gray-800 text-white"
                          : "bg-green-200 text-gray-900"
                      }`}
                      style={{ minHeight: "2.2rem", wordBreak: "break-word" }}
                    >
                      <span
                        className="truncate text-sm"
                        style={{ maxWidth: "60%" }}
                      >
                        {skill.skillText[0].toUpperCase() +
                          skill.skillText.slice(1)}
                      </span>
                      <div className="flex flex-wrap gap-1 items-center min-h-[1.5rem]">
                        {skill.reactions && skill.reactions.length > 0 ? (
                          skill.reactions.map((r, i) => (
                            <span
                              key={i}
                              title={r.user?.name || ""}
                              className="text-lg sm:text-xl bg-white/70 dark:bg-gray-700/70 rounded-full px-1 shadow border border-gray-200 dark:border-gray-600"
                              style={{ minWidth: 24, textAlign: "center" }}
                            >
                              {r.emoji}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 italic text-xs sm:text-sm">
                            No reactions
                          </span>
                        )}
                      </div>
                    </div>
                    {/* 3. React button and date */}
                    <div className="flex items-center justify-between w-full px-3 py-2 dark:bg-gray-600">
                      <SkillReaction
                        onReact={(emoji) =>
                          reactToSkill({
                            variables: { skillId: skill._id, emoji },
                          })
                        }
                      />
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold shadow ${
                          isDarkMode
                            ? "bg-gray-700 text-green-200"
                            : "bg-green-300 text-yellow-900"
                        }`}
                      >
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
