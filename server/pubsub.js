// Shared PubSub instance for the entire application
const { PubSub } = require('graphql-subscriptions');

const pubsub = new PubSub();

// Increase max listeners to prevent memory leak warnings
// This is safe because multiple users/components need to subscribe to events
pubsub.ee.setMaxListeners(100); // Increase from default 10 to 100

console.log('✅ PubSub instance created and exported with increased max listeners');

module.exports = pubsub;
