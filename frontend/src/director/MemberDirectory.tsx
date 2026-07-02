import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import directorService, { DirectoryMember } from '../services/directorService'
import { useDebounce } from '../hooks/useDebounce'
import { useAuth } from '../auth/AuthContext'
import { I } from '../components/v6Shared'
import { AdminLayout, AdminTabHeader } from './adminKit'
import { useConfirm } from '../components/Confirm'
import { useToast } from '../components/Toast'

const getInitials = (name: string) => (name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
const formatDate = (dateStr: string) => {
  if (!dateStr) return 'unknown'
  try { return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) }
  catch { return '' }
}
const AVATAR_COLORS = ['#00E5A0','#FF6BD6','#FFC700','#7E5BFF','#FF7A1A','#3DA9FC']
const hashColor = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h); return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length] }

type AQRole = 'member' | 'hod' | 'director' | 'super_admin'

const ROLE_LABELS: Record<AQRole, string> = {
  member: 'Member',
  hod: 'HoD',
  director: 'Director',
  super_admin: 'Super Admin',
}

type RoleFilter = 'all' | AQRole
type SortBy = 'role' | 'newest' | 'oldest' | 'name'

const ROLE_FILTERS: { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'Everyone' },
  { value: 'super_admin', label: 'Super Admins' },
  { value: 'director', label: 'Directors' },
  { value: 'hod', label: 'HoDs' },
  { value: 'member', label: 'Members' },
]

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'role', label: 'Role (leadership first)' },
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name', label: 'Name (A–Z)' },
]

