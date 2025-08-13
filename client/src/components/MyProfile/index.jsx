// src/components/MyProfile.jsx
import React, { useState, useContext } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { QUERY_ME } from "../../utils/queries";
import { SAVE_SOCIAL_MEDIA_LINK, REMOVE_SOCIAL_MEDIA_LINK } from "../../utils/mutations";
import { RiTShirt2Line } from "react-icons/ri";
import { FaUser, FaTrash } from "react-icons/fa";
import ProfilePicUploader from "../ProfilePicUploader";
import ProfileManagement from "../ProfileManangement";
import ProfileAvatar from "../../assets/images/profile-avatar.png";
import { ThemeContext } from "../ThemeContext";
import PostForm from "../PostForm";
import renderStars from "../../utils/renderStars";
import PostsList from "../PostsList";
import Auth from "../../utils/auth";
import MyGames from "../MyGames";

import SocialMediaLink from "../SocialMediaLink";

const MyProfile = () => {
  const userId = Auth.getProfile()?.data?._id;
  const { isDarkMode } = useContext(ThemeContext);

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

  if (loading) return <div>Loading...</div>;

  const saveLink = async () => {
    if (!socialMediaLink.trim()) {
      setError(true);
      return;
    }
    try {
      await saveSocialMediaLink({
        variables: {
          userId: me._id,
          type: selectedSocialMedia,
          link: socialMediaLink,
        },
      });
      setSelectedSocialMedia(null);
      setSocialMediaLink("");
      setError(false);
    } catch (e) {
      console.error("Error saving social media link:", e);
    }
  };

  const label =
    selectedSocialMedia?.charAt(0).toUpperCase() +
    selectedSocialMedia?.slice(1);

  return (
    <>
      <div
        className={`md:flex md:space-x-2 mb-6  p-3 ${isDarkMode ? "text-white" : "text-black"
          }`}
      >
        {/* ─── LEFT COLUMN */}
        <div className="md:w-2/5 p-2">
          <div
            className={`w-full rounded-3xl overflow-hidden shadow-2xl border-2 transition-all duration-500 hover:shadow-3xl transform hover:scale-[1.02] ${
              isDarkMode 
                ? "bg-gradient-to-br from-gray-800 via-gray-900 to-black border-gray-600 shadow-gray-900/50" 
                : "bg-gradient-to-br from-white via-blue-50 to-indigo-50 border-blue-300 shadow-blue-500/20"
            }`}
          >
            <div
              className={`w-full h-[240px] flex items-center justify-center relative overflow-hidden ${
                isDarkMode 
                  ? "bg-gradient-to-br from-gray-700 via-blue-900 to-purple-900" 
                  : "bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500"
              }`}
            >
              {/* Animated background elements */}
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 animate-pulse"></div>

              <div className="absolute top-6 right-6 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white font-bold text-sm shadow-lg animate-pulse z-10 border border-white/30">
                ✨ My Profile
              </div>
              
              <div className="relative z-5 w-44 h-44 rounded-full bg-white/10 backdrop-blur-sm overflow-hidden border-4 border-white/30 shadow-2xl transition-all duration-300 hover:scale-110 hover:border-white/50">
                <img
                  src={me.profilePic || ProfileAvatar}
                  alt="Profile"
                  className="w-44 h-44 object-cover transition-all duration-300 hover:scale-110"
                />
              </div>
            </div>

            <div className="py-8 px-6 space-y-6">
              <ProfilePicUploader
                profileId={me._id}
                profilePicUrl={me.profilePic}
                isDarkMode={isDarkMode}
              />

              <div className="flex flex-col items-center">
                <h3
                  className={`font-extrabold text-3xl tracking-tight mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${
                    isDarkMode ? "from-blue-400 to-purple-400" : "from-blue-600 to-purple-600"
                  }`}
                >
                  {me?.name ? (me.name.charAt(0).toUpperCase() + me.name.slice(1)) : 'Unknown User'}
                </h3>
                
                <div className={`mb-4 p-3 rounded-2xl ${
                  isDarkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white/70 border border-blue-200'
                } backdrop-blur-sm shadow-lg`}>
                  {renderStars(me.averageRating)}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                  {me.position && (
                    <div className={`flex items-center px-4 py-2 rounded-2xl shadow-lg border transition-all duration-300 hover:scale-105 ${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-blue-900 to-blue-800 text-blue-200 border-blue-700 shadow-blue-900/30' 
                        : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300 shadow-blue-500/20'
                    }`}>
                      <FaUser className="mr-2 text-lg" />
                      <span className="font-bold text-sm">{me.position}</span>
                    </div>
                  )}
                  {me.jerseyNumber && (
                    <div className={`flex items-center px-4 py-2 rounded-2xl shadow-lg border transition-all duration-300 hover:scale-105 ${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-green-900 to-green-800 text-green-200 border-green-700 shadow-green-900/30' 
                        : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300 shadow-green-500/20'
                    }`}>
                      <RiTShirt2Line className="mr-2 text-xl" />
                      <span className="font-bold text-sm">#{me.jerseyNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={`mt-8 p-4 rounded-2xl border transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-gray-800/30 border-gray-700 shadow-gray-900/20' 
                  : 'bg-white/70 border-gray-200 shadow-blue-100/50'
              } backdrop-blur-sm shadow-lg`}>
                <div className="flex items-center gap-2 mb-3 ">
                  <span className="text-xl">🔗</span>
                  <h4 className={`font-bold  text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Social Links
                  </h4>
                </div>
                <SocialMediaLink
                  isDarkMode={isDarkMode}
                  phoneNumber={me.phoneNumber}
                  onSelect={(type) => setSelectedSocialMedia(type)}
                />
              </div>


            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN */}
        <div className="md:w-3/5 p-2">
                      <div className="navbar mb-6">
                <div className={`flex flex-col sm:flex-row sm:justify-around sm:gap-2 rounded-xl p-1 shadow-md border transition-all duration-300 w-full backdrop-blur-sm ${
                  isDarkMode 
                    ? 'bg-gray-800/90 border-gray-600/50 shadow-gray-900/20' 
                    : 'bg-white/90 border-gray-200/50 shadow-blue-100/50'
                }`}>
                  <button
                    className={`relative px-3 py-2 sm:py-1.5 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-1 focus:ring-blue-400/50 flex items-center justify-center gap-1.5 w-full sm:flex-1 mb-0.5 sm:mb-0 overflow-hidden group ${
                      selectedView === "settings"
                        ? `${isDarkMode 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20' 
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/15'
                          }` 
                        : `${isDarkMode 
                            ? 'text-gray-300 hover:text-white hover:bg-gray-700/60' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                          }`
                    }`}
                    onClick={() => setSelectedView("settings")}
                  >
                    <span className="text-xs">⚙️</span>
                    <span className="font-medium">Settings</span>
                    {selectedView === "settings" && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20 rounded-lg"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  </button>
                  <button
                    className={`relative px-3 py-2 sm:py-1.5 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-1 focus:ring-purple-400/50 flex items-center justify-center gap-1.5 w-full sm:flex-1 mb-0.5 sm:mb-0 overflow-hidden group ${
                      selectedView === "posts"
                        ? `${isDarkMode 
                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md shadow-purple-500/20' 
                            : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md shadow-purple-500/15'
                          }` 
                        : `${isDarkMode 
                            ? 'text-gray-300 hover:text-white hover:bg-gray-700/60' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                          }`
                    }`}
                    onClick={() => setSelectedView("posts")}
                  >
                    <span className="text-xs">📝</span>
                    <span className="font-medium">Posts</span>
                    {selectedView === "posts" && (
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-purple-600/20 rounded-lg"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  </button>
                  <button
                    className={`relative px-3 py-2 sm:py-1.5 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-1 focus:ring-green-400/50 flex items-center justify-center gap-1.5 w-full sm:flex-1 overflow-hidden group ${
                      selectedView === "games"
                        ? `${isDarkMode 
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md shadow-green-500/20' 
                            : 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md shadow-green-500/15'
                          }` 
                        : `${isDarkMode 
                            ? 'text-gray-300 hover:text-white hover:bg-gray-700/60' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                          }`
                    }`}
                    onClick={() => setSelectedView("games")}
                  >
                    <span className="text-xs">⚽</span>
                    <span className="font-medium">Games</span>
                    {selectedView === "games" && (
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-600/20 rounded-lg"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
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

      {/* ─── MODERN SOCIAL LINK MODAL ─── */}
      {selectedSocialMedia && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" 
               onClick={() => {
                 setSelectedSocialMedia(null);
                 setSocialMediaLink("");
                 setError(false);
               }} 
          />
          <div className={`relative p-8 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 animate-modal-pop border-2 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 shadow-gray-900/50' 
              : 'bg-gradient-to-br from-white to-blue-50 border-blue-200 shadow-blue-500/20'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-lg">🔗</span>
                </div>
                <div>
                  <h4 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {me.socialMediaLinks && me.socialMediaLinks.some(l => l.type === selectedSocialMedia) ? 'Update' : 'Add'} {label}
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {me.socialMediaLinks && me.socialMediaLinks.some(l => l.type === selectedSocialMedia) ? 'Modify your link' : 'Connect your social profile'}
                  </p>
                </div>
              </div>
              {me.socialMediaLinks && me.socialMediaLinks.some(l => l.type === selectedSocialMedia) && (
                <button
                  className="p-2 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-all duration-200 hover:scale-110"
                  title={`Delete ${label} link`}
                  onClick={async () => {
                    setSelectedSocialMedia(null);
                    setSocialMediaLink("");
                    try {
                      await removeSocialMediaLink({ variables: { userId: me._id, type: selectedSocialMedia } });
                    } catch (e) {
                      console.error("Error deleting social media link:", e);
                    }
                  }}
                >
                  <FaTrash className="text-sm" />
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <input
                type="text"
                value={socialMediaLink}
                onChange={(e) => {
                  setSocialMediaLink(e.target.value);
                  if (error && e.target.value.trim()) setError(false);
                }}
                className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 focus:ring-4 focus:ring-blue-300 focus:border-blue-400 ${
                  error 
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20" 
                    : isDarkMode 
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400" 
                      : "border-gray-300 bg-white text-gray-800 placeholder-gray-500"
                }`}
                placeholder={`Enter your ${label} URL`}
              />
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl">
                  <span className="text-red-500">⚠️</span>
                  <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                    Please enter a valid URL.
                  </p>
                </div>
              )}
              
              <div className="flex gap-3 pt-2">
                <button
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                  onClick={saveLink}
                >
                  💾 Save Link
                </button>
                <button
                  className={`px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-gray-900'
                  }`}
                  onClick={() => {
                    setSelectedSocialMedia(null);
                    setSocialMediaLink("");
                    setError(false);
                  }}
                >
                  ✕ Cancel
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
