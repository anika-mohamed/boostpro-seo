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

    // Perform gap analysis
    const gapAnalysis = performGapAnalysis(competitors, keywords, userWebsite)

    // Generate summary
    const summary = generateCompetitorSummary(competitors, gapAnalysis)

    // Update analysis with results
    analysis.competitors = competitors
    analysis.analysis = {
      userSiteRanking: findUserSiteRanking(competitors, userWebsite),
      gapAnalysis,
      contentGaps: identifyContentGaps(competitors),
      opportunities: identifyOpportunities(competitors, keywords),
      threats: identifyThreats(competitors),
    }
    analysis.summary = summary

    await analysis.save()
  } catch (error) {
    console.error("Competitor analysis processing error:", error)
    // Could update analysis status to failed here
  }
}

// Helper functions
function performGapAnalysis(competitors, keywords, userWebsite) {
  const gapAnalysis = []

  keywords.forEach((keyword) => {
    const competitorDensities = competitors
      .map((comp) => {
        const keywordData = comp.keywordDensity.find((kd) => kd.keyword.toLowerCase() === keyword.toLowerCase())
        return keywordData ? keywordData.density : 0
      })
      .filter((density) => density > 0)

    const avgCompetitorDensity =
      competitorDensities.length > 0
        ? competitorDensities.reduce((sum, density) => sum + density, 0) / competitorDensities.length
        : 0

    gapAnalysis.push({
      keyword,
      userDensity: 0, // Would need to analyze user's site
      avgCompetitorDensity,
      recommendation:
        avgCompetitorDensity > 0
          ? `Consider increasing keyword density to ${Math.round(avgCompetitorDensity * 100) / 100}%`
          : "Keyword not commonly used by competitors - opportunity for differentiation",
    })
  })

  return gapAnalysis
}

function generateCompetitorSummary(competitors, gapAnalysis) {
  const totalCompetitors = competitors.length
  const avgCompetitorScore =
    competitors.length > 0
      ? Math.round(competitors.reduce((sum, comp) => sum + comp.technicalScore, 0) / competitors.length)
      : 0

  return {
    totalCompetitors,
    avgCompetitorScore,
    userAdvantages: [
      "Opportunity to optimize for underused keywords",
      "Potential for better technical SEO implementation",
    ],
    improvementAreas: gapAnalysis.map((gap) => gap.recommendation).slice(0, 3),
  }
}

function findUserSiteRanking(competitors, userWebsite) {
  if (!userWebsite) return null

  const userDomain = new URL(userWebsite).hostname
  const userCompetitor = competitors.find((comp) => comp.domain === userDomain)
  return userCompetitor ? userCompetitor.ranking : null
}

function identifyContentGaps(competitors) {
  const commonTopics = []
  // This would analyze competitor content for common topics
  // For now, return sample gaps
  return [
    "How-to guides and tutorials",
    "Comparison articles",
    "Industry news and updates",
    "Case studies and success stories",
  ]
}

function identifyOpportunities(competitors, keywords) {
  return [
    "Target long-tail variations of main keywords",
    "Create more comprehensive content than competitors",
    "Improve page loading speed for better user experience",
    "Implement better internal linking structure",
  ]
}

function identifyThreats(competitors) {
  return [
    "High competition for target keywords",
    "Competitors with strong domain authority",
    "Well-established brands in the space",
    "Competitors with better technical SEO",
  ]
}
