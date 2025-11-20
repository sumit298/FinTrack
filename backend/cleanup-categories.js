// Run this script once to clean up existing category documents
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fintrack');

const cleanup = async () => {
  try {
    // Remove transaction and budget fields from all categories
    const result = await mongoose.connection.db.collection('categories').updateMany(
      {},
      { $unset: { transaction: "", budget: "" } }
    );
    
    console.log(`Updated ${result.modifiedCount} categories`);
    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
};

cleanup();
