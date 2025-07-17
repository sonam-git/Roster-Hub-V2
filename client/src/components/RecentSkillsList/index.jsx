// src/components/RecentSkillsList.jsx
import React, { useContext, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_SKILLS } from "../../utils/queries";
import {
  SKILL_ADDED_SUBSCRIPTION,
  SKILL_DELETED_SUBSCRIPTION,
} from "../../utils/subscription";
import { ThemeContext } from "../ThemeContext";
import { FaFutbol } from "react-icons/fa";
import SkillReaction from "../SkillsList/SkillReaction";
import { REACT_TO_SKILL } from "../../utils/mutations";

export default function RecentSkillsList() {
  const { isDarkMode } = useContext(ThemeContext);
  const { loading, error, data, subscribeToMore } = useQuery(GET_SKILLS);
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
              ? "from-gray-800 via-gray-700 to-gray-900 border-gray-700 text-gray-100"
              : "from-blue-100 via-white to-blue-50 border-blue-300 text-blue-900"
          }`}
        >
          <p className="italic text-base">Skills will be displayed here.</p>
        </div>
      ) : (
        <div className="w-full overflow-y-auto" style={{ height: 350 }}>
          <div className="grid grid-cols-1 gap-4">
            {skills
              .slice()
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 5)
              .map((skill) => (
                <div
                  key={skill._id}
                  className="shadow rounded overflow-hidden flex flex-col justify-between h-32"
                >
                  <div
                    className={`px-3 py-2 text-xs font-semibold tracking-wide border-b ${
                      isDarkMode
                        ? "bg-gray-700 text-gray-100"
                        : "bg-blue-100 text-blue-800"
                    }`}
                    style={{ letterSpacing: "0.05em" }}
                  >
                    <span className="inline-block align-middle">
                      {skill.skillAuthor[0].toUpperCase() +
                        skill.skillAuthor.slice(1)}
                    </span>
                    <span className="ml-1 text-gray-400 font-normal">
                      endorsed{" "}
                    </span>
                    <span className="text-xs text-gray-500 italic">
                      {skill.recipient?.name ? (
                        <strong>{skill.recipient.name}</strong>
                      ) : (
                        "—"
                      )}
                    </span>
                  </div>
                  <div
                    className={`flex-1 flex items-center justify-between text-lg font-bold ${
                      isDarkMode ? "bg-gray-800 text-gray-100" : "bg-blue-200 text-gray-900"
                    }`}
                    style={{ minHeight: "2.5rem" }}
                  >
                    <span className="text-left w-1/2 pl-2 truncate">
                      {skill.skillText[0].toUpperCase() + skill.skillText.slice(1)}
                    </span>
                    <div className="flex items-center justify-end w-1/2">
                      {skill.reactions && skill.reactions.length > 0 && (
                        <div className="flex space-x-1 mr-2">
                          {skill.reactions.map((r, i) => (
                            <span
                              key={i}
                              title={r.user?.name || ""}
                              className="text-xl"
                            >
                              {r.emoji}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    className={`flex items-center justify-between px-3 py-2 border-t ${
                      isDarkMode ? "bg-gray-700" : "bg-blue-50"
                    }`}
                  >
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold shadow ${
                        isDarkMode ? "bg-gray-700 text-gray-100" : "bg-blue-300 text-blue-900"
                      }`}
                    >
                      {skill.createdAt}
                    </span>
                    <div className="flex items-center ml-2">
                      <SkillReaction
                        onReact={(emoji) =>
                          reactToSkill({ variables: { skillId: skill._id, emoji } })
                        }
                        buttonClass={`transition-colors duration-150 px-3 py-1 rounded-full font-semibold shadow focus:outline-none focus:ring-2 focus:ring-gray-400 hover:bg-gray-500 hover:text-white ${
                          isDarkMode ? "bg-gray-600 text-gray-100" : "bg-blue-300 text-blue-900"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
