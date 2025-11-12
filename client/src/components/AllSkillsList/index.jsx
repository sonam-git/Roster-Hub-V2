import { useQuery, useSubscription, useMutation } from "@apollo/client";
import { QUERY_PROFILES } from "../../utils/queries";
import { SKILL_ADDED_SUBSCRIPTION, SKILL_DELETED_SUBSCRIPTION } from "../../utils/subscription";
import SkillReaction from "../SkillsList/SkillReaction";
import { REACT_TO_SKILL, ADD_SKILL } from "../../utils/mutations";
import { useState } from "react";
import { FaUserCircle, FaStar, FaTimes } from "react-icons/fa";
import ProfileAvatar from '../../assets/images/profile-avatar.png';
import Auth from "../../utils/auth";

export default function AllSkillsList({ isDarkMode }) {
  const { loading, error, data } = useQuery(QUERY_PROFILES);
  const [reactToSkill] = useMutation(REACT_TO_SKILL, {
    refetchQueries: [{ query: QUERY_PROFILES }],
  });
  const [addSkill] = useMutation(ADD_SKILL, {
    refetchQueries: [{ query: QUERY_PROFILES }],
  });

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [skillText, setSkillText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPlayersList, setShowPlayersList] = useState(false);

  // Get logged-in user ID
  const loggedInUserId = Auth.loggedIn() && Auth.getProfile().data._id;

  // Handle endorsement form submission
  const handleEndorseSubmit = async (e) => {
    e.preventDefault();
    const text = skillText.trim();
    if (!text) {
      setErrorMessage("Please enter a skill to endorse.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      await addSkill({ 
        variables: { 
          profileId: selectedPlayer._id, 
          skillText: text 
        } 
      });
      setSkillText("");
      setSelectedPlayer(null); // Close modal after successful submission
    } catch (err) {
      console.error("Endorsement error:", err);
      setErrorMessage("Failed to submit endorsement. Please try again.");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Subscribe to real-time skill add/delete
  useSubscription(SKILL_ADDED_SUBSCRIPTION, {
    onData: ({ client }) => {
      client.refetchQueries({ include: [QUERY_PROFILES] });
    },
  });
  useSubscription(SKILL_DELETED_SUBSCRIPTION, {
    onData: ({ client }) => {
      client.refetchQueries({ include: [QUERY_PROFILES] });
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className={`text-center p-8 rounded-2xl shadow-2xl backdrop-blur-sm border ${
          isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/80 border-gray-200'
        }`}>
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading skills...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className={`text-center p-8 rounded-2xl shadow-2xl backdrop-blur-sm border ${
          isDarkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-100 border-red-200'
        }`}>
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-xl text-white">⚠️</span>
          </div>
          <p className={`font-semibold ${isDarkMode ? 'text-red-200' : 'text-red-800'}`}>Error loading skills</p>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>{error.message}</p>
        </div>
      </div>
    );
  }

  // Flatten all skills from all profiles
  const allSkills = (data?.profiles || []).flatMap(profile =>
    (profile.skills || []).map(skill => ({ ...skill, profile }))
  );

  // Filter out the logged-in user from the profiles list for endorsement
  const filteredProfiles = (data?.profiles || []).filter(
    profile => profile._id !== loggedInUserId
  );

  if (!allSkills.length) {
    return (
      <div className="w-full mx-auto mb-4 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 mt-8 max-w-7xl">
        {/* Header */}
        <div className={`mb-8 text-center p-6 rounded-2xl backdrop-blur-sm border shadow-lg ${
          isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/80 border-gray-200'
        }`}>
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-4 flex items-center justify-center mx-auto ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'
          }`}>
            <span className="text-3xl sm:text-4xl">⚡</span>
          </div>
          <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            No Skills Endorsed Yet
          </h1>
          <p className={`text-sm md:text-base mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Be the first to endorse someone's skills!
          </p>
          <p className={`text-xs md:text-sm italic ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Click on a player below to endorse their skills
          </p>
        </div>

        {/* Players Grid */}
        {filteredProfiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProfiles.map((profile) => (
              <button
                key={profile._id}
                onClick={() => setSelectedPlayer(profile)}
                className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] border backdrop-blur-sm text-left ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/20' 
                    : 'bg-gradient-to-br from-white to-blue-50 border-gray-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/20'
                }`}
              >
                {/* Profile Image */}
                <div className="flex flex-col items-center mb-4">
                  <div className="relative mb-3">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5">
                      <img
                        src={profile?.profilePic || ProfileAvatar}
                        alt={`${profile.name}'s profile`}
                        className="w-full h-full rounded-full object-cover bg-white"
                        onError={(e) => { e.target.src = ProfileAvatar; }}
                      />
                    </div>
                    {/* Rating Badge */}
                    {profile.averageRating > 0 && (
                      <div className={`absolute -bottom-1 -right-1 flex items-center gap-1 px-2 py-1 rounded-full shadow-lg ${
                        isDarkMode 
                          ? 'bg-gradient-to-r from-amber-500/90 to-yellow-500/90' 
                          : 'bg-gradient-to-r from-amber-400 to-yellow-400'
                      }`}>
                        <FaStar className="text-white text-xs" />
                        <span className="text-white text-xs font-bold">
                          {profile.averageRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Name */}
                  <h3 className={`text-lg font-bold text-center mb-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {profile.name}
                  </h3>

                  {/* Position/Jersey */}
                  {(profile.position || profile.jerseyNumber) && (
                    <div className="flex items-center gap-2 text-sm">
                      {profile.position && (
                        <span className={`px-2 py-1 rounded-lg ${
                          isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {profile.position}
                        </span>
                      )}
                      {profile.jerseyNumber && (
                        <span className={`px-2 py-1 rounded-lg font-bold ${
                          isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                        }`}>
                          #{profile.jerseyNumber}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Endorse Button */}
                <div className={`mt-4 pt-4 border-t text-center ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <span className={`text-sm font-medium ${
                    isDarkMode ? 'text-blue-400 group-hover:text-blue-300' : 'text-blue-600 group-hover:text-blue-700'
                  }`}>
                    Click to Endorse →
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className={`text-center p-8 rounded-2xl ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'
          }`}>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              No other players available to endorse
            </p>
          </div>
        )}

        {/* Endorsement Modal */}
        {selectedPlayer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={`relative w-full max-w-md rounded-2xl shadow-2xl border ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
                : 'bg-gradient-to-br from-white to-blue-50 border-gray-200'
            }`}>
              {/* Close Button */}
              <button
                onClick={() => {
                  setSelectedPlayer(null);
                  setSkillText("");
                  setErrorMessage("");
                }}
                className={`absolute top-4 right-4 p-2 rounded-full transition-all ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <FaTimes className="text-xl" />
              </button>

              {/* Modal Content */}
              <div className="p-6 sm:p-8">
                {/* Player Info */}
                <div className="flex flex-col items-center mb-6">
                  <img
                    src={selectedPlayer?.profilePic || ProfileAvatar}
                    alt={selectedPlayer.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-blue-500 mb-3"
                    onError={(e) => { e.target.src = ProfileAvatar; }}
                  />
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Endorse {selectedPlayer.name}
                  </h2>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Share what makes them a great player!
                  </p>
                </div>

                {/* Endorsement Form */}
                <form onSubmit={handleEndorseSubmit} className="space-y-4">
                  <div>
                    <textarea
                      value={skillText}
                      onChange={(e) => {
                        setSkillText(e.target.value);
                        if (errorMessage) setErrorMessage("");
                      }}
                      placeholder={`e.g., "Excellent ball control and vision on the field"`}
                      rows={4}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    {errorMessage && (
                      <p className="mt-2 text-sm text-red-500 italic">{errorMessage}</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlayer(null);
                        setSkillText("");
                        setErrorMessage("");
                      }}
                      className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex-1 px-4 py-3 rounded-xl font-semibold text-white transition-all ${
                        isSubmitting
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
                          </svg>
                          Submitting...
                        </span>
                      ) : (
                        'Submit Endorsement'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full mx-auto mb-4 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 mt-8 max-w-7xl">
      {/* Modern Header */}
      <div className={`mb-8 text-center p-6 rounded-2xl backdrop-blur-sm border shadow-lg ${
        isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/80 border-gray-200'
      }`}>
        <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${ isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          🌟 Endorsed Skills
        </h1>
        <p className={`text-sm md:text-base mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Discover the amazing skills endorsed by our team members
        </p>
        
        {/* Toggle Button */}
        <button
          onClick={() => setShowPlayersList(!showPlayersList)}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
            showPlayersList
              ? isDarkMode
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg'
              : isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-md'
          }`}
        >
          {showPlayersList ? (
            <>
              <span>👥</span>
              <span>Hide Players List</span>
            </>
          ) : (
            <>
              <span>👥</span>
              <span>Show Players List & Endorse</span>
            </>
          )}
        </button>
      </div>

      {/* Conditional Rendering: Players List or Skills Grid */}
      {showPlayersList ? (
        <>
          {/* Players Grid */}
          {filteredProfiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {filteredProfiles.map((profile) => (
                <button
                  key={profile._id}
                  onClick={() => setSelectedPlayer(profile)}
                  className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] border backdrop-blur-sm text-left ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/20' 
                      : 'bg-gradient-to-br from-white to-blue-50 border-gray-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/20'
                  }`}
                >
                  {/* Profile Image */}
                  <div className="flex flex-col items-center mb-4">
                    <div className="relative mb-3">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5">
                        <img
                          src={profile?.profilePic || ProfileAvatar}
                          alt={`${profile.name}'s profile`}
                          className="w-full h-full rounded-full object-cover bg-white"
                          onError={(e) => { e.target.src = ProfileAvatar; }}
                        />
                      </div>
                      {/* Rating Badge */}
                      {profile.averageRating > 0 && (
                        <div className={`absolute -bottom-1 -right-1 flex items-center gap-1 px-2 py-1 rounded-full shadow-lg ${
                          isDarkMode 
                            ? 'bg-gradient-to-r from-amber-500/90 to-yellow-500/90' 
                            : 'bg-gradient-to-r from-amber-400 to-yellow-400'
                        }`}>
                          <FaStar className="text-white text-xs" />
                          <span className="text-white text-xs font-bold">
                            {profile.averageRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Name */}
                    <h3 className={`text-lg font-bold text-center mb-1 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {profile.name}
                    </h3>

                    {/* Position/Jersey */}
                    {(profile.position || profile.jerseyNumber) && (
                      <div className="flex items-center gap-2 text-sm">
                        {profile.position && (
                          <span className={`px-2 py-1 rounded-lg ${
                            isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {profile.position}
                          </span>
                        )}
                        {profile.jerseyNumber && (
                          <span className={`px-2 py-1 rounded-lg font-bold ${
                            isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                          }`}>
                            #{profile.jerseyNumber}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Endorse Button */}
                  <div className={`mt-4 pt-4 border-t text-center ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <span className={`text-sm font-medium ${
                      isDarkMode ? 'text-blue-400 group-hover:text-blue-300' : 'text-blue-600 group-hover:text-blue-700'
                    }`}>
                      Click to Endorse →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className={`text-center p-8 rounded-2xl ${
              isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'
            }`}>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                No other players available to endorse
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Skills Grid - Three columns on medium+ screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {allSkills.map(skill => (
          <div
            key={skill._id}
            className={`group relative rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden border backdrop-blur-sm ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700 hover:border-gray-600' 
                : 'bg-gradient-to-br from-white/90 to-blue-50/90 border-gray-200 hover:border-blue-300'
            }`}
            style={{ minHeight: '160px' }}
          >
            {/* Modern header with glassmorphism effect */}
            <div
              className={`px-4 py-3 backdrop-blur-sm border-b relative ${
                isDarkMode
                  ? "bg-gray-800/80 text-gray-100 border-gray-700"
                  : "bg-white/80 text-gray-800 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  }`}>
                    {skill.skillAuthor[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-sm">
                      {skill.skillAuthor[0].toUpperCase() + skill.skillAuthor.slice(1)}
                    </span>
                    <span className={`ml-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      endorsed
                    </span>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}>
                  {skill.recipient?.name ? skill.recipient.name : "—"}
                </div>
              </div>
            </div>

            {/* Skill content with modern typography */}
            <div
              className={`flex-1 flex items-center justify-between p-4 min-h-[80px] ${
                isDarkMode ? "bg-gradient-to-r from-gray-800/60 to-gray-900/60" : "bg-gradient-to-r from-blue-50/60 to-white/60"
              }`}
            >
              <div className="flex-1">
                <h3 className={`text-lg font-bold leading-tight ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  {skill.skillText[0].toUpperCase() + skill.skillText.slice(1)}
                </h3>
              </div>
              {skill.reactions && skill.reactions.length > 0 && (
                <div className="flex items-center gap-1 ml-3">
                  <div className="flex -space-x-1">
                    {skill.reactions.slice(0, 3).map((r, i) => (
                      <span 
                        key={i} 
                        title={r.user?.name || ""} 
                        className="text-2xl bg-white rounded-full shadow-sm border-2 border-white mr-1"
                      >
                        {r.emoji}
                      </span>
                    ))}
                  </div>
                  {skill.reactions.length > 3 && (
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      +{skill.reactions.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Modern footer with actions */}
            <div className={`px-4 py-3 border-t flex items-center justify-between ${
              isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50/80 border-gray-200'
            }`}>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600 shadow-sm'
              }`}>
                {skill.createdAt}
              </span>
              <div className="flex items-center">
                <SkillReaction 
                  onReact={emoji => reactToSkill({ variables: { skillId: skill._id, emoji } })}
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
        </>
      )}

      {/* Endorsement Modal - shared for both views */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`relative w-full max-w-md rounded-2xl shadow-2xl border ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
              : 'bg-gradient-to-br from-white to-blue-50 border-gray-200'
          }`}>
            {/* Close Button */}
            <button
              onClick={() => {
                setSelectedPlayer(null);
                setSkillText("");
                setErrorMessage("");
              }}
              className={`absolute top-4 right-4 p-2 rounded-full transition-all ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaTimes className="text-xl" />
            </button>

            {/* Modal Content */}
            <div className="p-6 sm:p-8">
              {/* Player Info */}
              <div className="flex flex-col items-center mb-6">
                <img
                  src={selectedPlayer?.profilePic || ProfileAvatar}
                  alt={selectedPlayer.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-blue-500 mb-3"
                  onError={(e) => { e.target.src = ProfileAvatar; }}
                />
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Endorse {selectedPlayer.name}
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Share what makes them a great player!
                </p>
              </div>

              {/* Endorsement Form */}
              <form onSubmit={handleEndorseSubmit} className="space-y-4">
                <div>
                  <textarea
                    value={skillText}
                    onChange={(e) => {
                      setSkillText(e.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
                    placeholder={`e.g., "Excellent ball control and vision on the field"`}
                    rows={4}
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  {errorMessage && (
                    <p className="mt-2 text-sm text-red-500 italic">{errorMessage}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlayer(null);
                      setSkillText("");
                      setErrorMessage("");
                    }}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold text-white transition-all ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      'Submit Endorsement'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
