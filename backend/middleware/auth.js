const jwt = require("jsonwebtoken")
const User = require("../models/User")

// @desc   Protect routes (ensure user is authenticated and properly initialized)
exports.protect = async (req, res, next) => {
  let token

  // Extract token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id)

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "No user found with this token",
      })
    }

    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User account is deactivated",
      })
    }

    // 🛠️ Ensure 'usage' object exists and is initialized
    if (!req.user.usage) {
      req.user.usage = {
        auditsThisMonth: 0,
        keywordSearchesThisMonth: 0,
        contentOptimizationsThisMonth: 0,
        competitorAnalysesThisMonth: 0,
        lastResetDate: new Date(),
      }
    }

    // 🛠️ Ensure 'subscription' object exists
    if (!req.user.subscription) {
      req.user.subscription = {
        plan: "free",
        status: "inactive",
      }
    }

    // Optional: persist initialization
    await req.user.save({ validateBeforeSave: false })

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    })
  }
}

// @desc   Role-based access control
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      })
    }
    next()
  }
}

// @desc   Check required subscription level
exports.checkSubscription = (requiredPlan = "free") => {
  return (req, res, next) => {
    const planHierarchy = { free: 0, basic: 1, pro: 2 }
    const userPlanLevel = planHierarchy[req.user.subscription?.plan] || 0
    const requiredPlanLevel = planHierarchy[requiredPlan] || 0

    if (userPlanLevel < requiredPlanLevel) {
      return res.status(403).json({
        success: false,
        message: `This feature requires a '${requiredPlan}' subscription or higher`,
        currentPlan: req.user.subscription.plan,
        requiredPlan,
      })
    }

    if (requiredPlan !== "free" && req.user.subscription.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your subscription is not active. Please update your payment method.",
        subscriptionStatus: req.user.subscription.status,
      })
    }

    next()
  }
}

// @desc   Enforce monthly usage limits
exports.checkUsageLimit = (feature, limit) => {
  return async (req, res, next) => {
    const currentMonth = new Date().getMonth()
    const lastResetMonth = new Date(req.user.usage.lastResetDate).getMonth()

    // Reset usage limits on new month
    if (currentMonth !== lastResetMonth) {
      req.user.usage.auditsThisMonth = 0
      req.user.usage.keywordSearchesThisMonth = 0
      req.user.usage.contentOptimizationsThisMonth = 0
      req.user.usage.competitorAnalysesThisMonth = 0
      req.user.usage.lastResetDate = new Date()
      await req.user.save()
    }

    const currentUsage = req.user.usage[`${feature}ThisMonth`] || 0

    if (currentUsage >= limit) {
      return res.status(429).json({
        success: false,
        message: `Monthly limit of ${limit} ${feature} reached. Upgrade your plan for more.`,
        currentUsage,
        limit,
      })
    }

    next()
  }
}