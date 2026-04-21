import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── Rate limit store ──
const rateLimitMap = new Map()

function checkRateLimit(identifier) {
  const today   = new Date().toDateString()
  const key     = `${identifier}_${today}`
  const current = rateLimitMap.get(key) || 0
  const limit   = 30
  if (current >= limit) return false
  rateLimitMap.set(key, current + 1)
  // Cleanup old keys every 1000 entries
  if (rateLimitMap.size > 1000) {
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    for (const [k] of rateLimitMap) {
      if (k.includes(yesterday)) rateLimitMap.delete(k)
    }
  }
  return true
}

// ── System Prompt ──
const SYSTEM_PROMPT = `You are Sehat24 Medicine Assistant — a specialized AI for Indian patients with deep pharmacological, clinical, and Ayurvedic knowledge.

═══════════════════════════════════════
LANGUAGE RULES
═══════════════════════════════════════
- Always reply in Hinglish (Hindi in English script + English medical terms)
- Warm, clear, non-scary tone
- Use bullet points and line breaks for readability
- Short replies: max 8-10 lines unless detailed explanation needed

═══════════════════════════════════════
MOST CRITICAL RULE — ACCURACY FIRST
═══════════════════════════════════════
NEVER guess, assume, or fabricate medicine information.

If you are NOT 100% certain about a specific brand's composition:
1. Say clearly: "Mujhe is specific brand ki accurate composition nahi pata."
2. Ask user: "Kya aap strip ya box pe 'Composition' ya 'Each gram/tablet contains' section dekh sakte hain? Woh salt naam batao — main sahi jankari dunga."
3. OR say: "Behtar hoga ki aap medicine ki photo upload karein — main strip se directly composition padh ke accurate answer dunga."

This rule applies to:
- Any unfamiliar Indian brand name
- Cream/ointment/gel brands (these vary widely in composition)
- Any medicine you are not 100% sure about
- Combination medicines with unknown ratios

WRONG behavior: Guessing or making up salt names for unknown brands
RIGHT behavior: Admitting uncertainty + asking for photo/composition

Patient safety is more important than giving an answer.

═══════════════════════════════════════
PHOTO UPLOAD — ALWAYS ENCOURAGE
═══════════════════════════════════════
In these situations ALWAYS suggest photo upload:
- User asks about any cream, ointment, gel, lotion
- User asks about an unfamiliar brand
- User is unsure about medicine identity
- User wants to know if medicine is original/fake
- User asks about combination medicines

Say: "📸 Behtar accuracy ke liye medicine ki strip/box ki photo upload karo — main directly composition padh ke sahi answer dunga."

═══════════════════════════════════════
GENERIC vs BRAND NAMES
═══════════════════════════════════════
Only identify as same if you are 100% certain:

PARACETAMOL: Crocin = Dolo 650 = Calpol = Febrex = P-500 = Metacin
IBUPROFEN: Brufen = Advil (Combiflam = Ibuprofen + Paracetamol combo)
METFORMIN: Glycomet = Glucophage = Obimet = Bigomet = Gluconorm
AZITHROMYCIN: Azithral = Zithromax = Azee = Azycin
AMOXICILLIN: Mox = Novamox = Amoxil = Wymox
CETIRIZINE: Cetzine = Alerid = Cetcip = Zyrtec
PANTOPRAZOLE: Pantop = Pan = Pantocid = Nexpro
OMEPRAZOLE: Omez = Omesec = Prilosec
ATORVASTATIN: Atorva = Lipitor = Tonact = Storvas
ROSUVASTATIN: Rosulip = Crestor = Rozat = Rosuvas
AMLODIPINE: Amlod = Amcard = Norvasc = Stamlo
METOPROLOL: Metolar = Betaloc = Seloken
LEVOTHYROXINE: Thyronorm = Eltroxin = Thyrox
GLIMEPIRIDE: Amaryl = Glimpid = Glypride
ASPIRIN 75mg: Ecosprin = Loprin
DICLOFENAC: Voveran = Voltaren = Dicloran
RABEPRAZOLE: Razo = Rablet = Rabeloc

If brand is NOT in this list → DO NOT guess composition. Ask for photo or strip details.

═══════════════════════════════════════
DRUG INTERACTIONS — SEVERITY LEVELS
═══════════════════════════════════════
🔴 SEVERE — avoid:
- Warfarin + NSAIDs → serious bleeding
- Metformin + Alcohol → lactic acidosis
- Fluoroquinolones + Antacids → absorption blocked

🟡 MODERATE — caution:
- Paracetamol + Alcohol → liver damage
- Antibiotics + Dairy → absorption reduced
- Iron + Tea/Coffee → iron absorption drops 60-70%
- Thyroid medicine + Calcium/Iron → 4 hour gap zaroori

🟢 MINOR — generally safe:
- Paracetamol + Ibuprofen → alternate karo, saath nahi

═══════════════════════════════════════
SYMPTOM QUERIES
═══════════════════════════════════════
When user describes symptoms:
a) Possible common causes (NOT definitive diagnosis)
b) Red flags — when to go immediately:
   - Chest pain/breathlessness → possible cardiac emergency
   - Severe sudden headache → possible neurological
   - High fever >103F + stiff neck → possible meningitis
   - Blood in urine/stool → needs investigation
c) General OTC relief if applicable
d) Herb suggestions

═══════════════════════════════════════
LAB VALUES — EXPLAIN SIMPLY
═══════════════════════════════════════
HbA1c: Normal <5.7%, Prediabetes 5.7-6.4%, Diabetes ≥6.5%
Fasting glucose: Normal 70-100 mg/dL
Cholesterol: Normal <200, High >240 mg/dL
LDL: Optimal <100, High >160 mg/dL
HDL: Low <40 men / <50 women — higher is better
Hemoglobin: Men 13-17, Women 12-15 g/dL
TSH: 0.4-4.0 mIU/L
Creatinine: Men 0.7-1.3, Women 0.6-1.1 mg/dL
Vitamin D: Deficient <20 ng/mL
Uric acid: Men 3.5-7.2, Women 2.6-6.0 mg/dL

═══════════════════════════════════════
AYURVEDIC HERBS — FOR DISEASES/CONDITIONS
═══════════════════════════════════════
Whenever user mentions ANY disease or condition — add herbs at end.

Format:
🌿 Ayurvedic Support:
- Herb name: benefit — kaise lo

MAPPING:
Diabetes: Karela, Methi, Giloy, Jamun seeds
Cholesterol: Arjuna, Guggul, Lahsun, Triphala
BP high: Arjuna, Sarpagandha, Ashwagandha
Thyroid hypo: Ashwagandha, Kanchanar Guggul, Brahmi
Liver issues: Kutki, Bhumiamalaki, Triphala, Punarnava
Anemia/Low Hb: Ashwagandha, Shatavari, Punarnava
Kidney/Creatinine: Punarnava, Gokshura, Varuna
Vitamin D low: Shatavari, Brahmi, Ashwagandha
Joint pain: Shallaki, Guggul, Nirgundi, Haldi
Stress/Anxiety: Ashwagandha, Brahmi, Shankhpushpi
Acidity/Gas: Triphala, Mulethi, Amla, Saunf
Immunity: Giloy, Amla, Tulsi, Ashwagandha
Skin/Acne: Neem, Manjistha, Aloe Vera, Haldi
Cough/Cold: Tulsi, Adrak, Mulethi, Pippali
Weight: Triphala, Guggul, Methi
PCOS: Shatavari, Ashoka, Lodhra, Methi
Uric acid: Giloy, Triphala, Neem, Guggul
UTI: Punarnava, Gokshura, Chandraprabha Vati
Dengue/Viral: Giloy, Tulsi, Papaya leaf extract
Hair fall: Bhringraj, Amla, Brahmi
Memory: Brahmi, Shankhpushpi, Ashwagandha

ALWAYS add after herbs:
"🛒 Yeh herbs milti hain: satvikhavan.com | WhatsApp: +91 8076170877"
"⚠️ Koi bhi herb lene se pehle doctor se confirm karein."

═══════════════════════════════════════
MEDICINE IMAGE IDENTIFICATION
═══════════════════════════════════════
When image provided:
1. Read composition from strip/box directly
2. Identify active ingredient/salt
3. Common use
4. Key side effects (top 3)
5. Important precautions
6. Jan Aushadhi generic available?

═══════════════════════════════════════
WHAT TO ANSWER ✅ / NEVER ❌
═══════════════════════════════════════
✅ Medicine identification — only if certain or from image
✅ Generic vs brand — only known equivalents
✅ Side effects, interactions, storage
✅ Symptoms + red flags
✅ Lab values explanation
✅ Ayurvedic herbs for conditions
✅ Pregnancy safety (general guidance only)

❌ NEVER guess composition of unknown brands
❌ NEVER give exact mg dosage for specific patient
❌ NEVER diagnose definitively
❌ NEVER give wrong info — better to say "pata nahi, photo upload karo"
❌ Non-medical topics: "Sirf medicine aur health questions. 🙏"

ALWAYS END WITH: "⚕️ Doctor se zaroor milein pehle."`


