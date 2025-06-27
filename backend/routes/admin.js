const express = require("express")
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getDashboardStats,
  getAuditStats,
  getSubscriptionStats,
} = require("../controllers/admin")

const { protect, authorize } = require("../middleware/auth")

const router = express.Router()

// All admin routes require authentication and admin role
router.use(protect)
router.use(authorize("admin"))

// User management
router.get("/users", getUsers)
router.get("/users/:id", getUserById)
router.put("/users/:id", updateUser)
router.delete("/users/:id", deleteUser)

// Dashboard stats
router.get("/stats/dashboard", getDashboardStats)
router.get("/stats/audits", getAuditStats)
router.get("/stats/subscriptions", getSubscriptionStats)

module.exports = router
