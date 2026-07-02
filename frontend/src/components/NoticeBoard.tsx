import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import feedService from '../services/feedService'
import { DEPT_COLORS } from '../lib/supabase'

interface PinEntry {
  uuid: string
  category: string
  body: string
  pinnedTitle: string | null
  authorName: string
  authorUuid: string
  createdAt: string
}

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (d < 3600) return `${Math.max(1, Math.floor(d / 60))}m ago`
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`
  if (d < 604800) return `${Math.floor(d / 86400)}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Pinned notice board banner — appears above the main feed when posts are pinned.
 * Leaders pin posts from the home page right rail → "edit notice board", or via
 * the ⋯ menu on any post (super_admin), or the HoD Desk Content tab.
 */
export default function NoticeBoard() {
  const navigate = useNavigate()
  const [pins, setPins] = useState<PinEntry[]>([])
  const [collapsed, setCollapsed] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    feedService.getPinnedPosts()
      .then(r => { if (r.success) setPins(r.data) })
      .catch(() => {})
      .finally(() => setIsLoaded(true))
  }, [])

  if (!isLoaded || pins.length === 0) return null

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0A0A0A 0%, #111 100%)',
      border: '2px solid var(--mint)',
      borderRadius: 'var(--r-md)',
      overflow: 'hidden',
      marginBottom: 20,
    }}>
      {/* Header row */}
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
          borderBottom: collapsed ? 'none' : '1px solid rgba(0,229,160,0.15)',
        }}
      >
        <span style={{
          fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          padding: '3px 10px', borderRadius: 999,
          background: 'var(--mint)', color: '#0A0A0A',
        }}>
          📌 notice board
        </span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(255,255,255,0.35)', flex: 1, textAlign: 'left' }}>
          {pins.length} pinned
        </span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'var(--mono)' }}>
          {collapsed ? '▼' : '▲'}
        </span>
      </button>

      {!collapsed && (
        <div>
          {pins.map((pin, idx) => {
            const accent = DEPT_COLORS[pin.category] || '#00E5A0'
            const displayTitle = pin.pinnedTitle || pin.body.slice(0, 80).trimEnd()
            const preview = pin.body.length > 120 ? pin.body.slice(0, 120).trimEnd() + '…' : pin.body

            return (
              <button
                key={pin.uuid}
                onClick={() => navigate(`/post/${pin.uuid}`)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%',
                  padding: '12px 16px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  borderTop: idx > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  textAlign: 'left', transition: 'background 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                {/* Numbered stripe */}
                <div style={{ width: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', flexShrink: 0, paddingTop: 2 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 800, color: accent }}>{idx + 1}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 13, color: '#fff', lineHeight: 1.2, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayTitle}
                  </div>
                  <div style={{ fontFamily: 'var(--eina)', fontSize: 12, color: 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {preview}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', padding: '1px 6px', borderRadius: 999, background: accent + '22', color: accent, border: `1px solid ${accent}40` }}>{pin.category}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{pin.authorName} · {timeAgo(pin.createdAt)}</span>
                  </div>
                </div>
                <span style={{ color: accent, fontSize: 14, flexShrink: 0, marginTop: 2 }}>→</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
