import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/digital-twin';
    
    // Set a short connection timeout so we fall back quickly if offline
    console.log('Connecting to MongoDB server...');
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500, // wait up to 2.5s
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    process.env.USE_MEMORY_DB = 'false';
  } catch (error) {
    console.log('\n====================================================');
    console.log('   [WARNING] DATABASE SERVER CONNECTIVITY OFFLINE   ');
    console.log('====================================================');
    console.log(' MongoDB local daemon is not running on port 27017.');
    console.log(' >>> ACTIVATING RESILIENT LOCAL DB FALLBACK (db.json)');
    console.log(' >>> The application will run in fully active mode!');
    console.log('====================================================\n');
    
    // Set environment flag to true so Mongoose models pivot to mock operations
    process.env.USE_MEMORY_DB = 'true';
  }
};

export default connectDB;
