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
} = require("../controllers/adminController")

// Protect middleware (implement auth & admin check)
const { protect, authorize } = require("../middleware/auth")

router.use(protect)
router.use(authorize("admin"))

// User management
router.post("/users", createUser)
router.get("/users", getUsers)
router.get("/users/:id", getUserById)
router.put("/users/:id", updateUser)
router.delete("/users/:id", deleteUser)

// Stats
router.get("/stats/dashboard", getDashboardStats)
router.get("/stats/audits", getAuditStats)
router.get("/stats/subscriptions", getSubscriptionStats)

module.exports = router
