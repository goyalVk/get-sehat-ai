/**
 * SEHAT24 — AI BUG TEST SCRIPT
 *
 * Tests all known AI bugs with a synthetic lab report
 * Run: node scripts/test_ai_bugs.mjs
 *
 * Bugs being tested:
 * 1. Zero Value Bug    — Basophil=0, range 1-10 → should be LOW
 * 2. Boundary Bug      — Monocytes=8.3, range 3-9 → should be NORMAL (within 5%)
 * 3. Boundary Bug 2    — Hemoglobin=13.0, range 12-16 → should be NORMAL
 * 4. Boundary Bug 3    — Platelet=1.45, range 1.5-4.5 → should be NORMAL
 * 5. Platelet Lac Unit — Platelet=164, range 1.5-4.5 → should be NORMAL (1.64 Lac)
 * 6. Indian Comma      — Platelet=4,33,000, range 1.5-4.0 Lac → should be HIGH
 * 7. Wrong Range       — Blood Sugar=90, range=140-160 → AI should set null range
 * 8. Summary Rule      — If any abnormal → summary MUST mention it
 * 9. Veg Only          — Lifestyle must NOT suggest non-veg food
 * 10. Ratio Rule       — LDL/HDL=2.4, no range → should use clinical knowledge
 */

import Anthropic from '@anthropic-ai/sdk'
import dotenv from 'dotenv'
import fs from 'fs'
dotenv.config({ path: '.env.local' })

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

// ── Import your actual prompt ─────────────────────────
// Adjust path as needed
import { buildHealthPrompt } from '../lib/healthPrompt.js'

// ── Synthetic lab report text ─────────────────────────
// This simulates what AI would read from an image
const SYNTHETIC_REPORT = `
KAIZAR DIAGNOSTIC CENTRE
Patient: RAHUL SHARMA | Age: 28Y | Gender: Male
Date: 01-May-2026

COMPLETE BLOOD COUNT WITH BIOCHEMISTRY
Lab Ref: TEST-2026-001

HEMATOLOGY
------------------------------------------------------------
Parameter            Value     Unit        Reference Range
------------------------------------------------------------
Hemoglobin           13.0      g/dL        12.0 - 16.0
WBC Total            6.5       10^3/uL     4.0 - 11.0
RBC Count            4.8       million/uL  4.5 - 5.5
Platelet Count       164       Lac/cumm    1.5 - 4.5
Neutrophils          68.5      %           50 - 70
Lymphocytes          25.0      %           20 - 40
Monocytes            8.3       %           3.0 - 9.0
Eosinophils          2.5       %           0.5 - 10.0
Basophils            00        %           01 - 10
MCV                  88.0      fL          80 - 100
MCH                  28.5      pg          27 - 33
MCHC                 34.49     g/dL        31.5 - 34.5
RDW-CV               13.5      %           11.0 - 15.0

DIFFERENTIAL COUNT (Absolute)
------------------------------------------------------------
Neutrophils Abs      4.45      10^3/uL     2.0 - 7.0
Lymphocytes Abs      1.63      10^3/uL     0.8 - 4.0
Monocytes Abs        0.54      10^3/uL     0.1 - 1.0
Eosinophils Abs      0.16      10^3/uL     0.04 - 0.5
Basophils Abs        0.00      10^3/uL     0.02 - 0.10

BIOCHEMISTRY
------------------------------------------------------------
Random Blood Sugar   90.08     mg/dL       140-160
Serum Creatinine     0.9       mg/dL       0.7 - 1.2
SGOT AST             35        IU/L        0 - 40
SGPT ALT             28        IU/L        0 - 40
Total Cholesterol    185       mg/dL       0 - 200
LDL Cholesterol      110       mg/dL       0 - 130
HDL Cholesterol      45        mg/dL       40 - 60
LDL/HDL Ratio        2.44
Triglycerides        140       mg/dL       0 - 150

SPECIAL TESTS
------------------------------------------------------------
Platelet Count 2     4,33,000  cells/mcL   150000 - 400000
Platelet Count 3     1.45      Lac/cumm    1.5 - 4.5

------------------------------------------------------------
Verified by: Dr. Suresh Lab Technician
`

