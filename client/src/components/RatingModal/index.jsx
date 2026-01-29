import React, { useState } from "react";
import Auth from "../../utils/auth";
import PropTypes from "prop-types";
import { useMutation } from "@apollo/client";
import { RATE_PLAYER } from "../../utils/mutations";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { FaTimes, FaTrophy, FaFire, FaThumbsUp, FaMedal, FaRocket } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import ProfileAvatar from "../../assets/images/profile-avatar.png";
import { useOrganization } from "../../contexts/OrganizationContext";

const RatingModal = ({ profile, onClose, isDarkMode }) => {
  const { currentOrganization } = useOrganization();
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
    
    if (!currentOrganization) {
      setErrorMessage("No organization selected.");
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
          organizationId: currentOrganization._id,
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
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm p-2 mt-24 sm:mt-0">
      <div 
        className={`relative max-w-md w-full mx-auto transform transition-all ${
          isDarkMode 
            ? "bg-gray-800 border border-gray-700" 
            : "bg-white border border-gray-200"
        } rounded-lg shadow-xl overflow-hidden`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            setErrorMessage("");
            onClose();
          }}
          className={`absolute top-4 right-4 p-2 rounded-md transition-colors z-10 cursor-pointer ${
            isDarkMode 
              ? "text-gray-400 hover:bg-gray-700 hover:text-white" 
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          }`}
        >
          <FaTimes className="text-lg pointer-events-none" />
        </button>

        <div className="relative p-6">
          {/* Header with Profile Info */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <img
                  src={profile?.profilePic || ProfileAvatar}
                  alt={`${profile.name}'s profile`}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 shadow-md"
                />
              </div>
            </div>
            
            <h3 className={`text-xl font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Rate {profile.name}
            </h3>
            
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Share your experience playing with this teammate
            </p>
          </div>

          {/* Rating Stars Section */}
          <div className="mb-6">
            <div className="text-center mb-4">
              <p className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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
                    className="focus:outline-none transform transition-all hover:scale-110"
                  >
                    {value <= (hoveredRating || rating) ? (
                      <AiFillStar className="text-yellow-400 text-3xl" />
                    ) : (
                      <AiOutlineStar className={`text-3xl transition-colors ${
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
                <p className={`text-base font-semibold ${getRatingColor(hoveredRating || rating)} transition-all`}>
                  {getRatingText(hoveredRating || rating)}
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className={`mb-4 p-3 rounded-md border ${
              isDarkMode 
                ? "bg-red-900/30 border-red-700 text-red-300" 
                : "bg-red-50 border-red-200 text-red-700"
            }`}>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setErrorMessage("");
                onClose();
              }}
              disabled={isSubmitting}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
                  : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || rating < 2 || rating > 5}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                isDarkMode
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit Rating"
              )}
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
