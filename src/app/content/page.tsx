import { ContentOptimizer } from "@/components/content/content-optimizer"
import { ContentHistory } from "@/components/content/content-history"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SEO BoostPro
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Content Optimization Assistant</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your content with AI-powered SEO optimization. Improve search engine visibility with intelligent
            keyword integration and readability enhancements.
          </p>
        </div>

        <Tabs defaultValue="optimize" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white shadow-sm">
            <TabsTrigger
              value="optimize"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              Optimize Content
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              Optimization History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="optimize">
            <ContentOptimizer />
          </TabsContent>

          <TabsContent value="history">
            <ContentHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
