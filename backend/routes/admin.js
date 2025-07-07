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

// Public test route - placed before auth middleware so it doesn't require auth
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Admin routes are working" })
})

// Apply protection and role-based authorization for all routes below
router.use(protect)
router.use(authorize("admin"))

// User management routes
router.post("/users", createUser)      // Add User
router.get("/users", getUsers)          // Get all users
router.get("/users/:id", getUserById)  // Get single user by ID
router.put("/users/:id", updateUser)   // Update user
router.delete("/users/:id", deleteUser) // Delete user

// Stats routes
router.get("/stats/dashboard", getDashboardStats)
router.get("/stats/audits", getAuditStats)
router.get("/stats/subscriptions", getSubscriptionStats)

module.exports = router
