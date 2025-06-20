// src/components/MyProfile.jsx
import React, { useState, useContext } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { QUERY_ME } from "../../utils/queries";
import { SAVE_SOCIAL_MEDIA_LINK } from "../../utils/mutations";
import { RiTShirt2Line } from "react-icons/ri";
import { FaUser } from "react-icons/fa";
import ProfilePicUploader from "../ProfilePicUploader";
import ProfileManagement from "../ProfileManangement";
import ProfileAvatar from "../../assets/images/profile-avatar.png";
import { ThemeContext } from "../ThemeContext";
import PostForm from "../PostForm";
import renderStars from "../../utils/renderStars";
import PostsList from "../PostsList";
import Auth from "../../utils/auth";

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
        className={`md:flex md:space-x-2 mb-6 rounded-lg p-3 ${
          isDarkMode ? "text-white" : "text-black"
        }`}
      >
        {/* ─── LEFT COLUMN */}
        <div className="md:w-2/5 p-2">
          <div
            className={`w-full rounded-lg overflow-hidden shadow-md ${
              isDarkMode ? "bg-gray-700" : "bg-blue-50"
            }`}
          >
            <div
              className={`w-full h-[200px] flex items-center justify-center ${
                isDarkMode ? "bg-gray-800" : "bg-gray-400"
              }`}
            >
              <div className="w-40 h-40 rounded-full bg-white overflow-hidden">
                <img
                  src={me.profilePic || ProfileAvatar}
                  alt="Profile"
                  className="w-40 h-40 object-cover"
                />
              </div>
            </div>

            <div className="py-10 px-6 space-y-6">
              <ProfilePicUploader
                profileId={me._id}
                profilePicUrl={me.profilePic}
                isDarkMode={isDarkMode}
              />

              <div className="flex flex-col items-center">
                <h3
                  className={`font-semibold ${
                    isDarkMode ? "text-white" : "text-black"
                  }`}
                >
                  {me.name.charAt(0).toUpperCase() + me.name.slice(1)}
                </h3>
                {renderStars(me.averageRating)}

                <div className="flex items-center gap-6 mt-4">
                  {me.position && (
                    <div className="flex items-center">
                      <FaUser className="mr-2 text-xl" />
                      <span>{me.position}</span>
                    </div>
                  )}
                  {me.jerseyNumber && (
                    <div className="flex items-center">
                      <RiTShirt2Line className="mr-2 text-2xl" />
                      <span>{me.jerseyNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              <SocialMediaLink
                isDarkMode={isDarkMode}
                phoneNumber={me.phoneNumber}
                onSelect={(type) => setSelectedSocialMedia(type)}
              />

              <div className="navbar flex justify-center mt-4">
                <button
                  className={`px-4 py-2 rounded-l-lg ${
                    selectedView === "settings"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-300 text-gray-700"
                  }`}
                  onClick={() => setSelectedView("settings")}
                >
                  Settings
                </button>
                <button
                  className={`px-4 py-2 rounded-r-lg ${
                    selectedView === "posts"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-300 text-gray-700"
                  }`}
                  onClick={() => setSelectedView("posts")}
                >
                  Posts
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN */}
        <div className="md:w-3/5 p-2">
          {selectedView === "posts" ? (
            <>
              <PostForm />
              <PostsList profileId={userId} />
            </>
          ) : (
            <ProfileManagement me={me} isDarkMode={isDarkMode} />
          )}
        </div>
      </div>

      {/* ─── SOCIAL LINK MODAL ─── */}
      {selectedSocialMedia && (
        <div className="fixed inset-0 flex items-center justify-center z-10">
          <div className="absolute inset-0 bg-black opacity-50" />
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
            <h4 className="text-lg font-semibold mb-2">
              Insert {label} Link:
            </h4>
            <input
              type="text"
              value={socialMediaLink}
              onChange={(e) => {
                setSocialMediaLink(e.target.value);
                if (error && e.target.value.trim()) setError(false);
              }}
              className={`w-full p-2 border rounded mb-1 ${
                error ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={`Enter your ${label} URL`}
            />
            {error && (
              <p className="text-red-500 text-sm mb-4">
                Please enter a valid URL.
              </p>
            )}
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-800"
                onClick={saveLink}
              >
                Save
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
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
      )}
    </>
  );
};

export default MyProfile;
