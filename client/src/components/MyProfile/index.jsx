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
            className={`w-full rounded-lg overflow-hidden border transition-all duration-200 ${
              isDarkMode 
                ? "bg-gray-800 border-gray-700 shadow-sm" 
                : "bg-white border-gray-200 shadow-sm"
            }`}
          >
            {/* Header Section */}
            <div
              className={`w-full h-[200px] flex items-center justify-center relative ${
                isDarkMode 
                  ? "bg-gray-700" 
                  : "bg-gray-100"
              }`}
            >
              <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-md text-xs font-medium ${
                isDarkMode ? "bg-gray-800 text-gray-300 border border-gray-600" : "bg-white text-gray-700 border border-gray-300"
              }`}>
                My Profile
              </div>
              
              <div className="relative">
                <div className={`w-32 h-32 rounded-full overflow-hidden border-2 ${
                  isDarkMode ? "border-gray-600" : "border-gray-300"
                }`}>
                  <img
                    src={me.profilePic || ProfileAvatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Rating Badge - Bottom Right */}
                <div className={`absolute -bottom-1 -right-1 rounded-md px-2 py-1 border flex items-center gap-1 ${
                  isDarkMode 
                    ? "bg-gray-700 border-gray-600" 
                    : "bg-white border-gray-300"
                }`}>
                  <FaStar className="text-yellow-500 text-xs" />
                  <span className={`text-xs font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                    {me?.averageRating ? me.averageRating.toFixed(1) : '0.0'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <ProfilePicUploader
                profileId={me._id}
                profilePicUrl={me.profilePic}
                isDarkMode={isDarkMode}
              />
              
              {/* Player Information */}
              <div className="flex flex-col items-center">
                {/* Name */}
                <div className="text-center mb-4">
                  <h3 className={`font-semibold text-xl ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {me?.name ? (me.name.charAt(0).toUpperCase() + me.name.slice(1)) : 'Unknown User'}
                  </h3>
                </div>

                {/* Jersey Number and Position */}
                <div className={`w-full p-4 rounded-lg border ${
                  isDarkMode ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"
                }`}>
                  <div className="flex flex-col items-center gap-4">
                    {/* Jersey Number */}
                    {me.jerseyNumber && (
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <FaTshirt className={`${isDarkMode ? "text-blue-400" : "text-blue-600"} text-6xl`} />
                          <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold ${isDarkMode ? "text-gray-900" : "text-white"}`}>
                            {me.jerseyNumber}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Position */}
                    {me.position && (
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${
                        isDarkMode 
                          ? "bg-gray-700 border-gray-600 text-gray-200" 
                          : "bg-white border-gray-300 text-gray-700"
                      }`}>
                        <FaRunning className="text-sm" />
                        <span className="text-sm font-medium">{me.position}</span>
                      </div>
                    )}
                    
                    {/* If no jersey or position */}
                    {!me.jerseyNumber && !me.position && (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <FaTshirt className={`text-5xl ${isDarkMode ? "text-gray-600" : "text-gray-300"}`} />
                        <p className={`text-xs text-center ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                          No jersey or position set
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Social links */}
              <div className={`p-4 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-700/50 border-gray-600' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className={`font-semibold text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Social Links
                  </h4>
                </div>
                <p className={`text-xs mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Connect your social profiles
                </p>
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
