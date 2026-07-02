import { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase, normalizeObj, OBJ_COLORS, WelfareProject } from '../lib/supabase'
import { useReveal } from '../hooks/useReveal'
import ProjectCard from '../components/ProjectCard'
import FeaturedTicker from '../components/FeaturedTicker'
import { useMeta } from '../hooks/useMeta'
import { pageMetadata } from '../lib/metaConfig'

type ProjectCard = Pick<WelfareProject, 'id' | 'slug' | 'header' | 'objective' | 'location' | 'workshop_date' | 'volunteers' | 'main_image' | 'main_image_alt' | 'featured' | 'key_statistic'>

// Pre-derived fields we attach once per project so the render loop is O(1)
// instead of O(N) per card (no more findIndex scans).
type EnrichedProject = ProjectCard & {
  _norm: string
  _color: string
  _displayNum: number
}

const OBJ_FILTER_OPTIONS = ['All', 'Workshop', 'Feeding Dogs', 'Plantation Drive', 'Distribution Drive', 'Sundarbans Relief', 'Old Age Home Visit', 'Fundraising Event', 'Others']
type SortKey = 'newest' | 'oldest' | 'most_vol'
const PAGE_SIZE = 20

// Columns the listing actually renders. ProjectCard uses 8 of these; the rest
// (description / writeup / gallery URLs / etc.) are loaded only when a user
// drills into a project detail page.
const SELECT_COLS = 'id,slug,header,objective,location,workshop_date,volunteers,main_image,main_image_alt,featured,key_statistic'

// First paint chunk — small enough to come back fast on slow connections,
// big enough to fill the viewport above the fold even on 4K. The remaining
// rows are streamed in via a background fetch after first paint.
const FIRST_PAGE = 60

const CACHE_KEY = 'aq_projects_cache_v3'  // v3: sort order changed to descending
// Cache is usable for a week (projects change a few times a week, and we
// revalidate in the background anyway). Past this, treat as a cold load.
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000
// Serve cache instantly; silently refetch in the background once it's older
// than this (stale-while-revalidate) so the list is never blocked on the
// cross-region welfare DB but still stays fresh.
const REVALIDATE_AFTER = 30 * 60 * 1000

type CachedShape = { data: ProjectCard[]; ts: number; count: number }

function readCache(): CachedShape | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedShape
    if (!parsed?.data?.length) return null
    if (Date.now() - parsed.ts > CACHE_TTL) return null
    return parsed
  } catch { return null }
}

function writeCache(data: ProjectCard[], count: number) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now(), count })) } catch {}
}

