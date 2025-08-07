// Game expiration utility functions
import { addDays, isAfter, parseISO } from 'date-fns';

/**
 * Check if a game is expired based on its date and status
 * Only applies expiration logic to PENDING, CONFIRMED, and CANCELLED games
 * COMPLETED games are never considered expired (they contain valuable feedback)
 * 
 * @param {Object} game - The game object
 * @param {string} game.date - Game date (timestamp or ISO string)
 * @param {string} game.status - Game status (PENDING, CONFIRMED, CANCELLED, COMPLETED)
 * @param {number} daysAfterExpiry - Days after game date to consider expired (default: 0 for immediate expiration)
 * @returns {boolean} - Whether the game is expired
 */
export const isGameExpired = (game, daysAfterExpiry = 0) => {
  if (!game || !game.date || !game.status) return false;
  
  // COMPLETED games are never expired - they contain valuable feedback
  if (game.status === 'COMPLETED') return false;
  
  // Only check expiration for PENDING, CONFIRMED, and CANCELLED games
  const expirableStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED'];
  if (!expirableStatuses.includes(game.status)) return false;
  
  try {
    // Parse the game date - handle both timestamp and ISO string formats
    let gameDate;
    if (typeof game.date === 'number') {
      gameDate = new Date(game.date);
    } else if (typeof game.date === 'string') {
      // Try parsing as ISO string first, then as timestamp
      gameDate = isNaN(Date.parse(game.date)) 
        ? new Date(parseInt(game.date)) 
        : parseISO(game.date);
    } else {
      gameDate = new Date(game.date);
    }
    
    // Check if date is valid
    if (isNaN(gameDate.getTime())) return false;
    
    // Calculate expiry date (game date + specified days)
    // For immediate expiration (daysAfterExpiry = 0), this just uses the game date
    const expiryDate = addDays(gameDate, daysAfterExpiry);
    const now = new Date();
    
    // Game is expired if current date is after expiry date
    return isAfter(now, expiryDate);
  } catch (error) {
    console.error('Error checking game expiration:', error);
    return false;
  }
};

/**
 * Get the effective status of a game (original status or 'EXPIRED')
 * 
 * @param {Object} game - The game object
 * @param {number} daysAfterExpiry - Days after game date to consider expired (default: 0)
 * @returns {string} - The effective status ('EXPIRED' or original status)
 */
export const getGameEffectiveStatus = (game, daysAfterExpiry = 0) => {
  return isGameExpired(game, daysAfterExpiry) ? 'EXPIRED' : game.status;
};

/**
 * Categorize games by their effective status (including expired games)
 * 
 * @param {Array} games - Array of game objects
 * @param {number} daysAfterExpiry - Days after game date to consider expired (default: 0)
 * @returns {Object} - Object with games categorized by status
 */
export const categorizeGamesByStatus = (games, daysAfterExpiry = 0) => {
  const categories = {
    PENDING: [],
    CONFIRMED: [],
    CANCELLED: [],
    COMPLETED: [],
    EXPIRED: []
  };
  
  games.forEach(game => {
    const effectiveStatus = getGameEffectiveStatus(game, daysAfterExpiry);
    if (categories[effectiveStatus]) {
      categories[effectiveStatus].push(game);
    }
  });
  
  return categories;
};

/**
 * Filter games by effective status
 * 
 * @param {Array} games - Array of game objects
 * @param {string} statusFilter - Status to filter by ('ALL', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'EXPIRED')
 * @param {number} daysAfterExpiry - Days after game date to consider expired (default: 0)
 * @returns {Array} - Filtered games
 */
export const filterGamesByStatus = (games, statusFilter, daysAfterExpiry = 0) => {
  if (statusFilter === 'ALL') return games;
  
  return games.filter(game => {
    const effectiveStatus = getGameEffectiveStatus(game, daysAfterExpiry);
    return effectiveStatus === statusFilter;
  });
};

/**
 * Get status counts including expired games
 * 
 * @param {Array} games - Array of game objects
 * @param {number} daysAfterExpiry - Days after game date to consider expired (default: 0)
 * @returns {Object} - Object with count for each status
 */
export const getStatusCounts = (games, daysAfterExpiry = 0) => {
  const categories = categorizeGamesByStatus(games, daysAfterExpiry);
  
  return {
    ALL: games.length,
    PENDING: categories.PENDING.length,
    CONFIRMED: categories.CONFIRMED.length,
    CANCELLED: categories.CANCELLED.length,
    COMPLETED: categories.COMPLETED.length,
    EXPIRED: categories.EXPIRED.length
  };
};
