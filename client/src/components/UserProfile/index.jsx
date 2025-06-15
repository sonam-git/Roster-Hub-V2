import React, { useContext, useState } from 'react';
import SkillsList from '../SkillsList';
import ProfileCard from '../ProfileCard';
import SkillForm from '../SkillForm';
import { ThemeContext } from '../ThemeContext';
import PostsList from '../PostsList';

const UserProfile = ({ profile }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('skills'); // 'skills' or 'posts'

  return (
    <div className={`md:flex md:space-x-2 p-3 rounded-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
      {/* Left Side */}
      <div className="md:w-2/5 p-2">
        <div className={`w-full rounded-lg overflow-hidden `}>
          <ProfileCard profile={profile} isDarkMode={isDarkMode} />
        </div>
      </div>

      {/* Right Side */}
      <div className="md:w-3/5 p-2">
        <div className={`w-full h-full rounded-lg shadow-md ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
          {/* Buttons row */}
          <div className="flex w-full p-2">
            <button
              className={`w-1/2 px-4 py-2 rounded-l-lg font-bold text-sm transition duration-300 ${
                activeTab === 'posts'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-dark text-gray-700 dark:bg-gray-800 dark:text-white'
              }`}
              onClick={() => setActiveTab('posts')}
            >
              POST
            </button>
            <button
              className={`w-1/2 px-4 py-2 rounded-r-lg font-bold text-sm transition duration-300  ${
                activeTab === 'skills'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-dark text-gray-700 dark:bg-gray-800 dark:text-white'
              }`}
              onClick={() => setActiveTab('skills')}
            >
              SKILL
            </button>
          </div>

          <div className="p-4">
            {activeTab === 'skills' ? (
              <div className="flex flex-col gap-4">
                <SkillsList skills={profile.skills || []} isDarkMode={isDarkMode} profile={profile} />
                <SkillForm profileId={profile._id} teamMate={profile.name} />
              </div>
            ) : (
              <PostsList profileId={profile._id} isDarkMode={isDarkMode} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
