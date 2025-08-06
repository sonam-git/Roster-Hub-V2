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
  { code: "FL1", name: "Ligue 1" },
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-gray-800 dark:to-gray-700 py-6 sm:py-8 md:py-12">
        <div className="w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 max-w-7xl">
          <div className="text-center text-white">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2 md:mb-4 leading-tight">
              ⚽ Live Scores & Fixtures
            </h1>
            <p className="text-sm sm:text-lg md:text-xl opacity-90">
              Stay updated with your favorite leagues and matches
            </p>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 md:py-8 space-y-6 sm:space-y-8 max-w-7xl">
        {/* My Favorites Section */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="text-xl sm:text-2xl">⭐</div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              My Favorite Leagues
            </h2>
          </div>
          
          {favorites.length ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8 md:p-12 text-center">
              <div className="text-3xl sm:text-4xl md:text-6xl mb-3 sm:mb-4">📋</div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No favorites yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-sm md:text-base px-2">
                Add your favorite leagues from the list below to see their live scores and fixtures here.
              </p>
            </div>
          )}
        </div>

        {/* All Leagues Section */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="text-xl sm:text-2xl">🏆</div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Available Leagues
            </h2>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
              {ALL_LEAGUES.map(({ code, name }, index) => {
                const isFav = favorites.includes(code);
                return (
                  <div
                    key={code}
                    className={`p-3 sm:p-4 md:p-6 border-gray-200 dark:border-gray-700 ${
                      index < ALL_LEAGUES.length - 1 ? 'border-b sm:border-b-0' : ''
                    } ${
                      index % 3 !== 2 ? 'sm:border-r' : ''
                    } ${
                      index % 2 !== 1 ? 'sm:border-r lg:border-r-0' : 'lg:border-r'
                    } hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm md:text-base flex-shrink-0">
                          {code}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-sm md:text-base truncate">
                            {name}
                          </h3>
                          <p className="text-xs sm:text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
                            {code} League
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => toggleFav(code)}
                        className={`px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 flex-shrink-0 ml-2 ${
                          isFav
                            ? "bg-red-500 hover:bg-red-600 text-white shadow-md"
                            : "bg-indigo-500 hover:bg-indigo-600 dark:bg-gray-600 dark:hover:bg-gray-500 text-white shadow-md"
                        }`}
                      >
                        {isFav ? (
                          <span className="flex items-center space-x-1">
                            <span>✓</span>
                            <span className="hidden sm:inline">Added</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1">
                            <span>+</span>
                            <span className="hidden sm:inline">Add</span>
                          </span>
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
