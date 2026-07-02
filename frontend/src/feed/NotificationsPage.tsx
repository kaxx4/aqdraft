import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '../auth/AuthContext'
import notificationService, { NotificationRow, NotificationType } from '../services/notificationService'

const ICON_FOR_TYPE: Record<NotificationType, string> = {
  like: '♥',
  comment: '💬',
  tag: '@',
  follow: '+',
  post_approved: '✓',
  post_rejected: '✗',
  team_invite: '🛡',
  team_join_request: '⤵',
  team_join_accepted: '✓',
  system: '★',
}

const FILTER_LABEL: Array<[string, string]> = [
  ['all', 'All'],
  ['unread', 'Unread'],
  ['like', '♥ Likes'],
  ['comment', '💬 Comments'],
  ['tag', '@ Tags'],
  ['follow', '+ Follows'],
]

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (d < 60)    return 'just now'
  if (d < 3600)  return `${Math.floor(d / 60)}m ago`
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`
  if (d < 604800) return `${Math.floor(d / 86400)}d ago`
  return `${Math.floor(d / 604800)}wk ago`
}

export default function NotificationsPage() {
  const { member } = useAuth()
  const [filter, setFilter] = useState('all')
  const [rows, setRows] = useState<NotificationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())
  const [unreadCount, setUnreadCount] = useState(0)
  const [tick, setTick] = useState(0)

  // Refresh "X minutes ago" labels every minute
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const result = await notificationService.list({ limit: 100 })
      setRows(result.items)
      setUnreadCount(result.totalUnread)
    } catch (e: any) {
      setFetchError(e?.message ?? 'Could not load notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!member?.member_id) return
    load()
  }, [member?.member_id, load])

  // Mark all as read when the user lands on the page
  // (deferred slightly so the unread badge briefly shows)
  useEffect(() => {
    if (!member?.member_id || loading || unreadCount === 0) return
    const id = setTimeout(() => {
      notificationService.markAllRead()
        .then(() => {
          setRows(prev => prev.map(r => ({ ...r, isRead: true })))
          setUnreadCount(0)
        })
        .catch(() => {})
    }, 1500)
    return () => clearTimeout(id)
  }, [member?.member_id, loading, unreadCount])

  const toggleNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedNotes(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filtered = useMemo(() => {
    let src = rows
    if (filter === 'unread') src = rows.filter(r => !r.isRead)
    else if (filter !== 'all') src = rows.filter(r => r.type === filter)
    // Re-derive timeAgo each tick so labels stay fresh
    void tick
    return src
  }, [rows, filter, tick])

  return (
    <div className="route-enter aq-wrap" style={{ paddingTop: 'clamp(28px, 4vw, 48px)', paddingBottom: 80 }}>
      <span className="sticker sticker-mint wobble">★ NOTIFICATIONS</span>
      <h1 className="h-display" style={{ fontSize: 'clamp(44px, 7vw, 72px)', margin: '12px 0 20px', lineHeight: 0.95 }}>
        what's new<span style={{ color: 'var(--pink)' }}>.</span>
        {unreadCount > 0 && (
          <span style={{ marginLeft: 16, fontSize: 18, fontFamily: 'var(--mono)', color: 'var(--pink)', verticalAlign: 'middle', fontVariantNumeric: 'tabular-nums' }}>
            {unreadCount} new
          </span>
        )}
      </h1>

      {fetchError && (
        <div style={{
          marginBottom: 16,
          padding: '12px 16px',
          borderRadius: 'var(--r, 12px)',
          background: 'rgba(255,77,46,0.10)',
          border: '2px solid rgba(255,77,46,0.45)',
          color: 'var(--tomato, #FF4D2E)',
          fontSize: 14,
          fontWeight: 600,
        }}>
          {fetchError}
        </div>
      )}

      <div className="row gap-2 flex-wrap" style={{ marginBottom: 20 }}>
        {FILTER_LABEL.map(([k, l]) => (
          <button key={k} className={'chip ' + (filter === k ? 'chip-active' : '')} onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>

      {loading ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} className="v6-skeleton" style={{ height: 64, borderRadius: 0, marginBottom: 2, animationDelay: `${i * 0.06}s` }} />
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div className="mono xs muted">nothing here yet.</div>
            </div>
          ) : (
            filtered.map((n, i) => {
              const isExpanded = expandedNotes.has(n.id)
              const hasLongNote = Boolean(n.fullNote)
              const icon = ICON_FOR_TYPE[n.type] ?? '★'
              return (
                <div
                  key={n.id}
                  className="notif-row"
                  style={{
                    borderBottom: i < filtered.length - 1 ? '2px solid var(--line)' : 'none',
                    cursor: n.link ? 'pointer' : 'default',
                    background: n.isRead ? undefined : 'rgba(0, 229, 160, 0.06)',
                  }}
                  onClick={() => n.link && (window.location.href = n.link)}
                >
                  <div className="notif-mark">{icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>
                      {n.title}
                      {!n.isRead && (
                        <span style={{ marginLeft: 8, width: 6, height: 6, borderRadius: 999, background: 'var(--pink)', display: 'inline-block', verticalAlign: 'middle' }} />
                      )}
                    </div>
                    {hasLongNote ? (
                      <div className="muted" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                        {isExpanded ? n.fullNote : n.subtitle}
                        <button
                          className="mono xs"
                          onClick={(e) => toggleNote(n.id, e)}
                          style={{ color: 'var(--mint)', cursor: 'pointer', background: 'none', border: 'none', marginLeft: 6, padding: 0 }}
                        >
                          {isExpanded ? 'show less ←' : 'read more →'}
                        </button>
                      </div>
                    ) : n.subtitle ? (
                      <div className="muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.subtitle}</div>
                    ) : null}
                  </div>
                  <div className="mono xs muted" style={{ fontVariantNumeric: 'tabular-nums', flexShrink: 0, marginLeft: 8 }}>{timeAgo(n.createdAt)}</div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
