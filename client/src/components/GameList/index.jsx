// src/components/GameList.jsx
import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { QUERY_GAMES } from "../../utils/queries";
import { DELETE_GAME } from "../../utils/mutations";
import Spinner from "../Spinner";

import { ThemeContext } from "../ThemeContext";
import { useOrganization } from "../../contexts/OrganizationContext";
import Auth from "../../utils/auth";
import { getStatusCounts, filterGamesByStatus, getGameEffectiveStatus } from "../../utils/gameExpiration";

const GameList = ({ onCreateGame, searchFilters = null }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const { currentOrganization } = useOrganization();
  const navigate = useNavigate();

  // Fetch all games (no status filter)
  const { loading, error, data, refetch } = useQuery(QUERY_GAMES, {
    variables: {
      organizationId: currentOrganization?._id
    },
    skip: !currentOrganization,
    pollInterval: 10000,
  });
  
  // Refetch when organization changes
  useEffect(() => {
    if (currentOrganization) {
      refetch({ organizationId: currentOrganization._id });
    }
  }, [currentOrganization, refetch]);

  const [deleteGame] = useMutation(DELETE_GAME, {
    update(cache, { data: { deleteGame } }) {
      cache.evict({ id: cache.identify({ __typename: "Game", _id: deleteGame._id }) });
      cache.gc();
    },
  });

  const userId = Auth.getProfile()?.data?._id || null;
  const [page, setPage] = useState(0);
  const itemsPerPage = 3;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Loading state for organization
  if (!currentOrganization) {
    return <Spinner />;
  }

  if (loading) return <Spinner />;
  if (error) return <div className="text-center mt-4 text-red-600">Error: {error.message}</div>;

  const games = data.games || [];
  if (!games.length) {
    return (
      <div className="w-full py-8">
        <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm max-w-2xl mx-auto">
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
          
          <div className="p-8 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto rounded-md bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-blue-600 dark:text-blue-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Games Scheduled
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Get started by creating your first game to organize your team.
            </p>
            
            {/* Create Game Button */}
            {onCreateGame && (
              <button
                onClick={onCreateGame}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-md text-sm font-medium shadow-sm transition-all duration-150"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Game</span>
              </button>
            )}
            
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Your games will appear here once created</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate counts for each status including expired games
  const statusCounts = getStatusCounts(games);

  // Update STATUS_OPTIONS with counts and modern styling
  const STATUS_OPTIONS = [
    { 
      key: 'ALL', 
      label: 'All', 
      count: statusCounts.ALL,
      color: 'bg-gray-600 hover:bg-gray-700 text-white'
    },
    { 
      key: 'PENDING', 
      label: 'Pending', 
      count: statusCounts.PENDING,
      color: 'bg-orange-600 hover:bg-orange-700 text-white'
    },
    { 
      key: 'CONFIRMED', 
      label: 'Confirmed', 
      count: statusCounts.CONFIRMED,
      color: 'bg-green-600 hover:bg-green-700 text-white'
    },
    { 
      key: 'CANCELLED', 
      label: 'Cancelled', 
      count: statusCounts.CANCELLED,
      color: 'bg-red-600 hover:bg-red-700 text-white'
    },
    { 
      key: 'COMPLETED', 
      label: 'Completed', 
      count: statusCounts.COMPLETED,
      color: 'bg-purple-600 hover:bg-purple-700 text-white'
    },
    { 
      key: 'EXPIRED', 
      label: 'Expired', 
      count: statusCounts.EXPIRED,
      color: 'bg-gray-700 hover:bg-gray-800 text-white'
    },
  ];

  // Apply search filters if provided
  let filteredGames = games;
  
  if (searchFilters) {
    // Apply advanced search filters
    if (searchFilters.status !== 'ALL') {
      filteredGames = filteredGames.filter(game => getGameEffectiveStatus(game) === searchFilters.status);
    }

    // Text search (opponent, venue, notes)
    if (searchFilters.searchText?.trim()) {
      const searchTerm = searchFilters.searchText.toLowerCase();
      filteredGames = filteredGames.filter(game => 
        game.opponent.toLowerCase().includes(searchTerm) ||
        game.venue.toLowerCase().includes(searchTerm) ||
        (game.notes && game.notes.toLowerCase().includes(searchTerm))
      );
    }

    // Date range filter
    if (searchFilters.dateFrom) {
      const fromDate = new Date(searchFilters.dateFrom);
      filteredGames = filteredGames.filter(game => {
        const gameDate = new Date(Number(game.date));
        return gameDate >= fromDate;
      });
    }

    if (searchFilters.dateTo) {
      const toDate = new Date(searchFilters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filteredGames = filteredGames.filter(game => {
        const gameDate = new Date(Number(game.date));
        return gameDate <= toDate;
      });
    }

    // Time range filter
    if (searchFilters.timeFrom) {
      filteredGames = filteredGames.filter(game => game.time >= searchFilters.timeFrom);
    }

    if (searchFilters.timeTo) {
      filteredGames = filteredGames.filter(game => game.time <= searchFilters.timeTo);
    }

    // Venue filter
    if (searchFilters.venue?.trim()) {
      const venueTerm = searchFilters.venue.toLowerCase();
      filteredGames = filteredGames.filter(game => 
        game.venue.toLowerCase().includes(venueTerm)
      );
    }

    // Opponent filter
    if (searchFilters.opponent?.trim()) {
      const opponentTerm = searchFilters.opponent.toLowerCase();
      filteredGames = filteredGames.filter(game => 
        game.opponent.toLowerCase().includes(opponentTerm)
      );
    }

    // Sorting
    filteredGames.sort((a, b) => {
      let aValue, bValue;
      
      switch (searchFilters.sortBy) {
        case 'date':
          aValue = new Date(Number(a.date));
          bValue = new Date(Number(b.date));
          break;
        case 'time':
          aValue = a.time;
          bValue = b.time;
          break;
        case 'opponent':
          aValue = a.opponent.toLowerCase();
          bValue = b.opponent.toLowerCase();
          break;
        case 'venue':
          aValue = a.venue.toLowerCase();
          bValue = b.venue.toLowerCase();
          break;
        case 'status':
          aValue = getGameEffectiveStatus(a);
          bValue = getGameEffectiveStatus(b);
          break;
        case 'created':
          aValue = new Date(a.createdAt || a.date);
          bValue = new Date(b.createdAt || b.date);
          break;
        default:
          aValue = new Date(Number(a.date));
          bValue = new Date(Number(b.date));
      }

      if (aValue < bValue) return searchFilters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return searchFilters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  } else {
    // Apply basic status filter from status buttons if no search filters
    filteredGames = filterGamesByStatus(games, statusFilter);
  }

  const totalPages = Math.ceil(filteredGames.length / itemsPerPage);
  const pagedGames = filteredGames.slice(page * itemsPerPage, page * itemsPerPage + itemsPerPage);

  const handlePrev = () => setPage(p => Math.max(p - 1, 0));
  const handleNext = () => setPage(p => Math.min(p + 1, totalPages - 1));

  const openDeleteModal = id => { setGameToDelete(id); setShowDeleteModal(true); };
  const closeDeleteModal = () => setShowDeleteModal(false);
  const confirmDelete = async () => {
    if (!currentOrganization) {
      console.error('No organization selected');
      return;
    }
    
    try {
      await deleteGame({ 
        variables: { 
          gameId: gameToDelete,
          organizationId: currentOrganization._id
        } 
      });
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting game:', error);
      alert('Failed to delete game. Please try again.');
    }
  };

  return (
    <>
      {/* Status filter buttons and Create Game button */}
      <div className="mb-6 relative z-10">
        {/* Status filter buttons - responsive grid */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mb-3 relative z-20">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.key}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setStatusFilter(opt.key);
              }}
              className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer active:scale-95
                ${statusFilter === opt.key
                  ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900'
                  : opt.color}
              `}
            >
              <div className="flex items-center justify-center gap-1.5 pointer-events-none">
                <span className="truncate">{opt.label}</span>
                <div className={`px-1.5 py-0.5 rounded text-xs font-semibold min-w-[1.25rem] flex items-center justify-center ${
                  statusFilter === opt.key 
                    ? 'bg-white/20'
                    : 'bg-black/10'
                }`}>
                  {opt.count}
                </div>
              </div>
            </button>
          ))}
        </div>
        
        {/* Action buttons - full width on mobile, inline on desktop */}
        <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-2 relative z-20">
          {onCreateGame && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCreateGame();
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750 active:bg-gray-200 dark:active:bg-gray-700 rounded-md text-sm font-medium transition-all duration-150 shadow-sm cursor-pointer active:scale-95"
            >
              <svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="pointer-events-none">Create Game</span>
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate('/game-search');
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750 active:bg-gray-200 dark:active:bg-gray-700 rounded-md text-sm font-medium transition-all duration-150 shadow-sm cursor-pointer active:scale-95"
          >
            <svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="pointer-events-none">Search Games</span>
          </button>
        </div>
      </div>

      {/* Results Summary - only show when search filters are applied */}
      {searchFilters && (searchFilters.searchText || searchFilters.status !== 'ALL' || searchFilters.dateFrom || searchFilters.dateTo || searchFilters.venue || searchFilters.opponent) && (
        <div className={`mb-4 p-3 rounded-md border ${
          isDarkMode ? "bg-blue-900/20 border-blue-800 text-blue-200" : "bg-blue-50 border-blue-200 text-blue-900"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-sm font-medium">
              Found {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''} 
              {searchFilters.searchText && ` matching "${searchFilters.searchText}"`}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Sorted by {searchFilters.sortBy || 'date'} ({searchFilters.sortOrder === 'desc' ? 'descending' : 'ascending'})
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col space-y-4">
        {filteredGames.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-md mb-3">
              <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              {searchFilters ? 'No games match your search criteria' : (
                statusFilter === 'ALL'
                  ? 'No games scheduled'
                  : `No ${statusFilter.toLowerCase()} games`
              )}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {searchFilters ? 'Try adjusting your search filters' : 'Games will appear here once created'}
            </p>
          </div>
        ) : (
          pagedGames.map(game => {
            const dateObj = new Date(Number(game.date));
            const humanDate = isNaN(dateObj) ? game.date : dateObj.toLocaleDateString();
            const isCreator = game.creator._id === userId;

            // Determine status display, including expired games
            const effectiveStatus = getGameEffectiveStatus(game);
            let statusIcon, statusText, statusColor;
            
            if (effectiveStatus === "EXPIRED") {
              statusIcon = <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
              statusText = "Expired";
              statusColor = "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700";
            } else if (effectiveStatus === "COMPLETED") {
              statusIcon = <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
              statusText = "Completed";
              statusColor = "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800";
            } else if (effectiveStatus === "CONFIRMED") {
              statusIcon = <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
              statusText = "Confirmed";
              statusColor = "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
            } else if (effectiveStatus === "CANCELLED") {
              statusIcon = <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
              statusText = "Cancelled";
              statusColor = "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
            } else {
              statusIcon = <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>;
              statusText = "Pending";
              statusColor = "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800";
            }

            
            
            // Format time to 12-hour format with AM/PM
            const [h, m] = game.time.split(":").map(n => parseInt(n, 10));
              const hour12 = ((h + 11) % 12) + 1;
              const ampm = h >= 12 ? "PM" : "AM";
              const gameTime = `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;

            return (
              <div key={game._id} className="relative group mb-4">
                <Link
                  to={`/game-schedule/${game._id}`}
                  className="no-underline hover:no-underline block"
                >
                  <div className={`relative overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-5 transition-all duration-150 hover:shadow-md ${
                    isDarkMode ? 'hover:bg-gray-750 hover:border-gray-600' : 'hover:bg-gray-50 hover:border-gray-400'
                  }`}>
                    {/* Top accent bar based on status */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${
                      effectiveStatus === 'PENDING' ? 'bg-orange-500' :
                      effectiveStatus === 'CONFIRMED' ? 'bg-green-500' :
                      effectiveStatus === 'CANCELLED' ? 'bg-red-500' :
                      effectiveStatus === 'COMPLETED' ? 'bg-purple-500' :
                      'bg-gray-500'
                    }`}></div>

                    {/* Header Section with Date/Time and Status */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-md bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                            {humanDate}
                          </h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {gameTime}
                          </p>
                        </div>
                      </div>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${statusColor}`}>
                        {statusIcon}
                        <span>{statusText}</span>
                      </div>
                    </div>

                    {/* Game Details Section */}
                    <div className="space-y-3 mb-4">
                      {/* Opponent, Venue, City */}
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                          </svg>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">Opponent</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{game.opponent || "TBD"}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">Venue</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{game.venue}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">City</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{game.city}</p>
                          </div>
                        </div>
                      </div>

                      {/* Notes Section */}
                      {game.notes && (
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">Notes</p>
                              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                                {game.notes}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Section - Creator and Availability */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          {game.creator?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Created by <span className="font-medium text-gray-900 dark:text-white">{game.creator?.name}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-semibold text-green-700 dark:text-green-400">{game.availableCount}</span>
                        </div>
                        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-semibold text-red-700 dark:text-red-400">{game.unavailableCount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Warning for pending games */}
                    {game.status === "PENDING" && (
                      <div className="mt-3 p-2.5 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 flex items-start gap-2">
                        <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">
                          Response cannot be changed once the game is confirmed
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
                
                {/* Delete Button */}
                {isCreator && (
                  <button
                    onClick={() => openDeleteModal(game._id)}
                    className="absolute top-4 right-4 p-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-800 transition-all duration-150 opacity-0 group-hover:opacity-100 shadow-sm"
                    title="Delete game"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {filteredGames.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 mb-4 px-4 py-3 border-t border-gray-200 dark:border-gray-700 relative z-20">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page <span className="font-semibold text-gray-900 dark:text-white">{page + 1}</span> of <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-500">
              ({filteredGames.length} total)
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePrev();
              }}
              disabled={page === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 active:bg-gray-100 dark:active:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-sm cursor-pointer active:scale-95"
              aria-label="Previous page"
            >
              <svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="pointer-events-none">Prev</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNext();
              }}
              disabled={page >= totalPages - 1}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 active:bg-gray-100 dark:active:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-sm cursor-pointer active:scale-95"
              aria-label="Next page"
            >
              <span className="pointer-events-none">Next</span>
              <svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* AWS-style Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[400] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden relative z-[410]">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500"></div>
            
            <div className="p-6">
              {/* Icon and Title */}
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-md bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Delete Game
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Are you sure you want to delete this game? This action cannot be undone.
                  </p>
                </div>
              </div>

              {/* Warning Box */}
              <div className="mb-6 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                    All associated data including player responses and feedback will be permanently removed.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeDeleteModal();
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 active:bg-gray-100 dark:active:bg-gray-700 transition-all duration-150 shadow-sm cursor-pointer active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    confirmDelete();
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 active:bg-red-800 text-white transition-all duration-150 shadow-sm cursor-pointer active:scale-95"
                >
                  Delete Game
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GameList;
