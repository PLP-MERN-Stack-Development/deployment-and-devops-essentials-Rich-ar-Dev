const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Drop the problematic username index
    try {
      await db.collection('users').dropIndex('username_1');
      console.log('Successfully dropped username_1 index');
    } catch (error) {
      console.log('Index might not exist or already dropped:', error.message);
    }

    // Create proper index for email
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('Ensured email index exists');

    console.log('Index fix completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing index:', error);
    process.exit(1);
  }
}

fixIndex();