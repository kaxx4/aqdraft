import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useParams, Link } from 'react-router-dom'
import { supabase, Blog, relativeDate } from '../lib/supabase'
import { useAuth } from '../auth/AuthContext'
import { hasLeaderAccess } from '../lib/roles'
import BlogStudioModal from '../components/BlogStudioModal'
import { sized } from '../lib/imageUrl'
import { useMeta } from '../hooks/useMeta'
import { pageMetadata } from '../lib/metaConfig'

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const { member } = useAuth()
  const canMakeGraphic = hasLeaderAccess(member?.role)
  const [showStudio, setShowStudio] = useState(false)
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { setNotFound(true); setLoading(false); return }
        setBlog(data)
        setLoading(false)
      })
  }, [slug])

  // Per-route SEO — title/excerpt/cover + Article OG tags from the loaded post.
  useMeta({
    title: blog ? `${blog.headliner} | AquaTerra Blog` : pageMetadata.blogPost.title.replace('{postTitle}', 'Blog'),
    description: blog
      ? ((blog.body || '').replace(/[#>*_`]/g, '').replace(/\s+/g, ' ').trim().slice(0, 160) || `${blog.headliner} — a story from AquaTerra's Groundwork Diaries.`)
      : 'Read the latest from AquaTerra’s Groundwork Diaries — student stories on welfare, climate and community in Kolkata.',
    image: blog?.featured_image || '',
    type: 'article',
    author: blog?.written_by || undefined,
    publishDate: blog?.published_date || undefined,
  })

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="mono xs upper muted" style={{ letterSpacing: '0.06em' }}>LOADING...</div>
      </div>
    )
  }

  if (notFound || !blog) {
    return (
      <div className="route-enter container" style={{ textAlign: 'center', padding: 'clamp(44px, 8vw, 80px) var(--page-px,24px) clamp(32px, 5vw, 56px)' }}>
        <h1 className="h-display" style={{ fontSize: 40, marginBottom: 16 }}>Post not found.</h1>
        <Link to="/blog" className="btn">← All Posts</Link>
      </div>
    )
  }

  return (
    <div className="route-enter">
      {/* Hero */}
      <section style={{ background: 'var(--bg-2)', padding: 'clamp(40px, 8vw, 100px) var(--page-px,24px) 48px', borderBottom: '2px solid var(--ink)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
            <Link to="/blog" className="mono xs upper muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--ink-3)', textDecoration: 'none' }}>
              ← Groundwork Diaries
            </Link>
            {/* Blog graphic studio — leadership only. */}
            {canMakeGraphic && (
              <button
                className="btn btn-sm"
                onClick={() => setShowStudio(true)}
                title="Generate an Instagram graphic for this blog post"
                aria-label="Generate Instagram graphic"
                style={{ background: 'var(--grape)', color: '#fff', border: 'none', fontWeight: 800, gap: 6, display: 'inline-flex', alignItems: 'center', boxShadow: '0 2px 8px rgba(126,91,255,0.3)', transition: 'transform 0.12s cubic-bezier(0.2,0,0,1)' }}
                onMouseDown={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.96)')}
                onMouseUp={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="3.4" />
                  <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
                </svg>
                <span className="mono" style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.02em' }}>graphic</span>
              </button>
            )}
          </div>
          <h1 className="h-display" style={{ fontSize: 'clamp(28px, 5vw, 52px)', lineHeight: 1.0, marginBottom: 24 }}>
            {blog.headliner}
          </h1>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            {blog.written_by && (
              /* Let search resolve the author → their member profile if they have one. */
              <Link
                to={`/search?q=${encodeURIComponent(blog.written_by)}&type=people`}
                style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-2)', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-2)')}
              >
                by {blog.written_by}
              </Link>
            )}
            {blog.published_date && (
              <span className="mono xs muted">{relativeDate(blog.published_date)}</span>
            )}
            {blog.minutes_of_read && (
              <span className="mono xs muted">{blog.minutes_of_read} min read</span>
            )}
          </div>
        </div>
      </section>

      {/* Featured image */}
      {blog.featured_image && (
        <div style={{ width: '100%', maxHeight: 520, overflow: 'hidden', borderBottom: '2px solid var(--ink)' }}>
          <img src={sized(blog.featured_image, 'full')} alt={blog.featured_image_alt || blog.headliner}
            style={{ width: '100%', objectFit: 'cover', maxHeight: 520 }}
            loading="lazy"
            decoding="async"
          />
        </div>
      )}

      {/* Content */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(28px, 5vw, 48px) var(--page-px,24px) clamp(48px, 8vw, 80px)' }}>
        {blog.body ? (
          <div style={{ fontSize: 17, lineHeight: 1.78, color: 'var(--ink-2)', fontFamily: 'var(--serif)' }}>
            {blog.body.split('\n\n').map((para, i) => {
              if (para.startsWith('## ')) {
                return <h2 key={i} className="h-display" style={{ fontSize: 'clamp(22px,3vw,32px)', margin: '40px 0 16px', color: 'var(--ink)', fontFamily: 'var(--display)' }}>{para.replace('## ', '')}</h2>
              }
              if (para.startsWith('> ')) {
                return (
                  <blockquote key={i} style={{
                    borderLeft: '3px solid var(--mint)', paddingLeft: 20, margin: '24px 0',
                    fontStyle: 'italic', fontSize: 18, color: 'var(--ink-2)',
                  }}>
                    {para.replace('> ', '')}
                  </blockquote>
                )
              }
              return <p key={i} style={{ marginBottom: 20 }}>{para}</p>
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 20, color: 'var(--ink-2)', marginBottom: 24 }}>
              Full story's still being written.
            </p>
            {blog.author_url && (
              <a href={blog.author_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Read on Instagram →
              </a>
            )}
          </div>
        )}

        <div style={{ borderTop: '2px dashed var(--line-2)', marginTop: 60, paddingTop: 32 }}>
          <Link to="/blog" className="mono xs upper muted" style={{ fontWeight: 700, textDecoration: 'none', color: 'var(--ink-3)' }}>
            ← All posts
          </Link>
          {/* Bridge: if this post is about a kind of drive, point at the real projects. */}
          {(() => {
            const KW = ['plantation', 'distribution', 'workshop', 'sundarbans', 'feeding', 'fundrais', 'old age']
            const match = KW.find(k => (blog.headliner || '').toLowerCase().includes(k))
            return (
              <div style={{ marginTop: 16 }}>
                <Link to={match ? `/projects?q=${encodeURIComponent(match)}` : '/projects'} className="aq-thread-link" style={{ letterSpacing: '0.04em' }}>
                  {match ? 'see the projects this was written about →' : "browse what we've been building →"}
                </Link>
              </div>
            )
          })()}
        </div>
      </div>

      {/* Blog graphic studio modal (portal) */}
      {showStudio && blog && createPortal(
        <BlogStudioModal
          data={{
            title: blog.headliner,
            author: blog.written_by,
            readMinutes: blog.minutes_of_read,
            imageUrl: blog.featured_image,
            category: 'content',
            slug: blog.slug,
          }}
          onClose={() => setShowStudio(false)}
        />,
        document.body
      )}
    </div>
  )
}
