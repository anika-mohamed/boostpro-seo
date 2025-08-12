import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Mock history data - replace with actual database queries
    const mockHistory = [
      {
        _id: "opt_1",
        originalContent: { title: "How to Improve SEO Rankings" },
        targetKeywords: [
          { keyword: "SEO rankings", priority: "primary" },
          { keyword: "search optimization", priority: "secondary" },
        ],
        performance: { beforeScore: 45, afterScore: 78 },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        status: "completed",
      },
      {
        _id: "opt_2",
        originalContent: { title: "Content Marketing Strategies" },
        targetKeywords: [
          { keyword: "content marketing", priority: "primary" },
          { keyword: "digital strategy", priority: "secondary" },
        ],
        performance: { beforeScore: 52, afterScore: 81 },
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        status: "completed",
      },
      {
        _id: "opt_3",
        originalContent: { title: "Social Media Best Practices" },
        targetKeywords: [
          { keyword: "social media", priority: "primary" },
          { keyword: "best practices", priority: "secondary" },
        ],
        performance: { beforeScore: 38, afterScore: 65 },
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        status: "completed",
      },
    ]

    const total = mockHistory.length
    const startIndex = (page - 1) * limit
    const paginatedHistory = mockHistory.slice(startIndex, startIndex + limit)

    return NextResponse.json({
      success: true,
      count: paginatedHistory.length,
      total,
      data: paginatedHistory,
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
