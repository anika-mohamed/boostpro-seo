const express = require("express")
const { body } = require("express-validator")
const { suggestKeywords, getKeywordHistory, getTrendingKeywords } = require("../controllers/keywords")

const { protect, checkUsageLimit } = require("../middleware/auth")

const router = express.Router()

// Validation
const keywordValidation = [
  body("keyword").trim().isLength({ min: 1, max: 100 }).withMessage("Keyword must be between 1 and 100 characters"),
]

router.use(protect)

router.post(
  "/suggest",
  keywordValidation,
  checkUsageLimit("keywordSearches", 50), // 50 searches per month for free users
  suggestKeywords,
)

router.get("/history", getKeywordHistory)
router.get("/trending", getTrendingKeywords)

module.exports = router
