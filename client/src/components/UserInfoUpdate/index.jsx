import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_JERSEY_NUMBER, UPDATE_POSITION, UPDATE_PHONE_NUMBER } from "../../utils/mutations";
import { QUERY_ME } from "../../utils/queries";
import { FaTshirt, FaRunning, FaPhone } from "react-icons/fa";

const UserInfoUpdate = ({ profile }) => {
  // Modal states
  const [showJerseyModal, setShowJerseyModal] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  
  // Form states
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [position, setPosition] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Mutations
  const [updateJerseyNumber] = useMutation(UPDATE_JERSEY_NUMBER, {
    refetchQueries: [{ query: QUERY_ME }],
  });
  
  const [updatePosition] = useMutation(UPDATE_POSITION, {
    refetchQueries: [{ query: QUERY_ME }],
  });
  
  const [updatePhoneNumber] = useMutation(UPDATE_PHONE_NUMBER, {
    refetchQueries: [{ query: QUERY_ME }],
  });

  // Handle jersey number update
  const handleJerseySubmit = async (e) => {
    e.preventDefault();
    if (!jerseyNumber || jerseyNumber < 1 || jerseyNumber > 99) {
      alert("Please enter a valid jersey number (1-99)");
      return;
    }
    try {
      await updateJerseyNumber({
        variables: {
          profileId: profile._id,
          jerseyNumber: parseInt(jerseyNumber),
        },
      });
      setShowJerseyModal(false);
      setJerseyNumber("");
    } catch (error) {
      console.error("Error updating jersey number:", error);
      console.error("Error details:", error.graphQLErrors, error.networkError);
      alert("Failed to update jersey number: " + (error.message || "Unknown error"));
    }
  };

  // Handle position update
  const handlePositionSubmit = async (e) => {
    e.preventDefault();
    if (!position || position.trim() === "") {
      alert("Please select a position");
      return;
    }
    try {
      await updatePosition({
        variables: {
          profileId: profile._id,
          position: position.toUpperCase(),
        },
      });
      setShowPositionModal(false);
      setPosition("");
    } catch (error) {
      console.error("Error updating position:", error);
      console.error("Error details:", error.graphQLErrors, error.networkError);
      alert("Failed to update position: " + (error.message || "Unknown error"));
    }
  };

  // Handle phone number update
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.trim() === "") {
      alert("Please enter a phone number");
      return;
    }
    try {
      await updatePhoneNumber({
        variables: {
          profileId: profile._id,
          phoneNumber,
        },
      });
      setShowPhoneModal(false);
      setPhoneNumber("");
    } catch (error) {
      console.error("Error updating phone number:", error);
      console.error("Error details:", error.graphQLErrors, error.networkError);
      alert("Failed to update phone number: " + (error.message || "Unknown error"));
    }
  };

  return (
    <>
      {/* Right Section: Jersey Number + Position + Phone */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          {/* Jersey Number */}
          <div 
            className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
            onClick={() => {
              setJerseyNumber(profile?.jerseyNumber || "");
              setShowJerseyModal(true);
            }}
          >
            {profile?.jerseyNumber ? (
              <div className="relative">
                <FaTshirt className="text-blue-600 dark:text-blue-400 text-5xl sm:text-6xl" />
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl sm:text-2xl font-bold text-white dark:text-gray-900">
                  {profile.jerseyNumber}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 px-3 py-2 rounded-md">
                <FaTshirt className="text-blue-600 dark:text-blue-400 text-3xl mb-1" />
                <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">Add No.</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>

          {/* Position */}
          <div 
            className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => {
              setPosition(profile?.position || "");
              setShowPositionModal(true);
            }}
          >
            {profile?.position ? (
              <>
                <FaRunning className="text-green-600 dark:text-green-400 text-2xl sm:text-3xl" />
                <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white uppercase">
                  {profile.position}
                </span>
              </>
            ) : (
              <>
                <FaRunning className="text-gray-400 dark:text-gray-500 text-2xl sm:text-3xl" />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Add Pos.</span>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>

          {/* Phone Number */}
          <div 
            className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => {
              setPhoneNumber(profile?.phoneNumber || "");
              setShowPhoneModal(true);
            }}
          >
            {profile?.phoneNumber ? (
              <>
                <FaPhone className="text-purple-600 dark:text-purple-400 text-xl sm:text-2xl" />
                <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                  {profile.phoneNumber}
                </span>
              </>
            ) : (
              <>
                <FaPhone className="text-gray-400 dark:text-gray-500 text-xl sm:text-2xl" />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Add Phone</span>
              </>
            )}
          </div>
        </div>
        
        {/* Description Note */}
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 italic">
          You can add or update your information by clicking each of the buttons above.
        </p>
      </div>

      {/* Jersey Number Modal */}
      {showJerseyModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FaTshirt className="text-blue-600 dark:text-blue-400" />
              Update Jersey Number
            </h3>
            <form onSubmit={handleJerseySubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jersey Number (1-99)
                </label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={jerseyNumber}
                  onChange={(e) => setJerseyNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter jersey number"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowJerseyModal(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Position Modal */}
      {showPositionModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FaRunning className="text-green-600 dark:text-green-400" />
              Update Position
            </h3>
            <form onSubmit={handlePositionSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Position
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select a position</option>
                  <option value="GK">GK - Goalkeeper</option>
                  <option value="CB">CB - Center Back</option>
                  <option value="LB">LB - Left Back</option>
                  <option value="RB">RB - Right Back</option>
                  <option value="CDM">CDM - Defensive Midfielder</option>
                  <option value="CM">CM - Central Midfielder</option>
                  <option value="CAM">CAM - Attacking Midfielder</option>
                  <option value="LM">LM - Left Midfielder</option>
                  <option value="RM">RM - Right Midfielder</option>
                  <option value="LW">LW - Left Winger</option>
                  <option value="RW">RW - Right Winger</option>
                  <option value="ST">ST - Striker</option>
                  <option value="CF">CF - Center Forward</option>
                  <option value="MG">MG - Manager</option>
                  <option value="COACH">COACH - Coach</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowPositionModal(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Phone Number Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FaPhone className="text-purple-600 dark:text-purple-400" />
              Update Phone Number
            </h3>
            <form onSubmit={handlePhoneSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowPhoneModal(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UserInfoUpdate;
