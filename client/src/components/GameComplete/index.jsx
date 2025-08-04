// src/components/GameComplete.jsx
import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { COMPLETE_GAME } from "../../utils/mutations";
import { QUERY_GAME, QUERY_GAMES } from "../../utils/queries";

const GameComplete = ({
  gameId,
  note,        // ⬅️ grab the note prop
  onClose,
  isDarkMode,
  onComplete,
}) => {
  const [score, setScore]   = useState("");
  const [result, setResult] = useState("NOT_PLAYED");

  const [completeGame, { loading, error }] = useMutation(COMPLETE_GAME, {
    refetchQueries: [
      { query: QUERY_GAME,  variables: { gameId} },
      { query: QUERY_GAMES, variables: { status: "PENDING" } },
    ],
    awaitRefetchQueries: true,
    onCompleted: () => {
      // notify parent so it can update UI
      onComplete(score, result);
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    completeGame({
      variables: {
        gameId,
        score,
        result,
        note,         // ⬅️ pass the note here
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className={`w-full max-w-lg rounded-2xl shadow-2xl border transition-all duration-300 transform hover:scale-[1.02] ${
          isDarkMode 
            ? "bg-gradient-to-br from-gray-800 via-gray-900 to-black border-gray-600 text-white" 
            : "bg-gradient-to-br from-white via-gray-50 to-gray-100 border-gray-200 text-gray-900"
        }`}
      >
        {/* Header */}
        <div className={`p-6 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">Complete Game</h2>
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Mark this game as finished
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode 
                  ? "hover:bg-gray-700 text-gray-400 hover:text-white" 
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Score Input */}
            <div className="space-y-2">
              <label className={`block text-sm font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                Final Score
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="e.g. 2 - 1"
                  required
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Result Selection */}
            <div className="space-y-2">
              <label className={`block text-sm font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                Game Result
              </label>
              <div className="relative">
                <select
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  required
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                    isDarkMode 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="HOME_WIN">🏠 Home Win</option>
                  <option value="AWAY_WIN">✈️ Away Win</option>
                  <option value="DRAW">🤝 Draw</option>
                  <option value="NOT_PLAYED">❌ Not Played</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-xl">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error.message}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  isDarkMode 
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600" 
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Completing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Complete Game</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GameComplete;
