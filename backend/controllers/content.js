const ContentOptimization = require("../models/ContentOptimization")
const { validationResult } = require("express-validator")
const { optimizeContentWithAI } = require("../services/aiService") // Ensure this service exists
const { analyzeContent } = require("../services/contentService") // Removed calculateReadabilityScore as it's not directly used here

// @desc    Optimize content for SEO
// @route   POST /api/content/optimize
// @access  Private (Basic subscription required)
exports.optimizeContent = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      // Explicitly return JSON for validation errors
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { content, targetKeywords, title } = req.body

    // Ensure req.user is available from your 'protect' middleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Not authorized, user not found" })
    }

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
      optimizedContent: {}, // Will be populated asynchronously
      suggestions: [],
      metadata: {},
      performance: {
        beforeScore: originalAnalysis.seoScore,
      },
    })

    // Update user usage (assuming req.user has a 'usage' object)
    if (req.user.usage) {
      req.user.usage.contentOptimizationsThisMonth = (req.user.usage.contentOptimizationsThisMonth || 0) + 1
      await req.user.save({ validateBeforeSave: false })
    } else {
      console.warn("User usage object not found on req.user. Skipping usage update.")
    }

    // Start optimization process (async)
    // This function runs in the background and updates the optimization record
    // It does NOT send a response back to the client directly.
    processContentOptimization(optimization._id, content, targetKeywords, title).catch(console.error) // Catch errors from async process

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
    // Pass any caught errors to the global error handler
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

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Not authorized, user not found" })
    }

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
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Not authorized, user not found" })
    }

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
// This function should ideally be in a separate worker or queue system for production
async function processContentOptimization(optimizationId, content, targetKeywords, title) {
  try {
    const optimization = await ContentOptimization.findById(optimizationId)
    if (!optimization) {
      console.error(`processContentOptimization: Optimization record ${optimizationId} not found.`)
      return
    }

    // Populate user to check subscription plan
    const populatedOptimization = await optimization.populate("user")
    const userPlan = populatedOptimization.user?.subscription?.plan

    let optimizedContent = content
    if (userPlan === "pro") {
      try {
        // This function needs to be implemented in your aiService.js
        optimizedContent = await optimizeContentWithAI(content, targetKeywords)
      } catch (error) {
        console.error("AI optimization failed, falling back to rule-based optimization:", error.message)
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
    console.log(`Content optimization ${optimizationId} completed successfully.`)
  } catch (error) {
    console.error(`Content optimization processing error for ID ${optimizationId}:`, error)
    // You might want to update the optimization record with an error status here
    // e.g., await ContentOptimization.findByIdAndUpdate(optimizationId, { status: 'failed', errorMessage: error.message });
  }
}

// Helper function for rule-based content optimization (your existing logic)
function optimizeContentWithRules(content, targetKeywords) {
  let optimized = content

  targetKeywords.forEach((keyword, index) => {
    const keywordRegex = new RegExp(`\\b${keyword}\\b`, "gi")
    const matches = optimized.match(keywordRegex) || []

    const targetDensity = index === 0 ? 0.015 : 0.008
    const wordCount = optimized.split(/\s+/).length
    const targetOccurrences = Math.ceil(wordCount * targetDensity)

    if (matches.length < targetOccurrences) {
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

// Helper function to generate content suggestions (your existing logic)
function generateContentSuggestions(original, optimized, keywords) {
  const suggestions = []

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

  const originalParagraphs = original.split("\n\n").length
  const optimizedParagraphs = optimized.split("\n\n").length

  if (optimizedParagraphs > originalParagraphs) {
    suggestions.push({
      type: "structure",
      suggestion: "Improved content structure with better paragraph breaks",
      applied: true,
    })
  }

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

// Helper function to generate metadata (your existing logic)
function generateMetadata(content, keywords, originalTitle) {
  const primaryKeyword = keywords[0]
  // const contentWords = content.split(/\s+/) // Not used, can be removed

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
