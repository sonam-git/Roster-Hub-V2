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
import Auth from '../../utils/auth';
import { FaCog, FaUser, FaLock, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

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
    <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto">
      
      {/* Update Name Section */}
      <div className={`rounded-md p-4 sm:p-5 mb-5 border
        ${isDarkMode 
          ? 'bg-gray-900/50 border-gray-700' 
          : 'bg-gray-50 border-gray-200'
        }`}>
        <div className="flex items-center gap-2 mb-4">
          <FaUser className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          <h2 className={`text-sm sm:text-base font-semibold
            ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Update Name
          </h2>
        </div>
        
        {errorNameMessage && (
          <div className={`p-3 rounded-md border mb-3 flex items-start gap-2
            ${isDarkMode 
              ? 'bg-red-900/20 border-red-800 text-red-200' 
              : 'bg-red-50 border-red-200 text-red-700'
            }`}>
            <FaExclamationTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{errorNameMessage}</span>
          </div>
        )}
        
        {successMessage && (
          <div className={`p-3 rounded-md border mb-3 flex items-start gap-2
            ${isDarkMode 
              ? 'bg-green-900/20 border-green-800 text-green-200' 
              : 'bg-green-50 border-green-200 text-green-700'
            }`}>
            <FaCheck className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`flex-1 rounded-md border px-3 py-2 text-sm
              ${isDarkMode 
                ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:ring-blue-500 focus:border-blue-500' 
                : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } 
              focus:ring-2 focus:outline-none transition-colors`}
            placeholder="Enter your new name"
          />
          <button
            onClick={handleNameUpdate}
            className={`px-4 py-2 rounded-md text-sm font-medium text-white 
              transition-colors
              ${isDarkMode 
                ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800' 
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${isDarkMode ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}`}
          >
            Update
          </button>
        </div>
      </div>

      {/* Update Password Section */}
      <div className={`rounded-md p-4 sm:p-5 mb-5 border
        ${isDarkMode 
          ? 'bg-gray-900/50 border-gray-700' 
          : 'bg-gray-50 border-gray-200'
        }`}>
        <div className="flex items-center gap-2 mb-4">
          <FaLock className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          <h2 className={`text-sm sm:text-base font-semibold
            ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Update Password
          </h2>
        </div>
        
        {errorMessage && (
          <div className={`p-3 rounded-md border mb-3 flex items-start gap-2
            ${isDarkMode 
              ? 'bg-red-900/20 border-red-800 text-red-200' 
              : 'bg-red-50 border-red-200 text-red-700'
            }`}>
            <FaExclamationTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{errorMessage}</span>
          </div>
        )}
        
        {passwordSuccessMessage && (
          <div className={`p-3 rounded-md border mb-3 flex items-start gap-2
            ${isDarkMode 
              ? 'bg-green-900/20 border-green-800 text-green-200' 
              : 'bg-green-50 border-green-200 text-green-700'
            }`}>
            <FaCheck className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{passwordSuccessMessage}</span>
          </div>
        )}
        
        <div className="space-y-3">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={`w-full rounded-md border px-3 py-2 text-sm
              ${isDarkMode 
                ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:ring-blue-500 focus:border-blue-500' 
                : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } 
              focus:ring-2 focus:outline-none transition-colors`}
            placeholder="Enter current password"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={`w-full rounded-md border px-3 py-2 text-sm
              ${isDarkMode 
                ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:ring-blue-500 focus:border-blue-500' 
                : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } 
              focus:ring-2 focus:outline-none transition-colors`}
            placeholder="Enter new password"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full rounded-md border px-3 py-2 text-sm
              ${isDarkMode 
                ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:ring-blue-500 focus:border-blue-500' 
                : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } 
              focus:ring-2 focus:outline-none transition-colors`}
            placeholder="Confirm your new password"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:flex sm:flex-row sm:justify-between sm:items-center gap-3 mt-4">
          <button
            onClick={handlePasswordChange}
            className={`w-full sm:w-auto px-4 py-2 rounded-md text-sm font-medium text-white 
              transition-colors
              ${isDarkMode 
                ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800' 
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${isDarkMode ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}`}
          >
            Change Password
          </button>
          <RemoveAccount onRemove={handleRemove} profileId={userId} isDarkMode={isDarkMode} />
        </div>
      </div>
      
      {showFarewell && <FarewellModal onClose={handleLogout} />}
    </div>
  );
  
};

export default ProfileSettings;
