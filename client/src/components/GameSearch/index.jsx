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

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchText) count++;
    if (filters.status !== 'ALL') count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.timeFrom) count++;
    if (filters.timeTo) count++;
    if (filters.venue) count++;
    if (filters.opponent) count++;
    return count;
  };

  return (
    <div className={`rounded-lg shadow-sm transition-all duration-200 mb-6 overflow-hidden border ${
      isDarkMode 
        ? "bg-gray-800 border-gray-700" 
        : "bg-white border-gray-200"
    }`}>
      {/* Header Section */}
      <div className={`px-4 sm:px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
              <svg className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Search & Filter Games
              </h2>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Find games by text, status, date, and more
              </p>
            </div>
          </div>
          
          {/* Active Filters Badge */}
          {getActiveFiltersCount() > 0 && (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium ${
              isDarkMode 
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}>
              <span className="w-1.5 h-1.5 bg-current rounded-full"></span>
              {getActiveFiltersCount()} Active
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6">
        {/* Search Bar Section */}
        <div className="space-y-4">
          {/* Quick Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className={`w-5 h-5 ${filters.searchText ? 'text-blue-500' : isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {filters.searchText && (
              <button
                type="button"
                onClick={() => handleFilterChange('searchText', '')}
                className={`absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer ${isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}
              >
                <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <input
              type="text"
              placeholder="Search by opponent, venue, or notes..."
              value={filters.searchText}
              onChange={(e) => handleFilterChange('searchText', e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className={`w-full pl-10 ${filters.searchText ? 'pr-10' : 'pr-4'} py-2.5 text-sm rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
            />
          </div>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 relative z-10">
            <button
              type="button"
              onClick={handleSearch}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors duration-200 cursor-pointer active:scale-95"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="pointer-events-none">Search</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer active:scale-95 ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-gray-200"
                  : "bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700"
              }`}
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="pointer-events-none">Reset</span>
            </button>
            <button
              type="button"
              onClick={toggleExpanded}
              className={`col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer active:scale-95 ${
                isDarkMode 
                  ? "bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-gray-200" 
                  : "bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700"
              }`}
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span className="pointer-events-none">{isExpanded ? 'Hide' : 'Show'} Filters</span>
              <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 pointer-events-none ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className={`border-t relative z-20 ${isDarkMode ? "border-gray-700 bg-gray-800/30" : "border-gray-200 bg-gray-50/50"}`}>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-20">
              
              {/* Status Filter */}
              <div className="space-y-2 relative z-20">
                <label className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                  Game Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer relative z-20 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  {STATUS_OPTIONS.map(option => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="space-y-2 relative z-20">
                <label className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                  Sort By
                </label>
                <div className="flex gap-2">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer relative z-20 ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    {SORT_OPTIONS.map(option => (
                      <option key={option.key} value={option.key}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors duration-200 cursor-pointer active:scale-95 relative z-20 ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                        : "bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
                    }`}
                    title={`Sort ${filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
                  >
                    <svg className={`w-4 h-4 transition-transform duration-200 pointer-events-none ${filters.sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Date From */}
              <div className="space-y-2 relative z-20">
                <label className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                  Date From
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer relative z-20 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>

              {/* Date To */}
              <div className="space-y-2 relative z-20">
                <label className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                  Date To
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer relative z-20 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>

              {/* Time From */}
              <div className="space-y-2 relative z-20">
                <label className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                  Time From
                </label>
                <input
                  type="time"
                  value={filters.timeFrom}
                  onChange={(e) => handleFilterChange('timeFrom', e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer relative z-20 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>

              {/* Time To */}
              <div className="space-y-2 relative z-20">
                <label className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                  Time To
                </label>
                <input
                  type="time"
                  value={filters.timeTo}
                  onChange={(e) => handleFilterChange('timeTo', e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer relative z-20 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>

              {/* Venue Filter */}
              <div className="space-y-2 relative z-20">
                <label className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                  Venue
                </label>
                <input
                  type="text"
                  placeholder="Filter by venue..."
                  value={filters.venue}
                  onChange={(e) => handleFilterChange('venue', e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text relative z-20 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </div>

              {/* Opponent Filter */}
              <div className="space-y-2 relative z-20">
                <label className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                  Opponent Team
                </label>
                <input
                  type="text"
                  placeholder="Filter by opponent..."
                  value={filters.opponent}
                  onChange={(e) => handleFilterChange('opponent', e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text relative z-20 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t relative z-20 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}">
              <button
                type="button"
                onClick={handleSearch}
                className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors duration-200 cursor-pointer active:scale-95 relative z-20"
              >
                <svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="pointer-events-none">Apply Filters</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer active:scale-95 relative z-20 ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-gray-200"
                    : "bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700"
                }`}
              >
                <svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="pointer-events-none">Clear All</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameSearch;
