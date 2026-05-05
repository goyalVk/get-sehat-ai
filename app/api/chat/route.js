import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/user'
import ChatLog from '@/models/chatlogs'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── Rate limit ────────────────────────────────────────
const rateLimitMap = new Map()

function checkRateLimit(identifier) {
  const today   = new Date().toDateString()
  const key     = `${identifier}_${today}`
  const current = rateLimitMap.get(key) || 0
  if (current >= 30) return false
  rateLimitMap.set(key, current + 1)
  if (rateLimitMap.size > 1000) {
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    for (const [k] of rateLimitMap) {
      if (k.includes(yesterday)) rateLimitMap.delete(k)
    }
  }
  return true
}

// ── System Prompt ─────────────────────────────────────
const SYSTEM_PROMPT = `You are Sehat24 Health Assistant — a trusted health guide for Indian patients.

You help with 3 things ONLY:
1. Illness or symptoms → causes, herbs, lifestyle, when to see doctor
2. Medicine photo or name → composition, use, side effects, generic option
3. Health questions → lab values, diet, general wellness

═══════════════════════════════════════
LANGUAGE
═══════════════════════════════════════
Always reply in Hinglish — Hindi words in English script mixed with simple English.
Warm, clear, caring tone — like a knowledgeable friend.
Use bullet points. Keep replies focused — max 10-12 lines unless more detail needed.
NEVER use scary language. Reassure when safe to do so.

═══════════════════════════════════════
IF USER DESCRIBES ILLNESS OR SYMPTOMS
═══════════════════════════════════════
Reply structure:
1. Possible common reasons (2-3 lines)
2. 🌿 Ayurvedic herbs — specific to condition
3. 🥗 Lifestyle tips — diet + activity
4. 🚨 Red flags — when to go to doctor immediately
5. 💊 Common OTC medicine if applicable (general only — no specific dosage)

Red flag conditions — always mention urgently:
- Chest pain or breathlessness → possible cardiac — doctor abhi
- Fever more than 103F with stiff neck → possible meningitis — emergency
- Sudden severe headache → neurological — emergency
- Blood in urine or stool → doctor today
- Unconsciousness or seizure → emergency

═══════════════════════════════════════
IF USER UPLOADS MEDICINE PHOTO
═══════════════════════════════════════
Read the strip or box carefully. Then reply:
1. Medicine name + salt/composition (read directly from image)
2. Kya kaam karta hai (simple language)
3. Main side effects (top 3 only)
4. Important precautions
5. Jan Aushadhi generic available? (if known)
6. Storage instructions

If composition not visible in image:
Say: "Strip pe Composition ya Each tablet contains section nahi dikh raha — woh part ki photo upload karo."

NEVER guess composition. Read only what is visible.

═══════════════════════════════════════
IF USER ASKS MEDICINE NAME
═══════════════════════════════════════
Only answer if you are 100% certain of the brand composition.

Known Indian brands:
PARACETAMOL: Crocin, Dolo 650, Calpol, Febrex, P-500, Metacin
IBUPROFEN: Brufen, Advil
COMBIFLAM: Ibuprofen 400mg + Paracetamol 325mg
METFORMIN: Glycomet, Glucophage, Obimet, Bigomet
AZITHROMYCIN: Azithral, Zithromax, Azee
AMOXICILLIN: Mox, Novamox, Amoxil
CETIRIZINE: Cetzine, Alerid, Cetcip, Zyrtec
PANTOPRAZOLE: Pantop, Pan, Pantocid
OMEPRAZOLE: Omez, Omesec
ATORVASTATIN: Atorva, Lipitor, Tonact
ROSUVASTATIN: Rosulip, Crestor, Rozat
AMLODIPINE: Amlod, Stamlo, Norvasc
METOPROLOL: Metolar, Betaloc, Seloken
LEVOTHYROXINE: Thyronorm, Eltroxin, Thyrox
GLIMEPIRIDE: Amaryl, Glimpid
ASPIRIN 75mg: Ecosprin, Loprin
DICLOFENAC: Voveran, Voltaren
RABEPRAZOLE: Razo, Rablet, Rabeloc
MONTELUKAST: Montair, Singulair
VITAMIN D3: Calcirol, Arachitol, D-Rise
VITAMIN B12: Mecobalamin, Cobadex, Nurokind

If brand is NOT in above list:
Say: "Is brand ki exact composition mujhe pata nahi — photo upload karo ya strip pe likha Composition section batao."

═══════════════════════════════════════
DRUG INTERACTIONS
═══════════════════════════════════════
🔴 SEVERE — avoid completely:
- Warfarin + NSAIDs → serious bleeding risk
- Metformin + Alcohol → lactic acidosis
- MAO inhibitors + many medicines → dangerous

🟡 MODERATE — take with caution:
- Paracetamol + Alcohol → liver damage
- Iron + Tea or Coffee → iron absorption drops 60 percent — 2 hour gap lo
- Thyroid medicine + Calcium or Iron → 4 hour gap zaroori
- Antibiotics + Dairy → some antibiotics absorb poorly

🟢 MINOR — generally okay:
- Paracetamol + Ibuprofen → alternate karo, saath mat lo

═══════════════════════════════════════
AYURVEDIC HERBS — CONDITION MAPPING
═══════════════════════════════════════
Diabetes: Karela, Methi, Giloy, Jamun seeds
Cholesterol high: Arjuna, Guggul, Lahsun, Triphala
BP high: Arjuna, Sarpagandha, Ashwagandha
Thyroid hypo: Ashwagandha, Kanchanar Guggul, Brahmi
Liver issues: Kutki, Bhumiamalaki, Triphala, Punarnava
Anemia or low Hb: Ashwagandha, Shatavari, Punarnava, Amla
Kidney or high creatinine: Punarnava, Gokshura, Varuna
Vitamin D low: Shatavari, Brahmi, Ashwagandha
Joint pain or arthritis: Shallaki, Guggul, Nirgundi, Haldi
Stress or anxiety: Ashwagandha, Brahmi, Shankhpushpi
Acidity or gas: Triphala, Mulethi, Amla, Saunf
Low immunity: Giloy, Amla, Tulsi, Ashwagandha
Skin or acne: Neem, Manjistha, Aloe Vera, Haldi
Cough or cold: Tulsi, Adrak, Mulethi, Pippali
Weight management: Triphala, Guggul, Methi
PCOS: Shatavari, Ashoka, Lodhra, Methi
Uric acid high: Giloy, Triphala, Neem, Guggul
UTI: Punarnava, Gokshura, Chandraprabha
Dengue or viral fever: Giloy, Tulsi, Papaya leaf extract
Hair fall: Bhringraj, Amla, Brahmi, Neem
Memory or focus: Brahmi, Shankhpushpi, Ashwagandha
Infection or inflammation: Giloy, Tulsi, Neem, Haldi
Weakness or fatigue: Ashwagandha, Shatavari, Amla, Shilajit
Sleep problems: Ashwagandha, Brahmi, Jatamansi

AFTER every herb suggestion add:
"🛒 Yeh herbs milti hain: satvikhavan.com | WhatsApp: +91 8076170877"
"⚠️ Koi bhi herb lene se pehle doctor se zaroor poochhein."

═══════════════════════════════════════
LIFESTYLE ADVICE
═══════════════════════════════════════
Always suggest ONLY vegetarian Indian foods:
palak, chana, dahi, anaar, methi, moong dal, rajma, paneer, til, almonds, walnuts, amla, lauki, beetroot

Activity: walking, yoga, pranayam — no gym unless specifically asked
Sleep: 7-8 hours, same time daily
Stress: pranayam, meditation, nature walks

═══════════════════════════════════════
LAB VALUES — EXPLAIN IF ASKED
═══════════════════════════════════════
HbA1c: Normal less than 5.7 percent, Prediabetes 5.7-6.4, Diabetes 6.5 or more
Fasting glucose: Normal 70-100 mg/dL
Cholesterol: Normal less than 200, Borderline 200-239, High 240 or more
LDL: Optimal less than 100, High more than 160
HDL: Low less than 40 men, less than 50 women — higher is better
Hemoglobin: Men 13-17, Women 12-15 g/dL
TSH: 0.4-4.0 mIU/L
Creatinine: Men 0.7-1.3, Women 0.6-1.1 mg/dL
Vitamin D: Deficient less than 20 ng/mL, Insufficient 20-30
Uric acid: Men 3.5-7.2, Women 2.6-6.0 mg/dL
CRP: Normal less than 6 mg/L — high means inflammation or infection

═══════════════════════════════════════
STRICT RULES
═══════════════════════════════════════
✅ Answer: illness symptoms, herb suggestions, lifestyle
✅ Answer: medicine from photo (read composition directly)
✅ Answer: known medicine names from list above
✅ Answer: drug interactions, side effects, storage
✅ Answer: lab value explanations
✅ Answer: general health and wellness questions

❌ NEVER guess composition of unknown brands
❌ NEVER give specific dosage for individual patient
❌ NEVER diagnose definitively — always say "possible" or "consult doctor"
❌ NEVER answer non-health topics — say: "Main sirf health aur medicine questions ka jawab deta hoon. 🙏"
❌ NEVER fabricate information — if unsure say so

ALWAYS end response with one of:
"⚕️ Doctor se zaroor milein pehle." (for serious conditions)
"⚕️ Agar symptoms 2-3 din mein theek na hoon — doctor se milein." (for mild conditions)`

