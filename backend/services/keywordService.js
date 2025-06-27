const axios = require("axios")

exports.getKeywordSuggestions = async (seedKeyword) => {
  try {
    console.log(`Generating keyword suggestions for: ${seedKeyword}`)

    // For now, we'll use a rule-based approach with some real data patterns
    // In a production environment, you'd integrate with Google Keyword Planner API
    // or services like SEMrush, Ahrefs, etc.

    const suggestions = await generateEnhancedKeywordSuggestions(seedKeyword)

    console.log(`Generated ${suggestions.length} keyword suggestions`)
    return suggestions
  } catch (error) {
    console.error("Keyword suggestion error:", error.message)
    return generateKeywordSuggestions(seedKeyword)
  }
}

exports.getTrendData = async (keyword) => {
  try {
    console.log(`Fetching trend data for: ${keyword}`)

    // Generate raw array of numbers representing trend values
    const rawData = generateRealisticTrendData(keyword) // e.g. [56, 60, 58, ...]

    const now = new Date()
    // Convert numbers to array of objects with date and value for last 12 months
    const dataWithDates = rawData.map((value, i) => ({
      date: new Date(now.getFullYear(), now.getMonth() - (11 - i), 1),
      value,
    }))

    const trendData = {
      timeframe: "Last 12 months",
      region: "Worldwide",
      data: dataWithDates,
    }

    return trendData
  } catch (error) {
    console.error("Trend data error:", error.message)
    // Fallback returns already correct format with date & value objects
    return {
      timeframe: "Last 12 months",
      region: "Worldwide",
      data: generateTrendData(),
    }
  }
}

async function generateEnhancedKeywordSuggestions(seedKeyword) {
  const baseKeywords = [
    `${seedKeyword} tips`,
    `${seedKeyword} guide`,
    `${seedKeyword} tutorial`,
    `${seedKeyword} best practices`,
    `${seedKeyword} tools`,
    `${seedKeyword} software`,
    `${seedKeyword} services`,
    `${seedKeyword} cost`,
    `${seedKeyword} pricing`,
    `${seedKeyword} benefits`,
    `${seedKeyword} comparison`,
    `${seedKeyword} vs`,
    `${seedKeyword} review`,
    `${seedKeyword} reviews`,
    `how to ${seedKeyword}`,
    `${seedKeyword} for beginners`,
    `${seedKeyword} examples`,
    `${seedKeyword} strategy`,
    `${seedKeyword} checklist`,
    `${seedKeyword} template`,
    `${seedKeyword} free`,
    `${seedKeyword} online`,
    `${seedKeyword} 2024`,
    `best ${seedKeyword}`,
    `top ${seedKeyword}`,
  ]

  // Add some industry-specific variations
  const industryTerms = ["business", "marketing", "digital", "online", "professional", "enterprise"]
  const actionTerms = ["optimize", "improve", "increase", "boost", "enhance", "maximize"]

  industryTerms.forEach((term) => {
    baseKeywords.push(`${term} ${seedKeyword}`)
    baseKeywords.push(`${seedKeyword} ${term}`)
  })

  actionTerms.forEach((term) => {
    baseKeywords.push(`${term} ${seedKeyword}`)
  })

  return baseKeywords.slice(0, 25).map((keyword, index) => ({
    keyword,
    searchVolume: generateRealisticSearchVolume(keyword, seedKeyword),
    competition: generateRealisticCompetition(keyword),
    cpc: generateRealisticCPC(keyword),
    difficulty: generateRealisticDifficulty(keyword, index),
    trend: {
      direction: generateRealisticTrendDirection(keyword),
      data: generateRealisticTrendData(keyword),
    },
    relatedQueries: generateRelatedQueries(keyword),
  }))
}

function generateRealisticSearchVolume(keyword, seedKeyword) {
  // Base volume on keyword characteristics
  let baseVolume = 1000

  // Longer keywords typically have lower volume
  if (keyword.split(" ").length > 3) {
    baseVolume = 500
  }

  // Common modifiers affect volume
  if (keyword.includes("free") || keyword.includes("how to")) {
    baseVolume *= 2
  }

  if (keyword.includes("best") || keyword.includes("top")) {
    baseVolume *= 1.5
  }

  if (keyword.includes("2024") || keyword.includes("review")) {
    baseVolume *= 0.8
  }

  // Add some randomness
  const variation = 0.3 + Math.random() * 1.4 // 0.3x to 1.7x
  return Math.floor(baseVolume * variation)
}

