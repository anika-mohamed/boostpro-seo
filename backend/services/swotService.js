exports.generateSwotWithRules = (auditData) => {
    const swot = {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
    }
  
    const { pageSpeedData, technicalSeo, overallScore, seoIssues } = auditData
  
    // Analyze strengths
    if (overallScore >= 80) {
      swot.strengths.push("Strong overall SEO performance")
    }
  
    if (pageSpeedData?.desktop?.score >= 90) {
      swot.strengths.push("Excellent desktop performance")
    }
  
    if (pageSpeedData?.mobile?.score >= 90) {
      swot.strengths.push("Excellent mobile performance")
    }
  
    if (technicalSeo?.metaTitle?.exists && technicalSeo.metaTitle.length <= 60) {
      swot.strengths.push("Well-optimized meta title")
    }
  
    if (technicalSeo?.metaDescription?.exists && technicalSeo.metaDescription.length <= 160) {
      swot.strengths.push("Good meta description implementation")
    }
  
    if (technicalSeo?.headings?.h1Count === 1) {
      swot.strengths.push("Proper H1 tag structure")
    }
  
    if (technicalSeo?.images?.withoutAlt === 0) {
      swot.strengths.push("All images have alt text")
    }
  
    // Analyze weaknesses
    if (overallScore < 60) {
      swot.weaknesses.push("Poor overall SEO performance needs immediate attention")
    }
  
    if (pageSpeedData?.desktop?.score < 70) {
      swot.weaknesses.push("Desktop performance is below average")
    }
  
    if (pageSpeedData?.mobile?.score < 70) {
      swot.weaknesses.push("Mobile performance needs significant improvement")
    }
  
    if (!technicalSeo?.metaTitle?.exists) {
      swot.weaknesses.push("Missing meta title tag")
    }
  
    if (!technicalSeo?.metaDescription?.exists) {
      swot.weaknesses.push("Missing meta description")
    }
  
    if (technicalSeo?.headings?.h1Count === 0) {
      swot.weaknesses.push("No H1 tag found on the page")
    }
  
    if (technicalSeo?.headings?.h1Count > 1) {
      swot.weaknesses.push("Multiple H1 tags detected")
    }
  
    if (technicalSeo?.images?.withoutAlt > 0) {
      swot.weaknesses.push(`${technicalSeo.images.withoutAlt} images missing alt text`)
    }
  
    // Analyze opportunities
    if (pageSpeedData?.desktop?.score < 90 && pageSpeedData?.desktop?.score >= 70) {
      swot.opportunities.push("Desktop performance can be optimized further")
    }
  
    if (pageSpeedData?.mobile?.score < 90 && pageSpeedData?.mobile?.score >= 70) {
      swot.opportunities.push("Mobile performance has room for improvement")
    }
  
    if (technicalSeo?.schema?.exists === false) {
      swot.opportunities.push("Implement structured data markup for better search visibility")
    }
  
    if (technicalSeo?.headings?.h2Count < 3) {
      swot.opportunities.push("Add more H2 headings to improve content structure")
    }
  
    if (seoIssues?.length > 0 && seoIssues.length <= 5) {
      swot.opportunities.push("Address identified SEO issues for quick wins")
    }
  
    // Analyze threats
    if (pageSpeedData?.mobile?.score < 50) {
      swot.threats.push("Poor mobile performance may hurt mobile-first indexing")
    }
  
    if (seoIssues?.length > 10) {
      swot.threats.push("High number of SEO issues may impact search rankings")
    }
  
    if (!technicalSeo?.metaTitle?.exists || !technicalSeo?.metaDescription?.exists) {
      swot.threats.push("Missing meta tags may reduce search visibility")
    }
  
    if (technicalSeo?.links?.broken > 0) {
      swot.threats.push("Broken links may negatively impact user experience and SEO")
    }
  
    // Ensure each category has at least one item
    if (swot.strengths.length === 0) {
      swot.strengths.push("Website is functional and accessible")
    }
  
    if (swot.weaknesses.length === 0) {
      swot.weaknesses.push("Minor optimizations needed for better performance")
    }
  
    if (swot.opportunities.length === 0) {
      swot.opportunities.push("Potential for SEO improvements exists")
    }
  
    if (swot.threats.length === 0) {
      swot.threats.push("Competitive landscape requires ongoing optimization")
    }
  
    return swot
  }
  