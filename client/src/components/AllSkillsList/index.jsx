import { useQuery, useSubscription, useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import { QUERY_PROFILES } from "../../utils/queries";
import { SKILL_ADDED_SUBSCRIPTION, SKILL_DELETED_SUBSCRIPTION } from "../../utils/subscription";
import Spinner from "../Spinner";
import SkillReaction from "../SkillsList/SkillReaction";
import { REACT_TO_SKILL, ADD_SKILL } from "../../utils/mutations";
import { FaUserCircle, FaStar, FaTimes } from "react-icons/fa";
import ProfileAvatar from '../../assets/images/profile-avatar.png';
import Auth from "../../utils/auth";
import { useOrganization } from "../../contexts/OrganizationContext";

export default function AllSkillsList({ isDarkMode }) {
  const { currentOrganization } = useOrganization();
  const { loading, error, data, refetch } = useQuery(QUERY_PROFILES, {
    variables: {
      organizationId: currentOrganization?._id
    },
    skip: !currentOrganization
  });
  
  // Refetch when organization changes
  useEffect(() => {
    if (currentOrganization) {
      refetch({ organizationId: currentOrganization._id });
    }
  }, [currentOrganization, refetch]);
  
  const [reactToSkill] = useMutation(REACT_TO_SKILL, {
    refetchQueries: [{ query: QUERY_PROFILES, variables: { organizationId: currentOrganization?._id } }],
  });
  const [addSkill] = useMutation(ADD_SKILL, {
    refetchQueries: [{ query: QUERY_PROFILES, variables: { organizationId: currentOrganization?._id } }],
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
    
    if (!currentOrganization) {
      setErrorMessage("No organization selected.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      await addSkill({ 
        variables: { 
          profileId: selectedPlayer._id, 
          skillText: text,
          organizationId: currentOrganization._id
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

  // Loading state for organization
  if (!currentOrganization) {
    return <div className="flex items-center justify-center min-h-[40vh] pt-20 lg:pt-24">
      <Spinner />;
    </div>;
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh] pt-20 lg:pt-24">
      <Spinner />;
    </div>;
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] pt-20 lg:pt-24">
        <div className={`text-center p-8 rounded-md border ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="w-12 h-12 mx-auto mb-4 rounded-md bg-red-600 flex items-center justify-center">
            <span className="text-xl text-white">⚠️</span>
          </div>
          <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Error loading skills</p>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{error.message}</p>
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
      <div className="w-full mx-auto mb-4 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 mt-8 max-w-7xl ">
        {/* Header */}
        <div className={`mb-8 text-center p-6 rounded-md border ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-md mb-4 flex items-center justify-center mx-auto ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <span className="text-3xl sm:text-4xl">⚡</span>
          </div>
          <h1 className={`text-2xl md:text-3xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            No Skills Endorsed Yet
          </h1>
          <p className={`text-sm md:text-base mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Be the first to endorse someone's skills!
          </p>
          <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
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
                className={`group relative overflow-hidden rounded-md p-6 transition-colors duration-150 border text-left ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Profile Image */}
                <div className="flex flex-col items-center mb-4">
                  <div className="relative mb-3">
                    <img
                      src={profile?.profilePic || ProfileAvatar}
                      alt={`${profile.name}'s profile`}
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                      onError={(e) => { e.target.src = ProfileAvatar; }}
                    />
                    {/* Rating Badge */}
                    {profile.averageRating > 0 && (
                      <div className={`absolute -bottom-1 -right-1 flex items-center gap-1 px-2 py-1 rounded-md border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-yellow-400' 
                          : 'bg-white border-gray-200 text-yellow-600'
                      }`}>
                        <FaStar className="text-xs" />
                        <span className="text-xs font-semibold">
                          {profile.averageRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Name */}
                  <h3 className={`text-lg font-semibold text-center mb-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {profile.name}
                  </h3>

                  {/* Position/Jersey */}
                  {(profile.position || profile.jerseyNumber) && (
                    <div className="flex items-center gap-2 text-sm">
                      {profile.position && (
                        <span className={`px-2 py-1 rounded-md border text-xs font-medium ${
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-600'
                        }`}>
                          {profile.position}
                        </span>
                      )}
                      {profile.jerseyNumber && (
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                          isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
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
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Click to Endorse →
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className={`text-center p-8 rounded-md border ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              No other players available to endorse
            </p>
          </div>
        )}

        {/* Endorsement Modal */}
        {selectedPlayer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
            <div className={`relative w-full max-w-md rounded-md border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              {/* Close Button */}
              <button
                onClick={() => {
                  setSelectedPlayer(null);
                  setSkillText("");
                  setErrorMessage("");
                }}
                className={`absolute top-4 right-4 p-2 rounded-md transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <FaTimes className="text-lg" />
              </button>

              {/* Modal Content */}
              <div className="p-6 sm:p-8">
                {/* Player Info */}
                <div className="flex flex-col items-center mb-6">
                  <img
                    src={selectedPlayer?.profilePic || ProfileAvatar}
                    alt={selectedPlayer.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 mb-3"
                    onError={(e) => { e.target.src = ProfileAvatar; }}
                  />
                  <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
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
                      className={`w-full px-4 py-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    {errorMessage && (
                      <p className={`mt-2 text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{errorMessage}</p>
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
                      className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium border transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium text-white transition-colors ${
                        isSubmitting
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
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
                        'Endorse'
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
    <div className="w-full mx-auto mb-4 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 mt-8 max-w-7xl pt-20 lg:pt-24">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className={`text-2xl md:text-3xl font-semibold mb-2 ${ isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Endorsed Skills
        </h1>
        <p className={`text-sm md:text-base mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Discover the amazing skills endorsed by our team members
        </p>
        <p className={`text-xs md:text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          You can directly endorse your friend by clicking the button below
        </p>
        
        {/* Toggle Button */}
        <button
          onClick={() => setShowPlayersList(!showPlayersList)}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium border transition-colors ${
            showPlayersList
              ? isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                : 'bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200'
              : isDarkMode
                ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
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
              {filteredProfiles.map((profile) => (              <button
                key={profile._id}
                onClick={() => setSelectedPlayer(profile)}
                className={`group relative overflow-hidden rounded-md p-6 transition-colors duration-150 border text-left ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                  {/* Profile Image */}
                  <div className="flex flex-col items-center mb-4">
                    <div className="relative mb-3">
                      <img
                        src={profile?.profilePic || ProfileAvatar}
                        alt={`${profile.name}'s profile`}
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                        onError={(e) => { e.target.src = ProfileAvatar; }}
                      />
                      {/* Rating Badge */}
                      {profile.averageRating > 0 && (
                        <div className={`absolute -bottom-1 -right-1 flex items-center gap-1 px-2 py-1 rounded-md border ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-yellow-400' 
                            : 'bg-white border-gray-200 text-yellow-600'
                        }`}>
                          <FaStar className="text-xs" />
                          <span className="text-xs font-semibold">
                            {profile.averageRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Name */}
                    <h3 className={`text-lg font-semibold text-center mb-1 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {profile.name}
                    </h3>

                    {/* Position/Jersey */}
                    {(profile.position || profile.jerseyNumber) && (
                      <div className="flex items-center gap-2 text-sm">
                        {profile.position && (
                          <span className={`px-2 py-1 rounded-md border text-xs font-medium ${
                            isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-600'
                          }`}>
                            {profile.position}
                          </span>
                        )}
                        {profile.jerseyNumber && (
                          <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                            isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
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
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Click to Endorse →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className={`text-center p-8 rounded-md border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
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
            className={`group relative rounded-md border transition-colors duration-150 overflow-hidden ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
            style={{ minHeight: '160px' }}
          >
            {/* Header */}
            <div
              className={`px-4 py-3 border-b ${
                isDarkMode
                  ? "bg-gray-800 text-gray-100 border-gray-700"
                  : "bg-white text-gray-800 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-semibold ${
                    isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {skill.skillAuthor[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="font-medium text-sm">
                      {skill.skillAuthor[0].toUpperCase() + skill.skillAuthor.slice(1)}
                    </span>
                    <span className={`ml-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      endorsed
                    </span>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-md text-xs font-medium border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}>
                  {skill.recipient?.name ? skill.recipient.name : "—"}
                </div>
              </div>
            </div>

            {/* Skill content */}
            <div
              className={`flex-1 flex items-center justify-between p-4 min-h-[80px] ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="flex-1">
                <h3 className={`text-base font-medium leading-tight ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
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
                        className="text-xl"
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

            {/* Footer with actions */}
            <div className={`px-4 py-3 border-t flex items-center justify-between ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <span className={`px-2 py-1 rounded-md text-xs font-medium border ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-600'
              }`}>
                {skill.createdAt}
              </span>
              <div className="flex items-center">
                <SkillReaction 
                  onReact={emoji => {
                    if (!currentOrganization) {
                      console.error('No organization selected');
                      return;
                    }
                    reactToSkill({ 
                      variables: { 
                        skillId: skill._id, 
                        emoji,
                        organizationId: currentOrganization._id
                      } 
                    });
                  }}
                  isDarkMode={isDarkMode}
                  buttonClass={`transition-colors duration-150 px-3 py-1.5 rounded-md text-sm font-medium border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <div className={`relative w-full max-w-md rounded-md border ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            {/* Close Button */}
            <button
              onClick={() => {
                setSelectedPlayer(null);
                setSkillText("");
                setErrorMessage("");
              }}
              className={`absolute top-4 right-4 p-2 rounded-md transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaTimes className="text-lg" />
            </button>

            {/* Modal Content */}
            <div className="p-6 sm:p-8">
              {/* Player Info */}
              <div className="flex flex-col items-center mb-6">
                <img
                  src={selectedPlayer?.profilePic || ProfileAvatar}
                  alt={selectedPlayer.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 mb-3"
                  onError={(e) => { e.target.src = ProfileAvatar; }}
                />
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
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
                    className={`w-full px-4 py-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  {errorMessage && (
                    <p className={`mt-2 text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{errorMessage}</p>
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
                    className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium border transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium text-white transition-colors ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
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
                      'Endorse'
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
