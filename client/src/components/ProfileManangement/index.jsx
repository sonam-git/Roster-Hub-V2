import  { useState } from 'react';
import UserInfoForm from '../UserInfoForm';
import ProfileSettings from '../ProfileSettings';
import { FaUserEdit, FaUser, FaCog } from "react-icons/fa";

const ProfileManagement = ({me ,isDarkMode}) => {
 
  const [activeComponent, setActiveComponent] = useState('userInfo'); // Default to 'userInfo'

  return (
      <div className={`rounded-lg border p-6 w-full ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-gray-50 border-gray-200'
      } ${isDarkMode ? 'text-white' : 'text-black'}`}>
        
        {/* Header Section */}
        <div className="mb-6">
          <h2 className={`text-lg font-semibold mb-1 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Settings
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your profile information and account preferences
          </p>
        </div>

        {/* Tab Navigation */}
        <div className={`flex mb-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeComponent === 'userInfo'
                ? isDarkMode 
                  ? 'border-blue-500 text-white' 
                  : 'border-blue-600 text-blue-600'
                : isDarkMode 
                  ? 'border-transparent text-gray-400 hover:text-white' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveComponent('userInfo')}
          >
            <div className="flex items-center gap-2">
              <FaUser className="text-xs" />
              <span>Profile</span>
            </div>
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeComponent === 'profileSettings'
                ? isDarkMode 
                  ? 'border-blue-500 text-white' 
                  : 'border-blue-600 text-blue-600'
                : isDarkMode 
                  ? 'border-transparent text-gray-400 hover:text-white' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveComponent('profileSettings')}
          >
            <div className="flex items-center gap-2">
              <FaCog className="text-xs" />
              <span>Account</span>
            </div>
          </button>
        </div>

        {/* Content Area */}
        <div>
          {activeComponent === 'userInfo' && (
            <div>
              <div className="mb-4">
                <h3 className={`text-base font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Profile Information
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Update your personal details and profile information
                </p>
              </div>
              <UserInfoForm user={me} isDarkMode={isDarkMode} />
            </div>
          )}

          {activeComponent === 'profileSettings' && (
            <div>
              <div className="mb-4">
                <h3 className={`text-base font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Account Settings
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage your account settings and privacy preferences
                </p>
              </div>
              <ProfileSettings user={me} isDarkMode={isDarkMode} />
            </div>
          )}
        </div>
      </div>
  );
};

export default ProfileManagement;
