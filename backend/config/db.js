import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    
    // Drop old non-sparse review index if it exists so mongoose can recreate it as sparse
    try {
      await conn.connection.db.collection('reviews').dropIndex('itinerary_1_user_1');
      console.log('✅ Dropped old reviews index itinerary_1_user_1');
    } catch (e) {
      // Index might not exist, which is fine
    }
    
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
