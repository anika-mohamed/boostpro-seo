const express = require("express")
const { body } = require("express-validator")
const multer = require("multer")

const {
  generateAltTags,
  getAltTagHistory,
  getImagesWithoutAlt,
  updateAltText,
  uploadImage,
} = require("../controllers/image")

const { protect, checkSubscription } = require("../middleware/auth")

const router = express.Router()

// Multer setup to handle file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads") // store in /public/uploads
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`
    cb(null, uniqueName)
  },
})
const upload = multer({ storage })

router.use(protect) // All routes require login

// Upload route
router.post("/upload", upload.single("image"), uploadImage)

// ALT tag generation (subscription required)
const altTagValidation = [
  body("imageDescriptions").isArray({ min: 1, max: 10 }).withMessage("Please provide 1–10 descriptions"),
  body("imageDescriptions.*")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Each description must be 5–200 characters"),
]

router.post(
  "/alt-tags",
  altTagValidation,
  checkSubscription("basic"), // free can't access this
  generateAltTags,
)

// Optional
router.get("/alt-tags/history", getAltTagHistory)
router.get("/no-alt", getImagesWithoutAlt)
router.patch("/update-alt/:id", updateAltText)

module.exports = router
