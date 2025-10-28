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
    <div className={`rounded-2xl shadow-xl transition-all duration-300 mb-6 overflow-hidden ${
      isDarkMode 
        ? "bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border border-gray-600" 
        : "bg-gradient-to-br from-white via-blue-50 to-indigo-50 border border-blue-200"
    }`}>
      {/* Header with Navigation */}
      <div className="relative">
        {/* Background Pattern */}
        <div className={`absolute inset-0 opacity-5 ${
          isDarkMode ? 'bg-blue-500' : 'bg-blue-600'
        }`} style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${isDarkMode ? 'ffffff' : '000000'}' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>

        <div className="relative p-4 sm:p-6 md:p-8">
          {/* Navigation and Info Row */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 lg:gap-0 mb-8">
            {/* Left side - Enhanced Back Button */}
            <div className="lg:flex-1">
              <button
                onClick={() => window.history.back()}
                className={`group inline-flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl ${
                  isDarkMode 
                    ? "bg-gradient-to-r from-gray-700/90 to-gray-600/90 hover:from-gray-600/90 hover:to-gray-500/90 text-gray-200 hover:text-white border border-gray-500/30 shadow-gray-900/50 hover:shadow-gray-700/50 backdrop-blur-sm" 
                    : "bg-gradient-to-r from-white/95 to-blue-50/95 hover:from-blue-50/95 hover:to-blue-100/95 text-gray-700 hover:text-blue-700 border border-blue-200/50 shadow-blue-200/30 hover:shadow-blue-300/40 backdrop-blur-sm"
                }`}
                title="Return to Game Schedule"
              >
                <div className={`p-2 rounded-xl transition-all duration-300 group-hover:scale-110 ${
                  isDarkMode 
                    ? 'bg-gray-600/50 group-hover:bg-gray-500/50' 
                    : 'bg-blue-100/80 group-hover:bg-blue-200/80'
                }`}>
                  <svg 
                    className={`w-4 h-4 transition-all duration-300 group-hover:-translate-x-1 ${
                      isDarkMode ? 'text-gray-300 group-hover:text-white' : 'text-blue-600 group-hover:text-blue-700'
                    }`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-bold leading-tight">Back to Schedule</span>
                  <span className={`text-xs opacity-75 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Return to game list
                  </span>
                </div>
              </button>
            </div>
            
            {/* Right side - Search Tips */}
            <div className="lg:flex-1 flex lg:justify-end">
              <div className={`w-full lg:max-w-md lg:text-right p-4 rounded-2xl backdrop-blur-sm transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-gradient-to-r lg:bg-gradient-to-l from-blue-500/10 to-purple-500/10 border border-blue-500/20' 
                  : 'bg-gradient-to-r lg:bg-gradient-to-l from-blue-50/80 to-purple-50/80 border border-blue-200/50'
              } shadow-lg hover:shadow-xl`}>
                <div className="flex items-center lg:justify-end gap-2 mb-2">
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    Search Tips
                  </span>
                  <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                    <svg className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className={`text-xs leading-relaxed lg:text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Fine-tune your search with detailed filtering options below. Use advanced filters for precise results.
                </p>
              </div>
            </div>
          </div>

          {/* Active Filters Indicator */}
        {(filters.searchText || filters.status !== 'ALL' || filters.dateFrom || filters.dateTo || 
          filters.timeFrom || filters.timeTo || filters.venue || filters.opponent) && (
          <div className="flex justify-center mb-6">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              isDarkMode 
                ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-500/20" 
                : "bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200 shadow-lg shadow-blue-500/20"
            } backdrop-blur-sm`}>
              <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
              <span>🎯 {getActiveFiltersCount()} Active Filter{getActiveFiltersCount() !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}

        {/* Modern Search Bar */}
        <div className="relative mb-6">
          {/* Small screens: Two rows layout */}
          <div className="flex flex-col gap-3 lg:hidden">
            {/* Search Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className={`w-5 h-5 transition-colors duration-200 ${
                  filters.searchText 
                    ? 'text-blue-500' 
                    : isDarkMode ? 'text-gray-400' : 'text-gray-400'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {filters.searchText && (
                <button
                  onClick={() => handleFilterChange('searchText', '')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <input
                type="text"
                placeholder="Search games by opponent, venue, or notes..."
                value={filters.searchText}
                onChange={(e) => handleFilterChange('searchText', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className={`w-full pl-12 ${filters.searchText ? 'pr-12' : 'pr-4'} py-4 text-sm sm:text-base rounded-2xl border-2 transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 shadow-lg backdrop-blur-sm group-hover:shadow-xl ${
                  isDarkMode
                    ? "bg-gray-800/80 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-800"
                    : "bg-white/90 border-gray-200 text-gray-800 placeholder-gray-500 focus:bg-white"
                }`}
              />
            </div>
            
            {/* Action Buttons - Three rows on small screens */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSearch}
                className="flex-1 px-6 py-4 text-sm sm:text-base bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 hover:shadow-blue-500/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search</span>
              </button>
              <button
                onClick={handleReset}
                className={`flex-1 px-4 py-4 text-sm sm:text-base rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2 ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white shadow-gray-800/50 hover:shadow-gray-600/30"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-gray-300/50 hover:shadow-gray-400/30"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Reset</span>
              </button>
              <button
                onClick={toggleExpanded}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base font-bold ${
                  isDarkMode 
                    ? "bg-gray-700 hover:bg-gray-600 text-white shadow-gray-800/50 hover:shadow-gray-600/30" 
                    : "bg-blue-50 hover:bg-blue-100 text-blue-700 shadow-blue-200/50 hover:shadow-blue-300/30"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                <span className="font-medium">
                  {isExpanded ? 'Hide Filters' : 'Show Filters'}
                </span>
                <span className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          {/* Large screens: Single row layout - Input 60%, Buttons 40% */}
          <div className="hidden lg:flex gap-4">
            {/* Search Input - 60% width */}
            <div className="relative w-3/5 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className={`w-5 h-5 transition-colors duration-200 ${
                  filters.searchText 
                    ? 'text-blue-500' 
                    : isDarkMode ? 'text-gray-400' : 'text-gray-400'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {filters.searchText && (
                <button
                  onClick={() => handleFilterChange('searchText', '')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <input
                type="text"
                placeholder="Search games by opponent, venue, or notes..."
                value={filters.searchText}
                onChange={(e) => handleFilterChange('searchText', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className={`w-full pl-12 ${filters.searchText ? 'pr-12' : 'pr-4'} py-4 text-base rounded-2xl border-2 transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 shadow-lg backdrop-blur-sm group-hover:shadow-xl ${
                  isDarkMode
                    ? "bg-gray-800/80 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-800"
                    : "bg-white/90 border-gray-200 text-gray-800 placeholder-gray-500 focus:bg-white"
                }`}
              />
            </div>
            
            {/* Action Buttons - 40% width */}
            <div className="w-2/5 flex gap-3">
              <button
                onClick={handleSearch}
                className="flex-1 px-4 py-4 text-base bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
              <button
                onClick={handleReset}
                className={`flex-1 px-4 py-4 text-base rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2 ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white shadow-gray-800/50 hover:shadow-gray-600/30"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-gray-300/50 hover:shadow-gray-400/30"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
              <button
                onClick={toggleExpanded}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg text-base font-bold ${
                  isDarkMode 
                    ? "bg-gray-700 hover:bg-gray-600 text-white shadow-gray-800/50 hover:shadow-gray-600/30" 
                    : "bg-blue-50 hover:bg-blue-100 text-blue-700 shadow-blue-200/50 hover:shadow-blue-300/30"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                <span className="font-medium">
                  {isExpanded ? 'Hide' : 'Filters'}
                </span>
                <span className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className={`border-t backdrop-blur-sm transition-all duration-500 ease-in-out ${
          isDarkMode ? "border-gray-600 bg-gray-800/30" : "border-gray-200 bg-gray-50/30"
        }`}>
          <div className="p-6 sm:p-8">
            {/* Filter Section Title */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20' 
                  : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50'
              }`}>
                <svg className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Advanced Filters
                </h3>
              </div>
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Fine-tune your search with detailed filtering options
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Status Filter */}
              <div className="space-y-3">
                <label className={`flex items-center gap-3 text-base font-bold ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                  <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                    <svg className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  Game Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className={`w-full px-4 py-3 text-base rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 shadow-md hover:shadow-lg ${
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
              <div className="space-y-3">
                <label className={`flex items-center gap-3 text-base font-bold ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                  <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                    <svg className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                  Sort By
                </label>
                <div className="flex gap-3">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className={`flex-1 px-4 py-3 text-base rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 shadow-md hover:shadow-lg ${
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
                    className={`px-4 py-3 text-base rounded-xl border-2 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                        : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50"
                    }`}
                    title={`Sort ${filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
                  >
                    <div className="flex flex-col items-center">
                      <svg className={`w-4 h-4 transition-transform duration-200 ${filters.sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-3">
                <label className={`flex items-center gap-3 text-base font-bold ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                  <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-green-500/20' : 'bg-green-100'}`}>
                    <svg className={`w-4 h-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  Date Range
                </label>
                <div className="space-y-3">
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className={`w-full px-4 py-3 text-base rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 shadow-md hover:shadow-lg ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-800"
                    }`}
                    placeholder="From date"
                  />
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className={`w-full px-4 py-3 text-base rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 shadow-md hover:shadow-lg ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-800"
                    }`}
                    placeholder="To date"
                  />
                </div>
              </div>

              {/* Time Range */}
              <div className="space-y-3">
                <label className={`flex items-center gap-3 text-base font-bold ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                  <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                    <svg className={`w-4 h-4 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Time Range
                </label>
                <div className="space-y-3">
                  <input
                    type="time"
                    value={filters.timeFrom}
                    onChange={(e) => handleFilterChange('timeFrom', e.target.value)}
                    className={`w-full px-4 py-3 text-base rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 shadow-md hover:shadow-lg ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-800"
                    }`}
                  />
                  <input
                    type="time"
                    value={filters.timeTo}
                    onChange={(e) => handleFilterChange('timeTo', e.target.value)}
                    className={`w-full px-4 py-3 text-base rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 shadow-md hover:shadow-lg ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-800"
                    }`}
                  />
                </div>
              </div>

              {/* Venue Filter */}
              <div className="space-y-3">
                <label className={`flex items-center gap-3 text-base font-bold ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                  <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-pink-500/20' : 'bg-pink-100'}`}>
                    <svg className={`w-4 h-4 ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  Venue
                </label>
                <input
                  type="text"
                  placeholder="Filter by venue location..."
                  value={filters.venue}
                  onChange={(e) => handleFilterChange('venue', e.target.value)}
                  className={`w-full px-4 py-3 text-base rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 shadow-md hover:shadow-lg ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                  }`}
                />
              </div>

              {/* Opponent Filter */}
              <div className="space-y-3">
                <label className={`flex items-center gap-3 text-base font-bold ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                  <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
                    <svg className={`w-4 h-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  Opponent Team
                </label>
                <input
                  type="text"
                  placeholder="Filter by opponent team name..."
                  value={filters.opponent}
                  onChange={(e) => handleFilterChange('opponent', e.target.value)}
                  className={`w-full px-4 py-3 text-base rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 shadow-md hover:shadow-lg ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                  }`}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <button
                onClick={handleSearch}
                className="w-full sm:w-auto px-8 py-4 text-base bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 hover:shadow-green-500/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Apply Filters</span>
              </button>
              <button
                onClick={handleReset}
                className={`w-full sm:w-auto px-8 py-4 text-base rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white shadow-gray-800/50 hover:shadow-gray-600/30"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700 shadow-gray-300/50 hover:shadow-gray-400/30"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Clear All Filters</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameSearch;
