require("dotenv").config()
const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const path = require("path")
const connectDB = require("./config/database")

const app = express()

// ✅ Connect to MongoDB
connectDB()

// ✅ Proper CORS handling (especially for preflight OPTIONS requests)
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}
app.use(cors(corsOptions))

// ✅ Handle preflight requests explicitly
app.options("*", cors(corsOptions)) // Important for cookies + axios

// ✅ Middlewares
app.use(express.json())
app.use(cookieParser())

// ✅ Serve static files
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")))

// ✅ Routes
const imageRoutes = require("./routes/image")
app.use("/api/image", imageRoutes)

const authRoutes = require("./routes/auth")
app.use("/api/auth", authRoutes)

const seoRoutes = require("./routes/seo")
app.use("/api/seo", seoRoutes)

const adminRoutes = require("./routes/admin")
app.use("/api/admin", adminRoutes)

const reportRoutes = require("./routes/reports")
app.use("/api/reports", reportRoutes)

app.use("/reports/download", express.static(path.join(__dirname, "public", "reports")))


// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, message: "Something went wrong!" })
})

// ✅ Start the server
const PORT = process.env.PORT || 5050
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
