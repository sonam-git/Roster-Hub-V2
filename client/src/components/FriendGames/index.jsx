import React, { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { QUERY_GAMES } from '../../utils/queries';
import { Link } from 'react-router-dom';
import { useOrganization } from '../../contexts/OrganizationContext';

const FriendGames = ({ friendId, friendName, isDarkMode }) => {
  const { currentOrganization } = useOrganization();
  const { loading, data, error } = useQuery(QUERY_GAMES, {
    variables: { 
      organizationId: currentOrganization?._id 
    },
    skip: !currentOrganization,
  });
  const [filter, setFilter] = useState('available'); // 'available' or 'unavailable'

  const friendGames = useMemo(() => {
    if (!data?.games || !friendId) return { available: [], unavailable: [] };

    const available = [];
    const unavailable = [];

    data.games.forEach(game => {
      // Only show PENDING and CONFIRMED games
      if (game.status !== 'PENDING' && game.status !== 'CONFIRMED') return;

      const friendResponse = game.responses.find(response => response.user._id === friendId);
      
      if (friendResponse) {
        if (friendResponse.isAvailable) {
          available.push(game);
        } else {
          unavailable.push(game);
        }
      }
    });

    return { available, unavailable };
  }, [data?.games, friendId]);

  const filteredGames = friendGames[filter];

  const formatGameDate = (dateString) => {
    const date = new Date(Number(dateString));
    return date.toLocaleDateString();
  };

  const formatGameTime = (timeString) => {
    const [h, m] = timeString.split(':').map(n => parseInt(n, 10));
    const hour12 = ((h + 11) % 12) + 1;
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const getStatusColor = (status, isDarkMode) => {
    const colors = {
      PENDING: isDarkMode ? 'bg-orange-900/30 text-orange-200 border-orange-700' : 'bg-orange-100 text-orange-800 border-orange-300',
      CONFIRMED: isDarkMode ? 'bg-green-900/30 text-green-200 border-green-700' : 'bg-green-100 text-green-800 border-green-300',
      CANCELLED: isDarkMode ? 'bg-red-900/30 text-red-200 border-red-700' : 'bg-red-100 text-red-800 border-red-300',
      COMPLETED: isDarkMode ? 'bg-purple-900/30 text-purple-200 border-purple-700' : 'bg-purple-100 text-purple-800 border-purple-300'
    };
    return colors[status] || colors.PENDING;
  };

  const GameCard = ({ game, isAvailable }) => (
    <Link 
      to={`/game-schedule/${game._id}`}
      className={`block p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:no-underline ${
        isDarkMode 
          ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600' 
          : 'bg-white border-gray-200 hover:border-gray-300'
      } shadow-md`}
    >
      {/* Header with date and status */}
      <div className="flex justify-between items-start mb-2 sm:mb-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`p-1.5 sm:p-2 rounded-lg ${isDarkMode ? 'bg-blue-800/30' : 'bg-blue-100'}`}>
            <span className="text-sm sm:text-base">📅</span>
          </div>
          <div>
            <h4 className={`font-bold text-sm sm:text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {formatGameDate(game.date)}
            </h4>
            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
              🕐 {formatGameTime(game.time)}
            </p>
          </div>
        </div>
        <div className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-bold border ${getStatusColor(game.status, isDarkMode)}`}>
          {game.status}
        </div>
      </div>

      {/* Game details */}
      <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-sm">🏟️</span>
            <div>
              <p className={`font-medium text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Venue</p>
              <p className={`font-bold text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{game.venue}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-sm">⚽</span>
            <div>
              <p className={`font-medium text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Opponent</p>
              <p className={`font-bold text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{game.opponent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Availability indicator */}
      <div className="mt-2 sm:mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className={`text-sm sm:text-lg ${isAvailable ? 'text-green-500' : 'text-red-500'}`}>
            {isAvailable ? '✅' : '❌'}
          </span>
          <span className={`font-medium text-xs sm:text-sm ${
            isAvailable 
              ? (isDarkMode ? 'text-green-400' : 'text-green-600')
              : (isDarkMode ? 'text-red-400' : 'text-red-600')
          }`}>
            <span className="hidden xs:inline">{friendName} is {isAvailable ? 'available' : 'unavailable'}</span>
            <span className="xs:hidden">{isAvailable ? 'Available' : 'Unavailable'}</span>
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <span className="text-green-500">✅ {game.availableCount}</span>
          <span className={isDarkMode ? 'text-gray-600' : 'text-gray-400'}>•</span>
          <span className="text-red-500">❌ {game.unavailableCount}</span>
        </div>
      </div>
    </Link>
  );

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

  const totalGames = friendGames.available.length + friendGames.unavailable.length;

  if (totalGames === 0) {
    return (
      <div className={`p-6 sm:p-8 rounded-xl sm:rounded-2xl text-center ${
        isDarkMode ? 'bg-gray-800/30 text-gray-400' : 'bg-gray-50 text-gray-500'
      }`}>
        <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <span className="text-xl sm:text-2xl animate-spin-slow">⚽</span>
        </div>
        <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">No Games Available</h3>
        <p className="text-xs sm:text-sm">
          {friendName} hasn't voted on any pending or confirmed games yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filter Buttons */}
      <div className={`flex rounded-xl p-1 shadow-md border ${
        isDarkMode 
          ? 'bg-gray-700/60 border-gray-600/50 shadow-gray-900/20' 
          : 'bg-white/80 border-gray-200/60 shadow-blue-100/50'
      }`}>
        <button
          className={`flex-1 px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1 sm:gap-2 ${
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
          <span className="hidden xs:inline">Available ({friendGames.available.length})</span>
          <span className="xs:hidden">Avail ({friendGames.available.length})</span>
        </button>
        <button
          className={`flex-1 px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1 sm:gap-2 ${
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
          <span className="hidden xs:inline">Unavailable ({friendGames.unavailable.length})</span>
          <span className="xs:hidden">Unav ({friendGames.unavailable.length})</span>
        </button>
      </div>

      {/* Games List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredGames.length === 0 ? (
          <div className={`p-4 sm:p-6 rounded-xl text-center ${
            isDarkMode ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-50 text-gray-500'
          }`}>
            <div className="text-2xl sm:text-4xl mb-2">{filter === 'available' ? '✅' : '❌'}</div>
            <p className="font-medium text-sm sm:text-base">
              No {filter} games found
            </p>
            <p className="text-xs sm:text-sm mt-1">
              {friendName} hasn't voted as {filter} for any games yet.
            </p>
          </div>
        ) : (
          filteredGames.map(game => (
            <GameCard 
              key={game._id} 
              game={game}
              isAvailable={filter === 'available'}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default FriendGames;
