const express = require("express")
const { body } = require("express-validator")
const { auditWebsite, getAuditHistory, getAuditById, generateSwotAnalysis, deleteAudit } = require("../controllers/seo")

const { protect, authorize, checkSubscription, checkUsageLimit } = require("../middleware/auth")

const router = express.Router()

// Test endpoint (no auth required for testing)
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "SEO routes are working!",
    timestamp: new Date().toISOString(),
  })
})

// Validation
const auditValidation = [body("url").isURL().withMessage("Please provide a valid URL")]

router.use(protect) // All routes below require authentication

// POST /api/seo/audit - Start new audit
router.post(
  "/audit",
  auditValidation,
  checkUsageLimit("audits", 10), // Free users: 10 audits per month
  auditWebsite,
)

// POST /api/seo/swot/:auditId - Generate SWOT analysis
router.post(
  "/swot/:auditId",
  checkSubscription("basic"), // Requires basic subscription
  generateSwotAnalysis,
)

// GET /api/seo/audits - Get audit history
router.get("/audits", getAuditHistory)

// GET /api/seo/audits/:id - Get single audit by ID
router.get("/audits/:id", getAuditById)

// DELETE /api/seo/audits/:id - Delete audit
router.delete("/audits/:id", deleteAudit)

module.exports = router
