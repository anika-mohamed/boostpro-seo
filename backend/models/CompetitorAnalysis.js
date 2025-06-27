const mongoose = require("mongoose")

const competitorAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    keywords: [String],
    userWebsite: String,
    competitors: [
      {
        url: String,
        domain: String,
        title: String,
        metaDescription: String,
        ranking: Number,
        keywordDensity: [
          {
            keyword: String,
            density: Number,
            count: Number,
          },
        ],
        contentLength: Number,
        headingStructure: {
          h1: [String],
          h2: [String],
          h3: [String],
        },
        backlinks: {
          estimated: Number,
          quality: String,
        },
        socialSignals: {
          shares: Number,
          likes: Number,
        },
        technicalScore: Number,
      },
    ],
    analysis: {
      userSiteRanking: Number,
      gapAnalysis: [
        {
          keyword: String,
          userDensity: Number,
          avgCompetitorDensity: Number,
          recommendation: String,
        },
      ],
      contentGaps: [String],
      opportunities: [String],
      threats: [String],
    },
    summary: {
      totalCompetitors: Number,
      avgCompetitorScore: Number,
      userAdvantages: [String],
      improvementAreas: [String],
    },
  },
  {
    timestamps: true,
  },
)

competitorAnalysisSchema.index({ user: 1, createdAt: -1 })

module.exports = mongoose.model("CompetitorAnalysis", competitorAnalysisSchema)
