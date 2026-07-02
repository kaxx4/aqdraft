// ──────────────────────────────────────────────────────────────────────────
// Director · Achievement Reviews
// ──────────────────────────────────────────────────────────────────────────
// Lists every external_achievement currently in `status = 'pending'` so
// directors can approve or reject submissions before they show on public
// profiles. Rendered inline as a tab in /director.
//
// UX flow:
//   - Card per pending submission (oldest first — FIFO queue)
//   - Each card: member name + avatar, type chip, dates, proof image,
//     full title + description, [Approve] + [Reject (with note)] buttons
//   - On action: row disappears from the queue; toast confirms
//   - "Reject with note" prompts for a one-line reason; reason shows up
//     on the owner's profile so they know why
// ──────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import achievementService from '../services/achievementService'
import { AchievementReview } from '../services/api'
import { useToast } from '../components/Toast'
import { AdminLayout, AdminTabHeader, EmptyState } from './adminKit'

const TYPE_LABEL: Record<string, string> = {
  leadership: '👑 Leadership',
  academic: '📚 Academic',
  competition: '🏆 Competition',
  personal_project: '💡 Personal Project',
  other: '🌟 Other',
}

const formatDateRange = (start: string, end?: string | null) => {
  const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
  return `${fmt(start)} – ${end ? fmt(end) : 'Present'}`
}

export default function AchievementReviews() {
  const toast = useToast()
  const [items, setItems] = useState<AchievementReview[]>([])
  const [loading, setLoading] = useState(true)
  const [actingId, setActingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await achievementService.getPendingReviews({ limit: 100 })
      if (r.success) setItems(r.data)
    } catch (e: any) {
      toast.error('Failed to load queue', e?.message ?? 'Please refresh.')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  const handleApprove = async (a: AchievementReview) => {
    setActingId(a.uuid)
    try {
      await achievementService.approveAchievement(a.uuid)
      setItems(prev => prev.filter(x => x.uuid !== a.uuid))
      toast.success('Approved', `${a.title} is now public on ${a.memberFullName}'s profile.`)
    } catch (e: any) {
      toast.error('Approval failed', e?.message ?? 'Try again.')
    } finally {
      setActingId(null)
    }
  }

  const handleReject = async (a: AchievementReview) => {
    const note = window.prompt(
      `Reject "${a.title}"?\n\nOptional note for ${a.memberFullName} (they'll see this on their profile so they can re-submit):`,
      '',
    )
    if (note === null) return // cancelled
    setActingId(a.uuid)
    try {
      await achievementService.rejectAchievement(a.uuid, note || undefined)
      setItems(prev => prev.filter(x => x.uuid !== a.uuid))
      toast.success('Rejected', note ? `Note sent: "${note}"` : 'Achievement removed from queue.')
    } catch (e: any) {
      toast.error('Reject failed', e?.message ?? 'Try again.')
    } finally {
      setActingId(null)
    }
  }

  return (
    <AdminLayout>
      <div style={{ paddingTop: 'clamp(8px,2vw,16px)', paddingBottom: 80, maxWidth: 880 }}>
        <AdminTabHeader
          label="Achievements"
          title="Achievement reviews"
          count={items.length}
          subtitle="Approve or reject member achievement submissions for public profiles."
        />

      {loading ? (
        <div className="sk-group" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => <div key={i} className="v6-skeleton" style={{ height: 140, borderRadius: 16 }} />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon="✨" title="All clear" hint="No achievements are currently pending review." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(a => {
            const acting = actingId === a.uuid
            return (
              <div key={a.uuid} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Header — member name + submitted date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
                  <div
                    aria-hidden
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'var(--mint)',
                      color: '#0A0A0A',
                      display: 'grid', placeItems: 'center',
                      fontFamily: 'var(--display)', fontWeight: 900, fontSize: 13,
                      flexShrink: 0,
                      outline: '1px solid rgba(0,0,0,0.1)',
                      outlineOffset: '-1px',
                      backgroundImage: a.memberAvatarUrl ? `url(${a.memberAvatarUrl})` : undefined,
                      backgroundSize: 'cover', backgroundPosition: 'center',
                    }}
                  >
                    {!a.memberAvatarUrl && (a.memberFullName.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'M')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>
                      {a.memberFullName}
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 2 }}>
                      Submitted {new Date(a.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: '#A07700', background: 'rgba(255,199,0,0.16)',
                    border: '1px solid rgba(255,199,0,0.4)',
                    borderRadius: 999, padding: '3px 10px',
                  }}>
                    ⏳ Pending
                  </span>
                </div>

                {/* Body */}
                <div style={{ display: 'grid', gridTemplateColumns: a.proofUrl ? '140px 1fr' : '1fr', gap: 14, padding: 16 }}>
                  {a.proofUrl && (
                    <a href={a.proofUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                      <img
                        src={a.proofUrl}
                        alt="Proof"
                        style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, outline: '1px solid rgba(0,0,0,0.1)', outlineOffset: '-1px' }}
                      />
                    </a>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)', marginBottom: 6 }}>
                      {TYPE_LABEL[a.achievementType] ?? a.achievementType}
                      <span style={{ marginLeft: 8, opacity: 0.7 }}>
                        · {formatDateRange(a.achievementDate, a.achievementEndDate)}
                      </span>
                    </div>
                    <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 17, lineHeight: 1.25, letterSpacing: '-0.01em', color: 'var(--ink)', marginBottom: a.description ? 8 : 0 }}>
                      {a.title}
                    </div>
                    {a.description && (
                      <p style={{ fontFamily: 'var(--eina)', fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.55, margin: 0, textWrap: 'pretty' as const }}>
                        {a.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '0 16px 16px' }}>
                  <button
                    onClick={() => handleReject(a)}
                    disabled={acting}
                    style={{
                      minHeight: 44, padding: '10px 18px',
                      background: 'transparent',
                      color: '#e05c5c',
                      border: '1.5px solid rgba(224,92,92,0.45)',
                      borderRadius: 999,
                      fontFamily: 'var(--display)', fontWeight: 700, fontSize: 13.5,
                      cursor: acting ? 'wait' : 'pointer',
                      transition: 'background-color 150ms cubic-bezier(0.2,0,0,1), transform 120ms',
                      opacity: acting ? 0.5 : 1,
                    }}
                    onMouseEnter={e => { if (!acting) e.currentTarget.style.background = 'rgba(224,92,92,0.08)' }}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onMouseDown={e => { if (!acting) e.currentTarget.style.transform = 'scale(0.96)' }}
                    onMouseUp={e => (e.currentTarget.style.transform = '')}
                  >
                    ✕ Reject
                  </button>
                  <button
                    onClick={() => handleApprove(a)}
                    disabled={acting}
                    style={{
                      minHeight: 44, padding: '10px 22px',
                      background: 'var(--mint)',
                      color: '#0A0A0A',
                      border: '1.5px solid var(--mint)',
                      borderRadius: 999,
                      fontFamily: 'var(--display)', fontWeight: 700, fontSize: 13.5,
                      cursor: acting ? 'wait' : 'pointer',
                      transition: 'background-color 150ms cubic-bezier(0.2,0,0,1), transform 120ms',
                      opacity: acting ? 0.5 : 1,
                    }}
                    onMouseDown={e => { if (!acting) e.currentTarget.style.transform = 'scale(0.96)' }}
                    onMouseUp={e => (e.currentTarget.style.transform = '')}
                    onMouseLeave={e => (e.currentTarget.style.transform = '')}
                  >
                    {acting ? '…' : '✓ Approve'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      </div>
    </AdminLayout>
  )
}
