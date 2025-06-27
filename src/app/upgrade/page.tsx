"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, TrendingUp, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/use-auth"

export default function UpgradePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <Link href="/dashboard" className="flex items-center text-sm font-medium hover:text-blue-600 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <div className="ml-auto flex items-center space-x-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SEO BoostPro
          </span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Upgrade Your SEO Game</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {user?.plan === "registered"
              ? "Unlock unlimited audits and advanced features with SEO BoostPro Pro"
              : "Choose the perfect plan for your SEO needs"}
          </p>
          {user && (
            <div className="mt-4">
              <Badge variant="secondary" className="text-sm">
                Current Plan:{" "}
                {user.plan === "registered" ? "Registered User" : user.plan === "pro" ? "Pro User" : "Guest User"}
              </Badge>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-8 max-w-6xl mx-auto">
          {/* Current Plan Indicator */}
          {user?.plan === "guest" && (
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-center">Guest User</CardTitle>
                  <Badge variant="outline">Current</Badge>
                </div>
                <div className="text-center">
                  <span className="text-4xl font-bold">Free</span>
                </div>
                <CardDescription className="text-center">Limited access</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />1 SEO audit
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Basic summary only
                  </li>
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Registered User */}
          <Card
            className={`border-2 ${user?.plan === "registered" ? "border-blue-200 bg-blue-50" : "border-gray-200"}`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-center">Registered User</CardTitle>
                {user?.plan === "registered" && <Badge>Current</Badge>}
              </div>
              <div className="text-center">
                <span className="text-4xl font-bold">$19</span>
                <span className="text-gray-500">/month</span>
              </div>
              <CardDescription className="text-center">Perfect for small businesses</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  10 SEO audits per month
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Keyword suggestions
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Save audit history
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Basic competitor info
                </li>
              </ul>
              {user?.plan !== "registered" && (
                <Button className="w-full" variant="outline">
                  Current Plan
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Pro User */}
          <Card
            className={`border-2 relative ${user?.plan === "pro" ? "border-purple-200 bg-purple-50" : "border-purple-200"}`}
          >
            {user?.plan !== "pro" && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-600">Recommended</Badge>
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-center">Pro User</CardTitle>
                {user?.plan === "pro" && <Badge>Current</Badge>}
              </div>
              <div className="text-center">
                <span className="text-4xl font-bold">$49</span>
                <span className="text-gray-500">/month</span>
              </div>
              <CardDescription className="text-center">Full access for growing businesses</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Unlimited SEO audits
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Full SWOT reports
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Download PDF reports
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Complete competitor analysis
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Rank prediction
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Image alt suggestions
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Priority support
                </li>
              </ul>
              {user?.plan !== "pro" ? (
                <Button className="w-full bg-purple-600 hover:bg-purple-700">Upgrade to Pro</Button>
              ) : (
                <Button className="w-full" variant="outline">
                  Current Plan
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Comparison */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full max-w-4xl mx-auto border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-3 text-left">Feature</th>
                  <th className="border border-gray-200 px-4 py-3 text-center">Guest</th>
                  <th className="border border-gray-200 px-4 py-3 text-center">Registered</th>
                  <th className="border border-gray-200 px-4 py-3 text-center">Pro</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 px-4 py-3">SEO Audits per month</td>
                  <td className="border border-gray-200 px-4 py-3 text-center">1</td>
                  <td className="border border-gray-200 px-4 py-3 text-center">10</td>
                  <td className="border border-gray-200 px-4 py-3 text-center">Unlimited</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 px-4 py-3">SWOT Analysis</td>
                  <td className="border border-gray-200 px-4 py-3 text-center">❌</td>
                  <td className="border border-gray-200 px-4 py-3 text-center">Basic</td>
                  <td className="border border-gray-200 px-4 py-3 text-center">✅ Full</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-3">PDF Reports</td>
                  <td className="border border-gray-200 px-4 py-3 text-center">❌</td>
                  <td className="border border-gray-200 px-4 py-3 text-center">❌</td>
                  <td className="border border-gray-200 px-4 py-3 text-center">✅</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 px-4 py-3">Competitor Analysis</td>
                  <td className="border border-gray-200 px-4 py-3 text-center">❌</td>
                  <td className="border border-gray-200 px-4 py-3 text-center">Basic</td>
                  <td className="border border-gray-200 px-4 py-3 text-center">✅ Complete</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-3">Keyword Research</td>
                  <td className="border border-gray-200 px-4 py-3 text-center">❌</td>
                  <td className="border border-gray-200 px-4 py-3 text-center">✅</td>
                  <td className="border border-gray-200 px-4 py-3 text-center">✅</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 px-4 py-3">Image Alt Tag Suggestions</td>
                  <td className="border border-gray-200 px-4 py-3 text-center">❌</td>
                  <td className="border border-gray-200 px-4 py-3 text-center">❌</td>
                  <td className="border border-gray-200 px-4 py-3 text-center">✅</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-3">Priority Support</td>
                  <td className="border border-gray-200 px-4 py-3 text-center">❌</td>
                  <td className="border border-gray-200 px-4 py-3 text-center">❌</td>
                  <td className="border border-gray-200 px-4 py-3 text-center">✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Boost Your SEO?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join thousands of businesses already improving their search rankings with SEO BoostPro.
            </p>
            <div className="space-x-4">
              {user?.plan !== "pro" && (
                <Button size="lg" variant="secondary">
                  Upgrade to Pro
                </Button>
              )}
              <Link href="/dashboard">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white border-white hover:bg-white hover:text-blue-600"
                >
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
