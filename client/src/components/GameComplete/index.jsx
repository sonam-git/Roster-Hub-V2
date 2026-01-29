// src/components/GameComplete.jsx
import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { COMPLETE_GAME } from "../../utils/mutations";
import { QUERY_GAME, QUERY_GAMES } from "../../utils/queries";
import { useOrganization } from "../../contexts/OrganizationContext";

const GameComplete = ({
  gameId,
  note,        // ⬅️ grab the note prop
  onClose,
  isDarkMode,
  onComplete,
}) => {
  const { currentOrganization } = useOrganization();
  const [score, setScore]   = useState("");
  const [result, setResult] = useState("NOT_PLAYED");

  const [completeGame, { loading, error }] = useMutation(COMPLETE_GAME, {
    refetchQueries: [
      { query: QUERY_GAME,  variables: { gameId, organizationId: currentOrganization?._id } },
      { query: QUERY_GAMES, variables: { status: "PENDING", organizationId: currentOrganization?._id } },
      { query: QUERY_GAMES, variables: { status: "COMPLETED", organizationId: currentOrganization?._id } },
    ],
    awaitRefetchQueries: true,
    onCompleted: () => {
      // notify parent so it can update UI
      if (onComplete) onComplete(score, result);
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!currentOrganization) {
      console.error('No organization selected');
      alert('Please select an organization to complete the game.');
      return;
    }

    completeGame({
      variables: {
        gameId,
        score,
        result,
        note,         // ⬅️ pass the note here
        organizationId: currentOrganization._id,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className={`w-full max-w-lg rounded-lg shadow-xl border transition-all ${
          isDarkMode 
            ? "bg-gray-800 border-gray-700 text-white" 
            : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        {/* Header */}
        <div className={`p-6 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Complete Game</h2>
              <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Mark this game as finished
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-md transition-colors ${
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
              <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                Final Score
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="e.g. 2 - 1"
                  required
                  className={`w-full px-3 py-2 rounded-md border transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDarkMode 
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </div>
            </div>

            {/* Result Selection */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                Game Result
              </label>
              <div className="relative">
                <select
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  required
                  className={`w-full px-3 py-2 rounded-md border transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none ${
                    isDarkMode 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="HOME_WIN">Home Win</option>
                  <option value="AWAY_WIN">Away Win</option>
                  <option value="DRAW">Draw</option>
                  <option value="NOT_PLAYED">Not Played</option>
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
              <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isDarkMode 
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600" 
                    : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Completing...</span>
                  </div>
                ) : (
                  "Complete Game"
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
