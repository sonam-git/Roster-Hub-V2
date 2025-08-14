import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_GAME } from "../../utils/mutations";
import { QUERY_GAME, QUERY_GAMES } from "../../utils/queries";

const GameUpdate = ({
  gameId,
  initialDate,
  initialTime,
  initialVenue,
  initialCity,
  initialNotes,
  initialOpponent,
  onClose,
  isDarkMode,
}) => {
  const [formState, setFormState] = useState({
    date: initialDate || "",
    time: initialTime || "",
    venue: initialVenue || "",
    city: initialCity || "",
    notes: initialNotes || "",
    opponent: initialOpponent || "",
  });

  const [updateGame, { loading, error }] = useMutation(UPDATE_GAME, {
    refetchQueries: [
      { query: QUERY_GAME,  variables: { gameId } },
      { query: QUERY_GAMES, variables: { status: "PENDING" } },
    ],
    awaitRefetchQueries: true,
    onCompleted: () => {
      setFormState(prev => ({ ...prev, notes: "" }));
      onClose();
    },
  });

  useEffect(() => {
    setFormState({
      date: initialDate || "",
      time: initialTime || "",
      venue: initialVenue || "",
      city: initialCity || "",
      notes: initialNotes || "",
      opponent: initialOpponent || "",
    });
  }, [initialDate, initialTime, initialVenue, initialCity, initialNotes, initialOpponent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const input = {};
    if (formState.date     !== initialDate)    input.date     = formState.date;
    if (formState.time     !== initialTime)    input.time     = formState.time;
    if (formState.venue    !== initialVenue)   input.venue    = formState.venue;
    if (formState.city     !== initialCity)    input.city     = formState.city;
    if (formState.notes    !== initialNotes)   input.notes    = formState.notes;
    if (formState.opponent !== initialOpponent)input.opponent = formState.opponent;

    if (!Object.keys(input).length) {
      onClose();
      return;
    }

    try {
      await updateGame({ variables: { gameId, input } });
    } catch (e) {
      console.error("Update failed", e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm p-1 sm:p-4 overflow-y-auto">
      <div
        className={`relative w-full max-w-2xl mx-auto rounded-2xl shadow-2xl border transition-all duration-300 transform scale-100 min-h-[98vh] sm:min-h-0 sm:h-auto sm:max-h-[90vh] flex flex-col my-1 sm:my-0 ${
          isDarkMode 
            ? "bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border-gray-600/50" 
            : "bg-gradient-to-br from-white via-gray-50 to-white border-gray-200/50"
        } backdrop-blur-sm`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 z-10 text-sm sm:text-base ${
            isDarkMode 
              ? "bg-gray-700/80 hover:bg-gray-600 text-gray-300 hover:text-white" 
              : "bg-gray-100/80 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
          }`}
        >
          ✕
        </button>

        {/* Header with icon - Fixed */}
        <div className={`flex-shrink-0 p-3 sm:p-6 pb-2 sm:pb-4 border-b ${isDarkMode ? "border-gray-700/50" : "border-gray-200/50"}`}>
          <div className="flex items-center justify-center mb-2 sm:mb-4">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center shadow-lg">
              <span className="text-lg sm:text-2xl">⚽</span>
            </div>
          </div>
          <h2 className={`text-base sm:text-xl font-bold text-center ${isDarkMode ? "text-white" : "text-gray-800"}`}>
            Update Game Info
          </h2>
          <p className={`text-center mt-1 text-xs sm:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Make changes to your game details
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-3 sm:p-6">
            <div className="space-y-2 sm:space-y-4">
              {/* Date & Time Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                <div className="space-y-1">
                  <label className={`text-xs sm:text-sm font-medium flex items-center gap-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                    📅 <span>Date</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formState.date}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                      isDarkMode 
                        ? "bg-gray-700/80 border-gray-600 text-white placeholder-gray-400" 
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-xs sm:text-sm font-medium flex items-center gap-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                    ⏰ <span>Time</span>
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formState.time}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                      isDarkMode 
                        ? "bg-gray-700/80 border-gray-600 text-white placeholder-gray-400" 
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                  />
                </div>
              </div>

              {/* Venue & City Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                <div className="space-y-1">
                  <label className={`text-xs sm:text-sm font-medium flex items-center gap-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                    🏟️ <span>Venue</span>
                  </label>
                  <input
                    type="text"
                    name="venue"
                    value={formState.venue}
                    onChange={handleChange}
                    placeholder="Central Park Field #3"
                    className={`w-full px-3 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                      isDarkMode 
                        ? "bg-gray-700/80 border-gray-600 text-white placeholder-gray-400" 
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-xs sm:text-sm font-medium flex items-center gap-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                    🌍 <span>City</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formState.city}
                    onChange={handleChange}
                    placeholder="New York"
                    className={`w-full px-3 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                      isDarkMode 
                        ? "bg-gray-700/80 border-gray-600 text-white placeholder-gray-400" 
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                  />
                </div>
              </div>

              {/* Opponent */}
              <div className="space-y-1">
                <label className={`text-xs sm:text-sm font-medium flex items-center gap-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                  🏃‍♂️ <span>Opponent Team</span>
                </label>
                <input
                  type="text"
                  name="opponent"
                  value={formState.opponent}
                  onChange={handleChange}
                  placeholder="Rockets FC"
                  className={`w-full px-3 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                    isDarkMode 
                      ? "bg-gray-700/80 border-gray-600 text-white placeholder-gray-400" 
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className={`text-xs sm:text-sm font-medium flex items-center gap-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                  📝 <span>Additional Notes</span>
                </label>
                <textarea
                  name="notes"
                  value={formState.notes}
                  onChange={handleChange}
                  placeholder="Add any special instructions, equipment needed, or other important details..."
                  rows={3}
                  className={`w-full px-3 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none ${
                    isDarkMode 
                      ? "bg-gray-700/80 border-gray-600 text-white placeholder-gray-400" 
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-2 sm:mt-4 p-2 sm:p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50">
                <div className="flex items-start gap-2">
                  <span className="text-red-500 text-xs sm:text-sm mt-0.5">⚠️</span>
                  <p className="text-red-600 dark:text-red-400 text-xs sm:text-sm font-medium">
                    {error.message}
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Fixed Footer with Buttons */}
        <div className={`flex-shrink-0 p-3 sm:p-6 pt-2 sm:pt-4 border-t ${isDarkMode ? "border-gray-700/50" : "border-gray-200/50"}`}>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 sm:flex-none px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
                isDarkMode 
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white border border-gray-600" 
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-gray-300"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <span>✅</span>
                  <span>Update Game</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameUpdate;
