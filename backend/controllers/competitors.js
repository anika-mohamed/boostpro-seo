const CompetitorAnalysis = require("../models/CompetitorAnalysis")
const { validationResult } = require("express-validator")
const { searchCompetitors, analyzeCompetitorContent } = require("../services/competitorService")

// @desc    Analyze competitors for given keywords
// @route   POST /api/competitors/analyze
// @access  Private (Basic subscription required)
exports.analyzeCompetitors = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { keywords, userWebsite } = req.body

    // Create initial analysis record
    const analysis = await CompetitorAnalysis.create({
      user: req.user.id,
      keywords,
      userWebsite,
      competitors: [],
      analysis: {},
      summary: {},
    })

    // Update user usage (add this field to User model if not exists)
    if (!req.user.usage.competitorAnalysesThisMonth) {
      req.user.usage.competitorAnalysesThisMonth = 0
    }
    req.user.usage.competitorAnalysesThisMonth += 1
    await req.user.save({ validateBeforeSave: false })

    // Start competitor analysis process (async)
    processCompetitorAnalysis(analysis._id, keywords, userWebsite)

    res.status(201).json({
      success: true,
      message: "Competitor analysis started successfully",
      data: {
        analysisId: analysis._id,
        keywords,
        estimatedTime: "3-5 minutes",
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get competitor analysis history
// @route   GET /api/competitors/history
// @access  Private
exports.getCompetitorHistory = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page, 10) || 1
    const limit = Number.parseInt(req.query.limit, 10) || 10
    const startIndex = (page - 1) * limit

    const total = await CompetitorAnalysis.countDocuments({ user: req.user.id })

    const analyses = await CompetitorAnalysis.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex)
      .select("keywords userWebsite summary.totalCompetitors summary.avgCompetitorScore createdAt")

    const pagination = {}

    if (startIndex + limit < total) {
      pagination.next = {
        page: page + 1,
        limit,
      }
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      }
    }

    res.status(200).json({
      success: true,
      count: analyses.length,
      total,
      pagination,
      data: analyses,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single competitor analysis by ID
// @route   GET /api/competitors/analysis/:id
// @access  Private
exports.getCompetitorAnalysisById = async (req, res, next) => {
  try {
    const analysis = await CompetitorAnalysis.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Competitor analysis not found",
      })
    }

    res.status(200).json({
      success: true,
      data: analysis,
    })
  } catch (error) {
    next(error)
  }
}

// Helper function to process competitor analysis asynchronously
async function processCompetitorAnalysis(analysisId, keywords, userWebsite) {
  try {
    const analysis = await CompetitorAnalysis.findById(analysisId)

    // Search for competitors using Google Custom Search API
    const competitorUrls = await searchCompetitors(keywords)

    // Analyze each competitor
    const competitors = []
    for (let i = 0; i < Math.min(competitorUrls.length, 10); i++) {
      const url = competitorUrls[i]
      try {
        const competitorData = await analyzeCompetitorContent(url, keywords)
        competitors.push({
          ...competitorData,
          ranking: i + 1,
        })
      } catch (error) {
        console.error(`Error analyzing competitor ${url}:`, error.message)
      }
    }

    // Analyze user website
    const userData = await analyzeUserWebsite(userWebsite, keywords)

    // Perform gap analysis with user data
    const gapAnalysis = performGapAnalysis(competitors, keywords, userData)

    // Generate summary with user data
    const summary = generateCompetitorSummary(competitors, gapAnalysis, userData)

    // Update analysis with results
    analysis.competitors = competitors
    analysis.analysis = {
      userSiteRanking: findUserSiteRanking(competitors, userWebsite),
      gapAnalysis,
      contentGaps: identifyContentGaps(competitors),
      opportunities: identifyOpportunities(competitors, keywords),
      threats: identifyThreats(competitors),
      userData, // add user data for frontend use
    }
    analysis.summary = summary

    await analysis.save()
  } catch (error) {
    console.error("Competitor analysis processing error:", error)
    // Optionally update analysis status to failed here
  }
}

// Analyze user's website like competitors
async function analyzeUserWebsite(userWebsite, keywords) {
  if (!userWebsite) return null
  try {
    const userData = await analyzeCompetitorContent(userWebsite, keywords)
    return userData
  } catch (error) {
    console.error("Error analyzing user website:", error.message)
    return null
  }
}

// Perform keyword gap analysis comparing user vs competitors
function performGapAnalysis(competitors, keywords, userData) {
  const gapAnalysis = []

  keywords.forEach((keyword) => {
    const competitorDensities = competitors
      .map((comp) => {
        const kd = comp.keywordDensity.find((kd) => kd.keyword.toLowerCase() === keyword.toLowerCase())
        return kd ? kd.density : 0
      })
      .filter((density) => density > 0)

    const avgCompetitorDensity =
      competitorDensities.length > 0
        ? competitorDensities.reduce((sum, density) => sum + density, 0) / competitorDensities.length
        : 0

    // Get user density for this keyword if available
    let userDensity = 0
    if (userData) {
      const userKd = userData.keywordDensity.find((kd) => kd.keyword.toLowerCase() === keyword.toLowerCase())
      userDensity = userKd ? userKd.density : 0
    }

    let recommendation = ""
    if (userDensity < avgCompetitorDensity) {
      recommendation = `Consider increasing keyword density to ${Math.round(avgCompetitorDensity * 100) / 100}%`
    } else {
      recommendation = "Keyword density is competitive or above average"
    }

    gapAnalysis.push({
      keyword,
      userDensity,
      avgCompetitorDensity,
      recommendation,
    })
  })

  return gapAnalysis
}

// Generate summary including user advantages and improvement areas
function generateCompetitorSummary(competitors, gapAnalysis, userData) {
  const totalCompetitors = competitors.length
  const avgCompetitorScore =
    competitors.length > 0
      ? Math.round(competitors.reduce((sum, comp) => sum + comp.technicalScore, 0) / competitors.length)
      : 0

  const userAdvantages = []
  const improvementAreas = gapAnalysis
    .filter((gap) => gap.userDensity < gap.avgCompetitorDensity)
    .map((gap) => gap.recommendation)
    .slice(0, 3)

  if (userData) {
    if (userData.technicalScore > avgCompetitorScore) {
      userAdvantages.push("Better technical SEO score than average competitors")
    }
    // Add more logic here for other advantages if needed
  }

  return {
    totalCompetitors,
    avgCompetitorScore,
    userAdvantages,
    improvementAreas,
  }
}

// Find user's site ranking in competitor list
function findUserSiteRanking(competitors, userWebsite) {
  if (!userWebsite) return null

  const userDomain = new URL(userWebsite).hostname
  const userCompetitor = competitors.find((comp) => comp.domain === userDomain)
  return userCompetitor ? userCompetitor.ranking : null
}

// Placeholder - analyze competitor content for common topics (expand as needed)
function identifyContentGaps(competitors) {
  return [
    "How-to guides and tutorials",
    "Comparison articles",
    "Industry news and updates",
    "Case studies and success stories",
  ]
}

// Placeholder - opportunities to suggest
function identifyOpportunities(competitors, keywords) {
  return [
    "Target long-tail variations of main keywords",
    "Create more comprehensive content than competitors",
    "Improve page loading speed for better user experience",
    "Implement better internal linking structure",
  ]
}

// Placeholder - potential threats to highlight
function identifyThreats(competitors) {
  return [
    "High competition for target keywords",
    "Competitors with strong domain authority",
    "Well-established brands in the space",
    "Competitors with better technical SEO",
  ]
}
