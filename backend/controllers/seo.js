const AuditResult = require("../models/AuditResult")
const { validationResult } = require("express-validator")
const { performPageSpeedAudit } = require("../services/pageSpeedService")
const { analyzeTechnicalSeo } = require("../services/technicalSeoService")
const { generateSwotWithAI } = require("../services/aiService")
const { generateSwotWithRules } = require("../services/swotService")

// @desc    Audit a website
// @route   POST /api/seo/audit
// @access  Private
exports.auditWebsite = async (req, res, next) => {
  try {
    console.log("🚀 Starting audit for:", req.body.url)

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { url } = req.body
    const domain = new URL(url).hostname

    // Create initial audit record
    const audit = await AuditResult.create({
      user: req.user.id,
      url,
      domain,
      status: "pending",
    })

    console.log("✅ Audit created with ID:", audit._id)

    // Update user usage
    req.user.usage.auditsThisMonth += 1
    await req.user.save({ validateBeforeSave: false })

    // Start audit process (async)
    processAudit(audit._id, url)

    res.status(201).json({
      success: true,
      message: "Audit started successfully",
      data: {
        auditId: audit._id,
        status: "pending",
        estimatedTime: "2-3 minutes",
      },
    })
  } catch (error) {
    console.error("❌ Audit creation error:", error)
    next(error)
  }
}

// @desc    Get audit history
// @route   GET /api/seo/audits
// @access  Private
exports.getAuditHistory = async (req, res, next) => {
  try {
    console.log("📋 Getting audit history for user:", req.user.id)

    const page = Number.parseInt(req.query.page, 10) || 1
    const limit = Number.parseInt(req.query.limit, 10) || 10
    const startIndex = (page - 1) * limit

    const total = await AuditResult.countDocuments({ user: req.user.id })

    const audits = await AuditResult.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex)
      .select("url domain overallScore status createdAt")

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

    console.log(`✅ Found ${audits.length} audits for user`)

    res.status(200).json({
      success: true,
      count: audits.length,
      total,
      pagination,
      data: audits,
    })
  } catch (error) {
    console.error("❌ Get audit history error:", error)
    next(error)
  }
}

// @desc    Get single audit by ID
// @route   GET /api/seo/audits/:id
// @access  Private
exports.getAuditById = async (req, res, next) => {
  try {
    console.log("🔍 Getting audit by ID:", req.params.id, "for user:", req.user.id)

    const audit = await AuditResult.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!audit) {
      console.log("❌ Audit not found")
      return res.status(404).json({
        success: false,
        message: "Audit not found",
      })
    }

    console.log("✅ Audit found, status:", audit.status)

    res.status(200).json({
      success: true,
      data: audit,
    })
  } catch (error) {
    console.error("❌ Get audit by ID error:", error)
    next(error)
  }
}

// @desc    Generate SWOT analysis for an audit
// @route   POST /api/seo/swot/:auditId
// @access  Private (Basic subscription required)
exports.generateSwotAnalysis = async (req, res, next) => {
  try {
    console.log("🧠 Generating SWOT for audit:", req.params.auditId)

    const audit = await AuditResult.findOne({
      _id: req.params.auditId,
      user: req.user.id,
    })

    if (!audit) {
      return res.status(404).json({
        success: false,
        message: "Audit not found",
      })
    }

    if (audit.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Audit must be completed before generating SWOT analysis",
      })
    }

    let swotAnalysis

    // Use AI for pro users, rules for basic users
    if (req.user.subscription.plan === "pro") {
      console.log("🤖 Using AI SWOT analysis")
      swotAnalysis = await generateSwotWithAI(audit)
      swotAnalysis.generatedBy = "ai"
    } else {
      console.log("📋 Using rule-based SWOT analysis")
      swotAnalysis = generateSwotWithRules(audit)
      swotAnalysis.generatedBy = "rules"
    }

    // Update audit with SWOT analysis
    audit.swotAnalysis = swotAnalysis
    await audit.save()

    console.log("✅ SWOT analysis generated successfully")

    res.status(200).json({
      success: true,
      message: "SWOT analysis generated successfully",
      data: swotAnalysis,
    })
  } catch (error) {
    console.error("❌ SWOT generation error:", error)
    next(error)
  }
}

