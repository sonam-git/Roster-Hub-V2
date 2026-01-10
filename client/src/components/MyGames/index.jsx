// src/components/MyGames/index.jsx
import React, { useContext, useState } from "react";
import { useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import { QUERY_GAMES } from "../../utils/queries";
import { ThemeContext } from "../ThemeContext";
import { useOrganization } from "../../contexts/OrganizationContext";
import Auth from "../../utils/auth";
import { getGameEffectiveStatus } from "../../utils/gameExpiration";

const MyGames = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { currentOrganization } = useOrganization();
  const userId = Auth.getProfile()?.data?._id;
  const [filter, setFilter] = useState('all'); // 'all', 'created', 'available', 'unavailable'

  const { loading, error, data } = useQuery(QUERY_GAMES, {
    variables: { 
      organizationId: currentOrganization?._id 
    },
    skip: !currentOrganization,
    pollInterval: 10000,
  });

  // Loading state for organization
  if (!currentOrganization) {
    return (
      <div className="space-y-3 sm:space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl animate-pulse ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-gray-200/50'
          }`}>
            <div className={`h-3 sm:h-4 rounded mb-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            <div className={`h-2 sm:h-3 rounded w-3/4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          </div>
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl animate-pulse ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-gray-200/50'
          }`}>
            <div className={`h-3 sm:h-4 rounded mb-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            <div className={`h-2 sm:h-3 rounded w-3/4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl text-center ${
        isDarkMode ? 'bg-red-900/30 text-red-200' : 'bg-red-100 text-red-800'
      }`}>
        <span className="text-xl sm:text-2xl mb-2 block">⚠️</span>
        <p className="font-medium text-sm sm:text-base">Error loading games</p>
      </div>
    );
  }

  const games = data?.games || [];
  
  // Get games created by the user
  const createdGames = games.filter(game => game.creator._id === userId);
  
  // Get games where the user has voted (and effective status is PENDING, CONFIRMED, or EXPIRED)
  const votedGames = games.filter(game => {
    if (!game.responses.some(response => response.user._id === userId)) return false;
    const effectiveStatus = getGameEffectiveStatus(game);
    return ['PENDING', 'CONFIRMED', 'EXPIRED'].includes(effectiveStatus) || game.status === 'COMPLETED';
  });
  
  // Combine and remove duplicates (user might have created and voted on same game)
  const myGamesMap = new Map();
  [...createdGames, ...votedGames].forEach(game => {
    myGamesMap.set(game._id, game);
  });
  const myGames = Array.from(myGamesMap.values());

  // Filter games based on selected filter
  let filteredGames = [];
  if (filter === 'all') {
    filteredGames = myGames;
  } else if (filter === 'created') {
    filteredGames = createdGames;
  } else if (filter === 'available' || filter === 'unavailable') {
    filteredGames = myGames.filter(game => {
      const userResponse = game.responses.find(response => response.user._id === userId);
      if (!userResponse) return false; // Not voted
      if (filter === 'available') {
        return userResponse.isAvailable === true;
      } else {
        return userResponse.isAvailable === false;
      }
    });
  }

  // Count games by category
  const availableGamesCount = myGames.filter(game => 
    game.responses.find(r => r.user._id === userId)?.isAvailable === true
  ).length;
  const unavailableGamesCount = myGames.filter(game => 
    game.responses.find(r => r.user._id === userId)?.isAvailable === false
  ).length;

  if (myGames.length === 0) {
    return (
      <div className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg text-center ${
        isDarkMode ? 'bg-gray-800/50 text-gray-400 border border-gray-700' : 'bg-gray-50 text-gray-500 border border-gray-200'
      }`}>
        <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <span className="text-xl sm:text-2xl">⚽</span>
        </div>
        <h3 className={`text-base sm:text-lg font-bold mb-1 sm:mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          No Games Voted Yet
        </h3>
        <p className={`text-xs sm:text-sm mb-3 sm:mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          You haven't voted on any pending or confirmed games yet.
        </p>
        <Link
          to="/game-schedule"
          className="inline-block px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 underline-offset-2"
        >
          Game | Schedule
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header with filter buttons */}
      <div className={`p-3 sm:p-4 rounded-xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-blue-50 border border-blue-200'}`}>
        <h3 className={`text-base sm:text-lg font-bold mb-2 sm:mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          My Games
        </h3>
        <p className={`text-xs sm:text-sm mb-3 sm:mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Games you've created or voted on ({myGames.length} total)
        </p>

        {/* Filter Buttons */}
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-xl p-1 shadow-md border ${
          isDarkMode 
            ? 'bg-gray-700/60 border-gray-600/50 shadow-gray-900/20' 
            : 'bg-white/80 border-gray-200/60 shadow-blue-100/50'
        }`}>
          <button
            className={`px-2 py-2 sm:px-3 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1 ${
              filter === 'all'
                ? `${isDarkMode 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30' 
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                  }` 
                : `${isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-600/50' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50/80'
                  }`
            }`}
            onClick={() => setFilter('all')}
          >
            <span className="text-sm">⚽</span>
            <span className="hidden xs:inline">All ({myGames.length})</span>
            <span className="xs:hidden">{myGames.length}</span>
          </button>
          <button
            className={`px-2 py-2 sm:px-3 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1 ${
              filter === 'created'
                ? `${isDarkMode 
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30' 
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                  }` 
                : `${isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-600/50' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50/80'
                  }`
            }`}
            onClick={() => setFilter('created')}
          >
            <span className="text-sm">➕</span>
            <span className="hidden xs:inline">Created ({createdGames.length})</span>
            <span className="xs:hidden">{createdGames.length}</span>
          </button>
          <button
            className={`px-2 py-2 sm:px-3 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1 ${
              filter === 'available'
                ? `${isDarkMode 
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/30' 
                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25'
                  }` 
                : `${isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-600/50' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50/80'
                  }`
            }`}
            onClick={() => setFilter('available')}
          >
            <span className="text-sm">✅</span>
            <span className="hidden xs:inline">Available ({availableGamesCount})</span>
            <span className="xs:hidden">{availableGamesCount}</span>
          </button>
          <button
            className={`px-2 py-2 sm:px-3 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1 ${
              filter === 'unavailable'
                ? `${isDarkMode 
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30' 
                    : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
                  }` 
                : `${isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-600/50' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50/80'
                  }`
            }`}
            onClick={() => setFilter('unavailable')}
          >
            <span className="text-sm">❌</span>
            <span className="hidden xs:inline">Unavailable ({unavailableGamesCount})</span>
            <span className="xs:hidden">{unavailableGamesCount}</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredGames.length === 0 ? (
          <div className={`p-4 sm:p-6 rounded-xl text-center ${
            isDarkMode ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-50 text-gray-500'
          }`}>
            <div className="text-2xl sm:text-4xl mb-2">
              {filter === 'all' && '⚽'}
              {filter === 'created' && '➕'}
              {filter === 'available' && '✅'}
              {filter === 'unavailable' && '❌'}
            </div>
            <p className="font-medium text-sm sm:text-base">
              No {filter === 'all' ? '' : filter} games found
            </p>
            <p className="text-xs sm:text-sm mt-1">
              {filter === 'all' && "You haven't created or voted on any games yet."}
              {filter === 'created' && "You haven't created any games yet."}
              {filter === 'available' && "You haven't voted as available for any games yet."}
              {filter === 'unavailable' && "You haven't voted as unavailable for any games yet."}
            </p>
          </div>
        ) : (
          filteredGames.map(game => {
          const userResponse = game.responses.find(response => response.user._id === userId);
          const isCreator = game.creator._id === userId;
          const gameDate = new Date(+game.date);
          const humanDate = gameDate.toLocaleDateString();
          const effectiveStatus = getGameEffectiveStatus(game);
          
          // Format time to 12-hour format
          const [h, m] = game.time.split(":").map(Number);
          const hour12 = ((h + 11) % 12) + 1;
          const ampm = h >= 12 ? "PM" : "AM";
          const humanTime = `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;

          const getStatusColor = (status) => {
            switch (status) {
              case 'PENDING':
                return isDarkMode ? 'bg-orange-900/30 text-orange-200 border-orange-700' : 'bg-orange-100 text-orange-800 border-orange-200';
              case 'CONFIRMED':
                return isDarkMode ? 'bg-green-900/30 text-green-200 border-green-700' : 'bg-green-100 text-green-800 border-green-200';
              case 'CANCELLED':
                return isDarkMode ? 'bg-red-900/30 text-red-200 border-red-700' : 'bg-red-100 text-red-800 border-red-200';
              case 'COMPLETED':
                return isDarkMode ? 'bg-purple-900/30 text-purple-200 border-purple-700' : 'bg-purple-100 text-purple-800 border-purple-200';
              case 'EXPIRED':
                return isDarkMode ? 'bg-gray-900/30 text-gray-200 border-gray-700' : 'bg-gray-100 text-gray-800 border-gray-200';
              default:
                return isDarkMode ? 'bg-gray-900/30 text-gray-200 border-gray-700' : 'bg-gray-100 text-gray-800 border-gray-200';
            }
          };

          const getVoteColor = (isAvailable) => {
            return isAvailable 
              ? isDarkMode ? 'bg-green-900/30 text-green-200 border-green-700' : 'bg-green-100 text-green-800 border-green-200'
              : isDarkMode ? 'bg-red-900/30 text-red-200 border-red-700' : 'bg-red-100 text-red-800 border-red-200';
          };

          return (
            <Link
              key={game._id}
              to={`/game-schedule/${game._id}`}
              className={`block p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] hover:no-underline ${
                isDarkMode 
                  ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600' 
                  : 'bg-white border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex flex-col gap-2 sm:gap-3">
                {/* Header with date and status */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`p-1.5 sm:p-2 rounded-lg ${isDarkMode ? 'bg-blue-800/30' : 'bg-blue-100'}`}>
                      <span className="text-sm sm:text-base">📅</span>
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm sm:text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {humanDate}
                      </h4>
                      <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                        🕐 {humanTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col xs:flex-row gap-1 xs:gap-2">
                    <div className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-bold border ${getStatusColor(effectiveStatus)}`}>
                      {effectiveStatus}
                    </div>
                    {isCreator && (
                      <div className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${
                        isDarkMode ? 'bg-purple-900/30 text-purple-200 border-purple-700' : 'bg-purple-100 text-purple-800 border-purple-200'
                      }`}>
                        <span>👤</span>
                        <span className="hidden xs:inline">Creator</span>
                      </div>
                    )}
                    {userResponse && (
                      <div className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${getVoteColor(userResponse.isAvailable)}`}>
                        <span>{userResponse.isAvailable ? '✅' : '❌'}</span>
                        <span className="hidden xs:inline">{userResponse.isAvailable ? 'Available' : 'Not Available'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Game details */}
                <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                  <div className="space-y-1 text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-sm">🏟️</span>
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                        {game.venue}, {game.city}
                      </span>
                    </div>
                    {game.opponent && (
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-sm">⚽</span>
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                          vs {game.opponent}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Game notes preview */}
                {game.notes && (
                  <div className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm ${
                    isDarkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-50 text-gray-600'
                  }`}>
                    <div className="flex items-start gap-1.5 sm:gap-2">
                      <span className="text-sm">📝</span>
                      <span className="line-clamp-2">
                        {game.notes.length > 80 ? `${game.notes.substring(0, 80)}...` : game.notes}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Link>
          );
          })
        )}
      </div>

      {/* Statistics */}
      <div className={`p-3 sm:p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
        <h4 className={`font-bold mb-2 sm:mb-3 text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Your Game Stats
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center">
            <div className={`text-lg sm:text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {myGames.length}
            </div>
            <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Total Games
            </div>
          </div>
          <div className="text-center">
            <div className={`text-lg sm:text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              {createdGames.length}
            </div>
            <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Created
            </div>
          </div>
          <div className="text-center">
            <div className={`text-lg sm:text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
              {availableGamesCount}
            </div>
            <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Available
            </div>
          </div>
          <div className="text-center">
            <div className={`text-lg sm:text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
              {unavailableGamesCount}
            </div>
            <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Unavailable
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyGames;
