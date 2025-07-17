const crypto = require("crypto")
const User = require("../models/User")
const { validationResult } = require("express-validator")
const sendEmail = require("../utils/sendEmail")

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { name, email, password, company, website } = req.body

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      profile: {
        company,
        website,
      },
    })

    // Generate email verification token
    const verificationToken = crypto.randomBytes(20).toString("hex")
    user.emailVerificationToken = crypto.createHash("sha256").update(verificationToken).digest("hex")

    await user.save({ validateBeforeSave: false })

    // Send verification email
    const verificationUrl = `${req.protocol}://${req.get("host")}/api/auth/verify/${verificationToken}`

    const message = `
      Welcome to SEO BoostPro! Please verify your email by clicking the link below:
      ${verificationUrl}
    `

    try {
      await sendEmail({
        email: user.email,
        subject: "Email Verification - SEO BoostPro",
        message,
      })
    } catch (err) {
      console.log("Email could not be sent:", err)
    }

    sendTokenResponse(user, 201, res, "User registered successfully. Please check your email for verification.")
  } catch (error) {
    next(error)
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { email, password } = req.body

    // Check for user
    const user = await User.findOne({ email }).select("+password")

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save({ validateBeforeSave: false })

    sendTokenResponse(user, 200, res, "Login successful")
  } catch (error) {
    next(error)
  }
}

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Public
exports.logout = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  })
}

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      "profile.company": req.body.company,
      "profile.website": req.body.website,
      "profile.phone": req.body.phone,
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      success: true,
      data: user,
      message: "Profile updated successfully",
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+password")

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      })
    }

    user.password = req.body.newPassword
    await user.save()

    sendTokenResponse(user, 200, res, "Password updated successfully")
  } catch (error) {
    next(error)
  }
}

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "There is no user with that email",
      })
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken()

    await user.save({ validateBeforeSave: false })

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get("host")}/api/auth/resetpassword/${resetToken}`

    const message = `
      You are receiving this email because you (or someone else) has requested the reset of a password. 
      Please make a PUT request to: ${resetUrl}
    `

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Token - SEO BoostPro",
        message,
      })

      res.status(200).json({
        success: true,
        message: "Email sent successfully",
      })
    } catch (err) {
      console.log(err)
      user.resetPasswordToken = undefined
      user.resetPasswordExpire = undefined

      await user.save({ validateBeforeSave: false })

      return res.status(500).json({
        success: false,
        message: "Email could not be sent",
      })
    }
  } catch (error) {
    next(error)
  }
}

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.resettoken).digest("hex")

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      })
    }

    // Set new password
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()

    sendTokenResponse(user, 200, res, "Password reset successful")
  } catch (error) {
    next(error)
  }
}

// @desc    Verify email
// @route   GET /api/auth/verify/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const verificationToken = crypto.createHash("sha256").update(req.params.token).digest("hex")

    const user = await User.findOne({
      emailVerificationToken: verificationToken,
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification token",
      })
    }

    user.emailVerified = true
    user.emailVerificationToken = undefined
    await user.save({ validateBeforeSave: false })

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    })
  } catch (error) {
    next(error)
  }
}

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, message) => {
  // Create token
  const token = user.getSignedJwtToken()

  res.status(statusCode).json({
    success: true,
    message,
    token,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscription: user.subscription,
      emailVerified: user.emailVerified,
    },
  })
}