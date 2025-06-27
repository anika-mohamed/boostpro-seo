const express = require("express")
const { body } = require("express-validator")
const { optimizeContent, getContentHistory, getContentById } = require("../controllers/content")

const { protect, checkSubscription, checkUsageLimit } = require("../middleware/auth")

const router = express.Router()

// Validation
const contentValidation = [
  body("content")
    .trim()
    .isLength({ min: 100, max: 10000 })
    .withMessage("Content must be between 100 and 10,000 characters"),
  body("targetKeywords").isArray({ min: 1, max: 5 }).withMessage("Please provide 1-5 target keywords"),
  body("targetKeywords.*")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Each keyword must be between 1 and 50 characters"),
  body("title").optional().trim().isLength({ max: 200 }).withMessage("Title must be less than 200 characters"),
]

router.use(protect) // All routes require authentication

router.post(
  "/optimize",
  contentValidation,
  checkSubscription("basic"), // Requires basic subscription
  checkUsageLimit("contentOptimizations", 10), // 10 optimizations per month for basic users
  optimizeContent,
)

router.get("/history", getContentHistory)
router.get("/:id", getContentById)

module.exports = router
