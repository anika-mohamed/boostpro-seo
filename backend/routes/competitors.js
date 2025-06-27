const express = require("express")
const { body } = require("express-validator")
const { analyzeCompetitors, getCompetitorHistory, getCompetitorAnalysisById } = require("../controllers/competitors")

const { protect, checkSubscription, checkUsageLimit } = require("../middleware/auth")

const router = express.Router()

// Validation
const competitorValidation = [
  body("keywords").isArray({ min: 1, max: 3 }).withMessage("Please provide 1-3 keywords for analysis"),
  body("keywords.*")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Each keyword must be between 1 and 50 characters"),
  body("userWebsite").optional().isURL().withMessage("Please provide a valid website URL"),
]

router.use(protect) // All routes require authentication

router.post(
  "/analyze",
  competitorValidation,
  checkSubscription("basic"), // Requires basic subscription
  checkUsageLimit("competitorAnalyses", 5), // 5 analyses per month for basic users
  analyzeCompetitors,
)

router.get("/history", getCompetitorHistory)
router.get("/analysis/:id", getCompetitorAnalysisById)

module.exports = router
