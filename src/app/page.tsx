"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, TrendingUp, Search, BarChart3, Users, Zap, Globe } from "lucide-react"
import Link from "next/link"

// Default content structure
const defaultContent = {
  hero: {
    badge: "AI-Powered SEO Platform",
    title: "Boost Your Website's SEO Performance",
    description:
      "Empower your small business with AI-driven SEO tools. Get automated audits, keyword research, competitor analysis, and actionable insights without technical expertise.",
    primaryButton: "Start Free Trial",
    secondaryButton: "View Demo",
  },
  features: {
    title: "Powerful SEO Features",
    description: "Everything you need to improve your website's search engine visibility",
    items: [
      {
        icon: "Search",
        title: "Automated SEO Audits",
        description:
          "Get comprehensive website audits using Google PageSpeed Insights. Analyze performance, mobile-friendliness, and technical SEO issues automatically.",
      },
      {
        icon: "BarChart3",
        title: "AI-Powered SWOT Analysis",
        description:
          "Receive intelligent analysis of your SEO strengths, weaknesses, opportunities, and threats with actionable recommendations powered by AI.",
      },
      {
        icon: "TrendingUp",
        title: "Keyword Research & Trends",
        description:
          "Discover high-potential keywords with Google Trends integration. Get search volume, competition data, and trend analysis to optimize your content strategy.",
      },
      {
        icon: "Users",
        title: "Competitor Analysis",
        description:
          "Compare your SEO metrics with top-ranking competitors. Identify gaps, opportunities, and strategies to outrank your competition in search results.",
      },
      {
        icon: "Globe",
        title: "Progress Tracking & Reports",
        description:
          "Track your SEO progress over time with visual charts and generate comprehensive PDF reports. Get ranking predictions and measure campaign effectiveness.",
      },
      {
        icon: "Zap",
        title: "Content Optimization",
        description:
          "Transform your content with SEO-optimized keywords and AI-powered suggestions. Improve readability and search visibility automatically.",
      },
    ],
  },
  pricing: {
    title: "Simple, Transparent Pricing",
    description: "Choose the plan that fits your business needs",
    plans: [
      {
        name: "Guest User",
        price: "Free",
        description: "Perfect for trying out our platform",
        features: ["Limited SEO audit (summary only)", "Create business profile", "View landing page"],
        buttonText: "Get Started",
        buttonVariant: "outline",
        popular: false,
      },
      {
        name: "Registered User",
        price: "$19",
        period: "/month",
        description: "Great for small businesses getting started",
        features: ["Limited SEO audits", "Keyword suggestion summary", "Save audit history", "Limited competitor info"],
        buttonText: "Start Free Trial",
        buttonVariant: "default",
        popular: true,
      },
      {
        name: "Pro User",
        price: "$49",
        period: "/month",
        description: "Full access for growing businesses",
        features: [
          "Full SEO audits & SWOT reports",
          "Download PDF reports",
          "Complete competitor analysis",
          "Rank prediction",
          "Image alt suggestions",
        ],
        buttonText: "Upgrade to Pro",
        buttonVariant: "default",
        popular: false,
      },
    ],
  },
  cta: {
    title: "Ready to Boost Your SEO?",
    description: "Join thousands of small businesses already improving their online visibility with SEO BoostPro.",
    primaryButton: "Start Your Free Trial",
    secondaryButton: "Contact Sales",
  },
}

export default function LandingPage() {
  const [content, setContent] = useState(defaultContent)

  useEffect(() => {
    // Load content from localStorage if available
    const savedContent = localStorage.getItem("landingPageContent")
    if (savedContent) {
      try {
        setContent(JSON.parse(savedContent))
      } catch (error) {
        console.error("Error loading saved content:", error)
      }
    }
  }, [])

  const getIcon = (iconName: string) => {
    const icons = {
      Search: Search,
      BarChart3: BarChart3,
      TrendingUp: TrendingUp,
      Users: Users,
      Globe: Globe,
      Zap: Zap,
    }
    const IconComponent = icons[iconName as keyof typeof icons] || Search
    return IconComponent
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <Link href="/" className="flex items-center justify-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SEO BoostPro
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="#features" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Features
          </Link>
          <Link href="#pricing" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Pricing
          </Link>
          <Link href="#about" className="text-sm font-medium hover:text-blue-600 transition-colors">
            About
          </Link>
          <Link href="/login" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Login
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge variant="secondary" className="mb-4">
                  {content.hero.badge}
                </Badge>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  {content.hero.title.split("SEO Performance")[0]}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    SEO Performance
                  </span>
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">{content.hero.description}</p>
              </div>
              <div className="space-x-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {content.hero.primaryButton}
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button variant="outline" size="lg">
                    {content.hero.secondaryButton}
                  </Button>
                </Link>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  Free tier available
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{content.features.title}</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl mt-4">{content.features.description}</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              {content.features.items.map((feature, index) => {
                const IconComponent = getIcon(feature.icon)
                const colors = ["blue", "purple", "green", "orange", "red", "indigo"]
                const color = colors[index % colors.length]

                return (
                  <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center mb-4`}>
                        <IconComponent className={`h-6 w-6 text-${color}-600`} />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{content.pricing.title}</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl mt-4">{content.pricing.description}</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
              {content.pricing.plans.map((plan, index) => (
                <Card
                  key={index}
                  className={`border-2 ${plan.popular ? "border-blue-200 relative" : "border-gray-200"}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle className="text-center">{plan.name}</CardTitle>
                    <div className="text-center">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && <span className="text-gray-500">{plan.period}</span>}
                    </div>
                    <CardDescription className="text-center">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full mt-6 ${plan.popular ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                      variant={plan.buttonVariant as "default" | "outline"}
                    >
                      {plan.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                  {content.cta.title}
                </h2>
                <p className="mx-auto max-w-[600px] text-blue-100 md:text-xl">{content.cta.description}</p>
              </div>
              <div className="space-x-4">
                <Link href="/register">
                  <Button size="lg" variant="secondary">
                    {content.cta.primaryButton}
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
                  >
                    {content.cta.secondaryButton}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">© 2025 SEO BoostPro. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="/terms" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-xs hover:underline underline-offset-4">
            Privacy Policy
          </Link>
          <Link href="/support" className="text-xs hover:underline underline-offset-4">
            Support
          </Link>
        </nav>
      </footer>
    </div>
  )
}
