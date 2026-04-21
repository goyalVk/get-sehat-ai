'use client'
import { useState } from 'react'

const faqs = [
  {
    q: 'Kya Sehat24 bilkul free hai?',
    a: 'Haan — report analysis, Medicine AI Chat, PDF download sab bilkul free hai. Koi hidden charge nahi, koi credit card nahi.'
  },
  {
    q: 'Mera data safe hai? Kahan jaata hai?',
    a: 'Aapki report sirf analysis ke liye process hoti hai. Hum aapka data bina permission ke store nahi karte. Privacy hamari priority hai — Privacy Policy mein poori details hain.'
  },
  {
    q: 'Kaunse reports supported hain?',
    a: 'Blood test (CBC, LFT, KFT, HbA1c), Lipid Profile, Thyroid, MRI, CT Scan, X-Ray, Ultrasound, Pathology, ECG — kisi bhi Indian lab ki report. SRL, Lal PathLabs, Apollo, Metropolis, Thyrocare sab chalte hain.'
  },
  {
    q: 'Kya yeh doctor ka replacement hai?',
    a: 'Bilkul nahi. Sehat24 aapko report samajhne mein help karta hai — doctor ke paas jaane ka substitute nahi. Hum educational information dete hain. Koi bhi health decision doctor ki salah ke baad lein.'
  },
  {
    q: 'Hindi ke alawa aur languages mein milega?',
    a: 'Abhi Hindi aur English available hain. Tamil, Telugu, Marathi, Bengali, Gujarati, Punjabi jald aa rahe hain — tab tak Hinglish mein best results milenge.'
  },
  {
    q: 'PDF download kaise karein?',
    a: 'Report analyze hone ke baad result page pe "Full Report PDF" ya "Doctor Summary PDF" button dikhega. Doctor Summary PDF specifically doctor ke paas le jaane ke liye banaya hai — sirf abnormal values aur questions hote hain.'
  },
  {
    q: 'Report history kahan milegi?',
    a: 'Login karne ke baad Dashboard → History mein sari reports milti hain. Alag alag reports ke beech trend comparison bhi dekh sakte hain — HbA1c, cholesterol time ke saath kaisa change hua.'
  },
]

export default function FAQSection() {
  const [open, setOpen] = useState(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {faqs.map((faq, i) => (
        <div
          key={i}
          style={{
            background: open === i ? 'var(--teal-50)' : 'var(--surface)',
            border: `1px solid ${open === i ? 'var(--teal-100)' : 'var(--border-light)'}`,
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            transition: 'all 0.2s'
          }}
        >
          {/* Question */}
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: '100%', padding: '18px 22px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: 16,
              background: 'none', border: 'none',
              cursor: 'pointer', textAlign: 'left',
              fontFamily: 'var(--font-body)',
            }}
          >
            <span style={{
              fontSize: 14, fontWeight: 600,
              color: open === i ? 'var(--teal-700)' : 'var(--ink)',
              lineHeight: 1.4, flex: 1
            }}>
              {faq.q}
            </span>
            <span style={{
              fontSize: 20, color: 'var(--teal-600)',
              fontWeight: 300, flexShrink: 0,
              transform: open === i ? 'rotate(45deg)' : 'rotate(0)',
              transition: 'transform 0.2s',
              lineHeight: 1
            }}>
              +
            </span>
          </button>

          {/* Answer */}
          {open === i && (
            <div style={{
              padding: '0 22px 18px',
              borderTop: '1px solid var(--teal-100)'
            }}>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 14, color: 'var(--ink-muted)',
                lineHeight: 1.75, paddingTop: 14
              }}>
                {faq.a}
              </p>
            </div>
          )}
        </div>
      ))}

      {/* Still have questions */}
      <div style={{
        marginTop: 8,
        background: 'linear-gradient(135deg, var(--dark-900), var(--dark-800))',
        borderRadius: 'var(--radius-md)',
        padding: '20px 22px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
      }}>
        <div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 4 }}>
            Aur sawaal hain? 🙏
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
            WhatsApp ya email pe contact karo
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          
           <a
            href="https://wa.me/918076170877?text=Namaste%20Sehat24!%20Mujhe%20help%20chahiye."
            target="_blank" rel="noopener noreferrer"
            style={{
              background: '#25d366', color: 'white',
              padding: '9px 18px', borderRadius: 10,
              fontSize: 13, fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            💬 WhatsApp
          </a>
          
            <a href="mailto:teamsehat24@gmail.com"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.7)',
              padding: '9px 18px', borderRadius: 10,
              fontSize: 13, fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            ✉️ Email
          </a>
        </div>
      </div>
    </div>
  )
}