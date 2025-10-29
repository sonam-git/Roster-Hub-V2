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
    <div className={`w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto rounded-3xl shadow-2xl backdrop-blur-lg 
      ${isDarkMode 
        ? 'bg-gradient-to-br from-gray-800/90 via-gray-900/90 to-purple-900/90 border border-gray-600/30 shadow-purple-500/20' 
        : 'bg-gradient-to-br from-white/90 via-blue-50/90 to-indigo-100/90 border border-blue-200/50 shadow-blue-500/20'
      } p-4 sm:p-6 md:p-8 lg:p-10 transition-all duration-300 hover:shadow-3xl hover:scale-[1.02] card-float`}>
      
      {/* Header */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full mb-4 
          ${isDarkMode ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'} 
          shadow-xl`}>
          <FaCog className="text-white text-lg sm:text-xl animate-spin-slow" />
        </div>
        <h1 className={`text-base sm:text-lg md:text-xl font-bold mb-3 gradient-text
          ${isDarkMode ? 'from-blue-300 to-purple-300' : 'from-blue-600 to-indigo-600'}`}>
          Profile Settings
        </h1>
        <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Manage your account information and preferences
        </p>
      </div>

      {/* Update Name Section */}
      <div className={`rounded-2xl p-4 sm:p-5 mb-5 border backdrop-blur-sm
        ${isDarkMode 
          ? 'bg-gray-800/40 border-gray-600/40' 
          : 'bg-white/60 border-blue-200/40'
        }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-blue-600/30' : 'bg-blue-100'}`}>
            <FaUser className={`text-base ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <h2 className={`text-sm sm:text-base md:text-lg font-bold
            ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
            Update Name
          </h2>
        </div>
        
        {errorNameMessage && (
          <div className={`p-2 sm:p-3 rounded-xl border-l-4 mb-3 animate-in slide-in-from-left-2 duration-300 flex items-center
            ${isDarkMode 
              ? 'bg-red-900/50 border-red-500 text-red-200' 
              : 'bg-red-50 border-red-500 text-red-700'
            }`}>
            <FaExclamationTriangle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
            <span className="text-sm font-medium">{errorNameMessage}</span>
          </div>
        )}
        
        {successMessage && (
          <div className={`p-2 sm:p-3 rounded-xl border-l-4 mb-3 animate-in slide-in-from-left-2 duration-300 flex items-center
            ${isDarkMode 
              ? 'bg-green-900/50 border-green-500 text-green-200' 
              : 'bg-green-50 border-green-500 text-green-700'
            }`}>
            <FaCheck className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`flex-1 rounded-xl border-0 px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium
              ${isDarkMode 
                ? 'bg-gray-700/60 text-white placeholder-gray-400 ring-gray-600/50 focus:ring-indigo-500/60' 
                : 'bg-white/90 text-gray-900 placeholder-gray-500 ring-blue-200/60 focus:ring-indigo-500/60'
              } 
              shadow-lg ring-1 ring-inset backdrop-blur-sm
              focus:ring-2 focus:ring-inset focus:shadow-xl
              transition-all duration-300 hover:shadow-lg hover:scale-[1.01]`}
            placeholder="Enter your new name"
          />
          <button
            onClick={handleNameUpdate}
            className={`px-4 sm:px-5 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold text-white 
              shadow-lg transition-all duration-300 transform hover:scale-[1.02]
              ${isDarkMode 
                ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-500 hover:via-purple-500 hover:to-blue-500' 
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-500'
              }
              hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-300/50 button-glow
              relative overflow-hidden group min-w-[80px]`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <span className="relative z-10">Update</span>
          </button>
        </div>
      </div>

      {/* Update Password Section */}
      <div className={`rounded-2xl p-4 sm:p-5 mb-5 border backdrop-blur-sm
        ${isDarkMode 
          ? 'bg-gray-800/40 border-gray-600/40' 
          : 'bg-white/60 border-blue-200/40'
        }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-purple-600/30' : 'bg-purple-100'}`}>
            <FaLock className={`text-base ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
          <h2 className={`text-sm sm:text-base md:text-lg font-bold
            ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
            Update Password
          </h2>
        </div>
        
        {errorMessage && (
          <div className={`p-2 sm:p-3 rounded-xl border-l-4 mb-3 animate-in slide-in-from-left-2 duration-300 flex items-center
            ${isDarkMode 
              ? 'bg-red-900/50 border-red-500 text-red-200' 
              : 'bg-red-50 border-red-500 text-red-700'
            }`}>
            <FaExclamationTriangle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
            <span className="text-sm font-medium">{errorMessage}</span>
          </div>
        )}
        
        {passwordSuccessMessage && (
          <div className={`p-2 sm:p-3 rounded-xl border-l-4 mb-3 animate-in slide-in-from-left-2 duration-300 flex items-center
            ${isDarkMode 
              ? 'bg-green-900/50 border-green-500 text-green-200' 
              : 'bg-green-50 border-green-500 text-green-700'
            }`}>
            <FaCheck className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
            <span className="text-sm font-medium">{passwordSuccessMessage}</span>
          </div>
        )}
        
        <div className="space-y-2">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={`w-full rounded-xl border-0 px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium
              ${isDarkMode 
                ? 'bg-gray-700/60 text-white placeholder-gray-400 ring-gray-600/50 focus:ring-purple-500/60' 
                : 'bg-white/90 text-gray-900 placeholder-gray-500 ring-purple-200/60 focus:ring-purple-500/60'
              } 
              shadow-lg ring-1 ring-inset backdrop-blur-sm
              focus:ring-2 focus:ring-inset focus:shadow-xl
              transition-all duration-300 hover:shadow-lg hover:scale-[1.01]`}
            placeholder="Enter current password"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={`w-full rounded-xl border-0 px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium
              ${isDarkMode 
                ? 'bg-gray-700/60 text-white placeholder-gray-400 ring-gray-600/50 focus:ring-purple-500/60' 
                : 'bg-white/90 text-gray-900 placeholder-gray-500 ring-purple-200/60 focus:ring-purple-500/60'
              } 
              shadow-lg ring-1 ring-inset backdrop-blur-sm
              focus:ring-2 focus:ring-inset focus:shadow-xl
              transition-all duration-300 hover:shadow-lg hover:scale-[1.01]`}
            placeholder="Enter new password"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full rounded-xl border-0 px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium
              ${isDarkMode 
                ? 'bg-gray-700/60 text-white placeholder-gray-400 ring-gray-600/50 focus:ring-purple-500/60' 
                : 'bg-white/90 text-gray-900 placeholder-gray-500 ring-purple-200/60 focus:ring-purple-500/60'
              } 
              shadow-lg ring-1 ring-inset backdrop-blur-sm
              focus:ring-2 focus:ring-inset focus:shadow-xl
              transition-all duration-300 hover:shadow-lg hover:scale-[1.01]`}
            placeholder="Confirm your new password"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
          <button
            onClick={handlePasswordChange}
            className={`w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold text-white 
              shadow-lg transition-all duration-300 transform hover:scale-[1.02]
              ${isDarkMode 
                ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 hover:from-purple-500 hover:via-green-500 hover:to-red-500' 
                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500'
              }
              hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-300/50 button-glow
              relative overflow-hidden group min-w-[120px]`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <span className="relative z-10">Change Password</span>
          </button>
          <RemoveAccount onRemove={handleRemove} profileId={userId} isDarkMode={isDarkMode} />
        </div>
      </div>
      
      {showFarewell && <FarewellModal onClose={handleLogout} />}
    </div>
  );
  
};

export default ProfileSettings;
