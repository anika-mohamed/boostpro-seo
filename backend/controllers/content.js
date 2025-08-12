const ContentOptimization = require("../models/ContentOptimization")
const { validationResult } = require("express-validator")
const { optimizeContentWithAI, optimizeContentBasic } = require("../services/aiService")
const { analyzeContent } = require("../services/contentService")

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

    // Ensure req.user is available from your 'protect' middleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, user not found",
      })
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
      optimizedContent: {
        title: "",
        content: "",
        wordCount: 0,
        keywordDensity: [],
        readabilityScore: 0,
        seoScore: 0,
      },
      suggestions: [],
      metadata: {},
      performance: {
        beforeScore: originalAnalysis.seoScore,
        afterScore: 0,
        improvement: 0,
      },
      status: "processing",
    })

    // Update user usage if available
    if (req.user.usage) {
      req.user.usage.contentOptimizationsThisMonth = (req.user.usage.contentOptimizationsThisMonth || 0) + 1
      await req.user.save({ validateBeforeSave: false })
    }

    // Start content regeneration process (async)
    processContentRegeneration(optimization._id, content, targetKeywords, title).catch(console.error)

    res.status(201).json({
      success: true,
      message: "Content regeneration started successfully",
      data: {
        optimizationId: optimization._id,
        originalAnalysis,
        estimatedTime: "2-3 minutes",
      },
    })
  } catch (error) {
    console.error("Content optimization error:", error)
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
      return res.status(401).json({
        success: false,
        message: "Not authorized, user not found",
      })
    }

    const total = await ContentOptimization.countDocuments({ user: req.user.id })

    const optimizations = await ContentOptimization.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex)
      .select("originalContent.title targetKeywords performance.beforeScore performance.afterScore createdAt status")

    res.status(200).json({
      success: true,
      count: optimizations.length,
      total,
      data: optimizations,
    })
  } catch (error) {
    console.error("Get content history error:", error)
    next(error)
  }
}

// @desc    Get single content optimization by ID
// @route   GET /api/content/:id
// @access  Private
exports.getContentById = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, user not found",
      })
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
    console.error("Get content by ID error:", error)
    next(error)
  }
}

// Helper function to process content regeneration asynchronously
async function processContentRegeneration(optimizationId, originalContent, targetKeywords, title) {
  try {
    const optimization = await ContentOptimization.findById(optimizationId)
    if (!optimization) {
      console.error(`Optimization record ${optimizationId} not found.`)
      return
    }

    // Populate user to check subscription plan
    await optimization.populate("user")
    const userPlan = optimization.user?.subscription?.plan || "basic"

    let regeneratedContent = originalContent
    let usedAI = false

    console.log(`Starting content regeneration for optimization ${optimizationId}...`)

    // Always try to regenerate content (not just optimize existing)
    try {
      if (userPlan === "pro" || userPlan === "premium") {
        // Use advanced AI regeneration for pro/premium users
        regeneratedContent = await optimizeContentWithAI(originalContent, targetKeywords, title)
        usedAI = true
        console.log("Used AI content regeneration")
      } else {
        // Use basic content regeneration for free/basic users
        regeneratedContent = optimizeContentBasic(originalContent, targetKeywords)
        console.log("Used basic content regeneration")
      }
    } catch (error) {
      console.error("Content regeneration failed, using fallback:", error.message)
      regeneratedContent = optimizeContentBasic(originalContent, targetKeywords)
    }

    // Analyze regenerated content
    const optimizedAnalysis = analyzeContent(regeneratedContent, targetKeywords)

    // Generate suggestions based on regeneration
    const suggestions = generateRegenerationSuggestions(originalContent, regeneratedContent, targetKeywords, usedAI)

    // Generate metadata
    const metadata = generateMetadata(regeneratedContent, targetKeywords, title)

    // Update optimization record
    optimization.optimizedContent = {
      title: metadata.suggestedTitle,
      content: regeneratedContent,
      wordCount: regeneratedContent.split(/\s+/).length,
      keywordDensity: optimizedAnalysis.keywordDensity,
      readabilityScore: optimizedAnalysis.readabilityScore,
      seoScore: optimizedAnalysis.seoScore,
    }
    optimization.suggestions = suggestions
    optimization.metadata = metadata
    optimization.performance.afterScore = optimizedAnalysis.seoScore
    optimization.performance.improvement = optimizedAnalysis.seoScore - optimization.performance.beforeScore
    optimization.status = "completed"

    await optimization.save()
    console.log(`Content regeneration ${optimizationId} completed successfully.`)
  } catch (error) {
    console.error(`Content regeneration processing error for ID ${optimizationId}:`, error)

    // Update optimization record with error status
    try {
      await ContentOptimization.findByIdAndUpdate(optimizationId, {
        status: "failed",
        errorMessage: error.message,
      })
    } catch (updateError) {
      console.error("Failed to update optimization with error status:", updateError)
    }
  }
}

