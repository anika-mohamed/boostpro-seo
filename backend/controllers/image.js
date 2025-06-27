const { validationResult } = require("express-validator")
const { generateAltTags: generateAltTagsAI } = require("../services/aiService")

// @desc    Generate SEO-optimized alt tags
// @route   POST /api/image/alt-tags
// @access  Private (Basic subscription required)
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

    // Use AI for pro users, rule-based for others
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

// @desc    Get alt tag generation history
// @route   GET /api/image/alt-tags/history
// @access  Private
exports.getAltTagHistory = async (req, res, next) => {
  try {
    // This would typically come from a database
    // For now, return empty array as we're not storing history
    res.status(200).json({
      success: true,
      message: "Alt tag history retrieved successfully",
      data: [],
    })
  } catch (error) {
    next(error)
  }
}

// Helper function for rule-based alt tag generation
function generateAltTagsWithRules(descriptions) {
  return descriptions.map((description) => {
    // Clean up the description
    let altTag = description.trim()

    // Ensure it starts with a capital letter
    altTag = altTag.charAt(0).toUpperCase() + altTag.slice(1)

    // Remove redundant words
    altTag = altTag.replace(/\b(image of|picture of|photo of)\b/gi, "")

    // Ensure it's under 125 characters
    if (altTag.length > 125) {
      altTag = altTag.substring(0, 122) + "..."
    }

    // Add descriptive words if too short
    if (altTag.length < 10) {
      altTag = `Detailed view of ${altTag.toLowerCase()}`
    }

    return altTag.trim()
  })
}
