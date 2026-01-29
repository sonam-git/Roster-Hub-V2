// src/components/SkillForm.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { ADD_SKILL } from "../../utils/mutations";
import { QUERY_ME, QUERY_SINGLE_PROFILE, GET_SKILLS } from "../../utils/queries";
import Auth from "../../utils/auth";
import { useOrganization } from "../../contexts/OrganizationContext";

const SkillForm = ({ profileId, teamMate, isDarkMode = false }) => {
  const { currentOrganization } = useOrganization();
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
    
    if (!currentOrganization) {
      setErrorMessage("No organization selected.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    
    setErrorMessage("");
    try {
      await addSkill({ 
        variables: { 
          profileId, 
          skillText: text,
          organizationId: currentOrganization._id
        } 
      });
      setSkillText("");
      // Force refetch of all skills for recents list
      if (client) {
        client.refetchQueries({ include: [GET_SKILLS] });
      }
    } catch (err) {
      console.error("Submission error:", err);
      setErrorMessage("Failed to submit endorsement. Please try again.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  return (
    <div className="w-full">
      {Auth.loggedIn() ? (
        <>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              name="skill"
              placeholder={profileId !== authProfileId ? `Endorse ${teamMate}...` : "Endorse Yourself..."}
              value={skillText}
              onChange={(e) => {
                setSkillText(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              className={`flex-1 rounded-md border px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors ${
                isDarkMode 
                  ? 'text-white bg-gray-700 border-gray-600' 
                  : 'text-gray-900 bg-white border-gray-300'
              }`}
            />
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 whitespace-nowrap"
            >
              Endorse
            </button>
          </form>
          {errorMessage && (
            <p className={`mt-3 text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
              {errorMessage}
            </p>
          )}
        </>
      ) : (
        <div className={`p-4 rounded-md border text-center ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            You need to be logged in to endorse skills.{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Login
            </Link>
            {" "}or{" "}
            <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
              Signup
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
};

export default SkillForm;
