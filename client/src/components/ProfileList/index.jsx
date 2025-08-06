import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MessageBox from '../MessageBox';
import { AiOutlineMessage, AiFillStar } from 'react-icons/ai'; 
import { RiProfileLine, RiTShirt2Line } from 'react-icons/ri';
import { FaUser, FaUsers, FaChevronLeft, FaChevronRight, FaHeart, FaRegHeart } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { BsPersonCheck, BsPersonPlus } from 'react-icons/bs';
import Auth from '../../utils/auth';
import ProfileAvatar from '../../assets/images/profile-avatar.png';
import RatingModal from '../RatingModal'; 
import renderStars from "../../utils/renderStars";

const ProfileList = ({ profiles, title, isDarkMode }) => {
  console.log(isDarkMode)
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
      <div className="text-center py-16">
        <div className={`max-w-md mx-auto p-8 rounded-2xl shadow-xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <FaUsers className={`mx-auto mb-4 text-6xl ${isDarkMode ? 'text-gray-400' : 'text-gray-300'}`} />
          <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            No Team Members Yet
          </h3>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Be the first to join the team!
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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center mt-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <HiSparkles className={`text-3xl ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h2>
          <HiSparkles className={`text-3xl ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
        </div>
        <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
          {filteredProfiles.length} talented team member{filteredProfiles.length !== 1 ? 's' : ''} ready to make a difference
        </p>
      </div>

      {/* Grid Layout - 2 profiles per row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentProfiles?.map((profile) => (
          <div
            key={profile._id}
            className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border border-gray-700' 
                : 'bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-gray-200'
            }`}
          >
            {/* Animated Background Effect */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-gray-900/20' 
                : 'bg-gradient-to-br from-blue-100/30 via-purple-100/30 to-pink-100/30'
            }`}></div>

            <div className="relative p-6">
              {/* Top Action Bar */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => handleFavoriteToggle(profile._id)}
                  className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                    favorites.has(profile._id)
                      ? isDarkMode 
                        ? 'bg-red-900/50 text-red-400 hover:bg-red-800/70' 
                        : 'bg-red-100 text-red-500 hover:bg-red-200'
                      : isDarkMode 
                        ? 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/70 hover:text-red-400' 
                        : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500'
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
                  className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                    following.has(profile._id)
                      ? isDarkMode 
                        ? 'bg-green-900/50 text-green-400 hover:bg-green-800/70' 
                        : 'bg-green-100 text-green-500 hover:bg-green-200'
                      : isDarkMode 
                        ? 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/70 hover:text-green-400' 
                        : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-500'
                  }`}
                  title={following.has(profile._id) ? 'Unfollow' : 'Follow'}
                >
                  {following.has(profile._id) ? 
                    <BsPersonCheck className="text-sm" /> : 
                    <BsPersonPlus className="text-sm" />
                  }
                </button>
              </div>

              {/* Profile Image Section */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <img
                    src={profile?.profilePic || ProfileAvatar}
                    alt={`${profile.name}'s profile`}
                    className="w-24 h-24 rounded-full object-cover border-4 border-gradient-to-r from-blue-400 to-purple-400 shadow-lg group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Online indicator */}
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 ${isDarkMode ? 'border-gray-800' : 'border-white'} ${Math.random() > 0.5 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                </div>
              </div>

              {/* Name and Title */}
              <div className="text-center mb-4">
                <h3 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {profile.name}
                </h3>
                
                {/* Jersey and Position */}
                <div className="flex items-center justify-center gap-4 text-sm">
                  {profile.jerseyNumber && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                      <RiTShirt2Line className="text-sm" />
                      <span className="font-semibold">#{profile.jerseyNumber}</span>
                    </div>
                  )}
                  {profile.position && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${isDarkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                      <FaUser className="text-xs" />
                      <span className="font-medium">{profile.position}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="flex justify-center mb-6">
                <div className={`px-3 py-1 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  {renderStars(profile.averageRating)}
                </div>
              </div>

              {/* Modern Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleChatClick(profile)}
                  className={`group/btn flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all duration-300 hover:scale-105 transform relative overflow-hidden ${
                    isDarkMode 
                      ? 'bg-blue-900/30 hover:bg-blue-800/50 text-blue-300 hover:text-blue-100 border border-blue-700/30 hover:border-blue-500/50' 
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 border border-blue-200/50 hover:border-blue-300'
                  } shadow-sm hover:shadow-md`}
                  title="Send Message"
                >
                  <div className={`p-1.5 rounded-lg transition-all duration-200 group-hover/btn:scale-110 ${
                    isDarkMode 
                      ? 'bg-blue-800/40 group-hover/btn:bg-blue-700/60' 
                      : 'bg-blue-100 group-hover/btn:bg-blue-200'
                  }`}>
                    <AiOutlineMessage className="text-base" />
                  </div>
                  <span className="text-[10px] font-medium">Message</span>
                </button>

                <button
                  onClick={() => handleRatingClick(profile)}
                  className={`group/btn flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all duration-300 hover:scale-105 transform relative overflow-hidden ${
                    isDarkMode 
                      ? 'bg-yellow-900/30 hover:bg-yellow-800/50 text-yellow-300 hover:text-yellow-100 border border-yellow-700/30 hover:border-yellow-500/50' 
                      : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 hover:text-yellow-800 border border-yellow-200/50 hover:border-yellow-300'
                  } shadow-sm hover:shadow-md`}
                  title="Rate Player"
                >
                  <div className={`p-1.5 rounded-lg transition-all duration-200 group-hover/btn:scale-110 group-hover/btn:rotate-12 ${
                    isDarkMode 
                      ? 'bg-yellow-800/40 group-hover/btn:bg-yellow-700/60' 
                      : 'bg-yellow-100 group-hover/btn:bg-yellow-200'
                  }`}>
                    <AiFillStar className="text-base" />
                  </div>
                  <span className="text-[10px] font-medium">Rate</span>
                </button>

                <Link
                  to={`/profiles/${profile._id}`}
                  className={`group/btn flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all duration-300 hover:scale-105 transform relative overflow-hidden no-underline ${
                    isDarkMode 
                      ? 'bg-green-900/30 hover:bg-green-800/50 text-green-300 hover:text-green-100 border border-green-700/30 hover:border-green-500/50' 
                      : 'bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800 border border-green-200/50 hover:border-green-300'
                  } shadow-sm hover:shadow-md`}
                  title="View Profile"
                >
                  <div className={`p-1.5 rounded-lg transition-all duration-200 group-hover/btn:scale-110 ${
                    isDarkMode 
                      ? 'bg-green-800/40 group-hover/btn:bg-green-700/60' 
                      : 'bg-green-100 group-hover/btn:bg-green-200'
                  }`}>
                    <RiProfileLine className="text-base" />
                  </div>
                  <span className="text-[10px] font-medium">Profile</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modern Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-12">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              currentPage === 1
                ? isDarkMode 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white hover:scale-105 shadow-lg'
                  : 'bg-white hover:bg-gray-50 text-gray-700 hover:scale-105 shadow-lg border border-gray-200'
            }`}
          >
            <FaChevronLeft className="text-sm" />
            Previous
          </button>

          <div className={`px-4 py-2 rounded-xl font-bold ${
            isDarkMode 
              ? 'bg-blue-900/50 text-blue-300 border border-blue-700' 
              : 'bg-blue-100 text-blue-700 border border-blue-200'
          }`}>
            {currentPage} of {totalPages}
          </div>

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              currentPage === totalPages
                ? isDarkMode 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white hover:scale-105 shadow-lg'
                  : 'bg-white hover:bg-gray-50 text-gray-700 hover:scale-105 shadow-lg border border-gray-200'
            }`}
          >
            Next
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
  );
};

export default ProfileList;
