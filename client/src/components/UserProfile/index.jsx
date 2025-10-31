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

  const handleMessageClick = () => setShowMessageModal(true);
  const handleCloseMessage = () => setShowMessageModal(false);
  const handleRateClick = () => setShowRatingModal(true);
  const handleCloseRating = () => setShowRatingModal(false);

  return (
    <div className={`md:flex md:space-x-1 mt-4 mb-6 ${isDarkMode ? 'text-white' : 'text-black'}`}>
      {/* Left Side - Profile Card */}
      <div className="md:w-2/5">
        <div className={`w-full mt-3 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 transition-all duration-500 hover:shadow-3xl transform hover:scale-[1.02] ${
          isDarkMode 
            ? "bg-gradient-to-br from-gray-800 via-gray-900 to-black border-gray-600 shadow-gray-900/50" 
            : "bg-gradient-to-br from-white via-blue-50 to-indigo-50 border-blue-300 shadow-blue-500/20"
        }`}>
          {/* Header with friend indicator */}
          <div className={`w-full h-12 sm:h-16 flex items-center justify-center relative overflow-hidden ${
            isDarkMode 
              ? "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600" 
              : "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          }`}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8 animate-pulse"></div>
            
            <div className="relative z-10 flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/20 backdrop-blur-sm text-white font-bold text-xs sm:text-sm shadow-lg border border-white/30">
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
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              {/* Rate Button */}
              <button
                onClick={handleRateClick}
                className={`group relative overflow-hidden px-3 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 shadow-lg hover:shadow-2xl ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 hover:from-amber-500 hover:via-yellow-500 hover:to-orange-500 text-white focus:ring-amber-400/50 shadow-amber-500/20' 
                    : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 hover:from-amber-300 hover:via-yellow-300 hover:to-orange-300 text-gray-900 focus:ring-amber-300/50 shadow-amber-400/30'
                }`}
              >
                {/* Animated background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/30 to-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                
                <div className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2">
                  <div className="relative">
                    <FaStar className="text-sm sm:text-lg group-hover:animate-pulse" />
                    <div className="absolute -inset-1 bg-yellow-400/20 rounded-full blur-sm group-hover:bg-yellow-300/40 transition-all duration-300"></div>
                  </div>
                  <span className="font-bold tracking-wide hidden xs:inline">Rate Player</span>
                  <span className="font-bold tracking-wide xs:hidden">Rate</span>
                </div>
              </button>

              {/* Message Button */}
              <button
                onClick={handleMessageClick}
                className={`group relative overflow-hidden px-3 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 shadow-lg hover:shadow-2xl ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white focus:ring-blue-400/50 shadow-blue-500/20' 
                    : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-400 hover:via-indigo-400 hover:to-purple-400 text-white focus:ring-blue-300/50 shadow-blue-400/30'
                }`}
              >
                {/* Animated background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/30 to-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                
                <div className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2">
                  <div className="relative">
                    <FaCommentDots className="text-sm sm:text-lg group-hover:animate-bounce" />
                    <div className="absolute -inset-1 bg-blue-400/20 rounded-full blur-sm group-hover:bg-blue-300/40 transition-all duration-300"></div>
                  </div>
                  <span className="font-bold tracking-wide hidden xs:inline">Send Message</span>
                  <span className="font-bold tracking-wide xs:hidden">Message</span>
                </div>
              </button>
            </div>

            {/* Action Buttons Description */}
            <div className={`mt-3 sm:mt-4 text-center text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                <span className="text-amber-500">⭐</span>
                <span className="text-xs">Rate {profile.name}'s performance</span>
                <span className="mx-1 sm:mx-2 hidden xs:inline">•</span>
                <span className="text-blue-500">💬</span>
                <span className="text-xs">Start a conversation</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Content */}
      <div className="md:w-3/5 mt-4 md:mt-0">
        <div className={`w-full h-full rounded-2xl sm:rounded-3xl shadow-2xl border-2 backdrop-blur-lg transition-all duration-500 hover:shadow-3xl ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800/90 via-gray-900/90 to-purple-900/90 border-gray-600/30 shadow-purple-500/20' 
            : 'bg-gradient-to-br from-white/90 via-blue-50/90 to-indigo-100/90 border-blue-200/50 shadow-blue-500/20'
        }`}>
          {/* Modern Tab Navigation */}
          <div className="p-4 sm:p-6 pb-0">
            <div className={`flex rounded-xl sm:rounded-2xl p-1 sm:p-1.5 shadow-lg border transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gray-800/60 border-gray-600/50 shadow-gray-900/20 backdrop-blur-sm' 
                : 'bg-white/70 border-gray-200/60 shadow-blue-100/50 backdrop-blur-sm'
            }`}>
              <button
                className={`relative flex-1 px-2 py-2 sm:px-3 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center gap-1 sm:gap-2 ${
                  activeTab === 'posts'
                    ? `${isDarkMode 
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30' 
                        : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                      }` 
                    : `${isDarkMode 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50/80'
                      }`
                }`}
                onClick={() => setActiveTab('posts')}
              >
                <span className="text-xs sm:text-sm">📝</span>
                <span className="hidden xs:inline sm:hidden">Posts</span>
                <span className="hidden sm:inline">Posts</span>
                <span className="xs:hidden sm:hidden">P</span>
                {activeTab === 'posts' && (
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                )}
              </button>
              <button
                className={`relative flex-1 px-2 py-2 sm:px-3 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center gap-1 sm:gap-2 ${
                  activeTab === 'skills'
                    ? `${isDarkMode 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                      }` 
                    : `${isDarkMode 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50/80'
                      }`
                }`}
                onClick={() => setActiveTab('skills')}
              >
                <span className="text-xs sm:text-sm">⚡</span>
                <span className="hidden xs:inline sm:hidden">Skills</span>
                <span className="hidden sm:inline">Skills</span>
                <span className="xs:hidden sm:hidden">S</span>
                {activeTab === 'skills' && (
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                )}
              </button>
              <button
                className={`relative flex-1 px-2 py-2 sm:px-3 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center gap-1 sm:gap-2 ${
                  activeTab === 'games'
                    ? `${isDarkMode 
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/30' 
                        : 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25'
                      }` 
                    : `${isDarkMode 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50/80'
                      }`
                }`}
                onClick={() => setActiveTab('games')}
              >
                <span className="text-xs sm:text-sm">⚽</span>
                <span className="hidden xs:inline sm:hidden">Games</span>
                <span className="hidden sm:inline">Games</span>
                <span className="xs:hidden sm:hidden">G</span>
                {activeTab === 'games' && (
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className=" sm:p-6 pt-3 sm:pt-4">
            {activeTab === 'skills' ? (
              <div className="w-full flex flex-col gap-4 sm:gap-6">
                {profile.skills && profile.skills.length > 0 ? (
                  <div className={`rounded-xl sm:rounded-2xl p-2 sm:p-6 border transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-800/30 border-gray-700/50 shadow-gray-900/20' 
                      : 'bg-white/70 border-gray-200/50 shadow-blue-100/50'
                  } backdrop-blur-sm shadow-lg`}>
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                          isDarkMode ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 'bg-gradient-to-r from-blue-500 to-blue-600'
                        }`}>
                          <span className="text-white text-sm sm:text-lg animate-spin-slow">⚡</span>
                        </div>
                        <div>
                          <h3 className={`font-bold text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            Endorsed Skills
                          </h3>
                          <p className="text-xs font-thin dark:text-white">
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
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                              skillsPage === 0
                                ? isDarkMode ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' : 'bg-gray-200/50 text-gray-400 cursor-not-allowed'
                                : isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-110' : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-110'
                            }`}
                          >
                            <span className="text-sm">‹</span>
                          </button>
                          <span className={`text-xs px-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {skillsPage + 1} / {totalSkillsPages}
                          </span>
                          <button
                            onClick={handleNextSkills}
                            disabled={skillsPage === totalSkillsPages - 1}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                              skillsPage === totalSkillsPages - 1
                                ? isDarkMode ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' : 'bg-gray-200/50 text-gray-400 cursor-not-allowed'
                                : isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-110' : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-110'
                            }`}
                          >
                            <span className="text-sm">›</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <SkillsList skills={paginatedSkills} isDarkMode={isDarkMode} profile={profile} />
                  </div>
                ) : (
                  <div className={`w-full flex flex-col items-center justify-center py-8 sm:py-12 rounded-xl sm:rounded-2xl border-2 border-dashed transition-all duration-300 ${
                    isDarkMode 
                      ? 'border-gray-700 bg-gray-800/20 text-gray-400' 
                      : 'border-gray-300 bg-gray-50/80 text-gray-500'
                  }`}>
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full mb-3 sm:mb-4 flex items-center justify-center ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <span className="text-xl sm:text-2xl">⚡</span>
                    </div>
                    <p className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">No Skills Yet</p>
                    <p className="text-xs sm:text-sm text-center max-w-sm px-4">
                      {profile.name} hasn't received any skill endorsements from teammates yet.
                    </p>
                  </div>
                )}
                
                {/* Skill Endorsement Form */}
                <div className={`rounded-xl sm:rounded-2xl p-2 sm:p-6 border transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-800/40 border-gray-700/50 shadow-gray-900/20' 
                    : 'bg-white/80 border-gray-200/60 shadow-blue-100/50'
                } backdrop-blur-sm shadow-lg`}>
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                      isDarkMode ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-green-500 to-green-600'
                    }`}>
                      <span className="text-white text-sm sm:text-lg">👍</span>
                    </div>
                    <div>
                      <h3 className={`font-bold text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        Endorse Skills
                      </h3>
                      <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Add skills you've seen {profile.name} demonstrate
                      </p>
                    </div>
                  </div>
                  <SkillForm profileId={profile._id} teamMate={profile.name} />
                </div>
              </div>
            ) : activeTab === 'posts' ? (
              <div className={`rounded-xl sm:rounded-2xl p-2 sm:p-6 border transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-gray-800/30 border-gray-700/50 shadow-gray-900/20' 
                  : 'bg-white/70 border-gray-200/50 shadow-blue-100/50'
              } backdrop-blur-sm shadow-lg`}>
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-gradient-to-r from-purple-600 to-purple-700' : 'bg-gradient-to-r from-purple-500 to-purple-600'
                  }`}>
                    <span className="text-white text-sm sm:text-lg animate-spin-slow">📝</span>
                  </div>
                  <div>
                    <h3 className={`font-bold text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Posts & Updates
                    </h3>
                    <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Recent posts from {profile.name}
                    </p>
                  </div>
                </div>
                <PostsList profileId={profile._id} isDarkMode={isDarkMode} profile={profile} />
              </div>
            ) : (
              <div className={`rounded-xl sm:rounded-2xl p-2 sm:p-6 border transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-gray-800/30 border-gray-700/50 shadow-gray-900/20' 
                  : 'bg-white/70 border-gray-200/50 shadow-blue-100/50'
              } backdrop-blur-sm shadow-lg`}>
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-green-500 to-green-600'
                  }`}>
                    <span className="text-white text-sm sm:text-lg animate-spin-slow">⚽</span>
                  </div>
                  <div>
                    <h3 className={`font-bold text-base sm:text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Game Availability
                    </h3>
                    <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {profile.name} 's availability and unavailability for upcoming games.
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

