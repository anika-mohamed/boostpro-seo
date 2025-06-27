const OpenAI = require("openai")

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OpenAI API key not configured")
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Generate SWOT analysis using OpenAI GPT with robust JSON parsing and fallback.
 * @param {Object} auditData - The audit data object to analyze
 * @returns {Object} SWOT analysis object with strengths, weaknesses, opportunities, threats arrays
 */
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
      temperature: 0.3,
      max_tokens: 1500,
    })

    const response = completion.choices[0].message.content.trim()

    // Try parsing JSON safely
    const jsonStr = extractJsonFromMarkdown(response)
    return JSON.parse(jsonStr)
  } catch (error) {
    console.error("OpenAI API or parsing error:", error.message)
    console.error("Raw AI response (if any):", error.response?.choices?.[0]?.message?.content || "N/A")

    // Fallback to rule-based SWOT
    const { generateSwotWithRules } = require("./swotService")
    return generateSwotWithRules(auditData)
  }
}

/**
 * Extract JSON object inside triple backticks ```json ... ``` or ``` ... ```
 * If not found, returns input unchanged.
 */
function extractJsonFromMarkdown(text) {
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i
  const match = codeBlockRegex.exec(text)
  if (match && match[1]) {
    return match[1]
  }
  return text
}

/**
 * Create prompt text for SWOT analysis with strict JSON output formatting.
 * Includes audit data summary.
 */
function createSwotPrompt(auditData) {
  const performanceScore =
    ((auditData.pageSpeedData?.desktop?.score || 0) +
      (auditData.pageSpeedData?.mobile?.score || 0)) /
    2

  const technicalIssuesCount = auditData.seoIssues?.length || 0

  // Provide fallback defaults to avoid empty or undefined values
  const metaTitleStatus = auditData.technicalSeo?.metaTitle?.exists
    ? `Present (${auditData.technicalSeo.metaTitle.length} chars)`
    : "Missing"
  const metaDescriptionStatus = auditData.technicalSeo?.metaDescription?.exists
    ? `Present (${auditData.technicalSeo.metaDescription.length} chars)`
    : "Missing"
  const schemaStatus = auditData.technicalSeo?.schema?.exists ? "Present" : "Missing"

  return `
As an expert SEO strategist, analyze this comprehensive website audit data and create a detailed SWOT analysis.

WEBSITE DATA:
URL: ${auditData.url}
Overall SEO Score: ${auditData.overallScore || "N/A"}/100

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
- Meta Title: ${metaTitleStatus}
- Meta Description: ${metaDescriptionStatus}
- H1 Tags: ${auditData.technicalSeo?.headings?.h1Count || 0}
- H2 Tags: ${auditData.technicalSeo?.headings?.h2Count || 0}
- Total Images: ${auditData.technicalSeo?.images?.total || 0}
- Images without Alt Text: ${auditData.technicalSeo?.images?.withoutAlt || 0}
- Internal Links: ${auditData.technicalSeo?.links?.internal || 0}
- External Links: ${auditData.technicalSeo?.links?.external || 0}
- Schema Markup: ${schemaStatus}

IDENTIFIED ISSUES: ${technicalIssuesCount} issues found
${(auditData.seoIssues || [])
  .map((issue) => `- ${issue.category.toUpperCase()}: ${issue.title}`)
  .join("\n") || "No major issues identified"}

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

Return ONLY a JSON object EXACTLY like this, without any extra explanation or text:

\`\`\`json
{
  "strengths": ["strength1", "strength2", "..."],
  "weaknesses": ["weakness1", "weakness2", "..."],
  "opportunities": ["opportunity1", "opportunity2", "..."],
  "threats": ["threat1", "threat2", "..."]
}
\`\`\`
`
}
