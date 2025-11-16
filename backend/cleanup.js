const mongoose = require('mongoose');
require('dotenv').config();

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Get all indexes on users collection
    const indexes = await db.collection('users').getIndexes();
    console.log('Current indexes:', indexes);

    // Drop any problematic indexes (like username_1)
    if (indexes.username_1) {
      await db.collection('users').dropIndex('username_1');
      console.log('Dropped username_1 index');
    }

    // Ensure email index exists
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('Ensured email index exists');

    console.log('Cleanup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Cleanup error:', error);
    process.exit(1);
  }
}

cleanup();