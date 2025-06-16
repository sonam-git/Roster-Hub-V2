import React, { useState } from "react";
import ProfileAvatar from "../../assets/images/profile-avatar.png";
import { FaUser, FaPhone, FaRegCommentDots,FaTwitter,
  FaFacebookF,
  FaLinkedinIn,
  } from "react-icons/fa";
import { RiTShirt2Line } from "react-icons/ri";
import renderStars from "../../utils/renderStars";
import MessageBox from "../MessageBox"; 

const ProfileCard = ({ profile, isDarkMode }) => {
  const [showMessageModal, setShowMessageModal] = useState(false);

  const handleMessageClick = () => {
    setShowMessageModal(true);
  };

  const handleCloseModal = () => {
    setShowMessageModal(false);
  };

  const renderSocialMediaIcons = () =>
    profile.socialMediaLinks.map((social) => {
      let IconComponent;
      switch (social.type) {
        case "twitter":
          IconComponent = FaTwitter;
          break;
        case "facebook":
          IconComponent = FaFacebookF;
          break;
        case "linkedin":
          IconComponent = FaLinkedinIn;
          break;
        default:
          return null;
      }
  
      return (
        <a
          key={social._id}
          href={social.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`mx-2 w-[40px] h-[40px] rounded-full flex items-center justify-center hover:bg-indigo-800 ${
            isDarkMode ? "bg-gray-600" : "bg-[#1DA1F2]"
          }`}
        >
          <IconComponent className="text-white" size={20} />
        </a>
      );
    });

  return (
    <div
      className={`mb-4 md:mb-0 mt-8 rounded-lg ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
      }`}
    >
      <div
        className={`w-full rounded-lg overflow-hidden shadow-md ${
          isDarkMode ? "bg-gray-700" : "bg-white"
        }`}
      >
        <div
          className={`w-full h-[200px] flex items-center justify-center ${
            isDarkMode ? "bg-gray-600" : "bg-gray-200"
          }`}
        >
          <div className="w-40 h-40 rounded-full bg-white relative overflow-hidden">
            <img
              src={profile?.profilePic || ProfileAvatar}
              alt="Profile"
              className="rounded-full w-40 h-40 mx-auto mb-4"
            />
          </div>
        </div>

        <div className="py-10 px-6 grid grid-cols-1 gap-6">
          <div className="flex flex-col items-center">
            <h3
              className={` md:text-md lg:text-lg xl:text-xl font-semibold ${
                isDarkMode ? "text-white" : "text-black-700"
              }`}
            >
              {profile.name[0].toUpperCase() + profile.name.slice(1)}
            </h3>
            <div className="flex items-center space-x-2 mb-2 "></div>

            <div
              className={`flex items-center space-x-4 p-4 shadow-lg rounded-md dark:bg-gray-800`}
            >
              <p
                className={`font-semibold flex items-center text-sm ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <FaUser className="mr-2 text-xl inline mb-1" />
                {profile.position}
              </p>
              <p
                className={`font-semibold flex items-center ml-4 text-sm ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <RiTShirt2Line className="mr-2 text-2xl inline" />
                {profile.jerseyNumber}
              </p>
            </div>

            {renderStars(profile.averageRating)}
          </div>

          <div className="flex items-center justify-center space-x-4 py-3 px-4 dark:bg-gray-800 shadow-lg rounded-md">
            <div className="flex space-x-4">{renderSocialMediaIcons()}</div>
            <a
              href={`tel:${profile.phoneNumber}`}
              className="flex items-center justify-center bg-gray-600 text-white px-2 mr-2 py-2 rounded-full font-semibold uppercase text-sm hover:bg-indigo-800 shadow-md"
            >
              <FaPhone className="w-4 h-5" />
            </a>
          </div>
          <span className="flex items-center justify-center space-x-1">
            <button
              onClick={handleMessageClick}
              className={`flex items-center space-x-1 transition ${
                isDarkMode
                  ? "text-white hover:text-indigo-300"
                  : "text-indigo-500 hover:text-indigo-700"
              }`}
              title="Message"
            >
              <FaRegCommentDots className="text-xl w-4 h-5 mr-2" />
              <span className="text-sm font-medium"> Send Message</span>
            </button>
          </span>
        </div>
      </div>

      {/* Modal for Chat */}
      {showMessageModal && (
        <MessageBox
          recipient={profile}
          onCloseModal={handleCloseModal}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default ProfileCard;
