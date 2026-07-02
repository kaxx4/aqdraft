import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Post } from '../services/api'
import savedPostsService from '../services/savedPostsService'
import FeedPostCard from './FeedPostCard'
import { useFeedCardBatch } from '../hooks/useFeedCardBatch'

export default function SavedPostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  // Batch per-card saved-state + linked-opening so the list fires 2 queries
  // total instead of 2 per card.
  const { savedSet, openings } = useFeedCardBatch(posts)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    savedPostsService.getSavedPosts({ page: 1, limit: 50 })
      .then(r => {
        if (cancelled) return
        if (r.success) {
          setPosts(r.data)
          setCount(r.pagination.totalItems)
        }
      })
      .catch(e => {
        if (!cancelled) setError(e?.message ?? 'Could not load saved posts')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const handleUnsave = async (post: Post) => {
    // Optimistic remove
    setPosts(prev => prev.filter(p => p.uuid !== post.uuid))
    setCount(c => Math.max(0, c - 1))
    try {
      await savedPostsService.unsave(post.postId)
    } catch (err) {
      // Roll back on failure
      setPosts(prev => [post, ...prev])
      setCount(c => c + 1)
      console.error('Unsave failed:', err)
    }
  }

  return (
    <div className="route-enter">
      {/* ── Hero ── */}
      <section style={{
        background: '#0A0A0A', color: '#fff',
        padding: 'clamp(32px,5vw,56px) var(--page-px,24px) clamp(24px,3vw,40px)',
        borderBottom: '2px solid var(--ink)', position: 'relative', overflow: 'hidden',
      }}>
        <div className="halftone" style={{ position: 'absolute', inset: 0, color: 'var(--lemon)', opacity: 0.1 }} />
        <div className="container" style={{ position: 'relative' }}>
          <span className="sticker sticker-lemon wobble" style={{ display: 'inline-flex', marginBottom: 16 }}>
            ★ SAVED
          </span>
          <h1 className="h-display" style={{
            fontSize: 'clamp(48px, 8vw, 84px)', margin: 0, lineHeight: 0.92, color: '#fff',
          }}>
            your <span style={{ fontStyle: 'italic', fontFamily: 'var(--serif)', fontWeight: 400, color: 'var(--lemon)' }}>bookmarks</span>.
          </h1>
          <p style={{ fontSize: 15, marginTop: 14, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--mono)', fontVariantNumeric: 'tabular-nums' }}>
            {count} post{count !== 1 ? 's' : ''} saved · synced across your devices
          </p>
        </div>
      </section>

      {/* ── Content ── */}
      <div className="aq-wrap" style={{ paddingTop: 'clamp(20px,4vw,28px)', paddingBottom: 100, maxWidth: 680 }}>
        {error && (
          <div className="card" style={{ padding: 16, marginBottom: 20, background: 'var(--bg-2)', borderColor: '#e05c5c', color: '#e05c5c' }}>
            {error}
          </div>
        )}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1,2,3].map(i => (
              <div key={i} className="v6-skeleton" style={{ height: 260, borderRadius: 20, animationDelay: `${i * 0.08}s` }} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'clamp(44px,8vw,80px) var(--page-px,24px)' }}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>🔖</div>
            <div className="h-display" style={{ fontSize: 'clamp(28px,5vw,42px)', marginBottom: 10 }}>
              nothing saved yet.
            </div>
            <p style={{ color: 'var(--ink-3)', fontSize: 15, marginBottom: 28, fontFamily: 'var(--eina)' }}>
              tap the bookmark icon on any post to save it here.
            </p>
            <Link to="/" className="btn btn-primary">
              browse the feed →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {posts.map((post, i) => (
              <div key={post.uuid} style={{ position: 'relative' }}>
                <FeedPostCard post={post} seed={i} savedInitial={savedSet.has(post.postId)} linkedOpening={openings.get(post.uuid) ?? null} />
                {/* Unsave button — floats top-right inside the card */}
                <button
                  onClick={() => handleUnsave(post)}
                  title="Remove bookmark"
                  style={{
                    position: 'absolute', top: 14, right: 14, zIndex: 10,
                    background: 'var(--card)', border: '1.5px solid var(--line-2)',
                    borderRadius: 999,
                    // 40px hit-area floor (was ~24px tall). Keep tight visual
                    // chrome via padding rather than enlarging the chip text.
                    minHeight: 40, padding: '0 14px',
                    display: 'inline-flex', alignItems: 'center',
                    fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
                    color: 'var(--ink-3)', cursor: 'pointer',
                    transition: 'color 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#e05c5c'; e.currentTarget.style.borderColor = '#e05c5c' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--ink-3)'; e.currentTarget.style.borderColor = 'var(--line-2)' }}
                >
                  unsave
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
