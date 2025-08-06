// src/components/ProfileCard.jsx
import React from "react";
import ProfileAvatar from "../../assets/images/profile-avatar.png";
import { FaUser, FaPhone, FaTwitter,
  FaFacebookF,
  FaLinkedinIn,
} from "react-icons/fa";
import { RiTShirt2Line } from "react-icons/ri";
import renderStars from "../../utils/renderStars";

const ProfileCard = ({ profile, isDarkMode }) => {
  // Restore the renderSocialMediaIcons function
  const renderSocialMediaIcons = () =>
    profile.socialMediaLinks.map((social) => {
      let IconComponent;
      switch (social.type) {
        case "twitter":  IconComponent = FaTwitter;   break;
        case "facebook": IconComponent = FaFacebookF; break;
        case "linkedin": IconComponent = FaLinkedinIn;break;
        default: return null;
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
    <div className={`mb-4 md:mb-0 mt-8 rounded-2xl shadow-xl border border-blue-800 dark:border-gray-700 bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 ${isDarkMode ? "text-white" : "text-black"}`}
    >
      <div className={`w-full rounded-2xl overflow-hidden shadow-lg border border-blue-100 dark:border-gray-700 ${isDarkMode ? "bg-gray-700" : "bg-blue-50"}`}
      >
        {/* Avatar */}
        <div className={`w-full h-[220px] flex items-center justify-center relative ${isDarkMode ? "bg-gray-800" : "bg-gradient-to-r from-blue-200 via-green-100 to-yellow-100"}`}
        >
          <div className="absolute top-4 right-4 text-xs px-3 py-1 rounded-full bg-blue-500 text-white shadow-md font-bold tracking-wide animate-pulse z-1">
            Player Card
          </div>
          <div className="w-40 h-40 rounded-full bg-white relative overflow-hidden border-4 border-blue-300 dark:border-gray-600 shadow-lg">
            <img
              src={profile?.profilePic || ProfileAvatar}
              alt="Profile"
              className="rounded-full w-40 h-40 mx-auto mb-4 object-cover"
            />
          </div>
        </div>

        {/* Name / Position / Jersey / Stars */}
        <div className="py-10 px-6 grid grid-cols-1 gap-6">
          <div className="flex flex-col items-center"> 
            <h3 className={`font-extrabold text-2xl tracking-tight mb-1 ${isDarkMode ? "text-white" : "text-blue-900"}`}>{profile.name[0].toUpperCase() + profile.name.slice(1)}</h3>

            {(profile.position && profile.jerseyNumber) ? (
              <div className="flex items-center space-x-4 p-4 shadow-lg rounded-md dark:bg-gray-800 bg-blue-100">
                <p className={`font-semibold flex items-center text-sm text-blue-700 dark:text-blue-200`}>
                  <FaUser className="mr-2 text-xl inline mb-1" />
                  {profile.position}
                </p>
                <p className={`font-semibold flex items-center text-sm text-green-700 dark:text-green-200`}>
                  <RiTShirt2Line className="mr-2 text-2xl inline" />
                  {profile.jerseyNumber}
                </p>
              </div>
            ) : null}
            <div className="mb-2">{renderStars(profile.averageRating)}</div>
          </div>

          {/* Social + Phone */}
          <div className="flex items-center justify-center space-x-4 py-3 px-4 dark:bg-gray-800 bg-blue-50 shadow-lg rounded-md">
            <div className="flex space-x-4">{renderSocialMediaIcons()}</div>
            <a
              href={`tel:${profile.phoneNumber}`}
              className="flex items-center justify-center bg-indigo-500 text-white px-2 py-2 rounded-full font-semibold uppercase text-sm hover:bg-indigo-800 shadow-md"
            >
              <FaPhone className="w-4 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
