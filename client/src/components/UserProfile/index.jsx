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
        <div className={`w-full h-full rounded-2xl shadow-2xl border border-blue-100 dark:border-gray-700 bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 ${isDarkMode ? 'text-white' : 'text-black'}`}> 
          {/* Buttons row */}
          <div className="flex w-full p-2">
            <button
              className={`w-1/2 px-4 py-2 rounded-l-lg font-serif font-bold shadow transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm ${
                activeTab === 'posts'
                  ? 'bg-blue-600 text-white scale-105'
                  : 'bg-white text-dark text-gray-700 dark:bg-gray-800 dark:text-white hover:bg-blue-100'
              }`}
              onClick={() => setActiveTab('posts')}
            >
              POST
            </button>
            <button
              className={`w-1/2 px-4 py-2 rounded-r-lg font-serif font-bold shadow transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm ${
                activeTab === 'skills'
                  ? 'bg-blue-600 text-white scale-105'
                  : 'bg-white text-dark text-gray-700 dark:bg-gray-800 dark:text-white hover:bg-blue-100'
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
