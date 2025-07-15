"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, TrendingUp, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/use-auth"

export default function UpgradePage() {
  const { user } = useAuth()
  const userPlan = user?.plan?.toLowerCase() || "guest"

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
            {userPlan === "registered"
              ? "Unlock unlimited audits and advanced features with SEO BoostPro Pro"
              : "Choose the perfect plan for your SEO needs"}
          </p>
          {user && (
            <div className="mt-4">
              <Badge variant="secondary" className="text-sm">
                Current Plan:{" "}
                {userPlan === "registered" ? "Registered User" : userPlan === "pro" ? "Pro User" : "Guest User"}
              </Badge>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-8 max-w-6xl mx-auto">
          {/* Guest */}
          <Card className={`border-2 relative ${userPlan === "pro" ? "border-purple-200 bg-purple-50" : "border-purple-200"}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-center">Guest User</CardTitle>
                {userPlan === "guest" && <Badge variant="outline">Current</Badge>}
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
              {userPlan === "guest" && (
                <Button className="w-full mt-6" variant="outline">
                  Current Plan
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Registered */}
          <Card className={`border-2 relative ${userPlan === "pro" ? "border-purple-200 bg-purple-50" : "border-purple-200"}`}>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle className="text-center">Registered User</CardTitle>
      {userPlan === "registered" && <Badge>Current</Badge>}
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

    {userPlan === "registered" ? (
      <Button className="w-full" variant="outline">
        Current Plan
      </Button>
    ) : userPlan === "guest" ? (
      <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
  Upgrade to Basic
</Button>
    ) : null}
  </CardContent>
</Card>


          {/* Pro */}
          <Card className={`border-2 relative ${userPlan === "pro" ? "border-purple-200 bg-purple-50" : "border-purple-200"}`}>
            {userPlan !== "pro" && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-600">Recommended</Badge>
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-center">Pro User</CardTitle>
                {userPlan === "pro" && <Badge>Current</Badge>}
              </div>
              <div className="text-center">
                <span className="text-4xl font-bold">$49</span>
                <span className="text-gray-500">/month</span>
              </div>
              <CardDescription className="text-center">Full access for growing businesses</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Unlimited SEO audits</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Full SWOT reports</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Download PDF reports</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Complete competitor analysis</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Rank prediction</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Image alt suggestions</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Priority support</li>
              </ul>
              {userPlan === "pro" ? (
                <Button className="w-full" variant="outline">
                  Current Plan
                </Button>
              ) : (
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Upgrade to Pro
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
