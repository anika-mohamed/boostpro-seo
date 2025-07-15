require("dotenv").config()
const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const path = require("path")
const connectDB = require("./config/database")

const app = express()

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }))
app.use(express.json())
app.use(cookieParser())

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")))

// Routes
const imageRoutes = require("./routes/image")
app.use("/api/image", imageRoutes)

const authRoutes = require("./routes/auth")
app.use("/api/auth", authRoutes)

const seoRoutes = require("./routes/seo")
app.use("/api/seo", seoRoutes)

app.get("/", (req, res) => {
  res.send("API is running")
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, message: "Something went wrong!" })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
