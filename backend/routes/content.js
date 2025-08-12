const express = require("express")
const { body } = require("express-validator")
const { optimizeContent, getContentHistory, getContentById } = require("../controllers/content")

const router = express.Router()

// Mock middleware functions - replace with your actual middleware
const protect = (req, res, next) => {
  // Mock user for development - replace with actual auth middleware
  req.user = {
    id: "mock-user-id",
    subscription: { plan: "basic" },
    usage: { contentOptimizationsThisMonth: 0 },
    save: async () => {},
  }
  next()
}

const checkSubscription = (plan) => (req, res, next) => {
  // Mock subscription check - implement your actual logic
  next()
}

const checkUsageLimit = (type, limit) => (req, res, next) => {
  // Mock usage limit check - implement your actual logic
  next()
}

// Validation rules for content optimization
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

// Apply authentication middleware to all content routes
router.use(protect)

// Route for optimizing content
router.post(
  "/optimize",
  contentValidation,
  checkSubscription("basic"),
  checkUsageLimit("contentOptimizations", 10),
  optimizeContent,
)

// Route for getting content optimization history
router.get("/history", getContentHistory)

// Route for getting a single content optimization by ID
router.get("/:id", getContentById)

module.exports = router