// ── Expected results for each parameter ──────────────
const EXPECTED_RESULTS = [
  {
    param: 'Hemoglobin',
    value: '13.0',
    range: '12.0-16.0',
    expectedStatus: 'normal',
    bug: 'Boundary Bug — 13.0 > lower boundary 12.0, within normal range'
  },
  {
    param: 'Monocytes',
    value: '8.3',
    range: '3.0-9.0',
    expectedStatus: 'normal',
    bug: 'Boundary Bug — 8.3 within 5% of upper 9 → normal, not high'
  },
  {
    param: 'MCHC',
    value: '34.49',
    range: '31.5-34.5',
    expectedStatus: 'normal',
    bug: 'Boundary Bug — 34.49 within 5% of upper 34.5 → normal, not high'
  },
  {
    param: 'Basophils',
    value: '00',
    range: '01-10',
    expectedStatus: 'low',
    bug: 'Zero Value Bug — value=00, range starts at 1 → MUST be low'
  },
  {
    param: 'Basophils Abs',
    value: '0.00',
    range: '0.02-0.10',
    expectedStatus: 'low',
    bug: 'Zero Value Bug — value=0.00, range starts at 0.02 → MUST be low'
  },
  {
    param: 'Platelet Count',
    value: '164',
    range: '1.5-4.5',
    expectedStatus: 'normal',
    bug: 'Platelet Lac Unit — 164 in hundreds = 1.64 Lac → NORMAL'
  },
  {
    param: 'Random Blood Sugar',
    value: '90.08',
    range: '140-160',
    expectedStatus: 'normal',
    bug: 'Wrong Range — 140-160 is wrong range for Random Blood Sugar. AI should use clinical knowledge: 90 = normal'
  },
  {
    param: 'Platelet Count 2',
    value: '4,33,000',
    range: '150000-400000',
    expectedStatus: 'high',
    bug: 'Indian Comma Format — 4,33,000 = 433000 > 400000 → HIGH'
  },
  {
    param: 'Platelet Count 3',
    value: '1.45',
    range: '1.5-4.5',
    expectedStatus: 'normal',
    bug: 'Boundary Bug — 1.45 within 5% of lower 1.5 → NORMAL not low'
  },
  {
    param: 'LDL/HDL Ratio',
    value: '2.44',
    range: null,
    expectedStatus: 'normal',
    bug: 'Ratio Rule — No range printed. Clinical knowledge: 2.44 < 3.5 → NORMAL'
  },
]

// ── Non-veg words to check ────────────────────────────
const NON_VEG_WORDS = [
  'chicken', 'meat', 'fish', 'egg', 'mutton', 'beef',
  'pork', 'lamb', 'prawn', 'shrimp', 'seafood', 'salmon',
  'tuna', 'turkey', 'bacon', 'murghi', 'machli', 'anda'
]

