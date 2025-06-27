const mongoose = require("mongoose")

const keywordResearchSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    seedKeyword: {
      type: String,
      required: true,
    },
    suggestions: [
      {
        keyword: String,
        searchVolume: Number,
        competition: {
          type: String,
          enum: ["low", "medium", "high"],
        },
        cpc: Number, // Cost per click
        difficulty: Number, // 0-100
        trend: {
          direction: {
            type: String,
            enum: ["up", "down", "stable"],
          },
          data: [Number], // Last 12 months data
        },
        relatedQueries: [String],
      },
    ],
    trendData: {
      timeframe: String,
      region: String,
      data: [
        {
          date: Date,
          value: Number,
        },
      ],
    },
    cached: {
      type: Boolean,
      default: false,
    },
    cacheExpiry: Date,
  },
  {
    timestamps: true,
  },
)

// Index for caching
keywordResearchSchema.index({ seedKeyword: 1, createdAt: -1 })
keywordResearchSchema.index({ cacheExpiry: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.model("KeywordResearch", keywordResearchSchema)
