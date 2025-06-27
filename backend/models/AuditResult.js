const mongoose = require("mongoose")

const auditResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    url: {
      type: String,
      required: [true, "Please provide a URL to audit"],
    },
    domain: {
      type: String,
      required: true,
    },
    pageSpeedData: {
      desktop: {
        score: Number,
        fcp: Number, // First Contentful Paint
        lcp: Number, // Largest Contentful Paint
        cls: Number, // Cumulative Layout Shift
        fid: Number, // First Input Delay
        ttfb: Number, // Time to First Byte
      },
      mobile: {
        score: Number,
        fcp: Number,
        lcp: Number,
        cls: Number,
        fid: Number,
        ttfb: Number,
      },
    },
    seoIssues: [
      {
        category: {
          type: String,
          enum: ["critical", "warning", "info"],
        },
        title: String,
        description: String,
        impact: {
          type: String,
          enum: ["high", "medium", "low"],
        },
        suggestion: String,
      },
    ],
    technicalSeo: {
      metaTitle: {
        exists: Boolean,
        length: Number,
        content: String,
      },
      metaDescription: {
        exists: Boolean,
        length: Number,
        content: String,
      },
      headings: {
        h1Count: Number,
        h2Count: Number,
        h3Count: Number,
        structure: [String],
      },
      images: {
        total: Number,
        withoutAlt: Number,
        oversized: Number,
      },
      links: {
        internal: Number,
        external: Number,
        broken: Number,
      },
      schema: {
        exists: Boolean,
        types: [String],
      },
    },
    swotAnalysis: {
      strengths: [String],
      weaknesses: [String],
      opportunities: [String],
      threats: [String],
      generatedBy: {
        type: String,
        enum: ["ai", "rules"],
        default: "rules",
      },
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    recommendations: [
      {
        priority: {
          type: String,
          enum: ["high", "medium", "low"],
        },
        category: String,
        title: String,
        description: String,
        estimatedImpact: String,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
)

// Index for faster queries
auditResultSchema.index({ user: 1, createdAt: -1 })
auditResultSchema.index({ domain: 1 })

module.exports = mongoose.model("AuditResult", auditResultSchema)
