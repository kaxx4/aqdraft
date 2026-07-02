import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { supabaseCommunity } from '../lib/supabaseCommunity'
import { I } from '../components/v6Shared'

interface MemberRow {
  memberId: number
  uuid: string
  fullName: string
  avatarUrl?: string
  role: string
  classGrade?: string
  schoolName?: string
  createdAt?: string
}

const AVATAR_COLORS = ['#00E5A0','#FF6BD6','#FFC700','#7E5BFF','#FF7A1A','#3DA9FC']
function hashColor(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}
function getInitials(name: string) {
  return (name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

const PAGE_SIZE = 30

export default function MembersPage() {
  const navigate = useNavigate()
  const { member: currentMember } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [q, setQ] = useState(() => searchParams.get('q') ?? '')
  const [role, setRole] = useState(() => searchParams.get('role') ?? 'all')

  const [members, setMembers] = useState<MemberRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync URL state for shareable filters
  useEffect(() => {
    const next: Record<string, string> = {}
    if (q) next.q = q
    if (role !== 'all') next.role = role
    setSearchParams(next, { replace: true })
  }, [q, role, setSearchParams])

  const fetchMembers = async (currentQ: string, currentRole: string, currentPage: number) => {
    setLoading(true)
    setError(null)
    try {
      const from = (currentPage - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      let query = supabaseCommunity
        .from('members')
        .select(
          'member_id, uuid, full_name, avatar_url, role, class_grade, created_at, schools (name)',
          { count: 'exact' }
        )
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(from, to)

      if (currentQ) query = query.ilike('full_name', `%${currentQ}%`)
      if (currentRole !== 'all') query = query.eq('role', currentRole)

      const { data, count, error: dbError } = await query
      if (dbError) throw dbError

      const rows: MemberRow[] = (data ?? []).map((m: any) => ({
        memberId: m.member_id,
        uuid: m.uuid,
        fullName: m.full_name,
        avatarUrl: m.avatar_url ?? undefined,
        role: m.role ?? 'member',
        classGrade: m.class_grade ?? undefined,
        schoolName: m.schools?.name ?? undefined,
        createdAt: m.created_at ?? undefined,
      }))
      setMembers(rows)
      setTotal(count ?? 0)
    } catch (e: any) {
      setError(e?.message ?? "Couldn't load members.")
      setMembers([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  // Debounced fetch on filter change
  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => fetchMembers(q, role, page), q ? 250 : 0)
    return () => { if (debounce.current) clearTimeout(debounce.current) }
  }, [q, role, page])

  const profilePath = (uuid: string) => currentMember ? `/profile/${uuid}` : `/member/${uuid}`

  const totalPages = useMemo(() => Math.ceil(total / PAGE_SIZE), [total])

  const ROLE_FILTERS: Array<[string, string]> = [
    ['all', 'All'],
    ['member', 'Members'],
    ['hod', 'HoDs'],
    ['director', 'Directors'],
  ]

  return (
    <div className="route-enter">
      <section style={{
        background: 'var(--bg-2)',
        padding: 'clamp(32px,5vw,56px) var(--page-px,24px) clamp(20px,3vw,32px)',
        borderBottom: '2px solid var(--ink)',
      }}>
        <div className="container">
          <span className="sticker sticker-mint wobble">★ DIRECTORY</span>
          <h1 className="h-display" style={{
            fontSize: 'clamp(44px, 7vw, 80px)', margin: '10px 0 0', lineHeight: 0.92,
          }}>
            the <span style={{ fontStyle: 'italic', fontFamily: 'var(--serif)', fontWeight: 400, color: 'var(--mint)' }}>people</span>.
          </h1>
          <p className="muted" style={{ marginTop: 8, fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>
            {total > 0 ? `${total} active member${total !== 1 ? 's' : ''}` : 'AquaTerra members'}
          </p>
        </div>
      </section>

      <div className="aq-wrap" style={{ paddingTop: 'clamp(20px,4vw,28px)', paddingBottom: 80 }}>
        {/* Search bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'var(--card)',
          border: '2px solid var(--line-2)',
          borderRadius: 16,
          padding: '0 16px',
          height: 52,
          marginBottom: 14,
        }}>
          <span style={{ color: 'var(--ink-3)' }}><I.search /></span>
          <input
            placeholder="search by name..."
            value={q}
            onChange={e => { setPage(1); setQ(e.target.value) }}
            autoComplete="off"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              // 16px to suppress iOS Safari's focus-zoom (anything < 16px
              // triggers the auto-zoom on input focus).
              fontSize: 16, fontFamily: 'var(--sans)', color: 'var(--ink)', padding: 0, minWidth: 0,
            }}
          />
          {q && (
            <button
              className="btn btn-sm"
              onClick={() => { setQ(''); setPage(1) }}
              style={{
                // 40×40 hit area minimum — was 4px×10px padding (~22px tall).
                flexShrink: 0, minHeight: 40, padding: '0 12px', fontSize: 12,
              }}
            >
              clear
            </button>
          )}
        </div>

        {/* Role filters */}
        <div className="row gap-2" style={{ marginBottom: 24, flexWrap: 'wrap' }}>
          {ROLE_FILTERS.map(([k, l]) => (
            <button
              key={k}
              className={'chip ' + (role === k ? 'chip-active' : '')}
              onClick={() => { setPage(1); setRole(k) }}
            >
              {l}
            </button>
          ))}
        </div>

        {error && (
          <div role="alert" style={{
            marginBottom: 16, padding: '12px 16px', borderRadius: 12,
            background: 'rgba(255,77,46,0.10)', border: '2px solid rgba(255,77,46,0.45)',
            color: 'var(--tomato, #FF4D2E)', fontSize: 14, fontWeight: 600,
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="v6-skeleton" style={{ height: 160, borderRadius: 14 }} />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <div className="h-display" style={{ fontSize: 28, color: 'var(--ink-3)' }}>no members match.</div>
            <p className="muted" style={{ marginTop: 8 }}>try a different name or role filter.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              {members.map(m => {
                const color = hashColor(m.fullName)
                return (
                  <button
                    key={m.uuid}
                    onClick={() => navigate(profilePath(m.uuid))}
                    className="card card-hover"
                    style={{ padding: 14, textAlign: 'center', cursor: 'pointer', border: 'none', background: 'var(--card)' }}
                  >
                    <div className="avatar avatar-lg" style={{ background: color, margin: '4px auto', overflow: 'hidden' }}>
                      {m.avatarUrl
                        ? <img src={m.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                        : getInitials(m.fullName)}
                    </div>
                    <div style={{ fontWeight: 700, marginTop: 8, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.fullName}
                    </div>
                    {m.schoolName && <div className="mono xs muted" style={{ marginTop: 2 }}>{m.schoolName}</div>}
                    <span className={'role role-' + m.role} style={{ marginTop: 8, display: 'inline-block' }}>{m.role}</span>
                  </button>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="row gap-2" style={{ justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
                <button
                  className="btn btn-sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  ← prev
                </button>
                <span className="mono xs muted" style={{ alignSelf: 'center', fontVariantNumeric: 'tabular-nums' }}>
                  page {page} of {totalPages}
                </span>
                <button
                  className="btn btn-sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  next →
                </button>
              </div>
            )}

            {!currentMember && (
              <div style={{
                marginTop: 40, padding: 24, textAlign: 'center',
                background: 'var(--lemon)', color: '#0A0A0A',
                border: '2px solid var(--ink)', borderRadius: 16,
              }}>
                <div className="h-display" style={{ fontSize: 28, marginBottom: 8 }}>
                  want to join AquaTerra?
                </div>
                <p style={{ fontSize: 14, marginBottom: 16 }}>
                  apply in 2 minutes. hear back in 24 hours.
                </p>
                <Link to="/recruitment" className="btn btn-primary">Show up with us →</Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
