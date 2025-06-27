import { apiClient } from "./client"

export interface AuditResult {
  _id: string
  url: string
  domain: string
  overallScore: number
  pageSpeedData: {
    desktop: {
      score: number
      fcp: number
      lcp: number
      cls: number
      fid: number
      ttfb: number
    }
    mobile: {
      score: number
      fcp: number
      lcp: number
      cls: number
      fid: number
      ttfb: number
    }
  }
  technicalSeo: {
    metaTitle: {
      exists: boolean
      length: number
      content: string
      isOptimal?: boolean
    }
    metaDescription: {
      exists: boolean
      length: number
      content: string
      isOptimal?: boolean
    }
    headings: {
      h1Count: number
      h2Count: number
      h3Count: number
      structure: Array<{ tag: string; text: string }>
      h1Text: string[]
    }
    images: {
      total: number
      withoutAlt: number
      withEmptyAlt?: number
      oversized: number
    }
    links: {
      internal: number
      external: number
      broken: number
      externalDomains?: string[]
    }
    schema: {
      exists: boolean
      types: string[]
    }
    openGraph?: {
      exists: boolean
      hasTitle: boolean
      hasDescription: boolean
      hasImage: boolean
    }
  }
  seoIssues: Array<{
    category: "critical" | "warning" | "info"
    title: string
    description: string
    impact: "high" | "medium" | "low"
    suggestion: string
  }>
  recommendations: Array<{
    priority: "high" | "medium" | "low"
    category: string
    title: string
    description: string
    estimatedImpact: string
  }>
  swotAnalysis?: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
    generatedBy: "ai" | "rules"
  }
  status: "pending" | "completed" | "failed"
  createdAt: string
}

export interface AuditIssue {
  category: "critical" | "warning" | "info"
  title: string
  description: string
  impact: "high" | "medium" | "low"
  suggestion: string
}

export interface Recommendation {
  priority: "high" | "medium" | "low"
  category: string
  title: string
  description: string
  estimatedImpact: string
}

export interface KeywordData {
  keyword: string
  searchVolume: number
  competition: "low" | "medium" | "high"
  cpc: number
  difficulty: number
  trend: {
    direction: "up" | "down" | "stable"
    data: number[]
  }
  relatedQueries: string[]
}

export interface CompetitorData {
  url: string
  domain: string
  title: string
  metaDescription: string
  ranking: number
  keywordDensity: Array<{
    keyword: string
    density: number
    count: number
  }>
  contentLength: number
  headingStructure: {
    h1: string[]
    h2: string[]
    h3: string[]
  }
  backlinks: {
    estimated: number
    quality: string
  }
  socialSignals: {
    shares: number
    likes: number
  }
  technicalScore: number
}

export const seoApi = {
  // === AUDIT ===
  runAudit: async (url: string) => {
    const response = await apiClient.post("/seo/audit", { url })
    return response.data
  },

  getAuditHistory: async (page = 1, limit = 10) => {
    const response = await apiClient.get(`/seo/audits?page=${page}&limit=${limit}`)
    return response.data
  },

  getAuditById: async (id: string) => {
    const response = await apiClient.get(`/seo/audits/${id}`)
    return response.data
  },

  deleteAudit: async (id: string) => {
    const response = await apiClient.delete(`/seo/audits/${id}`)
    return response.data
  },

  generateSwotAnalysis: async (auditId: string) => {
    const response = await apiClient.post(`/seo/swot/${auditId}`)
    return response.data
  },

  // === KEYWORDS ===
  suggestKeyword: async (
    keyword: string,
  ): Promise<{
    suggestions: KeywordData[]
    trendData: any
  }> => {
    const response = await apiClient.post("/keywords/suggest", { keyword })
    return response.data.data
  },

  getKeywordHistory: async (): Promise<any[]> => {
    const response = await apiClient.get("/keywords/history")
    return response.data.data
  },

  getTrendingKeywords: async (): Promise<KeywordData[]> => {
    const response = await apiClient.get("/keywords/trending")
    return response.data.data
  },

  researchKeywords: async (keyword: string): Promise<KeywordData[]> => {
    const { suggestions } = await seoApi.suggestKeyword(keyword)
    return suggestions
  },

  // === COMPETITORS ===
  analyzeCompetitors: async (keywords: string[], userWebsite?: string) => {
    const response = await apiClient.post("/competitors/analyze", { keywords, userWebsite })
    return response.data
  },

  getCompetitorHistory: async () => {
    const response = await apiClient.get("/competitors/history")
    return response.data
  },

  getCompetitorAnalysisById: async (id: string) => {
    const response = await apiClient.get(`/competitors/analysis/${id}`)
    return response.data
  },

  // === CONTENT ===
  optimizeContent: async (content: string, targetKeywords: string[], title?: string) => {
    const response = await apiClient.post("/content/optimize", { content, targetKeywords, title })
    return response.data
  },

  getContentHistory: async () => {
    const response = await apiClient.get("/content/history")
    return response.data
  },

  getContentById: async (id: string) => {
    const response = await apiClient.get(`/content/${id}`)
    return response.data
  },

  // === ALT TAGS ===
  generateAltTags: async (imageDescriptions: string[]): Promise<{ optimizedAltTags: string[] }> => {
    const response = await apiClient.post("/image/alt-tags", { imageDescriptions })
    return response.data.data
  },

  // === REPORTS ===
  generateReport: async (auditIds: string[], reportType = "comprehensive") => {
    const response = await apiClient.post("/reports/generate", { auditIds, reportType })
    return response.data
  },

  downloadReport: async (reportId: string): Promise<Blob> => {
    // For demo purposes, generate a mock PDF blob
    const mockPdfContent = `
SEO BOOST PRO - COMPREHENSIVE REPORT
Generated: ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY
This report provides a comprehensive analysis of your website's SEO performance.

KEY FINDINGS:
• Overall SEO Score: 78/100
• Critical Issues: 3
• Opportunities Identified: 7
• Recommendations: 12

DETAILED ANALYSIS:
[Detailed analysis would be included in the actual PDF]

RECOMMENDATIONS:
1. Improve page loading speed
2. Optimize meta descriptions
3. Fix broken links
4. Enhance mobile experience

Generated by SEO BoostPro
    `.trim()

    const blob = new Blob([mockPdfContent], { type: "application/pdf" })
    return blob
  },

  getReportHistory: async () => {
    // Mock report history
    return {
      data: [
        {
          id: "report_1",
          type: "comprehensive",
          generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          auditCount: 3,
          status: "completed",
        },
        {
          id: "report_2",
          type: "summary",
          generatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          auditCount: 1,
          status: "completed",
        },
      ],
    }
  },

  // === MOCK ===
  getKeywordRankings: async (): Promise<KeywordData[]> => {
    return []
  },
}