// Helper function to generate suggestions for regenerated content
function generateRegenerationSuggestions(original, regenerated, keywords, usedAI = false) {
  const suggestions = []

  // Content regeneration suggestions
  suggestions.push({
    type: "regeneration",
    suggestion: `Content has been completely rewritten and optimized for SEO while maintaining the original meaning and intent.`,
    applied: true,
  })

  // Keyword integration suggestions
  keywords.forEach((keyword, index) => {
    const originalMatches = (
      original.match(new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi")) || []
    ).length
    const regeneratedMatches = (
      regenerated.match(new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi")) || []
    ).length

    if (regeneratedMatches > originalMatches) {
      suggestions.push({
        type: "keyword",
        suggestion: `Enhanced "${keyword}" usage from ${originalMatches} to ${regeneratedMatches} occurrences for better SEO targeting`,
        applied: true,
      })
    }
  })

  // Structure improvements
  const originalParagraphs = original.split(/\n\s*\n/).length
  const regeneratedParagraphs = regenerated.split(/\n\s*\n/).length

  if (regeneratedParagraphs > originalParagraphs) {
    suggestions.push({
      type: "structure",
      suggestion: `Improved content structure with ${regeneratedParagraphs} well-organized sections for better readability`,
      applied: true,
    })
  }

  // Length optimization
  const originalWords = original.split(/\s+/).length
  const regeneratedWords = regenerated.split(/\s+/).length

  if (regeneratedWords > originalWords) {
    suggestions.push({
      type: "length",
      suggestion: `Expanded content from ${originalWords} to ${regeneratedWords} words for better search engine rankings`,
      applied: true,
    })
  }

  // SEO enhancements
  suggestions.push({
    type: "seo",
    suggestion: "Added semantic keywords and LSI terms to improve topical relevance and search visibility",
    applied: true,
  })

  suggestions.push({
    type: "readability",
    suggestion: "Optimized sentence structure and paragraph flow for better user engagement",
    applied: true,
  })

  if (usedAI) {
    suggestions.push({
      type: "ai",
      suggestion:
        "Content was regenerated using advanced AI algorithms for natural keyword integration and improved flow",
      applied: true,
    })
  }

  // Additional recommendations
  suggestions.push({
    type: "meta",
    suggestion: "Consider adding internal and external links to boost SEO authority and user experience",
    applied: false,
  })

  suggestions.push({
    type: "images",
    suggestion: "Add relevant images with optimized alt text containing your target keywords",
    applied: false,
  })

  return suggestions
}

// Helper function to generate metadata
function generateMetadata(content, keywords, originalTitle) {
  const primaryKeyword = keywords[0]
  const contentPreview = content.replace(/\s+/g, " ").trim().substring(0, 150)

  // Generate more compelling titles
  const titleTemplates = [
    `${primaryKeyword} - Complete Guide and Best Practices`,
    `Ultimate ${primaryKeyword} Guide: Everything You Need to Know`,
    `Master ${primaryKeyword}: Expert Tips and Strategies`,
    `${primaryKeyword} Explained: A Comprehensive Guide`,
    `The Complete ${primaryKeyword} Handbook for Success`,
  ]

  const selectedTitle = originalTitle || titleTemplates[Math.floor(Math.random() * titleTemplates.length)]

  return {
    suggestedTitle: selectedTitle,
    suggestedDescription: `Discover everything about ${primaryKeyword}. ${contentPreview}... Learn proven strategies and best practices.`,
    suggestedSlug: primaryKeyword
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
    suggestedTags: [
      ...keywords,
      `${primaryKeyword} guide`,
      `${primaryKeyword} tips`,
      `${primaryKeyword} strategies`,
      `${primaryKeyword} best practices`,
      "SEO optimized",
      "comprehensive guide",
      "expert advice",
    ].slice(0, 12), // Limit to 12 tags
  }
}
