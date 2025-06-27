// models/AuditResult.js
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
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    pageSpeedData: {
      desktop: {
        score: Number,
        fcp: Number,
        lcp: Number,
        cls: Number,
        fid: Number,
        ttfb: Number,
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
    technicalSeo: {
      metaTitle: {
        exists: Boolean,
        length: Number,
        content: String,
        isOptimal: Boolean,
      },
      metaDescription: {
        exists: Boolean,
        length: Number,
        content: String,
        isOptimal: Boolean,
      },
      headings: {
        h1Count: Number,
        h2Count: Number,
        h3Count: Number,
        h4Count: Number,
        h5Count: Number,
        h6Count: Number,
        h1Text: [String],
        structure: [
          {
            tag: String,
            text: String,
          },
        ],
      },
      images: {
        total: Number,
        withoutAlt: Number,
        withEmptyAlt: Number,
        oversized: Number,
        missingAltImages: [String],
      },
      links: {
        internal: Number,
        external: Number,
        broken: Number,
        externalDomains: [String],
      },
      schema: {
        exists: Boolean,
        types: [String],
        schemas: [
          {
            type: String,
            context: String,
          },
        ],
      },
      canonicalUrl: {
        exists: Boolean,
        url: String,
      },
      robotsMeta: {
        exists: Boolean,
        content: String,
        isIndexable: Boolean,
      },
      openGraph: {
        exists: Boolean,
        tags: mongoose.Schema.Types.Mixed,
        hasTitle: Boolean,
        hasDescription: Boolean,
        hasImage: Boolean,
      },
      twitterCard: {
        exists: Boolean,
        tags: mongoose.Schema.Types.Mixed,
        hasCard: Boolean,
        hasTitle: Boolean,
        hasDescription: Boolean,
      },
    },
    seoIssues: [
      {
        category: String,
        title: String,
        description: String,
        impact: String,
        suggestion: String,
      },
    ],
    overallScore: {
      type: Number,
    },
    recommendations: [
      {
        priority: String,
        category: String,
        title: String,
        description: String,
        estimatedImpact: String,
      },
    ],
    swotAnalysis: {
      strengths: [String],
      weaknesses: [String],
      opportunities: [String],
      threats: [String],
      generatedBy: String, // "ai" or "rules"
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("AuditResult", auditResultSchema)
