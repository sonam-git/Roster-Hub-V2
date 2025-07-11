import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useNavigate } from 'react-router-dom';
import {
  UPDATE_NAME_MUTATION,
  UPDATE_PASSWORD_MUTATION,
  DELETE_PROFILE,
} from "../../utils/mutations";
import { QUERY_ME } from "../../utils/queries";
import RemoveAccount from "../RemoveAccount";
import FarewellModal from "../FareWellModal";
import Auth from '../../utils/auth'

const ProfileSettings = ({ isDarkMode }) => {
  const navigate = useNavigate();

  const {data} = useQuery(QUERY_ME);
  const userId = data.me._id;

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorNameMessage, setErrorNameMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");
  const [showFarewell, setShowFarewell] = useState(false);

  const [updateName] = useMutation(UPDATE_NAME_MUTATION);
  const [updatePassword] = useMutation(UPDATE_PASSWORD_MUTATION);
  const [deleteProfile] = useMutation(DELETE_PROFILE);
 

  const handleNameUpdate = async () => {
    if (!name) {
      setErrorNameMessage('Please provide desired new name');
      setTimeout(() => setErrorNameMessage(""), 3000); 
      return;
    }
    try {
      await updateName({ variables: { name }, refetchQueries: [QUERY_ME] });
      setSuccessMessage("Your name has been changed successfully.");
      setName(""); // Clear input field after successful update
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000); // Remove success message after 3 seconds
    } catch (error) {
      console.error("Error updating name:", error);
    }
  };

  const handlePasswordChange = async () => {
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('Please provide all inputs');
      setTimeout(() => setErrorMessage(""), 3000); // Clear error message after 3 seconds
      return;
    }
    try {
      if (newPassword !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
        return;
      }
      await updatePassword({ variables: { currentPassword, newPassword } });
      setPasswordSuccessMessage("Your password has been changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setPasswordSuccessMessage("");
        setErrorMessage("");
      }, 4000);
    } catch (error) {
      console.error("Error updating password:", error);
      setErrorMessage("Failed to update password. Please try again.");
    }
  };

  const handleRemove = async (profileId) => {
    try {
      await deleteProfile({ variables: { profileId } });
      setShowFarewell(true);
    } catch (error) {
      console.error('Error removing profile:', error);
    }
  };

  const handleLogout = () => {
    Auth.logout();
    navigate('/');
  };

  return (
    <div className={`max-w-md mx-auto rounded-2xl shadow-2xl border border-blue-100 dark:border-gray-700 bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 p-6 ${isDarkMode ? 'text-white' : 'text-black'}`}> 
      <h2 className={`text-lg md:text-xl lg:text-xl xl:text-xl font-extrabold mb-4 tracking-tight drop-shadow ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>Update Name</h2>
      {errorNameMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-2 rounded relative" role="alert">
          <span className="block sm:inline">{errorNameMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 mb-2 rounded relative" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className=" block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm sm:text-base"
          placeholder="Enter your new name"
        />
        <br></br>
        <button
          onClick={handleNameUpdate}
          className=" w-full sm:w-auto text-sm sm:text-base  bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 sm:ml-2 sm:mt-0  rounded-md"
        >
          Update
        </button>
      </div>
      <h2 className={`text-lg md:text-xl lg:text-xl xl:text-xl font-extrabold my-6 tracking-tight drop-shadow ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>Update Password</h2>
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-2 rounded relative" role="alert">
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}
      {passwordSuccessMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 mb-2 rounded relative" role="alert">
          <span className="block sm:inline">{passwordSuccessMessage}</span>
        </div>
      )}
      <input
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm sm:text-base mb-2"
        placeholder="Enter current password"
      />
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm sm:text-base mb-2"
        placeholder="Enter new password"
      />
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm sm:text-base mb-2"
        placeholder="Confirm your new password"
      />
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <button
          onClick={handlePasswordChange}
          className={`w-full sm:w-auto text-sm sm:text-base font-semibold py-2 px-4 rounded-md mt-4 sm:mt-0 shadow-lg transition-colors ${isDarkMode ? 'bg-indigo-700 hover:bg-indigo-600 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white'}`}
        >
          Change Password
        </button>
        <RemoveAccount onRemove={handleRemove} profileId={userId} />
        {showFarewell && <FarewellModal onClose={handleLogout} />}
      </div>
    </div>
  );
  
};

export default ProfileSettings;
