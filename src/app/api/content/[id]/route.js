import { NextResponse } from "next/server"

export async function GET(request, { params }) {
  try {
    const { id } = params

    // Get the stored optimization request
    global.optimizationRequests = global.optimizationRequests || new Map()
    const optimizationData = global.optimizationRequests.get(id)

    if (!optimizationData) {
      return NextResponse.json({ success: false, message: "Optimization not found" }, { status: 404 })
    }

    // If still processing, return processing status
    if (optimizationData.status === "processing") {
      return NextResponse.json({
        success: true,
        data: {
          _id: id,
          status: "processing",
          originalContent: {
            title: optimizationData.title || "Untitled Content",
            content: optimizationData.originalContent,
            wordCount: optimizationData.originalContent.split(/\s+/).length,
          },
          performance: {
            beforeScore: optimizationData.originalAnalysis.seoScore,
            afterScore: 0,
            improvement: 0,
          },
          createdAt: optimizationData.createdAt,
        },
      })
    }

    // If failed, return error status
    if (optimizationData.status === "failed") {
      return NextResponse.json({
        success: true,
        data: {
          _id: id,
          status: "failed",
          errorMessage: optimizationData.errorMessage || "Content regeneration failed",
          originalContent: {
            title: optimizationData.title || "Untitled Content",
            content: optimizationData.originalContent,
            wordCount: optimizationData.originalContent.split(/\s+/).length,
          },
          createdAt: optimizationData.createdAt,
        },
      })
    }

    // Return completed optimization data
    return NextResponse.json({
      success: true,
      data: {
        _id: id,
        originalContent: {
          title: optimizationData.title || "Untitled Content",
          content: optimizationData.originalContent,
          wordCount: optimizationData.originalContent.split(/\s+/).length,
        },
        optimizedContent: optimizationData.optimizedContent,
        suggestions: optimizationData.suggestions,
        metadata: optimizationData.metadata,
        performance: optimizationData.performance,
        status: optimizationData.status,
        createdAt: optimizationData.createdAt,
      },
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
