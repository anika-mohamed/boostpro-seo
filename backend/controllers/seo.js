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

    const audit = await AuditResult.create({
      user: req.user.id,
      url,
      domain,
      status: "pending",
    })

    console.log("✅ Audit created with ID:", audit._id)

    req.user.usage.auditsThisMonth += 1
    await req.user.save({ validateBeforeSave: false })

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

exports.getAuditHistory = async (req, res, next) => {
  try {
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
      pagination.next = { page: page + 1, limit }
    }
    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit }
    }

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

exports.getAuditById = async (req, res, next) => {
  try {
    const audit = await AuditResult.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!audit) {
      return res.status(404).json({ success: false, message: "Audit not found" })
    }

    res.status(200).json({
      success: true,
      data: audit,
    })
  } catch (error) {
    console.error("❌ Get audit by ID error:", error)
    next(error)
  }
}

exports.generateSwotAnalysis = async (req, res, next) => {
  try {
    const audit = await AuditResult.findOne({
      _id: req.params.auditId,
      user: req.user.id,
    })

    if (!audit) {
      return res.status(404).json({ success: false, message: "Audit not found" })
    }

    if (audit.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Audit must be completed before generating SWOT analysis",
      })
    }

    let swotAnalysis
    if (req.user.subscription.plan === "pro") {
      swotAnalysis = await generateSwotWithAI(audit)
      swotAnalysis.generatedBy = "ai"
    } else {
      swotAnalysis = generateSwotWithRules(audit)
      swotAnalysis.generatedBy = "rules"
    }

    audit.swotAnalysis = swotAnalysis
    await audit.save()

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

exports.deleteAudit = async (req, res, next) => {
  try {
    const audit = await AuditResult.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!audit) {
      return res.status(404).json({ success: false, message: "Audit not found" })
    }

    await audit.deleteOne()

    res.status(200).json({
      success: true,
      message: "Audit deleted successfully",
    })
  } catch (error) {
    console.error("❌ Delete audit error:", error)
    next(error)
  }
}

async function processAudit(auditId, url) {
  try {
    const audit = await AuditResult.findById(auditId)
    if (!audit) {
      console.error("❌ Audit not found during processing:", auditId)
      return
    }

    const pageSpeedData = await performPageSpeedAudit(url)
    const technicalSeoData = await analyzeTechnicalSeo(url)

    if (typeof technicalSeoData.technicalSeo.headings?.structure === "string") {
      try {
        technicalSeoData.technicalSeo.headings.structure = JSON.parse(
          technicalSeoData.technicalSeo.headings.structure
        )
      } catch (err) {
        console.error("❌ Failed to parse headings.structure JSON:", err)
        technicalSeoData.technicalSeo.headings.structure = []
      }
    }

    const overallScore = calculateOverallScore(pageSpeedData, technicalSeoData)
    const recommendations = generateRecommendations(pageSpeedData, technicalSeoData)

    audit.pageSpeedData = pageSpeedData
    audit.technicalSeo = technicalSeoData.technicalSeo
    audit.seoIssues = technicalSeoData.issues
    audit.overallScore = overallScore
    audit.recommendations = recommendations
    audit.status = "completed"

    await audit.save()
  } catch (error) {
    console.error("❌ Audit processing error:", error)
    await AuditResult.findByIdAndUpdate(auditId, { status: "failed" })
  }
}

function calculateOverallScore(pageSpeedData, technicalSeoData) {
  const desktopScore = pageSpeedData.desktop.score || 0
  const mobileScore = pageSpeedData.mobile.score || 0
  const technicalScore = calculateTechnicalScore(technicalSeoData)

  return Math.round((desktopScore + mobileScore + technicalScore) / 3)
}

function calculateTechnicalScore(technicalSeoData) {
  let score = 100
  const { technicalSeo } = technicalSeoData

  if (!technicalSeo.metaTitle.exists) score -= 15
  if (!technicalSeo.metaDescription.exists) score -= 10
  if (technicalSeo.headings.h1Count === 0) score -= 10
  if (technicalSeo.images.withoutAlt > 0) score -= 5

  return Math.max(0, score)
}

function generateRecommendations(pageSpeedData, technicalSeoData) {
  const recommendations = []

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
