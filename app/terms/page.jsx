export const metadata = {
  title: 'Terms of Service — Sehat24',
  description: 'Sehat24 ke terms of service — service use karne ki conditions',
  alternates: { canonical: 'https://sehat24.com/terms' }
}

export default function TermsPage() {
  return (
    <main style={{
      maxWidth: 760,
      margin: '0 auto',
      padding: '48px 24px 80px',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      color: '#0f172a',
      lineHeight: 1.8
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        h1 { font-size: 32px; font-weight: 800; margin-bottom: 8px; }
        h2 { font-size: 20px; font-weight: 700; margin: 40px 0 12px; color: #0d9488; }
        p  { font-size: 15px; color: #334155; margin-bottom: 16px; }
        ul { padding-left: 20px; margin-bottom: 16px; }
        li { font-size: 15px; color: #334155; margin-bottom: 8px; }
        .last-updated { font-size: 13px; color: #94a3b8; margin-bottom: 40px; }
        .highlight { background: #f0fdfa; border-left: 4px solid #0d9488; padding: 16px 20px; border-radius: 0 12px 12px 0; margin: 24px 0; }
      `}</style>

      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
        <h1>Terms of Service</h1>
        <p className="last-updated">Last updated: June 2026 · Effective: June 2026</p>

        <div className="highlight">
          <p style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>
            ⚠️ Important: Sehat24 ek educational tool hai — medical advice nahi hai.
            Koi bhi health decision lene se pehle qualified doctor se milein.
          </p>
        </div>
      </div>

      <h2>1. Service Ka Parichay</h2>
      <p>
        Sehat24 (sehat24.com) ek AI-powered medical report analyzer hai jo aapki lab reports
        ko Hindi/Hinglish mein explain karta hai. Yeh service RootLambda Technologies, Delhi NCR, India
        dwara provide ki jaati hai.
      </p>
      <p>
        Sehat24 use karke aap in Terms of Service se agree karte hain. Agar aap agree nahi karte
        toh please service use na karein.
      </p>

      <h2>2. Medical Disclaimer — Bahut Zaroori</h2>
      <div className="highlight">
        <ul style={{ margin: 0 }}>
          <li>Sehat24 <strong>medical advice nahi deta</strong> — sirf educational information provide karta hai</li>
          <li>AI analysis <strong>doctor ki jagah nahi le sakta</strong></li>
          <li>Koi bhi health decision lene se pehle <strong>qualified doctor se milein</strong></li>
          <li>Emergency mein <strong>turant doctor/hospital se contact karein</strong></li>
          <li>Report analysis mein <strong>errors ho sakte hain</strong> — always verify karein</li>
        </ul>
      </div>

      <h2>3. Service Ka Use</h2>
      <p>Aap agree karte hain ki:</p>
      <ul>
        <li>Aap 18 saal ya usse zyada umra ke hain (ya guardian ki consent hai)</li>
        <li>Aap sirf apni ya family member ki reports upload karenge</li>
        <li>Aap service ka misuse nahi karenge</li>
        <li>Aap accurate information provide karenge</li>
        <li>Aap service ki limits ko bypass karne ki koshish nahi karenge</li>
      </ul>

      <h2>4. Basic vs Pro Plan</h2>
      <ul>
        <li><strong>Basic Plan:</strong> Reports analyze karne ke liye Pro subscription chahiye</li>
        <li><strong>Pro Plan:</strong> ₹499/month ya ₹1,999/year — unlimited reports</li>
        <li>Payment Razorpay ke through hoti hai — secure aur encrypted</li>
        <li>Subscription automatic renew nahi hota — manual payment required</li>
        <li>Refund policy: 7 din ke andar request karein — teamsehat24@gmail.com pe</li>
      </ul>

      <h2>5. Intellectual Property</h2>
      <p>
        Sehat24 ka content, design, aur technology RootLambda Technologies ki property hai.
        Aap service ka commercial use nahi kar sakte bina permission ke.
      </p>

      <h2>6. Limitation of Liability</h2>
      <p>
        Sehat24 kisi bhi medical decision ke consequences ke liye liable nahi hai.
        Service "as is" provide ki jaati hai — koi guarantee nahi hai accuracy ki.
        Maximum liability subscription amount tak limited hai.
      </p>

      <h2>7. Service Changes</h2>
      <p>
        Hum service ko kisi bhi samay modify kar sakte hain. Major changes ke liye
        registered users ko email/notification milega. Continued use = acceptance of changes.
      </p>

      <h2>8. Governing Law</h2>
      <p>
        Yeh terms Indian law ke under govern hote hain. Any disputes Delhi courts mein resolve honge.
      </p>

      <h2>9. Contact</h2>
      <p>
        Koi bhi sawaal ke liye:<br />
        📧 <strong>teamsehat24@gmail.com</strong><br />
        🌐 <strong>sehat24.com</strong><br />
        📍 Delhi NCR, India
      </p>
    </main>
  )
}
