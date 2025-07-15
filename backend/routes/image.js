const express = require("express")
const { body } = require("express-validator")
const multer = require("multer")
const path = require("path")
const fs = require("fs")

const {
  generateAltTags,
  getAltTagHistory,
  getImagesWithoutAlt,
  updateAltText,
  uploadImage,
} = require("../controllers/image")

const { protect, checkSubscription } = require("../middleware/auth")

const router = express.Router()

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "..", "public/uploads")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`
    cb(null, uniqueName)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    if (extname && mimetype) {
      cb(null, true)
    } else {
      cb(new Error("Only JPEG, PNG, and WEBP images are allowed"))
    }
  },
})

// Protect all routes below
router.use(protect)

// Upload image route
router.post("/upload", upload.single("image"), uploadImage)

// Validation for alt tag generation
const altTagValidation = [
  body("imageDescriptions").isArray({ min: 1, max: 10 }).withMessage("Please provide 1–10 descriptions"),
  body("imageDescriptions.*")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Each description must be 5–200 characters"),
]

// Generate ALT tags (subscription required)
router.post("/alt-tags", altTagValidation, checkSubscription("basic"), generateAltTags)

// Get alt tag history
router.get("/alt-tags/history", getAltTagHistory)

// Get images without alt text
router.get("/no-alt", getImagesWithoutAlt)

// Update alt text for an image
router.patch("/update-alt/:id", updateAltText)

module.exports = router
