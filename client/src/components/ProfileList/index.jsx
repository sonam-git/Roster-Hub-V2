import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MessageBox from '../MessageBox';
import { AiOutlineMessage, AiFillStar } from 'react-icons/ai'; 
import { RiProfileLine } from 'react-icons/ri';
import { FaUsers,FaHeart, FaRegHeart, FaTshirt, FaRunning } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { BsPersonCheck, BsPersonPlus } from 'react-icons/bs';
import Auth from '../../utils/auth';
import ProfileAvatar from '../../assets/images/profile-avatar.png';
import RatingModal from '../RatingModal';

const ProfileList = ({ profiles, title, isDarkMode }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [ratingProfile, setRatingProfile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState(new Set());
  const [following, setFollowing] = useState(new Set());
  const profilesPerPage = 4;

  const handleChatClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleModalClose = (messageSent = false) => {
    setSelectedUser(null);
    setShowModal(false);
    // Only navigate to /message if a message was actually sent
    if (messageSent) {
      window.location.href = '/message';
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 mt-4 mb-6">
      <div className="w-full mx-auto">
        {/* Modern Header Section */}
<div className={`mb-6 text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
  <div className="inline-flex items-center gap-3 mb-6 px-3 py-3 rounded-full  dark:bg-gray-800/80 ">
    <HiSparkles className={`text-2xl ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
    <h1 className="text-2xl sm:text-3xl font-bold dark:text-white bg-clip-text ">
      {title}
    </h1>
    <HiSparkles className={`text-2xl ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
  </div>
  <p className={`text-sm md:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-xl mx-auto`}>
    Discover {filteredProfiles.length} amazing team member{filteredProfiles.length !== 1 ? 's' : ''}
  </p>
</div>


        {/* Modern Profile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {currentProfiles?.map((profile) => (
            <div
              key={profile._id}
              className={`group relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-[1.01] ${
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

                {/* Three Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  
                  {/* Left Column: Profile Image and Name */}
                  <div className="flex flex-col items-center md:items-start">
                    <div className="relative mb-3">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5">
                        <img
                          src={profile?.profilePic || ProfileAvatar}
                          alt={`${profile.name}'s profile`}
                          className="w-full h-full rounded-full object-cover bg-white"
                        />
                      </div>
                      
                      {/* Rating Badge on Bottom Right of Image */}
                      <div className={`absolute -bottom-1 -right-1 flex items-center gap-1 px-2 py-1 rounded-full shadow-lg ${
                        isDarkMode 
                          ? 'bg-gradient-to-r from-amber-500/90 to-yellow-500/90 border border-amber-400/50' 
                          : 'bg-gradient-to-r from-amber-400 to-yellow-400 border border-amber-500/50'
                      }`}>
                        <AiFillStar className="text-white text-xs" />
                        <span className="text-white text-xs font-bold">
                          {profile.averageRating || 0}
                        </span>
                      </div>
                    </div>
                    
                    {/* Name below image */}
                    <h3 className={`text-lg sm:text-xl font-bold text-center md:text-left ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {profile.name}
                    </h3>
                  </div>

                  {/* Middle Column: Jersey Number and Position */}
                  <div className="flex flex-col items-center justify-center gap-4">
                    {profile.jerseyNumber || profile.position ? (
                      <>
                        {/* Jersey Number */}
                        {profile.jerseyNumber && (
                          <div className="flex flex-col items-center">
                            <div className="relative">
                              <FaTshirt className={`text-6xl sm:text-7xl ${
                                isDarkMode ? 'text-blue-400' : 'text-blue-600'
                              }`} />
                              <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl sm:text-3xl font-bold ${
                                isDarkMode ? 'text-gray-900' : 'text-white'
                              }`}>
                                {profile.jerseyNumber}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* Position */}
                        {profile.position && (
                          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                            isDarkMode 
                              ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30' 
                              : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200'
                          }`}>
                            <FaRunning className="text-lg" />
                            <span className="text-base font-bold uppercase">{profile.position}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        {/* Empty Shirt Icon */}
                        <FaTshirt className={`text-6xl sm:text-7xl ${
                          isDarkMode ? 'text-gray-600' : 'text-gray-300'
                        }`} />
                        {/* Text below */}
                        <p className={`text-xs text-center italic px-2 ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          Jersey num and position will appear here once provided.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Action Buttons (3 rows) */}
                  <div className="flex flex-col gap-3">
                    {/* Profile Button */}
                    <Link
                      to={`/profiles/${profile._id}`}
                      className={`group relative overflow-hidden flex items-center justify-center gap-3 py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 hover:no-underline ${
                        isDarkMode 
                          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 text-green-300 border border-green-500/30 hover:border-green-400/50 hover:shadow-lg hover:shadow-green-500/25 hover:text-green-300' 
                          : 'bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 text-green-700 border border-green-200 hover:border-green-300 hover:shadow-lg hover:shadow-green-500/25 hover:text-green-700'
                      }`}
                    >
                      <RiProfileLine className="text-xl" />
                      <span className="text-sm font-bold uppercase tracking-wide">View Profile</span>
                    </Link>

                    {/* Rate Button */}
                    <button
                      onClick={() => handleRatingClick(profile)}
                      className={`group relative overflow-hidden flex items-center justify-center gap-3 py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
                        isDarkMode 
                          ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/30 hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-500/25' 
                          : 'bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 text-amber-700 border border-amber-200 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-500/25'
                      }`}
                    >
                      <AiFillStar className="text-xl" />
                      <span className="text-sm font-bold uppercase tracking-wide">Rate Player</span>
                    </button>

                    {/* Message Button */}
                    <button
                      onClick={() => handleChatClick(profile)}
                      className={`group relative overflow-hidden flex items-center justify-center gap-3 py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
                        isDarkMode 
                          ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 text-blue-300 border border-blue-500/30 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/25' 
                          : 'bg-gradient-to-r from-blue-100 to-cyan-100 hover:from-blue-200 hover:to-cyan-200 text-blue-700 border border-blue-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/25'
                      }`}
                    >
                      <AiOutlineMessage className="text-xl" />
                      <span className="text-sm font-bold uppercase tracking-wide">Send Message</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modern Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                currentPage === 1
                  ? isDarkMode 
                    ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed backdrop-blur-sm' 
                    : 'bg-gray-100/50 text-gray-400 cursor-not-allowed backdrop-blur-sm'
                  : isDarkMode
                    ? 'bg-white/10 hover:bg-white/20 text-white hover:scale-105 shadow-lg backdrop-blur-sm border border-white/20'
                    : 'bg-white/80 hover:bg-white text-gray-700 hover:scale-105 shadow-lg backdrop-blur-sm border border-gray-200/50'
              }`}
            >
              <span className="text-lg">«</span>
            </button>

            <div className={`px-6 py-3 rounded-xl font-semibold backdrop-blur-sm ${
              isDarkMode 
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                : 'bg-blue-100/80 text-blue-700 border border-blue-200/50'
            }`}>
              {currentPage} of {totalPages}
            </div>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                currentPage === totalPages
                  ? isDarkMode 
                    ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed backdrop-blur-sm' 
                    : 'bg-gray-100/50 text-gray-400 cursor-not-allowed backdrop-blur-sm'
                  : isDarkMode
                    ? 'bg-white/10 hover:bg-white/20 text-white hover:scale-105 shadow-lg backdrop-blur-sm border border-white/20'
                    : 'bg-white/80 hover:bg-white text-gray-700 hover:scale-105 shadow-lg backdrop-blur-sm border border-gray-200/50'
              }`}
            >
              <span className="text-lg">»</span>
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