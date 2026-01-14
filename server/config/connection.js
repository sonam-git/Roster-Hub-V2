const mongoose = require('mongoose');

console.log('🔌 Attempting MongoDB connection...');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/roster-hub-v2', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
})
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('Full error:', err);
  });

module.exports = mongoose.connection;
