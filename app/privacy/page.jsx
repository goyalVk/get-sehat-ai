export const metadata = {
  title: 'Privacy Policy — Sehat24',
  description: 'Sehat24 privacy policy — aapka data kaise use hota hai',
  alternates: { canonical: 'https://sehat24.com/privacy' }
}

export default function PrivacyPage() {
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
        .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .data-table th { background: #f0fdfa; padding: 12px 16px; text-align: left; font-size: 13px; font-weight: 700; color: #0d9488; border: 1px solid #e2e8f0; }
        .data-table td { padding: 12px 16px; font-size: 14px; color: #334155; border: 1px solid #e2e8f0; }
      `}</style>

      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: June 2026 · DPDP Act 2023 compliant</p>
        <div className="highlight">
          <p style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>
            Aapki privacy hamari priority hai. Hum aapka data kabhi third parties ko
            sell nahi karte aur sirf zaroori information collect karte hain.
          </p>
        </div>
      </div>

      <h2>1. Hum Kaun Hain</h2>
      <p>
        Sehat24 (sehat24.com) RootLambda Technologies, Delhi NCR, India dwara operate hota hai.
        Hum India ke DPDP Act 2023 ke under Data Fiduciary hain.
        Contact: <strong>teamsehat24@gmail.com</strong>
      </p>

      <h2>2. Kaunsa Data Collect Hota Hai</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Data Type</th>
            <th>Kya Collect Hota Hai</th>
            <th>Kyun</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Phone Number', 'Login ke liye', 'Authentication'],
            ['Report Analysis', 'AI se extract ki gayi values', 'Service provide karna'],
            ['Patient Name/Age', 'Report se extract', 'Personalization'],
            ['Usage Data', 'Pages visited, features used', 'Product improvement'],
            ['Device Info', 'Browser, OS type', 'Technical support'],
            ['Payment Info', 'Razorpay se process', 'Subscription management'],
          ].map(([type, what, why], i) => (
            <tr key={i}>
              <td><strong>{type}</strong></td>
              <td>{what}</td>
              <td>{why}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="highlight">
        <p style={{ margin: 0, fontWeight: 600 }}>
          ❌ Hum kya NAHI karte:<br />
          • Actual PDF/image files store nahi karte<br />
          • Data third parties ko sell nahi karte<br />
          • Medical data insurance companies ko nahi dete<br />
          • Bina permission ke marketing nahi karte
        </p>
      </div>

      <h2>3. Data Ka Use Kaise Hota Hai</h2>
      <ul>
        <li>Medical report analysis provide karne ke liye</li>
        <li>Account aur subscription manage karne ke liye</li>
        <li>Product improve karne ke liye (anonymized data)</li>
        <li>Security aur fraud prevention ke liye</li>
        <li>Legal obligations fulfill karne ke liye</li>
      </ul>

        <h2>4. Third Party Services</h2>
        <p>Hum kuch trusted partners ke saath kaam karte hain:</p>
        <ul>
          <li><strong>AI Analysis Partner:</strong> Report analysis ke liye — data temporarily process hota hai, store nahi hota</li>
          <li><strong>Cloud Storage:</strong> Secure encrypted database — India/global servers</li>
          <li><strong>Payment Partner:</strong> Razorpay — RBI regulated, hum card details store nahi karte</li>
          <li><strong>Communication:</strong> OTP aur notifications ke liye</li>
          <li><strong>Analytics:</strong> Anonymous usage data — aap identify nahi hote</li>
        </ul>
        <p style={{ fontSize: 13, color: '#64748b' }}>
          Sabhi partners India ke data protection laws follow karte hain.
          Partners ki list request pe available hai — teamsehat24@gmail.com
        </p>

      <h2>5. Aapke Rights — DPDP Act 2023</h2>
      <p>India ke DPDP Act 2023 ke under aapko yeh rights hain:</p>
      <ul>
        <li>✅ <strong>Access:</strong> Apna data dekh sakte hain</li>
        <li>✅ <strong>Correction:</strong> Galat data theek karwa sakte hain</li>
        <li>✅ <strong>Erasure:</strong> Account aur data delete karwa sakte hain</li>
        <li>✅ <strong>Portability:</strong> Apna data export kar sakte hain</li>
        <li>✅ <strong>Consent Withdraw:</strong> Kabhi bhi consent wapas le sakte hain</li>
        <li>✅ <strong>Grievance:</strong> Complaint darz karwa sakte hain</li>
      </ul>
      <p>
        In rights ke liye email karein: <strong>teamsehat24@gmail.com</strong><br />
        Response time: 72 hours ke andar
      </p>

      <h2>6. Data Security</h2>
      <ul>
        <li>HTTPS encryption — sab data encrypted hai</li>
        <li>JWT tokens — secure authentication</li>
        <li>MongoDB Atlas — enterprise grade security</li>
        <li>OTP verification — phone se identity verify</li>
        <li>Regular security audits</li>
      </ul>

      <h2>7. Data Retention</h2>
      <ul>
        <li>Account data: Account active rehne tak</li>
        <li>Report analysis: Account active rehne tak</li>
        <li>Payment records: 7 saal (legal requirement)</li>
        <li>Account delete karne pe: 30 din mein sab data delete</li>
      </ul>

      <h2>8. Cookies</h2>
      <p>Hum sirf zaroori cookies use karte hain:</p>
      <ul>
        <li><strong>Authentication cookie:</strong> Login session ke liye</li>
        <li><strong>Analytics cookie:</strong> Anonymous usage data</li>
      </ul>

      <h2>9. Children Ki Privacy</h2>
      <p>
        Sehat24 18 saal se kam umra ke bacchon ke liye nahi hai bina guardian consent ke.
        Agar aap kisi minor ke liye report analyze kar rahe hain toh aap guardian hona zaroori hai.
      </p>

      <h2>10. Policy Changes</h2>
      <p>
        Policy changes hone pe registered users ko notify kiya jaayega.
        Continued use = acceptance of new policy.
      </p>

      <h2>11. Grievance Officer</h2>
      <p>
        DPDP Act 2023 ke under Grievance Officer:<br />
        📧 teamsehat24@gmail.com<br />
        📍 Delhi NCR, India<br />
        Response time: 72 hours
      </p>
    </main>
  )
}
