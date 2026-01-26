// src/pages/GameHistory.jsx
import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { QUERY_GAMES } from "../utils/queries";
import { useOrganization } from "../contexts/OrganizationContext";
import Spinner from "../components/Spinner";

const GameHistory = () => {
  const { currentOrganization } = useOrganization();
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all games
  const { loading, error, data } = useQuery(QUERY_GAMES, {
    variables: {
      organizationId: currentOrganization?._id
    },
    skip: !currentOrganization,
    pollInterval: 30000,
  });

  if (!currentOrganization) {
    return <Spinner />;
  }

  if (loading) return <Spinner />;
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-8">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-700 dark:text-red-300">Error loading game history: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const games = data?.games || [];

  // Filter games - show only completed games by default
  let filteredGames = games;
  
  if (filterStatus !== 'ALL') {
    filteredGames = filteredGames.filter(game => game.status === filterStatus);
  }

  // Search filter
  if (searchTerm.trim()) {
    const search = searchTerm.toLowerCase();
    filteredGames = filteredGames.filter(game =>
      game.opponent?.toLowerCase().includes(search) ||
      game.venue?.toLowerCase().includes(search) ||
      game.city?.toLowerCase().includes(search) ||
      game.notes?.toLowerCase().includes(search)
    );
  }

  // Sort games
  const sortedGames = [...filteredGames].sort((a, b) => {
    let aValue, bValue;

    switch (sortConfig.key) {
      case 'date':
        aValue = new Date(Number(a.date));
        bValue = new Date(Number(b.date));
        break;
      case 'opponent':
        aValue = a.opponent?.toLowerCase() || '';
        bValue = b.opponent?.toLowerCase() || '';
        break;
      case 'venue':
        aValue = a.venue?.toLowerCase() || '';
        bValue = b.venue?.toLowerCase() || '';
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'available':
        aValue = a.availableCount || 0;
        bValue = b.availableCount || 0;
        break;
      default:
        aValue = new Date(Number(a.date));
        bValue = new Date(Number(b.date));
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      COMPLETED: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        text: 'text-purple-700 dark:text-purple-300',
        border: 'border-purple-200 dark:border-purple-800',
        label: 'Completed'
      },
      CONFIRMED: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-700 dark:text-green-300',
        border: 'border-green-200 dark:border-green-800',
        label: 'Confirmed'
      },
      PENDING: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        text: 'text-orange-700 dark:text-orange-300',
        border: 'border-orange-200 dark:border-orange-800',
        label: 'Pending'
      },
      CANCELLED: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-700 dark:text-red-300',
        border: 'border-red-200 dark:border-red-800',
        label: 'Cancelled'
      }
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        {config.label}
      </span>
    );
  };

  const getResultBadge = (result) => {
    if (!result) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700">
          <span>⏳</span>
          <span>Not Played yet</span>
        </span>
      );
    }
    
    const resultConfig = {
      HOME_WIN: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-700 dark:text-green-300',
        border: 'border-green-200 dark:border-green-800',
        icon: '🏆',
        label: 'Home Win'
      },
      AWAY_WIN: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-700 dark:text-red-300',
        border: 'border-red-200 dark:border-red-800',
        icon: '🏁',
        label: 'Away Win'
      },
      DRAW: {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        text: 'text-yellow-700 dark:text-yellow-300',
        border: 'border-yellow-200 dark:border-yellow-800',
        icon: '🤝',
        label: 'Draw'
      },
      NOT_PLAYED: {
        bg: 'bg-gray-50 dark:bg-gray-800',
        text: 'text-gray-600 dark:text-gray-400',
        border: 'border-gray-200 dark:border-gray-700',
        icon: '⏳',
        label: 'Not Played'
      }
    };

    const config = resultConfig[result] || resultConfig.NOT_PLAYED;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    );
  };

  const getManOfTheMatch = (game) => {
    if (!game.feedbacks || game.feedbacks.length === 0) return null;
    
    // Count votes for each player
    const voteCounts = {};
    game.feedbacks.forEach(feedback => {
      if (feedback.playerOfTheMatch) {
        const playerId = feedback.playerOfTheMatch._id;
        voteCounts[playerId] = (voteCounts[playerId] || 0) + 1;
      }
    });

    // Find player with most votes
    let maxVotes = 0;
    let manOfTheMatch = null;
    
    Object.keys(voteCounts).forEach(playerId => {
      if (voteCounts[playerId] > maxVotes) {
        maxVotes = voteCounts[playerId];
        const feedback = game.feedbacks.find(f => f.playerOfTheMatch?._id === playerId);
        manOfTheMatch = feedback?.playerOfTheMatch;
      }
    });

    return manOfTheMatch;
  };

  const formatDate = (timestamp) => {
    const date = new Date(Number(timestamp));
    return isNaN(date) ? timestamp : date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const [h, m] = timeString.split(":").map(n => parseInt(n, 10));
    const hour12 = ((h + 11) % 12) + 1;
    const ampm = h >= 12 ? "PM" : "AM";
    return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  const STATUS_FILTERS = [
    { key: 'ALL', label: 'All Games', count: games.length },
    { key: 'COMPLETED', label: 'Completed', count: games.filter(g => g.status === 'COMPLETED').length },
    { key: 'CONFIRMED', label: 'Confirmed', count: games.filter(g => g.status === 'CONFIRMED').length },
    { key: 'PENDING', label: 'Pending', count: games.filter(g => g.status === 'PENDING').length },
    { key: 'CANCELLED', label: 'Cancelled', count: games.filter(g => g.status === 'CANCELLED').length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-8 pt-20 lg:pt-24">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-6 max-w-7xl relative z-0">
        {/* AWS-style Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Game History
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View and analyze your team's complete game history and performance
          </p>
        </div>

        {/* Filters and Search */}
        <div className="space-y-4 relative z-10">
          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map(filter => (
              <button
                key={filter.key}
                type="button"
                onClick={() => {
                  console.log('Filter button clicked:', filter.key);
                  setFilterStatus(filter.key);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer active:scale-95 ${
                  filterStatus === filter.key
                    ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:bg-blue-800'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-600 active:bg-gray-200 dark:active:bg-gray-600'
                }`}
              >
                <span>{filter.label}</span>
                <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                  filterStatus === filter.key
                    ? 'bg-gray-50'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by opponent, venue, city, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{sortedGames.length}</span> of <span className="font-semibold text-gray-900 dark:text-white">{games.length}</span> games
          </p>
        </div>

        {/* Table Container */}
        {sortedGames.length === 0 ? (
          <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-400 to-gray-500"></div>
            <div className="p-8 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No games found
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {searchTerm ? 'Try adjusting your search or filters' : 'Games will appear here once they are created'}
              </p>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-750">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Date & Time</span>
                        {getSortIcon('date')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => handleSort('opponent')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Opponent</span>
                        {getSortIcon('opponent')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => handleSort('venue')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Venue & City</span>
                        {getSortIcon('venue')}
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Score
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Result
                    </th>
                    <th 
                      scope="col" 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Status</span>
                        {getSortIcon('status')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => handleSort('available')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Players</span>
                        {getSortIcon('available')}
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Formation
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Rating
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Man of Match
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-50 dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedGames.map((game) => {
                    const manOfTheMatch = getManOfTheMatch(game);
                    return (
                    <tr 
                      key={game._id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/game-schedule/${game._id}`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(game.date)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(game.time)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-md bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                            <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {game.opponent || 'TBD'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {game.venue}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {game.city}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {game.score ? (
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {game.score}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getResultBadge(game.result)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getStatusBadge(game.status)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                              {game.availableCount || 0}
                            </span>
                          </div>
                          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                              {game.unavailableCount || 0}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {game.formation ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {game.formation.formationType || 'N/A'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {game.averageRating ? (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {game.averageRating.toFixed(1)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {manOfTheMatch ? (
                          <div className="flex items-center gap-1">
                            <span className="text-sm">🏆</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {manOfTheMatch.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {sortedGames.map((game) => {
                const manOfTheMatch = getManOfTheMatch(game);
                return (
                <div 
                  key={game._id} 
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/game-schedule/${game._id}`}
                >
                  <div className="space-y-3">
                    {/* Date and Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatDate(game.date)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(game.time)}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        {getStatusBadge(game.status)}
                        {getResultBadge(game.result)}
                      </div>
                    </div>

                    {/* Opponent */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-md bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {game.opponent || 'TBD'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {game.venue}, {game.city}
                        </div>
                      </div>
                      {game.score && (
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {game.score}
                        </div>
                      )}
                    </div>

                    {/* Players, Formation, and Rating */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                            {game.availableCount || 0}
                          </span>
                        </div>
                        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                            {game.unavailableCount || 0}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {game.formation && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {game.formation.formationType}
                          </span>
                        )}
                        {game.averageRating && (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {game.averageRating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Man of the Match */}
                    {manOfTheMatch && (
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">🏆</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Man of the Match:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {manOfTheMatch.name}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameHistory;
