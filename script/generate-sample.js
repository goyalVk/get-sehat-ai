// scripts/generate-sample.js
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib')
const fs = require('fs')
const path = require('path')

async function generate() {
  const doc  = await PDFDocument.create()
  const page = doc.addPage([595, 842])
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)

  const draw = (text, x, y, size = 11, f = font, color = rgb(0,0,0)) =>
    page.drawText(String(text), { x, y, size, font: f, color })

  // Header
  page.drawRectangle({ x: 0, y: 792, width: 595, height: 50, color: rgb(0.05, 0.58, 0.53) })
  draw('SRL Diagnostics', 40, 812, 16, bold, rgb(1,1,1))
  draw('Complete Blood Count (CBC) Report', 40, 797, 10, font, rgb(0.9,1,1))

  // Patient Info
  draw('Patient Name: Rahul Sharma', 40, 758, 10, bold)
  draw('Age: 35 Years  |  Gender: Male  |  Sample ID: SRL2024031501', 40, 743, 9)
  draw('Collected: 15 Mar 2024  |  Reported: 15 Mar 2024  |  Ref by: Dr. Priya Singh', 40, 728, 9)

  page.drawLine({ start: {x:40,y:718}, end: {x:555,y:718}, thickness: 1, color: rgb(0.9,0.9,0.9) })

  // Table Header
  draw('TEST NAME',       40,  700, 9, bold)
  draw('RESULT',         240,  700, 9, bold)
  draw('UNIT',           310,  700, 9, bold)
  draw('REFERENCE RANGE',390,  700, 9, bold)
  draw('STATUS',         510,  700, 9, bold)
  page.drawLine({ start: {x:40,y:692}, end: {x:555,y:692}, thickness: 0.5, color: rgb(0.8,0.8,0.8) })

  const params = [
    ['Haemoglobin (Hb)',    '13.2', 'g/dL',         '13.0 - 17.0',  'Normal'],
    ['RBC Count',           '4.8',  'million/uL',    '4.5 - 5.5',    'Normal'],
    ['WBC Count',           '3.2',  'thousand/uL',   '4.0 - 11.0',   'LOW'],
    ['Platelet Count',      '180',  'thousand/uL',   '150 - 400',    'Normal'],
    ['Haematocrit (PCV)',   '42',   '%',              '40 - 50',      'Normal'],
    ['MCV',                 '88',   'fL',             '80 - 100',     'Normal'],
    ['MCH',                 '29',   'pg',             '27 - 32',      'Normal'],
    ['MCHC',                '33',   'g/dL',           '32 - 36',      'Normal'],
    ['Neutrophils',         '58',   '%',              '50 - 70',      'Normal'],
    ['Lymphocytes',         '32',   '%',              '20 - 40',      'Normal'],
    ['Eosinophils',         '4',    '%',              '1 - 6',        'Normal'],
    ['Monocytes',           '6',    '%',              '2 - 8',        'Normal'],
  ]

  params.forEach(([name, val, unit, range, status], i) => {
    const y       = 680 - (i * 20)
    const isLow   = status === 'LOW'
    const bgColor = isLow ? rgb(1, 0.95, 0.95) : i % 2 === 0 ? rgb(0.98,0.98,0.98) : rgb(1,1,1)

    page.drawRectangle({ x: 38, y: y - 6, width: 519, height: 18, color: bgColor })

    const tc = isLow ? rgb(0.8, 0, 0) : rgb(0.1,0.1,0.1)
    draw(name,   40,  y + 4, 9, isLow ? bold : font, tc)
    draw(val,    240, y + 4, 9, isLow ? bold : font, tc)
    draw(unit,   310, y + 4, 9, font)
    draw(range,  390, y + 4, 9, font)
    draw(status, 510, y + 4, 9, isLow ? bold : font, tc)
  })

  // Footer
  page.drawRectangle({ x: 0, y: 0, width: 595, height: 40, color: rgb(0.97,0.97,0.97) })
  draw('Note: LOW = Below normal range, HIGH = Above normal range', 40, 22, 8, font, rgb(0.5,0.5,0.5))
  draw('This is a SAMPLE report for demo purposes only. Sehat24.com', 40, 10, 8, font, rgb(0.5,0.5,0.5))

  const bytes    = await doc.save()
  const outPath  = path.join(__dirname, '..', 'public', 'sample-report.pdf')
  fs.writeFileSync(outPath, bytes)
  console.log('✅ Sample report generated at public/sample-report.pdf')
}

generate().catch(console.error)