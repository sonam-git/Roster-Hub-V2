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
      <div className="p-4 sm:p-6 md:p-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => window.history.back()}
            className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md group ${
              isDarkMode 
                ? "bg-gray-700/80 hover:bg-gray-600/80 text-gray-200 hover:text-white border border-gray-600 shadow-gray-800/50" 
                : "bg-white/90 hover:bg-blue-50 text-gray-600 hover:text-blue-700 border border-gray-200 shadow-blue-200/50 hover:shadow-lg"
            }`}
            title="Go back to Game Schedule"
          >
            <svg 
              className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:-translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm sm:text-base font-medium">Back to Game Schedule</span>
          </button>
        </div>

        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg transform hover:scale-105 transition-all duration-300">
              <span className="text-xl sm:text-2xl text-white">🎯</span>
            </div>
            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${
              isDarkMode 
                ? "bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent" 
                : "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            }`}>
              Game Search
            </h1>
          </div>
          <p className={`text-sm sm:text-base font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Discover, filter, and organize your games with powerful search tools
          </p>
        </div>

        <div className="flex items-center justify-end mb-4 sm:mb-6">
          {/* Active Filters Indicator */}
          {(filters.searchText || filters.status !== 'ALL' || filters.dateFrom || filters.dateTo || 
            filters.timeFrom || filters.timeTo || filters.venue || filters.opponent) && (
            <div className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium animate-pulse mr-3 ${
              isDarkMode ? "bg-blue-900/50 text-blue-300 border border-blue-700" : "bg-blue-100 text-blue-700 border border-blue-200"
            } shadow-lg backdrop-blur-sm`}>
              <span className="hidden sm:inline">🎪 Active Filters</span>
              <span className="sm:hidden">●</span>
            </div>
          )}
          <button
            onClick={toggleExpanded}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md ${
              isDarkMode 
                ? "bg-gray-700 hover:bg-gray-600 text-white shadow-gray-800/50" 
                : "bg-blue-50 hover:bg-blue-100 text-blue-700 shadow-blue-200/50"
            }`}
          >
            <span className="text-xs sm:text-sm font-medium">
              {isExpanded ? 'Hide Filters' : 'Show Filters'}
            </span>
            <span className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
              ⬇️
            </span>
          </button>
        </div>

        {/* Modern Search Bar */}
        <div className="relative mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-lg">🔍</span>
              </div>
              <input
                type="text"
                placeholder="Search games by opponent, venue, or notes..."
                value={filters.searchText}
                onChange={(e) => handleFilterChange('searchText', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className={`w-full pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base rounded-2xl border-2 transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 shadow-lg backdrop-blur-sm ${
                  isDarkMode
                    ? "bg-gray-800/80 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-800"
                    : "bg-white/80 border-gray-200 text-gray-800 placeholder-gray-500 focus:bg-white"
                }`}
              />
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={handleSearch}
                className="px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <span className="hidden sm:inline">Search</span>
                <span className="sm:hidden">🔍</span>
              </button>
              <button
                onClick={handleReset}
                className={`px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white shadow-gray-800/50"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-gray-300/50"
                }`}
              >
                <span className="hidden sm:inline">Reset</span>
                <span className="sm:hidden">🔄</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className={`border-t backdrop-blur-sm transition-all duration-500 ease-in-out ${
          isDarkMode ? "border-gray-600 bg-gray-800/30" : "border-gray-200 bg-gray-50/30"
        }`}>
          <div className="p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              
              {/* Status Filter */}
              <div className="space-y-2">
                <label className={`flex items-center gap-2 text-sm sm:text-base font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                  <span className="text-lg">🏷️</span>
                  Game Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 shadow-md ${
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
              <div className="space-y-2">
                <label className={`flex items-center gap-2 text-sm sm:text-base font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                  <span className="text-lg">📊</span>
                  Sort By
                </label>
                <div className="flex gap-2">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 shadow-md ${
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
                    className={`px-3 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border-2 transition-all duration-300 hover:scale-105 shadow-md ${
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
              <div className="space-y-2">
                <label className={`flex items-center gap-2 text-sm sm:text-base font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                  <span className="text-lg">📅</span>
                  Date Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 shadow-md ${
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
                    className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 shadow-md ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-800"
                    }`}
                    placeholder="To"
                  />
                </div>
              </div>

              {/* Time Range */}
              <div className="space-y-2">
                <label className={`flex items-center gap-2 text-sm sm:text-base font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                  <span className="text-lg">🕐</span>
                  Time Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={filters.timeFrom}
                    onChange={(e) => handleFilterChange('timeFrom', e.target.value)}
                    className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 shadow-md ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-800"
                    }`}
                  />
                  <input
                    type="time"
                    value={filters.timeTo}
                    onChange={(e) => handleFilterChange('timeTo', e.target.value)}
                    className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 shadow-md ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-800"
                    }`}
                  />
                </div>
              </div>

              {/* Venue Filter */}
              <div className="space-y-2">
                <label className={`flex items-center gap-2 text-sm sm:text-base font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                  <span className="text-lg">🏟️</span>
                  Venue
                </label>
                <input
                  type="text"
                  placeholder="Filter by venue..."
                  value={filters.venue}
                  onChange={(e) => handleFilterChange('venue', e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 shadow-md ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                  }`}
                />
              </div>

              {/* Opponent Filter */}
              <div className="space-y-2">
                <label className={`flex items-center gap-2 text-sm sm:text-base font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                  <span className="text-lg">🥅</span>
                  Opponent
                </label>
                <input
                  type="text"
                  placeholder="Filter by opponent..."
                  value={filters.opponent}
                  onChange={(e) => handleFilterChange('opponent', e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 shadow-md ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                  }`}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
              <button
                onClick={handleSearch}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>🔍</span>
                <span>Apply Filters</span>
              </button>
              <button
                onClick={handleReset}
                className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white shadow-gray-800/50"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700 shadow-gray-300/50"
                }`}
              >
                <span>🔄</span>
                <span>Clear All</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameSearch;
