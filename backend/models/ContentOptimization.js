const mongoose = require("mongoose")

const contentOptimizationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    originalContent: {
      title: String,
      content: {
        type: String,
        required: true,
      },
      wordCount: Number,
    },
    targetKeywords: [
      {
        keyword: String,
        priority: {
          type: String,
          enum: ["primary", "secondary", "tertiary"],
        },
      },
    ],
    optimizedContent: {
      title: String,
      content: String,
      wordCount: Number,
      keywordDensity: [
        {
          keyword: String,
          density: Number,
          count: Number,
        },
      ],
      readabilityScore: Number,
      seoScore: Number,
    },
    suggestions: [
      {
        type: {
          type: String,
          enum: ["keyword", "structure", "readability", "length", "meta"],
        },
        suggestion: String,
        applied: {
          type: Boolean,
          default: false,
        },
      },
    ],
    metadata: {
      suggestedTitle: String,
      suggestedDescription: String,
      suggestedSlug: String,
      suggestedTags: [String],
    },
    performance: {
      beforeScore: Number,
      afterScore: Number,
      improvement: Number,
    },
  },
  {
    timestamps: true,
  },
)

contentOptimizationSchema.index({ user: 1, createdAt: -1 })

module.exports = mongoose.model("ContentOptimization", contentOptimizationSchema)