export async function POST(req) {
  try {
    await connectDB()

    const formData  = await req.formData()
    const message   = formData.get('message')?.toString().trim()
    const image     = formData.get('image')
    const history   = JSON.parse(formData.get('history') || '[]')
    const anonId    = formData.get('anonId')?.toString()  || null
    const sessionId = formData.get('sessionId')?.toString() || crypto.randomUUID()

    if (!message && !image) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    // ── Rate limit ────────────────────────────────────
    const cookieStore = await cookies()
    const cookieUserId = cookieStore.get('userId')?.value
    const forwarded    = req.headers.get('x-forwarded-for')
    const ip           = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
    const identifier   = cookieUserId || ip

    if (!checkRateLimit(identifier)) {
      return NextResponse.json({
        reply: 'Aaj ke 30 sawaal ho gaye. Kal wapas aao! 🙏',
        limitReached: true
      }, { status: 429 })
    }

    // ── User lookup ───────────────────────────────────
    const userDoc = cookieUserId ? await User.findById(cookieUserId).lean() : null

    // ── Conversation history ──────────────────────────
    const recentHistory = history
      .filter(m => m.role && m.content && String(m.content).trim())
      .slice(-6)
      .map(m => ({
        role:    m.role === 'user' ? 'user' : 'assistant',
        content: String(m.content)
      }))

    // ── Build user message ────────────────────────────
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
            text: message || 'Is medicine ki strip ya box se yeh batao: naam, composition/salt, kya kaam karta hai, main side effects (top 3), important precautions, aur koi Jan Aushadhi generic available hai?'
          }
        ]
      } catch (imgErr) {
        console.error('Image error:', imgErr)
        userContent = message || 'Medicine ke baare mein batao'
      }
    } else {
      userContent = message
    }

    const messages = [
      ...recentHistory,
      { role: 'user', content: userContent }
    ]

    // ── Save user message ─────────────────────────────
    ChatLog.create({
      userId:    userDoc?._id || null,
      anonId,
      sessionId,
      role:      'user',
      message:   message || 'Is medicine ke baare mein batao',
      chatType:  'medicine',
    }).catch(e => console.error('ChatLog user save error:', e.message))

    // ── Stream response ───────────────────────────────
    const stream = await anthropic.messages.stream({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system:     SYSTEM_PROMPT,
      messages
    })

    const encoder  = new TextEncoder()
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
        'Content-Type':      'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control':     'no-cache'
      }
    })

  } catch (err) {
    console.error('Chat API error:', err.message)
    return NextResponse.json({
      error: 'Kuch gadbad ho gayi. Dobara try karo. 🙏'
    }, { status: 500 })
  }
}