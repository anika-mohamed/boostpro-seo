import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Target, BookOpen, FileText } from "lucide-react"

interface ContentAnalysisProps {
  analysis: {
    wordCount: number
    sentenceCount: number
    keywordDensity: Array<{
      keyword: string
      density: number
      count: number
    }>
    readabilityScore: number
    seoScore: number
    avgWordsPerSentence: number
  }
}

export function ContentAnalysis({ analysis }: ContentAnalysisProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    if (score >= 40) return "Fair"
    return "Needs Improvement"
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Content Analysis
        </CardTitle>
        <CardDescription>Detailed analysis of your original content</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border">
            <div className={`text-2xl font-bold ${getScoreColor(analysis.seoScore)}`}>{analysis.seoScore}/100</div>
            <div className="text-sm text-gray-600">SEO Score</div>
            <Badge variant="outline" className="mt-1">
              {getScoreLabel(analysis.seoScore)}
            </Badge>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border">
            <div className={`text-2xl font-bold ${getScoreColor(analysis.readabilityScore)}`}>
              {analysis.readabilityScore}/100
            </div>
            <div className="text-sm text-gray-600">Readability</div>
            <Badge variant="outline" className="mt-1">
              {getScoreLabel(analysis.readabilityScore)}
            </Badge>
          </div>
        </div>

        {/* Content Metrics */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Content Metrics
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Word Count:</span>
              <span className="ml-2 font-medium">{analysis.wordCount}</span>
            </div>
            <div>
              <span className="text-gray-600">Sentences:</span>
              <span className="ml-2 font-medium">{analysis.sentenceCount}</span>
            </div>
            <div>
              <span className="text-gray-600">Avg Words/Sentence:</span>
              <span className="ml-2 font-medium">{analysis.avgWordsPerSentence}</span>
            </div>
          </div>
        </div>

        {/* Keyword Density */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Target className="h-4 w-4" />
            Keyword Density
          </h4>
          <div className="space-y-2">
            {analysis.keywordDensity.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">{item.keyword}</span>
                  <div className="flex items-center gap-2">
                    <span>{item.count} times</span>
                    <Badge variant={item.density >= 0.5 && item.density <= 2.5 ? "default" : "secondary"}>
                      {item.density}%
                    </Badge>
                  </div>
                </div>
                <Progress
                  value={Math.min(item.density * 20, 100)}
                  className="h-2 bg-gradient-to-r from-blue-200 to-purple-200"
                />
                <div className="text-xs text-gray-500">
                  {item.density < 0.5 ? "Too low" : item.density > 2.5 ? "Too high" : "Optimal range"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Readability Breakdown */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Readability Analysis
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Reading Level:</span>
              <span className="font-medium">
                {analysis.readabilityScore >= 90
                  ? "Very Easy"
                  : analysis.readabilityScore >= 80
                    ? "Easy"
                    : analysis.readabilityScore >= 70
                      ? "Fairly Easy"
                      : analysis.readabilityScore >= 60
                        ? "Standard"
                        : analysis.readabilityScore >= 50
                          ? "Fairly Difficult"
                          : analysis.readabilityScore >= 30
                            ? "Difficult"
                            : "Very Difficult"}
              </span>
            </div>
            <Progress value={analysis.readabilityScore} className="h-2 bg-gradient-to-r from-blue-200 to-purple-200" />
            <p className="text-xs text-gray-500">
              Based on Flesch Reading Ease formula. Higher scores indicate easier readability.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
