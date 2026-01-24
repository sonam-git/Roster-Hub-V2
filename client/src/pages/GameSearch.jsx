import React, { useState } from "react";
import GameSearch from "../components/GameSearch";
import GameList from "../components/GameList";

const GameSearchPage = () => {
  const [searchFilters, setSearchFilters] = useState(null);

  const handleSearch = (filters) => {
    setSearchFilters(filters);
  };

  const handleResetSearch = () => {
    setSearchFilters(null);
  };

  return (
    <div className="mt-4 mb-6 w-full max-w-full overflow-hidden px-2 sm:px-0 pt-20 lg:pt-24">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex-1 w-full lg:w-auto text-center">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Game Search
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400">
              Discover, filter, and organize your games with powerful search tools
            </p>
          </div>
        </div>
      </div>
 
      {/* Search Component */}
      <div className="w-full mb-6">
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    Search Results
                  </h2>
                  <button
                    onClick={handleResetSearch}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 border border-gray-200 dark:border-gray-600"
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
  );
};

export default GameSearchPage;
