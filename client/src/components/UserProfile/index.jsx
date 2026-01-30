import React, { useContext, useState } from 'react';
import SkillsList from '../SkillsList';
import ProfileCard from '../ProfileCard';
import SkillForm from '../SkillForm';
import { ThemeContext } from '../ThemeContext';
import PostsList from '../PostsList';
import FriendGames from '../FriendGames';
import MessageBox from '../MessageBox';
import RatingModal from '../RatingModal';
import { FaUserFriends, FaStar, FaCommentDots } from 'react-icons/fa';

const UserProfile = ({ profile }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('skills'); // 'skills', 'posts', or 'games'
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [skillsPage, setSkillsPage] = useState(0); // For skills pagination

  const SKILLS_PER_PAGE = 2; // Show only 2 skills at a time
  
  // Calculate pagination for skills
  const totalSkills = profile.skills?.length || 0;
  const totalSkillsPages = Math.ceil(totalSkills / SKILLS_PER_PAGE);
  const startIndex = skillsPage * SKILLS_PER_PAGE;
  const endIndex = startIndex + SKILLS_PER_PAGE;
  const paginatedSkills = profile.skills?.slice(startIndex, endIndex) || [];

  const handlePrevSkills = () => {
    setSkillsPage(Math.max(0, skillsPage - 1));
  };

  const handleNextSkills = () => {
    setSkillsPage(Math.min(totalSkillsPages - 1, skillsPage + 1));
  };

  const handleMessageClick = () => {
    console.log('🔴 UserProfile: Opening message modal');
    setShowMessageModal(true);
  };

  const handleCloseMessage = () => {
    console.log('🔴 UserProfile: handleCloseMessage called - closing modal');
    setShowMessageModal(false);
  };
  const handleRateClick = () => setShowRatingModal(true);
  const handleCloseRating = () => setShowRatingModal(false);

  return (
    <div className={`md:flex md:space-x-1 mt-4 mb-6 ${isDarkMode ? 'text-white' : 'text-black'}`}>
      {/* Left Side - Profile Card */}
      <div className="md:w-2/5">
        <div className={`w-full mt-3 rounded-lg overflow-hidden shadow-lg border transition-all ${
          isDarkMode 
            ? "bg-gray-800 border-gray-700" 
            : "bg-white border-gray-200"
        }`}>
          {/* Header with friend indicator */}
          <div className={`w-full h-12 sm:h-14 flex items-center justify-center ${
            isDarkMode 
              ? "bg-blue-600" 
              : "bg-blue-600"
          }`}>
            <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md bg-white/20 text-white font-medium text-xs sm:text-sm">
              <FaUserFriends className="text-xs sm:text-sm" />
              <span className="hidden xs:inline">Friend's Profile</span>
              <span className="xs:hidden">Friend</span>
            </div>
          </div>
          
          <div className="py-4 sm:py-6 px-3 sm:px-4">
            <ProfileCard profile={profile} isDarkMode={isDarkMode} />
          </div>

          {/* Modern Action Buttons */}
          <div className="px-3 sm:px-4 pb-4 sm:pb-6">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {/* Rate Button */}
              <button
                onClick={handleRateClick}
                className={`px-3 py-2.5 sm:px-4 sm:py-3 rounded-md font-medium text-xs sm:text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isDarkMode 
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500 focus:ring-offset-gray-800' 
                    : 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500 focus:ring-offset-white'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <FaStar className="text-sm sm:text-base" />
                  <span className="hidden xs:inline">Rate Player</span>
                  <span className="xs:hidden">Rate</span>
                </div>
              </button>

              {/* Message Button */}
              <button
                onClick={handleMessageClick}
                className={`px-3 py-2.5 sm:px-4 sm:py-3 rounded-md font-medium text-xs sm:text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isDarkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 focus:ring-offset-gray-800' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 focus:ring-offset-white'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <FaCommentDots className="text-sm sm:text-base" />
                  <span className="hidden xs:inline">Send Message</span>
                  <span className="xs:hidden">Message</span>
                </div>
              </button>
            </div>

            {/* Action Buttons Description */}
            <div className={`mt-3 text-center text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                <span>Rate {profile.name}'s performance or start a conversation</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Content */}
      <div className="md:w-3/5 mt-4 md:mt-0">
        <div className={`w-full h-full rounded-lg shadow-lg border transition-all ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          {/* Modern Tab Navigation */}
          <div className="p-4 sm:p-6 pb-0">
            <div className={`flex rounded-md p-1 border ${
              isDarkMode 
                ? 'bg-gray-900/50 border-gray-700' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <button
                className={`relative flex-1 px-2 py-2 sm:px-3 sm:py-2.5 rounded-md font-medium text-xs sm:text-sm transition-colors focus:outline-none focus:ring-2 flex items-center justify-center gap-1 sm:gap-2 ${
                  activeTab === 'posts'
                    ? `${isDarkMode 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-600 text-white'
                      }` 
                    : `${isDarkMode 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`
                }`}
                onClick={() => setActiveTab('posts')}
              >
                <span className="text-xs sm:text-sm">📝</span>
                <span className="hidden xs:inline sm:hidden">Posts</span>
                <span className="hidden sm:inline">Posts</span>
                <span className="xs:hidden sm:hidden">P</span>
              </button>
              <button
                className={`relative flex-1 px-2 py-2 sm:px-3 sm:py-2.5 rounded-md font-medium text-xs sm:text-sm transition-colors focus:outline-none focus:ring-2 flex items-center justify-center gap-1 sm:gap-2 ${
                  activeTab === 'skills'
                    ? `${isDarkMode 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-600 text-white'
                      }` 
                    : `${isDarkMode 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`
                }`}
                onClick={() => setActiveTab('skills')}
              >
                <span className="text-xs sm:text-sm">⚡</span>
                <span className="hidden xs:inline sm:hidden">Skills</span>
                <span className="hidden sm:inline">Skills</span>
                <span className="xs:hidden sm:hidden">S</span>
              </button>
              <button
                className={`relative flex-1 px-2 py-2 sm:px-3 sm:py-2.5 rounded-md font-medium text-xs sm:text-sm transition-colors focus:outline-none focus:ring-2 flex items-center justify-center gap-1 sm:gap-2 ${
                  activeTab === 'games'
                    ? `${isDarkMode 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-600 text-white'
                      }` 
                    : `${isDarkMode 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`
                }`}
                onClick={() => setActiveTab('games')}
              >
                <span className="text-xs sm:text-sm">⚽</span>
                <span className="hidden xs:inline sm:hidden">Games</span>
                <span className="hidden sm:inline">Games</span>
                <span className="xs:hidden sm:hidden">G</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="sm:p-6 pt-3 sm:pt-4">
            {activeTab === 'skills' ? (
              <div className="w-full flex flex-col gap-4 sm:gap-6">
                {profile.skills && profile.skills.length > 0 ? (
                  <div className={`rounded-md border ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className={`flex items-center justify-between px-4 py-3 border-b ${
                      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md flex items-center justify-center ${
                          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <span className="text-sm sm:text-base">⚡</span>
                        </div>
                        <div>
                          <h3 className={`font-semibold text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Endorsed Skills
                          </h3>
                          <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {profile.name}'s friends have endorsed {profile.skills?.length ?? 0}{" "}
                            skill
                            {profile.skills?.length === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>
                      
                      {/* Pagination Controls */}
                      {totalSkillsPages > 1 && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handlePrevSkills}
                            disabled={skillsPage === 0}
                            className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium transition-colors ${
                              skillsPage === 0
                                ? isDarkMode ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            }`}
                          >
                            ‹
                          </button>
                          <span className={`text-xs px-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {skillsPage + 1} / {totalSkillsPages}
                          </span>
                          <button
                            onClick={handleNextSkills}
                            disabled={skillsPage === totalSkillsPages - 1}
                            className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium transition-colors ${
                              skillsPage === totalSkillsPages - 1
                                ? isDarkMode ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            }`}
                          >
                            ›
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <SkillsList skills={paginatedSkills} isDarkMode={isDarkMode} profile={profile} />
                    </div>
                  </div>
                ) : (
                  <div className={`w-full rounded-md border ${
                    isDarkMode 
                      ? 'border-gray-700 bg-gray-800 text-gray-400' 
                      : 'border-gray-200 bg-white text-gray-500'
                  }`}>
                    <div className={`flex flex-col items-center justify-center py-8 sm:py-12`}>
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-md mb-3 sm:mb-4 flex items-center justify-center ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <span className="text-xl sm:text-2xl">⚡</span>
                      </div>
                      <p className={`text-base sm:text-lg font-semibold mb-1 sm:mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        No Skills Yet
                      </p>
                      <p className={`text-xs sm:text-sm text-center max-w-sm px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {profile.name} hasn't received any skill endorsements from teammates yet.
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Skill Endorsement Form */}
                <div className={`rounded-md border ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}>
                  <div className={`px-4 py-3 border-b ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md flex items-center justify-center ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <span className="text-sm sm:text-base">👍</span>
                      </div>
                      <div>
                        <h3 className={`font-semibold text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Endorse Skills
                        </h3>
                        <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Add skills you've seen {profile.name} demonstrate
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <SkillForm profileId={profile._id} teamMate={profile.name} isDarkMode={isDarkMode} />
                  </div>
                </div>
              </div>
            ) : activeTab === 'posts' ? (
              <div className={`rounded-md p-2 sm:p-6 border transition-all ${
                isDarkMode 
                  ? 'bg-gray-900/50 border-gray-700' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <PostsList profileId={profile._id} isDarkMode={isDarkMode} profile={profile} />
              </div>
            ) : (
              <div className={`rounded-md p-2 sm:p-6 border transition-all ${
                isDarkMode 
                  ? 'bg-gray-900/50 border-gray-700' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md flex items-center justify-center ${
                    isDarkMode ? 'bg-green-600' : 'bg-green-600'
                  }`}>
                    <span className="text-white text-sm sm:text-base">⚽</span>
                  </div>
                  <div>
                    <h3 className={`font-semibold text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Game Availability
                    </h3>
                    <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {profile.name}'s availability and unavailability for upcoming games.
                    </p>
                  </div>
                </div>
                <FriendGames 
                  friendId={profile._id} 
                  friendName={profile.name} 
                  isDarkMode={isDarkMode} 
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showMessageModal && (
        <MessageBox
          recipient={profile}
          onCloseModal={handleCloseMessage}
          isDarkMode={isDarkMode}
          skipNavigation={true}
        />
      )}

      {showRatingModal && (
        <RatingModal
          profile={profile}
          onClose={handleCloseRating}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default UserProfile;

