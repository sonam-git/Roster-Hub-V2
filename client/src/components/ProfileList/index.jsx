import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MessageBox from '../MessageBox';
import { AiOutlineMessage, AiFillStar } from 'react-icons/ai'; 
import { RiProfileLine } from 'react-icons/ri';
import { FaUsers, FaChevronLeft, FaChevronRight, FaHeart, FaRegHeart, FaTshirt, FaRunning } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { BsPersonCheck, BsPersonPlus } from 'react-icons/bs';
import Auth from '../../utils/auth';
import ProfileAvatar from '../../assets/images/profile-avatar.png';
import RatingModal from '../RatingModal'; 
import renderStars from "../../utils/renderStars";

const ProfileList = ({ profiles, title, isDarkMode }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [ratingProfile, setRatingProfile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState(new Set());
  const [following, setFollowing] = useState(new Set());
  const profilesPerPage = 8;

  const handleChatClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setSelectedUser(null);
    setShowModal(false);
    window.location.href = '/message';
  };

  const handleRatingClick = (profile) => {
    setRatingProfile(profile);
  };

  const handleRatingModalClose = () => {
    setRatingProfile(null);
  };

  const handleFavoriteToggle = (profileId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(profileId)) {
        newFavorites.delete(profileId);
      } else {
        newFavorites.add(profileId);
      }
      return newFavorites;
    });
  };

  const handleFollowToggle = (profileId) => {
    setFollowing(prev => {
      const newFollowing = new Set(prev);
      if (newFollowing.has(profileId)) {
        newFollowing.delete(profileId);
      } else {
        newFollowing.add(profileId);
      }
      return newFollowing;
    });
  };

  // Get the ID of the logged-in user
  const loggedInUserId = Auth.loggedIn() && Auth.getProfile().data._id;

  // Filter out the logged-in user from the profiles list
  const filteredProfiles = profiles?.filter((profile) => profile._id !== loggedInUserId);

  if (!filteredProfiles.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
        <div className={`max-w-md mx-auto p-8 rounded-3xl backdrop-blur-lg text-center ${
          isDarkMode 
            ? 'bg-white/5 border border-white/10 shadow-2xl' 
            : 'bg-white/80 border border-gray-200/50 shadow-xl'
        }`}>
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'
          }`}>
            <FaUsers className={`text-3xl ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
          </div>
          <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            No Team Members Yet
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Be the first to join this amazing team!
          </p>
        </div>
      </div>
    );
  }

  // Calculate pagination
  const totalPages = Math.ceil(filteredProfiles.length / profilesPerPage);
  const currentProfiles = filteredProfiles.slice(
    (currentPage - 1) * profilesPerPage,
    currentPage * profilesPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Modern Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <HiSparkles className={`text-2xl ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
            <h1 className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent`}>
              {title}
            </h1>
            <HiSparkles className={`text-2xl ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
          </div>
          <p className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-xl mx-auto`}>
            Discover {filteredProfiles.length} amazing team member{filteredProfiles.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Modern Profile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 ">
          {currentProfiles?.map((profile) => (
            <div
              key={profile._id}
              className={`group relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-[1.02] ${
                isDarkMode 
                  ? 'bg-white/5 backdrop-blur-lg border border-gray-500 hover:border-white/20 shadow-xl hover:shadow-2xl' 
                  : 'bg-white/90 backdrop-blur-lg border border-gray-600 hover:border-gray-300/80 shadow-lg hover:shadow-xl'
              }`}
            >
              {/* Gradient Background Effect */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10' 
                  : 'bg-gradient-to-br from-blue-100/50 via-purple-100/50 to-pink-100/50'
              }`}></div>

              <div className="relative p-6">
                {/* Simplified Top Actions */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => handleFavoriteToggle(profile._id)}
                    className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
                      favorites.has(profile._id)
                        ? 'bg-red-500/20 text-red-500 border border-red-500/30' 
                        : isDarkMode 
                          ? 'bg-white/10 text-gray-300 hover:text-red-400 border border-white/20' 
                          : 'bg-black/10 text-gray-600 hover:text-red-500 border border-gray-300/30'
                    }`}
                    title={favorites.has(profile._id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {favorites.has(profile._id) ? 
                      <FaHeart className="text-sm" /> : 
                      <FaRegHeart className="text-sm" />
                    }
                  </button>
                  
                  <button
                    onClick={() => handleFollowToggle(profile._id)}
                    className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
                      following.has(profile._id)
                        ? 'bg-green-500/20 text-green-500 border border-green-500/30' 
                        : isDarkMode 
                          ? 'bg-white/10 text-gray-300 hover:text-green-400 border border-white/20' 
                          : 'bg-black/10 text-gray-600 hover:text-green-500 border border-gray-300/30'
                    }`}
                    title={following.has(profile._id) ? 'Unfollow' : 'Follow'}
                  >
                    {following.has(profile._id) ? 
                      <BsPersonCheck className="text-sm" /> : 
                      <BsPersonPlus className="text-sm" />
                    }
                  </button>
                </div>

                {/* Profile Image - Simplified */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5">
                      <img
                        src={profile?.profilePic || ProfileAvatar}
                        alt={`${profile.name}'s profile`}
                        className="w-full h-full rounded-full object-cover bg-white"
                      />
                    </div>
                    {/* Simple Online Indicator */}
                    <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 ${
                      isDarkMode ? 'border-gray-800' : 'border-white'
                    } ${Math.random() > 0.5 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  </div>
                </div>

                {/* Profile Info - Cleaner */}
                <div className="text-center mb-6">
                  <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {profile.name}
                  </h3>
                  
                  {/* Enhanced Jersey and Position with Icons */}
                  <div className="flex items-center justify-center gap-3 text-xs">
                    {profile.jerseyNumber && (
                      <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                        isDarkMode ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 border border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/20' : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200 hover:shadow-lg hover:shadow-blue-500/20'
                      }`}>
                        <FaTshirt className="text-sm" />
                        <span>#{profile.jerseyNumber}</span>
                      </div>
                    )}
                    {profile.position && (
                      <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                        isDarkMode ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/20' : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200 hover:shadow-lg hover:shadow-purple-500/20'
                      }`}>
                        <FaRunning className="text-sm" />
                        <span>{profile.position}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Rating with Star Icon */}
                <div className="flex justify-center mb-6">
                  <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 ${
                    isDarkMode ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-200 backdrop-blur-sm border border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/20' : 'bg-gradient-to-r from-amber-100 to-yellow-100 backdrop-blur-sm border border-amber-200 hover:shadow-lg hover:shadow-amber-500/20'
                  }`}>
                    <AiFillStar className={`text-lg ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`} />
                    <div className="flex items-center">
                      {renderStars(profile.averageRating)}
                      <span className={`text-sm font-semibold ml-2 ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                        ({profile.averageRating || 0})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Modern Action Buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleChatClick(profile)}
                    className={`group relative overflow-hidden flex flex-col items-center gap-2.5 p-4 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${
                      isDarkMode 
                        ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 text-blue-300 border border-blue-500/20 hover:border-blue-400/40 hover:shadow-xl hover:shadow-blue-500/25' 
                        : 'bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 text-blue-600 border border-blue-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/25'
                    }`}
                    title="Send Message"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12"></div>
                    <div className={`p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 ${
                      isDarkMode ? 'bg-blue-500/20 group-hover:bg-blue-500/30' : 'bg-blue-100 group-hover:bg-blue-200'
                    }`}>
                      <AiOutlineMessage className="text-xl" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">Message</span>
                  </button>

                  <button
                    onClick={() => handleRatingClick(profile)}
                    className={`group relative overflow-hidden flex flex-col items-center gap-2.5 p-4 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${
                      isDarkMode 
                        ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 text-amber-300 border border-amber-500/20 hover:border-amber-400/40 hover:shadow-xl hover:shadow-amber-500/25' 
                        : 'bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-600 border border-amber-200 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-500/25'
                    }`}
                    title="Rate Player"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12"></div>
                    <div className={`p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 ${
                      isDarkMode ? 'bg-amber-500/20 group-hover:bg-amber-500/30' : 'bg-amber-100 group-hover:bg-amber-200'
                    }`}>
                      <AiFillStar className="text-xl" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">Rate</span>
                  </button>

                  <Link
                    to={`/profiles/${profile._id}`}
                    className={`group relative overflow-hidden flex flex-col items-center gap-2.5 p-4 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 hover:no-underline ${
                      isDarkMode 
                        ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 text-green-300 border border-green-500/20 hover:border-green-400/40 hover:shadow-xl hover:shadow-green-500/25 hover:text-green-300' 
                        : 'bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-600 border border-green-200 hover:border-green-300 hover:shadow-xl hover:shadow-green-500/25 hover:text-green-600'
                    }`}
                    title="View Profile"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12"></div>
                    <div className={`p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 ${
                      isDarkMode ? 'bg-green-500/20 group-hover:bg-green-500/30' : 'bg-green-100 group-hover:bg-green-200'
                    }`}>
                      <RiProfileLine className="text-xl" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">Profile</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modern Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mb-8">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                currentPage === 1
                  ? isDarkMode 
                    ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed backdrop-blur-sm' 
                    : 'bg-gray-100/50 text-gray-400 cursor-not-allowed backdrop-blur-sm'
                  : isDarkMode
                    ? 'bg-white/10 hover:bg-white/20 text-white hover:scale-105 shadow-lg backdrop-blur-sm border border-white/20'
                    : 'bg-white/80 hover:bg-white text-gray-700 hover:scale-105 shadow-lg backdrop-blur-sm border border-gray-200/50'
              }`}
            >
              <FaChevronLeft className="text-sm" />
              <span>Previous</span>
            </button>

            <div className={`px-4 py-2.5 rounded-xl font-semibold backdrop-blur-sm ${
              isDarkMode 
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                : 'bg-blue-100/80 text-blue-700 border border-blue-200/50'
            }`}>
              {currentPage} of {totalPages}
            </div>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                currentPage === totalPages
                  ? isDarkMode 
                    ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed backdrop-blur-sm' 
                    : 'bg-gray-100/50 text-gray-400 cursor-not-allowed backdrop-blur-sm'
                  : isDarkMode
                    ? 'bg-white/10 hover:bg-white/20 text-white hover:scale-105 shadow-lg backdrop-blur-sm border border-white/20'
                    : 'bg-white/80 hover:bg-white text-gray-700 hover:scale-105 shadow-lg backdrop-blur-sm border border-gray-200/50'
              }`}
            >
              <span>Next</span>
              <FaChevronRight className="text-sm" />
            </button>
          </div>
        )}

        {/* Modals */}
        {selectedUser && showModal && (
          <MessageBox recipient={selectedUser} onCloseModal={handleModalClose} isDarkMode={isDarkMode} />
        )}
        {ratingProfile && (
          <RatingModal profile={ratingProfile} onClose={handleRatingModalClose} isDarkMode={isDarkMode} />
        )}
      </div>
    </div>
  );
};

export default ProfileList;