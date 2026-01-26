import { useQuery, useSubscription } from "@apollo/client";
import { useState, useEffect } from "react";
import { QUERY_GAMES } from "../../utils/queries";
import Spinner from "../Spinner";
import { GAME_CREATED_SUBSCRIPTION, GAME_CONFIRMED_SUBSCRIPTION, GAME_UPDATED_SUBSCRIPTION, GAME_COMPLETED_SUBSCRIPTION, GAME_CANCELLED_SUBSCRIPTION, GAME_DELETED_SUBSCRIPTION } from "../../utils/subscription";
import { categorizeGamesByStatus, getGameEffectiveStatus } from "../../utils/gameExpiration";
import { useOrganization } from "../../contexts/OrganizationContext";

export default function CustomComingGames({ isDarkMode }) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const { currentOrganization } = useOrganization();
  const { loading, error, data, refetch } = useQuery(QUERY_GAMES, {
    variables: {
      organizationId: currentOrganization?._id
    },
    skip: !currentOrganization
  });
  
  // Refetch when organization changes
  useEffect(() => {
    if (currentOrganization) {
      refetch({ organizationId: currentOrganization._id });
    }
  }, [currentOrganization, refetch]);

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

  // Loading state for organization
  if (!currentOrganization) {
    return <Spinner />;
  }

  if (loading) return <Spinner />;
  if (error) return <div className="text-center mt-4 text-red-600">Error: {error.message}</div>;

  // Get all games and categorize them by effective status (including expired)
  const allGames = data?.games || [];
  const gameCategories = categorizeGamesByStatus(allGames);
  
  // Filter to show only PENDING, CONFIRMED, and EXPIRED games (no COMPLETED or CANCELLED in upcoming view)
  const upcomingGames = [...gameCategories.PENDING, ...gameCategories.CONFIRMED, ...gameCategories.EXPIRED];
  
  // Filter games based on selected category
  const filteredGames = selectedCategory === "ALL" 
    ? upcomingGames 
    : upcomingGames.filter(g => getGameEffectiveStatus(g) === selectedCategory);

  const categories = [
    { key: "ALL", label: "All Games", icon: "🎯", count: upcomingGames.length },
    { key: "PENDING", label: "Pending", icon: "⏳", count: gameCategories.PENDING.length },
    { key: "CONFIRMED", label: "Confirmed", icon: "✅", count: gameCategories.CONFIRMED.length },
    { key: "EXPIRED", label: "Expired", icon: "⌛", count: gameCategories.EXPIRED.length }
  ];

  if (!upcomingGames.length) {
    return (
      <div className="mt-4 mb-6 w-full max-w-full overflow-hidden px-2 sm:px-0 pt-20 lg:pt-24">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex-1 w-full lg:w-auto text-center">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Upcoming Games
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400">
                Stay updated with your scheduled matches
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-lg border p-6 sm:p-8 text-center ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <svg 
              className={`w-6 h-6 sm:w-8 sm:h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
          </div>
          <h3 className={`text-base sm:text-lg font-semibold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            No Upcoming Games
          </h3>
          <p className={`text-xs sm:text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            No games scheduled at the moment. Check back soon for new matches!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 mb-6 w-full max-w-full overflow-hidden px-2 sm:px-0 pt-20 lg:pt-24">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex-1 w-full lg:w-auto text-center">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Upcoming Games
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400">
              Stay updated with your scheduled matches and game status
            </p>
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div className="overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
          <div className="flex gap-2 justify-start sm:justify-center min-w-max sm:min-w-0 sm:flex-wrap relative z-10">
            {categories.map((category) => (
              <button
                key={category.key}
                type="button"
                onClick={() => setSelectedCategory(category.key)}
                className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors duration-200 border flex-shrink-0 cursor-pointer active:scale-95 relative z-10 ${
                  selectedCategory === category.key
                    ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 active:bg-blue-800'
                    : isDarkMode
                      ? "bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-gray-200 border-gray-700"
                      : "bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 border-gray-300"
                }`}
              >
                <span className="text-sm sm:text-base pointer-events-none">{category.icon}</span>
                <span className="whitespace-nowrap pointer-events-none">{category.label}</span>
                {category.count > 0 && (
                  <span className={`inline-flex items-center justify-center min-w-[18px] sm:min-w-[20px] h-4 sm:h-5 px-1.5 sm:px-2 rounded-full text-xs font-semibold pointer-events-none ${
                    selectedCategory === category.key
                      ? "bg-white/20 text-white"
                      : isDarkMode
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-100 text-gray-600"
                  }`}>
                    {category.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Games Grid */}
      {filteredGames.length === 0 ? (
        <div className={`rounded-lg border p-6 sm:p-8 text-center ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <span className="text-xl sm:text-2xl">🔍</span>
          </div>
          <p className={`text-sm sm:text-base font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            No {selectedCategory === "ALL" ? "upcoming" : selectedCategory.toLowerCase()} games found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {filteredGames.map(game => {
          const effectiveStatus = getGameEffectiveStatus(game);
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
              className={`rounded-lg border overflow-hidden transition-all duration-200 hover:shadow-md ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              {/* Header */}
              <div className={`px-3 sm:px-4 py-2.5 sm:py-3 border-b flex items-center justify-between ${
                isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center flex-shrink-0 ${
                    isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50'
                  }`}>
                    <span className="text-xs sm:text-sm">⚽</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={`text-xs sm:text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      vs {game.opponent}
                    </h3>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Upcoming Match
                    </p>
                  </div>
                </div>
                
                <div className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium whitespace-nowrap flex-shrink-0 ml-2 ${
                  effectiveStatus === 'CONFIRMED' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                    : effectiveStatus === 'EXPIRED'
                    ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                }`}>
                  <span className="hidden sm:inline">
                    {effectiveStatus === 'CONFIRMED' ? '✅ ' : effectiveStatus === 'EXPIRED' ? '⌛ ' : '⏳ '}
                    {effectiveStatus}
                  </span>
                  <span className="sm:hidden">
                    {effectiveStatus === 'CONFIRMED' ? '✅' : effectiveStatus === 'EXPIRED' ? '⌛' : '⏳'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">
                {/* Date and Time */}
                <div className={`grid grid-cols-2 gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'
                }`}>
                  <div>
                    <p className={`text-xs font-medium mb-0.5 sm:mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      📅 Date
                    </p>
                    <p className={`text-xs sm:text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {humanDate}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs font-medium mb-0.5 sm:mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      🕐 Time
                    </p>
                    <p className={`text-xs sm:text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {humanTime}
                    </p>
                  </div>
                </div>

                {/* Venue */}
                <div>
                  <p className={`text-xs font-medium mb-0.5 sm:mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    🏟️ Venue
                  </p>
                  <p className={`text-xs sm:text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {game.venue}
                  </p>
                </div>

                {/* City */}
                <div>
                  <p className={`text-xs font-medium mb-0.5 sm:mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    🏙️ City
                  </p>
                  <p className={`text-xs sm:text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {game.city}
                  </p>
                </div>

                {/* Notes */}
                {game.notes && (
                  <div>
                    <p className={`text-xs font-medium mb-0.5 sm:mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      📝 Notes
                    </p>
                    <p className={`text-xs sm:text-sm line-clamp-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {game.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className={`px-3 sm:px-4 py-2.5 sm:py-3 border-t flex items-center justify-between gap-2 ${
                isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <span className={`text-xs font-medium truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    👤 <span className="hidden xs:inline">Available:</span> {game.availableCount}
                  </span>
                </div>
                
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors duration-200 flex-shrink-0 cursor-pointer active:scale-95 relative z-10"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `/game-schedule/${game._id}`;
                  }}
                >
                  <span className="pointer-events-none">👁️</span>
                  <span className="hidden xs:inline pointer-events-none">View</span>
                </button>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}