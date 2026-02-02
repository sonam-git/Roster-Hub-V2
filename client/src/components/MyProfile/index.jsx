// src/components/MyProfile.jsx
import React, { useState, useContext } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { QUERY_ME } from "../../utils/queries";
import { SAVE_SOCIAL_MEDIA_LINK, REMOVE_SOCIAL_MEDIA_LINK, UPDATE_PHONE_NUMBER } from "../../utils/mutations";
import Spinner from "../Spinner";
import { FaTrash, FaStar, FaTshirt, FaRunning, FaPhone } from "react-icons/fa";
import ProfilePicUploader from "../ProfilePicUploader";
import ProfileManagement from "../ProfileManangement";
import ProfileAvatar from "../../assets/images/profile-avatar.png";
import { ThemeContext } from "../ThemeContext";
import { OrganizationContext } from "../../contexts/OrganizationContext";
import PostForm from "../PostForm";
import PostsList from "../PostsList";
import Auth from "../../utils/auth";
import MyGames from "../MyGames";

import SocialMediaLink from "../SocialMediaLink";
import ProfileCard from "../ProfileCard";

const MyProfile = () => {
  const userId = Auth.getProfile()?.data?._id;
  const { isDarkMode } = useContext(ThemeContext);
  const { currentOrganization } = useContext(OrganizationContext);

  const { loading, data } = useQuery(QUERY_ME);
  const me = data?.me || {};


  const [selectedSocialMedia, setSelectedSocialMedia] = useState(null);
  const [socialMediaLink, setSocialMediaLink]           = useState("");
  const [error, setError]                               = useState(false);
  const [selectedView, setSelectedView]                 = useState("posts");

  const [saveSocialMediaLink] = useMutation(SAVE_SOCIAL_MEDIA_LINK, {
    refetchQueries: [{ query: QUERY_ME }],
  });
  const [removeSocialMediaLink] = useMutation(REMOVE_SOCIAL_MEDIA_LINK, {
    refetchQueries: [{ query: QUERY_ME }],
  });
  const [updatePhoneNumber] = useMutation(UPDATE_PHONE_NUMBER, {
    refetchQueries: [{ query: QUERY_ME }],
  });

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
      <Spinner />
    </div>
  );

  const saveLink = async () => {
    if (!socialMediaLink.trim()) {
      setError(true);
      return;
    }

    if (!currentOrganization?._id) {
      console.error("No organization selected");
      setError(true);
      return;
    }
    
    // Handle phone number separately
    if (selectedSocialMedia === "phone") {
      try {
        await updatePhoneNumber({
          variables: {
            profileId: me._id,
            phoneNumber: socialMediaLink,
          },
        });
        setSelectedSocialMedia(null);
        setSocialMediaLink("");
        setError(false);
      } catch (e) {
        console.error("Error updating phone number:", e);
        setError(true);
      }
      return;
    }
    
    // Handle social media links
    try {
      await saveSocialMediaLink({
        variables: {
          userId: me._id,
          type: selectedSocialMedia,
          link: socialMediaLink,
          organizationId: currentOrganization._id,
        },
      });
      setSelectedSocialMedia(null);
      setSocialMediaLink("");
      setError(false);
    } catch (e) {
      console.error("Error saving social media link:", e);
      setError(true);
    }
  };

  const label =
    selectedSocialMedia?.charAt(0).toUpperCase() +
    selectedSocialMedia?.slice(1);

  return (
    <>
      <div
        className={`md:flex md:gap-6 mt-4 mb-6 ${isDarkMode ? "text-white" : "text-black"}`}
      >
        {/* ─── LEFT COLUMN */}
        <div className="md:w-2/5 mb-6 md:mb-0">
          <div
            className={`w-full rounded-xl overflow-hidden border transition-all duration-200 ${
              isDarkMode 
                ? "bg-gray-800 border-gray-700 shadow-lg" 
                : "bg-white border-gray-200 shadow-lg"
            }`}
          >
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
              </div>
              
              {/* Profile Picture - Overlapping */}
              <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
                <div className="relative">
                  <div className={`w-32 h-32 rounded-full overflow-hidden border-4 shadow-lg ${
                    isDarkMode ? "border-gray-800" : "border-white"
                  }`}>
                    <img
                      src={me.profilePic || ProfileAvatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Online Status Indicator */}
                  <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 bg-green-500 ${
                    isDarkMode ? "border-gray-800" : "border-white"
                  }`} />
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="pt-20 pb-6 px-6">
              {/* Name & Rating */}
              <div className="text-center mb-6">
                <h3 className={`font-bold text-xl mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {me?.name ? (me.name.charAt(0).toUpperCase() + me.name.slice(1)) : 'Unknown User'}
                </h3>
                
                {/* Rating Stars */}
                <div className="flex items-center justify-center gap-1">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar 
                        key={star}
                        className={`text-sm ${
                          star <= Math.round(me?.averageRating || 0) 
                            ? "text-yellow-400" 
                            : isDarkMode ? "text-gray-600" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-sm font-medium ml-1 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {me?.averageRating ? me.averageRating.toFixed(1) : '0.0'}
                  </span>
                </div>
              </div>

              {/* Upload Button */}
              <div className="mb-6">
                <ProfilePicUploader
                  profileId={me._id}
                  profilePicUrl={me.profilePic}
                  isDarkMode={isDarkMode}
                />
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
                    {me.jerseyNumber && (
                      <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-base font-bold ${
                        isDarkMode ? "text-gray-900" : "text-white"
                      }`}>
                        {me.jerseyNumber}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Jersey
                  </p>
                  <p className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {me.jerseyNumber ? `#${me.jerseyNumber}` : 'Not set'}
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
                    {me.position || 'Not set'}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className={`border-t mb-6 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`} />

              {/* Social Links Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
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
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Connect your profiles
                      </p>
                    </div>
                  </div>
                </div>
                
                <SocialMediaLink
                  isDarkMode={isDarkMode}
                  onSelect={(type) => {
                    setSelectedSocialMedia(type);
                    if (type === "phone") {
                      setSocialMediaLink(me.phoneNumber || "");
                    } else {
                      setSocialMediaLink("");
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN */}
        <div className="md:w-3/5">
          {/* Navigation Tabs */}
          <div className={`mb-6 rounded-lg border overflow-hidden ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex">
              <button
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  selectedView === "settings"
                    ? isDarkMode 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-600 text-white'
                    : isDarkMode 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedView("settings")}
              >
                Settings
              </button>
              <button
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-l border-r ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                } ${
                  selectedView === "posts"
                    ? isDarkMode 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-600 text-white'
                    : isDarkMode 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedView("posts")}
              >
                Posts
              </button>
              <button
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  selectedView === "games"
                    ? isDarkMode 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-600 text-white'
                    : isDarkMode 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedView("games")}
              >
                Games
              </button>
            </div>
          </div>
          {selectedView === "posts" ? (
            <>
              <PostForm />
              <PostsList profileId={userId} />
            </>
          ) : selectedView === "games" ? (
            <MyGames />
          ) : (
            <ProfileManagement me={me} isDarkMode={isDarkMode} />
          )}
        </div>
      </div>

      {/* ─── SOCIAL LINK MODAL ─── */}
      {selectedSocialMedia && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          <div className="absolute inset-0 bg-black/50" 
               onClick={() => {
                 setSelectedSocialMedia(null);
                 setSocialMediaLink("");
                 setError(false);
               }} 
          />
          <div className={`relative p-6 rounded-lg w-full max-w-md border ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {selectedSocialMedia === "phone" 
                    ? (me.phoneNumber ? 'Update' : 'Add') + ' Phone Number'
                    : (me.socialMediaLinks && me.socialMediaLinks.some(l => l.type === selectedSocialMedia) ? 'Update' : 'Add') + ' ' + label
                  }
                </h4>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedSocialMedia === "phone"
                    ? me.phoneNumber ? 'Update your contact number' : 'Add your contact number'
                    : me.socialMediaLinks && me.socialMediaLinks.some(l => l.type === selectedSocialMedia) ? 'Update your profile link' : 'Connect your profile'
                  }
                </p>
              </div>
              {((selectedSocialMedia === "phone" && me.phoneNumber) || 
                (selectedSocialMedia !== "phone" && me.socialMediaLinks && me.socialMediaLinks.some(l => l.type === selectedSocialMedia))) && (
                <button
                  className={`p-2 rounded-md border transition-colors ${
                    isDarkMode 
                      ? "bg-gray-700 hover:bg-red-900/30 text-red-400 border-gray-600 hover:border-red-800" 
                      : "bg-white hover:bg-red-50 text-red-600 border-gray-300 hover:border-red-300"
                  }`}
                  title={`Delete ${selectedSocialMedia === "phone" ? "Phone Number" : label + " link"}`}
                  onClick={async () => {
                    setSelectedSocialMedia(null);
                    setSocialMediaLink("");
                    try {
                      if (selectedSocialMedia === "phone") {
                        await updatePhoneNumber({ variables: { profileId: me._id, phoneNumber: "" } });
                      } else {
                        if (!currentOrganization?._id) {
                          console.error("No organization selected");
                          return;
                        }
                        await removeSocialMediaLink({ 
                          variables: { 
                            userId: me._id, 
                            type: selectedSocialMedia,
                            organizationId: currentOrganization._id,
                          } 
                        });
                      }
                    } catch (e) {
                      console.error("Error deleting:", e);
                    }
                  }}
                >
                  <FaTrash className="text-sm" />
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <input
                type={selectedSocialMedia === "phone" ? "tel" : "text"}
                value={socialMediaLink}
                onChange={(e) => {
                  setSocialMediaLink(e.target.value);
                  if (error && e.target.value.trim()) setError(false);
                }}
                className={`w-full px-3 py-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  error 
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20" 
                    : isDarkMode 
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400" 
                      : "border-gray-300 bg-white text-gray-800 placeholder-gray-500"
                }`}
                placeholder={selectedSocialMedia === "phone" ? "Enter phone number" : `Enter ${label} URL`}
              />
              {error && (
                <div className={`flex items-center gap-2 p-3 rounded-md border text-sm ${
                  isDarkMode 
                    ? "bg-red-900/20 border-red-800 text-red-400" 
                    : "bg-red-50 border-red-200 text-red-700"
                }`}>
                  <span>⚠️</span>
                  <p>
                    {selectedSocialMedia === "phone" ? "Please enter a valid phone number." : "Please enter a valid URL."}
                  </p>
                </div>
              )}
              
              <div className="flex gap-3 pt-2">
                <button
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                  onClick={saveLink}
                >
                  Save
                </button>
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600' 
                      : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedSocialMedia(null);
                    setSocialMediaLink("");
                    setError(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyProfile;
