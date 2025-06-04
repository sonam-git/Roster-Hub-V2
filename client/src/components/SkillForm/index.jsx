"use client"; // important if using Next.js or React Server Components

import React, { useOptimistic, useRef } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { ADD_SKILL } from "../../utils/mutations";
import { QUERY_ME, QUERY_SINGLE_PROFILE } from "../../utils/queries";
import Auth from "../../utils/auth";

const SkillForm = ({ profileId, teamMate }) => {
  const authProfileId = Auth.getProfile().data._id;

  const [addSkill] = useMutation(ADD_SKILL, {
    refetchQueries: [
      {
        query: profileId ? QUERY_SINGLE_PROFILE : QUERY_ME,
        variables: { profileId: profileId },
      },
    ],
  });

  const inputRef = useRef(null);
  const [optimisticSkills, addOptimisticSkill] = useOptimistic([], (state, newSkill) => [
    ...state,
    { id: "optimistic-" + Date.now(), text: newSkill },
  ]);

  async function handleSubmit(formData) {
    const skillText = formData.get("skill");

    if (!skillText) return;

    addOptimisticSkill(skillText);

    try {
      await addSkill({
        variables: { profileId, skillText },
      });
    } catch (err) {
      console.error("Submission error:", err.message);
    }

    inputRef.current.value = ""; // clear field
  }

  return (
    <div className="rounded-md bg-gray-100 dark:bg-gray-600 p-5 w-full">
      <h4 className="text-base md:text-lg lg:text-xl font-bold mb-3">
        {profileId !== authProfileId ? `Endorse ${teamMate}` : "Endorse Yourself"}
      </h4>

      {Auth.loggedIn() ? (
        <form action={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <input
            ref={inputRef}
            type="text"
            name="skill"
            placeholder="Endorse your teammate..."
            className="flex-1 rounded-md border-0 px-4 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline focus:ring-2 focus:ring-indigo-600 w-full md:w-auto"
          >
            Endorse
          </button>
        </form>
      ) : (
        <p className="mt-2 text-sm">
          You need to be logged in to add information. Please{" "}
          <Link to="/login" className="text-blue-600 underline">Login</Link> or{" "}
          <Link to="/signup" className="text-blue-600 underline">Signup</Link>.
        </p>
      )}

      {optimisticSkills.length > 0 && (
        <ul className="mt-4 list-disc list-inside text-sm text-green-700">
          {optimisticSkills.map((skill, index) => (
            <li key={index}>{skill.text || skill}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SkillForm;
