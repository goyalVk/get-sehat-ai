import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getAllPosts, getPostBySlug } from '@/lib/blog'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map(post => ({ slug: post.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  try {
    const post = getPostBySlug(slug)
    return {
      title: post.title,
      description: post.description,
      keywords: post.keywords,
      openGraph: {
        title: post.title,
        description: post.description,
        type: 'article',
        publishedTime: post.date,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.description,
      },
    }
  } catch {
    return { title: 'Post Not Found' }
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('hi-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

const mdxComponents = {
  h2: (props) => (
    <h2 {...props} style={{ fontSize: 20, fontWeight: 700, color: '#0d9488', marginTop: 32, marginBottom: 12, lineHeight: 1.4 }} />
  ),
  h3: (props) => (
    <h3 {...props} style={{ fontSize: 17, fontWeight: 700, color: '#134e4a', marginTop: 24, marginBottom: 10 }} />
  ),
  p: (props) => (
    <p {...props} style={{ fontSize: 15, color: '#334155', lineHeight: 1.8, marginBottom: 16 }} />
  ),
  ul: (props) => (
    <ul {...props} style={{ paddingLeft: 20, marginBottom: 16 }} />
  ),
  ol: (props) => (
    <ol {...props} style={{ paddingLeft: 20, marginBottom: 16 }} />
  ),
  li: (props) => (
    <li {...props} style={{ fontSize: 15, color: '#334155', lineHeight: 1.8, marginBottom: 6 }} />
  ),
  strong: (props) => (
    <strong {...props} style={{ color: '#0f172a', fontWeight: 700 }} />
  ),
  table: (props) => (
    <div style={{ overflowX: 'auto', marginBottom: 20 }}>
      <table {...props} style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }} />
    </div>
  ),
  thead: (props) => <thead {...props} style={{ background: '#f0fdfa' }} />,
  th: (props) => (
    <th {...props} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#0d9488', borderBottom: '2px solid #99f6e4', whiteSpace: 'nowrap' }} />
  ),
  td: (props) => (
    <td {...props} style={{ padding: '10px 14px', color: '#334155', borderBottom: '1px solid #f1f5f9' }} />
  ),
  hr: () => (
    <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '32px 0' }} />
  ),
  blockquote: (props) => (
    <blockquote {...props} style={{ borderLeft: '3px solid #0d9488', paddingLeft: 16, margin: '20px 0', color: '#64748b', fontStyle: 'italic' }} />
  ),
}

export default async function BlogPost({ params }) {
  const { slug } = await params

  let post
  try {
    post = getPostBySlug(slug)
  } catch {
    notFound()
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; }
        .blog-post { font-family: 'Plus Jakarta Sans', sans-serif; background: #f8fafc; min-height: 100vh; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
      `}</style>

      <div className="blog-post">
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%)', borderBottom: '1px solid #e2e8f0', padding: '40px 24px 36px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#0d9488', textDecoration: 'none', fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
              ← Blog
            </Link>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, fontWeight: 400, color: '#0f172a', lineHeight: 1.3, marginBottom: 16 }}>
              {post.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                🗓 {formatDate(post.date)}
              </span>
              <span style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                ⏱ {post.readingTime}
              </span>
            </div>
            {post.keywords?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {post.keywords.map(kw => (
                  <span key={kw} style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: '#f0fdfa', color: '#0d9488', fontSize: 11, fontWeight: 600, border: '1px solid #ccfbf1' }}>
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="fade-up" style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 24px' }}>
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f1f5f9', padding: '32px 28px' }}>
            <MDXRemote source={post.content} components={mdxComponents} />
          </div>
        </div>

        {/* CTA */}
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 64px' }}>
          <div style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)', borderRadius: 20, padding: 32, textAlign: 'center' }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 10 }}>
              Apni Report Free Mein Analyze Karo
            </p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: 24, lineHeight: 1.6 }}>
              Blood test report upload karo — AI turant Hindi mein poori report explain karega.
              Bilkul free, koi registration nahi.
            </p>
            <Link href="/upload" style={{
              display: 'inline-block', background: 'white', color: '#0d9488',
              padding: '14px 32px', borderRadius: 12, textDecoration: 'none',
              fontSize: 15, fontWeight: 700,
            }}>
              Free Mein Upload Karo →
            </Link>
          </div>

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Link href="/blog" style={{ color: '#0d9488', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              ← Saare Articles Dekho
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
