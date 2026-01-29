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
      PENDING: isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300',
      CONFIRMED: isDarkMode ? 'bg-gray-700 text-green-400 border-gray-600' : 'bg-green-50 text-green-700 border-green-200',
      CANCELLED: isDarkMode ? 'bg-gray-700 text-red-400 border-gray-600' : 'bg-red-50 text-red-700 border-red-200',
      COMPLETED: isDarkMode ? 'bg-gray-700 text-blue-400 border-gray-600' : 'bg-blue-50 text-blue-700 border-blue-200'
    };
    return colors[status] || colors.PENDING;
  };

  const GameCard = ({ game, isAvailable }) => (
    <Link 
      to={`/game-schedule/${game._id}`}
      className={`block p-3 sm:p-4 rounded-md border transition-colors duration-150 hover:no-underline ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Header with date and status */}
      <div className="flex justify-between items-start mb-2 sm:mb-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`p-1.5 sm:p-2 rounded-md ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <span className="text-sm sm:text-base">📅</span>
          </div>
          <div>
            <h4 className={`font-medium text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatGameDate(game.date)}
            </h4>
            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              🕐 {formatGameTime(game.time)}
            </p>
          </div>
        </div>
        <div className={`px-2 py-1 sm:px-3 sm:py-1 rounded-md text-xs font-medium border ${getStatusColor(game.status, isDarkMode)}`}>
          {game.status}
        </div>
      </div>

      {/* Game details */}
      <div className={`p-2 sm:p-3 rounded-md ${isDarkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-sm">🏟️</span>
            <div>
              <p className={`font-medium text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Venue</p>
              <p className={`font-medium text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{game.venue}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-sm">⚽</span>
            <div>
              <p className={`font-medium text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Opponent</p>
              <p className={`font-medium text-xs sm:text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{game.opponent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Availability indicator */}
      <div className="mt-2 sm:mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className={`text-sm sm:text-base ${isAvailable ? 'text-green-500' : 'text-red-500'}`}>
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
          <div key={i} className={`p-3 sm:p-4 rounded-md animate-pulse ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
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
          <div key={i} className={`p-3 sm:p-4 rounded-md animate-pulse ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
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
      <div className={`p-4 sm:p-6 rounded-md border text-center ${
        isDarkMode ? 'bg-gray-800 border-gray-700 text-red-400' : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        <span className="text-xl sm:text-2xl mb-2 block">⚠️</span>
        <p className="font-medium text-sm sm:text-base">Error loading games</p>
      </div>
    );
  }

  const totalGames = friendGames.available.length + friendGames.unavailable.length;

  if (totalGames === 0) {
    return (
      <div className={`p-6 sm:p-8 rounded-md border text-center ${
        isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'
      }`}>
        <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-md mx-auto mb-3 sm:mb-4 flex items-center justify-center ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <span className="text-xl sm:text-2xl">⚽</span>
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
      <div className={`flex rounded-md p-1 border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <button
          className={`flex-1 px-3 py-2 sm:px-4 sm:py-2 rounded-md font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-1 sm:gap-2 ${
            filter === 'available'
              ? `${isDarkMode 
                  ? 'bg-gray-700 text-white' 
                  : 'bg-gray-100 text-gray-900'
                }` 
              : `${isDarkMode 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-750' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`
          }`}
          onClick={() => setFilter('available')}
        >
          <span className="text-sm">✅</span>
          <span className="hidden xs:inline">Available ({friendGames.available.length})</span>
          <span className="xs:hidden">Avail ({friendGames.available.length})</span>
        </button>
        <button
          className={`flex-1 px-3 py-2 sm:px-4 sm:py-2 rounded-md font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-1 sm:gap-2 ${
            filter === 'unavailable'
              ? `${isDarkMode 
                  ? 'bg-gray-700 text-white' 
                  : 'bg-gray-100 text-gray-900'
                }` 
              : `${isDarkMode 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-750' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
          <div className={`p-4 sm:p-6 rounded-md border text-center ${
            isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'
          }`}>
            <div className="text-2xl sm:text-3xl mb-2">{filter === 'available' ? '✅' : '❌'}</div>
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
