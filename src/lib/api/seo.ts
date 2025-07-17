import { apiClient } from "./client"
import type { KeywordData } from "./types" // Assuming KeywordData is declared in another file

export interface AuditResult {
  _id: string
  url: string
  domain: string
  overallScore: number
  pageSpeedData: {
    desktop: { score: number; fcp: number; lcp: number; cls: number; fid: number; ttfb: number }
    mobile: { score: number; fcp: number; lcp: number; cls: number; fid: number; ttfb: number }
  }
  technicalSeo: {
    metaTitle: { exists: boolean; length: number; content: string; isOptimal?: boolean }
    metaDescription: { exists: boolean; length: number; content: string; isOptimal?: boolean }
    headings: {
      h1Count: number
      h2Count: number
      h3Count: number
      structure: Array<{ tag: string; text: string }>
      h1Text: string[]
    }
    images: { total: number; withoutAlt: number; withEmptyAlt?: number; oversized: number }
    links: { internal: number; external: number; broken: number; externalDomains?: string[] }
    schema: { exists: boolean; types: string[] }
    openGraph?: { exists: boolean; hasTitle: boolean; hasDescription: boolean; hasImage: boolean }
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

export interface ReportSummary {
  reportId: string
  user: {
    name: string
    email: string
  }
  audits: AuditResult[]
  reportType: string
  generatedAt: string
  summary: {
    totalAudits: number
    avgScore: number
    issuesByCategory: { critical: number; warning: number; info: number }
    topIssues: string[]
    recommendations: string[]
  }
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
  generateReport: async (
    auditIds: string[],
    reportType = "comprehensive",
  ): Promise<{ success: boolean; data: ReportSummary }> => {
    const response = await apiClient.post("/reports/generate", { auditIds, reportType })
    return response.data
  },

  downloadReport: async (reportId: string): Promise<Blob> => {
    const response = await apiClient.get(`/reports/download/${reportId}`, {
      responseType: "blob",
      timeout: 60000, // 60 second timeout for large PDFs
    })
    return response.data
  },

  getReportHistory: async (): Promise<{
    success: boolean
    reports: Array<{ id: string; type: string; generatedAt: string; filename: string }>
  }> => {
    const response = await apiClient.get("/reports/history")
    return response.data
  },
}
