const PDFDocument = require("pdfkit")
const fs = require("fs")
const path = require("path")

module.exports = async function generatePDF(content, type) {
  return new Promise((resolve, reject) => {
    const filename = `${type}_report_${Date.now()}.pdf`
    const filePath = path.join(__dirname, "..", "reports", filename)

    const doc = new PDFDocument()
    doc.pipe(fs.createWriteStream(filePath))

    doc.fontSize(20).text(content.title, { underline: true })
    doc.fontSize(12).text(`Generated on: ${content.date.toLocaleString()}`)

    doc.moveDown()

    doc.fontSize(14).text(`Overall Score: ${content.score}`)
    doc.moveDown()

    if (type === "summary") {
      doc.text("Top Issues:")
      content.topIssues?.forEach((issue, idx) => {
        doc.text(`${idx + 1}. ${issue.description || issue}`)
      })

      doc.moveDown()
      doc.text("Recommendations:")
      content.recommendations?.forEach((rec, idx) => {
        doc.text(`${idx + 1}. ${rec}`)
      })
    } else if (type === "comprehensive") {
      doc.text("Technical SEO Metrics:")
      doc.text(JSON.stringify(content.technicalDetails, null, 2))
      doc.addPage()

      doc.text("All SEO Issues:")
      doc.text(JSON.stringify(content.fullIssues, null, 2))

      doc.addPage()
      doc.text("Full Recommendations:")
      doc.text(JSON.stringify(content.fullRecommendations, null, 2))

      doc.addPage()
      doc.text("Real-time Metrics:")
      doc.text(JSON.stringify(content.realTimeMetrics, null, 2))
    }

    doc.end()

    doc.on("finish", () => resolve(filePath))
    doc.on("error", (err) => reject(err))
  })
}
