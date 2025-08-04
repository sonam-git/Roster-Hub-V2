// src/components/Scoreboard.jsx
import React, { useState, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { GET_MATCHES } from "../../utils/queries";
import format from "date-fns/format";
import addDays from "date-fns/addDays";

export default function Scoreboard({ competitionCode, title }) {
  const [view, setView] = useState("LIVE"); // or "SCHEDULED"
  const [expandedMatch, setExpandedMatch] = useState(null); // Track which match is expanded

  // compute two-week window only when viewing schedule
  const { dateFrom, dateTo } = useMemo(() => {
    if (view !== "SCHEDULED") return {};
    const today = new Date();
    return {
      dateFrom: format(today, "yyyy-MM-dd"),
      dateTo:   format(addDays(today, 14), "yyyy-MM-dd"),
    };
  }, [view]);

  const { data, loading, error } = useQuery(GET_MATCHES, {
    variables: {
      code:      competitionCode,
      status:    view,
      dateFrom,
      dateTo,
    },
    pollInterval: view === "LIVE" ? 30_000 : 0,
    onCompleted: (data) => {
      // Debug: Log the first match to see what venue data we're getting
      if (data?.soccerMatches?.length > 0) {
        console.log("Frontend received match data:", data.soccerMatches[0]);
        console.log("Venue data:", {
          venue: data.soccerMatches[0].venue,
          venueCity: data.soccerMatches[0].venueCity,
          venueAddress: data.soccerMatches[0].venueAddress
        });
      }
    }
  });

  // Helper function to get team abbreviation
  const getTeamAbbreviation = (teamName) => {
    if (!teamName) return "";
    const words = teamName.split(" ");
    if (words.length === 1) return words[0].substring(0, 3).toUpperCase();
    return words.map(word => word.charAt(0)).join("").substring(0, 3).toUpperCase();
  };

  // Helper function to format match status
  const formatMatchStatus = (status, utcDate) => {
    if (status === "IN_PLAY") return "LIVE";
    if (status === "PAUSED") return "HT";
    if (status === "FINISHED") return "FT";
    if (status === "SCHEDULED") return format(new Date(utcDate), "HH:mm");
    return status;
  };

  // Helper function to toggle match expansion
  const toggleMatchExpansion = (index) => {
    setExpandedMatch(expandedMatch === index ? null : index);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6">
        <div className="animate-pulse">
          <div className="h-4 sm:h-5 md:h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2 sm:mb-3 md:mb-4 w-24 sm:w-28 md:w-32"></div>
          <div className="space-y-2 sm:space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 sm:h-14 md:h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6">
        <div className="text-center py-6">
          <svg className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-500 dark:text-red-400 text-center text-sm sm:text-base font-medium">Error loading {title}</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-gray-700 dark:to-gray-600 p-4 sm:p-5 md:p-6">
        <h3 className="font-bold text-lg sm:text-xl md:text-2xl text-white mb-3 sm:mb-4">{title}</h3>
        
        {/* Tabs */}
        <div className="flex space-x-2">
          {["LIVE", "SCHEDULED"].map((s) => (
            <button
              key={s}
              onClick={() => setView(s)}
              className={`px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 ${
                view === s
                  ? "bg-white text-indigo-600 shadow-lg ring-2 ring-white/50"
                  : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
              }`}
            >
              {s === "LIVE" ? "🔴 Live" : "📅 Upcoming"}
            </button>
          ))}
        </div>
      </div>

      {/* Matches List */}
      <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        {data.soccerMatches.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {data.soccerMatches.map((m, i) => (
              <div 
                key={i} 
                className="bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                {/* Main Match Card - Clickable */}
                <div 
                  className="p-3 sm:p-4 cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors duration-200"
                  onClick={() => toggleMatchExpansion(i)}
                >
                  <div className="flex items-center justify-between ">
                    {/* Teams and Score */}
                    <div className="flex-1 min-w-0 ">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        {/* Home Team */}
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0 ">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm md:text-base font-bold flex-shrink-0 shadow-md">
                            {getTeamAbbreviation(m.homeTeam)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base md:text-lg block truncate">
                              {m.homeTeam}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 block truncate">
                              Home
                            </span>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="flex items-center space-x-2 sm:space-x-4 mx-3 sm:mx-4 flex-shrink-0">
                          <div className="text-center">
                            <span className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white block">
                              {m.homeGoals ?? "–"}
                            </span>
                          </div>
                          <div className="text-center px-2">
                            <span className="text-gray-400 text-sm sm:text-base font-medium">VS</span>
                          </div>
                          <div className="text-center">
                            <span className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white block">
                              {m.awayGoals ?? "–"}
                            </span>
                          </div>
                        </div>

                        {/* Away Team */}
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 justify-end min-w-0">
                          <div className="min-w-0 flex-1 text-right">
                            <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base md:text-lg block truncate">
                              {m.awayTeam}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 block truncate">
                              Away
                            </span>
                          </div>
                          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm md:text-base font-bold flex-shrink-0 shadow-md">
                            {getTeamAbbreviation(m.awayTeam)}
                          </div>
                        </div>
                      </div>

                      {/* Match Info */}
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                          {view === "LIVE" ? (
                            <div className="flex items-center space-x-2">
                              {m.status === "IN_PLAY" && (
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                              )}
                              <span className={`font-semibold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm shadow-sm ${
                                m.status === "IN_PLAY" 
                                  ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 ring-2 ring-red-500/20"
                                  : m.status === "FINISHED"
                                  ? "bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                              }`}>
                                {formatMatchStatus(m.status, m.utcDate)}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-gray-600 dark:text-gray-400 font-medium">
                                <span className="hidden sm:inline">{format(new Date(m.utcDate), "EEE, MMM d")} • </span>
                                {format(new Date(m.utcDate), "HH:mm")}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Venue & Expand Indicator */}
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          {(m.venue || m.venueCity) && (
                            <div className="hidden sm:flex items-center space-x-1 text-gray-500 dark:text-gray-400 max-w-32 sm:max-w-none">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              <span className="truncate">
                                {m.venue || 'Stadium'}{(m.venueCity && m.venue) ? `, ${m.venueCity}` : m.venueCity ? m.venueCity : ''}
                              </span>
                            </div>
                          )}
                          <div className={`transform transition-transform duration-300 ${expandedMatch === i ? 'rotate-180' : ''}`}>
                            <svg className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedMatch === i && (
                  <div className="border-t border-gray-200 dark:border-gray-600 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900/95 p-3 sm:p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      {/* Left Column: Date & Time Information */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-full flex items-center justify-center shadow-lg dark:shadow-blue-500/20">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">Match Schedule</h4>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-gray-900/20 transition-shadow duration-200">
                          <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between py-2">
                              <span className="text-gray-600 dark:text-gray-400 flex items-center font-medium">
                                <svg className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Date:
                              </span>
                              <span className="text-gray-900 dark:text-gray-100 font-semibold text-right">
                                {format(new Date(m.utcDate), "EEEE, MMMM d, yyyy")}
                              </span>
                            </div>
                            <div className="border-t border-gray-100 dark:border-gray-700"></div>
                            <div className="flex items-center justify-between py-2">
                              <span className="text-gray-600 dark:text-gray-400 flex items-center font-medium">
                                <svg className="w-4 h-4 mr-2 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Time:
                              </span>
                              <span className="text-gray-900 dark:text-gray-100 font-semibold">
                                {format(new Date(m.utcDate), "h:mm a")} UTC
                              </span>
                            </div>
                            {m.matchday && (
                              <>
                                <div className="border-t border-gray-100 dark:border-gray-700"></div>
                                <div className="flex items-center justify-between py-2">
                                  <span className="text-gray-600 dark:text-gray-400 flex items-center font-medium">
                                    <svg className="w-4 h-4 mr-2 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                    </svg>
                                    Matchday:
                                  </span>
                                  <span className="text-gray-900 dark:text-gray-100 font-semibold">Week {m.matchday}</span>
                                </div>
                              </>
                            )}
                            {m.duration && (
                              <>
                                <div className="border-t border-gray-100 dark:border-gray-700"></div>
                                <div className="flex items-center justify-between py-2">
                                  <span className="text-gray-600 dark:text-gray-400 flex items-center font-medium">
                                    <svg className="w-4 h-4 mr-2 text-orange-500 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                    </svg>
                                    Duration:
                                  </span>
                                  <span className="text-gray-900 dark:text-gray-100 font-semibold">{m.duration} minutes</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Match Status */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-gray-900/20 transition-shadow duration-200">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Current Status:</span>
                            <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-semibold shadow-sm ${
                              m.status === "IN_PLAY" 
                                ? "bg-red-100 text-red-800 dark:bg-red-900/80 dark:text-red-200 ring-2 ring-red-500/20 dark:ring-red-400/30"
                                : m.status === "FINISHED"
                                ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                : m.status === "PAUSED"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/80 dark:text-yellow-200"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/80 dark:text-blue-200"
                            }`}>
                              {m.status === "IN_PLAY" && <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full animate-pulse mr-2"></div>}
                              {formatMatchStatus(m.status, m.utcDate)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Venue & Stadium Information */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-400 dark:to-green-500 rounded-full flex items-center justify-center shadow-lg dark:shadow-green-500/20">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">Venue Information</h4>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-gray-900/20 transition-shadow duration-200">
                          <div className="space-y-3 text-sm">
                            {m.venue ? (
                              <div className="flex items-start justify-between py-2">
                                <span className="text-gray-600 dark:text-gray-400 flex items-center flex-shrink-0 font-medium">
                                  <svg className="w-4 h-4 mr-2 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-6m-8 0H3m2 0h6M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  Stadium:
                                </span>
                                <span className="text-gray-900 dark:text-gray-100 font-semibold text-right ml-2">{m.venue}</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center py-4 text-gray-500 dark:text-gray-400">
                                <svg className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Stadium information not available
                              </div>
                            )}
                            {m.venue && m.venueCity && <div className="border-t border-gray-100 dark:border-gray-700"></div>}
                            {m.venueCity && (
                              <div className="flex items-center justify-between py-2">
                                <span className="text-gray-600 dark:text-gray-400 flex items-center font-medium">
                                  <svg className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  City:
                                </span>
                                <span className="text-gray-900 dark:text-gray-100 font-semibold">{m.venueCity}</span>
                              </div>
                            )}
                            {m.venueAddress && (
                              <>
                                <div className="border-t border-gray-100 dark:border-gray-700"></div>
                                <div className="flex items-start justify-between py-2">
                                  <span className="text-gray-600 dark:text-gray-400 flex items-center flex-shrink-0 font-medium">
                                    <svg className="w-4 h-4 mr-2 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    Address:
                                  </span>
                                  <span className="text-gray-900 dark:text-gray-100 font-semibold text-right max-w-48 ml-2" title={m.venueAddress}>
                                    {m.venueAddress.length > 35 ? `${m.venueAddress.substring(0, 35)}...` : m.venueAddress}
                                  </span>
                                </div>
                              </>
                            )}
                            {m.referee && (
                              <>
                                <div className="border-t border-gray-100 dark:border-gray-700"></div>
                                <div className="flex items-center justify-between py-2">
                                  <span className="text-gray-600 dark:text-gray-400 flex items-center font-medium">
                                    <svg className="w-4 h-4 mr-2 text-yellow-500 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Referee:
                                  </span>
                                  <span className="text-gray-900 dark:text-gray-100 font-semibold">{m.referee}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Score Breakdown */}
                        {(m.status === "FINISHED" || m.status === "IN_PLAY" || m.status === "PAUSED") && (
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-gray-900/20 transition-shadow duration-200">
                            <h5 className="font-bold text-gray-900 dark:text-white text-sm mb-3 flex items-center">
                              <svg className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                              Detailed Score
                            </h5>
                            <div className="space-y-2 text-sm">
                              {m.halfTimeScore && (m.halfTimeScore.home !== null || m.halfTimeScore.away !== null) && (
                                <div className="flex justify-between py-1">
                                  <span className="text-gray-600 dark:text-gray-400 font-medium">Half Time:</span>
                                  <span className="text-gray-900 dark:text-gray-100 font-bold text-base">
                                    {m.halfTimeScore.home ?? 0} - {m.halfTimeScore.away ?? 0}
                                  </span>
                                </div>
                              )}
                              {m.fullTimeScore && (m.fullTimeScore.home !== null || m.fullTimeScore.away !== null) && (
                                <div className="flex justify-between py-1">
                                  <span className="text-gray-600 dark:text-gray-400 font-medium">Full Time:</span>
                                  <span className="text-gray-900 dark:text-gray-100 font-bold text-base">
                                    {m.fullTimeScore.home ?? 0} - {m.fullTimeScore.away ?? 0}
                                  </span>
                                </div>
                              )}
                              {m.extraTimeScore && (m.extraTimeScore.home !== null || m.extraTimeScore.away !== null) && (
                                <div className="flex justify-between py-1">
                                  <span className="text-gray-600 dark:text-gray-400 font-medium">Extra Time:</span>
                                  <span className="text-gray-900 dark:text-gray-100 font-bold text-base">
                                    {m.extraTimeScore.home ?? 0} - {m.extraTimeScore.away ?? 0}
                                  </span>
                                </div>
                              )}
                              {m.penaltiesScore && (m.penaltiesScore.home !== null || m.penaltiesScore.away !== null) && (
                                <div className="flex justify-between py-1">
                                  <span className="text-gray-600 dark:text-gray-400 font-medium">Penalties:</span>
                                  <span className="text-gray-900 dark:text-gray-100 font-bold text-base">
                                    {m.penaltiesScore.home ?? 0} - {m.penaltiesScore.away ?? 0}
                                  </span>
                                </div>
                              )}
                              {!m.halfTimeScore && !m.fullTimeScore && !m.extraTimeScore && !m.penaltiesScore && (
                                <div className="flex items-center justify-center py-2 text-gray-500 dark:text-gray-400">
                                  <svg className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Detailed scores not available
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8 md:py-12">
            <div className="text-2xl sm:text-4xl md:text-6xl mb-2 sm:mb-4">
              {view === "LIVE" ? "⚽" : "📅"}
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm md:text-base px-4">
              {view === "LIVE"
                ? "No live matches right now."
                : "No upcoming matches in the next 2 weeks."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
