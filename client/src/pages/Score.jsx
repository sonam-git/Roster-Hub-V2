// src/pages/Score.jsx
import React, { useState, useEffect } from "react";
import Scoreboard from "../components/ScoreBoard";

// a little lookup for all the leagues we support:
const ALL_LEAGUES = [
  { code: "PL", name: "Premier League" },
  { code: "PD", name: "La Liga" },
  { code: "SA", name: "Serie A" },
  { code: "CL", name: "Champions League" },
  { code: "EL", name: "Europa League" },
  { code: "BL1", name: "Bundesliga" },
  { code: "FL1", name: "Ligue 1" }
];

export default function Score() {
  // load from localStorage so favorites stick across reloads:
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("favLeagues")) || [];
    } catch {
      return [];
    }
  });

  // persist changes:
  useEffect(() => {
    localStorage.setItem("favLeagues", JSON.stringify(favorites));
  }, [favorites]);

  // toggle presence in favorites
  const toggleFav = (code) => {
    setFavorites((favs) =>
      favs.includes(code)
        ? favs.filter((c) => c !== code)
        : [...favs, code]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-8 pt-20 lg:pt-24">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-6 max-w-7xl">
        {/* AWS-style Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Live Scores & Fixtures
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Stay updated with your favorite leagues and matches
          </p>
        </div>

        {/* My Favorites Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-500 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              My Favorite Leagues
            </h2>
          </div>
          
          {favorites.length ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {favorites.map((code) => {
                const league = ALL_LEAGUES.find((l) => l.code === code);
                return (
                  <Scoreboard
                    key={code}
                    competitionCode={code}
                    title={league?.name || code}
                  />
                );
              })}
            </div>
          ) : (
            <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm">
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500"></div>
              
              <div className="p-8 text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 mx-auto rounded-md bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-yellow-500 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No favorites yet
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-md mx-auto">
                  Add your favorite leagues from the list below to see their live scores and fixtures here.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* All Leagues Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Available Leagues
            </h2>
          </div>

          <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {ALL_LEAGUES.map(({ code, name }) => {
                const isFav = favorites.includes(code);
                return (
                  <div
                    key={code}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 shadow-sm">
                          {code}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                            {name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {code} League
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => toggleFav(code)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-sm transition-all duration-150 flex-shrink-0 shadow-sm ${
                          isFav
                            ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30"
                            : "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                        }`}
                      >
                        {isFav ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="hidden sm:inline">Remove</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="hidden sm:inline">Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
