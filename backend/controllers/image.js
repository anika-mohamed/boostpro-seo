const { validationResult } = require("express-validator")
const { generateAltTags: generateAltTagsAI } = require("../services/aiService")
const Image = require("../models/image") // your Mongoose model

// @desc Generate SEO-optimized alt tags
// @route POST /api/image/alt-tags
// @access Private (Basic subscription required)
exports.generateAltTags = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { imageDescriptions } = req.body
    let altTags

    if (req.user.subscription.plan === "pro") {
      try {
        altTags = await generateAltTagsAI(imageDescriptions)
      } catch (error) {
        console.error("AI alt tag generation failed:", error.message)
        altTags = generateAltTagsWithRules(imageDescriptions)
      }
    } else {
      altTags = generateAltTagsWithRules(imageDescriptions)
    }

    res.status(200).json({
      success: true,
      message: "Alt tags generated successfully",
      data: {
        originalDescriptions: imageDescriptions,
        optimizedAltTags: altTags,
        count: altTags.length,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc Upload a new image
// @route POST /api/image/upload
// @access Private
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" })
    }

    const imageUrl = `/uploads/${req.file.filename}` // Replace with cloud URL if needed
    const description = req.body.description

    const image = await Image.create({
      userId: req.user.id,
      url: imageUrl,
      description,
      altText: "",
    })

    res.status(201).json({ success: true, data: image })
  } catch (err) {
    next(err)
  }
}

// @desc Get user's recent images without ALT tags
// @route GET /api/image/no-alt
// @access Private
exports.getImagesWithoutAlt = async (req, res, next) => {
  try {
    const images = await Image.find({
      userId: req.user.id,
      $or: [{ altText: null }, { altText: "" }],
    })
      .sort({ createdAt: -1 })
      .limit(15)

    res.status(200).json({
      success: true,
      message: "Images without ALT text retrieved",
      data: images,
    })
  } catch (err) {
    next(err)
  }
}

// @desc Update an image with generated alt text
// @route PATCH /api/image/update-alt/:id
// @access Private
exports.updateAltText = async (req, res, next) => {
  try {
    const { altText } = req.body

    const image = await Image.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { altText },
      { new: true }
    )

    if (!image) {
      return res.status(404).json({ success: false, message: "Image not found" })
    }

    res.status(200).json({ success: true, data: image })
  } catch (err) {
    next(err)
  }
}

// Optional history route if you store them later
exports.getAltTagHistory = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: "Alt tag history retrieved successfully",
      data: [],
    })
  } catch (error) {
    next(error)
  }
}

// Rule-based fallback if not Pro
function generateAltTagsWithRules(descriptions) {
  return descriptions.map((description) => {
    let altTag = description.trim()
    altTag = altTag.charAt(0).toUpperCase() + altTag.slice(1)
    altTag = altTag.replace(/\b(image of|picture of|photo of)\b/gi, "")
    if (altTag.length > 125) altTag = altTag.substring(0, 122) + "..."
    if (altTag.length < 10) altTag = `Detailed view of ${altTag.toLowerCase()}`
    return altTag.trim()
  })
}
