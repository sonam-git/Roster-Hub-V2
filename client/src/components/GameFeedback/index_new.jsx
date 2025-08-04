// src/components/GameFeedback.jsx
import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { ADD_FEEDBACK } from "../../utils/mutations";
import { QUERY_GAME } from "../../utils/queries";

const GameFeedback = ({ gameId, isDarkMode, onFeedback }) => {
  const [comment, setComment] = useState("");
  const [rating, setRating]   = useState(5);
  const [validationError, setValidationError] = useState("");

  const [addFeedback, { loading, error }] = useMutation(ADD_FEEDBACK, {
    refetchQueries: [{ query: QUERY_GAME, variables: { gameId } }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      // clear form
      setComment("");
      setRating(5);
      // notify parent
      onFeedback();
    }
  });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!comment.trim() || isNaN(rating) || rating < 0 || rating > 10) {
      setValidationError("Please add your feedback and rating (0–10).");
      setTimeout(() => setValidationError(""), 3000);
      return;
    }
    await addFeedback({ variables: { gameId, comment: comment.trim(), rating } });
  };

  return (
    <div className={`rounded-2xl border transition-all duration-300 ${
      isDarkMode 
        ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700" 
        : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
    }`}>
      {/* Header */}
      <div className={`p-6 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h4 className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Share Your Feedback
            </h4>
            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Help us improve future games
            </p>
          </div>
        </div>
        
        <div className={`p-4 rounded-xl border-l-4 border-purple-500 ${
          isDarkMode ? "bg-purple-900/20 text-purple-200" : "bg-purple-50 text-purple-800"
        }`}>
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm leading-relaxed">
              Feedback is collected anonymously—please keep it constructive and solution-oriented!
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Feedback Text */}
          <div className="space-y-2">
            <label className={`block text-sm font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
              Your thoughts about today's game
            </label>
            <div className="relative">
              <textarea
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                  isDarkMode 
                    ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400" 
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                placeholder="Share your experience, suggestions, or what you enjoyed most about the game..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={4}
              />
              <div className="absolute bottom-3 right-3 pointer-events-none">
                <div className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                  {comment.length}/500
                </div>
              </div>
            </div>
          </div>

          {/* Rating Section */}
          <div className="space-y-3">
            <label className={`block text-sm font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
              Rate your experience (0-10)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="10"
                value={rating}
                onChange={e => setRating(parseInt(e.target.value, 10) || 0)}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${rating * 10}%, ${isDarkMode ? '#374151' : '#e5e7eb'} ${rating * 10}%, ${isDarkMode ? '#374151' : '#e5e7eb'} 100%)`
                }}
              />
              <div className={`w-16 h-12 rounded-xl flex items-center justify-center font-bold text-lg border-2 ${
                rating >= 8 
                  ? "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400"
                  : rating >= 6
                  ? "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500 text-yellow-700 dark:text-yellow-400"
                  : "bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400"
              }`}>
                {rating}
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>

          {/* Error Messages */}
          {validationError && (
            <div className="flex items-center space-x-2 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-xl">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 dark:text-red-300 text-sm font-medium">{validationError}</p>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-xl">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error.message}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Submitting feedback...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Submit Feedback</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GameFeedback;