function generateRealisticCompetition(keyword) {
  // Determine competition based on keyword characteristics
  if (keyword.includes("free") || keyword.includes("how to")) {
    return Math.random() > 0.3 ? "high" : "medium"
  }

  if (keyword.includes("best") || keyword.includes("top") || keyword.includes("review")) {
    return Math.random() > 0.4 ? "high" : "medium"
  }

  if (keyword.split(" ").length > 4) {
    return Math.random() > 0.6 ? "low" : "medium"
  }

  const rand = Math.random()
  if (rand > 0.6) return "high"
  if (rand > 0.3) return "medium"
  return "low"
}

function generateRealisticCPC(keyword) {
  // CPC based on keyword intent and competition
  let baseCPC = 0.5

  if (keyword.includes("software") || keyword.includes("tool") || keyword.includes("service")) {
    baseCPC = 2.0
  }

  if (keyword.includes("cost") || keyword.includes("pricing") || keyword.includes("buy")) {
    baseCPC = 3.0
  }

  if (keyword.includes("free") || keyword.includes("tutorial")) {
    baseCPC = 0.3
  }

  // Add variation
  const variation = 0.5 + Math.random() * 1.5
  return Math.round(baseCPC * variation * 100) / 100
}

function generateRealisticDifficulty(keyword, index) {
  // Difficulty based on competition and keyword characteristics
  let baseDifficulty = 30

  if (keyword.includes("best") || keyword.includes("top")) {
    baseDifficulty = 70
  }

  if (keyword.split(" ").length > 4) {
    baseDifficulty = 25
  }

  if (keyword.includes("how to")) {
    baseDifficulty = 45
  }

  // Add some progression (later suggestions tend to be easier)
  const progression = Math.max(0, 10 - index)

  return Math.min(100, Math.max(1, baseDifficulty + progression + Math.floor(Math.random() * 20 - 10)))
}

function generateRealisticTrendDirection(keyword) {
  // Trend based on keyword characteristics
  if (keyword.includes("2024") || keyword.includes("new") || keyword.includes("latest")) {
    return Math.random() > 0.3 ? "up" : "stable"
  }

  if (keyword.includes("traditional") || keyword.includes("old")) {
    return Math.random() > 0.7 ? "down" : "stable"
  }

  const rand = Math.random()
  if (rand > 0.6) return "up"
  if (rand > 0.2) return "stable"
  return "down"
}

function generateRealisticTrendData(keyword) {
  const direction = generateRealisticTrendDirection(keyword)
  const data = []
  const baseValue = 50 + Math.random() * 30 // Start between 50-80

  for (let i = 0; i < 12; i++) {
    // Add seasonal variation
    const seasonal = Math.sin((i / 12) * 2 * Math.PI) * 10

    // Add trend
    let trendChange = 0
    if (direction === "up") {
      trendChange = i * 2 + Math.random() * 5
    } else if (direction === "down") {
      trendChange = -i * 1.5 + Math.random() * 3
    }

    // Add random variation
    const randomVariation = (Math.random() - 0.5) * 10

    const value = Math.max(1, Math.min(100, baseValue + seasonal + trendChange + randomVariation))
    data.push(Math.round(value))
  }

  return data
}

function generateRelatedQueries(keyword) {
  const base = keyword.split(" ")[0] // Get the main term

  return [
    `${keyword} 2024`,
    `${keyword} free`,
    `${keyword} online`,
    `${keyword} review`,
    `best ${base}`,
    `${base} guide`,
    `${base} tips`,
    `how to use ${base}`,
  ].slice(0, 4)
}

// Keep the original functions as fallbacks
function generateKeywordSuggestions(seedKeyword) {
  const baseKeywords = [
    `${seedKeyword} tips`,
    `${seedKeyword} guide`,
    `${seedKeyword} tutorial`,
    `${seedKeyword} best practices`,
    `${seedKeyword} tools`,
    `${seedKeyword} software`,
    `${seedKeyword} services`,
    `${seedKeyword} cost`,
    `${seedKeyword} benefits`,
    `${seedKeyword} comparison`,
    `how to ${seedKeyword}`,
    `${seedKeyword} for beginners`,
    `${seedKeyword} examples`,
    `${seedKeyword} strategy`,
    `${seedKeyword} checklist`,
  ]

  return baseKeywords.map((keyword) => ({
    keyword,
    searchVolume: Math.floor(Math.random() * 10000) + 1000,
    competition: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
    cpc: Math.round((Math.random() * 5 + 0.5) * 100) / 100,
    difficulty: Math.floor(Math.random() * 100) + 1,
    trend: {
      direction: ["up", "down", "stable"][Math.floor(Math.random() * 3)],
      data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)),
    },
    relatedQueries: [`${keyword} 2024`, `${keyword} free`, `${keyword} online`, `${keyword} review`],
  }))
}

function generateTrendData() {
  return Array.from({ length: 12 }, (_, i) => ({
    date: new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000),
    value: Math.floor(Math.random() * 100) + 1,
  }))
}
