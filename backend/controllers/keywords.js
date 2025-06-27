const KeywordResearch = require("../models/KeywordResearch")
const { validationResult } = require("express-validator")
const { getKeywordSuggestions, getTrendData } = require("../services/keywordService")

// @desc    Get keyword suggestions
// @route   POST /api/keywords/suggest
// @access  Private
exports.suggestKeywords = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { keyword } = req.body

    // Check if we have cached results
    const cachedResult = await KeywordResearch.findOne({
      seedKeyword: keyword.toLowerCase(),
      cacheExpiry: { $gt: new Date() },
    }).sort({ createdAt: -1 })

    if (cachedResult) {
      return res.status(200).json({
        success: true,
        message: "Keyword suggestions retrieved from cache",
        data: cachedResult,
        cached: true,
      })
    }

    // Get fresh keyword suggestions
    const suggestions = await getKeywordSuggestions(keyword)
    const trendData = await getTrendData(keyword)

    // Create new keyword research record
    const keywordResearch = await KeywordResearch.create({
      user: req.user.id,
      seedKeyword: keyword.toLowerCase(),
      suggestions,
      trendData,
      cached: false,
      cacheExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    })

    // Update user usage
    req.user.usage.keywordSearchesThisMonth += 1
    await req.user.save({ validateBeforeSave: false })

    res.status(200).json({
      success: true,
      message: "Keyword suggestions generated successfully",
      data: keywordResearch,
      cached: false,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get keyword research history
// @route   GET /api/keywords/history
// @access  Private
exports.getKeywordHistory = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page, 10) || 1
    const limit = Number.parseInt(req.query.limit, 10) || 10
    const startIndex = (page - 1) * limit

    const total = await KeywordResearch.countDocuments({ user: req.user.id })

    const history = await KeywordResearch.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex)
      .select("seedKeyword suggestions.length trendData.timeframe createdAt")

    res.status(200).json({
      success: true,
      count: history.length,
      total,
      data: history,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get trending keywords
// @route   GET /api/keywords/trending
// @access  Private
exports.getTrendingKeywords = async (req, res, next) => {
  try {
    // This would typically come from Google Trends API or similar
    const trendingKeywords = [
      { keyword: "AI tools", searchVolume: 50000, trend: "up" },
      { keyword: "sustainable fashion", searchVolume: 30000, trend: "up" },
      { keyword: "remote work", searchVolume: 45000, trend: "stable" },
      { keyword: "cryptocurrency", searchVolume: 80000, trend: "down" },
      { keyword: "electric vehicles", searchVolume: 60000, trend: "up" },
    ]

    res.status(200).json({
      success: true,
      message: "Trending keywords retrieved successfully",
      data: trendingKeywords,
    })
  } catch (error) {
    next(error)
  }
}
