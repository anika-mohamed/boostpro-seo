const mongoose = require("mongoose")

const imageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    url: { type: String, required: true },
    altText: { type: String },
    description: { type: String },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Image", imageSchema)
