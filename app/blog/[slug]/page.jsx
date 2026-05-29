import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
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

// Inline styles removed — all sizing handled via .post-card CSS classes so media queries apply
const mdxComponents = {
  h2:         (props) => <h2 {...props} />,
  h3:         (props) => <h3 {...props} />,
  p:          (props) => <p {...props} />,
  ul:         (props) => <ul {...props} />,
  ol:         (props) => <ol {...props} />,
  li:         (props) => <li {...props} />,
  strong:     (props) => <strong {...props} />,
  hr:         ()      => <hr />,
  blockquote: (props) => <blockquote {...props} />,
  table: (props) => (
    <div style={{ overflowX: 'auto', marginBottom: 20, WebkitOverflowScrolling: 'touch' }}>
      <table {...props} />
    </div>
  ),
  thead: (props) => <thead {...props} />,
  th:    (props) => <th {...props} />,
  td:    (props) => <td {...props} />,
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

        .post-header   { padding: 40px 24px 32px; }
        .post-title    { font-family: 'DM Serif Display', serif; font-size: 28px; font-weight: 400; color: #0f172a; line-height: 1.3; margin-bottom: 16px; }
        .post-body     { max-width: 720px; margin: 0 auto; padding: 32px 20px 20px; }
        .post-card     { background: white; border-radius: 20px; border: 1px solid #f1f5f9; padding: 32px 28px; }
        .post-cta-wrap { max-width: 720px; margin: 0 auto; padding: 0 20px 80px; }
        .post-cta      { background: linear-gradient(135deg, #0d9488, #0891b2); border-radius: 20px; padding: 32px; text-align: center; }
        .post-cta-h    { font-size: 22px; font-weight: 700; color: white; margin-bottom: 10px; }
        .post-cta-p    { font-size: 14px; color: rgba(255,255,255,0.85); margin-bottom: 24px; line-height: 1.6; }

        /* Markdown element sizing */
        .post-card h2  { font-size: 20px; font-weight: 700; color: #0d9488; margin-top: 32px; margin-bottom: 12px; line-height: 1.4; }
        .post-card h3  { font-size: 17px; font-weight: 700; color: #134e4a; margin-top: 24px; margin-bottom: 10px; }
        .post-card p   { font-size: 15px; color: #334155; line-height: 1.8; margin-bottom: 16px; }
        .post-card ul, .post-card ol { padding-left: 20px; margin-bottom: 16px; }
        .post-card li  { font-size: 15px; color: #334155; line-height: 1.8; margin-bottom: 6px; }
        .post-card strong { color: #0f172a; font-weight: 700; }
        .post-card blockquote { border-left: 3px solid #0d9488; padding-left: 16px; margin: 20px 0; color: #64748b; font-style: italic; }
        .post-card hr  { border: none; border-top: 1px solid #f1f5f9; margin: 32px 0; }
        .post-card table-wrap { overflow-x: auto; margin-bottom: 20px; -webkit-overflow-scrolling: touch; }
        .post-card table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .post-card thead { background: #f0fdfa; }
        .post-card th  { padding: 10px 14px; text-align: left; font-weight: 700; color: #0d9488; border-bottom: 2px solid #99f6e4; white-space: nowrap; }
        .post-card td  { padding: 10px 14px; color: #334155; border-bottom: 1px solid #f1f5f9; }

        @media (max-width: 640px) {
          .post-header  { padding: 24px 16px 20px; }
          .post-title   { font-size: 22px; }
          .post-body    { padding: 16px 12px 12px; }
          .post-card    { padding: 20px 16px; border-radius: 16px; }
          .post-cta-wrap{ padding: 0 12px 80px; }
          .post-cta     { padding: 24px 16px; border-radius: 16px; }
          .post-cta-h   { font-size: 18px; }
          .post-cta-p   { font-size: 13px; margin-bottom: 18px; }
          .post-card h2 { font-size: 17px; margin-top: 24px; }
          .post-card h3 { font-size: 15px; }
          .post-card p, .post-card li { font-size: 14px; }
          .post-card th, .post-card td { padding: 8px 10px; font-size: 13px; }
        }
      `}</style>

      <div className="blog-post">
        {/* Header */}
        <div className="post-header" style={{ background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%)', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#0d9488', textDecoration: 'none', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
              ← Blog
            </Link>
            <h1 className="post-title">{post.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
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
        <div className="fade-up post-body">
          <div className="post-card">
            <MDXRemote
              source={post.content}
              components={mdxComponents}
              options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="post-cta-wrap">
          <div className="post-cta">
            <p className="post-cta-h">Apni Report Free Mein Analyze Karo</p>
            <p className="post-cta-p">
              Blood test report upload karo — AI turant Hindi mein poori report explain karega.
              Bilkul free, koi registration nahi.
            </p>
            <Link href="/upload" style={{
              display: 'inline-block', background: 'white', color: '#0d9488',
              padding: '13px 28px', borderRadius: 12, textDecoration: 'none',
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
