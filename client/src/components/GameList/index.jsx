// src/components/GameList.jsx
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { QUERY_GAMES } from "../../utils/queries";
import { DELETE_GAME } from "../../utils/mutations";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faTimes,
  faClock,
  faTrash,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { ThemeContext } from "../ThemeContext";
import Auth from "../../utils/auth";

const GameList = ({ onCreateGame, searchFilters = null }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  // Fetch all games (no status filter)
  const { loading, error, data } = useQuery(QUERY_GAMES, {
    pollInterval: 10000,
  });

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

  if (loading) return <div className="text-center mt-4">Loading games...</div>;
  if (error) return <div className="text-center mt-4 text-red-600">Error: {error.message}</div>;

  const games = data.games || [];
  if (!games.length) {
    return <div className="text-center mt-4 text-xl italic dark:text-white">No games scheduled yet.</div>;
  }

  // Calculate counts for each status
  const statusCounts = {
    ALL: games.length,
    PENDING: games.filter(g => g.status === 'PENDING').length,
    CONFIRMED: games.filter(g => g.status === 'CONFIRMED').length,
    CANCELLED: games.filter(g => g.status === 'CANCELLED').length,
    COMPLETED: games.filter(g => g.status === 'COMPLETED').length,
  };

  // Update STATUS_OPTIONS with counts and modern styling
  const STATUS_OPTIONS = [
    { 
      key: 'ALL', 
      label: 'All', 
      count: statusCounts.ALL,
      color: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 shadow-lg hover:shadow-xl',
      darkColor: 'dark:from-gray-600 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-800'
    },
    { 
      key: 'PENDING', 
      label: 'Pending', 
      count: statusCounts.PENDING,
      color: 'bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600 shadow-lg hover:shadow-xl',
      darkColor: 'dark:from-orange-500 dark:to-orange-600 dark:hover:from-orange-600 dark:hover:to-orange-700'
    },
    { 
      key: 'CONFIRMED', 
      label: 'Confirmed', 
      count: statusCounts.CONFIRMED,
      color: 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl',
      darkColor: 'dark:from-green-600 dark:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800'
    },
    { 
      key: 'CANCELLED', 
      label: 'Cancelled', 
      count: statusCounts.CANCELLED,
      color: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl',
      darkColor: 'dark:from-red-600 dark:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800'
    },
    { 
      key: 'COMPLETED', 
      label: 'Completed', 
      count: statusCounts.COMPLETED,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl',
      darkColor: 'dark:from-purple-600 dark:to-purple-700 dark:hover:from-purple-700 dark:hover:to-purple-800'
    },
  ];

  // Apply search filters if provided
  let filteredGames = games;
  
  if (searchFilters) {
    // Apply advanced search filters
    if (searchFilters.status !== 'ALL') {
      filteredGames = filteredGames.filter(game => game.status === searchFilters.status);
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
          aValue = a.status;
          bValue = b.status;
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
    filteredGames = statusFilter === 'ALL'
      ? games
      : games.filter(g => g.status === statusFilter);
  }

  const totalPages = Math.ceil(filteredGames.length / itemsPerPage);
  const pagedGames = filteredGames.slice(page * itemsPerPage, page * itemsPerPage + itemsPerPage);

  const handlePrev = () => setPage(p => Math.max(p - 1, 0));
  const handleNext = () => setPage(p => Math.min(p + 1, totalPages - 1));

  const openDeleteModal = id => { setGameToDelete(id); setShowDeleteModal(true); };
  const closeDeleteModal = () => setShowDeleteModal(false);
  const confirmDelete = async () => {
    await deleteGame({ variables: { gameId: gameToDelete } });
    closeDeleteModal();
  };

  return (
    <>
      {/* Status filter buttons and Create Game button */}
      <div className="mb-6">
        {/* Status filter buttons - 3 per row on mobile/tablet, all in one row on large screens */}
        <div className="grid grid-cols-3 md:flex md:flex-wrap md:justify-center gap-2 mb-3 md:mb-0">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setStatusFilter(opt.key)}
              className={`relative px-3 py-2 md:px-4 rounded-full font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs md:text-sm transform hover:scale-105 hover:-translate-y-0.5
                ${statusFilter === opt.key
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white scale-105 ring-2 ring-blue-400 shadow-lg' // Active state
                  : `${opt.color} ${opt.darkColor}`}
              `}
            >
              <div className="flex items-center justify-center gap-2">
                <span>{opt.label}</span>
                <div className={`px-2 py-0.5 rounded-full text-xs font-bold min-w-[1.5rem] flex items-center justify-center ${
                  statusFilter === opt.key 
                    ? 'bg-white/20 text-white backdrop-blur-sm'
                    : 'bg-black/10 text-white backdrop-blur-sm shadow-sm'
                }`}>
                  {opt.count}
                </div>
              </div>
            </button>
          ))}
          
          {/* Action buttons - inline with status buttons on large screens */}
          {onCreateGame && (
            <button
              onClick={onCreateGame}
              className="px-3 py-2 md:px-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs md:text-sm flex items-center justify-center gap-1"
            >
              <span>+</span>
              <span className="hidden sm:inline">Create Game</span>
              <span className="sm:hidden">Create</span>
            </button>
          )}
          <button
            onClick={() => navigate('/game-search')}
            className="px-3 py-2 md:px-4 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-xs md:text-sm flex items-center justify-center gap-1"
          >
            <span>🔍</span>
            <span className="hidden sm:inline">Search Games</span>
            <span className="sm:hidden">Search</span>
          </button>
        </div>
        
        {/* Action buttons - separate row for mobile/tablet only */}
        <div className="flex flex-col sm:flex-row sm:justify-center gap-2 md:hidden">
          {onCreateGame && (
            <button
              onClick={onCreateGame}
              className="px-4 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm flex items-center justify-center gap-1"
            >
              <span>+</span>
              Create Game
            </button>
          )}
          <button
            onClick={() => navigate('/game-search')}
            className="px-4 py-2 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm flex items-center justify-center gap-1"
          >
            <span>🔍</span>
            Search Games
          </button>
        </div>
      </div>

      {/* Results Summary - only show when search filters are applied */}
      {searchFilters && (searchFilters.searchText || searchFilters.status !== 'ALL' || searchFilters.dateFrom || searchFilters.dateTo || searchFilters.venue || searchFilters.opponent) && (
        <div className={`mb-4 p-3 rounded-lg ${
          isDarkMode ? "bg-gray-800 text-gray-300" : "bg-blue-50 text-blue-800"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Found {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''} 
              {searchFilters.searchText && ` matching "${searchFilters.searchText}"`}
            </span>
            <span className="text-xs opacity-75">
              Sorted by {searchFilters.sortBy || 'date'} ({searchFilters.sortOrder === 'desc' ? 'descending' : 'ascending'})
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col space-y-4">
        {filteredGames.length === 0 ? (
          <div className="text-center mt-4 text-xl italic dark:text-white">
            {searchFilters ? 'No games match your search criteria.' : (
              statusFilter === 'ALL'
                ? 'No games scheduled.'
                : `No ${statusFilter.toLowerCase()} game${statusFilter === 'COMPLETED' ? 's' : ''}.`
            )}
          </div>
        ) : (
          pagedGames.map(game => {
            const dateObj = new Date(Number(game.date));
            const humanDate = isNaN(dateObj) ? game.date : dateObj.toLocaleDateString();
            const isCreator = game.creator._id === userId;

            // Determine status display, now including COMPLETED
            let statusIcon, statusText;
            if (game.status === "COMPLETED") {
              statusIcon = faCheckCircle ? <FontAwesomeIcon icon={faCheckCircle} /> : null;
              statusText = "Completed";
            } else if (game.status === "CONFIRMED") {
              statusIcon = faCheck ? <FontAwesomeIcon icon={faCheck} /> : null;
              statusText = "Confirmed";
            } else if (game.status === "CANCELLED") {
              statusIcon = faTimes ? <FontAwesomeIcon icon={faTimes} /> : null;
              statusText = "Cancelled";
            } else {
              statusIcon = faClock ? <FontAwesomeIcon icon={faClock} /> : null;
              statusText = "Pending";
            }

            
            
            // Format time to 12-hour format with AM/PM
            const [h, m] = game.time.split(":").map(n => parseInt(n, 10));
              const hour12 = ((h + 11) % 12) + 1;
              const ampm = h >= 12 ? "PM" : "AM";
              const gameTime = `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;

            return (
              <div key={game._id} className="relative group">
                <Link
                  to={`/game-schedule/${game._id}`}
                  className={`
                    no-underline hover:no-underline
                    block p-6 rounded-2xl shadow-xl border-2 transition-all duration-300
                    bg-gradient-to-br overflow-hidden
                    ${isDarkMode
                      ? `from-gray-900 via-gray-800 to-gray-700 border-gray-600 text-gray-100 hover:shadow-2xl hover:border-gray-500`
                      : `from-white via-blue-50 to-indigo-50 border-blue-200 text-gray-800 hover:shadow-2xl hover:border-blue-300`}
                    transform transition-transform hover:scale-[1.02] hover:-translate-y-1
                    ${game.status === 'PENDING' ? (isDarkMode ? 'hover:border-orange-400 hover:shadow-orange-400/20' : 'hover:border-orange-500 hover:shadow-orange-500/20') : ''}
                    ${game.status === 'CONFIRMED' ? (isDarkMode ? 'hover:border-green-400 hover:shadow-green-400/20' : 'hover:border-green-500 hover:shadow-green-500/20') : ''}
                    ${game.status === 'CANCELLED' ? (isDarkMode ? 'hover:border-red-400 hover:shadow-red-400/20' : 'hover:border-red-500 hover:shadow-red-500/20') : ''}
                    ${game.status === 'COMPLETED' ? (isDarkMode ? 'hover:border-purple-400 hover:shadow-purple-400/20' : 'hover:border-purple-500 hover:shadow-purple-500/20') : ''}
                  `}
                >
                  {/* Header Section with Date/Time and Status */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <div className={`flex flex-col space-y-1`}>
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-800/30' : 'bg-blue-100'}`}>
                          📅
                        </div>
                        <div>
                          <h3 className={`text-xl md:text-2xl font-bold tracking-tight ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                            {humanDate}
                          </h3>
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                            🕐 {gameTime}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className={`flex items-center space-x-2 mt-3 sm:mt-0 px-3 py-2 rounded-full text-sm font-bold
                      ${game.status === 'PENDING' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200' : ''}
                      ${game.status === 'CONFIRMED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' : ''}
                      ${game.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' : ''}
                      ${game.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200' : ''}
                    `}>
                      <span className="text-lg">{statusIcon}</span>
                      <span>{statusText}</span>
                    </div>
                  </div>

                  {/* Game Details Section */}
                  <div className="space-y-4 mb-6">
                    {/* Venue, City, and Opponent */}
                    <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} border ${isDarkMode ? 'border-gray-700' : 'border-blue-100'}`}>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">🏟️</span>
                          <div>
                            <p className="text-xs font-medium opacity-75 uppercase tracking-wide">Venue</p>
                            <p className={`font-bold ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>{game.venue}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">🏙️</span>
                          <div>
                            <p className="text-xs font-medium opacity-75 uppercase tracking-wide">City</p>
                            <p className={`font-bold ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>{game.city}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">⚽</span>
                          <div>
                            <p className="text-xs font-medium opacity-75 uppercase tracking-wide">Opponent</p>
                            <p className={`font-bold ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>{game.opponent || "TBD"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes Section */}
                    {game.notes && (
                      <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/30' : 'bg-blue-50/50'} border-l-4 ${isDarkMode ? 'border-blue-400' : 'border-blue-500'}`}>
                        <div className="flex items-start space-x-3">
                          <span className="text-lg mt-1">📝</span>
                          <div>
                            <p className="text-xs font-medium opacity-75 uppercase tracking-wide mb-1">Notes</p>
                            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {game.notes || "No additional notes"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Section - Creator and Availability */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-opacity-20 border-gray-400">
                    <div className="flex items-center space-x-2 mb-3 sm:mb-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isDarkMode ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white'}`}>
                        {game.creator?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Created by <span className="font-bold">{game.creator?.name}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <span className="text-blue-500 font-bold">👤</span>
                        <span className="text-green-500 font-bold">✅</span>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">{game.availableCount}</span>
                      </div>
                      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                      <div className="flex items-center space-x-1">
                        <span className="text-blue-500 font-bold">👤</span>
                        <span className="text-red-500 font-bold">❌</span>
                        <span className="text-sm font-bold text-red-600 dark:text-red-400">{game.unavailableCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Warning for pending games */}
                  {game.status === "PENDING" && (
                    <div className={`mt-4 p-3 rounded-lg flex items-center space-x-3 ${isDarkMode ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
                      <span className="text-yellow-500 text-lg">⚠️</span>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                        Response cannot be changed once the game is confirmed
                      </p>
                    </div>
                  )}
                </Link>
                
                {/* Enhanced Delete Button */}
                {isCreator && (
                  <button
                    onClick={() => openDeleteModal(game._id)}
                    className={`
                      absolute top-1/2 transform -translate-y-1/2 right-4 
                      text-red-600 hover:bg-red-500 hover:text-black 
                      ${isDarkMode ? 'bg-gray-800 hover:bg-red-500' : 'bg-gray-100 hover:bg-red-500'} 
                      rounded-xl px-3 py-2 shadow-lg border-2 border-red-200 hover:border-red-500
                      transition-all duration-200 flex items-center gap-2 text-sm font-bold
                      opacity-0 group-hover:opacity-100 hover:scale-105
                      ${isDarkMode ? 'border-red-400/30 text-red-400' : 'border-red-200 text-red-600'}
                    `}
                    title="Delete game"
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-xs" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="flex justify-center space-x-4 mt-6">
        <button
          onClick={handlePrev}
          disabled={page === 0}
          className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          Prev
        </button>
        <button
          onClick={handleNext}
          disabled={page >= totalPages - 1}
          className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-300 bg-opacity-50 z-50">
          <div className={`p-6 rounded-lg shadow-lg w-11/12 max-w-md ${
            isDarkMode ? "bg-gray-700 text-gray-200" : "bg-white text-gray-800"
          }`}>
            <h2 className="text-xl font-bold mb-4">Delete Game?</h2>
            <p className="mb-6 italic">Are you sure? This cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeDeleteModal}
                className={`px-4 py-2 rounded ${
                  isDarkMode ? "bg-gray-600 text-gray-200 hover:bg-gray-500" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GameList;
