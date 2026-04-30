'use client'

export default function UpgradePage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      <div style={{ maxWidth: 420, width: '100%' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48 }}>🩺</div>
          <h1 style={{
            fontSize: 28, fontWeight: 800,
            color: '#0d9488', margin: '12px 0 4px'
          }}>
            Sehat24 Pro
          </h1>
          <p style={{ fontSize: 14, color: '#64748b' }}>
            Unlimited reports. Poori family ke liye. 🙏
          </p>
        </div>

        {/* Price Card */}
        <div style={{
          background: 'white',
          borderRadius: 20,
          padding: 32,
          border: '2px solid #0d9488',
          marginBottom: 16,
          textAlign: 'center'
        }}>
          {/* Price */}
          <div style={{
            fontSize: 56, fontWeight: 800,
            color: '#0d9488', lineHeight: 1
          }}>
            ₹299
          </div>
          <div style={{
            fontSize: 14, color: '#64748b',
            marginBottom: 24
          }}>
            per month
          </div>

          {/* Features */}
          <div style={{
            textAlign: 'left',
            marginBottom: 28,
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            {[
              '✅ Unlimited report analysis',
              '✅ Hindi mein detailed explanation',
              '✅ Poori medical history track',
              '✅ Ayurvedic herbs suggestions',
              '✅ Abnormal values instant alert',
              '✅ Poori family ke liye',
              '✅ Priority support 🙏',
            ].map((item, i) => (
              <div key={i} style={{
                fontSize: 14,
                color: '#1e293b'
              }}>
                {item}
              </div>
            ))}
          </div>

          {/* Pay Button */}
          
           <a  href="https://rzp.io/rzp/f5GzI7Qj"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              width: '100%',
              padding: '16px',
              background: '#0d9488',
              color: 'white',
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 700,
              textDecoration: 'none',
              textAlign: 'center'
            }}
          >
            Abhi Upgrade Karo → ₹299
          </a>

          <p style={{
            fontSize: 12,
            color: '#94a3b8',
            marginTop: 12
          }}>
            🔒 Secure payment via Razorpay
          </p>
        </div>

        {/* After Payment Note */}
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 16,
          padding: 16,
          textAlign: 'center',
          marginBottom: 12
        }}>
          <p style={{ fontSize: 13, color: '#166534' }}>
            💡 Payment ke baad 2-3 minute mein
            account automatically upgrade ho jaayega 🙏
          </p>
        </div>

        {/* Free Plan Note */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 16,
          border: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: 13, color: '#64748b' }}>
            Free plan mein sirf{' '}
            <strong>1 report</strong> milti hai
          </p>
        </div>

      </div>
    </main>
  )
}