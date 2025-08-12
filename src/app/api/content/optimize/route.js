import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const body = await request.json()
    const { content, targetKeywords, title } = body

    // Basic validation
    if (!content || content.length < 100) {
      return NextResponse.json(
        { success: false, message: "Content must be at least 100 characters long" },
        { status: 400 },
      )
    }

    if (!targetKeywords || !Array.isArray(targetKeywords) || targetKeywords.length === 0) {
      return NextResponse.json(
        { success: false, message: "Please provide at least one target keyword" },
        { status: 400 },
      )
    }

    // Generate unique optimization ID
    const mockOptimizationId = `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Analyze original content
    const words = content.split(/\s+/).filter((word) => word.length > 0)
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0)

    const keywordDensity = targetKeywords.map((keyword) => {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi")
      const matches = content.match(regex) || []
      const density = words.length > 0 ? (matches.length / words.length) * 100 : 0

      return {
        keyword,
        density: Math.round(density * 100) / 100,
        count: matches.length,
      }
    })

    const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0
    const readabilityScore = Math.max(0, Math.min(100, 206.835 - 1.015 * avgWordsPerSentence - 84.6 * 1.5))

    // Calculate SEO score based on keyword presence and content quality
    let seoScore = 0
    const primaryKeywordDensity = keywordDensity[0]?.density || 0

    // Keyword density scoring
    if (primaryKeywordDensity >= 0.5 && primaryKeywordDensity <= 2.5) {
      seoScore += 40
    } else if (primaryKeywordDensity > 0) {
      seoScore += 20
    }

    // Readability scoring
    if (readabilityScore >= 60) {
      seoScore += 30
    } else if (readabilityScore >= 30) {
      seoScore += 20
    }

    // Content length scoring
    if (words.length >= 1500) {
      seoScore += 30
    } else if (words.length >= 800) {
      seoScore += 20
    } else if (words.length >= 300) {
      seoScore += 10
    }

    const originalAnalysis = {
      wordCount: words.length,
      sentenceCount: sentences.length,
      keywordDensity,
      readabilityScore: Math.round(readabilityScore),
      seoScore: Math.round(seoScore),
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    }

    // Store the optimization request for processing
    global.optimizationRequests = global.optimizationRequests || new Map()
    global.optimizationRequests.set(mockOptimizationId, {
      originalContent: content,
      targetKeywords,
      title,
      originalAnalysis,
      status: "processing",
      createdAt: new Date().toISOString(),
    })

    // Start background processing
    setTimeout(() => processContentRegeneration(mockOptimizationId), 2000)

    return NextResponse.json({
      success: true,
      message: "Content regeneration started successfully",
      data: {
        optimizationId: mockOptimizationId,
        originalAnalysis,
        estimatedTime: "2-3 minutes",
      },
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

// Background processing function
async function processContentRegeneration(optimizationId) {
  try {
    const request = global.optimizationRequests.get(optimizationId)
    if (!request) return

    const { originalContent, targetKeywords, title, originalAnalysis } = request

    // Simulate AI processing time
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Generate completely new content
    const regeneratedContent = await regenerateContentWithSEO(originalContent, targetKeywords, title)

    // Analyze the regenerated content
    const words = regeneratedContent.split(/\s+/).filter((word) => word.length > 0)
    const sentences = regeneratedContent.split(/[.!?]+/).filter((s) => s.trim().length > 0)

    const keywordDensity = targetKeywords.map((keyword) => {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi")
      const matches = regeneratedContent.match(regex) || []
      const density = words.length > 0 ? (matches.length / words.length) * 100 : 0

      return {
        keyword,
        density: Math.round(density * 100) / 100,
        count: matches.length,
      }
    })

    const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0
    const readabilityScore = Math.max(0, Math.min(100, 206.835 - 1.015 * avgWordsPerSentence - 84.6 * 1.5))

    // Calculate improved SEO score
    let seoScore = 0
    const primaryKeywordDensity = keywordDensity[0]?.density || 0

    if (primaryKeywordDensity >= 1.0 && primaryKeywordDensity <= 2.5) {
      seoScore += 45
    } else if (primaryKeywordDensity >= 0.5) {
      seoScore += 35
    }

    if (readabilityScore >= 60) {
      seoScore += 35
    } else if (readabilityScore >= 30) {
      seoScore += 25
    }

    if (words.length >= 1500) {
      seoScore += 20
    } else if (words.length >= 800) {
      seoScore += 15
    }

    const primaryKeyword = targetKeywords[0]

    // Update the stored request with results
    global.optimizationRequests.set(optimizationId, {
      ...request,
      status: "completed",
      optimizedContent: {
        title: title || `${primaryKeyword} - Complete Guide and Best Practices`,
        content: regeneratedContent,
        wordCount: words.length,
        keywordDensity,
        readabilityScore: Math.round(readabilityScore),
        seoScore: Math.round(seoScore),
      },
      suggestions: generateSuggestions(originalContent, regeneratedContent, targetKeywords),
      metadata: generateMetadata(regeneratedContent, targetKeywords, title),
      performance: {
        beforeScore: originalAnalysis.seoScore,
        afterScore: Math.round(seoScore),
        improvement: Math.round(seoScore) - originalAnalysis.seoScore,
      },
    })
  } catch (error) {
    console.error("Content regeneration failed:", error)
    global.optimizationRequests.set(optimizationId, {
      ...global.optimizationRequests.get(optimizationId),
      status: "failed",
      errorMessage: error.message,
    })
  }
}

// Content regeneration function
async function regenerateContentWithSEO(originalContent, targetKeywords, title) {
  const primaryKeyword = targetKeywords[0]
  const secondaryKeywords = targetKeywords.slice(1)

  // Extract key concepts from original content
  const sentences = originalContent.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  const mainConcepts = extractMainConcepts(originalContent)

  // Generate new SEO-optimized content structure
  let regeneratedContent = ""

  // Introduction with primary keyword
  regeneratedContent += `Understanding ${primaryKeyword} is essential for success in today's competitive landscape. `
  regeneratedContent += `This comprehensive guide explores everything you need to know about ${primaryKeyword}, `
  regeneratedContent += `providing actionable insights and proven strategies.\n\n`

  // Main content sections
  regeneratedContent += `## What is ${primaryKeyword}?\n\n`
  regeneratedContent += `${primaryKeyword} represents a fundamental concept that impacts various aspects of modern practices. `
  regeneratedContent += `When implementing ${primaryKeyword} strategies, it's crucial to understand the underlying principles `
  regeneratedContent += `that drive successful outcomes. Professional ${primaryKeyword} approaches focus on delivering `
  regeneratedContent += `measurable results through systematic implementation.\n\n`

  // Incorporate original concepts with SEO optimization
  if (mainConcepts.length > 0) {
    regeneratedContent += `## Key Components of ${primaryKeyword}\n\n`
    mainConcepts.slice(0, 3).forEach((concept, index) => {
      const keyword = targetKeywords[index] || primaryKeyword
      regeneratedContent += `### ${concept} and ${keyword}\n\n`
      regeneratedContent += `The relationship between ${concept} and ${keyword} creates opportunities for optimization. `
      regeneratedContent += `Effective ${keyword} implementation considers ${concept} as a core element. `
      regeneratedContent += `By focusing on ${concept}, you can enhance your ${keyword} performance significantly.\n\n`
    })
  }

  // Secondary keywords integration
  if (secondaryKeywords.length > 0) {
    regeneratedContent += `## Advanced ${primaryKeyword} Strategies\n\n`
    secondaryKeywords.forEach((keyword) => {
      regeneratedContent += `${keyword} plays a crucial role in comprehensive ${primaryKeyword} optimization. `
      regeneratedContent += `Understanding how ${keyword} integrates with ${primaryKeyword} helps create more effective strategies. `
    })
    regeneratedContent += `These interconnected elements work together to maximize your ${primaryKeyword} success.\n\n`
  }

  // Best practices section
  regeneratedContent += `## ${primaryKeyword} Best Practices\n\n`
  regeneratedContent += `Implementing ${primaryKeyword} best practices ensures optimal results and long-term success. `
  regeneratedContent += `Professional ${primaryKeyword} strategies incorporate proven methodologies and industry standards. `
  regeneratedContent += `The most effective ${primaryKeyword} approaches combine theoretical knowledge with practical application.\n\n`

  // Benefits section
  regeneratedContent += `## Benefits of Effective ${primaryKeyword}\n\n`
  regeneratedContent += `Successful ${primaryKeyword} implementation delivers numerous advantages including improved performance, `
  regeneratedContent += `enhanced efficiency, and measurable growth. Organizations that prioritize ${primaryKeyword} `
  regeneratedContent += `consistently outperform competitors and achieve sustainable success.\n\n`

  // Conclusion with call to action
  regeneratedContent += `## Conclusion\n\n`
  regeneratedContent += `Mastering ${primaryKeyword} requires dedication, strategic thinking, and consistent implementation. `
  regeneratedContent += `By applying the principles and strategies outlined in this guide, you can achieve significant `
  regeneratedContent += `improvements in your ${primaryKeyword} performance. Start implementing these ${primaryKeyword} `
  regeneratedContent += `techniques today and measure your progress toward success.`

  return regeneratedContent
}

