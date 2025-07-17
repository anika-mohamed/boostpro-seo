const PDFDocument = require("pdfkit")

exports.generatePDFReport = async (reportData) => {
  return new Promise((resolve, reject) => {
    try {
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
      doc.on("end", () => resolve(Buffer.concat(buffers)))
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
        .moveDown(3)

      // Executive Summary Box
      doc
        .rect(50, doc.y, doc.page.width - 100, 120)
        .stroke("#e5e7eb")
        .fillColor("#f8fafc")
        .rect(50, doc.y, doc.page.width - 100, 120)
        .fill()
        .fillColor("#000000")

      doc
        .fontSize(18)
        .text("EXECUTIVE SUMMARY", 70, doc.y + 20, { align: "center" })
        .fontSize(14)
        .text(`Websites Analyzed: ${reportData.summary.totalAudits}`, 70, doc.y + 20)
        .text(`Average SEO Score: ${reportData.summary.avgScore}/100`)
        .text(`Critical Issues: ${reportData.summary.issuesByCategory.critical}`)
        .text(`Total Recommendations: ${reportData.summary.recommendations.length}`)

      doc.addPage()

      // TABLE OF CONTENTS
      addSectionHeader(doc, "TABLE OF CONTENTS", 20)
      doc
        .fontSize(12)
        .text("1. Executive Summary ................................. 2")
        .text("2. Issues Breakdown .................................. 3")
        .text("3. Technical SEO Analysis ............................ 4")
        .text("4. Performance Metrics ............................... 6")
        .text("5. SWOT Analysis ..................................... 8")
        .text("6. Detailed Audit Results ............................ 10")
        .text("7. Recommendations ................................... 15")
        .text("8. Action Plan ....................................... 18")

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

      addSectionHeader(doc, "TOP ISSUES FOUND", 16)
      doc.fontSize(12)
      reportData.summary.topIssues.forEach((issue, i) => {
        doc.text(`${i + 1}. ${issue}`, { indent: 20 })
      })

      doc.addPage()

      // TECHNICAL SEO ANALYSIS
      addSectionHeader(doc, "TECHNICAL SEO ANALYSIS", 18)

      reportData.audits.forEach((audit, index) => {
        checkPageBreak(doc, 200)

        doc
          .fontSize(14)
          .fillColor("#1e40af")
          .text(`${index + 1}. ${audit.url}`, { underline: true })
          .fillColor("#000000")
          .fontSize(12)
          .moveDown(0.3)

        if (audit.technicalSeo) {
          const tech = audit.technicalSeo

          // Meta Tags Analysis
          doc.text("META TAGS:", { underline: true })
          if (tech.metaTitle) {
            doc.text(`• Title: ${tech.metaTitle.exists ? "✓" : "✗"} (${tech.metaTitle.length} chars)`)
            if (tech.metaTitle.content) {
              doc.text(`  Content: "${tech.metaTitle.content.substring(0, 80)}..."`, { indent: 20 })
            }
          }

          if (tech.metaDescription) {
            doc.text(`• Description: ${tech.metaDescription.exists ? "✓" : "✗"} (${tech.metaDescription.length} chars)`)
            if (tech.metaDescription.content) {
              doc.text(`  Content: "${tech.metaDescription.content.substring(0, 100)}..."`, { indent: 20 })
            }
          }

          doc.moveDown(0.5)

          // Headings Structure
          if (tech.headings) {
            doc.text("HEADING STRUCTURE:", { underline: true })
            doc.text(`• H1 Tags: ${tech.headings.h1Count}`)
            doc.text(`• H2 Tags: ${tech.headings.h2Count}`)
            doc.text(`• H3 Tags: ${tech.headings.h3Count}`)

            if (tech.headings.h1Text && tech.headings.h1Text.length > 0) {
              doc.text("H1 Content:")
              tech.headings.h1Text.forEach((h1) => {
                doc.text(`  • "${h1.substring(0, 60)}..."`, { indent: 20 })
              })
            }
          }

          doc.moveDown(0.5)

          // Images Analysis
          if (tech.images) {
            doc.text("IMAGES ANALYSIS:", { underline: true })
            doc.text(`• Total Images: ${tech.images.total}`)
            doc.text(`• Missing Alt Text: ${tech.images.withoutAlt}`)
            doc.text(`• Oversized Images: ${tech.images.oversized}`)
          }

          doc.moveDown(0.5)

          // Links Analysis
          if (tech.links) {
            doc.text("LINKS ANALYSIS:", { underline: true })
            doc.text(`• Internal Links: ${tech.links.internal}`)
            doc.text(`• External Links: ${tech.links.external}`)
            doc.text(`• Broken Links: ${tech.links.broken}`)

            if (tech.links.externalDomains && tech.links.externalDomains.length > 0) {
              doc.text("External Domains:")
              tech.links.externalDomains.slice(0, 5).forEach((domain) => {
                doc.text(`  • ${domain}`, { indent: 20 })
              })
            }
          }

          doc.moveDown(0.5)

          // Schema Markup
          if (tech.schema) {
            doc.text("SCHEMA MARKUP:", { underline: true })
            doc.text(`• Schema Present: ${tech.schema.exists ? "✓" : "✗"}`)
            if (tech.schema.types && tech.schema.types.length > 0) {
              doc.text("Schema Types:")
              tech.schema.types.forEach((type) => {
                doc.text(`  • ${type}`, { indent: 20 })
              })
            }
          }

          doc.moveDown(0.5)

          // Open Graph
          if (tech.openGraph) {
            doc.text("OPEN GRAPH:", { underline: true })
            doc.text(`• OG Tags Present: ${tech.openGraph.exists ? "✓" : "✗"}`)
            doc.text(`• OG Title: ${tech.openGraph.hasTitle ? "✓" : "✗"}`)
            doc.text(`• OG Description: ${tech.openGraph.hasDescription ? "✓" : "✗"}`)
            doc.text(`• OG Image: ${tech.openGraph.hasImage ? "✓" : "✗"}`)
          }
        }

        doc.moveDown()
      })

      doc.addPage()

      // PERFORMANCE METRICS
      addSectionHeader(doc, "PERFORMANCE METRICS", 18)

      reportData.audits.forEach((audit, index) => {
        checkPageBreak(doc, 150)

        doc
          .fontSize(14)
          .fillColor("#1e40af")
          .text(`${index + 1}. ${audit.url}`)
          .fillColor("#000000")
          .fontSize(12)
          .moveDown(0.3)

        if (audit.pageSpeedData) {
          const perf = audit.pageSpeedData

          // Desktop Performance
          if (perf.desktop) {
            doc.text("DESKTOP PERFORMANCE:", { underline: true })
            doc.text(`• Overall Score: ${perf.desktop.score}/100`)
            doc.text(`• First Contentful Paint: ${perf.desktop.fcp}ms`)
            doc.text(`• Largest Contentful Paint: ${perf.desktop.lcp}ms`)
            doc.text(`• Cumulative Layout Shift: ${perf.desktop.cls}`)
            doc.text(`• First Input Delay: ${perf.desktop.fid}ms`)
            doc.text(`• Time to First Byte: ${perf.desktop.ttfb}ms`)
            doc.moveDown(0.5)
          }

          // Mobile Performance
          if (perf.mobile) {
            doc.text("MOBILE PERFORMANCE:", { underline: true })
            doc.text(`• Overall Score: ${perf.mobile.score}/100`)
            doc.text(`• First Contentful Paint: ${perf.mobile.fcp}ms`)
            doc.text(`• Largest Contentful Paint: ${perf.mobile.lcp}ms`)
            doc.text(`• Cumulative Layout Shift: ${perf.mobile.cls}`)
            doc.text(`• First Input Delay: ${perf.mobile.fid}ms`)
            doc.text(`• Time to First Byte: ${perf.mobile.ttfb}ms`)
          }
        }

        doc.moveDown()
      })

      doc.addPage()

      // SWOT ANALYSIS
      addSectionHeader(doc, "SWOT ANALYSIS", 18)

      reportData.audits.forEach((audit, index) => {
        if (audit.swotAnalysis) {
          checkPageBreak(doc, 200)

          doc
            .fontSize(14)
            .fillColor("#1e40af")
            .text(`${index + 1}. ${audit.url}`)
            .fillColor("#000000")
            .fontSize(12)
            .moveDown(0.3)

          const swot = audit.swotAnalysis

          // Strengths
          if (swot.strengths && swot.strengths.length > 0) {
            doc.fillColor("#10b981").text("STRENGTHS:", { underline: true }).fillColor("#000000")
            swot.strengths.forEach((strength) => {
              doc.text(`• ${strength}`, { indent: 20 })
            })
            doc.moveDown(0.5)
          }

          // Weaknesses
          if (swot.weaknesses && swot.weaknesses.length > 0) {
            doc.fillColor("#dc2626").text("WEAKNESSES:", { underline: true }).fillColor("#000000")
            swot.weaknesses.forEach((weakness) => {
              doc.text(`• ${weakness}`, { indent: 20 })
            })
            doc.moveDown(0.5)
          }

          // Opportunities
          if (swot.opportunities && swot.opportunities.length > 0) {
            doc.fillColor("#3b82f6").text("OPPORTUNITIES:", { underline: true }).fillColor("#000000")
            swot.opportunities.forEach((opportunity) => {
              doc.text(`• ${opportunity}`, { indent: 20 })
            })
            doc.moveDown(0.5)
          }

          // Threats
          if (swot.threats && swot.threats.length > 0) {
            doc.fillColor("#f59e0b").text("THREATS:", { underline: true }).fillColor("#000000")
            swot.threats.forEach((threat) => {
              doc.text(`• ${threat}`, { indent: 20 })
            })
          }

          doc.moveDown()
        }
      })

      doc.addPage()

      // DETAILED ISSUES
      addSectionHeader(doc, "DETAILED ISSUES & RECOMMENDATIONS", 18)

      reportData.audits.forEach((audit, index) => {
        checkPageBreak(doc, 100)

        doc
          .fontSize(14)
          .fillColor("#1e40af")
          .text(`${index + 1}. ${audit.url}`)
          .fillColor("#000000")
          .fontSize(12)
          .moveDown(0.3)

        if (audit.seoIssues && audit.seoIssues.length > 0) {
          doc.text("SEO ISSUES:", { underline: true })

          // Group issues by category
          const criticalIssues = audit.seoIssues.filter((issue) => issue.category === "critical")
          const warningIssues = audit.seoIssues.filter((issue) => issue.category === "warning")
          const infoIssues = audit.seoIssues.filter((issue) => issue.category === "info")

          if (criticalIssues.length > 0) {
            doc.fillColor("#dc2626").text("CRITICAL ISSUES:").fillColor("#000000")
            criticalIssues.forEach((issue) => {
              checkPageBreak(doc, 60)
              doc.text(`• ${issue.title}`, { indent: 20 })
              doc.text(`  ${issue.description}`, { indent: 30 })
              doc.text(`  Impact: ${issue.impact} | Suggestion: ${issue.suggestion}`, { indent: 30 })
            })
            doc.moveDown(0.5)
          }

          if (warningIssues.length > 0) {
            doc.fillColor("#f59e0b").text("WARNING ISSUES:").fillColor("#000000")
            warningIssues.forEach((issue) => {
              checkPageBreak(doc, 60)
              doc.text(`• ${issue.title}`, { indent: 20 })
              doc.text(`  ${issue.description}`, { indent: 30 })
              doc.text(`  Impact: ${issue.impact} | Suggestion: ${issue.suggestion}`, { indent: 30 })
            })
            doc.moveDown(0.5)
          }

          if (infoIssues.length > 0) {
            doc.fillColor("#3b82f6").text("INFORMATIONAL:").fillColor("#000000")
            infoIssues.slice(0, 5).forEach((issue) => {
              checkPageBreak(doc, 40)
              doc.text(`• ${issue.title}`, { indent: 20 })
              doc.text(`  ${issue.description}`, { indent: 30 })
            })
          }
        }

        doc.moveDown()
      })

      doc.addPage()

      // RECOMMENDATIONS
      addSectionHeader(doc, "PRIORITIZED RECOMMENDATIONS", 18)

      // Collect all recommendations and sort by priority
      const allRecommendations = []
      reportData.audits.forEach((audit) => {
        if (audit.recommendations) {
          audit.recommendations.forEach((rec) => {
            allRecommendations.push({
              ...rec,
              url: audit.url,
            })
          })
        }
      })

      const highPriorityRecs = allRecommendations.filter((rec) => rec.priority === "high")
      const mediumPriorityRecs = allRecommendations.filter((rec) => rec.priority === "medium")
      const lowPriorityRecs = allRecommendations.filter((rec) => rec.priority === "low")

      if (highPriorityRecs.length > 0) {
        doc.fillColor("#dc2626").text("HIGH PRIORITY RECOMMENDATIONS:", { underline: true }).fillColor("#000000")
        highPriorityRecs.forEach((rec, i) => {
          checkPageBreak(doc, 80)
          doc.text(`${i + 1}. ${rec.title}`, { indent: 20 })
          doc.text(`   ${rec.description}`, { indent: 30 })
          doc.text(`   Website: ${rec.url}`, { indent: 30 })
          doc.text(`   Estimated Impact: ${rec.estimatedImpact}`, { indent: 30 })
          doc.moveDown(0.3)
        })
        doc.moveDown()
      }

      if (mediumPriorityRecs.length > 0) {
        doc.fillColor("#f59e0b").text("MEDIUM PRIORITY RECOMMENDATIONS:", { underline: true }).fillColor("#000000")
        mediumPriorityRecs.slice(0, 10).forEach((rec, i) => {
          checkPageBreak(doc, 60)
          doc.text(`${i + 1}. ${rec.title}`, { indent: 20 })
          doc.text(`   ${rec.description}`, { indent: 30 })
          doc.text(`   Website: ${rec.url}`, { indent: 30 })
          doc.moveDown(0.3)
        })
        doc.moveDown()
      }

      if (lowPriorityRecs.length > 0) {
        doc.fillColor("#3b82f6").text("LOW PRIORITY RECOMMENDATIONS:", { underline: true }).fillColor("#000000")
        lowPriorityRecs.slice(0, 5).forEach((rec, i) => {
          checkPageBreak(doc, 40)
          doc.text(`${i + 1}. ${rec.title}`, { indent: 20 })
          doc.text(`   Website: ${rec.url}`, { indent: 30 })
        })
      }

      doc.addPage()

      // ACTION PLAN
      addSectionHeader(doc, "30-60-90 DAY ACTION PLAN", 18)

      doc
        .fontSize(14)
        .fillColor("#dc2626")
        .text("FIRST 30 DAYS - CRITICAL FIXES:", { underline: true })
        .fillColor("#000000")
        .fontSize(12)

      doc.text("□ Fix all critical technical SEO issues", { indent: 20 })
      doc.text("□ Optimize page titles and meta descriptions", { indent: 20 })
      doc.text("□ Add missing alt text to images", { indent: 20 })
      doc.text("□ Fix broken links and redirects", { indent: 20 })
      doc.text("□ Implement basic schema markup", { indent: 20 })
      doc.moveDown()

      doc
        .fontSize(14)
        .fillColor("#f59e0b")
        .text("NEXT 30 DAYS (31-60) - PERFORMANCE & CONTENT:", { underline: true })
        .fillColor("#000000")
        .fontSize(12)

      doc.text("□ Optimize page loading speed", { indent: 20 })
      doc.text("□ Improve mobile responsiveness", { indent: 20 })
      doc.text("□ Enhance content quality and keyword optimization", { indent: 20 })
      doc.text("□ Add Open Graph and Twitter Card tags", { indent: 20 })
      doc.text("□ Optimize internal linking structure", { indent: 20 })
      doc.moveDown()

      doc
        .fontSize(14)
        .fillColor("#3b82f6")
        .text("FINAL 30 DAYS (61-90) - ADVANCED OPTIMIZATION:", { underline: true })
        .fillColor("#000000")
        .fontSize(12)

      doc.text("□ Implement advanced schema markup", { indent: 20 })
      doc.text("□ Optimize for Core Web Vitals", { indent: 20 })
      doc.text("□ Create XML sitemaps", { indent: 20 })
      doc.text("□ Set up Google Search Console monitoring", { indent: 20 })
      doc.text("□ Plan content expansion strategy", { indent: 20 })

      // Footer
      doc
        .fontSize(10)
        .fillColor("#6b7280")
        .text(`Generated by SEO BoostPro on ${new Date().toLocaleDateString()}`, 50, doc.page.height - 50, {
          align: "center",
        })

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}
