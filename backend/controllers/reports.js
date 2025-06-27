const AuditResult = require("../models/AuditResult")
const { generatePDFReport } = require("../services/reportService")

// @desc    Generate comprehensive SEO report
// @route   POST /api/reports/generate
// @access  Private (Basic subscription required)
exports.generateReport = async (req, res, next) => {
  try {
    const { auditIds, reportType = "comprehensive" } = req.body

    if (!auditIds || !Array.isArray(auditIds) || auditIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide audit IDs for report generation",
      })
    }

    // Fetch audit results
    const audits = await AuditResult.find({
      _id: { $in: auditIds },
      user: req.user.id,
    })

    if (audits.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No audit results found",
      })
    }

    // Generate report data
    const reportData = {
      user: req.user,
      audits,
      reportType,
      generatedAt: new Date(),
      summary: generateReportSummary(audits),
    }

    res.status(200).json({
      success: true,
      message: "Report generated successfully",
      data: reportData,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Download report as PDF
// @route   GET /api/reports/download/:reportId
// @access  Private
exports.downloadReport = async (req, res, next) => {
  try {
    const { reportId } = req.params

    // In a real implementation, you would fetch the report from database
    // For now, we'll generate a sample PDF
    const audits = await AuditResult.find({
      user: req.user.id,
    }).limit(5)

    if (audits.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No audit data available for report",
      })
    }

    const reportData = {
      user: req.user,
      audits,
      reportType: "comprehensive",
      generatedAt: new Date(),
      summary: generateReportSummary(audits),
    }

    const pdfBuffer = await generatePDFReport(reportData)

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename="seo-report-${Date.now()}.pdf"`)
    res.send(pdfBuffer)
  } catch (error) {
    next(error)
  }
}

// @desc    Get report generation history
// @route   GET /api/reports/history
// @access  Private
exports.getReportHistory = async (req, res, next) => {
  try {
    // This would typically come from a reports database table
    // For now, return mock data
    const history = [
      {
        id: "report_1",
        type: "comprehensive",
        generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        auditCount: 3,
        status: "completed",
      },
      {
        id: "report_2",
        type: "summary",
        generatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        auditCount: 1,
        status: "completed",
      },
    ]

    res.status(200).json({
      success: true,
      data: history,
    })
  } catch (error) {
    next(error)
  }
}

// Helper function to generate report summary
function generateReportSummary(audits) {
  const totalAudits = audits.length
  const avgScore = Math.round(audits.reduce((sum, audit) => sum + (audit.overallScore || 0), 0) / totalAudits)

  const issuesByCategory = {
    critical: 0,
    warning: 0,
    info: 0,
  }

  audits.forEach((audit) => {
    if (audit.seoIssues) {
      audit.seoIssues.forEach((issue) => {
        issuesByCategory[issue.category] = (issuesByCategory[issue.category] || 0) + 1
      })
    }
  })

  return {
    totalAudits,
    avgScore,
    issuesByCategory,
    topIssues: [
      "Mobile performance optimization needed",
      "Meta descriptions missing or too short",
      "Images without alt text",
      "Page loading speed improvements required",
    ],
    recommendations: [
      "Focus on mobile optimization for better rankings",
      "Implement comprehensive meta tag strategy",
      "Optimize images for web performance",
      "Improve server response times",
    ],
  }
}
