import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { hasLeaderAccess } from '../lib/roles'
import { jobOpenings, JobOpening, CAT_COLORS, OpeningStatus, STATUS_COLORS, STATUS_LABELS, ALLOWED_TRANSITIONS } from '../lib/jobOpenings'
import { CAT_TO_DEPT } from '../lib/categories'
import { I } from '../components/v6Shared'
import { useToast } from '../components/Toast'
import type { Database } from '../lib/database.types'

type Member = Database['public']['Tables']['members']['Row']

// ── Opening Form Modal ────────────────────────────────────────────────────────
function OpeningFormModal({
  opening, onClose, onSaved, createdByName, createdByRole,
}: {
  opening: JobOpening | null
  onClose: () => void
  onSaved: () => void
  createdByName: string
  createdByRole: string
}) {
  const isNew = !opening
  const { success } = useToast()
  const [title, setTitle]     = useState(opening?.title || '')
  const [desc, setDesc]       = useState(opening?.description || '')
  const [cat, setCat]         = useState(opening?.category || 'welfare')
  const [team, setTeam]       = useState(opening?.teamName || '')
  const [skills, setSkills]   = useState(opening?.skills.join(', ') || '')
  const [commit, setCommit]   = useState(opening?.commitment || '')
  const [deadline, setDeadline] = useState(opening?.deadline ? opening.deadline.slice(0, 10) : '')

  const accent = CAT_COLORS[cat] || '#00E5A0'
  const labelSt: React.CSSProperties = { fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', display: 'block', marginBottom: 6 }
  const inputSt: React.CSSProperties = { width: '100%', padding: '10px 12px', background: 'var(--bg-2)', border: '1.5px solid var(--line-2)', borderRadius: 12, color: 'var(--ink)', fontFamily: 'var(--sans)', fontSize: 16, outline: 'none' }

  const handleSave = async () => {
    if (!title.trim() || !desc.trim()) return
    const data = {
      title: title.trim(), description: desc.trim(),
      category: cat, teamName: team.trim() || undefined,
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      commitment: commit.trim() || undefined,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      createdByName, createdByRole,
    }
    if (isNew) {
      await jobOpenings.create(data)
      success('Opening posted!', 'Now live on the board.')
    } else {
      await jobOpenings.update(opening!.id, data)
      success('Opening updated ✓')
    }
    onSaved(); onClose()
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 520, background: 'var(--card)', borderRadius: 20, overflow: 'hidden', border: '2px solid var(--ink)', maxHeight: '90dvh', overflowY: 'auto' }}>
        <div style={{ background: accent, padding: '20px 24px 16px', color: '#0A0A0A', borderBottom: '2px solid var(--ink)' }}>
          <div style={{ fontFamily: 'var(--display)', fontWeight: 900, fontSize: 20 }}>{isNew ? 'post a job opening' : 'edit opening'}</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, opacity: 0.7, marginTop: 2 }}>{isNew ? 'visible to all members immediately' : `editing: ${opening?.title}`}</div>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label style={labelSt}>Role title *</label><input style={inputSt} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Social Media Manager" maxLength={80} /></div>
          <div>
            <label style={labelSt}>Category *</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {Object.entries(CAT_COLORS).map(([c, col]) => (
                <button key={c} onClick={() => setCat(c)} className="btn btn-sm"
                  style={{ background: cat === c ? col : 'var(--bg-2)', color: cat === c ? '#0A0A0A' : 'var(--ink)', borderColor: cat === c ? col : 'transparent', textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.04em' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div><label style={labelSt}>Description *</label><textarea style={{ ...inputSt, minHeight: 100, resize: 'vertical' }} value={desc} onChange={e => setDesc(e.target.value)} placeholder="What does this role involve? What's expected?" /></div>
          <div className="opening-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={labelSt}>Team <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span></label><input style={inputSt} value={team} onChange={e => setTeam(e.target.value)} placeholder="e.g. Events Team" /></div>
            <div><label style={labelSt}>Commitment <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span></label><input style={inputSt} value={commit} onChange={e => setCommit(e.target.value)} placeholder="e.g. 2-3 hrs/week" /></div>
          </div>
          <div><label style={labelSt}>Skills <span style={{ opacity: 0.5, fontWeight: 400 }}>(comma separated)</span></label><input style={inputSt} value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g. Canva, Excel, Communication" /></div>
          <div>
            <label style={labelSt}>Deadline <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional — auto-pauses when passed)</span></label>
            <input type="date" style={inputSt} value={deadline} onChange={e => setDeadline(e.target.value)} min={new Date().toISOString().slice(0, 10)} />
          </div>
          <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
            <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center', background: accent, borderColor: accent, color: '#0A0A0A' }}
              disabled={!title.trim() || !desc.trim()} onClick={handleSave}>
              {isNew ? '✓ post opening' : '✓ save changes'}
            </button>
            <button className="btn btn-sm btn-ghost" onClick={onClose}>cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Apply Modal ───────────────────────────────────────────────────────────────
function ApplyModal({ op, member, onClose, onApplied }: {
  op: JobOpening
  member: Member
  onClose: () => void
  onApplied: () => void
}) {
  const { error: toastError } = useToast()
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const accent = CAT_COLORS[op.category] || '#00E5A0'

  const submit = async () => {
    setSubmitting(true)
    const result = await jobOpenings.apply(op.id, member.member_id, member.full_name, member.email, message)
    setSubmitting(false)
    if (result.alreadyApplied) { toastError('You already applied for this role.'); onApplied(); onClose(); return }
    if (!result.success) { toastError(result.error || 'Something went wrong.'); return }
    setDone(true)
    onApplied()
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, background: 'var(--card)', borderRadius: 20, overflow: 'hidden', border: '2px solid var(--ink)', boxShadow: '6px 6px 0 var(--ink)' }}>
        {/* Header */}
        <div style={{ background: accent, padding: '18px 24px 16px', color: '#0A0A0A', borderBottom: '2px solid var(--ink)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.6, marginBottom: 6 }}>
            applying for
          </div>
          <div style={{ fontFamily: 'var(--display)', fontWeight: 900, fontSize: 22, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            {op.title}
          </div>
        </div>

        {done ? (
          <div style={{ padding: '36px 24px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 900, fontSize: 30, marginBottom: 10, letterSpacing: '-0.03em' }}>you&apos;re in. ✓</div>
            <p style={{ fontFamily: 'var(--eina)', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 20 }}>
              Application submitted. The team will review it and reach out.
            </p>
            <button className="btn btn-sm btn-primary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Who is applying */}
            <div style={{ background: 'var(--bg-2)', borderRadius: 10, padding: '10px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)' }}>
              Applying as <strong style={{ color: 'var(--ink)' }}>{member.full_name}</strong>
            </div>
            {/* Message */}
            <div>
              <label style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', display: 'block', marginBottom: 6 }}>
                Why are you a good fit? <span style={{ opacity: 0.5, fontWeight: 400, textTransform: 'none' }}>(optional)</span>
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Tell the team a bit about yourself and why you're interested..."
                style={{ width: '100%', minHeight: 110, padding: '10px 12px', background: 'var(--bg-2)', border: '1.5px solid var(--line-2)', borderRadius: 10, fontFamily: 'var(--eina)', fontSize: 16, color: 'var(--ink)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-primary btn-sm"
                style={{ flex: 1, justifyContent: 'center', background: accent, borderColor: accent, color: '#0A0A0A', boxShadow: '2px 2px 0 #0A0A0A' }}
                disabled={submitting}
                onClick={submit}
              >
                {submitting ? 'Submitting…' : 'Submit application →'}
              </button>
              <button className="btn btn-sm btn-ghost" onClick={onClose}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Applications Modal (leader/director view) ─────────────────────────────────
const APP_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  pending:  { bg: '#FFC70022', color: '#b38a00' },
  reviewed: { bg: '#3DA9FC22', color: '#3DA9FC' },
  accepted: { bg: '#00E5A022', color: '#009966' },
  rejected: { bg: '#e05c5c22', color: '#e05c5c' },
}

function ApplicationsModal({ op, onClose }: { op: JobOpening; onClose: () => void }) {
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const accent = CAT_COLORS[op.category] || '#00E5A0'

  useEffect(() => {
    jobOpenings.getApplications(op.id).then(data => { setApps(data); setLoading(false) })
  }, [op.id])

  const updateStatus = async (appId: string, status: 'pending' | 'reviewed' | 'accepted' | 'rejected') => {
    await jobOpenings.updateApplicationStatus(appId, status)
    setApps(prev => prev.map(a => a.id === appId ? { ...a, status } : a))
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 560, background: 'var(--card)', borderRadius: 20, overflow: 'hidden', border: '2px solid var(--ink)', boxShadow: '6px 6px 0 var(--ink)', maxHeight: '85dvh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ background: accent, padding: '16px 24px 14px', color: '#0A0A0A', borderBottom: '2px solid var(--ink)', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.6, marginBottom: 4 }}>
            Applications
          </div>
          <div style={{ fontFamily: 'var(--display)', fontWeight: 900, fontSize: 20, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            {op.title}
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink-3)' }}>Loading…</div>
          ) : apps.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 900, fontSize: 22, marginBottom: 8, letterSpacing: '-0.03em' }}>no applications yet.</div>
              <p style={{ fontFamily: 'var(--eina)', fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.6 }}>Applications from members will appear here.</p>
            </div>
          ) : (
            <div>
              {apps.map((app, i) => {
                const pill = APP_STATUS_STYLE[app.status] || APP_STATUS_STYLE.pending
                return (
                  <div key={app.id} style={{ padding: '16px 24px', borderBottom: i < apps.length - 1 ? '1px solid var(--line)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div>
                        <div style={{ fontFamily: 'var(--eina)', fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>{app.applicant_name}</div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{app.applicant_email}</div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', marginTop: 3 }}>
                          {new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <select
                        value={app.status || 'pending'}
                        onChange={e => updateStatus(app.id, e.target.value as any)}
                        style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '5px 10px', borderRadius: 999, background: pill.bg, color: pill.color, border: `1px solid ${pill.color}55`, outline: 'none', cursor: 'pointer', flexShrink: 0 }}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    {app.message && (
                      <p style={{ fontFamily: 'var(--eina)', fontSize: 13, color: 'var(--ink-2)', marginTop: 10, lineHeight: 1.65, background: 'var(--bg-2)', padding: '10px 12px', borderRadius: 8, whiteSpace: 'pre-wrap', margin: '10px 0 0' }}>
                        {app.message}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 24px', borderTop: '1px solid var(--line)', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)' }}>
            {loading ? '…' : `${apps.length} application${apps.length !== 1 ? 's' : ''}`}
          </span>
          <button className="btn btn-sm btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

// ── Opening Card ──────────────────────────────────────────────────────────────
function OpeningCard({ op, isLeader, onManage, member, isAuthenticated }: {
  op: JobOpening
  isLeader: boolean
  onManage: (op: JobOpening) => void
  member: Member | null
  isAuthenticated: boolean
}) {
  const accent = CAT_COLORS[op.category] || '#00E5A0'
  const isPaused = op.status === 'paused'
  const isClosed = op.status === 'closed'
  const isInactive = isPaused || isClosed
  const daysLeft = op.deadline ? Math.ceil((new Date(op.deadline).getTime() - Date.now()) / 86400000) : null
  const [applyOpen, setApplyOpen] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)

  useEffect(() => {
    if (!member || op.status !== 'open') return
    jobOpenings.hasApplied(op.id, member.member_id).then(setHasApplied)
  }, [op.id, member])

  return (
    <>
      <div style={{
        background: 'var(--card)',
        border: '2px solid var(--ink)',
        borderRadius: 'var(--r)',
        boxShadow: '4px 4px 0 var(--ink)',
        overflow: 'hidden',
        opacity: isInactive ? 0.72 : 1,
      }}>
        {/* Coloured header band */}
        <div style={{
          background: isInactive ? 'var(--bg-2)' : accent,
          borderBottom: '2px solid var(--ink)',
          padding: '16px 20px 14px',
          color: isInactive ? 'var(--ink)' : '#0A0A0A',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7, flexWrap: 'wrap' }}>
                {/* category → the department it belongs to */}
                <Link
                  to={CAT_TO_DEPT[op.category] ? `/everything-we-do#${CAT_TO_DEPT[op.category]}` : '/everything-we-do'}
                  style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.65, color: 'inherit', textDecoration: 'none', borderBottom: '1px dashed currentColor' }}
                >
                  {op.category}
                </Link>
                {op.teamName && (
                  <>
                    <span style={{ opacity: 0.35, fontSize: 10 }}>·</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.65 }}>
                      {op.teamName}
                    </span>
                  </>
                )}
                {isInactive && (
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 800, textTransform: 'uppercase',
                    letterSpacing: '0.06em', padding: '2px 8px', borderRadius: 999,
                    background: STATUS_COLORS[op.status] + '28', color: STATUS_COLORS[op.status],
                    border: `1px solid ${STATUS_COLORS[op.status]}55`, marginLeft: 2,
                  }}>
                    {STATUS_LABELS[op.status]}
                  </span>
                )}
              </div>
              <h3 style={{ fontFamily: 'var(--display)', fontWeight: 900, fontSize: 'clamp(18px, 3.5vw, 22px)', letterSpacing: '-0.03em', lineHeight: 1.05, margin: 0 }}>
                {op.title}
              </h3>
            </div>
            {isLeader && (
              <button
                className="btn btn-sm btn-ghost"
                style={{
                  // 40×40 hit area minimum — the visible glyph is small but
                  // padding fills the rest. Was 4px 10px (28×24).
                  minWidth: 40, minHeight: 40,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  padding: 0, fontSize: 16, flexShrink: 0,
                  background: 'rgba(0,0,0,0.12)', border: 'none', boxShadow: 'none',
                }}
                onClick={() => onManage(op)}
                title="Manage opening"
                aria-label="Manage opening"
              >⋯</button>
            )}
          </div>
        </div>

        {/* Description + skills */}
        <div style={{ padding: '16px 20px' }}>
          <p style={{ fontFamily: 'var(--eina)', fontSize: 14, lineHeight: 1.65, color: 'var(--ink-2)', margin: 0, whiteSpace: 'pre-wrap' }}>
            {op.description}
          </p>
          {op.skills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
              {op.skills.map(s => (
                <span key={s} style={{
                  fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
                  padding: '3px 10px', borderRadius: 999,
                  background: accent + '18', color: accent, border: `1px solid ${accent}44`,
                }}>{s}</span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '10px 20px 14px', borderTop: '1px dashed var(--line)', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            {op.commitment && <span className="mono xs muted">⏱ {op.commitment}</span>}
            {daysLeft !== null && daysLeft > 0 && (
              <span className="mono xs muted" style={{ color: daysLeft <= 3 ? '#e05c5c' : undefined }}>
                {daysLeft <= 3 ? `⚠ ${daysLeft}d left` : `${daysLeft}d left`}
              </span>
            )}
            <span className="mono xs muted">— {op.createdByName}</span>
          </div>

          {/* CTA — auth-aware */}
          {op.status === 'open' ? (
            !isAuthenticated ? (
              <Link to="/_login" className="btn btn-sm" style={{ flexShrink: 0, background: 'var(--bg-2)', color: 'var(--ink-2)', fontSize: 12 }}>
                Log in to apply
              </Link>
            ) : hasApplied ? (
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
                padding: '5px 12px', borderRadius: 999,
                background: '#00E5A018', color: '#009966',
                border: '1px solid #00E5A044',
              }}>
                ✓ applied
              </span>
            ) : (
              <button
                className="btn btn-sm btn-primary"
                style={{ flexShrink: 0, background: accent, borderColor: accent, color: '#0A0A0A', boxShadow: '2px 2px 0 #0A0A0A' }}
                onClick={() => setApplyOpen(true)}
              >
                Apply →
              </button>
            )
          ) : (
            <span className="mono xs muted" style={{ fontSize: 11 }}>
              {isClosed ? 'role closed' : 'applications paused'}
            </span>
          )}
        </div>
      </div>

      {applyOpen && member && (
        <ApplyModal
          op={op}
          member={member}
          onClose={() => setApplyOpen(false)}
          onApplied={() => { setHasApplied(true); setApplyOpen(false) }}
        />
      )}
    </>
  )
}

// ── Manage Popover ────────────────────────────────────────────────────────────
function ManagePopover({ op, onAction, onEdit, onViewApplications, onClose }: {
  op: JobOpening
  onAction: (action: () => Promise<void>) => void
  onEdit: () => void
  onViewApplications: () => void
  onClose: () => void
}) {
  const can = (to: OpeningStatus) => ALLOWED_TRANSITIONS[op.status]?.includes(to)
  const do_ = (fn: () => void) => { fn(); onClose() }

  return (
    // Centered sheet (was previously a fixed bottom-right floater that
    // jumped to the corner regardless of which card's ⋯ you tapped — felt
    // disconnected from the trigger). Backdrop click closes; the title row
    // includes the opening name so context is preserved.
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--card)', borderRadius: 14, border: '2px solid var(--ink)',
          padding: 8, minWidth: 240, maxWidth: 360, width: '100%',
          boxShadow: '4px 4px 0 var(--ink)',
        }}
      >
        <div className="mono xs muted" style={{ padding: '4px 12px 8px', fontWeight: 700, borderBottom: '1px solid var(--line)', marginBottom: 4 }}>
          {op.title.slice(0, 30)}{op.title.length > 30 ? '…' : ''}
          <span style={{ marginLeft: 8, fontSize: 10, padding: '2px 8px', borderRadius: 999, background: STATUS_COLORS[op.status] + '22', color: STATUS_COLORS[op.status] }}>
            {STATUS_LABELS[op.status]}
          </span>
        </div>
        <button className="btn btn-sm btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => do_(onViewApplications)}>⊞ applications</button>
        <button className="btn btn-sm btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => do_(onEdit)}>✎ edit</button>
        {can('open')   && <button className="btn btn-sm btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', color: STATUS_COLORS.open }}   onClick={() => do_(() => onAction(async () => { await jobOpenings.resume(op.id) }))}>▶ resume</button>}
        {can('paused') && <button className="btn btn-sm btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', color: STATUS_COLORS.paused }} onClick={() => do_(() => onAction(async () => { await jobOpenings.pause(op.id) }))}>⏸ pause</button>}
        {can('closed') && <button className="btn btn-sm btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', color: STATUS_COLORS.closed }} onClick={() => do_(() => onAction(async () => { await jobOpenings.close(op.id) }))}>✓ close role <span style={{ fontSize: 9, opacity: 0.6 }}>(terminal)</span></button>}
        <div style={{ height: 1, background: 'var(--line)', margin: '4px 0' }} />
        {can('deleted') && <button className="btn btn-sm btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', color: '#e05c5c' }} onClick={() => do_(() => onAction(async () => { await jobOpenings.delete_(op.id) }))}>✕ delete permanently</button>}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function OpportunitiesPage() {
  const { member, isAuthenticated } = useAuth()
  const { success, error: toastError } = useToast()
  const isLeader = hasLeaderAccess(member?.role)
  const [opsList, setOpsList] = useState<JobOpening[]>([])
  const [catFilter, setCatFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<OpeningStatus | 'all'>('all')
  const [dashboardView, setDashboardView] = useState<'public' | 'manage'>('public')
  const [editingOp, setEditingOp] = useState<JobOpening | null | 'new'>(null)
  const [managingOp, setManagingOp] = useState<JobOpening | null>(null)
  const [viewingApplicationsOp, setViewingApplicationsOp] = useState<JobOpening | null>(null)

  const reload = () => {
    const fetch = isLeader ? jobOpenings.getAll() : jobOpenings.getOpen()
    fetch.then(setOpsList).catch(() => setOpsList([]))
  }

  useEffect(() => { reload() }, [isLeader])

  const publicDisplayed = opsList.filter(o => o.status === 'open').filter(o => catFilter === 'all' || o.category === catFilter)
  const manageDisplayed = opsList.filter(o => statusFilter === 'all' || o.status === statusFilter).filter(o => catFilter === 'all' || o.category === catFilter)
  const displayed = dashboardView === 'manage' ? manageDisplayed : publicDisplayed
  const openCount = opsList.filter(o => o.status === 'open').length

  return (
    <div className="route-enter">
      {/* Hero */}
      <section style={{ padding: 'clamp(32px, 6vw, 80px) 20px clamp(24px, 4vw, 48px)', borderBottom: '1px solid var(--line)' }}>
        <div className="container">
          <span className="sticker sticker-mint wobble" style={{ display: 'inline-flex', marginBottom: 14 }}>
            ★ {openCount} OPEN ROLE{openCount !== 1 ? 'S' : ''}
          </span>
          <h1 className="h-display" style={{ fontSize: 'clamp(40px, 8vw, 88px)', margin: '0 0 14px', lineHeight: 0.92, textWrap: 'balance' } as React.CSSProperties}>
            work on <span style={{ fontStyle: 'italic', fontFamily: 'var(--serif)', color: 'var(--mint)', fontWeight: 400 }}>something real</span>.
          </h1>
          <p style={{ fontSize: 15, color: 'var(--ink-2)', maxWidth: 500, marginBottom: 0 }}>
            AquaTerra runs on student work. Every team here is looking for people who want to build, not observe.
          </p>
          {isLeader && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
              <button className="btn btn-primary" onClick={() => setEditingOp('new')}><I.plus /> Post Opening</button>
              <button
                className={'btn btn-sm ' + (dashboardView === 'manage' ? 'btn-primary' : 'btn-ghost')}
                onClick={() => setDashboardView(v => v === 'manage' ? 'public' : 'manage')}
              >
                {dashboardView === 'manage' ? '← public view' : `⚙ manage (${opsList.length})`}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Filters */}
      <div className="container" style={{ paddingTop: 18, paddingBottom: 0 }}>
        {isLeader && dashboardView === 'manage' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10, alignItems: 'center' }}>
            <span className="mono xs muted" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</span>
            {(['all', 'open', 'paused', 'closed'] as const).map(s => (
              <button
                key={s}
                className={'chip ' + (statusFilter === s ? 'chip-active' : '')}
                onClick={() => setStatusFilter(s)}
                style={statusFilter === s && s !== 'all' ? { background: STATUS_COLORS[s as OpeningStatus], color: '#0A0A0A', borderColor: STATUS_COLORS[s as OpeningStatus] } : {}}
              >
                {s === 'all' ? `all (${opsList.length})` : `${s} (${opsList.filter(o => o.status === s).length})`}
              </button>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none', overscrollBehaviorX: 'none', marginBottom: 20 }}>
          <button className={'chip ' + (catFilter === 'all' ? 'chip-active' : '')} onClick={() => setCatFilter('all')} style={{ flexShrink: 0 }}>all</button>
          {Object.keys(CAT_COLORS).map(c => (
            <button key={c} className={'chip ' + (catFilter === c ? 'chip-active' : '')} onClick={() => setCatFilter(c)} style={{ flexShrink: 0 }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Openings list */}
      <div className="container" style={{ paddingBottom: 80 }}>
        {displayed.length === 0 ? (
          <div className="card" style={{ padding: 'clamp(32px, 5vw, 60px) 24px', textAlign: 'center' }}>
            <span className="sticker sticker-lemon" style={{ display: 'inline-block', marginBottom: 16 }}>★ all quiet</span>
            <div className="h-display" style={{ fontSize: 'clamp(24px, 5vw, 32px)' }}>no openings right now.</div>
            <p className="muted" style={{ marginTop: 8 }}>
              {isLeader ? 'Post the first opening to start recruiting.' : 'Check back soon — new roles get posted regularly.'}
            </p>
            {!isLeader && (
              /* No specific role open — the two other ways in. */
              <div style={{ marginTop: 16, display: 'flex', gap: 18, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/recruitment" className="aq-thread-link">apply to AquaTerra →</Link>
                <Link to="/volunteer" className="aq-thread-link">read the volunteer handbook →</Link>
              </div>
            )}
            {isLeader && (
              <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => setEditingOp('new')}>
                <I.plus /> Post first opening
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {displayed.map(op => (
              <OpeningCard
                key={op.id}
                op={op}
                isLeader={isLeader}
                onManage={setManagingOp}
                member={member}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        )}

        {/* General application CTA */}
        <div style={{ marginTop: 48, background: '#0A0A0A', borderRadius: 16, padding: 'clamp(20px, 4vw, 32px)', border: '2px solid var(--mint)' }}>
          <div className="mono xs upper" style={{ color: 'var(--mint)', fontWeight: 700, marginBottom: 12 }}>★ GENERAL APPLICATION</div>
          <div className="h-display" style={{ fontSize: 'clamp(22px, 4vw, 40px)', color: '#fff', marginBottom: 10, textWrap: 'balance' } as React.CSSProperties}>
            don&apos;t see your role? apply anyway.
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
            AquaTerra runs rolling recruitment. Send an application even if no specific role is open — we review everyone.
          </p>
          <Link to="/recruitment" className="btn btn-primary" style={{ display: 'inline-flex' }}>
            Apply to AquaTerra →
          </Link>
        </div>
      </div>

      {/* Modals */}
      {editingOp !== null && (
        <OpeningFormModal
          opening={editingOp === 'new' ? null : editingOp}
          onClose={() => setEditingOp(null)}
          onSaved={reload}
          createdByName={member?.full_name || 'HoD'}
          createdByRole={member?.role || 'director'}
        />
      )}

      {managingOp && (
        <ManagePopover
          op={managingOp}
          onAction={async (fn) => {
            try { await fn(); success('Opening updated ✓') } catch { toastError('Action failed') }
            reload()
          }}
          onEdit={() => { setEditingOp(managingOp); setManagingOp(null) }}
          onViewApplications={() => { setViewingApplicationsOp(managingOp); setManagingOp(null) }}
          onClose={() => setManagingOp(null)}
        />
      )}

      {viewingApplicationsOp && (
        <ApplicationsModal
          op={viewingApplicationsOp}
          onClose={() => setViewingApplicationsOp(null)}
        />
      )}
    </div>
  )
}
