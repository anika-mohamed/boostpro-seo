const OpenAI = require("openai")

// Verify OpenAI API key is set and working
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OpenAI API key not configured")
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

exports.generateSwotWithAI = async (auditData) => {
  try {
    const prompt = createSwotPrompt(auditData)

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a senior SEO strategist with 10+ years of experience. Analyze website audit data and provide strategic, actionable SWOT analysis. Be specific, data-driven, and focus on practical insights that can drive SEO improvements.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent, focused analysis
      max_tokens: 1500,
    })

    const response = completion.choices[0].message.content
    return JSON.parse(response)
  } catch (error) {
    console.error("OpenAI API error:", error.message)

    // Fallback to rule-based analysis
    const { generateSwotWithRules } = require("./swotService")
    return generateSwotWithRules(auditData)
  }
}

exports.optimizeContentWithAI = async (content, keywords) => {
  try {
    const prompt = `
      Optimize the following content for SEO using these target keywords: ${keywords.join(", ")}
      
      Original content:
      ${content}
      
      Please:
      1. Naturally incorporate the target keywords
      2. Improve readability and structure
      3. Add relevant subheadings if needed
      4. Maintain the original tone and message
      5. Return only the optimized content
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an expert SEO content writer. Optimize content for search engines while maintaining readability and natural flow.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    return completion.choices[0].message.content
  } catch (error) {
    console.error("Content optimization error:", error.message)
    throw new Error("Failed to optimize content with AI")
  }
}

exports.generateAltTags = async (imageDescriptions) => {
  try {
    const prompt = `
      Generate SEO-optimized alt tags for the following image descriptions:
      ${imageDescriptions.map((desc, i) => `${i + 1}. ${desc}`).join("\n")}
      
      Return as JSON array with optimized alt tags that are:
      - Descriptive and specific
      - Under 125 characters
      - Include relevant keywords naturally
      - Accessible for screen readers
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an SEO and accessibility expert. Generate alt tags that are both SEO-friendly and accessible.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 500,
    })

    const response = completion.choices[0].message.content
    return JSON.parse(response)
  } catch (error) {
    console.error("Alt tag generation error:", error.message)

    // Fallback to simple alt tags
    return imageDescriptions.map((desc) => (desc.length > 125 ? desc.substring(0, 122) + "..." : desc))
  }
}

function createSwotPrompt(auditData) {
  const performanceScore = (auditData.pageSpeedData?.desktop?.score + auditData.pageSpeedData?.mobile?.score) / 2 || 0
  const technicalIssues = auditData.seoIssues?.length || 0

  return `
    As an expert SEO strategist, analyze this comprehensive website audit data and create a detailed SWOT analysis.
    
    WEBSITE DATA:
    URL: ${auditData.url}
    Overall SEO Score: ${auditData.overallScore}/100
    
    PERFORMANCE METRICS:
    - Desktop Performance: ${auditData.pageSpeedData?.desktop?.score || "N/A"}/100
    - Mobile Performance: ${auditData.pageSpeedData?.mobile?.score || "N/A"}/100
    - Average Performance: ${performanceScore.toFixed(1)}/100
    - Core Web Vitals:
      * Desktop LCP: ${auditData.pageSpeedData?.desktop?.lcp || "N/A"}s
      * Mobile LCP: ${auditData.pageSpeedData?.mobile?.lcp || "N/A"}s
      * Desktop CLS: ${auditData.pageSpeedData?.desktop?.cls || "N/A"}
      * Mobile CLS: ${auditData.pageSpeedData?.mobile?.cls || "N/A"}
    
    TECHNICAL SEO STATUS:
    - Meta Title: ${auditData.technicalSeo?.metaTitle?.exists ? `Present (${auditData.technicalSeo.metaTitle.length} chars)` : "Missing"}
    - Meta Description: ${auditData.technicalSeo?.metaDescription?.exists ? `Present (${auditData.technicalSeo.metaDescription.length} chars)` : "Missing"}
    - H1 Tags: ${auditData.technicalSeo?.headings?.h1Count || 0}
    - H2 Tags: ${auditData.technicalSeo?.headings?.h2Count || 0}
    - Total Images: ${auditData.technicalSeo?.images?.total || 0}
    - Images without Alt Text: ${auditData.technicalSeo?.images?.withoutAlt || 0}
    - Internal Links: ${auditData.technicalSeo?.links?.internal || 0}
    - External Links: ${auditData.technicalSeo?.links?.external || 0}
    - Schema Markup: ${auditData.technicalSeo?.schema?.exists ? "Present" : "Missing"}
    
    IDENTIFIED ISSUES: ${technicalIssues} issues found
    ${auditData.seoIssues?.map((issue) => `- ${issue.category.toUpperCase()}: ${issue.title}`).join("\n") || "No major issues identified"}
    
    Please provide a strategic SWOT analysis with:
    - 4-6 specific, actionable strengths
    - 4-6 concrete weaknesses with clear impact
    - 4-6 realistic opportunities for improvement
    - 3-5 potential threats or competitive risks
    
    Focus on:
    1. Technical SEO performance
    2. User experience factors
    3. Search engine visibility
    4. Competitive positioning
    5. Content and structure quality
    
    Return ONLY a JSON object with this exact structure:
    {
      "strengths": ["strength1", "strength2", ...],
      "weaknesses": ["weakness1", "weakness2", ...],
      "opportunities": ["opportunity1", "opportunity2", ...],
      "threats": ["threat1", "threat2", ...]
    }
  `
}