const MemberDirectory = () => {
  const { member: currentMember } = useAuth()
  const confirm = useConfirm()
  const toast = useToast()
  const isSuperAdmin = currentMember?.role === 'super_admin'

  const [members, setMembers] = useState<DirectoryMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [sortBy, setSortBy] = useState<SortBy>('role')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [totalMembers, setTotalMembers] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<{ memberId: number; fullName: string; email: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [roleChanging, setRoleChanging] = useState<number | null>(null)

  const debouncedSearch = useDebounce(search, 300)

  const fetchMembers = useCallback(async (pageNum: number, searchQuery: string, role: RoleFilter, sort: SortBy, append = false) => {
    if (append) setIsLoadingMore(true); else setIsLoading(true)
    try {
      const result = await directorService.getMemberDirectory({ page: pageNum, limit: 20, search: searchQuery, role, sort })
      if (result.success) {
        if (append) setMembers(prev => [...prev, ...result.data]); else setMembers(result.data)
        setHasMore(result.pagination.hasNextPage)
        setTotalMembers(result.pagination.totalItems)
      }
    } catch (e: any) {
      console.error('Failed to load members', e)
      toast.error('Could not load members', e?.message ?? String(e))
    }
    finally { setIsLoading(false); setIsLoadingMore(false) }
  }, [])

  // Any change to search / role filter / sort resets to page 1 and refetches.
  useEffect(() => { setPage(1); fetchMembers(1, debouncedSearch, roleFilter, sortBy) }, [debouncedSearch, roleFilter, sortBy, fetchMembers])

  const handleDelete = async () => {
    if (!deleteTarget) return
    // Guard: never let a user delete themselves from here. Use settings instead.
    if (deleteTarget.memberId === currentMember?.member_id) {
      toast.error("You can't delete your own account from the directory."); return
    }
    // Guard: only super_admins can delete other super_admins.
    const target = members.find(m => m.memberId === deleteTarget.memberId)
    if (target?.role === 'super_admin' && !isSuperAdmin) {
      toast.error('Only a super admin can delete another super admin.'); return
    }
    setIsDeleting(true)
    try {
      const result = await directorService.deleteMember(deleteTarget.memberId)
      toast.success(result.message || `${deleteTarget.fullName} deleted.`)
      setDeleteTarget(null); setPage(1); fetchMembers(1, debouncedSearch, roleFilter, sortBy)
    } catch (error: any) {
      toast.error(error?.message ?? error.response?.data?.message ?? 'Failed to delete member')
    }
    finally { setIsDeleting(false) }
  }

  const handleRoleChange = async (memberId: number, fullName: string, newRole: AQRole) => {
    // Protect: can't change your own role
    if (memberId === currentMember?.member_id) { toast.error("You can't change your own role."); return }
    // Protect: only super_admins can demote another super_admin
    const target = members.find(m => m.memberId === memberId)
    if (target?.role === 'super_admin' && !isSuperAdmin) {
      toast.error("Only a super admin can change another super admin's role.")
      return
    }
    if (newRole === 'super_admin' && !isSuperAdmin) {
      toast.error('Only a super admin can promote someone to super admin.')
      return
    }
    // Confirm — a mis-click on this <select> silently mutated a role before.
    const ok = await confirm({
      title: 'Change role?',
      body: `Set ${fullName}'s role to ${ROLE_LABELS[newRole]}? Their access changes immediately.`,
      confirmLabel: 'Change role',
      danger: newRole === 'super_admin',
    })
    if (!ok) return
    setRoleChanging(memberId)
    try {
      await directorService.changeRole(memberId, newRole)
      toast.success(`${fullName} → ${ROLE_LABELS[newRole]}`)
      // Optimistically update the local list so UI refreshes instantly
      setMembers(prev => prev.map(m => m.memberId === memberId ? { ...m, role: newRole } : m))
    } catch (err: any) { toast.error(err.message || 'Failed to update role') }
    finally { setRoleChanging(null) }
  }

  return (
    <AdminLayout>
      <div className="route-enter" style={{ paddingTop: 'clamp(8px,2vw,16px)', paddingBottom: 80, maxWidth: 940 }}>
        <AdminTabHeader
          label="Members"
          title="Member directory"
          subtitle={`${totalMembers.toLocaleString()} ${roleFilter === 'all' ? 'active members' : ROLE_FILTERS.find(f => f.value === roleFilter)!.label.toLowerCase()}`}
        />

      {/* Search */}
      <div className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <label htmlFor="dir-search" className="sr-only">Search members</label>
        <I.search />
        <input
          id="dir-search"
          className="input"
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="search by name or email..."
          style={{ border: 'none', padding: 0, fontSize: 16, background: 'transparent', boxShadow: 'none', flex: 1 }}
          autoComplete="off"
        />
        {search && <button className="btn btn-sm" onClick={() => setSearch('')} aria-label="Clear search"><I.close /></button>}
      </div>

      {/* Filter + sort controls */}
      <div className="row gap-3" style={{ marginBottom: 20, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div className="row gap-2" role="group" aria-label="Filter by role" style={{ flexWrap: 'wrap' }}>
          {ROLE_FILTERS.map(f => {
            const active = roleFilter === f.value
            return (
              <button
                key={f.value}
                onClick={() => setRoleFilter(f.value)}
                aria-pressed={active}
                className="mono xs"
                style={{
                  padding: '6px 12px', borderRadius: 999, cursor: 'pointer',
                  fontWeight: 700, letterSpacing: '0.02em',
                  border: active ? '1.5px solid var(--sky)' : '1.5px solid var(--line-2)',
                  background: active ? 'var(--sky)' : 'var(--bg-2)',
                  color: active ? '#0A0A0A' : 'var(--ink-2)',
                  transition: 'background 0.15s ease, color 0.15s ease, border-color 0.15s ease',
                }}
              >
                {f.label}
              </button>
            )
          })}
        </div>
        <label className="row gap-2 mono xs muted" style={{ alignItems: 'center', flexShrink: 0 }}>
          <span className="upper" style={{ letterSpacing: '0.04em' }}>sort</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortBy)}
            style={{
              fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
              padding: '6px 10px', borderRadius: 'var(--r)',
              border: '1.5px solid var(--line-2)', background: 'var(--bg-2)',
              color: 'var(--ink)', cursor: 'pointer', outline: 'none',
            }}
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
      </div>

      {isLoading ? (
        <div style={{ padding: 48, textAlign: 'center' }}><div className="mono xs upper muted">loading...</div></div>
      ) : members.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <div className="h-display" style={{ fontSize: 28 }}>{search ? 'no results.' : 'no members yet.'}</div>
          <p className="muted" style={{ marginTop: 8 }}>{search ? 'try different keywords.' : 'approved members will appear here.'}</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 12, marginBottom: 20 }}>
            {members.map(member => (
              <div key={member.memberId} style={{ position: 'relative' }}>
                <Link to={`/profile/${member.uuid}`} style={{ textDecoration: 'none' }}>
                  <div className="card card-hover" style={{ padding: 16 }}>
                    <div className="row gap-3" style={{ alignItems: 'flex-start' }}>
                      <div className="avatar" style={{ background: hashColor(member.fullName), overflow: 'hidden', flexShrink: 0 }}>
                        {member.avatarUrl
                          ? <img src={member.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                          : getInitials(member.fullName)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="row gap-2" style={{ marginBottom: 3, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.fullName}</span>
                          {member.role === 'super_admin' && <span className="role role-director" style={{ fontSize: 9, background: '#e05c5c', color: '#fff' }}>Super Admin</span>}
                          {member.role === 'hod' && <span className="role role-director" style={{ fontSize: 9 }}>HoD</span>}
                          {member.role === 'director' && <span className="role role-director" style={{ fontSize: 9, background: 'var(--sky)', color: '#0A0A0A' }}>Director</span>}
                        </div>
                        <div className="mono xs muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.email}</div>
                        {member.classGrade && <div className="mono xs muted">{member.classGrade}</div>}
                        <div className="mono xs muted" style={{ marginTop: 3 }}>joined {formatDate(member.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                </Link>
                {isSuperAdmin && (
                  <div
                    onClick={e => e.preventDefault()}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line)' }}
                  >
                    {(() => {
                      const isSelf = member.memberId === currentMember?.member_id
                      const isProtectedAdmin = member.role === 'super_admin' && !isSuperAdmin
                      const disabled = roleChanging === member.memberId || isSelf || isProtectedAdmin
                      return (
                        <select
                          value={member.role || 'member'}
                          disabled={disabled}
                          onChange={e => handleRoleChange(member.memberId, member.fullName, e.target.value as AQRole)}
                          title={isSelf ? "You can't change your own role" : isProtectedAdmin ? 'Only a super admin can change this role' : 'Change role'}
                          style={{
                            flex: 1, fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
                            padding: '5px 8px', borderRadius: 'var(--r)',
                            border: '1.5px solid var(--line-2)', background: 'var(--bg-2)',
                            color: 'var(--ink)', cursor: disabled ? 'not-allowed' : 'pointer',
                            outline: 'none', opacity: disabled ? 0.5 : 1,
                          }}
                        >
                          <option value="member">Member</option>
                          <option value="hod">HoD</option>
                          <option value="director">Director</option>
                          {/* Only show super_admin option to super_admins; otherwise it just appears for display purposes */}
                          {(isSuperAdmin || member.role === 'super_admin') && (
                            <option value="super_admin">Super Admin</option>
                          )}
                        </select>
                      )
                    })()}
                    {(() => {
                      const isSelf = member.memberId === currentMember?.member_id
                      const isProtectedAdmin = member.role === 'super_admin' && !isSuperAdmin
                      const disabled = isSelf || isProtectedAdmin
                      return (
                        <button
                          onClick={() => !disabled && setDeleteTarget({ memberId: member.memberId, fullName: member.fullName, email: member.email })}
                          disabled={disabled}
                          style={{
                            background: 'none', border: 'none',
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            color: 'var(--ink-3)', fontSize: 14, padding: '4px 6px', borderRadius: 6, flexShrink: 0,
                            opacity: disabled ? 0.3 : 1,
                          }}
                          title={isSelf ? "You can't delete yourself" : isProtectedAdmin ? 'Only a super admin can delete this account' : 'Delete account'}
                          aria-label={`Delete ${member.fullName}'s account`}
                        >
                          🗑
                        </button>
                      )
                    })()}
                  </div>
                )}
              </div>
            ))}
          </div>
          {hasMore && (
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => { const p = page + 1; setPage(p); fetchMembers(p, debouncedSearch, roleFilter, sortBy, true) }} disabled={isLoadingMore} className="btn btn-sm">
                {isLoadingMore ? 'loading...' : 'load more →'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="modal-back" onClick={() => !isDeleting && setDeleteTarget(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="sticker sticker-pink">⚠ DELETE ACCOUNT</span>
              <button className="btn btn-sm" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 10 }}>delete <strong>{deleteTarget.fullName}</strong>'s account ({deleteTarget.email})?</p>
              <p className="mono xs" style={{ color: '#FF4D2E', lineHeight: 1.6, marginBottom: 16 }}>
                this permanently deletes their account, posts, comments, likes, and session data. this cannot be undone.
              </p>
              <div className="row gap-2" style={{ justifyContent: 'flex-end' }}>
                <button onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="btn btn-sm">cancel</button>
                <button onClick={handleDelete} disabled={isDeleting} className="btn btn-sm" style={{ background: '#FF4D2E', color: '#fff', border: 'none' }}>
                  {isDeleting ? '...' : 'delete account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  )
}

export default MemberDirectory
