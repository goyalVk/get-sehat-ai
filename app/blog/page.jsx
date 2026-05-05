import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'

export const metadata = {
  title: 'Health Blog — Hindi Mein',
  description: 'Blood test reports, vitamins, diabetes, thyroid — sab kuch Hindi mein samjhein. Sehat24 ka health blog Indian users ke liye.',
  keywords: ['health blog hindi', 'blood test hindi', 'medical report hindi', 'sehat blog'],
  openGraph: {
    title: 'Sehat24 Health Blog — Hindi Mein',
    description: 'Medical reports aur health topics ki poori jankari Hindi mein.',
    type: 'website',
  },
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('hi-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; }
        .blog-page { font-family: 'Plus Jakarta Sans', sans-serif; background: #f8fafc; min-height: 100vh; }
        .blog-card {
          background: white; border-radius: 20px; border: 1px solid #f1f5f9;
          padding: 24px; text-decoration: none; display: block;
          transition: all 0.2s; color: inherit;
        }
        .blog-card:hover { border-color: #99f6e4; box-shadow: 0 8px 32px rgba(13,148,136,0.08); transform: translateY(-2px); }
        .keyword-chip {
          display: inline-block; padding: 3px 10px; border-radius: 20px;
          background: #f0fdfa; color: #0d9488; font-size: 11px; font-weight: 600;
          border: 1px solid #ccfbf1;
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease forwards; opacity: 0; }
      `}</style>

      <div className="blog-page">
        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 50%, #f0f9ff 100%)', borderBottom: '1px solid #e2e8f0', padding: '48px 24px 40px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: 20, padding: '4px 12px', marginBottom: 16 }}>
              <span style={{ fontSize: 14 }}>📚</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#0d9488' }}>Health Blog</span>
            </div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, fontWeight: 400, color: '#0f172a', marginBottom: 12, lineHeight: 1.2 }}>
              Health Reports<br />
              <span style={{ color: '#0d9488' }}>Hindi Mein Samjhein</span>
            </h1>
            <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
              Blood test, diabetes, thyroid, vitamins — har topic ki poori jankari aasaan Hinglish mein.
            </p>
          </div>
        </div>

        {/* Posts Grid */}
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 64px' }}>
          {posts.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 15 }}>Koi post nahi mili.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {posts.map((post, i) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="blog-card fade-up"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                    <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', lineHeight: 1.4, margin: 0 }}>
                      {post.title}
                    </h2>
                    <span style={{ flexShrink: 0, fontSize: 18, marginTop: 2 }}>→</span>
                  </div>

                  {post.description && (
                    <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 14 }}>
                      {post.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                      🗓 {formatDate(post.date)}
                    </span>
                    <span style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                      ⏱ {post.readingTime}
                    </span>
                  </div>

                  {post.keywords?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {post.keywords.slice(0, 3).map(kw => (
                        <span key={kw} className="keyword-chip">{kw}</span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}

          {/* CTA */}
          <div style={{ marginTop: 48, background: 'linear-gradient(135deg, #f0fdfa, #ecfdf5)', border: '1.5px solid #99f6e4', borderRadius: 20, padding: 28, textAlign: 'center' }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
              Apni report samajhni hai?
            </p>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20, lineHeight: 1.6 }}>
              Blood test report upload karo — AI Hindi mein poori report explain karega. Free hai.
            </p>
            <Link href="/upload" style={{
              display: 'inline-block', background: '#0d9488', color: 'white',
              padding: '14px 28px', borderRadius: 12, textDecoration: 'none',
              fontSize: 15, fontWeight: 700,
            }}>
              Free Mein Upload Karo →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
