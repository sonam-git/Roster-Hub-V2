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
        <div className={`w-full h-full rounded-lg shadow-md border ${isDarkMode ? 'bg-gray-800 border-white' : 'bg-gray-10 border-black'}`}>
          {/* Buttons row */}
          <div className="flex w-full p-2">
            <button
              className={`w-1/2 px-4 py-2 rounded-l-lg font-bold text-sm transition duration-300 ${
                activeTab === 'posts'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-white'
              }`}
              onClick={() => setActiveTab('posts')}
            >
              POST
            </button>
            <button
              className={`w-1/2 px-4 py-2 rounded-r-lg font-bold text-sm transition duration-300  ${
                activeTab === 'skills'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-white'
              }`}
              onClick={() => setActiveTab('skills')}
            >
              SKILL
            </button>
          </div>

          <div className="p-4  rounded-b-lg">
            {activeTab === 'skills' ? (
              <div className="w-full flex flex-col gap-4">
                {profile.skills && profile.skills.length > 0 ? (
                  <SkillsList skills={profile.skills} isDarkMode={isDarkMode} profile={profile} />
                ) : (
                  <div className="w-full flex flex-col items-center justify-center py-8">
                    <p className="text-md text-gray-500 dark:text-gray-400 italic">
                      {profile.name} has no endorsed skills yet.
                    </p>
                  </div>
                )}
                <SkillForm profileId={profile._id} teamMate={profile.name} />
              </div>
            ) : (
              <PostsList profileId={profile._id} isDarkMode={isDarkMode} profile={profile} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
