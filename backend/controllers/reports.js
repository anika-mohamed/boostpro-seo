const Report = require("../models/Report")
const Audit = require("../models/Audit")
const { generatePDFReport } = require("../services/reportService")
const fs = require("fs")
const path = require("path")

exports.generateReport = async (req, res) => {
  try {
    const { auditIds, reportType = "comprehensive" } = req.body

    if (!auditIds || !Array.isArray(auditIds) || auditIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one audit ID",
      })
    }

    // Fetch all selected audits with full data
    const audits = await Audit.find({
      _id: { $in: auditIds },
      user: req.user._id,
    }).lean()

    if (audits.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No audits found",
      })
    }

    // Calculate summary statistics
    const totalAudits = audits.length
    const avgScore = Math.round(audits.reduce((sum, audit) => sum + (audit.overallScore || 0), 0) / totalAudits)

    // Categorize issues from all audits
    const issuesByCategory = { critical: 0, warning: 0, info: 0 }
    const allIssues = []
    const allRecommendations = []

    audits.forEach((audit) => {
      if (audit.seoIssues) {
        audit.seoIssues.forEach((issue) => {
          issuesByCategory[issue.category] = (issuesByCategory[issue.category] || 0) + 1
          allIssues.push({
            ...issue,
            url: audit.url,
            auditDate: audit.createdAt,
          })
        })
      }

      if (audit.recommendations) {
        audit.recommendations.forEach((rec) => {
          allRecommendations.push({
            ...rec,
            url: audit.url,
            auditDate: audit.createdAt,
          })
        })
      }
    })

    // Get top issues (most frequent)
    const issueFrequency = {}
    allIssues.forEach((issue) => {
      const key = issue.title
      issueFrequency[key] = (issueFrequency[key] || 0) + 1
    })

    const topIssues = Object.entries(issueFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([issue]) => issue)

    // Get top recommendations
    const topRecommendations = allRecommendations
      .filter((rec) => rec.priority === "high")
      .slice(0, 10)
      .map((rec) => rec.title)

    // Create report data structure
    const reportData = {
      user: {
        name: req.user.name,
        email: req.user.email,
      },
      audits: audits.map((audit) => ({
        _id: audit._id,
        url: audit.url,
        domain: audit.domain,
        overallScore: audit.overallScore,
        createdAt: audit.createdAt,
        status: audit.status,
        pageSpeedData: audit.pageSpeedData,
        technicalSeo: audit.technicalSeo,
        seoIssues: audit.seoIssues,
        recommendations: audit.recommendations,
        swotAnalysis: audit.swotAnalysis,
      })),
      reportType,
      generatedAt: new Date().toISOString(),
      summary: {
        totalAudits,
        avgScore,
        issuesByCategory,
        topIssues,
        recommendations: topRecommendations,
      },
    }

    // Generate PDF buffer
    const pdfBuffer = await generatePDFReport(reportData)

    // Create reports directory if it doesn't exist
    const reportsDir = path.join(__dirname, "..", "reports")
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }

    // Save PDF to file system
    const filename = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.pdf`
    const filePath = path.join(reportsDir, filename)
    fs.writeFileSync(filePath, pdfBuffer)

    // Save report record to database
    const newReport = await Report.create({
      user: req.user._id,
      type: reportType,
      audits: auditIds,
      filePath: filePath,
      filename: filename,
      createdAt: new Date(),
    })

    res.status(201).json({
      success: true,
      data: {
        ...reportData,
        reportId: newReport._id,
      },
    })
  } catch (error) {
    console.error("Error generating report:", error)
    res.status(500).json({
      success: false,
      message: "Failed to generate report. Please try again.",
    })
  }
}

exports.downloadReport = async (req, res) => {
  try {
    const { reportId } = req.params

    // Find the report
    const report = await Report.findOne({
      _id: reportId,
      user: req.user._id,
    })

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      })
    }

    // Check if file exists
    if (!fs.existsSync(report.filePath)) {
      return res.status(404).json({
        success: false,
        message: "Report file not found. Please regenerate the report.",
      })
    }

    // Set proper headers for PDF download
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename="${report.filename || "seo-report.pdf"}"`)
    res.setHeader("Cache-Control", "no-cache")

    // Stream the file
    const fileStream = fs.createReadStream(report.filePath)
    fileStream.pipe(res)

    fileStream.on("error", (error) => {
      console.error("File stream error:", error)
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Error downloading report",
        })
      }
    })
  } catch (error) {
    console.error("Download error:", error)
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Server error during download",
      })
    }
  }
}

exports.getReportHistory = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("type createdAt filename")

    res.json({
      success: true,
      reports: reports.map((report) => ({
        id: report._id,
        type: report.type,
        generatedAt: report.createdAt,
        filename: report.filename,
      })),
    })
  } catch (error) {
    console.error("Error fetching report history:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch report history",
    })
  }
}
