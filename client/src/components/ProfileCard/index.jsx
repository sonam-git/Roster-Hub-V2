// src/components/ProfileCard.jsx
import React from "react";
import ProfileAvatar from "../../assets/images/profile-avatar.png";
import { 
  FaPhone, 
  FaTwitter,
  FaFacebookF,
  FaLinkedinIn,
  FaStar,
  FaTshirt,
  FaRunning,
} from "react-icons/fa";

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
    <div className={`mb-4 md:mb-0 mt-8 rounded-2xl shadow-xl border-2 ${isDarkMode ? "border-gray-700 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800" : "border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-50"}`}>
      <div className={`w-full rounded-2xl overflow-hidden shadow-lg ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
        
        {/* Header with Player Card Badge */}
        <div className={`w-full h-[240px] flex items-center justify-center relative ${isDarkMode ? "bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900" : "bg-gradient-to-br from-blue-100 via-blue-50 to-green-50"}`}>
          <div className="absolute top-4 right-4 text-xs px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg font-bold tracking-wide z-10">
            ⚽ PLAYER CARD
          </div>
          
          {/* Profile Image with Rating Badge */}
          <div className="relative">
            <div className="w-44 h-44 rounded-full bg-white relative overflow-hidden border-4 border-blue-400 dark:border-yellow-400 shadow-2xl">
              <img
                src={profile?.profilePic || ProfileAvatar}
                alt="Profile"
                className="rounded-full w-full h-full object-cover"
              />
            </div>
            
            {/* Rating Badge - Bottom Right */}
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-yellow-400 to-yellow-500 dark:from-yellow-500 dark:to-yellow-600 rounded-full px-3 py-2 shadow-xl border-3 border-white dark:border-gray-800 flex items-center gap-1">
              <FaStar className="text-white text-base" />
              <span className="text-base font-bold text-white">
                {profile?.averageRating ? profile.averageRating.toFixed(1) : '0.0'}
              </span>
            </div>
          </div>
        </div>

        {/* Player Info Section */}
        <div className="py-8 px-6">
          {/* Name */}
          <div className="text-center mb-6">
            <h3 className={`font-extrabold text-2xl tracking-tight mb-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {profile.name[0].toUpperCase() + profile.name.slice(1)}
            </h3>
            <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-green-500 mx-auto rounded-full mt-2"></div>
          </div>

          {/* Jersey Number and Position */}
          <div className="flex flex-col items-center gap-4 mb-6">
            {/* Jersey Number */}
            {profile.jerseyNumber && (
              <div className="relative">
                <FaTshirt className={`${isDarkMode ? "text-blue-400" : "text-blue-600"} text-7xl`} />
                <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl font-bold ${isDarkMode ? "text-gray-900" : "text-white"}`}>
                  {profile.jerseyNumber}
                </span>
              </div>
            )}
            
            {/* Position */}
            {profile.position && (
              <div className={`flex items-center gap-3 px-5 py-2 rounded-xl shadow-lg ${isDarkMode ? "bg-gray-700" : "bg-gradient-to-r from-blue-50 to-green-50"}`}>
                <FaRunning className={`text-xl ${isDarkMode ? "text-green-400" : "text-green-600"}`} />
                <span className={`text-lg font-bold uppercase ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {profile.position}
                </span>
              </div>
            )}
          </div>

          {/* Social Media Links and Phone */}
          <div className="space-y-3">
            {/* Title and Description */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-lg">🔗</span>
                <h4 className={`font-bold text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Social Links
                </h4>
              </div>
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Visit {profile.name}'s different social accounts by clicking on each icon. Icons appear only if {profile.name} has added their social links. You can directly call {profile.name} by clicking the phone icon.
              </p>
            </div>
            
            {/* Social Icons and Phone */}
            {(!profile.socialMediaLinks || profile.socialMediaLinks.length === 0) && !profile.phoneNumber ? (
              <div className={`flex items-center justify-center py-6 px-4 rounded-xl shadow-md ${isDarkMode ? "bg-gray-700/50" : "bg-gradient-to-r from-blue-50 to-purple-50"}`}>
                <p className={`text-sm text-center leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {profile.name} hasn't provided any social media links and phone number. They will appear here once {profile.name} provides them.
                </p>
              </div>
            ) : (
              <div className={`flex items-center justify-center gap-3 py-4 px-4 rounded-xl shadow-md ${isDarkMode ? "bg-gray-700" : "bg-gradient-to-r from-blue-50 to-purple-50"}`}>
                {/* Social Media Icons */}
                <div className="flex gap-2">
                  {renderSocialMediaIcons()}
                </div>
                
                {/* Phone */}
                {profile.phoneNumber && (
                  <a
                    href={`tel:${profile.phoneNumber}`}
                    className="relative flex items-center justify-center bg-gradient-to-r from-purple-500 to-purple-600 text-white w-10 h-10 rounded-full font-semibold hover:from-purple-600 hover:to-purple-700 shadow-lg transition-all hover:scale-110 group"
                    title="Call Me"
                  >
                    <FaPhone className="w-4 h-4" />
                    {/* Tooltip */}
                    <span className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-3 py-1 rounded-md whitespace-nowrap shadow-lg">
                      Call Me
                      <span className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></span>
                    </span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
