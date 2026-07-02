import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabaseCommunity } from '../lib/supabaseCommunity'
import feedService from '../services/feedService'
import { directorService } from '../services/directorService'
import { useDebounce } from '../hooks/useDebounce'
import { AdminLayout, AdminTabHeader, EmptyState } from './adminKit'
import { useConfirm } from '../components/Confirm'
import { useToast } from '../components/Toast'

interface ManagedPost {
  postId: number
  uuid: string
  body: string
  category: string
  status: string
  authorName: string
  authorUuid: string
  createdAt: string
  likeCount: number
  commentCount: number
  pinned: boolean
}

const CAT_COLORS: Record<string, string> = {
  events:     '#FF6BD6',
  welfare:    '#00E5A0',
  labs:       '#FFC700',
  operations: '#3DA9FC',
  content:    '#7E5BFF',
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  published:     { bg: 'rgba(0,229,160,0.15)', color: 'var(--mint)' },
  pending_review: { bg: 'rgba(255,107,214,0.15)', color: 'var(--pink)' },
  rejected:      { bg: 'rgba(224,92,92,0.15)', color: '#e05c5c' },
}

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (d < 60) return 'just now'
  if (d < 3600) return `${Math.floor(d / 60)}m ago`
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`
  return `${Math.floor(d / 86400)}d ago`
}

const ContentManager = () => {
  const confirm = useConfirm()
  const toast = useToast()
  const [posts, setPosts] = useState<ManagedPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'pending_review' | 'rejected'>('all')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [total, setTotal] = useState(0)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editBody, setEditBody] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [pinningId, setPinningId] = useState<number | null>(null)


  const debouncedSearch = useDebounce(search, 300)

  const fetchPosts = useCallback(async (pageNum: number, q: string, status: string, append = false) => {
    if (append) setIsLoadingMore(true); else setIsLoading(true)
    try {
      // Read from post_feed_view — it already filters deleted_at IS NULL, has
      // author info inlined (no FK ambiguity), and exposes like_count /
      // comment_count. Writes still target the `posts` table directly below.
      let query = supabaseCommunity
        .from('post_feed_view')
        .select(`
          post_id, uuid, body, category, status, created_at, pinned,
          author_uuid, author_name, like_count, comment_count
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((pageNum - 1) * 20, pageNum * 20 - 1)

      if (status !== 'all') query = query.eq('status', status)
      if (q) query = query.ilike('body', `%${q}%`)

      const { data, count, error } = await query
      if (error) throw error

      const mapped: ManagedPost[] = (data || []).map((p: any) => ({
        postId: p.post_id,
        uuid: p.uuid,
        body: p.body,
        category: p.category,
        status: p.status,
        authorName: p.author_name || 'Unknown',
        authorUuid: p.author_uuid || '',
        createdAt: p.created_at,
        likeCount: p.like_count || 0,
        commentCount: p.comment_count || 0,
        pinned: p.pinned || false,
      }))

      if (append) setPosts(prev => [...prev, ...mapped]); else setPosts(mapped)
      setTotal(count || 0)
      setHasMore((count || 0) > pageNum * 20)
    } catch (e: any) {
      const msg = e?.message || String(e)
      console.error('ContentManager fetch error:', e)
      toast.error(`Could not load posts — ${msg}`)
    }
    finally { setIsLoading(false); setIsLoadingMore(false) }
  }, [])

  useEffect(() => { setPage(1); fetchPosts(1, debouncedSearch, statusFilter) }, [debouncedSearch, statusFilter, fetchPosts])

  const flash = (msg: string, isErr = false) => { if (isErr) toast.error(msg); else toast.success(msg) }

  const handleSaveEdit = async (post: ManagedPost) => {
    if (!editBody.trim()) return
    setIsSaving(true)
    try {
      await feedService.updatePost(post.uuid, { body: editBody.trim() })
      setPosts(prev => prev.map(p => p.postId === post.postId ? { ...p, body: editBody.trim() } : p))
      setEditingId(null)
      flash(`Post by ${post.authorName} updated.`)
    } catch (e: any) {
      flash(e?.message ?? 'Failed to update post.', true)
    }
    finally { setIsSaving(false) }
  }

  const handleDelete = async (post: ManagedPost) => {
    const ok = await confirm({ title: 'Delete post?', body: 'This post will be permanently deleted.', confirmLabel: 'Delete', danger: true })
    if (!ok) return
    setDeletingId(post.postId)
    try {
      await feedService.deletePost(post.uuid)
      setPosts(prev => prev.filter(p => p.postId !== post.postId))
      setTotal(t => t - 1)
      flash(`Post deleted.`)
    } catch (e: any) {
      flash(e?.message ?? 'Failed to delete.', true)
    }
    finally { setDeletingId(null) }
  }

  const handleStatusChange = async (post: ManagedPost, newStatus: string) => {
    try {
      // Build a real audit-trail update: stamp reviewer + timestamp, and clear
      // rejection_note when transitioning out of 'rejected'.
      const reviewerId = await directorService.getCurrentMemberId()
      const baseUpdate = {
        status: newStatus,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        ...(newStatus !== 'rejected' ? { rejection_note: null } : {}),
      }

      const { error } = await supabaseCommunity
        .from('posts')
        .update(baseUpdate)
        .eq('post_id', post.postId)
      if (error) throw error

      setPosts(prev => prev.map(p => p.postId === post.postId ? { ...p, status: newStatus } : p))
      flash(`Status → ${newStatus}`)
    } catch (e: any) {
      flash(e?.message ?? 'Status update failed.', true)
    }
  }

  const handleTogglePin = async (post: ManagedPost) => {
    setPinningId(post.postId)
    try {
      const newPinned = !post.pinned
      await feedService.pinPost(post.uuid, newPinned)
      setPosts(prev => prev.map(p => p.postId === post.postId ? { ...p, pinned: newPinned } : p))
      flash(newPinned ? '📌 Pinned to notice board' : 'Unpinned from notice board')
    } catch (e: any) {
      flash(e?.message ?? 'Pin update failed.', true)
    }
    finally { setPinningId(null) }
  }

  return (
    <AdminLayout>
      <div style={{ paddingTop: 'clamp(8px,2vw,16px)', paddingBottom: 60, maxWidth: 900 }}>
        <AdminTabHeader
          label="Content"
          title="Content manager"
          count={total}
          subtitle="Edit, delete, or change the status of any post."
        />


      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="input"
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="search post body…"
          style={{ flex: 1, minWidth: 200 }}
        />
        {(['all', 'published', 'pending_review', 'rejected'] as const).map(s => (
          <button key={s} className={'btn btn-sm ' + (statusFilter === s ? 'btn-primary' : 'btn-ghost')}
            onClick={() => setStatusFilter(s)} style={{ textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.04em' }}>
            {s === 'all' ? 'All' : s === 'pending_review' ? 'Queue' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Post list */}
      {isLoading ? (
        <div style={{ padding: 48, textAlign: 'center' }}><div className="mono xs upper muted">loading…</div></div>
      ) : posts.length === 0 ? (
        <EmptyState icon="🗂️" title="No posts found" hint="Try a different search or status filter." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {posts.map(post => {
            const accent = CAT_COLORS[post.category] || '#00E5A0'
            const statusSt = STATUS_STYLE[post.status] || STATUS_STYLE.published
            const isEditingThis = editingId === post.postId

            return (
              <div key={post.postId} className="card" style={{ padding: 0, borderLeft: `4px solid ${accent}`, overflow: 'hidden' }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid var(--line)', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '2px 8px', borderRadius: 999, background: accent + '22', color: accent, border: `1px solid ${accent}44` }}>{post.category}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 999, ...statusSt }}>
                    {post.status === 'pending_review' ? 'queued' : post.status}
                  </span>
                  <Link to={`/profile/${post.authorUuid}`} style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 12, color: 'var(--ink)', textDecoration: 'none' }}>
                    {post.authorName}
                  </Link>
                  <span className="mono xs muted">{timeAgo(post.createdAt)}</span>
                  <span className="mono xs muted" style={{ marginLeft: 'auto' }}>♥ {post.likeCount} · 💬 {post.commentCount}</span>
                </div>

                {/* Body — inline editable */}
                <div style={{ padding: '12px 14px' }}>
                  {isEditingThis ? (
                    <>
                      <textarea
                        autoFocus
                        value={editBody}
                        onChange={e => setEditBody(e.target.value)}
                        rows={Math.max(3, editBody.split('\n').length + 1)}
                        style={{ width: '100%', padding: '10px 12px', fontFamily: 'var(--eina)', fontSize: 13, lineHeight: 1.7, color: 'var(--ink)', background: 'var(--bg-2)', border: `1.5px solid ${accent}`, borderRadius: 10, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                      />
                      <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
                        <button className="btn btn-sm" onClick={() => setEditingId(null)} disabled={isSaving}>cancel</button>
                        <button className="btn btn-sm btn-primary" onClick={() => handleSaveEdit(post)} disabled={isSaving || !editBody.trim()} style={{ background: accent, borderColor: accent, color: '#0A0A0A' }}>
                          {isSaving ? 'saving…' : 'save →'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <p style={{ fontFamily: 'var(--eina)', fontSize: 13, lineHeight: 1.7, color: 'var(--ink-2)', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                      {post.body}
                    </p>
                  )}
                </div>

                {/* Action row */}
                {!isEditingThis && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderTop: '1px solid var(--line)', flexWrap: 'wrap' }}>
                    <Link to={`/post/${post.uuid}`} className="btn btn-sm btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }}>view ↗</Link>
                    <button className="btn btn-sm btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }}
                      onClick={() => { setEditingId(post.postId); setEditBody(post.body) }}>✎ edit</button>
                    {post.status === 'published' && (
                      <button
                        className="btn btn-sm btn-ghost"
                        disabled={pinningId === post.postId}
                        onClick={() => handleTogglePin(post)}
                        style={{ fontSize: 11, padding: '4px 10px', color: post.pinned ? 'var(--mint)' : 'var(--ink-3)', borderColor: post.pinned ? 'var(--mint)' : undefined, transition: 'color 0.15s, border-color 0.15s' }}
                        title={post.pinned ? 'Unpin from notice board' : 'Pin to notice board'}
                      >
                        {pinningId === post.postId ? '…' : post.pinned ? '📌 pinned' : '📌 pin'}
                      </button>
                    )}

                    {/* Status quick-change */}
                    <select
                      value={post.status}
                      onChange={e => handleStatusChange(post, e.target.value)}
                      style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 8, border: '1.5px solid var(--line-2)', background: 'var(--bg-2)', color: 'var(--ink)', cursor: 'pointer', outline: 'none' }}
                    >
                      <option value="published">published</option>
                      <option value="pending_review">queued</option>
                      <option value="rejected">rejected</option>
                    </select>

                    <button
                      onClick={() => handleDelete(post)}
                      disabled={deletingId === post.postId}
                      style={{ marginLeft: 'auto', background: 'none', color: '#e05c5c', border: '1px solid rgba(224,92,92,0.3)', borderRadius: 8, padding: '4px 10px', fontFamily: 'var(--display)', fontSize: 11, cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s, color 0.15s' }}
                    >
                      {deletingId === post.postId ? '…' : 'delete'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          {hasMore && (
            <div style={{ textAlign: 'center', paddingTop: 8 }}>
              <button className="btn btn-sm" disabled={isLoadingMore}
                onClick={() => { const p = page + 1; setPage(p); fetchPosts(p, debouncedSearch, statusFilter, true) }}>
                {isLoadingMore ? 'loading…' : 'load more →'}
              </button>
            </div>
          )}
        </div>
      )}
      </div>
    </AdminLayout>
  )
}

export default ContentManager
