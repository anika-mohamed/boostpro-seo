const express = require("express")
const { generateReport, downloadReport, getReportHistory } = require("../controllers/reports")

const { protect, checkSubscription } = require("../middleware/auth")

const router = express.Router()

router.use(protect) // All routes require authentication

router.post(
  "/generate",
  checkSubscription("basic"), // Requires basic subscription
  generateReport,
)

router.get("/download/:reportId", downloadReport)
router.get("/history", getReportHistory)

module.exports = router
