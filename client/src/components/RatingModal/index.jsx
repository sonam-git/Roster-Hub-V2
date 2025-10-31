import React, { useState } from "react";
import Auth from "../../utils/auth";
import PropTypes from "prop-types";
import { useMutation } from "@apollo/client";
import { RATE_PLAYER } from "../../utils/mutations";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { FaTimes, FaTrophy, FaFire, FaThumbsUp, FaMedal, FaRocket } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import ProfileAvatar from "../../assets/images/profile-avatar.png";

const RatingModal = ({ profile, onClose, isDarkMode }) => {
  const [rating, setRating] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [ratePlayer] = useMutation(RATE_PLAYER);

  const handleSubmit = async () => {
    if (rating < 2 || rating > 5) {
      setErrorMessage("Please select a rating between 2 and 5.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await ratePlayer({
        variables: {
          profileId: profile._id,
          ratingInput: {
            user: Auth.getProfile().data._id,
            rating,
          },
        },
      });
      setErrorMessage("");
      onClose();
    } catch (e) {
      console.error(e);
      setErrorMessage("Failed to submit rating. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (rating) => {
    const texts = {
      1: "Needs Improvement",
      2: "Fair Performance", 
      3: "Good Player",
      4: "Excellent Teammate",
      5: "Outstanding Champion!"
    };
    return texts[rating] || "";
  };

  const getRatingIcon = (rating) => {
    const icons = {
      1: <FaThumbsUp className="text-gray-400" />,
      2: <FaFire className="text-orange-400" />,
      3: <FaTrophy className="text-yellow-400" />,
      4: <FaMedal className="text-blue-400" />,
      5: <FaRocket className="text-purple-400" />
    };
    return icons[rating] || null;
  };

  const getRatingColor = (rating) => {
    const colors = {
      1: "text-gray-500",
      2: "text-orange-500", 
      3: "text-yellow-500",
      4: "text-blue-500",
      5: "text-purple-500"
    };
    return colors[rating] || "text-gray-500";
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm p-4">
      <div 
        className={`relative max-w-md w-full mx-auto transform transition-all duration-300 scale-100 ${
          isDarkMode 
            ? "bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border border-gray-700" 
            : "bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-gray-200"
        } rounded-3xl shadow-2xl overflow-hidden`}
      >
        {/* Animated Background Pattern */}
        <div className={`absolute inset-0 opacity-20 ${
          isDarkMode 
            ? "bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-gray-900/20" 
            : "bg-gradient-to-br from-blue-100/30 via-purple-100/30 to-pink-100/30"
        }`}></div>

        {/* Close Button */}
        <button
          onClick={() => {
            setErrorMessage("");
            onClose();
          }}
          className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 hover:scale-110 z-10 ${
            isDarkMode 
              ? "bg-gray-800/50 text-gray-400 hover:bg-gray-700/70 hover:text-white" 
              : "bg-white/50 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          }`}
        >
          <FaTimes className="text-lg" />
        </button>

        <div className="relative p-4  ">
          {/* Header with Profile Info */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <img
                  src={profile?.profilePic || ProfileAvatar}
                  alt={`${profile.name}'s profile`}
                  className="w-20 h-20 rounded-full object-cover border-4 border-gradient-to-r from-blue-400 to-purple-400 shadow-lg"
                />
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2 animate-pulse">
                  <HiSparkles className="text-white text-sm" />
                </div>
              </div>
            </div>
            
            <h3 className={`text-2xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Rate {profile.name}
            </h3>
            
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Share your experience playing with this teammate
            </p>
          </div>

          {/* Rating Stars Section */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <p className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Select your rating
              </p>
              
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => {
                      setRating(value);
                      setErrorMessage("");
                    }}
                    onMouseEnter={() => setHoveredRating(value)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none transform transition-all duration-200 hover:scale-125 active:scale-110"
                  >
                    {value <= (hoveredRating || rating) ? (
                      <AiFillStar className="text-yellow-400 text-4xl drop-shadow-lg animate-pulse" />
                    ) : (
                      <AiOutlineStar className={`text-3xl transition-colors duration-200 ${
                        isDarkMode ? 'text-gray-600 hover:text-yellow-300' : 'text-gray-300 hover:text-yellow-400'
                      }`} />
                    )}
                  </button>
                ))}
              </div>

              {/* Rating Feedback */}
              <div className="flex items-center justify-center gap-3 min-h-[2rem]">
                <div className="text-2xl">
                  {getRatingIcon(hoveredRating || rating)}
                </div>
                <p className={`text-lg font-bold ${getRatingColor(hoveredRating || rating)} transition-all duration-200`}>
                  {getRatingText(hoveredRating || rating)}
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className={`mb-6 p-3 rounded-xl border ${
              isDarkMode 
                ? "bg-red-900/30 border-red-700/50 text-red-300" 
                : "bg-red-50 border-red-200 text-red-700"
            } animate-pulse`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <p className="text-sm font-medium">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setErrorMessage("");
                onClose();
              }}
              disabled={isSubmitting}
              className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all duration-200 hover:scale-105 transform ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 hover:border-gray-500"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 hover:border-gray-400"
              } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
              Cancel
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || rating < 2 || rating > 5}
              className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all duration-200 hover:scale-105 transform relative overflow-hidden ${
                isDarkMode
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border border-blue-500"
                  : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white border border-blue-400"
              } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <HiSparkles className="text-lg" />
                  Submit Rating
                </span>
              )}
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700"></div>
            </button>
          </div>

          {/* Helper Text */}
          <p className={`text-xs text-center mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Your rating helps build a better team experience for everyone
          </p>
        </div>
      </div>
    </div>
  );
};

RatingModal.propTypes = {
  profile: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  isDarkMode: PropTypes.bool,
};

export default RatingModal;
