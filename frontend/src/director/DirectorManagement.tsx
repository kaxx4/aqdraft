import { useState, useEffect, useCallback } from 'react'
import directorService, { Director, EligibleMember } from '../services/directorService'
import { useDebounce } from '../hooks/useDebounce'
import { AdminLayout, AdminTabHeader } from './adminKit'
import { useConfirm } from '../components/Confirm'
import { useToast } from '../components/Toast'

const initials = (name: string) => (name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2)

const DirectorManagement = () => {
  const confirm = useConfirm()
  const toast = useToast()
  const [directors, setDirectors] = useState<Director[]>([])
  const [eligibleMembers, setEligibleMembers] = useState<EligibleMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingEligible, setIsLoadingEligible] = useState(false)
  const [search, setSearch] = useState('')
  const [showEligible, setShowEligible] = useState(false)
  const [isPromoting, setIsPromoting] = useState(false)
  const [isDemoting, setIsDemoting] = useState(false)
  const [isChangingRole, setIsChangingRole] = useState(false)

  const debouncedSearch = useDebounce(search, 300)

  const fetchDirectors = async () => {
    try {
      const result = await directorService.getAllDirectors()
      if (result.success) setDirectors(result.data.directors)
    } catch (err: any) {
      const msg = err?.message || err?.error_description || JSON.stringify(err)
      toast.error(`Could not load HoDs — ${msg}`)
      console.error('[DirectorManagement] error:', err)
    }
    finally { setIsLoading(false) }
  }

  const fetchEligibleMembers = useCallback(async (searchQuery: string) => {
    setIsLoadingEligible(true)
    try {
      const result = await directorService.getEligibleMembers({ search: searchQuery, limit: 50 })
      if (result.success) setEligibleMembers(result.data)
    } catch { console.error('Failed to load eligible members') }
    finally { setIsLoadingEligible(false) }
  }, [])

  useEffect(() => { fetchDirectors() }, [])
  useEffect(() => { if (showEligible) fetchEligibleMembers(debouncedSearch) }, [debouncedSearch, showEligible, fetchEligibleMembers])

  const handlePromote = async (memberId: number, memberName: string) => {
    if (!(await confirm({ title: 'Promote to HoD?', body: `Promote ${memberName} to HoD? They'll gain moderation access.`, confirmLabel: 'Promote' }))) return
    setIsPromoting(true)
    try {
      const result = await directorService.promoteToDirector(memberId)
      if (result.success) {
        // Assign at least one default category (operations) so HoD can review posts
        try {
          await directorService.assignCategory(memberId, 'operations')
        } catch (catErr: any) {
          console.warn('Could not assign default category:', catErr)
          // Don't fail the whole promotion if category assignment fails
        }
        toast.success(`${memberName} has been promoted to HoD`)
        await fetchDirectors(); await fetchEligibleMembers(debouncedSearch)
      }
    } catch (err: any) { toast.error(err?.message ?? err.response?.data?.message ?? 'Failed to promote member') }
    finally { setIsPromoting(false) }
  }

  const handleDemote = async (memberId: number, memberName: string, isSuperAdmin: boolean) => {
    if (isSuperAdmin) { toast.error('Cannot demote a super admin'); return }
    if (!(await confirm({ title: 'Remove HoD?', body: `Remove ${memberName} as director? This removes all their category assignments.`, confirmLabel: 'Remove', danger: true }))) return
    setIsDemoting(true)
    try {
      const result = await directorService.demoteToMember(memberId)
      if (result.success) {
        toast.success(`${memberName} has been demoted to member`)
        await fetchDirectors()
        if (showEligible) await fetchEligibleMembers(debouncedSearch)
      }
    } catch (err: any) { toast.error(err?.message ?? err.response?.data?.message ?? 'Failed to demote director') }
    finally { setIsDemoting(false) }
  }

  const handleChangeRole = async (memberId: number, memberName: string, newRole: 'member' | 'hod' | 'director' | 'super_admin') => {
    setIsChangingRole(true)
    try {
      const result = await directorService.changeRole(memberId, newRole)
      if (result.success) {
        toast.success(`${memberName}'s role changed to ${newRole === 'hod' ? 'HoD' : 'Director'}`)
        await fetchDirectors()
      }
    } catch (err: any) { toast.error(err.message || 'Failed to change role') }
    finally { setIsChangingRole(false) }
  }

  if (isLoading) {
    return (
      <div className="" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 320 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em' }}>LOADING...</div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div style={{ paddingTop: 'clamp(8px,2vw,16px)', paddingBottom: 64, maxWidth: 860 }}>
        <AdminTabHeader
          label="People"
          title="Manage HoDs"
          subtitle="Promote members or remove HoD access."
          actions={
            <button onClick={() => setShowEligible(!showEligible)} className="btn btn-sm btn-primary">
              {showEligible ? 'Cancel' : '+ Add HoD'}
            </button>
          }
        />


        {/* Add Director panel */}
        {showEligible && (
          <div className="card" style={{ marginBottom: 20, padding: 0 }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)' }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Select Member to Promote</div>
            </div>
            <div style={{ padding: '14px 18px' }}>
              <div style={{ position: 'relative', marginBottom: 14 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                  style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }}>
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
                  className="input" style={{ paddingLeft: 38 }} />
              </div>
              {isLoadingEligible ? (
                <div style={{ padding: 24, textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)' }}>LOADING...</div>
              ) : (
                <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                  {eligibleMembers.map(member => (
                    <div key={member.memberId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar" style={{ width: 30, height: 30, fontSize: 10, background: 'var(--accent)', flexShrink: 0, overflow: 'hidden' }}>
                          {member.avatarUrl ? <img src={member.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" /> : initials(member.fullName)}
                        </div>
                        <div>
                          <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 12, color: 'var(--ink)' }}>{member.fullName}</div>
                          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)' }}>{member.email}</div>
                        </div>
                      </div>
                      <button onClick={() => handlePromote(member.memberId, member.fullName)} disabled={isPromoting}
                        className="btn btn-sm btn-primary" style={{ fontSize: 11 }}>
                        {isPromoting ? '...' : 'Promote'}
                      </button>
                    </div>
                  ))}
                  {eligibleMembers.length === 0 && (
                    <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-3)', textAlign: 'center', padding: '20px 0' }}>
                      {search ? 'No members found' : 'No eligible members'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Current Directors */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
              Current HoDs ({directors.length})
            </div>
          </div>
          {directors.length === 0 ? (
            <div style={{ padding: '32px 18px', textAlign: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-3)' }}>No HoDs found.</div>
          ) : directors.map(director => (
            <div key={director.memberId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 18px', borderBottom: '1px solid var(--line)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="avatar" style={{ width: 36, height: 36, fontSize: 12, background: 'var(--accent)', flexShrink: 0, overflow: 'hidden' }}>
                  {director.avatarUrl ? <img src={director.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" /> : initials(director.fullName)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>{director.fullName}</span>
                    {director.isSuperAdmin && (
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: '#e05c5c', letterSpacing: '0.06em', textTransform: 'uppercase', border: '1px solid rgba(224,92,92,0.4)', borderRadius: '999px', padding: '1px 5px' }}>Super Admin</span>
                    )}
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)' }}>{director.email}</div>
                  {director.categories.length > 0 && (
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-3)', marginTop: 2 }}>
                      {director.categories.join(', ')}
                    </div>
                  )}
                </div>
              </div>
              {!director.isSuperAdmin && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <select
                    value={director.role}
                    onChange={e => handleChangeRole(director.memberId, director.fullName, e.target.value as 'member' | 'hod' | 'director' | 'super_admin')}
                    disabled={isChangingRole}
                    style={{
                      fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
                      padding: '5px 8px', borderRadius: 'var(--r)',
                      border: '1.5px solid var(--line-2)', background: 'var(--bg-2)',
                      color: 'var(--ink)', cursor: 'pointer', outline: 'none',
                    }}
                  >
                    <option value="hod">HoD</option>
                    <option value="director">Director</option>
                  </select>
                  <button onClick={() => handleDemote(director.memberId, director.fullName, director.isSuperAdmin || false)} disabled={isDemoting}
                    style={{ background: 'rgba(224,92,92,0.1)', color: '#e05c5c', border: '1px solid rgba(224,92,92,0.2)', borderRadius: 'var(--r)', padding: '6px 14px', fontFamily: 'var(--display)', fontWeight: 700, fontSize: 11, cursor: 'pointer', opacity: isDemoting ? 0.5 : 1, flexShrink: 0 }}>
                    {isDemoting ? '...' : '− Remove'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}

export default DirectorManagement
