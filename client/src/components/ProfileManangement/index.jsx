import React, { useState } from 'react';
import UserInfoForm from '../UserInfoForm';
import ProfileSettings from '../ProfileSettings';
import { FaEdit } from "react-icons/fa";

const ProfileManagement = ({me ,isDarkMode}) => {
 
  const [activeComponent, setActiveComponent] = useState('userInfo'); // Default to 'userInfo'

  return (
      <div className={` rounded-lg shadow-md p-6 max-w-2xl ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-white text-black'}`}>
        <div className="flex justify-between items-center mb-4">
          <button
            className={`font-serif text-xs md:text-md lg:text-lg xl:text-xl px-2 py-2 rounded-md ${activeComponent === 'userInfo' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'}`}
            onClick={() => setActiveComponent('userInfo')}
          >
            Profile Setting <FaEdit className="inline ml-2" />
          </button>
  
          <button
            className={` font-serif px-2 py-2 text-xs md:text-md lg:text-lg xl:text-xl rounded-md ${activeComponent === 'profileSettings' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'}`}
            onClick={() => setActiveComponent('profileSettings')}
          >
            Account Setting <FaEdit className="inline ml-2" />
          </button>
        </div>
        <div className={`my-9 p-4 border border-dotted border-gray-300 rounded ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-white text-black'}`}>
          {activeComponent === 'userInfo' && <UserInfoForm profileId={me._id} isDarkMode={isDarkMode} />}
          {activeComponent === 'profileSettings' && <ProfileSettings user={me}  isDarkMode={isDarkMode}/>}
        </div>
      </div>
  );
};

export default ProfileManagement;
