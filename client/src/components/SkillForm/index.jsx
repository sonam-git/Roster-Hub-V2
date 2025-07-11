// src/components/SkillForm.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { ADD_SKILL } from "../../utils/mutations";
import { QUERY_ME, QUERY_SINGLE_PROFILE, GET_SKILLS } from "../../utils/queries";
import Auth from "../../utils/auth";

const SkillForm = ({ profileId, teamMate }) => {
  const authProfileId = Auth.getProfile().data._id;
  const [skillText, setSkillText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [addSkill, { client }] = useMutation(ADD_SKILL);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = skillText.trim();
    if (!text) {
      setErrorMessage("Please enter a skill to endorse.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    setErrorMessage("");
    try {
      await addSkill({ variables: { profileId, skillText: text } });
      setSkillText("");
      // Force refetch of all skills for recents list
      if (client) {
        client.refetchQueries({ include: [GET_SKILLS] });
      }
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  return (
    <div className="rounded-md bg-gray-200 dark:bg-gray-600 p-5 w-full">
      {/* <h4 className="text-base md:text-lg lg:text-xl font-bold mb-3">
        {profileId !== authProfileId ? `Endorse ${teamMate}` : "Endorse Yourself"}
      </h4> */}

      {Auth.loggedIn() ? (
        <>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              name="skill"
              placeholder={profileId !== authProfileId ? `Endorse ${teamMate}` : "Endorse Yourself"}
              value={skillText}
              onChange={(e) => {
                setSkillText(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              className="flex-1 rounded-md border-0 px-4 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
            />
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 w-full md:w-auto"
            >
              Endorse
            </button>
          </form>
          {errorMessage && (
            <p className="mt-2 text-red-600 italic">{errorMessage}</p>
          )}
        </>
      ) : (
        <p className="mt-2 text-sm">
          You need to be logged in to add information. Please{" "}
          <Link to="/login" className="text-blue-600 underline">Login</Link> or{" "}
          <Link to="/signup" className="text-blue-600 underline">Signup</Link>.
        </p>
      )}
    </div>
  );
};

export default SkillForm;
