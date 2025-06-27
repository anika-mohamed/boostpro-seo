const ContentOptimization = require("../models/ContentOptimization")
const { validationResult } = require("express-validator")
const { optimizeContentWithAI } = require("../services/aiService")
const { analyzeContent, calculateReadabilityScore } = require("../services/contentService")

// @desc    Optimize content for SEO
// @route   POST /api/content/optimize
// @access  Private (Basic subscription required)
exports.optimizeContent = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { content, targetKeywords, title } = req.body

    // Analyze original content
    const originalAnalysis = analyzeContent(content, targetKeywords)

    // Create initial optimization record
    const optimization = await ContentOptimization.create({
      user: req.user.id,
      originalContent: {
        title: title || "",
        content,
        wordCount: content.split(/\s+/).length,
      },
      targetKeywords: targetKeywords.map((keyword, index) => ({
        keyword,
        priority: index === 0 ? "primary" : index === 1 ? "secondary" : "tertiary",
      })),
      optimizedContent: {},
      suggestions: [],
      metadata: {},
      performance: {
        beforeScore: originalAnalysis.seoScore,
      },
    })

    // Update user usage
    req.user.usage.contentOptimizationsThisMonth += 1
    await req.user.save({ validateBeforeSave: false })

    // Start optimization process (async)
    processContentOptimization(optimization._id, content, targetKeywords, title)

    res.status(201).json({
      success: true,
      message: "Content optimization started successfully",
      data: {
        optimizationId: optimization._id,
        originalAnalysis,
        estimatedTime: "1-2 minutes",
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get content optimization history
// @route   GET /api/content/history
// @access  Private
exports.getContentHistory = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page, 10) || 1
    const limit = Number.parseInt(req.query.limit, 10) || 10
    const startIndex = (page - 1) * limit

    const total = await ContentOptimization.countDocuments({ user: req.user.id })

    const optimizations = await ContentOptimization.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex)
      .select("originalContent.title targetKeywords performance.beforeScore performance.afterScore createdAt")

    res.status(200).json({
      success: true,
      count: optimizations.length,
      total,
      data: optimizations,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single content optimization by ID
// @route   GET /api/content/:id
// @access  Private
exports.getContentById = async (req, res, next) => {
  try {
    const optimization = await ContentOptimization.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!optimization) {
      return res.status(404).json({
        success: false,
        message: "Content optimization not found",
      })
    }

    res.status(200).json({
      success: true,
      data: optimization,
    })
  } catch (error) {
    next(error)
  }
}

// Helper function to process content optimization asynchronously
async function processContentOptimization(optimizationId, content, targetKeywords, title) {
  try {
    const optimization = await ContentOptimization.findById(optimizationId)

    // Use AI to optimize content for pro users
    let optimizedContent = content
    if (optimization.user && (await optimization.populate("user")).user.subscription.plan === "pro") {
      try {
        optimizedContent = await optimizeContentWithAI(content, targetKeywords)
      } catch (error) {
        console.error("AI optimization failed, using rule-based optimization:", error.message)
        optimizedContent = optimizeContentWithRules(content, targetKeywords)
      }
    } else {
      optimizedContent = optimizeContentWithRules(content, targetKeywords)
    }

    // Analyze optimized content
    const optimizedAnalysis = analyzeContent(optimizedContent, targetKeywords)

    // Generate suggestions
    const suggestions = generateContentSuggestions(content, optimizedContent, targetKeywords)

    // Generate metadata
    const metadata = generateMetadata(optimizedContent, targetKeywords, title)

    // Update optimization record
    optimization.optimizedContent = {
      title: metadata.suggestedTitle,
      content: optimizedContent,
      wordCount: optimizedContent.split(/\s+/).length,
      keywordDensity: optimizedAnalysis.keywordDensity,
      readabilityScore: optimizedAnalysis.readabilityScore,
      seoScore: optimizedAnalysis.seoScore,
    }
    optimization.suggestions = suggestions
    optimization.metadata = metadata
    optimization.performance.afterScore = optimizedAnalysis.seoScore
    optimization.performance.improvement = optimizedAnalysis.seoScore - optimization.performance.beforeScore

    await optimization.save()
  } catch (error) {
    console.error("Content optimization processing error:", error)
  }
}

// Helper function for rule-based content optimization
function optimizeContentWithRules(content, targetKeywords) {
  let optimized = content

  // Add keywords naturally if they're missing
  targetKeywords.forEach((keyword, index) => {
    const keywordRegex = new RegExp(`\\b${keyword}\\b`, "gi")
    const matches = optimized.match(keywordRegex) || []

    // Target density: 1-2% for primary keyword, 0.5-1% for others
    const targetDensity = index === 0 ? 0.015 : 0.008
    const wordCount = optimized.split(/\s+/).length
    const targetOccurrences = Math.ceil(wordCount * targetDensity)

    if (matches.length < targetOccurrences) {
      // Add keyword naturally in a few places
      const sentences = optimized.split(". ")
      const insertPositions = [
        Math.floor(sentences.length * 0.2),
        Math.floor(sentences.length * 0.5),
        Math.floor(sentences.length * 0.8),
      ]

      insertPositions.forEach((pos, i) => {
        if (i < targetOccurrences - matches.length && sentences[pos]) {
          sentences[pos] = sentences[pos].replace(/\b(the|a|an)\b/i, `${keyword}`)
        }
      })

      optimized = sentences.join(". ")
    }
  })

  return optimized
}

// Helper function to generate content suggestions
function generateContentSuggestions(original, optimized, keywords) {
  const suggestions = []

  // Check keyword usage
  keywords.forEach((keyword) => {
    const originalMatches = (original.match(new RegExp(`\\b${keyword}\\b`, "gi")) || []).length
    const optimizedMatches = (optimized.match(new RegExp(`\\b${keyword}\\b`, "gi")) || []).length

    if (optimizedMatches > originalMatches) {
      suggestions.push({
        type: "keyword",
        suggestion: `Increased usage of "${keyword}" for better SEO targeting`,
        applied: true,
      })
    }
  })

  // Check content structure
  const originalParagraphs = original.split("\n\n").length
  const optimizedParagraphs = optimized.split("\n\n").length

  if (optimizedParagraphs > originalParagraphs) {
    suggestions.push({
      type: "structure",
      suggestion: "Improved content structure with better paragraph breaks",
      applied: true,
    })
  }

  // General suggestions
  suggestions.push({
    type: "readability",
    suggestion: "Consider adding subheadings (H2, H3) to improve readability",
    applied: false,
  })

  suggestions.push({
    type: "length",
    suggestion: "Aim for 1500+ words for better search engine rankings",
    applied: false,
  })

  return suggestions
}

// Helper function to generate metadata
function generateMetadata(content, keywords, originalTitle) {
  const primaryKeyword = keywords[0]
  const contentWords = content.split(/\s+/)

  return {
    suggestedTitle: originalTitle || `${primaryKeyword} - Complete Guide and Best Practices`,
    suggestedDescription: `Learn everything about ${primaryKeyword}. ${content.substring(0, 120)}...`,
    suggestedSlug: primaryKeyword.toLowerCase().replace(/\s+/g, "-"),
    suggestedTags: keywords.concat([
      `${primaryKeyword} guide`,
      `${primaryKeyword} tips`,
      `${primaryKeyword} best practices`,
    ]),
  }
}
