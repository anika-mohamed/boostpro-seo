// This file contains pure functions for content analysis.
// It's generally robust and unlikely to cause direct HTTP response issues.

exports.analyzeContent = (content, targetKeywords) => {
  const words = content.split(/\s+/)
  const wordCount = words.length
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0)

  // Calculate keyword density
  const keywordDensity = targetKeywords.map((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi")
    const matches = content.match(regex) || []
    const density = (matches.length / wordCount) * 100

    return {
      keyword,
      density: Math.round(density * 100) / 100,
      count: matches.length,
    }
  })

  // Calculate readability score (simplified Flesch Reading Ease)
  const avgWordsPerSentence = wordCount / sentences.length
  const avgSyllablesPerWord = calculateAvgSyllables(words)
  const readabilityScore = Math.max(
    0,
    Math.min(100, 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord),
  )

  // Calculate SEO score
  const seoScore = calculateSeoScore(content, keywordDensity, readabilityScore, wordCount)

  return {
    wordCount,
    sentenceCount: sentences.length,
    keywordDensity,
    readabilityScore: Math.round(readabilityScore),
    seoScore: Math.round(seoScore),
    avgWordsPerSentence: Math.round(avgWordsPerSentence),
  }
}

exports.calculateReadabilityScore = (content) => {
  const words = content.split(/\s+/)
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0)

  const avgWordsPerSentence = words.length / sentences.length
  const avgSyllablesPerWord = calculateAvgSyllables(words)

  return Math.max(0, Math.min(100, 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord))
}

function calculateAvgSyllables(words) {
  const totalSyllables = words.reduce((total, word) => {
    return total + countSyllables(word)
  }, 0)

  return totalSyllables / words.length
}

function countSyllables(word) {
  word = word.toLowerCase()
  if (word.length <= 3) return 1

  const vowels = "aeiouy"
  let syllableCount = 0
  let previousWasVowel = false

  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i])
    if (isVowel && !previousWasVowel) {
      syllableCount++
    }
    previousWasVowel = isVowel
  }

  // Handle silent 'e'
  if (word.endsWith("e")) {
    syllableCount--
  }

  return Math.max(1, syllableCount)
}

function calculateSeoScore(content, keywordDensity, readabilityScore, wordCount) {
  let score = 0

  // Keyword density score (0-40 points)
  const primaryKeywordDensity = keywordDensity[0]?.density || 0
  if (primaryKeywordDensity >= 0.5 && primaryKeywordDensity <= 2.5) {
    score += 40
  } else if (primaryKeywordDensity > 0) {
    score += 20
  }

  // Readability score (0-30 points)
  if (readabilityScore >= 60) {
    score += 30
  } else if (readabilityScore >= 30) {
    score += 20
  } else {
    score += 10
  }

  // Content length score (0-30 points)
  if (wordCount >= 1500) {
    score += 30
  } else if (wordCount >= 800) {
    score += 20
  } else if (wordCount >= 300) {
    score += 10
  }

  return score
}