// ── Run test ──────────────────────────────────────────
async function runTest() {
  console.log('\n' + '═'.repeat(65))
  console.log('  SEHAT24 — AI BUG TEST')
  console.log(`  ${new Date().toLocaleString('en-IN')}`)
  console.log('═'.repeat(65))

  console.log('\n📤 Sending synthetic report to Claude...\n')

  let aiResponse = null
  let parseError = null

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: [{
          type: 'text',
          text: buildHealthPrompt(
            `Extract ALL medical test values from this lab report text:\n\n${SYNTHETIC_REPORT}`
          )
        }]
      }]
    })

    let raw = response.content[0].text.trim()
    raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()
    aiResponse = JSON.parse(raw)

    console.log('✅ AI responded successfully\n')

  } catch (err) {
    parseError = err.message
    console.error('❌ AI response failed:', err.message)
    process.exit(1)
  }

  // ── Check each bug ────────────────────────────────
  const results = []
  const params  = aiResponse.parameters || []

  console.log('─'.repeat(65))
  console.log('  PARAMETER TEST RESULTS')
  console.log('─'.repeat(65))

  for (const expected of EXPECTED_RESULTS) {
    // Find parameter in AI response
    const found = params.find(p =>
      p.name?.toLowerCase().includes(expected.param.toLowerCase()) ||
      expected.param.toLowerCase().includes(p.name?.toLowerCase())
    )

    if (!found) {
      results.push({
        param:    expected.param,
        status:   'NOT_FOUND',
        passed:   false,
        expected: expected.expectedStatus,
        got:      'N/A',
        bug:      expected.bug
      })

      console.log(`\n⚠️  PARAM NOT FOUND: ${expected.param}`)
      console.log(`   Bug: ${expected.bug}`)
      continue
    }

    const passed = found.status === expected.expectedStatus

    results.push({
      param:       expected.param,
      status:      passed ? 'PASS' : 'FAIL',
      passed,
      expected:    expected.expectedStatus,
      got:         found.status,
      value:       found.value,
      range:       found.reference_range,
      explanation: found.explanation,
      action:      found.action,
      bug:         expected.bug
    })

    const icon = passed ? '✅' : '🔴'
    console.log(`\n${icon} ${expected.param}`)
    console.log(`   Value:       ${found.value}`)
    console.log(`   Range in DB: ${found.reference_range || 'null'}`)
    console.log(`   Expected:    ${expected.expectedStatus}`)
    console.log(`   AI Said:     ${found.status}  ${passed ? '' : '← WRONG'}`)
    console.log(`   Bug:         ${expected.bug}`)
    console.log(`   Explanation: "${found.explanation}"`)
  }

  // ── Check summary ─────────────────────────────────
  console.log('\n' + '─'.repeat(65))
  console.log('  SUMMARY RULE TEST')
  console.log('─'.repeat(65))

  const summary       = aiResponse.summary || ''
  const hasAbnormal   = params.some(p => p.status !== 'normal')
  const summaryOk     = hasAbnormal
    ? !summary.toLowerCase().includes('sab normal') &&
      !summary.toLowerCase().includes('bilkul theek') &&
      !summary.toLowerCase().includes('sab theek')
    : true

  console.log(`\n  Has abnormal params: ${hasAbnormal}`)
  console.log(`  Summary: "${summary}"`)
  console.log(`  Summary rule: ${summaryOk ? '✅ PASS' : '🔴 FAIL — says all normal when abnormal exists'}`)

  // ── Check non-veg ─────────────────────────────────
  console.log('\n' + '─'.repeat(65))
  console.log('  VEGETARIAN FOOD TEST')
  console.log('─'.repeat(65))

  const lifestyle     = aiResponse.lifestyle || {}
  const lifestyleText = JSON.stringify(lifestyle).toLowerCase()
  const foundNonVeg   = NON_VEG_WORDS.filter(w => lifestyleText.includes(w))
  const vegOk         = foundNonVeg.length === 0

  console.log(`\n  Diet suggestion: "${lifestyle.diet}"`)
  console.log(`  Non-veg words found: ${foundNonVeg.length > 0 ? foundNonVeg.join(', ') : 'None'}`)
  console.log(`  Veg only rule: ${vegOk ? '✅ PASS' : '🔴 FAIL — non-veg suggested: ' + foundNonVeg.join(', ')}`)

  // ── Check herb cautions ───────────────────────────
  console.log('\n' + '─'.repeat(65))
  console.log('  HERB CAUTION TEST')
  console.log('─'.repeat(65))

  const herbs = aiResponse.ayurvedic_herbs || []
  let herbOk  = true
  herbs.forEach((h, i) => {
    const hasDoctor = h.caution?.toLowerCase().includes('doctor')
    if (!hasDoctor) herbOk = false
    console.log(`\n  Herb ${i+1}: ${h.name}`)
    console.log(`  Caution: "${h.caution}"`)
    console.log(`  Doctor mentioned: ${hasDoctor ? '✅' : '🔴 MISSING'}`)
  })

  // ── Final Score ───────────────────────────────────
  console.log('\n' + '═'.repeat(65))
  console.log('  FINAL TEST SCORE')
  console.log('═'.repeat(65))

  const paramsPassed = results.filter(r => r.passed).length
  const paramsTotal  = results.length
  const paramScore   = ((paramsPassed / paramsTotal) * 100).toFixed(0)

  console.log(`\n  Parameter Tests: ${paramsPassed}/${paramsTotal} passed (${paramScore}%)`)
  console.log(`  Summary Rule:    ${summaryOk ? 'PASS ✅' : 'FAIL 🔴'}`)
  console.log(`  Veg Only Rule:   ${vegOk ? 'PASS ✅' : 'FAIL 🔴'}`)
  console.log(`  Herb Caution:    ${herbOk ? 'PASS ✅' : 'FAIL 🔴'}`)

  const allPassed = paramsPassed === paramsTotal && summaryOk && vegOk && herbOk

  console.log('')
  if (allPassed) {
    console.log('  🎉 ALL TESTS PASSED — AI bugs fixed!')
  } else {
    console.log('  ⚠️  SOME TESTS FAILED — check above details')
    console.log('\n  Failed parameters:')
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  → ${r.param}: expected=${r.expected}, got=${r.got}`)
    })
  }

  // ── Save full result ──────────────────────────────
  const output = {
    testedAt:       new Date().toISOString(),
    score:          `${paramsPassed}/${paramsTotal}`,
    allPassed,
    summaryOk,
    vegOk,
    herbOk,
    paramResults:   results,
    aiFullResponse: aiResponse
  }

  fs.writeFileSync('ai_bug_test_result.json',
    JSON.stringify(output, null, 2), 'utf8')

  console.log('\n✅ Full result saved: ai_bug_test_result.json')
  console.log('═'.repeat(65) + '\n')
}

runTest().catch(err => {
  console.error('❌ Test failed:', err.message)
  process.exit(1)
})
