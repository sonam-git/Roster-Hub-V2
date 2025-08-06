import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../components/ThemeContext";
import GameSearch from "../components/GameSearch";
import GameList from "../components/GameList";

const GameSearchPage = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [searchFilters, setSearchFilters] = useState(null);

  const handleSearch = (filters) => {
    setSearchFilters(filters);
  };

  const handleResetSearch = () => {
    setSearchFilters(null);
  };

  const handleBackToGames = () => {
    navigate("/game-schedule");
  };

  return (
    <div className="w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 mt-6 lg:mt-5 max-w-7xl">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToGames}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                isDarkMode 
                  ? "bg-gray-700 hover:bg-gray-600 text-white" 
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
              aria-label="Back to games"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg> back
            </button>
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                Game Search
              </h1>
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Find and filter your games
              </p>
            </div>
          </div>
        </div>

        {/* Search Component */}
        <div className="w-full">
          <GameSearch 
            onSearch={handleSearch}
            onReset={handleResetSearch}
            initialFilters={searchFilters || {}}
          />
        </div>

        {/* Results Section */}
        <div className="w-full">
          {(() => {
            // Check if there are meaningful search filters applied
            const hasActiveFilters = searchFilters && (
              (searchFilters.searchText && searchFilters.searchText.trim()) ||
              (searchFilters.status && searchFilters.status !== 'ALL') ||
              searchFilters.dateFrom ||
              searchFilters.dateTo ||
              searchFilters.timeFrom ||
              searchFilters.timeTo ||
              (searchFilters.venue && searchFilters.venue.trim()) ||
              (searchFilters.opponent && searchFilters.opponent.trim())
            );

            if (hasActiveFilters) {
              return (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                      Search Results
                    </h2>
                    <button
                      onClick={handleResetSearch}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isDarkMode
                          ? "bg-gray-600 hover:bg-gray-500 text-white"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      }`}
                    >
                      Clear Filters
                    </button>
                  </div>
                  <GameList searchFilters={searchFilters} />
                </div>
              );
            } else {
              return (
                <div className={`text-center py-12 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Ready to Search</h3>
                  <p className="text-sm">Use the search filters above to find specific games</p>
                </div>
              );
            }
          })()}
        </div>
      </div>
    </div>
  );
};

export default GameSearchPage;
