import React, { useContext, useState } from "react";
import { ThemeContext } from "../components/ThemeContext";
import GameSearch from "../components/GameSearch";
import GameList from "../components/GameList";

const GameSearchPage = () => {
  const { isDarkMode } = useContext(ThemeContext);
  
  const [searchFilters, setSearchFilters] = useState(null);

  const handleSearch = (filters) => {
    setSearchFilters(filters);
  };

  const handleResetSearch = () => {
    setSearchFilters(null);
  };

 

  return (
    <div className="w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 mt-6 lg:mt-5 max-w-7xl">
      <div className="flex flex-col space-y-6">
        {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
            <div className="flex flex-col items-center mb-4">
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center mb-4 shadow-xl transform hover:scale-105 transition-all duration-300 ${
                isDarkMode ? 'shadow-blue-500/25' : 'shadow-blue-500/20'
              }`}>
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h1 className={`text-2xl sm:text-3xl md:text-3xl font-bold mb-2 ${
              isDarkMode 
                ? " text-white" 
                : "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
            }`}>
              Game Search
            </h1>
          </div>
         <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Discover, filter, and organize your games with powerful search tools. Find exactly what you're looking for!
              </p>
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
            }
          })()}
        </div>
      </div>
    </div>
  );
};

export default GameSearchPage;
