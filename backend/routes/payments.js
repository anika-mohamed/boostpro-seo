const express = require("express")
const {
  createSubscription,
  cancelSubscription,
  getSubscriptionStatus,
  handleWebhook,
} = require("../controllers/payments")

const { protect } = require("../middleware/auth")

const router = express.Router()

// Webhook route (no auth required)
router.post("/webhook", express.raw({ type: "application/json" }), handleWebhook)

// Protected routes
router.use(protect)

router.post("/subscribe", createSubscription)
router.post("/cancel", cancelSubscription)
router.get("/status", getSubscriptionStatus)

module.exports = router
