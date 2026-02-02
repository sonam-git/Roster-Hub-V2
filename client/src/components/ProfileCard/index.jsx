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
      let bgColor;
      switch (social.type) {
        case "twitter":  
          IconComponent = FaTwitter;   
          bgColor = "bg-[#1DA1F2] hover:bg-[#1a8cd8]";
          break;
        case "facebook": 
          IconComponent = FaFacebookF; 
          bgColor = "bg-[#1877F2] hover:bg-[#166fe5]";
          break;
        case "linkedin": 
          IconComponent = FaLinkedinIn;
          bgColor = "bg-[#0A66C2] hover:bg-[#095196]";
          break;
        default: return null;
      }
      return (
        <a
          key={social._id}
          href={social.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-md ${bgColor}`}
        >
          <IconComponent className="text-white" size={16} />
        </a>
      );
    });

  return (
    <div className={`mb-4 md:mb-0 mt-4 rounded-xl overflow-hidden border transition-all duration-200 ${
      isDarkMode 
        ? "bg-gray-800 border-gray-700 shadow-lg" 
        : "bg-white border-gray-200 shadow-lg"
    }`}>
      {/* Cover Image & Profile Picture */}
      <div className="relative">
        {/* Gradient Cover */}
        <div
          className={`w-full h-32 ${
            isDarkMode 
              ? "bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" 
              : "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700"
          }`}
        >
          {/* Decorative pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          {/* Player Card Badge */}
          <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-md text-xs font-medium ${
            isDarkMode ? "bg-gray-800/90 text-gray-300 border border-gray-600" : "bg-white/90 text-gray-700 border border-gray-300"
          }`}>
            ⚽ Player Card
          </div>
        </div>
        
        {/* Profile Picture - Overlapping */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
          <div className="relative">
            <div className={`w-32 h-32 rounded-full overflow-hidden border-4 shadow-lg ${
              isDarkMode ? "border-gray-800" : "border-white"
            }`}>
              <img
                src={profile?.profilePic || ProfileAvatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="pt-20 pb-6 px-6">
        {/* Name & Rating */}
        <div className="text-center mb-6">
          <h3 className={`font-bold text-xl mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            {profile?.name ? (profile.name.charAt(0).toUpperCase() + profile.name.slice(1)) : 'Unknown User'}
          </h3>
          
          {/* Rating Stars */}
          <div className="flex items-center justify-center gap-1">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar 
                  key={star}
                  className={`text-sm ${
                    star <= Math.round(profile?.averageRating || 0) 
                      ? "text-yellow-400" 
                      : isDarkMode ? "text-gray-600" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className={`text-sm font-medium ml-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              {profile?.averageRating ? profile.averageRating.toFixed(1) : '0.0'}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Jersey Number Card */}
          <div className={`p-4 rounded-xl border text-center transition-all hover:scale-[1.02] ${
            isDarkMode 
              ? "bg-gradient-to-br from-gray-700/80 to-gray-700/40 border-gray-600 hover:border-blue-500/50" 
              : "bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:border-blue-300"
          }`}>
            <div className="relative inline-block mb-2">
              <FaTshirt className={`text-4xl ${isDarkMode ? "text-blue-400" : "text-blue-500"}`} />
              {profile.jerseyNumber && (
                <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-base font-bold ${
                  isDarkMode ? "text-gray-900" : "text-white"
                }`}>
                  {profile.jerseyNumber}
                </span>
              )}
            </div>
            <p className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              Jersey
            </p>
            <p className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {profile.jerseyNumber ? `#${profile.jerseyNumber}` : 'Not set'}
            </p>
          </div>

          {/* Position Card */}
          <div className={`p-4 rounded-xl border text-center transition-all hover:scale-[1.02] ${
            isDarkMode 
              ? "bg-gradient-to-br from-gray-700/80 to-gray-700/40 border-gray-600 hover:border-green-500/50" 
              : "bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:border-green-300"
          }`}>
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${
              isDarkMode ? "bg-green-500/20" : "bg-green-100"
            }`}>
              <FaRunning className={`text-lg ${isDarkMode ? "text-green-400" : "text-green-600"}`} />
            </div>
            <p className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              Position
            </p>
            <p className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {profile.position || 'Not set'}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className={`border-t mb-6 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`} />

        {/* Social Links Section */}
        <div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDarkMode ? "bg-purple-500/20" : "bg-purple-100"
            }`}>
              <svg className={`w-4 h-4 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <h4 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Social Links
              </h4>
            </div>
          </div>
          
          {/* Social Icons and Phone */}
          {(!profile.socialMediaLinks || profile.socialMediaLinks.length === 0) && !profile.phoneNumber ? (
            <div className={`p-4 rounded-xl border text-center ${
              isDarkMode 
                ? "bg-gray-700/50 border-gray-600" 
                : "bg-gray-50 border-gray-200"
            }`}>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No social links or phone number added yet
              </p>
            </div>
          ) : (
            <div className={`flex items-center justify-center gap-3 p-4 rounded-xl border ${
              isDarkMode 
                ? "bg-gray-700/50 border-gray-600" 
                : "bg-gray-50 border-gray-200"
            }`}>
              {/* Social Media Icons */}
              {profile.socialMediaLinks && profile.socialMediaLinks.length > 0 && (
                <div className="flex gap-2">
                  {renderSocialMediaIcons()}
                </div>
              )}
              
              {/* Phone */}
              {profile.phoneNumber && (
                <a
                  href={`tel:${profile.phoneNumber}`}
                  className="relative flex items-center justify-center bg-gradient-to-r from-purple-500 to-purple-600 text-white w-9 h-9 rounded-full font-semibold hover:from-purple-600 hover:to-purple-700 shadow-md transition-all hover:scale-110 group"
                  title="Call Me"
                >
                  <FaPhone className="w-4 h-4" />
                  {/* Tooltip */}
                  <span className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-3 py-1 rounded-md whitespace-nowrap shadow-lg z-10">
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
  );
};

export default ProfileCard;
