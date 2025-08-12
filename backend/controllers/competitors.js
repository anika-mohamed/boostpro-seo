const CompetitorAnalysis = require("../models/CompetitorAnalysis");
const { validationResult } = require("express-validator");
const { searchCompetitors, analyzeCompetitorContent } = require("../services/competitorService");
const PDFDocument = require('pdfkit');

/**
 * @desc    Starts an analysis of competitors for given keywords.
 * @route   POST /api/competitors/analyze
 */
exports.analyzeCompetitors = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
    }

    const { keywords, userWebsite } = req.body;

    const analysis = await CompetitorAnalysis.create({
      user: req.user.id,
      keywords,
      userWebsite,
      status: 'pending',
    });

    req.user.usage.competitorAnalysesThisMonth = (req.user.usage.competitorAnalysesThisMonth || 0) + 1;
    await req.user.save({ validateBeforeSave: false });

    processCompetitorAnalysis(analysis._id, keywords, userWebsite);

    res.status(202).json({
      success: true,
      message: "Competitor analysis has been accepted and is processing.",
      data: { analysisId: analysis._id, status: 'pending' },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Gets paginated history of competitor analyses.
 * @route   GET /api/competitors/history
 */
exports.getCompetitorHistory = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const total = await CompetitorAnalysis.countDocuments({ user: req.user.id });
    const analyses = await CompetitorAnalysis.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex)
      .select("keywords status summary.totalCompetitors summary.avgCompetitorScore createdAt");

    const pagination = {};
    if (startIndex + limit < total) pagination.next = { page: page + 1, limit };
    if (startIndex > 0) pagination.prev = { page: page - 1, limit };

    res.status(200).json({ success: true, count: analyses.length, total, pagination, data: analyses });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Gets a single competitor analysis by its ID.
 * @route   GET /api/competitors/analysis/:id
 */
exports.getCompetitorAnalysisById = async (req, res, next) => {
  try {
    const analysis = await CompetitorAnalysis.findOne({ _id: req.params.id, user: req.user.id });
    if (!analysis) {
      return res.status(404).json({ success: false, message: "Analysis not found" });
    }
    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generates and downloads a PDF report for a single analysis.
 * @route   GET /api/competitors/analysis/:id/download
 */
exports.downloadCompetitorReport = async (req, res, next) => {
    try {
      const analysis = await CompetitorAnalysis.findOne({ _id: req.params.id, user: req.user.id });
      if (!analysis) {
        return res.status(404).json({ success: false, message: "Analysis not found" });
      }
  
      const doc = new PDFDocument({ margin: 50 });
      const filename = `Competitor-Analysis-${analysis.keywords[0] || 'report'}.pdf`.replace(/\s+/g, '-');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      doc.pipe(res);
  
      doc.fontSize(20).text('Competitor Analysis Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(16).text('Analysis Summary', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Keywords: ${analysis.keywords.join(', ')}`)
         .text(`Competitors Found: ${analysis.summary.totalCompetitors}`)
         .text(`Average Technical Score: ${analysis.summary.avgCompetitorScore}/100`);
      doc.moveDown();
      doc.fontSize(16).text('Competitor Details', { underline: true });
      doc.moveDown();
  
      const tableTop = doc.y;
      doc.fontSize(10).text('Competitor Domain', 50, tableTop, { bold: true })
         .text('Tech Score', 350, tableTop, { bold: true })
         .text('Word Count', 450, tableTop, { bold: true });
      doc.y += 15;
  
      analysis.competitors.forEach(competitor => {
        const rowY = doc.y;
        doc.fontSize(10).text(competitor.domain, 50, rowY, { width: 280 })
           .text(competitor.technicalScore.toString(), 350, rowY)
           .text(competitor.contentLength.toString(), 450, rowY);
        doc.y += 20;
      });
  
      doc.end();
  
    } catch (error) {
      next(error);
    }
};

async function processCompetitorAnalysis(analysisId, keywords, userWebsite) {
  try {
    const analysis = await CompetitorAnalysis.findById(analysisId);
    if (!analysis) {
      console.error(`Analysis ID ${analysisId} not found.`);
      return;
    }
    const competitorUrls = await searchCompetitors(keywords);
    const analysisPromises = competitorUrls.map((url, index) =>
      analyzeCompetitorContent(url, keywords)
        .then(data => data ? { ...data, ranking: index + 1 } : null)
        .catch(error => {
          console.error(`Error analyzing ${url}:`, error.message);
          return null;
        })
    );
    const competitors = (await Promise.all(analysisPromises)).filter(Boolean);
    
    analysis.competitors = competitors;
    analysis.summary = generateCompetitorSummary(competitors);
    analysis.analysis = { gapAnalysis: performGapAnalysis(competitors, keywords) };
    analysis.status = 'completed';

    await analysis.save();
    console.log(`✅ Analysis ${analysisId} completed successfully.`);
  } catch (error) {
    console.error(`❌ Competitor analysis processing error for ${analysisId}:`, error);
    await CompetitorAnalysis.findByIdAndUpdate(analysisId, { status: 'failed' });
  }
}

function generateCompetitorSummary(competitors) {
    const totalCompetitors = competitors.length;
    const avgCompetitorScore = totalCompetitors > 0
      ? Math.round(competitors.reduce((sum, comp) => sum + comp.technicalScore, 0) / totalCompetitors)
      : 0;
    return { totalCompetitors, avgCompetitorScore };
}
// Other helper functions ...
function performGapAnalysis() { return []; }
function findUserSiteRanking() { return null; }
function identifyContentGaps() { return []; }
function identifyOpportunities() { return []; }
function identifyThreats() { return []; }