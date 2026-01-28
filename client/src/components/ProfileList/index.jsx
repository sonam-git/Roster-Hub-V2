import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MessageBox from '../MessageBox';
import { AiOutlineMessage, AiFillStar } from 'react-icons/ai'; 
import { RiProfileLine } from 'react-icons/ri';
import { FaUsers,FaTshirt, FaRunning } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

import Auth from '../../utils/auth';
import ProfileAvatar from '../../assets/images/profile-avatar.png';
import RatingModal from '../RatingModal';

const ProfileList = ({ profiles, title, isDarkMode }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [ratingProfile, setRatingProfile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const profilesPerPage = 4;


  const handleChatClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setSelectedUser(null);
    setShowModal(false);
    // Don't navigate - just stay on the current page
  };

  const handleRatingClick = (profile) => {
    setRatingProfile(profile);
  };

  const handleRatingModalClose = () => {
    setRatingProfile(null);
  };

  // Get the ID of the logged-in user
  const loggedInUserId = Auth.loggedIn() && Auth.getProfile().data._id;

  // Filter out the logged-in user from the profiles list
  const filteredProfiles = profiles?.filter((profile) => profile._id !== loggedInUserId);

  // Debug logging
  console.log("🔍 ProfileList Filtered Debug:", {
    loggedInUserId,
    totalProfiles: profiles?.length,
    filteredProfilesCount: filteredProfiles?.length,
    filteredProfiles,
  });

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
    <div className="min-h-screen mt-4 mb-6">
      <div className="w-full mx-auto ">
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
                {/* Three Column Layout - AWS-style clean design */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                  
                  {/* Left Column: Profile Image and Name */}
                  <div className="flex flex-col items-center md:items-start gap-3">
                    <div className="relative">
                      <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 ${
                        isDarkMode ? 'border-gray-600' : 'border-gray-200'
                      }`}>
                        <img
                          src={profile?.profilePic || ProfileAvatar}
                          alt={`${profile.name}'s profile`}
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      
                      {/* Rating Badge - simplified */}
                      <div className={`absolute -bottom-1 -right-1 flex items-center gap-1 px-2.5 py-1 rounded-md shadow-sm ${
                        isDarkMode 
                          ? 'bg-amber-500 border border-amber-600' 
                          : 'bg-amber-400 border border-amber-500'
                      }`}>
                        <AiFillStar className="text-white text-xs" />
                        <span className="text-white text-xs font-semibold">
                          {profile.averageRating || 0}
                        </span>
                      </div>
                    </div>
                    
                    {/* Name below image */}
                    <h3 className={`text-lg sm:text-xl font-semibold text-center md:text-left ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {profile.name}
                    </h3>
                  </div>

                  {/* Middle Column: Jersey Number and Position */}
                  <div className={`flex flex-col items-center justify-center gap-4 p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
                  }`}>
                    {profile.jerseyNumber || profile.position ? (
                      <>
                        {/* Jersey Number with Shirt Icon */}
                        {profile.jerseyNumber && (
                          <div className="flex flex-col items-center">
                            <div className="relative">
                              <FaTshirt className={`text-5xl sm:text-6xl ${
                                isDarkMode ? 'text-blue-500' : 'text-blue-600'
                              }`} />
                              <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl sm:text-2xl font-bold ${
                                isDarkMode ? 'text-gray-900' : 'text-white'
                              }`}>
                                {profile.jerseyNumber}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* Position - simplified */}
                        {profile.position && (
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${
                            isDarkMode 
                              ? 'bg-gray-700 text-gray-200 border-gray-600' 
                              : 'bg-white text-gray-700 border-gray-300'
                          }`}>
                            <FaRunning className="text-sm" />
                            <span className="text-sm font-medium uppercase tracking-wide">{profile.position}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        {/* Empty Shirt Icon */}
                        <FaTshirt className={`text-5xl sm:text-6xl ${
                          isDarkMode ? 'text-gray-700' : 'text-gray-300'
                        }`} />
                        {/* Text below */}
                        <p className={`text-xs text-center px-2 ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          Jersey & position not set
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Action Buttons - AWS-style */}
                  <div className="flex flex-col gap-2.5">
                    {/* Profile Button */}
                    <Link
                      to={`/profiles/${profile._id}`}
                      className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-md border transition-colors duration-200 hover:no-underline ${
                        isDarkMode 
                          ? 'bg-gray-700 hover:bg-gray-100 text-gray-200 border-gray-600 hover:border-gray-500' 
                          : 'bg-gray-50 hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <RiProfileLine className="text-lg" />
                      <span className="text-sm font-medium">View Profile</span>
                    </Link>

                    {/* Rate Button */}
                    <button
                      onClick={() => handleRatingClick(profile)}
                      className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-md border transition-colors duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700 hover:bg-gray-800 text-gray-200 border-gray-600 hover:border-gray-500' 
                          : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <AiFillStar className="text-lg text-amber-500" />
                      <span className="text-sm font-medium">Rate Player</span>
                    </button>

                    {/* Message Button */}
                    <button
                      onClick={() => handleChatClick(profile)}
                      className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-md border transition-colors duration-200 ${
                        isDarkMode 
                          ? 'bg-blue-600 hover:bg-blue-800 text-white border-blue-600 hover:border-blue-500' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700'
                      }`}
                    >
                      <AiOutlineMessage className="text-lg" />
                      <span className="text-sm font-medium">Send Message</span>
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
          <MessageBox 
            recipient={selectedUser} 
            onCloseModal={handleModalClose} 
            isDarkMode={isDarkMode}
            skipNavigation={true}
          />
        )}
        {ratingProfile && (
          <RatingModal profile={ratingProfile} onClose={handleRatingModalClose} isDarkMode={isDarkMode} />
        )}
      </div>
    </div>
  );
};

export default ProfileList;