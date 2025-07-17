const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("dotenv").config()

const User = require("../models/User")
const AuditResult = require("../models/AuditResult")

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("📦 MongoDB Connected for seeding")
  } catch (error) {
    console.error("❌ Database connection error:", error.message)
    process.exit(1)
  }
}

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({})

    const users = [
      {
        name: "Admin User",
        email: "admin@seoboostpro.com",
        password: "admin123",
        role: "admin",
        emailVerified: true,
        subscription: {
          status: "active",
          plan: "pro",
        },
      },
      {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "registered",
        emailVerified: true,
        profile: {
          company: "Tech Startup Inc",
          website: "https://techstartup.com",
        },
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        password: "password123",
        role: "paid",
        emailVerified: true,
        subscription: {
          status: "active",
          plan: "pro",
        },
        profile: {
          company: "Marketing Agency",
          website: "https://marketingagency.com",
        },
      },
      {
        name: "Pro User",
        email: "pro@example.com",
        password: "password123",
        role: "paid",
        emailVerified: true,
        subscription: {
          status: "active",
          plan: "pro",
        },
        profile: {
          company: "Enterprise Corp",
          website: "https://enterprise.com",
        },
      },
    ]

    // Hash passwords
    for (const user of users) {
      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(user.password, salt)
    }

    const createdUsers = await User.insertMany(users)
    console.log("✅ Users seeded successfully")

    // Reset usage if it's a new month
    for (const user of createdUsers) {
      const now = new Date()
      const currentMonth = now.getMonth()
      const lastResetDate = user.usage.lastResetDate || new Date(0) 
      const lastResetMonth = lastResetDate.getMonth()

      if (currentMonth !== lastResetMonth) {
        user.usage.auditsThisMonth = 0
        user.usage.keywordSearchesThisMonth = 0
        user.usage.contentOptimizationsThisMonth = 0
        user.usage.competitorAnalysesThisMonth = 0
        user.usage.lastResetDate = new Date()
        await user.save()
      }
    }

    return createdUsers
  } catch (error) {
    console.error("❌ Error seeding users:", error.message)
  }
}

const seedAudits = async (users) => {
  try {
    // Clear existing audits
    await AuditResult.deleteMany({})

    const sampleAudits = [
      {
        user: users[1]._id, // John Doe
        url: "https://example.com",
        domain: "example.com",
        pageSpeedData: {
          desktop: { score: 85, fcp: 1.2, lcp: 2.1, cls: 0.05, fid: 80, ttfb: 0.6 },
          mobile: { score: 72, fcp: 1.8, lcp: 3.2, cls: 0.12, fid: 120, ttfb: 0.9 },
        },
        technicalSeo: {
          metaTitle: { exists: true, length: 45, content: "Example Website - Best Products" },
          metaDescription: { exists: true, length: 120, content: "Find the best products at Example.com" },
          headings: { h1Count: 1, h2Count: 4, h3Count: 8, structure: ["H1", "H2", "H3"] },
          images: { total: 15, withoutAlt: 2, oversized: 1 },
          links: { internal: 25, external: 8, broken: 0 },
          schema: { exists: true, types: ["Organization", "WebSite"] },
        },
        overallScore: 78,
        status: "completed",
      },
      {
        user: users[2]._id, // Jane Smith
        url: "https://marketingagency.com",
        domain: "marketingagency.com",
        pageSpeedData: {
          desktop: { score: 92, fcp: 0.9, lcp: 1.8, cls: 0.02, fid: 60, ttfb: 0.4 },
          mobile: { score: 88, fcp: 1.3, lcp: 2.5, cls: 0.08, fid: 90, ttfb: 0.7 },
        },
        technicalSeo: {
          metaTitle: { exists: true, length: 52, content: "Marketing Agency - Digital Marketing Services" },
          metaDescription: {
            exists: true,
            length: 145,
            content: "Professional digital marketing services to grow your business online",
          },
          headings: { h1Count: 1, h2Count: 6, h3Count: 12, structure: ["H1", "H2", "H3"] },
          images: { total: 20, withoutAlt: 0, oversized: 0 },
          links: { internal: 35, external: 12, broken: 0 },
          schema: { exists: true, types: ["Organization", "Service"] },
        },
        overallScore: 90,
        status: "completed",
      },
    ]

    await AuditResult.insertMany(sampleAudits)
    console.log("✅ Audit results seeded successfully")
  } catch (error) {
    console.error("❌ Error seeding audits:", error.message)
  }
}

const runSeed = async () => {
  await connectDB()

  console.log("🌱 Starting database seeding...")

  const users = await seedUsers()
  await seedAudits(users)

  console.log("🎉 Database seeding completed!")
  console.log("\n📋 Test Accounts:")
  console.log("Admin: admin@seoboostpro.com / admin123")
  console.log("User: john@example.com / password123")
  console.log("Registered: jane@example.com / password123")
  console.log("Pro: pro@example.com / password123")

  process.exit(0)
}

// Run the seed script
runSeed().catch((error) => {
  console.error("❌ Seeding failed:", error)
  process.exit(1)
})