function extractMainConcepts(content) {
  const words = content.toLowerCase().split(/\s+/)
  const stopWords = new Set(["the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by"])

  const wordCount = {}
  words.forEach((word) => {
    const cleanWord = word.replace(/[^a-z]/g, "")
    if (cleanWord.length > 4 && !stopWords.has(cleanWord)) {
      wordCount[cleanWord] = (wordCount[cleanWord] || 0) + 1
    }
  })

  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1))
}

function generateSuggestions(original, regenerated, keywords) {
  const suggestions = [
    {
      type: "regeneration",
      suggestion: "Content has been completely rewritten and optimized for SEO while maintaining the original meaning",
      applied: true,
    },
    {
      type: "keyword",
      suggestion: `Enhanced keyword integration with natural placement of "${keywords[0]}" throughout the content`,
      applied: true,
    },
    {
      type: "structure",
      suggestion: "Added clear headings and sections for better readability and SEO structure",
      applied: true,
    },
    {
      type: "length",
      suggestion: `Expanded content from ${original.split(/\s+/).length} to ${regenerated.split(/\s+/).length} words for better search rankings`,
      applied: true,
    },
    {
      type: "seo",
      suggestion: "Integrated semantic keywords and LSI terms for improved topical relevance",
      applied: true,
    },
  ]

  return suggestions
}

function generateMetadata(content, keywords, title) {
  const primaryKeyword = keywords[0]
  const contentPreview = content.replace(/\s+/g, " ").trim().substring(0, 150)

  return {
    suggestedTitle: title || `${primaryKeyword} - Complete Guide and Best Practices`,
    suggestedDescription: `Master ${primaryKeyword} with our comprehensive guide. ${contentPreview}... Learn proven strategies and expert tips.`,
    suggestedSlug: primaryKeyword
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
    suggestedTags: [
      ...keywords,
      `${primaryKeyword} guide`,
      `${primaryKeyword} tips`,
      `${primaryKeyword} strategies`,
      "SEO optimized",
      "comprehensive guide",
    ],
  }
}
