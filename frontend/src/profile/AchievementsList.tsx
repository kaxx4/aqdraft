import { useState } from 'react'
import { Achievement } from '../services/api'
import AddAchievementModal from './AddAchievementModal'
import EditAchievementModal from './EditAchievementModal'
import achievementService from '../services/achievementService'
import { useToast } from '../components/Toast'
import { useConfirm } from '../components/Confirm'

// Status chip styling — three states, each with its own visual weight
// (pending = quiet yellow, approved = mint, rejected = soft red).
const STATUS_INFO: Record<Achievement['status'], { label: string; bg: string; fg: string; border: string }> = {
  pending:  { label: 'Pending review', bg: 'rgba(255,199,0,0.16)', fg: '#A07700', border: 'rgba(255,199,0,0.4)' },
  approved: { label: 'Approved',       bg: 'rgba(0,229,160,0.14)', fg: '#0A7548', border: 'rgba(0,229,160,0.4)' },
  rejected: { label: 'Rejected',       bg: 'rgba(224,92,92,0.12)', fg: '#A93030', border: 'rgba(224,92,92,0.4)' },
}

interface AchievementsListProps {
  achievements: Achievement[]
  isLoading: boolean
  isOwn: boolean
  profileName: string
  onRefresh: () => void
}

const ACHIEVEMENT_TYPE_INFO: Record<string, { emoji: string; label: string; color: string }> = {
  leadership:       { emoji: '👑', label: 'Leadership',      color: '#FF7A1A' },
  academic:         { emoji: '📚', label: 'Academic',        color: '#3DA9FC' },
  competition:      { emoji: '🏆', label: 'Competition',     color: '#FFC700' },
  personal_project: { emoji: '💡', label: 'Project',         color: '#7E5BFF' },
  other:            { emoji: '🌟', label: 'Other',           color: 'var(--mint)' },
}

const formatDateRange = (startDate: string, endDate?: string | null): string => {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
  return `${fmt(startDate)} – ${endDate ? fmt(endDate) : 'Present'}`
}

