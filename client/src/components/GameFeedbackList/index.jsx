// src/components/GameFeedbackList.jsx
import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { QUERY_GAME } from "../../utils/queries";

const GameFeedbackList = ({ gameId, isDarkMode }) => {
  const { loading, error, data } = useQuery(QUERY_GAME, {
    variables: { gameId },
    fetchPolicy: "network-only",
  });
  const [page, setPage] = useState(0);
  const perPage = 3;

  if (loading) {
    return (
      <div className="mt-6 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`p-6 rounded-2xl shadow-lg animate-pulse ${
              isDarkMode ? "bg-gray-800" : "bg-gray-200"
            }`}
          >
            <div className={`h-4 rounded mb-3 ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}></div>
            <div className={`h-3 rounded mb-2 w-3/4 ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}></div>
            <div className={`h-3 rounded w-1/2 ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`mt-6 p-6 rounded-2xl border-2 text-center ${
        isDarkMode 
          ? "bg-red-900/20 border-red-800 text-red-400" 
          : "bg-red-50 border-red-200 text-red-600"
      }`}>
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-2xl">⚠️</span>
          <h3 className="font-bold text-lg">Error Loading Feedback</h3>
        </div>
        <p className="opacity-80">{error.message}</p>
      </div>
    );
  }

  const feedbacks = data?.game?.feedbacks || [];
  
  if (!feedbacks.length) {
    return (
      <div className={`mt-6 p-8 rounded-2xl border-2 border-dashed text-center ${
        isDarkMode 
          ? "border-gray-600 bg-gray-800/50 text-gray-400" 
          : "border-gray-300 bg-gray-50 text-gray-500"
      }`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <span className="text-3xl">💭</span>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">No Feedback Yet</h3>
            <p className="italic">Be the first to share your thoughts about this game!</p>
          </div>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(feedbacks.length / perPage);
  const paged = feedbacks.slice(page * perPage, (page + 1) * perPage);

  const getRatingColor = (rating) => {
    if (rating >= 8) return "from-green-500 to-emerald-500";
    if (rating >= 6) return "from-yellow-500 to-amber-500";
    return "from-red-500 to-rose-500";
  };

  const getRatingEmoji = (rating) => {
    if (rating >= 9) return "🌟";
    if (rating >= 7) return "😊";
    if (rating >= 5) return "😐";
    return "😞";
  };

  return (
    <div className="mt-6">
      {/* Header */}
      <div className={`p-6 rounded-2xl mb-6 border-2 ${
        isDarkMode 
          ? "bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700 text-gray-200" 
          : "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-gray-800"
      }`}>
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-xl font-bold">Player Feedback</h3>
        </div>
        
        <p className="text-center italic opacity-80">
          Anonymous feedback from players for the game held on{" "}
          <span className="font-semibold">
            {new Date(parseInt(data.game.date)).toLocaleDateString()}
          </span>
        </p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="text-sm opacity-70">Total responses:</span>
          <span className="font-bold text-lg">{feedbacks.length}</span>
        </div>
      </div>

      {/* Feedback Cards */}
      <div className="space-y-4">
        {paged.map((fb, index) => (
          <div
            key={fb._id}
            className={`group relative overflow-hidden rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
              isDarkMode
                ? "bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border-gray-700"
                : "bg-gradient-to-br from-white via-gray-50 to-white border-gray-200"
            }`}
          >
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative p-6">
              {/* Header with rating and date */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${getRatingColor(fb.rating)} text-white font-bold shadow-lg`}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getRatingEmoji(fb.rating)}</span>
                      <span>{fb.rating}/10</span>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    Feedback #{page * perPage + index + 1}
                  </div>
                </div>
                <div className={`text-sm flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  <span>📅</span>
                  <span>{new Date(parseInt(fb.createdAt)).toLocaleDateString()}</span>
                  <span>🕒</span>
                  <span>{new Date(parseInt(fb.createdAt)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {/* Comment */}
              <div className={`p-4 rounded-xl italic leading-relaxed ${
                isDarkMode 
                  ? "bg-gray-700/50 text-gray-200" 
                  : "bg-gray-50 text-gray-700"
              }`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl opacity-50">"</span>
                  <p className="flex-1 text-sm">{fb.comment}</p>
                  <span className="text-2xl opacity-50 self-end">"</span>
                </div>
              </div>

              {/* Player of the Match Vote */}
              {fb.playerOfTheMatch && (
                <div className={`mt-3 p-3 rounded-lg border-l-4 border-yellow-500 ${
                  isDarkMode 
                    ? "bg-yellow-900/20 text-yellow-200" 
                    : "bg-yellow-50 text-yellow-800"
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏆</span>
                    <span className="text-sm font-medium">
                      Voted for <span className="font-bold">{fb.playerOfTheMatch.name}</span> as Player of the Match
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            className="group relative overflow-hidden bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
          >
            <span>⬅️</span>
            <span>Previous</span>
          </button>
          
          <div className={`px-4 py-2 rounded-xl font-medium ${
            isDarkMode ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-700"
          }`}>
            <span className="text-sm">Page</span>
            <span className="mx-2 font-bold text-lg">{page + 1}</span>
            <span className="text-sm">of {totalPages}</span>
          </div>
          
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1}
            className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
          >
            <span>Next</span>
            <span>➡️</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default GameFeedbackList;
