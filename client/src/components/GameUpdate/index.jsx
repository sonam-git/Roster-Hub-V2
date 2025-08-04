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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`relative w-11/12 max-w-lg mx-4 rounded-3xl shadow-2xl border-2 transition-all duration-300 transform scale-100 ${
          isDarkMode 
            ? "bg-gradient-to-br from-gray-800 via-gray-900 to-black border-gray-600" 
            : "bg-gradient-to-br from-white via-gray-50 to-white border-gray-200"
        }`}
      >
        {/* Header with icon */}
        <div className={`p-6 pb-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center shadow-lg">
              <span className="text-3xl">⚽</span>
            </div>
          </div>
          <h2 className={`text-2xl font-bold text-center ${isDarkMode ? "text-white" : "text-gray-800"}`}>
            Update Game Info
          </h2>
          <p className={`text-center mt-2 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            Make changes to your game details
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            {/* Date & Time Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className={`font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                  📅 <span>Date</span>
                </span>
                <input
                  type="date"
                  name="date"
                  value={formState.date}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 shadow-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                    isDarkMode 
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </label>
              <label className="block">
                <span className={`font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                  ⏰ <span>Time</span>
                </span>
                <input
                  type="time"
                  name="time"
                  value={formState.time}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 shadow-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                    isDarkMode 
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </label>
            </div>

            {/* Venue & City Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className={`font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                  🏟️ <span>Venue</span>
                </span>
                <input
                  type="text"
                  name="venue"
                  value={formState.venue}
                  onChange={handleChange}
                  placeholder="e.g. Central Park Field #3"
                  className={`w-full px-4 py-3 rounded-xl border-2 shadow-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                    isDarkMode 
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </label>
              <label className="block">
                <span className={`font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                  🌍 <span>City</span>
                </span>
                <input
                  type="text"
                  name="city"
                  value={formState.city}
                  onChange={handleChange}
                  placeholder="e.g. New York"
                  className={`w-full px-4 py-3 rounded-xl border-2 shadow-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                    isDarkMode 
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </label>
            </div>

            {/* Opponent */}
            <label className="block">
              <span className={`font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                🏃‍♂️ <span>Opponent</span>
              </span>
              <input
                type="text"
                name="opponent"
                value={formState.opponent}
                onChange={handleChange}
                placeholder="e.g. Rockets FC"
                className={`w-full px-4 py-3 rounded-xl border-2 shadow-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                  isDarkMode 
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </label>

            {/* Notes */}
            <label className="block">
              <span className={`font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                📝 <span>Notes</span>
              </span>
              <textarea
                name="notes"
                value={formState.notes}
                onChange={handleChange}
                placeholder="Add any additional notes or special instructions..."
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border-2 shadow-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none ${
                  isDarkMode 
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2">
                <span className="text-red-500 text-lg">⚠️</span>
                <p className="text-red-600 dark:text-red-400 font-medium">
                  Error: {error.message}
                </p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="group relative overflow-hidden bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span className="text-lg">❌</span>
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <span className="text-lg">✅</span>
                  <span>Update Game</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GameUpdate;
