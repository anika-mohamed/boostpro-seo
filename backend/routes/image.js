const express = require("express")
const { body } = require("express-validator")
const { generateAltTags, getAltTagHistory, getImagesWithoutAlt } = require("../controllers/image")

const { protect, checkSubscription } = require("../middleware/auth")

const router = express.Router()

// Validation
const altTagValidation = [
  body("imageDescriptions").isArray({ min: 1, max: 10 }).withMessage("Please provide 1-10 image descriptions"),
  body("imageDescriptions.*")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Each image description must be between 5 and 200 characters"),
]

router.use(protect) // All routes require authentication

router.post(
  "/alt-tags",
  altTagValidation,
  checkSubscription("basic"), // Requires basic subscription
  generateAltTags,
)

router.get("/alt-tags/history", getAltTagHistory)

// New route to fetch recent images without ALT text
router.get("/no-alt", getImagesWithoutAlt)

module.exports = router