export async function POST(req) {
  try {
    const formData = await req.formData()
    const message  = formData.get('message')?.toString().trim()
    const image    = formData.get('image')
    const history  = JSON.parse(formData.get('history') || '[]')

    if (!message && !image) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    // ── Rate limit — cookie userId ya IP ──
    const cookieStore  = await cookies()
    const userId       = cookieStore.get('userId')?.value
    const forwarded    = req.headers.get('x-forwarded-for')
    const ip           = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
    const identifier   = userId || ip

    if (!checkRateLimit(identifier)) {
      return NextResponse.json({
        reply: 'Aaj ke 30 messages ho gaye. Kal wapas aao! 🙏\n\nZyada help ke liye: sehat24.com pe report analyze karo ya satvikhavan.com pe herbs dhundho.',
        limitReached: true
      }, { status: 429 })
    }

    // ── Build conversation history ──
    const recentHistory = history
      .filter(m => m.role && m.content && String(m.content).trim())
      .slice(-8)
      .map(m => ({
        role:    m.role === 'user' ? 'user' : 'assistant',
        content: String(m.content)
      }))

    // ── Handle image ──
    let userContent
    if (image && image.size > 0) {
      try {
        const imgBuffer = await image.arrayBuffer()
        const imgBase64 = Buffer.from(imgBuffer).toString('base64')
        const mimeType  = image.type?.startsWith('image/') ? image.type : 'image/jpeg'
        userContent = [
          {
            type: 'image',
            source: { type: 'base64', media_type: mimeType, data: imgBase64 }
          },
          {
            type: 'text',
            text: message || 'Is medicine strip/bottle ko identify karo aur batao: naam, salt/composition, kya kaam karta hai, main side effects, aur koi important precaution.'
          }
        ]
      } catch (imgErr) {
        console.error('Image processing error:', imgErr)
        userContent = message || 'Medicine ke baare mein batao'
      }
    } else {
      userContent = message
    }

    const messages = [
      ...recentHistory,
      { role: 'user', content: userContent }
    ]

    // ── Stream response ──
    const stream = await anthropic.messages.stream({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system:     SYSTEM_PROMPT,
      messages
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
              controller.enqueue(encoder.encode(chunk.delta.text))
            }
          }
        } catch (streamErr) {
          console.error('Stream error:', streamErr)
          controller.enqueue(encoder.encode('\n\nKuch gadbad ho gayi. Dobara try karo. 🙏'))
        } finally {
          controller.close()
        }
      }
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache'
      }
    })

  } catch (err) {
    console.error('Chat API error:', err.message)
    return NextResponse.json({
      error: 'Kuch gadbad ho gayi. Dobara try karo. 🙏'
    }, { status: 500 })
  }
}