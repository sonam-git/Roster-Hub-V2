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
    <div className="w-full">
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date & Time Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`text-sm font-medium flex items-center gap-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
              📅 <span>Date</span>
            </label>
            <input
              type="date"
              name="date"
              value={formState.date}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 text-sm rounded-lg border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                isDarkMode 
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
            />
          </div>
          <div className="space-y-2">
            <label className={`text-sm font-medium flex items-center gap-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
              ⏰ <span>Time</span>
            </label>
            <input
              type="time"
              name="time"
              value={formState.time}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 text-sm rounded-lg border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                isDarkMode 
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
            />
          </div>
        </div>

        {/* Venue & City Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`text-sm font-medium flex items-center gap-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
              🏟️ <span>Venue</span>
            </label>
            <input
              type="text"
              name="venue"
              value={formState.venue}
              onChange={handleChange}
              placeholder="Central Park Field #3"
              className={`w-full px-4 py-2.5 text-sm rounded-lg border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                isDarkMode 
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
            />
          </div>
          <div className="space-y-2">
            <label className={`text-sm font-medium flex items-center gap-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
              🌍 <span>City</span>
            </label>
            <input
              type="text"
              name="city"
              value={formState.city}
              onChange={handleChange}
              placeholder="New York"
              className={`w-full px-4 py-2.5 text-sm rounded-lg border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                isDarkMode 
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
            />
          </div>
        </div>

        {/* Opponent */}
        <div className="space-y-2">
          <label className={`text-sm font-medium flex items-center gap-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
            🏃‍♂️ <span>Opponent Team</span>
          </label>
          <input
            type="text"
            name="opponent"
            value={formState.opponent}
            onChange={handleChange}
            placeholder="Rockets FC"
            className={`w-full px-4 py-2.5 text-sm rounded-lg border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
              isDarkMode 
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            }`}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className={`text-sm font-medium flex items-center gap-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
            📝 <span>Additional Notes</span>
          </label>
          <textarea
            name="notes"
            value={formState.notes}
            onChange={handleChange}
            placeholder="Add any special instructions, equipment needed, or other important details..."
            rows={4}
            className={`w-full px-4 py-2.5 text-sm rounded-lg border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none ${
              isDarkMode 
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            }`}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50">
            <div className="flex items-start gap-2">
              <span className="text-red-500 text-sm mt-0.5">⚠️</span>
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                {error.message}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={`flex flex-col sm:flex-row gap-3 pt-4 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
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
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-6 py-3 text-sm rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
  );
};

export default GameUpdate;
