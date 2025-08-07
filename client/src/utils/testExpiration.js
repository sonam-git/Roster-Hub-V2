// Quick test for game expiration logic
import { isGameExpired, getGameEffectiveStatus } from './gameExpiration.js';

// Test game objects
const testGames = [
  {
    _id: 'test1',
    date: Date.now() - (24 * 60 * 60 * 1000), // Yesterday
    status: 'PENDING'
  },
  {
    _id: 'test2', 
    date: Date.now() - (24 * 60 * 60 * 1000), // Yesterday
    status: 'CONFIRMED'
  },
  {
    _id: 'test3',
    date: Date.now() - (24 * 60 * 60 * 1000), // Yesterday  
    status: 'CANCELLED'
  },
  {
    _id: 'test4',
    date: Date.now() - (24 * 60 * 60 * 1000), // Yesterday
    status: 'COMPLETED'
  },
  {
    _id: 'test5',
    date: Date.now() + (24 * 60 * 60 * 1000), // Tomorrow
    status: 'PENDING'
  }
];

// Run tests
console.log('🧪 Game Expiration Tests:');
testGames.forEach(game => {
  const isExpired = isGameExpired(game);
  const effectiveStatus = getGameEffectiveStatus(game);
  console.log(`Game ${game._id} (${game.status}): ${isExpired ? 'EXPIRED' : 'NOT EXPIRED'} -> ${effectiveStatus}`);
});

export { testGames };
