// src/components/GameSearch/index.jsx
import React, { useState, useContext } from "react";
import { ThemeContext } from "../ThemeContext";

const GameSearch = ({ onSearch, onReset, initialFilters = {} }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Safely handle null or undefined initialFilters
  const safeInitialFilters = initialFilters || {};
  
  const [filters, setFilters] = useState({
    searchText: safeInitialFilters.searchText || '',
    status: safeInitialFilters.status || 'ALL',
    sortBy: safeInitialFilters.sortBy || 'date',
    sortOrder: safeInitialFilters.sortOrder || 'asc',
    dateFrom: safeInitialFilters.dateFrom || '',
    dateTo: safeInitialFilters.dateTo || '',
    timeFrom: safeInitialFilters.timeFrom || '',
    timeTo: safeInitialFilters.timeTo || '',
    venue: safeInitialFilters.venue || '',
    opponent: safeInitialFilters.opponent || '',
  });

  const STATUS_OPTIONS = [
    { key: 'ALL', label: 'All Games', icon: '📋' },
    { key: 'PENDING', label: 'Pending', icon: '⏳' },
    { key: 'CONFIRMED', label: 'Confirmed', icon: '✅' },
    { key: 'CANCELLED', label: 'Cancelled', icon: '❌' },
    { key: 'COMPLETED', label: 'Completed', icon: '🏆' },
  ];

  const SORT_OPTIONS = [
    { key: 'date', label: 'Date', icon: '📅' },
    { key: 'time', label: 'Time', icon: '🕐' },
    { key: 'opponent', label: 'Opponent', icon: '🥅' },
    { key: 'venue', label: 'Venue', icon: '🏟️' },
    { key: 'status', label: 'Status', icon: '📊' },
    { key: 'created', label: 'Created', icon: '🆕' },
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Auto-search for text input to provide live results
    if (key === 'searchText') {
      onSearch(newFilters);
    }
  };

  const handleSearch = () => {
    onSearch(filters);
    // Auto-collapse after search for better UX
    if (isExpanded) {
      setIsExpanded(false);
    }
  };

  const handleReset = () => {
    const resetFilters = {
      searchText: '',
      status: 'ALL',
      sortBy: 'date',
      sortOrder: 'asc',
      dateFrom: '',
      dateTo: '',
      timeFrom: '',
      timeTo: '',
      venue: '',
      opponent: '',
    };
    setFilters(resetFilters);
    onReset(resetFilters);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`rounded-2xl shadow-xl transition-all duration-300 mb-6 overflow-hidden ${
      isDarkMode 
        ? "bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border border-gray-600" 
        : "bg-gradient-to-br from-white via-blue-50 to-indigo-50 border border-blue-200"
    }`}>
      {/* Search Header */}
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-lg text-white">🔍</span>
            </div>
            <div>
              <h3 className={`text-lg sm:text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                Game Search & Filters
              </h3>
              <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                Find and organize your games
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Active Filters Indicator */}
            {(filters.searchText || filters.status !== 'ALL' || filters.dateFrom || filters.dateTo || 
              filters.timeFrom || filters.timeTo || filters.venue || filters.opponent) && (
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                isDarkMode ? "bg-blue-800 text-blue-200" : "bg-blue-100 text-blue-700"
              }`}>
                Active Filters
              </div>
            )}
            <button
              onClick={toggleExpanded}
              className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                isDarkMode 
                  ? "bg-gray-700 hover:bg-gray-600 text-white" 
                  : "bg-blue-100 hover:bg-blue-200 text-blue-700"
              }`}
            >
              <span className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                ⬇️
              </span>
            </button>
          </div>
        </div>

        {/* Quick Search Bar */}
        <div className="flex gap-2 sm:gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search games by opponent, venue, or notes..."
              value={filters.searchText}
              onChange={(e) => handleFilterChange('searchText', e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
              }`}
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            <span className="hidden sm:inline">Search</span>
            <span className="sm:hidden">🔍</span>
          </button>
          <button
            onClick={handleReset}
            className={`px-4 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              isDarkMode
                ? "bg-gray-600 hover:bg-gray-500 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            <span className="hidden sm:inline">Reset</span>
            <span className="sm:hidden">🔄</span>
          </button>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className={`border-t p-4 sm:p-6 ${
          isDarkMode ? "border-gray-600 bg-gray-800/50" : "border-gray-200 bg-gray-50/50"
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Status Filter */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                🏷️ Game Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-800"
                }`}
              >
                {STATUS_OPTIONS.map(option => (
                  <option key={option.key} value={option.key}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                📊 Sort By
              </label>
              <div className="flex gap-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className={`flex-1 px-3 py-2 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-800"
                  }`}
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.key} value={option.key}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  className={`px-3 py-2 rounded-lg border transition-all duration-300 hover:scale-105 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                      : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50"
                  }`}
                  title={`Sort ${filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
                >
                  {filters.sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                📅 Date Range
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className={`flex-1 px-3 py-2 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-800"
                  }`}
                  placeholder="From"
                />
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className={`flex-1 px-3 py-2 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-800"
                  }`}
                  placeholder="To"
                />
              </div>
            </div>

            {/* Time Range */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                🕐 Time Range
              </label>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={filters.timeFrom}
                  onChange={(e) => handleFilterChange('timeFrom', e.target.value)}
                  className={`flex-1 px-3 py-2 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-800"
                  }`}
                />
                <input
                  type="time"
                  value={filters.timeTo}
                  onChange={(e) => handleFilterChange('timeTo', e.target.value)}
                  className={`flex-1 px-3 py-2 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-800"
                  }`}
                />
              </div>
            </div>

            {/* Venue Filter */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                🏟️ Venue
              </label>
              <input
                type="text"
                placeholder="Filter by venue..."
                value={filters.venue}
                onChange={(e) => handleFilterChange('venue', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                }`}
              />
            </div>

            {/* Opponent Filter */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                🥅 Opponent
              </label>
              <input
                type="text"
                placeholder="Filter by opponent..."
                value={filters.opponent}
                onChange={(e) => handleFilterChange('opponent', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                }`}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>🔍</span>
              Apply Filters
            </button>
            <button
              onClick={handleReset}
              className={`px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 ${
                isDarkMode
                  ? "bg-gray-600 hover:bg-gray-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              <span>🔄</span>
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameSearch;
