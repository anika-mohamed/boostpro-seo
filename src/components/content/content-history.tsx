"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { History, Search, TrendingUp, Calendar, FileText, Target, Loader2 } from "lucide-react"

interface HistoryItem {
  _id: string
  originalContent: {
    title: string
  }
  targetKeywords: Array<{
    keyword: string
    priority: string
  }>
  performance: {
    beforeScore: number
    afterScore: number
  }
  createdAt: string
  status: string
}

export function ContentHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchHistory()
  }, [currentPage])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/content/history?page=${currentPage}&limit=10`)

      if (response.ok) {
        const result = await response.json()
        setHistory(result.data)
        setTotal(result.total)
      } else {
        console.error("Failed to fetch history")
      }
    } catch (error) {
      console.error("Failed to fetch history:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredHistory = history.filter(
    (item) =>
      item.originalContent.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.targetKeywords.some((kw) => kw.keyword.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const getImprovementColor = (improvement: number) => {
    if (improvement > 20) return "text-blue-600 bg-gradient-to-r from-blue-50 to-blue-100"
    if (improvement > 10) return "text-purple-600 bg-gradient-to-r from-purple-50 to-purple-100"
    if (improvement > 0) return "text-indigo-600 bg-gradient-to-r from-indigo-50 to-indigo-100"
    return "text-gray-600 bg-gradient-to-r from-gray-50 to-gray-100"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Processing
          </Badge>
        )
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Optimization History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your optimization history...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Optimization History
        </CardTitle>
        <CardDescription>View and manage your previous content optimizations ({total} total)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by title or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No optimization history found</p>
            <p className="text-sm">Start optimizing content to see your history here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => {
              const improvement = item.performance.afterScore - item.performance.beforeScore
              return (
                <div
                  key={item._id}
                  className="border rounded-lg p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{item.originalContent.title || "Untitled Content"}</h3>
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(item.createdAt)}
                        </Badge>
                        {getStatusBadge(item.status)}
                      </div>

                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-gray-500" />
                          <div className="flex gap-1">
                            {item.targetKeywords.slice(0, 3).map((kw, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {kw.keyword}
                              </Badge>
                            ))}
                            {item.targetKeywords.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{item.targetKeywords.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Before: {item.performance.beforeScore}/100</span>
                        <span>After: {item.performance.afterScore}/100</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {item.status === "completed" && (
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getImprovementColor(improvement)}`}
                        >
                          <TrendingUp className="h-3 w-3 inline mr-1" />+{improvement}
                        </div>
                      )}
                      <Button variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50 bg-transparent">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Simple Pagination */}
        {total > 10 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm">
              Page {currentPage} of {Math.ceil(total / 10)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(Math.ceil(total / 10), currentPage + 1))}
              disabled={currentPage >= Math.ceil(total / 10)}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
