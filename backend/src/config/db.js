import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGO_URI_Local;
    await mongoose.connect(mongoUri, {
      dbName: process.env.MONGO_DB_NAME || undefined,
    });
    console.log(" MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;