// @desc    Delete an audit
// @route   DELETE /api/seo/audits/:id
// @access  Private
exports.deleteAudit = async (req, res, next) => {
  try {
    console.log("🗑️ Deleting audit:", req.params.id)

    const audit = await AuditResult.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!audit) {
      return res.status(404).json({
        success: false,
        message: "Audit not found",
      })
    }

    await audit.deleteOne()

    console.log("✅ Audit deleted successfully")

    res.status(200).json({
      success: true,
      message: "Audit deleted successfully",
    })
  } catch (error) {
    console.error("❌ Delete audit error:", error)
    next(error)
  }
}

// Helper function to process audit asynchronously
async function processAudit(auditId, url) {
  try {
    console.log("🔄 Processing audit:", auditId, "for URL:", url)

    const audit = await AuditResult.findById(auditId)
    if (!audit) {
      console.error("❌ Audit not found during processing:", auditId)
      return
    }

    // Perform PageSpeed audit
    console.log("📊 Running PageSpeed audit...")
    const pageSpeedData = await performPageSpeedAudit(url)

    // Perform technical SEO analysis
    console.log("🔧 Running technical SEO analysis...")
    const technicalSeoData = await analyzeTechnicalSeo(url)

    // Calculate overall score
    const overallScore = calculateOverallScore(pageSpeedData, technicalSeoData)

    // Generate recommendations
    const recommendations = generateRecommendations(pageSpeedData, technicalSeoData)

    // Update audit with results
    audit.pageSpeedData = pageSpeedData
    audit.technicalSeo = technicalSeoData.technicalSeo
    audit.seoIssues = technicalSeoData.issues
    audit.overallScore = overallScore
    audit.recommendations = recommendations
    audit.status = "completed"

    await audit.save()

    console.log("✅ Audit processing completed successfully:", auditId)
  } catch (error) {
    console.error("❌ Audit processing error:", error)

    // Update audit status to failed
    await AuditResult.findByIdAndUpdate(auditId, {
      status: "failed",
    })
  }
}

// Helper function to calculate overall score
function calculateOverallScore(pageSpeedData, technicalSeoData) {
  const desktopScore = pageSpeedData.desktop.score || 0
  const mobileScore = pageSpeedData.mobile.score || 0
  const technicalScore = calculateTechnicalScore(technicalSeoData)

  return Math.round((desktopScore + mobileScore + technicalScore) / 3)
}

// Helper function to calculate technical SEO score
function calculateTechnicalScore(technicalSeoData) {
  let score = 100
  const { technicalSeo } = technicalSeoData

  // Deduct points for missing elements
  if (!technicalSeo.metaTitle.exists) score -= 15
  if (!technicalSeo.metaDescription.exists) score -= 10
  if (technicalSeo.headings.h1Count === 0) score -= 10
  if (technicalSeo.images.withoutAlt > 0) score -= 5

  return Math.max(0, score)
}

// Helper function to generate recommendations
function generateRecommendations(pageSpeedData, technicalSeoData) {
  const recommendations = []

  // PageSpeed recommendations
  if (pageSpeedData.desktop.score < 90) {
    recommendations.push({
      priority: "high",
      category: "Performance",
      title: "Improve Desktop Performance",
      description:
        "Your desktop performance score is below optimal. Focus on optimizing images, minifying CSS/JS, and leveraging browser caching.",
      estimatedImpact: "High - Can improve user experience and search rankings",
    })
  }

  if (pageSpeedData.mobile.score < 90) {
    recommendations.push({
      priority: "high",
      category: "Performance",
      title: "Improve Mobile Performance",
      description:
        "Your mobile performance needs improvement. Consider implementing AMP, optimizing images for mobile, and reducing server response time.",
      estimatedImpact: "High - Critical for mobile-first indexing",
    })
  }

  // Technical SEO recommendations
  const { technicalSeo } = technicalSeoData

  if (!technicalSeo.metaTitle.exists) {
    recommendations.push({
      priority: "high",
      category: "Technical SEO",
      title: "Add Meta Title",
      description: "Your page is missing a meta title. Add a descriptive, keyword-rich title tag.",
      estimatedImpact: "High - Essential for search engine rankings",
    })
  }

  if (!technicalSeo.metaDescription.exists) {
    recommendations.push({
      priority: "medium",
      category: "Technical SEO",
      title: "Add Meta Description",
      description: "Add a compelling meta description to improve click-through rates from search results.",
      estimatedImpact: "Medium - Improves CTR and user engagement",
    })
  }

  return recommendations
}
