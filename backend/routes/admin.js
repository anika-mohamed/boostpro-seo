const express = require("express")
const router = express.Router()

const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getDashboardStats,
  getAuditStats,
  getSubscriptionStats,
} = require("../controllers/admin")

const { protect, authorize } = require("../middleware/auth")

// --- Public test route ---
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Admin routes are working" })
})

// --- Protect all routes below this point ---
router.use(protect)

// Use authorize middleware to restrict access to admin only
router.use(authorize("admin"))

// --- User Management Routes ---
router.post("/users", createUser)        // Create user
router.get("/users", getUsers)           // List users
router.get("/users/:id", getUserById)    // Get user by ID
router.put("/users/:id", updateUser)     // Update user
router.delete("/users/:id", deleteUser)  // Delete user

// --- Statistics Routes ---
router.get("/stats/dashboard", getDashboardStats)
router.get("/stats/audits", getAuditStats)
router.get("/stats/subscriptions", getSubscriptionStats)

module.exports = router
