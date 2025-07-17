const mongoose = require("mongoose")

const reportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["summary", "comprehensive"],
    required: true,
  },
  audits: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Audit",
    },
  ],
  filePath: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Index for faster queries
reportSchema.index({ user: 1, createdAt: -1 })

module.exports = mongoose.model("Report", reportSchema)
