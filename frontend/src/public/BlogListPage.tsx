import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase, Blog, relativeDate } from '../lib/supabase'
import { getCached, setCached } from '../lib/swrCache'
import { sized } from '../lib/imageUrl'
import { useMeta } from '../hooks/useMeta'
import { pageMetadata } from '../lib/metaConfig'

const CARD_COLORS = ['var(--mint)', 'var(--lemon)', 'var(--pink)', 'var(--sky)', 'var(--mint)', 'var(--lemon)']

function BlogCard({ b, index }: { b: Blog; index: number }) {
  const href = b.slug ? `/blog/${b.slug}` : (b.author_url || null)
  const isExternal = !b.slug && !!b.author_url
  const rot = index % 2 ? 0.8 : -0.8
  const color = CARD_COLORS[index % CARD_COLORS.length]

  const inner = (
    <div className="card card-hover" style={{ padding: 0, overflow: 'hidden', ['--card-rot' as any]: `${rot}deg`, cursor: href ? 'pointer' : 'default', opacity: href ? 1 : 0.55 }}>
      {b.featured_image && (
        <div style={{ height: 196, overflow: 'hidden', borderBottom: '2px solid var(--ink)', position: 'relative' }}>
          <img src={sized(b.featured_image, 'card')} alt={b.featured_image_alt || b.headliner} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" decoding="async" />
          {/* Editorial index — sticker badge in the card's accent colour */}
          <span style={{ position: 'absolute', top: 12, left: 12, background: color, color: '#0A0A0A', fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 12, letterSpacing: '0.02em', padding: '4px 10px', borderRadius: 8, border: '1.5px solid var(--ink)', boxShadow: '2px 2px 0 var(--ink)' }}>
            № {String(index + 1).padStart(2, '0')}
          </span>
          {b.minutes_of_read && (
            <span style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(10,10,10,0.82)', color: '#fff', fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 10, letterSpacing: '0.04em', padding: '4px 9px', borderRadius: 999, backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>
              {b.minutes_of_read} min
            </span>
          )}
        </div>
      )}
      {!b.featured_image && (
        <div style={{ background: color, padding: '28px 24px 22px', borderBottom: '2px solid var(--ink)', color: '#0A0A0A', position: 'relative' }}>
          <span style={{ position: 'absolute', top: 14, right: 14, background: '#0A0A0A', color, fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 12, letterSpacing: '0.02em', padding: '4px 10px', borderRadius: 8 }}>
            № {String(index + 1).padStart(2, '0')}
          </span>
          <div className="mono xs upper" style={{ fontWeight: 700, opacity: 0.6, marginBottom: 8 }}>
            ★ {b.published_date ? relativeDate(b.published_date) : 'essay'}
            {b.minutes_of_read && ` · ${b.minutes_of_read} min read`}
          </div>
          <div className="h-display" style={{ fontSize: 'clamp(23px, 5vw, 32px)', lineHeight: 1.0, letterSpacing: '-0.02em', paddingRight: 40 }}>{b.headliner}</div>
        </div>
      )}
      <div style={{ padding: 'clamp(12px, 3.5vw, 18px)' }}>
        {b.featured_image && (
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: 900, fontSize: 'clamp(21px, 5vw, 26px)', lineHeight: 1.04, letterSpacing: '-0.02em', margin: '0 0 8px', color: 'var(--ink)', textWrap: 'balance' } as React.CSSProperties}>{b.headliner}</h2>
        )}
        {b.written_by && (
          <div className="mono xs upper muted" style={{ fontWeight: 700 }}>by {b.written_by}</div>
        )}
        {b.featured_image && b.published_date && (
          <div className="mono xs muted" style={{ marginTop: 4 }}>{relativeDate(b.published_date)}</div>
        )}
        {href && (
          <div style={{ marginTop: 14 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: color, color: '#0A0A0A', fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '7px 14px', borderRadius: 999, border: '1.5px solid var(--ink)', boxShadow: '2px 2px 0 var(--ink)' }}>
              read {isExternal ? '↗' : '→'}
            </span>
          </div>
        )}
      </div>
    </div>
  )

  if (!href) return <div key={b.id}>{inner}</div>
  if (isExternal) return <a key={b.id} href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{inner}</a>
  return <Link key={b.id} to={href} style={{ textDecoration: 'none' }}>{inner}</Link>
}

export default function BlogListPage() {
  useMeta(pageMetadata.blog)
  // Stale-while-revalidate: paint the cached blog list instantly on repeat
  // visits (no round-trip wait), then refresh in the background.
  const cached = getCached<Blog[]>('aq_bloglist_v1')
  const [blogs, setBlogs] = useState<Blog[]>(cached ?? [])
  const [loading, setLoading] = useState(!cached)

  useEffect(() => {
    supabase
      .from('blogs')
      .select('id,slug,headliner,featured_image,featured_image_alt,written_by,published_date,minutes_of_read,body,author_url,author_instagram')
      .order('published_date', { ascending: false })
      .then(({ data }) => { if (data) { setBlogs(data); setCached('aq_bloglist_v1', data) } setLoading(false) })
  }, [])

  return (
    <div className="route-enter container" style={{ padding: 'clamp(28px, 5vw, 48px) var(--page-px,24px) clamp(48px, 8vw, 80px)' }}>
      <span className="sticker sticker-mint wobble">★ groundwork diaries</span>
      <h1 className="h-display" style={{ fontSize: 'clamp(60px, 9vw, 96px)', margin: '12px 0 8px', lineHeight: 0.9 }}>
        the <span style={{ fontStyle: 'italic', fontFamily: 'var(--serif)', fontWeight: 400, color: 'var(--pink)' }}>blog</span>.
      </h1>
      <p style={{ fontSize: 18, color: 'var(--ink-2)', marginBottom: 40 }}>stories from the ground. written by the people who were there.</p>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: 20 }}>
          {[0, 1, 2].map(i => (
            <div key={i} className="card" style={{ height: 280, background: 'var(--bg-2)', animation: 'aq-pulse 1.8s ease-in-out infinite', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <div className="h-display" style={{ fontSize: 28 }}>nothing here yet.</div>
          <p className="muted" style={{ marginTop: 8 }}>new stories land here as we write them.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: 22 }}>
          {blogs.map((b, i) => <BlogCard key={b.id} b={b} index={i} />)}
        </div>
      )}
    </div>
  )
}
