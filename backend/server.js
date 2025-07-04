require("dotenv").config()

const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const { connectDB } = require("./config/database")
const errorHandler = require("./middleware/errorHandler")

// Route imports
const authRoutes = require("./routes/auth")
const seoRoutes = require("./routes/seo")
const keywordRoutes = require("./routes/keywords")
const competitorRoutes = require("./routes/competitors")
const contentRoutes = require("./routes/content")
const imageRoutes = require("./routes/image")
const reportRoutes = require("./routes/reports")
const paymentRoutes = require("./routes/payments")
const adminRoutes = require("./routes/admin")

const app = express()

// Connect to MongoDB
connectDB()

// Security headers
app.use(helmet())

// CORS config
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
)

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
})
app.use(limiter)

// Body parser
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Mount API routes
app.use("/api/auth", authRoutes)
app.use("/api/seo", seoRoutes)
app.use("/api/keywords", keywordRoutes)
app.use("/api/competitors", competitorRoutes)
app.use("/api/content", contentRoutes)
app.use("/api/image", imageRoutes)
app.use("/api/reports", reportRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/admin", adminRoutes) // 👈 Includes user CRUD + stats

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  })
})

// 404 for unmatched API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
  })
})

// Global error handler
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`)
})

module.exports = app
