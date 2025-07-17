const express = require("express")
const { generateReport, downloadReport, getReportHistory } = require("../controllers/reports")
const { protect, checkSubscription } = require("../middleware/auth")

const router = express.Router()

router.use(protect) // Ensure user is authenticated

router.post("/generate", checkSubscription("pro"), generateReport)
router.get("/download/:reportId", downloadReport)
router.get("/history", getReportHistory)

module.exports = router
