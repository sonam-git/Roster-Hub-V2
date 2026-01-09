// Shared PubSub instance for the entire application
const { PubSub } = require('graphql-subscriptions');

const pubsub = new PubSub();

console.log('✅ PubSub instance created and exported');

module.exports = pubsub;