export default function PublicProjectsPage() {
  useMeta(pageMetadata.projects)
  // Seed synchronously from cache so the first paint already has cards.
  const cached = useMemo(() => readCache(), [])
  const [projects, setProjects] = useState<ProjectCard[]>(cached?.data ?? [])
  const [totalCount, setTotalCount] = useState<number>(cached?.count ?? cached?.data?.length ?? 0)
  const [loading, setLoading] = useState(!cached)
  const [fetchError, setFetchError] = useState<string | null>(null)
  // Seed the search from a ?q= deep-link (e.g. a project's partner name, or a
  // blog post linking here by keyword) so those links land pre-filtered.
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(() => searchParams.get('q') || '')
  const [objFilter, setObjFilter] = useState('All')
  const [yearFilter, setYearFilter] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('newest')
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const sentinelRef = useRef<HTMLDivElement>(null)
  // Collapsing sticky search (mobile): once the filter bar pins under the nav it
  // shrinks to just the search field; tapping the field re-expands the filters
  // (focus mode). Desktop always shows the full bar.
  const filterRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [barStuck, setBarStuck] = useState(false)
  const [searchFocusOpen, setSearchFocusOpen] = useState(false)
  const filtersCollapsed = barStuck && !searchFocusOpen
  useReveal()

  /* Infinite scroll sentinel */
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisibleCount(c => c + PAGE_SIZE) },
      { rootMargin: '200px' }
    )
    obs.observe(sentinel)
    return () => obs.disconnect()
  }, [])

  // Track whether the sticky filter bar is pinned under the nav (rAF-throttled),
  // so it can collapse to just the search field while the list scrolls.
  useEffect(() => {
    const el = filterRef.current
    if (!el) return
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 70
    let raf = 0
    const measure = () => {
      raf = 0
      const stuck = el.getBoundingClientRect().top <= navH + 9
      setBarStuck(stuck)
      // A scroll re-collapses an expanded bar unless the field is being typed in.
      if (stuck && document.activeElement !== searchInputRef.current) setSearchFocusOpen(false)
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure) }
    window.addEventListener('scroll', onScroll, { passive: true })
    measure()
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])

  useEffect(() => { setVisibleCount(PAGE_SIZE) }, [search, objFilter, yearFilter, featuredOnly, sortBy])

  useEffect(() => {
    // Stale-while-revalidate. The first paint already shows `cached` cards.
    // Skip the network entirely if the cache is fresh; otherwise refetch — and
    // when a cache exists, do it SILENTLY (no spinner, don't clear the visible
    // list; swap to the fresh full set only once it's fully loaded).
    const age = cached ? Date.now() - cached.ts : Infinity
    if (cached && age < REVALIDATE_AFTER) return
    const silent = !!cached

    let cancelled = false

    // Stage 1: FIRST_PAGE rows + the exact total (for displayNum).
    supabase
      .from('welfare_projects')
      .select(SELECT_COLS, { count: 'exact' })
      .eq('is_draft', false)
      .order('workshop_date', { ascending: false })
      .range(0, FIRST_PAGE - 1)
      .then(({ data, error, count }) => {
        if (cancelled) return
        if (error) {
          // On a cold load, surface the error (e.g. legacy welfare project
          // paused / key rotated). On a silent revalidate, keep the cached
          // view and just log — never blank a working page.
          console.error('[PublicProjectsPage] stage 1 failed', error)
          if (!silent) { setFetchError(error.message ?? 'Failed to load welfare projects'); setLoading(false) }
          return
        }
        if (!data) { if (!silent) setLoading(false); return }

        const realCount = count ?? data.length
        setTotalCount(realCount)
        if (!silent) {
          // Cold load: paint the first page immediately + warm the cache.
          setProjects(data)
          setLoading(false)
          writeCache(data, realCount)
        }

        // Stage 2: drain the rest. On a silent revalidate this is where we swap
        // the visible list to the fresh full set (one clean swap, no flash).
        if (realCount > FIRST_PAGE) {
          supabase
            .from('welfare_projects')
            .select(SELECT_COLS)
            .eq('is_draft', false)
            .order('workshop_date', { ascending: false })
            .range(FIRST_PAGE, realCount - 1)
            .then(({ data: more, error: e2 }) => {
              if (cancelled) return
              if (e2) { console.warn('[PublicProjectsPage] stage 2 failed', e2); return }
              if (!more?.length) return
              const all = [...data, ...more]
              setProjects(all)
              writeCache(all, realCount)
            })
        } else if (silent) {
          // Whole set fits in stage 1 — swap + refresh cache.
          setProjects(data)
          writeCache(data, realCount)
        }
      })

    return () => { cancelled = true }
  }, [cached])

  // Precompute everything every card needs (norm / color / reverse-chronology
  // display number) once per `projects` update. This is what eliminates the
  // O(N²) findIndex that used to run on every render inside the card map.
  const enriched = useMemo<EnrichedProject[]>(() => {
    const total = totalCount || projects.length
    return projects.map((p, i) => {
      const norm = normalizeObj(p.objective)
      return {
        ...p,
        _norm: norm,
        _color: OBJ_COLORS[norm] || OBJ_COLORS['Others'],
        _displayNum: total - i,
      }
    })
  }, [projects, totalCount])

  // Available years for the year-filter dropdown (derived from data)
  const years = useMemo(() => {
    const ys = new Set(enriched.map(p => p.workshop_date?.slice(0, 4)).filter(Boolean) as string[])
    return [...ys].sort().reverse()
  }, [enriched])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    let list = enriched.filter(p => {
      if (objFilter !== 'All' && p._norm !== objFilter) return false
      if (yearFilter && !p.workshop_date?.startsWith(yearFilter)) return false
      if (featuredOnly && !p.featured) return false
      if (!q) return true
      return (
        p.header.toLowerCase().includes(q) ||
        (p.location || '').toLowerCase().includes(q)
      )
    })
    // enriched is already newest-first (descending query).
    // 'oldest' reverses; 'most_vol' re-sorts by volunteer count.
    if (sortBy === 'oldest') list = [...list].reverse()
    else if (sortBy === 'most_vol') list = [...list].sort((a, b) => (b.volunteers ?? 0) - (a.volunteers ?? 0))
    return list
  }, [enriched, search, objFilter, yearFilter, featuredOnly, sortBy])

  const featured = useMemo(() => enriched.filter(p => p.featured), [enriched])
  const visibleFiltered = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length
  const isUnfilteredView = objFilter === 'All' && !search && !yearFilter && !featuredOnly && sortBy === 'newest'
  const activeFilterCount = [objFilter !== 'All', !!yearFilter, featuredOnly, sortBy !== 'newest'].filter(Boolean).length

  return (
    <div className="route-enter">
      {/* ── HERO ── */}
      <section style={{
        background: 'var(--ink)',
        padding: 'clamp(40px, 7vw, 88px) clamp(24px, 5vw, 64px) clamp(36px, 5vw, 64px)',
        borderBottom: '2px solid var(--ink)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700 }}>
          <span
            className="sticker sticker-mint sticker-float"
            style={{ marginBottom: 20, display: 'inline-flex' }}
          >
            ★ {totalCount > 0 ? `${totalCount}+` : '534+'} welfare drives
          </span>

          <h1 style={{
            fontFamily: 'var(--display)',
            fontWeight: 900,
            fontSize: 'clamp(48px, 8vw, 96px)',
            lineHeight: 0.88,
            letterSpacing: '-0.04em',
            margin: '0 0 20px',
            color: 'var(--bg)',
            textTransform: 'uppercase',
            textWrap: 'balance',
          } as React.CSSProperties}>
            OUR<br />
            <span style={{ color: 'var(--mint)' }}>PROJ</span>
            <span style={{
              fontStyle: 'italic',
              fontFamily: 'var(--serif)',
              fontWeight: 400,
              color: 'var(--bg)',
              textTransform: 'none',
              fontSize: '0.9em',
            }}>ects</span>
            <span style={{ color: 'var(--mint)' }}>.</span>
          </h1>

          <p style={{
            fontFamily: 'var(--eina)',
            fontSize: 'clamp(15px, 1.6vw, 17px)',
            lineHeight: 1.65,
            color: 'rgba(255,255,255,0.55)',
            maxWidth: 420,
            margin: '0 0 32px',
          } as React.CSSProperties}>
            Every welfare drive, plantation, distribution run, and workshop.
            Documented since 2021.
          </p>

          {/* Stats — inline, no grey boxes */}
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            {[
              { k: '4,000+', v: 'saplings planted' },
              { k: '3,500+', v: 'kids reached' },
              { k: '8',      v: 'Sundarbans trips' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{
                  fontFamily: 'var(--display)', fontWeight: 900,
                  fontSize: 'clamp(26px, 3.5vw, 32px)',
                  color: 'var(--mint)', letterSpacing: '-0.04em', lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                }}>{s.k}</div>
                <div style={{
                  fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: 'rgba(255,255,255,0.38)', marginTop: 5,
                }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STICKY FILTER BAR — floating liquid-glass pill (matches the nav) ── */}
      <div className="aq-floating-filter" ref={filterRef}>
       <div className={'aq-floating-filter-inner' + (filtersCollapsed ? ' is-collapsed' : '') + (searchFocusOpen ? ' is-focus' : '')}>
        {/* Row 1: search + selects + clear */}
        <div className="aq-filter-row1" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="aq-filter-search" onPointerDown={() => { setSearchFocusOpen(true); searchInputRef.current?.focus() }} style={{ position: 'relative', flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input ref={searchInputRef} type="text" className="input" placeholder="Search…" aria-label="Search projects by title or location" value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocusOpen(true)}
              style={{ paddingLeft: 32, height: 40, fontSize: 16, width: 180, background: 'var(--bg-2)', border: '1.5px solid var(--line-2)' }}
            />
          </div>

          <div className="aq-filter-extras" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
          {/* Year dropdown */}
          <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} aria-label="Filter projects by year"
            style={{ height: 40, padding: '0 10px', fontFamily: 'var(--fm)', fontSize: 12, border: '1.5px solid var(--line-2)', borderRadius: 8, background: yearFilter ? 'var(--ink)' : 'var(--bg-2)', color: yearFilter ? 'var(--bg)' : 'var(--ink)', cursor: 'pointer' }}>
            <option value="">All years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          {/* Sort dropdown */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value as SortKey)} aria-label="Sort projects"
            style={{ height: 40, padding: '0 10px', fontFamily: 'var(--fm)', fontSize: 12, border: '1.5px solid var(--line-2)', borderRadius: 8, background: sortBy !== 'newest' ? 'var(--ink)' : 'var(--bg-2)', color: sortBy !== 'newest' ? 'var(--bg)' : 'var(--ink)', cursor: 'pointer' }}>
            <option value="newest">↓ Newest first</option>
            <option value="oldest">↑ Oldest first (#1 at top)</option>
            <option value="most_vol">★ Most volunteers</option>
          </select>

          {/* Featured toggle */}
          <button onClick={() => setFeaturedOnly(f => !f)}
            className={'chip' + (featuredOnly ? ' chip-active' : '')}
            style={{ height: 40, flexShrink: 0 }}>
            ★ Featured only
          </button>

          {/* Active filter badge + clear */}
          {activeFilterCount > 0 && (
            <button onClick={() => { setObjFilter('All'); setYearFilter(''); setSortBy('newest'); setFeaturedOnly(false); setSearch('') }}
              style={{ marginLeft: 'auto', height: 36, padding: '0 14px', fontFamily: 'var(--fm)', fontSize: 12, borderRadius: 999, border: '1.5px solid var(--line-2)', background: 'var(--bg-2)', cursor: 'pointer', color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>
              {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} · clear ×
            </button>
          )}
          </div>
        </div>

        {/* Row 2: category chips */}
        <div className="aq-filter-chips" style={{ position: 'relative', marginTop: 8 }}>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2, paddingRight: 32 }}>
            {OBJ_FILTER_OPTIONS.map(o => (
              <button key={o} className={'chip' + (objFilter === o ? ' chip-active' : '')}
                onClick={() => setObjFilter(o)} style={{ flexShrink: 0 }}>
                {o}
              </button>
            ))}
          </div>
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 2, width: 40, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.64))', pointerEvents: 'none' }} />
        </div>
       </div>
      </div>

      {/* ── FEATURED — seamless infinite ticker of project cards ── */}
      {featured.length > 0 && isUnfilteredView && (
        <section style={{ padding: 'clamp(28px, 4vw, 44px) 0 0' }}>
          <div className="container" style={{ marginBottom: 12 }}>
            <div className="mono xs upper" style={{ fontWeight: 700, letterSpacing: '0.06em', color: 'var(--ink-3)' }}>
              [ Featured ]
            </div>
          </div>
          <FeaturedTicker
            items={featured.map(p => ({
              slug: p.slug,
              header: p.header,
              image: p.main_image ?? undefined,
              alt: p.main_image_alt ?? undefined,
              tag: p._norm,
              color: p._color,
            }))}
          />
        </section>
      )}

      {/* ── ALL PROJECTS ── */}
      <section style={{ padding: 'clamp(28px, 4vw, 44px) var(--page-px, 24px) clamp(48px, 6vw, 72px)' }}>
        <div className="container">
          <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="mono xs upper" style={{ fontWeight: 700, letterSpacing: '0.06em', color: 'var(--ink-3)' }}>
              {isUnfilteredView ? '[ All Projects ]' : `[ ${objFilter !== 'All' ? objFilter : 'Search results'} ]`}
            </div>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums' }}>
              {loading
                ? '…'
                : isUnfilteredView
                  ? `${totalCount || filtered.length} projects`
                  : `${filtered.length} of ${totalCount || projects.length}`}
            </span>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{
                  borderRadius: 16, background: 'var(--bg-2)', aspectRatio: '3/4',
                  border: '2px solid var(--line)',
                  animation: 'aq-pulse 1.8s ease-in-out infinite',
                  animationDelay: `${i * 0.08}s`,
                }} />
              ))}
            </div>
          ) : fetchError ? (
            <div
              role="alert"
              style={{
                padding: 'clamp(28px, 5vw, 56px)',
                border: '1.5px solid #e05c5c',
                background: 'rgba(224,92,92,0.08)',
                borderRadius: 'var(--r)',
                margin: '20px 0 40px',
              }}
            >
              <div className="mono xs upper" style={{ fontWeight: 700, color: '#e05c5c', marginBottom: 8 }}>
                ★ Couldn't load welfare projects
              </div>
              <p style={{ fontFamily: 'var(--eina)', fontSize: 14, color: 'var(--ink-2)', marginBottom: 14, lineHeight: 1.6 }}>
                The welfare-projects database isn't responding. This page reads from a separate Supabase
                project (legacy welfare site at <code style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>nurtpdbqfizmqtztmiwk</code>)
                — check that it's not paused and that its anon key + RLS still allow public reads.
              </p>
              <pre style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#e05c5c', background: 'rgba(224,92,92,0.06)', padding: '8px 12px', borderRadius: 6, overflow: 'auto', margin: 0 }}>
                {fetchError}
              </pre>
              <button
                onClick={() => { setFetchError(null); setLoading(true); localStorage.removeItem(CACHE_KEY); window.location.reload() }}
                style={{
                  marginTop: 16, padding: '10px 18px', minHeight: 44,
                  background: 'var(--ink)', color: 'var(--bg)', border: '1.5px solid var(--ink)',
                  borderRadius: 999, fontFamily: 'var(--display)', fontWeight: 700, fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '60px 0 40px' }}>
              <p style={{ fontFamily: 'var(--eina)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-3)' }}>
                No projects match your search.
              </p>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
                {visibleFiltered.map((p) => (
                  <ProjectCard
                    key={p.slug} slug={p.slug} header={p.header} objective={p.objective ?? ''}
                    location={p.location ?? undefined} volunteers={p.volunteers} key_statistic={p.key_statistic}
                    main_image={p.main_image ?? undefined} main_image_alt={p.main_image_alt ?? undefined}
                    index={p._displayNum - 1} color={p._color} norm={p._norm} reverseNum={p._displayNum}
                  />
                ))}
              </div>

              {hasMore && (
                <div ref={sentinelRef} style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 20, height: 20, border: '2px solid var(--line-2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'aqSpin 0.7s linear infinite' }} />
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
