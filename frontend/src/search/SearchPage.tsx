import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import searchService from '../services/searchService'
import { I } from '../components/v6Shared'
import FeedPostCard from '../feed/FeedPostCard'
import { useFeedCardBatch } from '../hooks/useFeedCardBatch'
import { Post } from '../services/api'

const AVATAR_COLORS = ['#00E5A0','#FF6BD6','#FFC700','#7E5BFF','#FF7A1A','#3DA9FC']
function hashColor(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

export default function SearchPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { member } = useAuth()
  // URL state — enables bookmarking and sharing search results
  const [q, setQ] = useState(() => searchParams.get('q') || '')
  const [type, setType] = useState(() => searchParams.get('type') || 'all')
  const [posts, setPosts] = useState<Post[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [schools, setSchools] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync state to URL so searches are bookmarkable/shareable
  useEffect(() => {
    const params: Record<string, string> = {}
    if (q) params.q = q
    if (type !== 'all') params.type = type
    setSearchParams(params, { replace: true })
  }, [q, type, setSearchParams])

  // Server-side search using searchService — fires on each query change
  // with debounce. Posts, projects, members, teams, schools all come
  // back from a single searchService.search() call — no separate feed
  // fetch + client-side filter (that pattern only covered the 20 most
  // recent posts and was bypassing the database's actual full-text
  // search via ilike).
  useEffect(() => {
    if (!q) {
      setMembers([]); setTeams([]); setSchools([]); setPosts([]); setProjects([]); setClasses([])
      return
    }
    if (debounce.current) clearTimeout(debounce.current)
    setLoading(true)
    setError(null)
    debounce.current = setTimeout(async () => {
      try {
        // SearchPage uses "members" filter label; searchService uses "people"
        const svcType = type === 'members' ? 'people' : type
        const searchRes = await searchService.search(q, svcType, 20)
        if (searchRes.success) {
          setMembers(searchRes.data.results.people)
          setTeams(searchRes.data.results.teams)
          setSchools(searchRes.data.results.schools)
          setProjects(searchRes.data.results.projects)
          setClasses(searchRes.data.results.classes || [])
          // Map SearchPost shape onto the Post type the card expects.
          // Server already filtered + paginated — no client-side ilike here.
          setPosts(searchRes.data.results.posts.map((p) => ({
            postId: p.postId,
            uuid: p.uuid,
            category: p.category,
            body: p.body,
            status: 'published',
            createdAt: p.createdAt,
            authorId: 0,
            authorUuid: p.authorUuid,
            authorName: p.authorName,
            authorAvatar: undefined,
            authorRole: undefined as any,
            likeCount: p.likeCount,
            commentCount: p.commentCount,
            images: p.images as any,
          })) as Post[])
        }
      } catch (e: any) {
        setError(e?.message ?? 'Search failed')
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [q, type])

  const matchPosts = posts
  // Batch per-card saved-state + linked-opening for the (max 6) post results.
  const { savedSet, openings } = useFeedCardBatch(matchPosts)
  const matchMembers = members
  const matchTeams = teams
  const matchSchools = schools
  const matchProjects = projects

  const showPosts = type === 'all' || type === 'posts'
  const showMembers = type === 'all' || type === 'members'
  const showProjects = type === 'all' || type === 'projects'
  const showTeams = type === 'all' || type === 'teams'
  const showSchools = type === 'all' || type === 'schools'
  const showClasses = type === 'all' || type === 'classes'
  const totalResults =
    (showPosts ? matchPosts.length : 0) +
    (showMembers ? matchMembers.length : 0) +
    (showProjects ? matchProjects.length : 0) +
    (showTeams ? matchTeams.length : 0) +
    (showSchools ? matchSchools.length : 0) +
    (showClasses ? classes.length : 0)

  return (
    <div className="route-enter aq-wrap" style={{ paddingTop: 'clamp(24px, 4vw, 48px)', paddingBottom: 80, maxWidth: 960 }}>
      <h1 className="h-display" style={{ fontSize: 'clamp(36px, 6vw, 64px)', margin: 0, lineHeight: 0.92 }}>
        find your <span style={{ fontStyle: 'italic', fontFamily: 'var(--serif)', fontWeight: 400, color: 'var(--mint)' }}>people</span>.
      </h1>
      <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>posts, members, and teams, all in one place.</p>

      {/* search bar */}
      <div style={{
        marginTop: 20,
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--card)',
        border: '2px solid var(--ink)',
        borderRadius: 16,
        padding: '0 16px',
        height: 58,
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
        onFocusCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--mint)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(0,229,160,0.15)' }}
        onBlurCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}
      >
        <label htmlFor="aq-search" style={{ flexShrink: 0, color: 'var(--ink-3)', display: 'flex', alignItems: 'center' }}>
          <I.search />
        </label>
        <input
          id="aq-search"
          autoFocus
          placeholder="search anything... (⌘K)"
          value={q}
          onChange={e => setQ(e.target.value)}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Search AquaTerra"
          style={{
            flex: 1,
            border: 'none', outline: 'none',
            background: 'transparent',
            fontSize: 16,
            fontFamily: 'var(--sans)',
            color: 'var(--ink)',
            padding: 0,
            minWidth: 0,
          }}
        />
        {q && (
          <button
            className="btn btn-sm"
            onClick={() => setQ('')}
            aria-label="Clear search"
            style={{ flexShrink: 0, padding: '4px 10px', fontSize: 11 }}
          >
            clear
          </button>
        )}
      </div>

      {/* filters */}
      <div className="row gap-2" style={{ marginTop: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        {['all', 'posts', 'members', 'projects', 'teams', 'schools', 'classes'].map(t => (
          <button key={t} className={'chip ' + (type === t ? 'chip-active' : '')} onClick={() => setType(t)}>{t}</button>
        ))}
        {q && (
          <span className="mono xs muted" aria-live="polite" aria-atomic="true" style={{ marginLeft: 'auto' }}>
            {totalResults} result{totalResults !== 1 ? 's' : ''}{loading ? '…' : ''}
          </span>
        )}
      </div>

      {error && (
        <div
          role="alert"
          style={{
            marginTop: 14,
            padding: '12px 16px',
            borderRadius: 12,
            background: 'rgba(255,77,46,0.10)',
            border: '2px solid rgba(255,77,46,0.45)',
            color: 'var(--tomato, #FF4D2E)',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      {/* empty state — playful prompt + tappable suggestions */}
      {!q && (
        <div style={{ marginTop: 'clamp(40px, 9vw, 72px)', textAlign: 'center' }}>
          <div style={{ fontSize: 'clamp(44px, 13vw, 60px)', lineHeight: 1, marginBottom: 14 }} aria-hidden>🔭</div>
          <div className="h-display" style={{ fontSize: 'clamp(28px, 7vw, 40px)', color: 'var(--ink)', lineHeight: 0.95, margin: '0 0 8px' }}>
            what are you <span style={{ color: 'var(--mint)' }}>looking</span> for?
          </div>
          <p className="muted" style={{ fontSize: 14, margin: '0 0 22px' }}>posts, members, teams, projects, schools — all in one place.</p>
          <div className="row gap-2" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            {['welfare', 'paradox', 'roots', 'design'].map(s => (
              <button key={s} className="chip" onClick={() => setQ(s)} style={{ fontWeight: 700 }}>
                {s} →
              </button>
            ))}
          </div>
        </div>
      )}

      {/* results */}
      {q && (
        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 40 }}>

          {/* members */}
          {showMembers && matchMembers.length > 0 && (
            <section>
              <h3 className="h-display" style={{ fontSize: 28, marginBottom: 14 }}>members</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                {matchMembers.slice(0, 8).map((m: any) => {
                  const name = m.full_name || m.fullName || m.name || 'Member'
                  const school = m.school_name || m.schoolName || m.school || ''
                  const role = m.role || 'member'
                  const uuid = m.uuid || m.id
                  const color = hashColor(name)
                  const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                  const path = member ? `/profile/${uuid}` : `/member/${uuid}`
                  return (
                    <div
                      key={uuid}
                      className="card card-hover"
                      style={{ padding: 14, textAlign: 'center', cursor: 'pointer' }}
                      onClick={() => navigate(path)}
                    >
                      <div className="avatar avatar-lg" style={{ background: color, margin: '4px auto', overflow: 'hidden' }}>
                        {m.avatar_url || m.avatarUrl
                          ? <img src={m.avatar_url || m.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                          : initials}
                      </div>
                      <div style={{ fontWeight: 700, marginTop: 8, fontSize: 14 }}>{name}</div>
                      {school && <div className="mono xs muted">{school}</div>}
                      <span className={'role role-' + role} style={{ marginTop: 8 }}>{role}</span>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* projects */}
          {showProjects && matchProjects.length > 0 && (
            <section>
              <h3 className="h-display" style={{ fontSize: 28, marginBottom: 14 }}>projects</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                {matchProjects.slice(0, 6).map((p: any) => {
                  // The "uuid" returned by searchService for welfare projects is
                  // actually the slug — PublicProjectDetailPage routes by slug.
                  return (
                    <div
                      key={p.uuid}
                      className="card card-hover"
                      style={{ overflow: 'hidden', cursor: 'pointer' }}
                      onClick={() => navigate('/projects/' + p.uuid)}
                    >
                      <div style={{ background: hashColor(p.title || ''), padding: 20, borderBottom: '2px solid var(--ink)', color: '#0A0A0A', position: 'relative', overflow: 'hidden' }}>
                        <div className="mono xs upper" style={{ fontWeight: 700 }}>★ {p.category || 'project'}</div>
                        <div className="h-display" style={{ fontSize: 24, marginTop: 6, lineHeight: 1.1 }}>{p.title}</div>
                      </div>
                      <div style={{ padding: 14 }}>
                        <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: '0 0 10px', minHeight: 36 }}>{(p.description || '').slice(0, 100)}{p.description?.length > 100 ? '…' : ''}</p>
                        <span className="chip" style={{ fontSize: 11 }}>{p.status}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* teams */}
          {showTeams && matchTeams.length > 0 && (
            <section>
              <h3 className="h-display" style={{ fontSize: 28, marginBottom: 14 }}>teams</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                {matchTeams.slice(0, 6).map((t: any) => (
                  <div
                    key={t.uuid || t.id}
                    className="card card-hover"
                    style={{ overflow: 'hidden', cursor: 'pointer' }}
                    onClick={() => navigate('/teams/' + (t.uuid || t.id))}
                  >
                    <div style={{ background: hashColor(t.name || ''), padding: 20, borderBottom: '2px solid var(--ink)', color: '#0A0A0A', position: 'relative', overflow: 'hidden' }}>
                      <div className="mono xs upper" style={{ fontWeight: 700 }}>★ {t.category}</div>
                      <div className="h-display" style={{ fontSize: 28, marginTop: 6 }}>{t.name}</div>
                    </div>
                    <div style={{ padding: 14 }}>
                      <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: '0 0 10px', minHeight: 36 }}>{t.description || t.bio || ''}</p>
                      <div className="mono xs muted">{t.memberCount || 0} members</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* schools — clicking funnels into a member search filtered
              by the school name (members.school_name matches via the
              extended people query). */}
          {showSchools && matchSchools.length > 0 && (
            <section>
              <h3 className="h-display" style={{ fontSize: 28, marginBottom: 14 }}>schools</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                {matchSchools.slice(0, 8).map((s: any) => (
                  <div
                    key={s.uuid}
                    className="card card-hover"
                    style={{ padding: 14, cursor: 'pointer' }}
                    onClick={() => navigate(`/search?q=${encodeURIComponent(s.name)}&type=members`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/search?q=${encodeURIComponent(s.name)}&type=members`) }}
                  >
                    <div className="mono xs upper" style={{ fontWeight: 700, color: 'var(--mint)' }}>★ school</div>
                    <div style={{ fontWeight: 700, marginTop: 6, fontSize: 16 }}>{s.name}</div>
                    {s.shortName && <div className="mono xs muted" style={{ marginTop: 2 }}>{s.shortName}</div>}
                    {s.location && <div className="mono xs muted" style={{ marginTop: 6 }}>{s.location}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* classes — derived from members.class_grade aggregates.
              Clicking funnels into a member search filtered by the
              class_grade string (the extended people query matches
              class_grade alongside name). */}
          {showClasses && classes.length > 0 && (
            <section>
              <h3 className="h-display" style={{ fontSize: 28, marginBottom: 14 }}>classes</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                {classes.slice(0, 8).map((c: any) => (
                  <div
                    key={c.uuid}
                    className="card card-hover"
                    style={{ padding: 14, cursor: 'pointer' }}
                    onClick={() => navigate(`/search?q=${encodeURIComponent(c.name)}&type=members`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/search?q=${encodeURIComponent(c.name)}&type=members`) }}
                  >
                    <div className="mono xs upper" style={{ fontWeight: 700, color: 'var(--lemon)' }}>★ class</div>
                    <div style={{ fontWeight: 700, marginTop: 6, fontSize: 16 }}>{c.name}</div>
                    <div className="mono xs muted" style={{ marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
                      {c.memberCount} member{c.memberCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* posts */}
          {showPosts && matchPosts.length > 0 && (
            <section>
              <h3 className="h-display" style={{ fontSize: 28, marginBottom: 14 }}>posts</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
                {matchPosts.slice(0, 6).map((p, i) => (
                  <FeedPostCard key={p.uuid} post={p} seed={i} savedInitial={savedSet.has(p.postId)} linkedOpening={openings.get(p.uuid) ?? null} />
                ))}
              </div>
            </section>
          )}

          {/* no results */}
          {totalResults === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div className="h-display" style={{ fontSize: 32, color: 'var(--ink-3)' }}>no results for "{q}"</div>
              <p className="muted" style={{ marginTop: 8 }}>we looked everywhere. nothing here matches it.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
