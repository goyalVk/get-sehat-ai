export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <h1 style={{ fontSize: 32, color: '#0f172a', marginBottom: 8, fontFamily: "'DM Serif Display', serif" }}>
        Privacy Policy
      </h1>
      <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 40 }}>
        Last updated: April 2026
      </p>

      {[
        {
          title: 'What we collect',
          content: 'We collect your mobile number for login purposes. When you upload a report, we process it temporarily to generate AI analysis. We store your report history to show you trends over time.'
        },
        {
          title: 'How we use your data',
          content: 'Your mobile number is used only for authentication. Your health reports are processed by our AI to generate explanations. We never sell your data to third parties. We never share your health information with insurance companies or employers.'
        },
        {
          title: 'Report storage',
          content: 'Your uploaded reports and AI analysis are stored securely in our database. You can delete any report at any time from your dashboard. Deleted reports are permanently removed.'
        },
        {
          title: 'AI processing',
          content: 'Your reports are sent to Anthropic\'s Claude AI for analysis. Anthropic processes data according to their privacy policy. We do not store raw report files — only the AI analysis results.'
        },
        {
          title: 'Data security',
          content: 'All data is transmitted over HTTPS. Your data is stored in MongoDB Atlas with encryption at rest. We use Firebase for secure phone authentication.'
        },
        {
          title: 'Your rights',
          content: 'You can delete your account and all associated data at any time. Contact us at vkgoyal.vk85@gmail.com to request complete data deletion.'
        },
        {
          title: 'Contact',
          content: 'For any privacy concerns, email us at vkgoyal.vk85@gmail.com. We will respond within 48 hours.'
        }
      ].map((section, i) => (
        <div key={i} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>
            {section.title}
          </h2>
          <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.8 }}>
            {section.content}
          </p>
        </div>
      ))}

      <div style={{ marginTop: 48, padding: 20, background: '#f0fdfa', borderRadius: 16, border: '1px solid #99f6e4' }}>
        <p style={{ fontSize: 13, color: '#0d9488', lineHeight: 1.6 }}>
          <strong>Important:</strong> Sehat24 is for educational purposes only.
          We do not provide medical advice, diagnosis, or treatment.
          Always consult a qualified doctor before making health decisions.
        </p>
      </div>
    </main>
  )
}