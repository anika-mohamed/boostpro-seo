const User = require("../models/User")
const AuditResult = require("../models/AuditResult")
const KeywordResearch = require("../models/KeywordResearch")
const ContentOptimization = require("../models/ContentOptimization")

// @desc    Create a new user
// @route   POST /api/admin/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    let { name, email, password, role, subscription, company, website } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // Normalize role
    role = role === "registered" ? "basic" : role || "free";

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      subscription: {
        plan: subscription?.plan || "free",
        status: subscription?.status || "inactive",
      },
      profile: {
        company: company || "",
        website: website || "",
      },
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
        profile: user.profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users / Fetch users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page, 10) || 1
    const limit = Number.parseInt(req.query.limit, 10) || 20
    const startIndex = (page - 1) * limit

    const total = await User.countDocuments()

    const users = await User.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex)
      .select("-password")

    const pagination = {}

    if (startIndex + limit < total) {
      pagination.next = { page: page + 1, limit }
    }
    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit }
    }

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pagination,
      data: users,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password")

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    const [auditCount, keywordCount, contentCount] = await Promise.all([
      AuditResult.countDocuments({ user: user._id }),
      KeywordResearch.countDocuments({ user: user._id }),
      ContentOptimization.countDocuments({ user: user._id }),
    ])

    const userWithStats = {
      ...user.toObject(),
      stats: {
        totalAudits: auditCount,
        totalKeywordSearches: keywordCount,
        totalContentOptimizations: contentCount,
      },
    }

    res.status(200).json({ success: true, data: userWithStats })
  } catch (error) {
    next(error)
  }
}

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    let { name, email, role, isActive, emailVerified } = req.body;

    // Normalize role
    role = role === "registered" ? "basic" : role;

    const fieldsToUpdate = {
      name,
      email,
      role,
      isActive,
      emailVerified,
    }

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach((key) => {
      if (fieldsToUpdate[key] === undefined) delete fieldsToUpdate[key]
    })

    const user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    }).select("-password")

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    if (user.role === "admin" && user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Cannot delete other admin users" })
    }

    await user.deleteOne()

    res.status(200).json({ success: true, message: "User deleted successfully" })
  } catch (error) {
    next(error)
  }
}

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalAudits, totalKeywordSearches, totalContentOptimizations, activeSubscriptions] =
      await Promise.all([
        User.countDocuments(),
        AuditResult.countDocuments(),
        KeywordResearch.countDocuments(),
        ContentOptimization.countDocuments(),
        User.countDocuments({ "subscription.status": "active" }),
      ])

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } })
    const auditsThisMonth = await AuditResult.countDocuments({ createdAt: { $gte: startOfMonth } })

    const stats = {
      totalUsers,
      totalAudits,
      totalKeywordSearches,
      totalContentOptimizations,
      activeSubscriptions,
      newUsersThisMonth,
      auditsThisMonth,
      revenue: activeSubscriptions * 29,
    }

    res.status(200).json({ success: true, data: stats })
  } catch (error) {
    next(error)
  }
}

// @desc    Get audit statistics
// @route   GET /api/admin/stats/audits
// @access  Private/Admin
exports.getAuditStats = async (req, res, next) => {
  try {
    const auditsByStatus = await AuditResult.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ])

    const auditsByScore = await AuditResult.aggregate([
      {
        $bucket: {
          groupBy: "$overallScore",
          boundaries: [0, 25, 50, 75, 100],
          default: "Unknown",
          output: { count: { $sum: 1 } },
        },
      },
    ])

    const topDomains = await AuditResult.aggregate([
      { $group: { _id: "$domain", count: { $sum: 1 }, avgScore: { $avg: "$overallScore" } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])

    res.status(200).json({ success: true, data: { auditsByStatus, auditsByScore, topDomains } })
  } catch (error) {
    next(error)
  }
}

// @desc    Get subscription statistics
// @route   GET /api/admin/stats/subscriptions
// @access  Private/Admin
exports.getSubscriptionStats = async (req, res, next) => {
  try {
    const usersByPlan = await User.aggregate([
      { $group: { _id: "$subscription.plan", count: { $sum: 1 } } },
    ])

    const usersByStatus = await User.aggregate([
      { $group: { _id: "$subscription.status", count: { $sum: 1 } } },
    ])

    const totalPaidUsers = await User.countDocuments({
      "subscription.status": { $in: ["active", "cancelled", "past_due"] },
    })
    const cancelledUsers = await User.countDocuments({ "subscription.status": "cancelled" })
    const churnRate = totalPaidUsers > 0 ? (cancelledUsers / totalPaidUsers) * 100 : 0

    res.status(200).json({
      success: true,
      data: {
        usersByPlan,
        usersByStatus,
        churnRate: Math.round(churnRate * 100) / 100,
        totalPaidUsers,
        monthlyRecurringRevenue: totalPaidUsers * 29,
      },
    })
  } catch (error) {
    next(error)
  }
}
