const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    // Ensure MONGODB_URI is set in your environment variables
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not defined.")
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI)

    console.log(`📦 MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error("❌ Database connection error:", error.message)
    // Exit process with failure
    process.exit(1)
  }
}

module.exports = connectDB
