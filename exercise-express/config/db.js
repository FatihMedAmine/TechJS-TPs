const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/mydatabase");
    console.log("MongoDB Connected to DB...");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    console.log("⚠️  Please start MongoDB or update the connection string to use MongoDB Atlas");
    console.log("The server will continue running, but database features won't work.");
    // Don't exit the process - let the app run without DB for now
  }
};

module.exports = connectDB;