const AchievementsList = ({ achievements, isLoading, isOwn, profileName, onRefresh }: AchievementsListProps) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [sharingId, setSharingId] = useState<string | null>(null)
  const toast = useToast()
  const confirm = useConfirm()

  // Public-facing profile filters down to approved only — pending/rejected
  // are private to the owner. Own profile sees everything with badges.
  const visibleAchievements = isOwn
    ? achievements
    : achievements.filter(a => a.status === 'approved')

  const handleDelete = async (uuid: string) => {
    const ok = await confirm({
      title: 'Delete this achievement?',
      body: 'This removes it from your profile permanently.',
      confirmLabel: 'Delete',
      danger: true,
    })
    if (!ok) return
    setDeletingId(uuid)
    try {
      await achievementService.deleteAchievement(uuid)
      onRefresh()
    } catch {
      toast.error('Failed to delete achievement')
    } finally {
      setDeletingId(null)
    }
  }

  const handleShare = async (achievement: Achievement) => {
    if (achievement.status !== 'approved') {
      toast.info('Wait for approval first', 'Only approved achievements can be shared to the feed.')
      return
    }
    const ok = await confirm({
      title: 'Share to the feed?',
      body: `"${achievement.title}" will appear as a post on the public feed.`,
      confirmLabel: 'Share',
    })
    if (!ok) return
    setSharingId(achievement.uuid)
    try {
      const result = await achievementService.shareAsPost(achievement.uuid)
      if (result?.success) {
        toast.success('Shared!', 'Your achievement is now on the feed.')
      } else {
        toast.error('Couldn\'t share', 'Try again in a moment.')
      }
    } catch (err: any) {
      toast.error('Couldn\'t share', err?.message ?? 'Try again in a moment.')
    } finally {
      setSharingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="sk-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="v6-skeleton" style={{ height: 180, borderRadius: 16 }} />
        ))}
      </div>
    )
  }

  if (visibleAchievements.length === 0) {
    return (
      <>
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🏅</div>
          <div className="h-display" style={{ fontSize: 22, marginBottom: 8 }}>no achievements yet.</div>
          <p style={{ fontFamily: 'var(--eina)', fontSize: 14, color: 'var(--ink-3)', marginBottom: isOwn ? 20 : 0 }}>
            {isOwn
              ? "Showcase your accomplishments: competitions, projects, roles."
              : `${profileName} hasn't added any achievements yet.`}
          </p>
          {isOwn && (
            <button className="btn btn-sm btn-primary" onClick={() => setIsAddModalOpen(true)}>
              + Add achievement
            </button>
          )}
        </div>
        {isOwn && (
          <AddAchievementModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAchievementCreated={onRefresh}
          />
        )}
      </>
    )
  }

  return (
    <>
      {isOwn && (
        <div style={{ marginBottom: 16 }}>
          <button className="btn btn-sm btn-primary" onClick={() => setIsAddModalOpen(true)}>
            + Add achievement
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {visibleAchievements.map(achievement => {
          const info = ACHIEVEMENT_TYPE_INFO[achievement.achievementType] ?? ACHIEVEMENT_TYPE_INFO.other
          const accentColor = info.color
          const statusInfo = STATUS_INFO[achievement.status] ?? STATUS_INFO.approved
          const showStatusBadge = isOwn && achievement.status !== 'approved'
          const canShare = isOwn && achievement.status === 'approved'
          const isSharing = sharingId === achievement.uuid

          return (
            <div key={achievement.achievementId} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              {/* Color bar */}
              <div style={{ height: 3, background: accentColor }} />

              {/* Status banner — only on owner-facing view for non-approved.
                  Approved achievements look like before (no banner) so the
                  visual stays calm. Rejection notes display under the
                  banner so the owner can see why and fix it. */}
              {showStatusBadge && (
                <div
                  style={{
                    background: statusInfo.bg,
                    borderBottom: `1px solid ${statusInfo.border}`,
                    color: statusInfo.fg,
                    fontFamily: 'var(--mono)',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  title={achievement.status === 'rejected' && achievement.reviewNote ? `Reason: ${achievement.reviewNote}` : undefined}
                >
                  <span>{achievement.status === 'pending' ? '⏳' : '✕'}</span>
                  <span>{statusInfo.label}</span>
                  {achievement.status === 'rejected' && achievement.reviewNote && (
                    <span style={{ marginLeft: 'auto', fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>
                      — {achievement.reviewNote.slice(0, 40)}{achievement.reviewNote.length > 40 ? '…' : ''}
                    </span>
                  )}
                </div>
              )}

              {/* Proof image */}
              {achievement.proofUrl && (
                <img
                  src={achievement.proofUrl}
                  alt={achievement.title}
                  className="no-long-press"
                  style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block', outline: '1px solid rgba(0,0,0,0.1)' }}
                />
              )}

              {/* Body */}
              <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Type + actions row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: accentColor, border: `1px solid ${accentColor}`,
                    borderRadius: 999, padding: '2px 8px',
                  }}>
                    {info.emoji} {info.label}
                  </span>
                  {isOwn && (
                    <div style={{ display: 'flex', gap: 2 }}>
                      {/* Share-to-feed button — only for approved achievements.
                          Submits the achievement as a feed post via
                          achievementService.shareAsPost (lazy-imports
                          feedService to keep the profile chunk small). */}
                      {canShare && (
                        <button
                          onClick={() => handleShare(achievement)}
                          disabled={isSharing}
                          style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: isSharing ? 'wait' : 'pointer', color: 'var(--mint)', borderRadius: 8, fontSize: 16, opacity: isSharing ? 0.5 : 1, [`transition` as any]: 'background 120ms cubic-bezier(0.2,0,0,1), transform 120ms' }}
                          onMouseEnter={e => { if (!isSharing) e.currentTarget.style.background = 'rgba(0,229,160,0.1)' }}
                          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                          onMouseDown={e => { if (!isSharing) e.currentTarget.style.transform = 'scale(0.96)' }}
                          onMouseUp={e => (e.currentTarget.style.transform = '')}
                          title="Share to feed"
                          aria-label="Share achievement to feed"
                        >
                          {isSharing ? '…' : '↗'}
                        </button>
                      )}
                      <button
                        onClick={() => setEditingAchievement(achievement)}
                        style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', borderRadius: 8, fontSize: 14, transition: 'background 0.12s, transform 0.12s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
                        onMouseUp={e => (e.currentTarget.style.transform = '')}
                        title="Edit"
                        aria-label="Edit achievement"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDelete(achievement.uuid)}
                        disabled={deletingId === achievement.uuid}
                        style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#e05c5c', borderRadius: 8, fontSize: 14, opacity: deletingId === achievement.uuid ? 0.5 : 1, transition: 'background 0.12s, transform 0.12s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(224,92,92,0.1)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
                        onMouseUp={e => (e.currentTarget.style.transform = '')}
                        title="Delete"
                        aria-label="Delete achievement"
                      >
                        {deletingId === achievement.uuid ? '…' : '✕'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em', color: 'var(--ink)', lineHeight: 1.3 }}>
                  {achievement.title}
                </div>

                {/* Description */}
                {achievement.description && (
                  <p style={{ fontFamily: 'var(--eina)', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                    {achievement.description}
                  </p>
                )}

                {/* Date */}
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', marginTop: 'auto', paddingTop: 4 }}>
                  {formatDateRange(achievement.achievementDate, achievement.achievementEndDate)}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {isOwn && (
        <>
          <AddAchievementModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAchievementCreated={onRefresh}
          />
          {editingAchievement && (
            <EditAchievementModal
              isOpen={!!editingAchievement}
              onClose={() => setEditingAchievement(null)}
              achievement={editingAchievement}
              onAchievementUpdated={onRefresh}
            />
          )}
        </>
      )}
    </>
  )
}

export default AchievementsList
