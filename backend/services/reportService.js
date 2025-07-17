const PDFDocument = require("pdfkit")

exports.generatePDFReport = async (reportData) => {
  return new Promise((resolve, reject) => {
    try {
      console.log(
        "Starting PDF generation for audits:",
        reportData.audits.map((a) => ({ url: a.url, domain: a.domain })),
      )

      const doc = new PDFDocument({
        margin: 50,
        size: "A4",
        info: {
          Title: "SEO Comprehensive Report",
          Author: "SEO BoostPro",
          Subject: "SEO Analysis Report",
          Keywords: "SEO, Analysis, Report, Website Audit",
        },
      })

      const buffers = []

      doc.on("data", buffers.push.bind(buffers))
      doc.on("end", () => {
        console.log("PDF generation completed, buffer size:", Buffer.concat(buffers).length)
        resolve(Buffer.concat(buffers))
      })
      doc.on("error", reject)

      // Helper function to add page breaks when needed
      const checkPageBreak = (doc, requiredSpace = 100) => {
        if (doc.y > doc.page.height - doc.page.margins.bottom - requiredSpace) {
          doc.addPage()
        }
      }

      // Helper function to add section headers
      const addSectionHeader = (doc, title, fontSize = 16) => {
        checkPageBreak(doc, 60)
        doc.fontSize(fontSize).fillColor("#2563eb").text(title, { underline: true }).fillColor("#000000").moveDown(0.5)
      }

      // Helper function to create simple charts using text
      const createTextChart = (doc, data, title, valueKey, labelKey = "month") => {
        if (!data || data.length === 0) return

        doc.fontSize(14).text(title, { underline: true }).moveDown(0.3)
        doc.fontSize(10)

        const maxValue = Math.max(...data.map((d) => d[valueKey] || 0))
        if (maxValue === 0) return

        data.forEach((item, index) => {
          const label = item[labelKey] || `Item ${index + 1}`
          const value = item[valueKey] || 0
          const barLength = Math.round((value / maxValue) * 30)
          const bar = "█".repeat(barLength) + "░".repeat(30 - barLength)

          doc.text(`${label.toString().padEnd(8)} ${bar} ${value}`)
        })
        doc.moveDown()
      }

      // COVER PAGE
      doc
        .fontSize(28)
        .fillColor("#1e40af")
        .text("SEO COMPREHENSIVE REPORT", { align: "center" })
        .fillColor("#000000")
        .moveDown(2)

      doc
        .fontSize(16)
        .text(`Generated for: ${reportData.user.name}`, { align: "center" })
        .text(`Email: ${reportData.user.email}`, { align: "center" })
        .text(
          `Report Date: ${new Date(reportData.generatedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}`,
          { align: "center" },
        )
        .moveDown(2)

      // Display analyzed websites with REAL NAMES
      doc.fontSize(14).text("Websites Analyzed:", { align: "center", underline: true }).moveDown(0.5)
      reportData.audits.forEach((audit, index) => {
        doc.fontSize(12).text(`${index + 1}. ${audit.url}`, { align: "center" })
        doc.fontSize(10).fillColor("#666666").text(`Domain: ${audit.domain}`, { align: "center" }).fillColor("#000000")
      })
      doc.moveDown(2)

      // Executive Summary Box
      doc
        .rect(50, doc.y, doc.page.width - 100, 160)
        .stroke("#e5e7eb")
        .fillColor("#f8fafc")
        .rect(50, doc.y, doc.page.width - 100, 160)
        .fill()
        .fillColor("#000000")

      const summaryY = doc.y + 20
      doc
        .fontSize(18)
        .text("EXECUTIVE SUMMARY", 70, summaryY, { align: "center" })
        .fontSize(14)
        .text(`Websites Analyzed: ${reportData.summary.totalAudits}`, 70, summaryY + 40)
        .text(`Average SEO Score: ${reportData.summary.avgScore}/100`)
        .text(`Critical Issues: ${reportData.summary.issuesByCategory.critical}`)
        .text(`Warning Issues: ${reportData.summary.issuesByCategory.warning}`)
        .text(`Total Recommendations: ${reportData.summary.recommendations.length}`)
        .text(`Score Improvement Trend: +${reportData.progressTracking.currentTrend.scoreImprovement} points`)

      doc.addPage()

      // TABLE OF CONTENTS
      addSectionHeader(doc, "TABLE OF CONTENTS", 20)
      doc
        .fontSize(12)
        .text("1. Executive Summary ................................. 2")
        .text("2. Progress Tracking Overview ........................ 3")
        .text("3. Ranking Predictions ............................... 5")
        .text("4. Issues Breakdown .................................. 7")
        .text("5. Technical SEO Analysis ............................ 8")
        .text("6. Performance Metrics ............................... 12")
        .text("7. SWOT Analysis ..................................... 14")
        .text("8. Detailed Audit Results ............................ 16")
        .text("9. Recommendations ................................... 20")
        .text("10. Action Plan ...................................... 23")

      doc.addPage()

      // PROGRESS TRACKING OVERVIEW
      addSectionHeader(doc, "PROGRESS TRACKING OVERVIEW", 18)

      doc.fontSize(14).text("Historical Performance Trends", { underline: true }).moveDown(0.5)

      // Progress summary
      doc
        .fontSize(12)
        .text(
          `Total Score Improvement: +${reportData.progressTracking.currentTrend.scoreImprovement} points over 12 months`,
        )
        .text(`Average Monthly Audits: ${reportData.progressTracking.currentTrend.averageMonthlyAudits}`)
        .text(`Total Issues Identified: ${reportData.progressTracking.currentTrend.totalIssuesResolved}`)
        .moveDown()

      // SEO Score Trend Chart
      if (reportData.progressTracking.historicalData) {
        createTextChart(doc, reportData.progressTracking.historicalData, "SEO Score Trend (Last 12 Months)", "score")
      }

      checkPageBreak(doc, 150)

      // Monthly Audit Activity
      if (reportData.progressTracking.historicalData) {
        createTextChart(doc, reportData.progressTracking.historicalData, "Monthly Audit Activity", "audits")
      }

      checkPageBreak(doc, 150)

      // Issues Identified Over Time
      if (reportData.progressTracking.historicalData) {
        createTextChart(doc, reportData.progressTracking.historicalData, "Issues Identified Per Month", "issues")
      }

      doc.addPage()

      // Key Performance Indicators
      addSectionHeader(doc, "KEY PERFORMANCE INDICATORS", 16)

      const kpiData = [
        { metric: "Current Average Score", value: `${reportData.summary.avgScore}/100`, trend: "↗️" },
        {
          metric: "Best Performing Site",
          value: `${Math.max(...reportData.audits.map((a) => a.overallScore))}/100`,
          trend: "🏆",
        },
        {
          metric: "Sites Needing Attention",
          value: reportData.audits.filter((a) => a.overallScore < 70).length,
          trend: "⚠️",
        },
        { metric: "Total Critical Issues", value: reportData.summary.issuesByCategory.critical, trend: "🔴" },
        { metric: "Improvement Opportunities", value: reportData.summary.recommendations.length, trend: "💡" },
      ]

      kpiData.forEach((kpi) => {
        doc.fontSize(12).text(`${kpi.trend} ${kpi.metric}: ${kpi.value}`)
      })

      doc.addPage()

      // RANKING PREDICTIONS
      addSectionHeader(doc, "RANKING PREDICTIONS & FORECASTING", 18)

      doc.fontSize(14).text("6-Month Performance Projections", { underline: true }).moveDown(0.5)

      // Prediction summary
      doc
        .fontSize(12)
        .text(`Current Estimated Ranking: #${reportData.rankingPredictions.currentPosition}`)
        .text(`Projected Ranking (6 months): #${reportData.rankingPredictions.projectedPosition}`)
        .text(
          `Estimated Traffic Increase: +${reportData.rankingPredictions.estimatedTrafficGain.toLocaleString()} monthly visitors`,
        )
        .text(
          `Ranking Improvement: +${reportData.rankingPredictions.currentPosition - reportData.rankingPredictions.projectedPosition} positions`,
        )
        .moveDown()

      // Ranking Prediction Chart
      if (reportData.rankingPredictions.predictions) {
        createTextChart(doc, reportData.rankingPredictions.predictions, "SEO Score Projection", "score", "month")

        checkPageBreak(doc, 150)

        // Reverse the ranking data for chart (lower ranking number = better)
        const rankingData = reportData.rankingPredictions.predictions.map((p) => ({
          ...p,
          displayRanking: 51 - p.estimatedRanking, // Invert for better visualization
        }))
        createTextChart(doc, rankingData, "Estimated Ranking Improvement", "displayRanking", "month")

        checkPageBreak(doc, 150)

        createTextChart(doc, reportData.rankingPredictions.predictions, "Projected Traffic Growth", "traffic", "month")
      }

      doc.addPage()

      // ISSUES BREAKDOWN
      addSectionHeader(doc, "ISSUES BREAKDOWN", 18)

      doc
        .fontSize(14)
        .fillColor("#dc2626")
        .text(`Critical Issues: ${reportData.summary.issuesByCategory.critical}`)
        .fillColor("#f59e0b")
        .text(`Warning Issues: ${reportData.summary.issuesByCategory.warning}`)
        .fillColor("#3b82f6")
        .text(`Info Items: ${reportData.summary.issuesByCategory.info}`)
        .fillColor("#000000")
        .moveDown()

      addSectionHeader(doc, "TOP ISSUES FOUND ACROSS ALL SITES", 16)
      doc.fontSize(12)
      reportData.summary.topIssues.forEach((issue, i) => {
        doc.text(`${i + 1}. ${issue}`, { indent: 20 })
      })

      doc.addPage()

      // TECHNICAL SEO ANALYSIS - WITH REAL DATA
      addSectionHeader(doc, "TECHNICAL SEO ANALYSIS", 18)

      reportData.audits.forEach((audit, index) => {
        checkPageBreak(doc, 200)

        doc
          .fontSize(16)
          .fillColor("#1e40af")
          .text(`${index + 1}. ${audit.url}`, { underline: true })
          .fillColor("#6b7280")
          .fontSize(12)
          .text(`Domain: ${audit.domain}`)
          .text(`Overall Score: ${audit.overallScore}/100`)
          .text(`Audit Date: ${new Date(audit.createdAt).toLocaleDateString()}`)
          .fillColor("#000000")
          .moveDown(0.5)

        if (audit.technicalSeo) {
          const tech = audit.technicalSeo

          // Meta Tags Analysis
          doc.fontSize(14).text("META TAGS ANALYSIS:", { underline: true }).fontSize(12)
          if (tech.metaTitle) {
            doc.text(
              `• Title Tag: ${tech.metaTitle.exists ? "✓ Present" : "✗ Missing"} (${tech.metaTitle.length} characters)`,
            )
            if (tech.metaTitle.content) {
              doc.text(
                `  Content: "${tech.metaTitle.content.substring(0, 80)}${tech.metaTitle.content.length > 80 ? "..." : ""}"`,
                { indent: 20 },
              )
            }
            doc.text(`  Status: ${tech.metaTitle.isOptimal ? "✓ Optimal length" : "⚠️ Needs optimization"}`, {
              indent: 20,
            })
          }

          if (tech.metaDescription) {
            doc.text(
              `• Meta Description: ${tech.metaDescription.exists ? "✓ Present" : "✗ Missing"} (${tech.metaDescription.length} characters)`,
            )
            if (tech.metaDescription.content) {
              doc.text(
                `  Content: "${tech.metaDescription.content.substring(0, 100)}${tech.metaDescription.content.length > 100 ? "..." : ""}"`,
                { indent: 20 },
              )
            }
            doc.text(`  Status: ${tech.metaDescription.isOptimal ? "✓ Optimal length" : "⚠️ Needs optimization"}`, {
              indent: 20,
            })
          }

          doc.moveDown(0.5)

          // Headings Structure
          if (tech.headings) {
            doc.fontSize(14).text("HEADING STRUCTURE:", { underline: true }).fontSize(12)
            doc.text(
              `• H1 Tags: ${tech.headings.h1Count} ${tech.headings.h1Count === 1 ? "✓" : tech.headings.h1Count === 0 ? "✗" : "⚠️"}`,
            )
            doc.text(`• H2 Tags: ${tech.headings.h2Count}`)
            doc.text(`• H3 Tags: ${tech.headings.h3Count}`)

            if (tech.headings.h1Text && tech.headings.h1Text.length > 0) {
              doc.text("H1 Content:")
              tech.headings.h1Text.slice(0, 3).forEach((h1) => {
                doc.text(`  • "${h1.substring(0, 60)}${h1.length > 60 ? "..." : ""}"`, { indent: 20 })
              })
            }
          }

          doc.moveDown(0.5)

          // Images Analysis
          if (tech.images) {
            doc.fontSize(14).text("IMAGES ANALYSIS:", { underline: true }).fontSize(12)
            doc.text(`• Total Images: ${tech.images.total}`)
            doc.text(`• Missing Alt Text: ${tech.images.withoutAlt} ${tech.images.withoutAlt > 0 ? "⚠️" : "✓"}`)
            doc.text(`• Oversized Images: ${tech.images.oversized} ${tech.images.oversized > 0 ? "⚠️" : "✓"}`)
            if (tech.images.withEmptyAlt) {
              doc.text(`• Empty Alt Text: ${tech.images.withEmptyAlt} ${tech.images.withEmptyAlt > 0 ? "⚠️" : "✓"}`)
            }
          }

          doc.moveDown(0.5)

          // Links Analysis
          if (tech.links) {
            doc.fontSize(14).text("LINKS ANALYSIS:", { underline: true }).fontSize(12)
            doc.text(`• Internal Links: ${tech.links.internal}`)
            doc.text(`• External Links: ${tech.links.external}`)
            doc.text(`• Broken Links: ${tech.links.broken} ${tech.links.broken > 0 ? "⚠️" : "✓"}`)

            if (tech.links.externalDomains && tech.links.externalDomains.length > 0) {
              doc.text("Top External Domains:")
              tech.links.externalDomains.slice(0, 5).forEach((domain) => {
                doc.text(`  • ${domain}`, { indent: 20 })
              })
            }
          }

          doc.moveDown(0.5)

          // Schema Markup
          if (tech.schema) {
            doc.fontSize(14).text("SCHEMA MARKUP:", { underline: true }).fontSize(12)
            doc.text(`• Schema Present: ${tech.schema.exists ? "✓ Yes" : "✗ No"}`)
            if (tech.schema.types && tech.schema.types.length > 0) {
              doc.text("Schema Types Found:")
              tech.schema.types.forEach((type) => {
                doc.text(`  • ${type}`, { indent: 20 })
              })
            }
          }

          doc.moveDown(0.5)

          // Open Graph
          if (tech.openGraph) {
            doc.fontSize(14).text("OPEN GRAPH TAGS:", { underline: true }).fontSize(12)
            doc.text(`• OG Tags Present: ${tech.openGraph.exists ? "✓ Yes" : "✗ No"}`)
            doc.text(`• OG Title: ${tech.openGraph.hasTitle ? "✓ Present" : "✗ Missing"}`)
            doc.text(`• OG Description: ${tech.openGraph.hasDescription ? "✓ Present" : "✗ Missing"}`)
            doc.text(`• OG Image: ${tech.openGraph.hasImage ? "✓ Present" : "✗ Missing"}`)
          }
        }

        doc.moveDown()
      })

      doc.addPage()

      // PERFORMANCE METRICS - WITH REAL DATA
      addSectionHeader(doc, "PERFORMANCE METRICS", 18)

      reportData.audits.forEach((audit, index) => {
        checkPageBreak(doc, 200)

        doc
          .fontSize(16)
          .fillColor("#1e40af")
          .text(`${index + 1}. ${audit.url}`)
          .fillColor("#6b7280")
          .fontSize(12)
          .text(`Domain: ${audit.domain}`)
          .fillColor("#000000")
          .moveDown(0.3)

        if (audit.pageSpeedData) {
          const perf = audit.pageSpeedData

          // Desktop Performance
          if (perf.desktop) {
            doc.fontSize(14).text("DESKTOP PERFORMANCE:", { underline: true }).fontSize(12)
            doc.text(
              `• Overall Score: ${perf.desktop.score}/100 ${perf.desktop.score >= 90 ? "✓" : perf.desktop.score >= 50 ? "⚠️" : "✗"}`,
            )
            doc.text(`• First Contentful Paint: ${perf.desktop.fcp}ms ${perf.desktop.fcp <= 1800 ? "✓" : "⚠️"}`)
            doc.text(`• Largest Contentful Paint: ${perf.desktop.lcp}ms ${perf.desktop.lcp <= 2500 ? "✓" : "⚠️"}`)
            doc.text(`• Cumulative Layout Shift: ${perf.desktop.cls} ${perf.desktop.cls <= 0.1 ? "✓" : "⚠️"}`)
            doc.text(`• First Input Delay: ${perf.desktop.fid}ms ${perf.desktop.fid <= 100 ? "✓" : "⚠️"}`)
            doc.text(`• Time to First Byte: ${perf.desktop.ttfb}ms ${perf.desktop.ttfb <= 600 ? "✓" : "⚠️"}`)
            doc.moveDown(0.5)
          }

          // Mobile Performance
          if (perf.mobile) {
            doc.fontSize(14).text("MOBILE PERFORMANCE:", { underline: true }).fontSize(12)
            doc.text(
              `• Overall Score: ${perf.mobile.score}/100 ${perf.mobile.score >= 90 ? "✓" : perf.mobile.score >= 50 ? "⚠️" : "✗"}`,
            )
            doc.text(`• First Contentful Paint: ${perf.mobile.fcp}ms ${perf.mobile.fcp <= 1800 ? "✓" : "⚠️"}`)
            doc.text(`• Largest Contentful Paint: ${perf.mobile.lcp}ms ${perf.mobile.lcp <= 2500 ? "✓" : "⚠️"}`)
            doc.text(`• Cumulative Layout Shift: ${perf.mobile.cls} ${perf.mobile.cls <= 0.1 ? "✓" : "⚠️"}`)
            doc.text(`• First Input Delay: ${perf.mobile.fid}ms ${perf.mobile.fid <= 100 ? "✓" : "⚠️"}`)
            doc.text(`• Time to First Byte: ${perf.mobile.ttfb}ms ${perf.mobile.ttfb <= 600 ? "✓" : "⚠️"}`)
          }

          // Performance Recommendations
          doc.moveDown(0.5)
          doc.fontSize(14).text("PERFORMANCE RECOMMENDATIONS:", { underline: true }).fontSize(12)
          if (perf.desktop?.score < 90 || perf.mobile?.score < 90) {
            doc.text("• Optimize images and use modern formats (WebP, AVIF)")
            doc.text("• Minimize and compress CSS/JavaScript files")
            doc.text("• Implement lazy loading for images")
            doc.text("• Use a Content Delivery Network (CDN)")
            doc.text("• Optimize server response times")
          } else {
            doc.text("• Performance is good! Continue monitoring Core Web Vitals")
          }
        }

        doc.moveDown()
      })

      doc.addPage()

      // SWOT ANALYSIS - WITH REAL DATA
      addSectionHeader(doc, "SWOT ANALYSIS", 18)

      reportData.audits.forEach((audit, index) => {
        if (audit.swotAnalysis) {
          checkPageBreak(doc, 250)

          doc
            .fontSize(16)
            .fillColor("#1e40af")
            .text(`${index + 1}. ${audit.url}`)
            .fillColor("#6b7280")
            .fontSize(12)
            .text(`Domain: ${audit.domain}`)
            .fillColor("#000000")
            .moveDown(0.3)

          const swot = audit.swotAnalysis

          // Strengths
          if (swot.strengths && swot.strengths.length > 0) {
            doc
              .fontSize(14)
              .fillColor("#10b981")
              .text("STRENGTHS:", { underline: true })
              .fillColor("#000000")
              .fontSize(12)
            swot.strengths.forEach((strength) => {
              doc.text(`• ${strength}`, { indent: 20 })
            })
            doc.moveDown(0.5)
          }

          // Weaknesses
          if (swot.weaknesses && swot.weaknesses.length > 0) {
            doc
              .fontSize(14)
              .fillColor("#dc2626")
              .text("WEAKNESSES:", { underline: true })
              .fillColor("#000000")
              .fontSize(12)
            swot.weaknesses.forEach((weakness) => {
              doc.text(`• ${weakness}`, { indent: 20 })
            })
            doc.moveDown(0.5)
          }

          // Opportunities
          if (swot.opportunities && swot.opportunities.length > 0) {
            doc
              .fontSize(14)
              .fillColor("#3b82f6")
              .text("OPPORTUNITIES:", { underline: true })
              .fillColor("#000000")
              .fontSize(12)
            swot.opportunities.forEach((opportunity) => {
              doc.text(`• ${opportunity}`, { indent: 20 })
            })
            doc.moveDown(0.5)
          }

          // Threats
          if (swot.threats && swot.threats.length > 0) {
            doc
              .fontSize(14)
              .fillColor("#f59e0b")
              .text("THREATS:", { underline: true })
              .fillColor("#000000")
              .fontSize(12)
            swot.threats.forEach((threat) => {
              doc.text(`• ${threat}`, { indent: 20 })
            })
          }

          doc.moveDown()
        }
      })

      doc.addPage()

      // DETAILED ISSUES & RECOMMENDATIONS - WITH REAL DATA
      addSectionHeader(doc, "DETAILED ISSUES & RECOMMENDATIONS", 18)

      reportData.audits.forEach((audit, index) => {
        checkPageBreak(doc, 150)

        doc
          .fontSize(16)
          .fillColor("#1e40af")
          .text(`${index + 1}. ${audit.url}`)
          .fillColor("#6b7280")
          .fontSize(12)
          .text(`Domain: ${audit.domain}`)
          .fillColor("#000000")
          .moveDown(0.3)

        if (audit.seoIssues && audit.seoIssues.length > 0) {
          doc.fontSize(14).text("SEO ISSUES FOUND:", { underline: true }).fontSize(12)

          // Group issues by category
          const criticalIssues = audit.seoIssues.filter((issue) => issue.category === "critical")
          const warningIssues = audit.seoIssues.filter((issue) => issue.category === "warning")
          const infoIssues = audit.seoIssues.filter((issue) => issue.category === "info")

          if (criticalIssues.length > 0) {
            doc.fillColor("#dc2626").text("🔴 CRITICAL ISSUES:").fillColor("#000000")
            criticalIssues.forEach((issue) => {
              checkPageBreak(doc, 80)
              doc.text(`• ${issue.title}`, { indent: 20 })
              doc.text(`  Description: ${issue.description}`, { indent: 30 })
              doc.text(`  Impact: ${issue.impact.toUpperCase()} | Suggestion: ${issue.suggestion}`, { indent: 30 })
            })
            doc.moveDown(0.5)
          }

          if (warningIssues.length > 0) {
            doc.fillColor("#f59e0b").text("⚠️ WARNING ISSUES:").fillColor("#000000")
            warningIssues.forEach((issue) => {
              checkPageBreak(doc, 80)
              doc.text(`• ${issue.title}`, { indent: 20 })
              doc.text(`  Description: ${issue.description}`, { indent: 30 })
              doc.text(`  Impact: ${issue.impact.toUpperCase()} | Suggestion: ${issue.suggestion}`, { indent: 30 })
            })
            doc.moveDown(0.5)
          }

          if (infoIssues.length > 0) {
            doc.fillColor("#3b82f6").text("ℹ️ INFORMATIONAL:").fillColor("#000000")
            infoIssues.slice(0, 5).forEach((issue) => {
              checkPageBreak(doc, 60)
              doc.text(`• ${issue.title}`, { indent: 20 })
              doc.text(`  ${issue.description}`, { indent: 30 })
            })
          }
        }

        // RECOMMENDATIONS
        if (audit.recommendations && audit.recommendations.length > 0) {
          doc.moveDown(0.5)
          doc.fontSize(14).text("RECOMMENDATIONS:", { underline: true }).fontSize(12)

          const highPriorityRecs = audit.recommendations.filter((rec) => rec.priority === "high")
          const mediumPriorityRecs = audit.recommendations.filter((rec) => rec.priority === "medium")
          const lowPriorityRecs = audit.recommendations.filter((rec) => rec.priority === "low")

          if (highPriorityRecs.length > 0) {
            doc.fillColor("#dc2626").text("HIGH PRIORITY:").fillColor("#000000")
            highPriorityRecs.forEach((rec) => {
              doc.text(`• ${rec.title}`, { indent: 20 })
              doc.text(`  ${rec.description}`, { indent: 30 })
              doc.text(`  Impact: ${rec.estimatedImpact}`, { indent: 30 })
            })
          }

          if (mediumPriorityRecs.length > 0) {
            doc.fillColor("#f59e0b").text("MEDIUM PRIORITY:").fillColor("#000000")
            mediumPriorityRecs.forEach((rec) => {
              doc.text(`• ${rec.title}`, { indent: 20 })
              doc.text(`  ${rec.description}`, { indent: 30 })
            })
          }

          if (lowPriorityRecs.length > 0) {
            doc.fillColor("#3b82f6").text("LOW PRIORITY:").fillColor("#000000")
            lowPriorityRecs.forEach((rec) => {
              doc.text(`• ${rec.title}`, { indent: 20 })
            })
          }
        }

        doc.moveDown()
      })

      doc.addPage()

      // COMPREHENSIVE ACTION PLAN
      addSectionHeader(doc, "COMPREHENSIVE 30-60-90 DAY ACTION PLAN", 18)

      doc
        .fontSize(14)
        .fillColor("#dc2626")
        .text("🎯 FIRST 30 DAYS - CRITICAL FOUNDATION:", { underline: true })
        .fillColor("#000000")
        .fontSize(12)

      doc.text("IMMEDIATE ACTIONS (Week 1-2):", { underline: true })
      doc.text("□ Fix all critical technical SEO issues identified", { indent: 20 })
      doc.text("□ Optimize page titles and meta descriptions for all pages", { indent: 20 })
      doc.text("□ Add missing alt text to all images", { indent: 20 })
      doc.text("□ Fix broken links and implement proper redirects", { indent: 20 })
      doc.text("□ Implement basic schema markup (Organization, WebSite)", { indent: 20 })
      doc.moveDown(0.5)

      doc.text("FOUNDATION BUILDING (Week 3-4):", { underline: true })
      doc.text("□ Optimize heading structure (H1, H2, H3 hierarchy)", { indent: 20 })
      doc.text("□ Improve internal linking structure", { indent: 20 })
      doc.text("□ Set up Google Search Console and Analytics", { indent: 20 })
      doc.text("□ Create and submit XML sitemaps", { indent: 20 })
      doc.text("□ Optimize robots.txt file", { indent: 20 })
      doc.moveDown()

      doc
        .fontSize(14)
        .fillColor("#f59e0b")
        .text("⚡ NEXT 30 DAYS (31-60) - PERFORMANCE & CONTENT:", { underline: true })
        .fillColor("#000000")
        .fontSize(12)

      doc.text("PERFORMANCE OPTIMIZATION (Week 5-6):", { underline: true })
      doc.text("□ Optimize page loading speed (compress images, minify CSS/JS)", { indent: 20 })
      doc.text("□ Implement lazy loading for images", { indent: 20 })
      doc.text("□ Optimize Core Web Vitals (LCP, FID, CLS)", { indent: 20 })
      doc.text("□ Improve mobile responsiveness", { indent: 20 })
      doc.text("□ Set up CDN for faster content delivery", { indent: 20 })
      doc.moveDown(0.5)

      doc.text("CONTENT ENHANCEMENT (Week 7-8):", { underline: true })
      doc.text("□ Enhance content quality and keyword optimization", { indent: 20 })
      doc.text("□ Add Open Graph and Twitter Card tags", { indent: 20 })
      doc.text("□ Create topic clusters and pillar pages", { indent: 20 })
      doc.text("□ Optimize for featured snippets", { indent: 20 })
      doc.text("□ Implement FAQ schema markup", { indent: 20 })
      doc.moveDown()

      doc
        .fontSize(14)
        .fillColor("#10b981")
        .text("🚀 FINAL 30 DAYS (61-90) - ADVANCED OPTIMIZATION:", { underline: true })
        .fillColor("#000000")
        .fontSize(12)

      doc.text("ADVANCED SEO (Week 9-10):", { underline: true })
      doc.text("□ Implement advanced schema markup (Product, Article, Review)", { indent: 20 })
      doc.text("□ Optimize for voice search and featured snippets", { indent: 20 })
      doc.text("□ Create comprehensive content hubs", { indent: 20 })
      doc.text("□ Implement hreflang for international SEO (if applicable)", { indent: 20 })
      doc.text("□ Set up advanced tracking and conversion goals", { indent: 20 })
      doc.moveDown(0.5)

      doc.text("MONITORING & EXPANSION (Week 11-12):", { underline: true })
      doc.text("□ Set up automated SEO monitoring and alerts", { indent: 20 })
      doc.text("□ Plan content expansion strategy", { indent: 20 })
      doc.text("□ Implement A/B testing for key pages", { indent: 20 })
      doc.text("□ Create link building and outreach strategy", { indent: 20 })
      doc.text("□ Schedule regular SEO audits and reviews", { indent: 20 })

      doc.addPage()

      // EXPECTED OUTCOMES
      addSectionHeader(doc, "EXPECTED OUTCOMES & SUCCESS METRICS", 16)

      doc.fontSize(12).text("Based on the current analysis and projected improvements, you can expect:").moveDown(0.5)

      doc.text("30-DAY TARGETS:", { underline: true })
      doc.text(
        `• SEO Score improvement: +15-25 points (Target: ${Math.min(100, reportData.summary.avgScore + 20)}/100)`,
      )
      doc.text("• Critical issues resolved: 80-90%")
      doc.text("• Page load speed improvement: 20-30%")
      doc.text("• Technical SEO compliance: 90%+")
      doc.moveDown(0.5)

      doc.text("60-DAY TARGETS:", { underline: true })
      doc.text(
        `• SEO Score improvement: +25-40 points (Target: ${Math.min(100, reportData.summary.avgScore + 35)}/100)`,
      )
      doc.text("• Organic traffic increase: 15-25%")
      doc.text("• Core Web Vitals: All metrics in 'Good' range")
      doc.text("• Search visibility improvement: 20-30%")
      doc.moveDown(0.5)

      doc.text("90-DAY TARGETS:", { underline: true })
      doc.text(
        `• SEO Score improvement: +40-60 points (Target: ${Math.min(100, reportData.summary.avgScore + 50)}/100)`,
      )
      doc.text("• Organic traffic increase: 30-50%")
      doc.text(
        `• Estimated ranking improvement: +${reportData.rankingPredictions.currentPosition - reportData.rankingPredictions.projectedPosition} positions`,
      )
      doc.text(
        `• Projected monthly traffic gain: +${reportData.rankingPredictions.estimatedTrafficGain.toLocaleString()} visitors`,
      )

      // Footer
      doc
        .fontSize(10)
        .fillColor("#6b7280")
        .text(
          `Generated by SEO BoostPro on ${new Date().toLocaleDateString()} | Comprehensive Report`,
          50,
          doc.page.height - 50,
          { align: "center" },
        )

      console.log("PDF content generation completed")
      doc.end()
    } catch (error) {
      console.error("PDF generation error:", error)
      reject(error)
    }
  })
}
