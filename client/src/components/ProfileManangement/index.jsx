import React, { useState } from 'react';
import UserInfoForm from '../UserInfoForm';
import ProfileSettings from '../ProfileSettings';
import { FaEdit } from "react-icons/fa";

const ProfileManagement = ({me ,isDarkMode}) => {
 
  const [activeComponent, setActiveComponent] = useState('userInfo'); // Default to 'userInfo'

  return (
      <div className={`rounded-2xl shadow-2xl border border-blue-100 dark:border-gray-700 bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 p-6 max-w-2xl mx-auto ${isDarkMode ? 'text-white' : 'text-black'}`}>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2">
          <button
            className={`font-serif text-xs md:text-md lg:text-lg xl:text-xl px-4 py-2 rounded-lg font-bold shadow transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 ${activeComponent === 'userInfo' ? 'bg-blue-600 text-white scale-105' : 'bg-gray-200 text-gray-900 hover:bg-blue-100'}`}
            onClick={() => setActiveComponent('userInfo')}
          >
            Profile Setting <FaEdit className="inline ml-2 " />
          </button>
          <button
            className={`font-serif px-4 py-2 text-xs md:text-md lg:text-lg xl:text-xl rounded-lg font-bold shadow transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 ${activeComponent === 'profileSettings' ? 'bg-blue-600 text-white scale-105' : 'bg-gray-200 text-gray-900 hover:bg-blue-100'}`}
            onClick={() => setActiveComponent('profileSettings')}
          >
            Account Setting <FaEdit className="inline ml-2" />
          </button>
        </div>
        <div className={`my-9 p-0 border-none w-full flex justify-center`}>
          <div className="w-full max-w-lg">
            {activeComponent === 'userInfo' && <UserInfoForm profileId={me._id} isDarkMode={isDarkMode} />}
            {activeComponent === 'profileSettings' && <ProfileSettings user={me}  isDarkMode={isDarkMode}/>} 
          </div>
        </div>
      </div>
  );
};

export default ProfileManagement;
