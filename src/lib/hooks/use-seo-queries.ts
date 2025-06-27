import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { seoApi } from "@/lib/api/seo"
import { toast } from "sonner"

export const useSeoQueries = () => {
  const queryClient = useQueryClient()

  // Audit queries
  const useAuditHistory = () => {
    return useQuery({
      queryKey: ["audits"],
      queryFn: seoApi.getAuditHistory,
    })
  }

  const useAudit = (id: string) => {
    return useQuery({
      queryKey: ["audit", id],
      queryFn: () => seoApi.getAuditById(id),
      enabled: !!id,
    })
  }

  const useRunAudit = () => {
    return useMutation({
      mutationFn: seoApi.runAudit,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["audits"] })
        toast.success("Audit completed successfully!")
      },
      onError: (error) => {
        toast.error("Audit failed. Please try again.")
        console.error("Audit error:", error)
      },
    })
  }

  // Keyword queries
  const useKeywordRankings = () => {
    return useQuery({
      queryKey: ["keyword-rankings"],
      queryFn: seoApi.getKeywordRankings,
    })
  }

  const useKeywordResearch = () => {
    return useMutation({
      mutationFn: seoApi.researchKeywords,
      onError: (error) => {
        toast.error("Keyword research failed. Please try again.")
        console.error("Keyword research error:", error)
      },
    })
  }

  // Competitor queries
  const useCompetitorAnalysis = () => {
    return useMutation({
      mutationFn: seoApi.analyzeCompetitors,
      onError: (error) => {
        toast.error("Competitor analysis failed. Please try again.")
        console.error("Competitor analysis error:", error)
      },
    })
  }

  const useCompetitorHistory = () => {
    return useQuery({
      queryKey: ["competitor-history"],
      queryFn: seoApi.getCompetitorHistory,
    })
  }

  // Content optimization
  const useContentOptimization = () => {
    return useMutation({
      mutationFn: ({ content, keywords }: { content: string; keywords: string[] }) =>
        seoApi.optimizeContent(content, keywords),
      onSuccess: () => {
        toast.success("Content optimized successfully!")
      },
      onError: (error) => {
        toast.error("Content optimization failed. Please try again.")
        console.error("Content optimization error:", error)
      },
    })
  }

  // Alt tag generation
  const useAltTagGeneration = () => {
    return useMutation({
      mutationFn: ({ imageUrl, description }: { imageUrl: string; description: string }) =>
        seoApi.generateAltTags(imageUrl, description),
      onSuccess: () => {
        toast.success("Alt tag generated successfully!")
      },
      onError: (error) => {
        toast.error("Alt tag generation failed. Please try again.")
        console.error("Alt tag generation error:", error)
      },
    })
  }

  return {
    useAuditHistory,
    useAudit,
    useRunAudit,
    useKeywordRankings,
    useKeywordResearch,
    useCompetitorAnalysis,
    useCompetitorHistory, // ✅ 
    useContentOptimization,
    useAltTagGeneration,
  }
}
