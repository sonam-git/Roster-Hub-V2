import { useQuery, useSubscription } from "@apollo/client";
import { useState } from "react";
import { QUERY_GAMES } from "../../utils/queries";
import { GAME_CREATED_SUBSCRIPTION, GAME_CONFIRMED_SUBSCRIPTION, GAME_UPDATED_SUBSCRIPTION, GAME_COMPLETED_SUBSCRIPTION, GAME_CANCELLED_SUBSCRIPTION, GAME_DELETED_SUBSCRIPTION } from "../../utils/subscription";

export default function CustomComingGames({ isDarkMode }) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const { loading, error, data } = useQuery(QUERY_GAMES);

  // Subscribe to all relevant game events for real-time updates
  useSubscription(GAME_CREATED_SUBSCRIPTION, {
    onData: ({ client }) => { client.refetchQueries({ include: [QUERY_GAMES] }); },
  });
  useSubscription(GAME_CONFIRMED_SUBSCRIPTION, {
    onData: ({ client }) => { client.refetchQueries({ include: [QUERY_GAMES] }); },
  });
  useSubscription(GAME_UPDATED_SUBSCRIPTION, {
    onData: ({ client }) => { client.refetchQueries({ include: [QUERY_GAMES] }); },
  });
  useSubscription(GAME_COMPLETED_SUBSCRIPTION, {
    onData: ({ client }) => { client.refetchQueries({ include: [QUERY_GAMES] }); },
  });
  useSubscription(GAME_CANCELLED_SUBSCRIPTION, {
    onData: ({ client }) => { client.refetchQueries({ include: [QUERY_GAMES] }); },
  });
  useSubscription(GAME_DELETED_SUBSCRIPTION, {
    onData: ({ client }) => { client.refetchQueries({ include: [QUERY_GAMES] }); },
  });

  if (loading) return <div className="text-center mt-4">Loading games...</div>;
  if (error) return <div className="text-center mt-4 text-red-600">Error: {error.message}</div>;

  const allGames = (data?.games || []).filter(g => g.status === "PENDING" || g.status === "CONFIRMED");
  
  // Filter games based on selected category
  const filteredGames = selectedCategory === "ALL" 
    ? allGames 
    : allGames.filter(g => g.status === selectedCategory);

  const categories = [
    { key: "ALL", label: "All Games", icon: "🎯", count: allGames.length },
    { key: "PENDING", label: "Pending", icon: "⏳", count: allGames.filter(g => g.status === "PENDING").length },
    { key: "CONFIRMED", label: "Confirmed", icon: "✅", count: allGames.filter(g => g.status === "CONFIRMED").length }
  ];

  if (!allGames.length) {
    return <div className="text-center italic dark:text-white mt-4">No upcoming games.</div>;
  }

  return (
    <div className="w-full  mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 mt-8 mb-6 max-w-7xl">
      {/* Header Section */}
      <div className="mb-8">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center shadow-lg">
              <span className="text-xl text-white">⚽</span>
            </div>
            <h2 className={`text-2xl md:text-3xl font-bold ${
              isDarkMode 
                ? "bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent" 
                : "bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
            }`}>
              🏆 Upcoming Games
            </h2>
          </div>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Stay updated with your scheduled matches and game status
          </p>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex justify-center gap-1 sm:gap-4">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg flex-1 sm:flex-initial justify-center ${
                selectedCategory === category.key
                  ? isDarkMode
                    ? "bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-green-500/30"
                    : "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-green-500/30"
                  : isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600"
                    : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
              }`}
            >
              <span className="text-sm sm:text-base">{category.icon}</span>
              <span className="hidden sm:inline">{category.label}</span>
              <span className="sm:hidden text-xs">{category.key === "ALL" ? "All" : category.key.charAt(0) + category.key.slice(1).toLowerCase()}</span>
              {category.count > 0 && (
                <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold ${
                  selectedCategory === category.key
                    ? "bg-white/20 text-white"
                    : isDarkMode
                      ? "bg-gray-600 text-gray-300"
                      : "bg-gray-100 text-gray-600"
                }`}>
                  {category.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Games Grid */}
      {filteredGames.length === 0 ? (
        <div className="text-center py-12">
          <div className={`inline-flex items-center gap-3 px-6 py-4 rounded-xl ${
            isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
          }`}>
            <span className="text-2xl">🔍</span>
            <p className="font-medium">
              No {selectedCategory === "ALL" ? "upcoming" : selectedCategory.toLowerCase()} games found.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredGames.map(game => {
          // Format date and time like GameDetails
          let humanDate = game.date;
          let humanTime = game.time;
          // Try to parse date if it's a timestamp
          if (!isNaN(Number(game.date))) {
            const dateObj = new Date(Number(game.date));
            humanDate = dateObj.toLocaleDateString();
          }
          if (game.time) {
            const [h, m] = game.time.split(":").map(Number);
            const hour12 = ((h + 11) % 12) + 1;
            const ampm = h >= 12 ? "PM" : "AM";
            humanTime = `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
          }
          
          return (
            <div
              key={game._id}
              className={`group relative rounded-2xl shadow-xl border-2 transition-all duration-300 overflow-hidden
                bg-gradient-to-br hover:shadow-2xl
                ${isDarkMode 
                  ? 'from-gray-900 via-gray-800 to-gray-700 border-gray-600 text-gray-100 hover:border-gray-500' 
                  : 'from-white via-blue-50 to-indigo-50 border-blue-200 text-gray-800 hover:border-blue-300'}
                transform hover:scale-[1.02] hover:-translate-y-1
                ${game.status === 'CONFIRMED' ? (isDarkMode ? 'hover:border-green-400 hover:shadow-green-400/20' : 'hover:border-green-500 hover:shadow-green-500/20') : ''}
                ${game.status === 'PENDING' ? (isDarkMode ? 'hover:border-orange-400 hover:shadow-orange-400/20' : 'hover:border-orange-500 hover:shadow-orange-500/20') : ''}
              `}
            >
              {/* Header Section with Opponent and Status */}
              <div className="p-6 pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-800/30' : 'bg-green-100'}`}>
                      ⚽
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-green-200' : 'text-green-700'}`}>
                        vs {game.opponent}
                      </h3>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Upcoming Match
                      </p>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-2 rounded-full text-xs font-bold shadow-sm
                    ${game.status === 'CONFIRMED' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' 
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200'}
                  `}>
                    <span className="flex items-center gap-1">
                      {game.status === 'CONFIRMED' ? '✅ ' : '⏳ '}
                      {game.status}
                    </span>
                  </div>
                </div>

                {/* Date and Time Section */}
                <div className={`p-4 rounded-xl mb-4 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} border ${isDarkMode ? 'border-gray-700' : 'border-blue-100'}`}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📅</span>
                      <div>
                        <p className="text-xs font-medium opacity-75 uppercase tracking-wide">Date</p>
                        <p className={`font-bold text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>{humanDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🕐</span>
                      <div>
                        <p className="text-xs font-medium opacity-75 uppercase tracking-wide">Time</p>
                        <p className={`font-bold text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>{humanTime}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Venue Section */}
                <div className={`p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-800/30' : 'bg-blue-50/50'} border-l-4 ${isDarkMode ? 'border-blue-400' : 'border-blue-500'}`}>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🏟️</span>
                    <div>
                      <p className="text-xs font-medium opacity-75 uppercase tracking-wide mb-1">Venue</p>
                      <p className={`font-bold text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>{game.venue}</p>
                    </div>
                  </div>
                </div>

                {/* City Section */}
                <div className={`p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-800/30' : 'bg-blue-50/50'} border-l-4 ${isDarkMode ? 'border-blue-400' : 'border-blue-500'}`}>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🏙️</span>
                    <div>
                      <p className="text-xs font-medium opacity-75 uppercase tracking-wide mb-1">City</p>
                      <p className={`font-bold text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>{game.city}</p>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                {game.notes && (
                  <div className={`p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-800/20' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-start space-x-2">
                      <span className="text-lg mt-0.5">📝</span>
                      <div>
                        <p className="text-xs font-medium opacity-75 uppercase tracking-wide mb-1">Notes</p>
                        <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {game.notes}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Players Section */}
                <div className="flex items-center justify-between pt-3 border-t border-opacity-20 border-gray-400">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-500 font-bold">👤</span>
                    <span className="text-green-500 font-bold">✅</span>
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {game.availableCount} Available
                    </span>
                  </div>
                  
                  <button
                    className={`px-4 py-2 rounded-lg font-bold text-sm shadow-lg transition-all duration-200 flex items-center gap-2
                      ${isDarkMode 
                        ? 'bg-blue-700 text-white hover:bg-blue-800 hover:shadow-blue-700/50' 
                        : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-blue-500/50'}
                      hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400
                    `}
                    onClick={() => window.location.href = `/game-schedule/${game._id}`}
                  >
                    <span>👁️</span>
                    View Details
                  </button>
                </div>
              </div>

              {/* Decorative accent line */}
              <div className={`h-1 w-full ${game.status === 'CONFIRMED' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}
