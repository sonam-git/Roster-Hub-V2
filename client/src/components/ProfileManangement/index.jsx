import React, { useState } from 'react';
import UserInfoForm from '../UserInfoForm';
import ProfileSettings from '../ProfileSettings';
import { FaEdit, FaUser, FaCog } from "react-icons/fa";

const ProfileManagement = ({me ,isDarkMode}) => {
 
  const [activeComponent, setActiveComponent] = useState('userInfo'); // Default to 'userInfo'

  return (
      <div className={`rounded-3xl shadow-2xl border-2 transition-all duration-500 hover:shadow-3xl transform hover:scale-[1.01] p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-black border-gray-600 shadow-gray-900/50' 
          : 'bg-gradient-to-br from-white via-blue-50 to-indigo-50 border-blue-300 shadow-blue-500/20'
      } ${isDarkMode ? 'text-white' : 'text-black'}`}>
        
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <FaCog className="text-white text-lg sm:text-2xl animate-spin-slow" />
          </div>
          <h2 className={`text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${
            isDarkMode ? 'from-blue-400 to-purple-400' : 'from-blue-600 to-purple-600'
          }`}>
            Settings Dashboard
          </h2>
          <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} px-4`}>
            Manage your profile information and account preferences
          </p>
        </div>

        {/* Modern Tab Navigation */}
        <div className={`flex justify-center mb-6 sm:mb-8 px-2`}>
          <div className={`flex rounded-2xl p-1 sm:p-1.5 shadow-lg border transition-all duration-300 w-full sm:w-auto ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-600 shadow-gray-900/20' 
              : 'bg-white border-gray-200 shadow-blue-100/50'
          }`}>
            <button
              className={`relative flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center gap-2 sm:gap-3 ${
                activeComponent === 'userInfo'
                  ? `${isDarkMode 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30' 
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                    }` 
                  : `${isDarkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`
              }`}
              onClick={() => setActiveComponent('userInfo')}
            >
              <FaUser className="text-xs sm:text-sm" />
              <span className="hidden xs:inline sm:inline">Profile</span>
              <span className="xs:hidden sm:hidden">Profile</span>
              {activeComponent === 'userInfo' && (
                <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
              )}
            </button>
            <button
              className={`relative flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center gap-2 sm:gap-3 ${
                activeComponent === 'profileSettings'
                  ? `${isDarkMode 
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30' 
                      : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                    }` 
                  : `${isDarkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`
              }`}
              onClick={() => setActiveComponent('profileSettings')}
            >
              <FaCog className="text-xs sm:text-sm" />
              <span className="hidden xs:inline sm:inline">Account</span>
              <span className="xs:hidden sm:hidden">Account</span>
              {activeComponent === 'profileSettings' && (
                <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className={`transition-all duration-500 ease-in-out`}>
          <div className={`p-3 sm:p-4 lg:p-6 rounded-2xl border backdrop-blur-sm ${
            isDarkMode 
              ? 'bg-gray-800/30 border-gray-700 shadow-gray-900/20' 
              : 'bg-white/70 border-gray-200 shadow-blue-100/50'
          } shadow-lg`}>
            <div className="w-full max-w-2xl mx-auto">
              {/* Profile Settings Tab */}
              {activeComponent === 'userInfo' && (
                <div className="animate-fade-in">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                      <FaUser className="text-white text-xs sm:text-sm" />
                    </div>
                    <div>
                      <h3 className={`text-lg sm:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        Profile Information
                      </h3>
                      <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Update your personal details and profile information
                      </p>
                    </div>
                  </div>
                  <UserInfoForm profileId={me._id} isDarkMode={isDarkMode} />
                </div>
              )}

              {/* Account Settings Tab */}
              {activeComponent === 'profileSettings' && (
                <div className="animate-fade-in">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                      <FaCog className="text-white text-xs sm:text-sm" />
                    </div>
                    <div>
                      <h3 className={`text-lg sm:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        Account Preferences
                      </h3>
                      <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Manage your account settings and privacy preferences
                      </p>
                    </div>
                  </div>
                  <ProfileSettings user={me} isDarkMode={isDarkMode} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default ProfileManagement;
