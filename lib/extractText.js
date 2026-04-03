// export async function extractTextFromPDF(buffer) {
//   try {
//     // Dynamic import — server side only
//     const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
    
//     // Worker disable karo Node.js environment mein
//     pdfjsLib.GlobalWorkerOptions.workerSrc = ''
    
//     const loadingTask = pdfjsLib.getDocument({
//       data: new Uint8Array(buffer),
//       useWorkerFetch: false,
//       isEvalSupported: false,
//       useSystemFonts: true,
//     })
    
//     const pdf = await loadingTask.promise
//     let fullText = ''
    
//     for (let i = 1; i <= pdf.numPages; i++) {
//       const page = await pdf.getPage(i)
//       const textContent = await page.getTextContent()
//       const pageText = textContent.items
//         .map(item => item.str)
//         .join(' ')
//       fullText += pageText + '\n'
//     }
    
//     return fullText.trim()
    
//   } catch (err) {
//     console.error('PDF extract error:', err.message)
//     return ''
//   }
// }

// export function isTextSufficient(text) {
//   return text.length > 100
// }

export function cleanReportText(rawText) {
  const lines = rawText.split('\n')

  const uselessPatterns = [
    /^(address|phone|tel|fax|email|website|www|http)/i,
    /^(plot|house|flat|building|floor|near|opp|behind)/i,
    /^(this report|results should|please note|disclaimer|note:)/i,
    /^(for queries|contact us|helpline|toll free)/i,
    /^(accredited|approved|certified|iso|nabl|cap)/i,
    /^.{0,2}$/,
    /^page \d+/i,
    /^\d+\/\d+$/,
    /^[-=_*]{3,}$/,
    /^(dr\.|md|mbbs|consultant|pathologist|verified by)/i,
    /^(digitally signed|signature|stamp)/i,
    /^(sample collected|collected at|reported on|received on)/i,
    /^(barcode|sample id|lab no|ref no|order id)/i,
  ]

  const usefulLines = lines.filter(line => {
    const trimmed = line.trim()
    if (!trimmed) return false
    return !uselessPatterns.some(pattern => pattern.test(trimmed))
  })

  return usefulLines.join('\n').substring(0, 6000)
}
