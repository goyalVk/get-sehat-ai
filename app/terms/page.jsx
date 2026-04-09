export default function TermsPage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <h1 style={{ fontSize: 32, color: '#0f172a', marginBottom: 8, fontFamily: "'DM Serif Display', serif" }}>
        Terms of Use
      </h1>
      <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 40 }}>
        Last updated: April 2026
      </p>

      {[
        {
          title: '1. Acceptance',
          content: 'By using Sehat24, you agree to these terms. If you do not agree, please do not use our service.'
        },
        {
          title: '2. Not Medical Advice',
          content: 'Sehat24 is for educational purposes only. The AI analysis is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified doctor before making any health decisions. Never ignore professional medical advice because of something you read on Sehat24.'
        },
        {
          title: '3. Your account',
          content: 'You are responsible for maintaining the confidentiality of your account. You must provide accurate information when creating your account. One account per person. You must be 18 years or older to use Sehat24.'
        },
        {
          title: '4. Acceptable use',
          content: 'You agree to upload only your own health reports or reports of family members you are authorized to manage. You agree not to misuse the service or attempt to reverse engineer the AI system.'
        },
        {
          title: '5. Free plan limits',
          content: 'Free accounts are limited to 3 report analyses per month. We reserve the right to change plan limits with reasonable notice.'
        },
        {
          title: '6. Accuracy',
          content: 'While we strive for accuracy, AI analysis may not always be correct. Always verify important health information with your doctor. We are not liable for any decisions made based on Sehat24 analysis.'
        },
        {
          title: '7. Intellectual property',
          content: 'The Sehat24 platform, including its design and AI system, is owned by Sehat24. You retain ownership of your health data.'
        },
        {
          title: '8. Termination',
          content: 'We reserve the right to terminate accounts that violate these terms. You can delete your account at any time from your profile page.'
        },
        {
          title: '9. Changes',
          content: 'We may update these terms from time to time. Continued use of Sehat24 after changes means you accept the new terms.'
        },
        {
          title: '10. Contact',
          content: 'For any questions about these terms, contact us at vkgoyal.vk85@gmail.com.'
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

      <div style={{ marginTop: 48, padding: 20, background: '#fef2f2', borderRadius: 16, border: '1px solid #fecaca' }}>
        <p style={{ fontSize: 13, color: '#dc2626', lineHeight: 1.6 }}>
          <strong>Disclaimer:</strong> Sehat24 does not provide medical advice.
          The information provided is for educational purposes only.
          Always consult a qualified healthcare professional for medical decisions.
        </p>
      </div>
    </main>
  )
}