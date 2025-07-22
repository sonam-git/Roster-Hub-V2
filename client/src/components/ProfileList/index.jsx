import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import MessageBox from '../MessageBox';
import { AiOutlineMessage, AiFillStar } from 'react-icons/ai'; 
import {  RiProfileLine, RiTShirt2Line} from 'react-icons/ri';
import { FaUser } from 'react-icons/fa';
import Auth from '../../utils/auth';
import ProfileAvatar from '../../assets/images/profile-avatar.png';
import { ThemeContext } from '../ThemeContext';
import RatingModal from '../RatingModal'; 
import renderStars from "../../utils/renderStars";

const ProfileList = ({ profiles, title }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [ratingProfile, setRatingProfile] = useState(null); // State for rating modal
  const [currentPage, setCurrentPage] = useState(1);
  const profilesPerPage = 6;

  const handleChatClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setSelectedUser(null); // Reset selectedUser state when modal is closed
    setShowModal(false);
    // Redirect to /message after sending a message
    window.location.href = '/message';
  };

  const handleRatingClick = (profile) => {
    setRatingProfile(profile);
  };

  const handleRatingModalClose = () => {
    setRatingProfile(null); // Reset ratingProfile state when rating modal is closed
  };

  if (!profiles.length) {
    return <h3 className='dark:text-white'>No Profiles Yet</h3>;
  }

  // Get the ID of the logged-in user
  const loggedInUserId = Auth.loggedIn() && Auth.getProfile().data._id;

  // Filter out the logged-in user from the profiles list
  const filteredProfiles = profiles?.filter((profile) => profile._id !== loggedInUserId);

  // Calculate the total number of pages
  const totalPages = Math.ceil(filteredProfiles.length / profilesPerPage);

  // Get the profiles to display for the current page
  const currentProfiles = filteredProfiles.slice(
    (currentPage - 1) * profilesPerPage,
    currentPage * profilesPerPage
  );



  return (
    <div>
      <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center text-blue-700 dark:text-blue-200 mb-6 tracking-tight drop-shadow-lg mt-5">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6">
        {currentProfiles?.map((profile) => (
          <div
            key={profile._id}
            className={`rounded-2xl shadow-2xl border border-blue-100 dark:border-gray-700 p-6 bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 transition-transform duration-200 hover:scale-[1.02] ${isDarkMode ? 'text-white' : 'text-black'}`}
          >
            <div className="grid grid-cols-2 items-center gap-2">
              {/* Column 1: Name and Jersey Number */}
              <div>
                <div className="flex items-center mb-1">
                  <h4 className="text-lg md:text-xl lg:text-2xl xl:text-2xl font-bold tracking-tight drop-shadow">{profile.name}</h4>
                </div>
                {profile?.position && profile?.jerseyNumber ? (
                  <div className="flex  items-center mt-4">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 shadow border border-blue-200 dark:border-gray-600">
                      <RiTShirt2Line className="text-xl text-green-700 dark:text-green-300" />
                      <span className="font-bold text-lg text-blue-900 dark:text-blue-200">#{profile.jerseyNumber}</span>
                      <FaUser className="text-xl text-blue-700 dark:text-blue-200 ml-4" />
                      <span className="font-semibold text-base text-gray-900 dark:text-white">{profile.position}</span>
                    </div>
                  </div>
                ) : null}
              </div>
              {/* Column 2: Image */}
              <div className="flex justify-end items-center">
                <div className="flex flex-col items-center">
                  <img
                    src={profile?.profilePic || ProfileAvatar}
                    alt="Profile"
                    className="rounded-full w-24 h-24 sm:w-20 sm:h-20 md:w-16 md:h-16 lg:w-24 lg:h-24 border-4 border-blue-200 dark:border-gray-700 shadow-lg"
                  />
                  {/* Display star rating and value under profile pic */}
                  <div className="mt-2 text-sm font-bold">
                    {renderStars(profile.averageRating)}
                  </div>
                </div>
              </div>
            </div>
            {/* Icons */}
            <div className="flex flex-col sm:flex-row justify-between mt-6 gap-2 sm:gap-0">
              {/* Chat button */}
              <button
                className="flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-gray-800 shadow hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors w-full sm:w-auto justify-center"
                onClick={() => handleChatClick(profile)}
              >
                <AiOutlineMessage className={`mr-2 text-2xl ${isDarkMode ? 'text-white ' : 'text-black'}`} />
                <span className='text-base font-semibold hover:underline underline-offset-4'>{isDarkMode ? 'Text' : 'Text'}</span>
              </button>
              {/* Rate button */}
              <button
                className="flex items-center px-3 py-1 rounded-full bg-yellow-100 dark:bg-gray-800 shadow hover:bg-yellow-200 dark:hover:bg-yellow-900 transition-colors w-full sm:w-auto justify-center mt-2 sm:mt-0"
                onClick={() => handleRatingClick(profile)}
              >
                <AiFillStar className={`mr-2 text-2xl  ${isDarkMode ? 'text-white' : 'text-black'}`} />
                <span className='text-base font-semibold hover:underline underline-offset-4'>{isDarkMode ? 'Rate' : 'Rate'}</span>
              </button>
              {/* Player info button */}
              <Link
                className={`flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-gray-800 shadow hover:bg-green-200 dark:hover:bg-green-900 transition-colors font-semibold hover:underline-offset-4 w-full sm:w-auto justify-center mt-2 sm:mt-0 ${isDarkMode ? 'text-white '  : 'text-black'} `}
                to={`/profiles/${profile._id}`}
              >
                <RiProfileLine className={`mr-2 text-2xl`} />
                <span className={`text-base`}>
                  {isDarkMode ? 'View Profile' : 'View Profile'}
                </span>
              </Link>
            </div>
          </div>
        ))}
      </div>
      {/* Pagination controls */}
      <div className="flex justify-center mt-4">
        <button
          className={`px-4 py-2 mx-1 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-gray-400 rounded-lg shadow-xl'} ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : ''}`}
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="px-4 py-2 mx-1">{currentPage}</span>
        <button
          className={`px-4 py-2 mx-1 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-gray-400 rounded-lg shadow-xl'} ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : ''}`}
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
      {/* Render the chat box if a user is selected */}
      {selectedUser &&  showModal && (
        <MessageBox recipient={selectedUser} onCloseModal={handleModalClose} isDarkMode={isDarkMode} />
      )}
      {/* Render the rating modal if a profile is selected for rating */}
      {ratingProfile && (
        <RatingModal profile={ratingProfile} onClose={handleRatingModalClose} isDarkMode={isDarkMode} />
      )}
    </div>
  );
};

export default ProfileList;
