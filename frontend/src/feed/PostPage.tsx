import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Post } from '../services/api'
import PosterStudioModal from '../components/PosterStudioModal'
import { useAuth } from '../auth/AuthContext'
import feedService from '../services/feedService'
import { hasLeaderAccess } from '../lib/roles'
import { CAT_TO_DEPT } from '../lib/categories'
import { sized } from '../lib/imageUrl'
import { I, LikeButton, Burst } from '../components/v6Shared'
import { useToast } from '../components/Toast'

const AVATAR_COLORS = ['#00E5A0','#FF6BD6','#FFC700','#7E5BFF','#FF7A1A','#3DA9FC']
function hashColor(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}
function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (d < 60) return 'just now'
  if (d < 3600) return `${Math.floor(d / 60)}m ago`
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`
  return `${Math.floor(d / 86400)}d ago`
}
function getInitials(name: string) {
  return (name || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
}

type PostMeta = { label: string; value: string }
// Most posts are structured: a title on line 1, then a block of "Key: value"
// metadata lines (Type / Location / Impact / Volunteers …), then a free-form
// narrative. The old page crammed all of that into the <h1>. This pulls the
// three apart so each can be presented properly. Plain prose posts (no metadata)
// fall through to title = first line, body = the rest.
function parsePost(raw: string): { title: string; meta: PostMeta[]; body: string } {
  const lines = (raw || '').replace(/\r/g, '').split('\n')
  const title = (lines[0] || '').trim()
  const meta: PostMeta[] = []
  const metaRe = /^([A-Za-z][A-Za-z /&]{1,22}):\s*(.+)$/
  let i = 1
  for (; i < lines.length; i++) {
    const ln = lines[i]
    if (!ln.trim()) { if (meta.length) { i++; break } continue } // blank line closes the meta block
    const m = ln.match(metaRe)
    if (m) meta.push({ label: m[1].trim(), value: m[2].trim() })
    else break
  }
  const body = lines.slice(i).join('\n').trim()
  // A single long sentence with no structure reads badly as a giant headline —
  // lead with it as body instead.
  if (!meta.length && !body && title.length > 90) return { title: '', meta: [], body: title }
  return { title, meta, body }
}

const META_ICON: Record<string, string> = {
  location: '📍', volunteers: '👥', date: '🗓', type: '✦', school: '🏫', impact: '★',
}

const CAT_COLORS: Record<string, string> = {
  events:     '#FF6BD6',
  welfare:    '#00E5A0',
  labs:       '#FFC700',
  operations: '#3DA9FC',
  content:    '#7E5BFF',
}

const PostPage = () => {
  const { uuid } = useParams<{ uuid: string }>()
  const { member, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { error: toastError } = useToast()

  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isLiking, setIsLiking] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentInput, setCommentInput] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [commentPage, setCommentPage] = useState(1)
  const [commentsHasMore, setCommentsHasMore] = useState(false)
  const [commentCount, setCommentCount] = useState(0)
  const [isEditingPost, setIsEditingPost] = useState(false)
  const [editPostBody, setEditPostBody] = useState('')
  const [isSavingPost, setIsSavingPost] = useState(false)
  const [confirmDeletePost, setConfirmDeletePost] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [isPinning, setIsPinning] = useState(false)
  const [showPosterStudio, setShowPosterStudio] = useState(false)

  useEffect(() => {
    if (!uuid) return
    setIsLoading(true)
    setCommentsLoading(true)
    feedService.getPost(uuid)
      .then(async result => {
        if (result.success && result.data.post.status === 'published') {
          const p = result.data.post
          setPost(p)
          setLiked(p.isLiked || false)
          setLikeCount(p.likeCount || 0)
          setIsPinned(p.pinned || false)
          // Use known postId to skip uuid→post_id roundtrip in getComments
          feedService.getComments(uuid, { page: 1, limit: 10, postId: p.postId })
            .then(r => {
              if (r.success) {
                setComments(r.data)
                setCommentCount(r.pagination.totalItems)
                setCommentsHasMore(r.pagination.hasNextPage)
                setCommentPage(1)
              }
            })
            .catch(console.error)
            .finally(() => setCommentsLoading(false))
        } else {
          setNotFound(true)
          setCommentsLoading(false)
        }
      })
      .catch(() => { setNotFound(true); setCommentsLoading(false) })
      .finally(() => setIsLoading(false))
  }, [uuid])

  const handleLike = async () => {
    if (!isAuthenticated) { navigate('/_login'); return }
    if (isLiking || !post) return
    const wasLiked = liked
    setLiked(!wasLiked); setLikeCount(c => wasLiked ? c - 1 : c + 1)
    setIsLiking(true)
    try {
      const result = await feedService.toggleLike(post.uuid, post.postId)
      if (result.success) { setLiked(result.data.liked); setLikeCount(result.data.likeCount) }
    } catch { setLiked(wasLiked); setLikeCount(c => wasLiked ? c + 1 : c - 1) }
    setIsLiking(false)
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${uuid}`
    // Native share sheet on mobile
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.body?.slice(0, 60) || 'AquaTerra post',
          text: post?.body?.slice(0, 120) || '',
          url,
        })
        return
      } catch { /* user cancelled */ }
    }
    // Desktop fallback — copy to clipboard
    try { await navigator.clipboard.writeText(url) } catch {
      const el = document.createElement('input'); el.value = url
      document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el)
    }
    setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000)
  }

  const handleTogglePin = async () => {
    if (!post) return
    setIsPinning(true)
    try {
      const newPinned = !isPinned
      await feedService.pinPost(post.uuid, newPinned)
      setIsPinned(newPinned)
    } catch (e: any) { toastError(e?.message ?? "Couldn't update the notice board.") }
    finally { setIsPinning(false) }
  }

  const handleDeletePost = async () => {
    if (!post) return
    if (!confirmDeletePost) { setConfirmDeletePost(true); setTimeout(() => setConfirmDeletePost(false), 3500); return }
    try { await feedService.deletePost(post.uuid); navigate(-1) }
    catch (e: any) { toastError(e?.message ?? "Couldn't delete this post.") }
  }

  const handleSavePostEdit = async () => {
    if (!post || !editPostBody.trim()) return
    setIsSavingPost(true)
    try {
      await feedService.updatePost(post.uuid, { body: editPostBody.trim() })
      setPost(p => p ? { ...p, body: editPostBody.trim() } : p)
      setIsEditingPost(false)
    } catch (e: any) { toastError(e?.message ?? "Couldn't save your edit.") }
    finally { setIsSavingPost(false) }
  }

  const handleAddComment = async () => {
    if (!commentInput.trim() || isSubmittingComment || !uuid) return
    const body = commentInput.trim()
    setIsSubmittingComment(true)
    // Optimistic insert
    const tempComment = {
      commentId: Date.now(),
      uuid: 'temp-' + Date.now(),
      body,
      createdAt: new Date().toISOString(),
      authorId: member?.member_id,
      authorUuid: member?.uuid,
      authorName: member?.full_name || 'You',
      authorAvatar: member?.avatar_url || null,
      authorRole: member?.role || 'member',
      isTemp: true,
    }
    setComments(prev => [...prev, tempComment])
    setCommentCount(c => c + 1)
    setCommentInput('')
    try {
      const result = await feedService.addComment(uuid, body, post?.postId)
      if (result.success) {
        setComments(prev => prev.map(c => c.uuid === tempComment.uuid ? result.data : c))
      }
    } catch {
      // Roll back optimistic insert
      setComments(prev => prev.filter(c => c.uuid !== tempComment.uuid))
      setCommentCount(c => c - 1)
      setCommentInput(body)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentUuid: string) => {
    const removed = comments.find(c => c.uuid === commentUuid)
    setComments(prev => prev.filter(c => c.uuid !== commentUuid))
    setCommentCount(c => c - 1)
    try {
      await feedService.deleteComment(commentUuid)
    } catch (e: any) {
      // Roll the optimistic removal back so the comment reappears, and
      // tell the user why (e.g. RLS blocked it).
      if (removed) setComments(prev => [...prev, removed])
      setCommentCount(c => c + 1)
      toastError(e?.message ?? "Couldn't delete this comment.")
    }
  }

  const loadMoreComments = async () => {
    if (!uuid || !commentsHasMore) return
    const nextPage = commentPage + 1
    try {
      const result = await feedService.getComments(uuid, { page: nextPage, limit: 10, postId: post?.postId })
      if (result.success) {
        setComments(prev => [...prev, ...result.data])
        setCommentsHasMore(result.pagination.hasNextPage)
        setCommentPage(nextPage)
      }
    } catch (e) { console.error(e) }
  }

  if (isLoading) {
    return (
      <div className="route-enter post-page-root">
        <div style={{ height: 4, background: 'var(--bg-3)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
          <div className="v6-skeleton sk-pill" style={{ width: 80, height: 30 }} />
          <div className="v6-skeleton" style={{ width: 60, height: 12 }} />
        </div>
        <div style={{ padding: '0 20px 32px' }} className="sk-group">
          <div className="v6-skeleton sk-pill" style={{ width: 72, height: 20, marginBottom: 22 }} />
          <div className="v6-skeleton" style={{ width: '88%', height: 38, marginBottom: 10 }} />
          <div className="v6-skeleton" style={{ width: '60%', height: 38, marginBottom: 28 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="v6-skeleton sk-circle" style={{ width: 44, height: 44 }} />
            <div>
              <div className="v6-skeleton" style={{ width: 130, height: 14, marginBottom: 7 }} />
              <div className="v6-skeleton" style={{ width: 90, height: 11 }} />
            </div>
          </div>
        </div>
        <div style={{ height: 220, background: 'var(--bg-2)', marginBottom: 0 }} />
        <div style={{ padding: '32px 20px' }} className="sk-group">
          {[100, 96, 92, 68, 94, 55].map((w, i) => (
            <div key={i} className="v6-skeleton" style={{ width: `${w}%`, height: 14, marginBottom: 14 }} />
          ))}
        </div>
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--line)', display: 'flex', gap: 8 }}>
          <div className="v6-skeleton sk-pill" style={{ width: 72, height: 32 }} />
          <div className="v6-skeleton sk-pill" style={{ width: 56, height: 32 }} />
          <div className="v6-skeleton sk-pill" style={{ width: 64, height: 32 }} />
        </div>
      </div>
    )
  }

  if (notFound || !post) {
    return (
      <div className="route-enter aq-wrap" style={{ paddingTop: 'clamp(44px, 8vw, 80px)', paddingBottom: 'clamp(44px, 8vw, 80px)', textAlign: 'center', maxWidth: 600 }}>
        <div className="h-display" style={{ fontSize: 40 }}>post not found.</div>
        <p className="muted" style={{ marginTop: 12 }}>this post doesn't exist or has been removed.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 24, display: 'inline-flex' }}>← go back</Link>
      </div>
    )
  }

  const accent = CAT_COLORS[post.category] || '#00E5A0'
  const authorColor = hashColor(post.authorName || post.authorUuid || '')
  const initials = getInitials(post.authorName || 'U')
  const profilePath = member ? `/profile/${post.authorUuid}` : `/member/${post.authorUuid}`
  const hasImages = post.images && post.images.length > 0
  const isOwner = member?.uuid === post.authorUuid
  const isSuperAdmin = member?.role === 'super_admin'
  const canManagePost = isOwner || hasLeaderAccess(member?.role)
  const canEditPost = isOwner || isSuperAdmin
  const canMakePoster = hasLeaderAccess(member?.role)

  // Pull title / structured metadata / narrative apart for proper presentation.
  const { title: displayTitle, meta: postMeta, body: displayBody } = parsePost(post.body)
  // "Impact" (and any long value) gets a prominent highlight in the body; the
  // short identifying facts (Type, Location, Volunteers…) become hero chips.
  const highlightMeta = postMeta.filter(m => m.label.toLowerCase() === 'impact' || m.value.length > 34)
  const chipMeta = postMeta.filter(m => !(m.label.toLowerCase() === 'impact' || m.value.length > 34))

  return (
    <div className="route-enter post-page-root">
      <div className="pp-layout">

      {/* ── Sidebar (dark) — a sticky info card on desktop, a full-width header
          band on mobile. Holds the category, title, facts and author. ── */}
      <aside className="pp-side" style={{ '--accent': accent } as React.CSSProperties}>
        <div className="halftone" style={{ position: 'absolute', inset: 0, color: accent, opacity: 0.09, pointerEvents: 'none' }} />
        <Burst size={200} color={accent} stroke="transparent"
          style={{ position: 'absolute', top: -60, right: -40, opacity: 0.14, pointerEvents: 'none' }} />

        <div className="pp-side-inner">
          <div className="pp-topbar">
            <button className="pp-back" onClick={() => navigate(-1)} aria-label="Go back"><I.back /> back</button>
            <span className="mono xs pp-time">{timeAgo(post.createdAt)}</span>
          </div>

          <Link
            to={CAT_TO_DEPT[post.category] ? `/everything-we-do#${CAT_TO_DEPT[post.category]}` : '/everything-we-do'}
            style={{ textDecoration: 'none' }}
          >
            <span className="sticker pp-cat" style={{ background: accent, color: '#0A0A0A', border: 'none' }}>
              ★ {post.category.toUpperCase()}
            </span>
          </Link>

          {displayTitle && <h1 className="pp-title">{displayTitle}</h1>}

          {chipMeta.length > 0 && (
            <div className="pp-meta-row">
              {chipMeta.map((m, i) => (
                <span key={i} className="pp-chip">
                  <span className="pp-chip-ic">{META_ICON[m.label.toLowerCase()] || '·'}</span>
                  <i>{m.label}</i>{m.value}
                </span>
              ))}
            </div>
          )}

          <Link to={profilePath} className="pp-author">
            <div className="avatar"
              style={{ background: authorColor, width: 44, height: 44, fontSize: 15, flexShrink: 0, overflow: 'hidden',
                border: '2px solid rgba(255,255,255,0.2)' }}>
              {post.authorAvatar
                ? <img src={post.authorAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                : initials}
            </div>
            <div>
              <div className="pp-author-name">{post.authorName}</div>
              {(post as any).authorSchool && <div className="mono xs pp-author-school">{(post as any).authorSchool}</div>}
            </div>
          </Link>
        </div>
      </aside>

      {/* ── Main (light) — media, body, actions, comments ── */}
      <main className="pp-main">

      {hasImages && (
        <div className="pp-media">
          {post.images!.length === 1 ? (
            <img
              src={sized((post.images![0] as any).blobUrl || (post.images![0] as any).url, 'full')}
              alt=""
              className="pp-img no-long-press"
              decoding="async"
              fetchPriority="high"
            />
          ) : (
            <div className="pp-img-grid">
              {post.images!.slice(0, 4).map((img: any, i: number) => (
                <img key={i} className="pp-img no-long-press" src={sized(img.blobUrl || img.url, 'card')} alt="" loading="lazy" decoding="async" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Body ── */}
      <article className="pp-body">
        {highlightMeta.length > 0 && (
          <div className="pp-highlights">
            {highlightMeta.map((m, i) => (
              <div key={i} className="pp-highlight" style={{ '--accent': accent } as React.CSSProperties}>
                <span className="pp-highlight-label">{m.label}</span>
                <p className="pp-highlight-text">{m.value}</p>
              </div>
            ))}
          </div>
        )}

        {displayBody && <p className="pp-body-text">{displayBody}</p>}

        {post.linkUrl && (
          <a href={post.linkUrl} target="_blank" rel="noopener noreferrer" className="feed-link-cta" style={{ marginTop: 24, display: 'inline-flex' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            {(post as any).linkTitle || post.linkUrl.replace(/^https?:\/\//, '').slice(0, 60)}
          </a>
        )}
      </article>

      {/* ── Action bar ── */}
      <div className="pp-actions">
        <LikeButton liked={liked} count={likeCount} onToggle={handleLike} />
        <a href="#comments" className="btn btn-sm btn-ghost" style={{ textDecoration: 'none' }}>
          <I.comment />
          <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{commentCount}</span>
        </a>
        <button
          className="btn btn-sm btn-ghost"
          onClick={handleShare}
          style={{ color: linkCopied ? accent : undefined, transition: 'color 0.15s' }}
        >
          {linkCopied ? '✓ copied' : <><I.share /> share</>}
        </button>
        {canMakePoster && (
          <button
            className="btn btn-sm"
            onClick={() => setShowPosterStudio(true)}
            title="Generate an Instagram post or story from this post"
            style={{ background: 'var(--grape)', color: '#fff', border: 'none', fontWeight: 800, gap: 6 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="3.4" />
              <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
            </svg>
            poster
          </button>
        )}
        {canEditPost && !isEditingPost && (
          <button className="btn btn-sm btn-ghost" onClick={() => { setEditPostBody(post.body); setIsEditingPost(true) }}>
            ✎ edit
          </button>
        )}
        {isSuperAdmin && post.status === 'published' && (
          <button
            className="btn btn-sm btn-ghost"
            onClick={handleTogglePin}
            disabled={isPinning}
            style={{ color: isPinned ? 'var(--mint)' : undefined, borderColor: isPinned ? 'var(--mint)' : undefined, transition: 'color 0.15s, border-color 0.15s' }}
          >
            {isPinning ? '…' : isPinned ? '📌 unpin' : '📌 pin'}
          </button>
        )}
        {canManagePost && (
          <button
            className="btn btn-sm btn-ghost"
            onClick={handleDeletePost}
            style={{ color: confirmDeletePost ? '#fff' : '#e05c5c', background: confirmDeletePost ? '#e05c5c' : 'transparent', transition: 'background 0.15s, color 0.15s' }}
          >
            {confirmDeletePost ? '⚠ confirm' : 'delete'}
          </button>
        )}
        <span style={{ flex: 1 }} />
        {/* Accent dot — matches category */}
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: accent, flexShrink: 0, boxShadow: `0 0 8px ${accent}88` }} />
        <span className="mono xs" style={{ color: accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {post.category}
        </span>
      </div>

      {/* ── Inline post editor ── */}
      {isEditingPost && (
        <div style={{ padding: '20px', margin: '20px 0 0', background: 'var(--bg-2)', borderRadius: 16, border: '1px solid var(--line)' }}>
          <div className="mono xs upper muted" style={{ marginBottom: 8, fontWeight: 700 }}>editing post body</div>
          <textarea
            autoFocus
            value={editPostBody}
            onChange={e => setEditPostBody(e.target.value)}
            rows={Math.max(5, editPostBody.split('\n').length + 2)}
            style={{ width: '100%', padding: '12px 16px', fontFamily: 'var(--eina)', fontSize: 16, lineHeight: 1.75, color: 'var(--ink)', background: 'var(--card)', border: `2px solid ${accent}`, borderRadius: 14, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-sm" onClick={() => setIsEditingPost(false)} disabled={isSavingPost}>cancel</button>
            <button className="btn btn-sm btn-primary" onClick={handleSavePostEdit} disabled={isSavingPost || !editPostBody.trim()} style={{ background: accent, borderColor: accent, color: '#0A0A0A' }}>
              {isSavingPost ? 'saving…' : 'save changes →'}
            </button>
          </div>
        </div>
      )}

      {/* ── Comments ── */}
      <section id="comments" className="pp-comments">

        {/* Section heading — editorial */}
        <div style={{ marginBottom: 28 }}>
          <h2 className="h-display" style={{ fontSize: 'clamp(36px, 6vw, 56px)', lineHeight: 0.9, margin: 0 }}>
            {commentCount > 0
              ? <><span style={{ fontVariantNumeric: 'tabular-nums' }}>{commentCount}</span> <span style={{ fontStyle: 'italic', fontFamily: 'var(--serif)', fontWeight: 400, color: accent }}>comment{commentCount !== 1 ? 's' : ''}.</span></>
              : <>join the <span style={{ fontStyle: 'italic', fontFamily: 'var(--serif)', fontWeight: 400, color: accent }}>conversation.</span></>
            }
          </h2>
          {commentCount === 0 && (
            <p className="mono xs muted" style={{ marginTop: 10 }}>be the first to say something.</p>
          )}
        </div>

        {/* Comment input — authenticated users only */}
        {isAuthenticated && (
          <div style={{
            background: 'var(--card)',
            border: '2px solid var(--ink)',
            boxShadow: '3px 3px 0 0 var(--ink)',
            borderRadius: 18,
            padding: 18,
            marginBottom: 32,
          }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div className="avatar" style={{
                background: hashColor(member?.full_name || member?.uuid || ''),
                flexShrink: 0, width: 38, height: 38, fontSize: 13, overflow: 'hidden',
                border: '2px solid var(--ink)',
              }}>
                {member?.avatar_url
                  ? <img src={member.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                  : (member?.full_name || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <textarea
                  placeholder="say something thoughtful..."
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value.slice(0, 500))}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddComment() }}
                  rows={3}
                  style={{
                    width: '100%', resize: 'vertical', borderRadius: 12, fontSize: 16,
                    minHeight: 84, fontFamily: 'var(--eina)', padding: '10px 14px',
                    background: 'var(--bg-2)', border: '1.5px solid var(--line-2)',
                    color: 'var(--ink)', outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = accent)}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--line-2)')}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10, gap: 8, alignItems: 'center' }}>
                  <span
                    className="mono xs"
                    style={{
                      marginRight: 'auto',
                      fontVariantNumeric: 'tabular-nums',
                      color: commentInput.length >= 500
                        ? '#e05c5c'
                        : commentInput.length >= 450
                          ? 'var(--lemon)'
                          : 'var(--ink-3)',
                    }}
                  >
                    {commentInput.length}/500
                  </span>
                  {commentInput && (
                    <button className="btn btn-sm btn-ghost" onClick={() => setCommentInput('')}>clear</button>
                  )}
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={handleAddComment}
                    disabled={isSubmittingComment || !commentInput.trim()}
                    style={{ background: accent, borderColor: accent, color: '#0A0A0A' }}
                  >
                    {isSubmittingComment ? 'posting…' : 'post →'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Not logged in CTA */}
        {!isAuthenticated && (
          <div style={{
            padding: '28px 28px 32px',
            background: '#0A0A0A',
            borderRadius: 18,
            border: '2px solid var(--ink)',
            boxShadow: '4px 4px 0 0 var(--ink)',
            marginBottom: 32,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <Burst size={100} color={accent} stroke="transparent"
              style={{ position: 'absolute', top: -20, right: -10, opacity: 0.2 }} />
            <div className="h-display" style={{ fontSize: 'clamp(22px, 4vw, 32px)', marginBottom: 8, color: '#fff', position: 'relative' }}>
              join the <span style={{ fontStyle: 'italic', fontFamily: 'var(--serif)', fontWeight: 400, color: accent }}>conversation.</span>
            </div>
            <p style={{ marginBottom: 20, color: 'rgba(255,255,255,0.55)', fontSize: 14, fontFamily: 'var(--eina)', position: 'relative' }}>
              join AquaTerra to leave a comment.
            </p>
            <div style={{ display: 'flex', gap: 10, position: 'relative' }}>
              {/* Pre-login phase: single join CTA */}
              <Link to="/recruitment" className="btn btn-sm btn-primary"
                style={{ background: accent, borderColor: accent, color: '#0A0A0A' }}>
                Find your people here →
              </Link>
            </div>
          </div>
        )}

        {/* Comments list */}
        {commentsLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => (
              <div key={i} className="v6-skeleton" style={{ height: 80, borderRadius: 14, animationDelay: `${i * 0.08}s` }} />
            ))}
          </div>
        ) : comments.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {comments.map((c, idx) => {
              const isOwn = member?.uuid === c.authorUuid
              const canDelete = isOwn || ['director', 'hod', 'super_admin'].includes(member?.role || '')
              const commentColor = hashColor(c.authorName || c.authorUuid || '')
              const commentInitials = (c.authorName || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
              const commentProfilePath = member ? `/profile/${c.authorUuid}` : `/member/${c.authorUuid}`
              return (
                <div key={c.uuid} style={{
                  display: 'flex', gap: 14, padding: '18px 0',
                  borderBottom: idx < comments.length - 1 ? '1px solid var(--line)' : 'none',
                  opacity: (c as any).isTemp ? 0.55 : 1,
                  transition: 'opacity 0.25s',
                }}>
                  <Link to={commentProfilePath} style={{ flexShrink: 0, textDecoration: 'none' }}>
                    <div className="avatar" style={{
                      background: commentColor, width: 36, height: 36, fontSize: 12,
                      overflow: 'hidden', border: '2px solid var(--ink)',
                      boxShadow: '2px 2px 0 0 var(--ink)', transition: 'transform 0.15s',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = '')}
                    >
                      {c.authorAvatar
                        ? <img src={c.authorAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                        : commentInitials}
                    </div>
                  </Link>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <Link to={commentProfilePath}
                        style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 13, color: 'var(--ink)', textDecoration: 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.color = accent)}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink)')}
                      >
                        {c.authorName}
                      </Link>
                      <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums' }}>
                        {timeAgo(c.createdAt)}
                      </span>
                    </div>
                    <p style={{ fontFamily: 'var(--eina)', fontSize: 14.5, lineHeight: 1.68, color: 'var(--ink-2)', margin: 0 }}>
                      {c.body}
                    </p>
                  </div>
                  {canDelete && !(c as any).isTemp && (
                    <button
                      onClick={() => handleDeleteComment(c.uuid)}
                      style={{
                        flexShrink: 0, alignSelf: 'flex-start',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--ink-3)', fontSize: 18, lineHeight: 1,
                        // 40×40 hit area minimum (was 32×32). Visible glyph
                        // stays small, padding fills the rest.
                        minWidth: 40, minHeight: 40, padding: 0,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: 8,
                        transition: 'color 0.12s, background 0.12s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#e05c5c'; e.currentTarget.style.background = 'rgba(224,92,92,0.1)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--ink-3)'; e.currentTarget.style.background = 'none' }}
                      title="Delete comment"
                      aria-label="Delete comment"
                    >
                      ×
                    </button>
                  )}
                </div>
              )
            })}
            {commentsHasMore && (
              <button className="btn btn-ghost" style={{ marginTop: 16, justifyContent: 'center' }} onClick={loadMoreComments}>
                load more →
              </button>
            )}
          </div>
        ) : (
          isAuthenticated && (
            <div style={{ padding: '20px 0 8px', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: 12 }}>
              no comments yet. be first.
            </div>
          )
        )}
      </section>

      </main>
      </div>

      {/* Poster studio — leadership-only IG graphic generator */}
      {showPosterStudio && createPortal(
        <PosterStudioModal
          data={{
            body: post.body,
            authorName: post.authorName || 'AQ Member',
            authorSchool: (post as any).authorSchool,
            category: post.category,
            uuid: post.uuid,
            imageUrl: hasImages ? ((post.images![0] as any).blobUrl || (post.images![0] as any).url) : undefined,
          }}
          onClose={() => setShowPosterStudio(false)}
        />,
        document.body
      )}

      <style>{`
        .post-page-root { width: 100%; padding-bottom: 96px; }

        /* ── Layout: 1 column on mobile, 2 columns on desktop ──
           Mobile: dark header band (.pp-side) stacked over the light content.
           Desktop: a sticky dark info card on the left, the article on the right. */
        .pp-layout { display: block; }

        .pp-side {
          position: relative; background: #0A0A0A; color: #fff; overflow: hidden;
          border-bottom: 2px solid var(--ink);
        }
        .pp-side-inner { position: relative; z-index: 1; padding: 0 18px 28px; }
        .pp-main { padding: 26px 18px 0; }

        @media (min-width: 980px) {
          .pp-layout {
            display: grid;
            grid-template-columns: 360px minmax(0, 1fr);
            gap: 36px; align-items: start;
            max-width: 1180px; margin: 0 auto; padding: 30px 32px 0;
          }
          .pp-side {
            position: sticky; top: calc(var(--nav-h, 72px) + 22px);
            border: 2px solid var(--ink); border-radius: 22px;
            box-shadow: 6px 6px 0 0 var(--ink);
          }
          .pp-side-inner { padding: 4px 22px 26px; }
          .pp-main { padding: 0; min-width: 0; }
        }

        .pp-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 0 26px;
        }
        .pp-back {
          display: inline-flex; align-items: center; gap: 7px;
          font-family: var(--mono); font-size: 12px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.04em;
          color: #fff; cursor: pointer; min-height: 40px; padding: 8px 16px;
          background: rgba(255,255,255,0.08);
          border: 1.5px solid rgba(255,255,255,0.15); border-radius: 999px;
          transition: background 0.15s, transform 0.1s cubic-bezier(.2,0,0,1);
        }
        .pp-back:hover { background: rgba(255,255,255,0.15); }
        .pp-back:active { transform: scale(0.96); }
        .pp-time { color: rgba(255,255,255,0.42); font-variant-numeric: tabular-nums; }

        .pp-cat { display: inline-flex; margin-bottom: 16px; }

        .pp-title {
          font-family: var(--eina) !important;
          font-size: clamp(26px, 5.4vw, 40px);
          font-weight: 900; line-height: 1.02; letter-spacing: -0.03em;
          color: #fff; margin: 0; text-wrap: balance;
        }

        /* Structured metadata → tidy chips */
        .pp-meta-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 24px; }
        .pp-chip {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 7px 13px 7px 11px; border-radius: 999px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.13);
          font-family: var(--eina); font-size: 13.5px; font-weight: 600;
          color: #fff; line-height: 1;
        }
        .pp-chip-ic { font-size: 12px; opacity: 0.9; }
        .pp-chip i {
          font-style: normal; font-family: var(--mono); font-size: 10px;
          font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
          color: rgba(255,255,255,0.45);
        }

        .pp-author {
          display: inline-flex; align-items: center; gap: 12px;
          text-decoration: none; margin-top: 26px;
          padding: 9px 16px 9px 9px;
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.12); border-radius: 999px;
          transition: background 0.15s, border-color 0.15s;
        }
        .pp-author:hover { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.22); }
        .pp-author-name { font-family: var(--display); font-weight: 800; font-size: 15px; color: #fff; line-height: 1.1; }
        .pp-author-school { margin-top: 3px; color: rgba(255,255,255,0.5); }

        /* ── Media ── */
        .pp-media { margin: 0; }
        .pp-img {
          width: 100%; display: block; border-radius: 20px;
          max-height: 600px; object-fit: cover;
          outline: 1px solid rgba(0,0,0,0.1); outline-offset: -1px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06), 0 24px 48px -16px rgba(0,0,0,0.22);
        }
        .pp-img-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
          border-radius: 20px; overflow: hidden;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06), 0 24px 48px -16px rgba(0,0,0,0.22);
        }
        .pp-img-grid .pp-img {
          border-radius: 0; aspect-ratio: 4/3; max-height: none;
          box-shadow: none;
        }

        /* ── Body ── */
        .pp-body { margin-top: 32px; max-width: 700px; }
        .pp-highlights { display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px; }
        .pp-highlight {
          border-left: 4px solid var(--accent);
          background: color-mix(in srgb, var(--accent) 7%, transparent);
          border-radius: 0 12px 12px 0; padding: 14px 18px;
        }
        .pp-highlight-label {
          font-family: var(--mono); font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: var(--accent); display: block; margin-bottom: 5px;
        }
        .pp-highlight-text {
          font-family: var(--eina); font-size: 16px; line-height: 1.55;
          color: var(--ink); margin: 0; font-weight: 500; text-wrap: pretty;
        }
        .pp-body-text {
          font-family: var(--eina) !important;
          font-size: clamp(17px, 1.4vw, 19px); line-height: 1.82;
          color: var(--ink-2); white-space: pre-wrap; margin: 0; text-wrap: pretty;
        }

        /* ── Action bar (inline) ── */
        .pp-actions {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
          margin-top: 36px; padding-top: 22px; border-top: 1.5px solid var(--line);
          max-width: 700px;
        }

        /* ── Comments ── */
        .pp-comments { margin-top: 48px; max-width: 700px; }

        @media (max-width: 979px) {
          /* 1 column — dark header band over the light article. */
          .pp-img, .pp-img-grid { border-radius: 16px; }
          .pp-img-grid { gap: 6px; }
          .pp-body-text { font-size: 16.5px; line-height: 1.76; }
        }
        @media (max-width: 640px) {
          .pp-title { font-size: clamp(26px, 7.5vw, 36px); }
          .pp-meta-row { gap: 6px; }
        }
      `}</style>
    </div>
  )
}

export default PostPage
