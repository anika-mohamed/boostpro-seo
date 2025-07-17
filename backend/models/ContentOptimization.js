const mongoose = require("mongoose")

const contentOptimizationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User", // Ensure you have a 'User' model defined
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
    timestamps: true, // Adds createdAt and updatedAt fields
  },
)

contentOptimizationSchema.index({ user: 1, createdAt: -1 }) // Index for faster queries

module.exports = mongoose.model("ContentOptimization", contentOptimizationSchema)
