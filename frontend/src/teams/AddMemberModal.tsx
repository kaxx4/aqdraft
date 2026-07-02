import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import teamService from '../services/teamService'
import { useDebounce } from '../hooks/useDebounce'
import feedService from '../services/feedService'
import { useToast } from '../components/Toast'

interface SearchedMember {
  memberId: number
  uuid: string
  fullName: string
  avatarUrl?: string
  email: string
  role: string | null
}

interface SelectedMember extends SearchedMember {
  teamRole: 'member' | 'lead'
}

interface AddMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  teamUuid: string
  existingMemberIds: number[]
}

function getInitials(name: string) {
  return (name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = ['#00E5A0','#FF6BD6','#FFC700','#7E5BFF','#FF7A1A','#3DA9FC']
function hashColor(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

const AddMemberModal = ({ isOpen, onClose, onSuccess, teamUuid, existingMemberIds }: AddMemberModalProps) => {
  const { success: toastSuccess, error: toastError } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchedMember[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState<SelectedMember[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 300)
  const existingIdsRef = useRef(existingMemberIds)
  const selectedIdsRef = useRef<number[]>([])
  existingIdsRef.current = existingMemberIds
  selectedIdsRef.current = selectedMembers.map(m => m.memberId)

  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) setTimeout(() => searchInputRef.current?.focus(), 80)
    else { setSearchQuery(''); setSearchResults([]); setSelectedMembers([]) }
  }, [isOpen])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (debouncedSearch.length < 2) { setSearchResults([]); return }
      setIsSearching(true)
      try {
        const response = await feedService.searchMembers(debouncedSearch)
        if (cancelled) return
        if (response.success) {
          setSearchResults(
            response.data.members.filter(
              (m: SearchedMember) =>
                !existingIdsRef.current.includes(m.memberId) &&
                !selectedIdsRef.current.includes(m.memberId)
            )
          )
        }
      } catch { } finally { if (!cancelled) setIsSearching(false) }
    }
    run()
    return () => { cancelled = true }
  }, [debouncedSearch])

  const handleAddToSelection = (member: SearchedMember) => {
    setSelectedMembers(prev => [...prev, { ...member, teamRole: 'member' }])
    setSearchQuery('')
    setSearchResults([])
    searchInputRef.current?.focus()
  }

  const handleRemoveFromSelection = (memberId: number) => {
    setSelectedMembers(prev => prev.filter(m => m.memberId !== memberId))
  }

  const toggleRole = (memberId: number) => {
    setSelectedMembers(prev =>
      prev.map(m =>
        m.memberId === memberId
          ? { ...m, teamRole: m.teamRole === 'member' ? 'lead' : 'member' }
          : m
      )
    )
  }

  const handleSave = async () => {
    if (selectedMembers.length === 0) { toastError('Select at least one member first'); return }
    setIsSubmitting(true)
    try {
      const result = await teamService.addMembersBulk(
        teamUuid,
        selectedMembers.map(m => ({ memberId: m.memberId, role: m.teamRole }))
      )
      if (result.success) {
        const { added, failed } = result.data
        if (failed?.length > 0 && added?.length === 0) {
          toastError(`Failed to add ${failed.length} member${failed.length !== 1 ? 's' : ''}`)
        } else {
          toastSuccess(
            `${added?.length || selectedMembers.length} member${(added?.length || selectedMembers.length) !== 1 ? 's' : ''} added ✓`,
            failed?.length > 0 ? `${failed.length} could not be added` : undefined
          )
          onSuccess()
          onClose()
        }
      } else {
        toastError(result.message || 'Failed to add members')
      }
    } catch {
      toastError('Something went wrong. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const labelSt: React.CSSProperties = {
    fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.06em',
    color: 'var(--ink-3)', display: 'block', marginBottom: 6,
  }
  const inputSt: React.CSSProperties = {
    width: '100%', padding: '10px 12px',
    background: 'var(--bg-2)', border: '1.5px solid var(--line-2)',
    borderRadius: 12, color: 'var(--ink)',
    fontFamily: 'var(--sans)', fontSize: 16, outline: 'none',
  }

  return (
    <AnimatePresence>
      {isOpen && (
    <motion.div
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 16px 16px' }}
    >
      <motion.div
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
        style={{ width: '100%', maxWidth: 500, background: 'var(--card)', borderRadius: 20, border: '2px solid var(--ink)', maxHeight: '90dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 20 }}>add members</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', fontSize: 18, lineHeight: 1, padding: '8px', margin: '-8px', borderRadius: 8 }}>✕</button>
        </div>

        {/* Scrollable content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 24px' }}>
          {/* Search */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelSt}>Search members</label>
            <div style={{ position: 'relative' }}>
              <input
                ref={searchInputRef}
                style={inputSt}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Name or email…"
                autoComplete="off"
              />
              {isSearching && (
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)' }}>...</span>
              )}
            </div>
          </div>

          {/* Search results dropdown */}
          {searchResults.length > 0 && (
            <div style={{ border: '1.5px solid var(--line-2)', borderRadius: 12, background: 'var(--bg-3)', marginBottom: 16, overflow: 'hidden' }}>
              {searchResults.map(member => (
                <button
                  key={member.memberId}
                  onClick={() => handleAddToSelection(member)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'transparent', border: 'none', borderBottom: '1px solid var(--line)', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div className="avatar" style={{ width: 34, height: 34, fontSize: 12, flexShrink: 0, background: hashColor(member.fullName), overflow: 'hidden' }}>
                    {member.avatarUrl
                      ? <img src={member.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                      : getInitials(member.fullName)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.fullName}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.email}</div>
                  </div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--mint)', fontWeight: 700 }}>+ add</span>
                </button>
              ))}
            </div>
          )}

          {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
            <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-3)', marginBottom: 12 }}>No members found for "{searchQuery}"</p>
          )}

          {/* Selected members */}
          {selectedMembers.length > 0 && (
            <div>
              <label style={{ ...labelSt, marginBottom: 10 }}>
                Selected ({selectedMembers.length}) — tap role to toggle
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedMembers.map(member => (
                  <div
                    key={member.memberId}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(0,229,160,0.06)', border: '1.5px solid rgba(0,229,160,0.2)', borderRadius: 12 }}
                  >
                    <div className="avatar" style={{ width: 34, height: 34, fontSize: 12, flexShrink: 0, background: hashColor(member.fullName), overflow: 'hidden' }}>
                      {member.avatarUrl
                        ? <img src={member.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                        : getInitials(member.fullName)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.fullName}</div>
                    </div>
                    {/* Role toggle */}
                    <button
                      type="button"
                      onClick={() => toggleRole(member.memberId)}
                      style={{
                        fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
                        padding: '4px 10px', borderRadius: 999, cursor: 'pointer', border: '1.5px solid',
                        background: member.teamRole === 'lead' ? 'rgba(61,169,252,0.12)' : 'var(--bg-2)',
                        borderColor: member.teamRole === 'lead' ? '#3DA9FC' : 'var(--line-2)',
                        color: member.teamRole === 'lead' ? '#3DA9FC' : 'var(--ink-3)',
                        transition: 'background 0.12s, border-color 0.12s, color 0.12s',
                        flexShrink: 0,
                      }}
                    >
                      {member.teamRole === 'lead' ? 'LEAD' : 'MEMBER'}
                    </button>
                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => handleRemoveFromSelection(member.memberId)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', fontSize: 16, padding: '4px', borderRadius: 6, lineHeight: 1, flexShrink: 0, transition: 'color 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#e05c5c')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-3)')}
                      aria-label="Remove"
                    >✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedMembers.length === 0 && searchQuery.length < 2 && (
            <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>
              Search by name or email to find members to add.
            </p>
          )}
        </div>

        {/* Sticky footer with Save button */}
        <div style={{ padding: '14px 24px', paddingBottom: 'max(14px, env(safe-area-inset-bottom))', borderTop: '2px solid var(--ink)', display: 'flex', gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} className="btn" style={{ flex: 1, justifyContent: 'center' }} disabled={isSubmitting}>
            cancel
          </button>
          <button
            onClick={handleSave}
            disabled={selectedMembers.length === 0 || isSubmitting}
            className="btn btn-primary"
            style={{ flex: 2, justifyContent: 'center', opacity: selectedMembers.length === 0 ? 0.5 : 1 }}
          >
            {isSubmitting ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 12, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                saving…
              </span>
            ) : selectedMembers.length > 0
              ? `save ${selectedMembers.length} member${selectedMembers.length !== 1 ? 's' : ''} →`
              : 'save members →'
            }
          </button>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AddMemberModal
