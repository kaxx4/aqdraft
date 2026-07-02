import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { supabase, normalizeObj, OBJ_COLORS, WelfareProject } from '../lib/supabase'
import { useAuth } from '../auth/AuthContext'
import CarouselStudioModal from '../components/CarouselStudioModal'
import type { CarouselProject } from '../components/carouselGenerator'
import { useMeta } from '../hooks/useMeta'
import { pageMetadata } from '../lib/metaConfig'
import { sized } from '../lib/imageUrl'

const OBJ_CAT_MAP: Record<string, string> = {
  'Workshop': 'welfare',
  'Feeding Dogs': 'welfare',
  'Plantation Drive': 'welfare',
  'Distribution Drive': 'welfare',
  'Sundarbans Relief': 'welfare',
  'Old Age Home Visit': 'welfare',
  'Fundraising Event': 'events',
  'Others': 'operations',
}

// A single quiet line, specific to the kind of drive, bridging "you just read
// what we did" → "here's how people become part of it". Not a CTA.
const OBJECTIVE_BRIDGE: Record<string, string> = {
  'Workshop': 'ShikshAQ and Welfare Projects run workshops like this year-round →',
  'Feeding Dogs': 'This happens regularly. the team is still small →',
  'Plantation Drive': '4,000+ saplings planted. most by students who joined the way you might →',
  'Distribution Drive': 'Everything here was organised by students, from Kolkata →',
  'Sundarbans Relief': 'AquaTerra has made 8 trips to the Sundarbans →',
  'Old Age Home Visit': 'These visits happen across Kolkata, run by students →',
  'Fundraising Event': 'Events like this fund everything else AquaTerra does →',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
}

type RelatedProject = Pick<WelfareProject, 'slug' | 'header' | 'main_image' | 'main_image_alt' | 'objective' | 'location' | 'volunteers' | 'key_statistic'>

// The related grid reads sparse at 4 (barely a row) — 8 fills two full rows on
// desktop and still wraps cleanly on mobile via the auto-fill grid.
const RELATED_TARGET = 8

export default function PublicProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { member } = useAuth()
  const canMakeCarousel = ['hod', 'director', 'super_admin'].includes(member?.role || '')
  const [showCarousel, setShowCarousel] = useState(false)
  const [project, setProject] = useState<WelfareProject | null>(null)
  const [related, setRelated] = useState<RelatedProject[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeImg, setActiveImg] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearAutoplay = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }, [])

  const resetAutoplay = useCallback((total: number) => {
    clearAutoplay()
    if (total <= 1) return
    intervalRef.current = setInterval(() => {
      setActiveImg(i => (i + 1) % total)
    }, 3800)
  }, [clearAutoplay])

  const goTo = useCallback((idx: number, total: number) => {
    setActiveImg(idx)
    resetAutoplay(total)
  }, [resetAutoplay])

  // Start autoplay once images are known
  useEffect(() => {
    if (!project) return
    const imgs = [
      project.main_image,
      project.image_1, project.image_2, project.image_3, project.image_4,
    ].filter(Boolean)
    if (imgs.length > 1 && isPlaying) resetAutoplay(imgs.length)
    return clearAutoplay
  }, [project, isPlaying, resetAutoplay, clearAutoplay])

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    supabase
      .from('welfare_projects')
      .select('*')
      .eq('slug', slug)
      .eq('is_draft', false)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data) { setNotFound(true); setLoading(false); return }
        setProject(data)
        setLoading(false)

        const cols = 'slug,header,main_image,main_image_alt,objective,location,volunteers,key_statistic'
        const objective = (data.objective || '').trim()

        // Stage 1 — same objective, case-insensitive. The source data has real
        // casing drift ("Workshop" vs "workshop"), which an exact `eq` match
        // silently split into near-empty buckets — most projects only ever saw
        // a handful of "similar" cards even when dozens of true matches existed.
        const stage1 = objective
          ? supabase.from('welfare_projects').select(cols).eq('is_draft', false)
              .ilike('objective', objective).neq('slug', slug)
              .order('workshop_date', { ascending: false }).limit(RELATED_TARGET)
          : Promise.resolve({ data: [] as RelatedProject[] })

        stage1.then(({ data: rel }) => {
          if (cancelled) return
          const primary = rel ?? []
          if (primary.length >= RELATED_TARGET) { setRelated(primary); return }

          // Stage 2 — backfill. The exact-theme pool alone was too thin to fill
          // a satisfying grid, so top it up with other recent projects rather
          // than leave the section showing just one or two cards.
          const seen = new Set([slug, ...primary.map(p => p.slug)])
          supabase
            .from('welfare_projects')
            .select(cols)
            .eq('is_draft', false)
            .order('workshop_date', { ascending: false })
            .limit(RELATED_TARGET + primary.length + 12)
            .then(({ data: more }) => {
              if (cancelled) return
              const backfill = (more ?? []).filter(p => !seen.has(p.slug)).slice(0, RELATED_TARGET - primary.length)
              setRelated([...primary, ...backfill])
            })
        })
      })
    return () => { cancelled = true }
  }, [slug])

  // Per-route SEO — unique title/description/social image from the loaded project.
  useMeta({
    title: project ? `${project.header} | AquaTerra Welfare Project` : pageMetadata.projectDetail.title,
    description: project
      ? (project.short_summary || project.objective || `${project.header}: a student-led welfare project by AquaTerra in Kolkata.`).slice(0, 165)
      : pageMetadata.projectDetail.description,
    image: project?.main_image || '',
    type: 'article',
  })

  if (loading) {
    return (
      <div className="route-enter container" style={{ padding: 'clamp(44px, 8vw, 80px) var(--page-px,24px) clamp(32px, 5vw, 56px)', textAlign: 'center' }}>
        <div className="mono xs upper muted">loading...</div>
      </div>
    )
  }

  if (notFound || !project) {
    return (
      <div className="route-enter container" style={{ padding: 'clamp(44px, 8vw, 80px) var(--page-px,24px) clamp(32px, 5vw, 56px)', textAlign: 'center' }}>
        <div className="h-display" style={{ fontSize: 40 }}>project not found.</div>
        <Link to="/projects" className="btn btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>← all projects</Link>
      </div>
    )
  }

  const norm = normalizeObj(project.objective)
  const accentColor = OBJ_COLORS[norm] || OBJ_COLORS['Others']
  const category = OBJ_CAT_MAP[norm] || 'welfare'

  const images = [
    project.image_1 && { src: project.image_1, alt: project.image_1_alt, label: project.label_1 },
    project.image_2 && { src: project.image_2, alt: project.image_2_alt, label: project.label_2 },
    project.image_3 && { src: project.image_3, alt: project.image_3_alt, label: project.label_3 },
    project.image_4 && { src: project.image_4, alt: project.image_4_alt, label: project.label_4 },
  ].filter(Boolean) as { src: string; alt: string | null; label: string | null }[]

  const allImages = project.main_image
    ? [{ src: project.main_image, alt: project.main_image_alt, label: null }, ...images]
    : images

  const writeupParagraphs = (project.long_writeup || '').split('\n\n').filter(p => p.trim())

  // Map the project into the carousel generator's shape (captioned images,
  // headline copy, the impact stat). Built once for the leadership-only studio.
  const carouselData: CarouselProject = {
    title: project.header,
    location: project.location,
    keyStatistic: project.key_statistic,
    objective: project.objective,
    shortSummary: project.short_summary,
    longWriteup: project.long_writeup,
    collabName: project.collab_name,
    volunteers: project.volunteers,
    workshopDate: project.workshop_date ? formatDate(project.workshop_date) : null,
    category,
    slug: project.slug,
    mainImage: project.main_image,
    images: allImages.map(im => ({ url: im.src, label: im.label })),
  }

  return (
    <div className="route-enter">

      {/* ── BACK NAV ── */}
      <div className="container" style={{ padding: '20px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <Link to="/projects" className="btn btn-sm">← all projects</Link>
        {/* Carousel studio — leadership only. Turns this project into a
            ready-to-post Instagram deck. */}
        {canMakeCarousel && (
          <button
            className="btn btn-sm"
            onClick={() => setShowCarousel(true)}
            title="Generate an Instagram carousel deck from this project"
            aria-label="Generate Instagram carousel"
            style={{
              background: 'var(--grape)', color: '#fff', border: 'none',
              fontWeight: 800, gap: 6, boxShadow: '0 2px 8px rgba(126,91,255,0.3)',
              transition: 'transform 0.12s cubic-bezier(0.2,0,0,1)', display: 'inline-flex', alignItems: 'center',
            }}
            onMouseDown={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.96)')}
            onMouseUp={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="2" y="5" width="14" height="14" rx="3" />
              <path d="M18 7h2a2 2 0 0 1 2 2v8" opacity="0.55" />
            </svg>
            <span className="mono" style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.02em' }}>carousel</span>
          </button>
        )}
      </div>

      {/* Carousel studio modal (portal so it escapes layout) */}
      {showCarousel && createPortal(
        <CarouselStudioModal project={carouselData} onClose={() => setShowCarousel(false)} />,
        document.body
      )}

      {/* ── TWO-COLUMN: sticky media (left) · scrolling info (right).
            Stacks top-to-bottom on mobile. ── */}
      <div className="proj-layout">

        {/* LEFT — media (sticky on desktop) */}
        <div className="proj-media-col">
          <div className="proj-viewer">
            {allImages.length > 0 ? (
              <img
                src={sized(allImages[activeImg].src, 'full')}
                alt={allImages[activeImg].alt || project.header}
                decoding="async"
                fetchPriority="high"
              />
            ) : (
              <div className="proj-viewer-ph" style={{ background: accentColor + '22' }}>
                <span className="h-display" style={{ fontSize: 56, opacity: 0.3 }}>{norm}</span>
              </div>
            )}

            {allImages.length > 0 && allImages[activeImg].label && (
              <div className="proj-gallery-caption">{allImages[activeImg].label}</div>
            )}

            {allImages.length > 1 && (
              <>
                <div className="proj-gallery-counter">
                  {String(activeImg + 1).padStart(2, '0')} / {String(allImages.length).padStart(2, '0')}
                </div>
                {isPlaying && (
                  <div className="proj-progress-bar" key={activeImg}>
                    <div className="proj-progress-fill" style={{ animationDuration: '3.8s' }} />
                  </div>
                )}
                <button
                  className="proj-gallery-playpause"
                  onClick={() => setIsPlaying(p => !p)}
                  aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <button
                  className="proj-gallery-nav proj-gallery-prev"
                  onClick={() => goTo((activeImg - 1 + allImages.length) % allImages.length, allImages.length)}
                  aria-label="Previous photo"
                >←</button>
                <button
                  className="proj-gallery-nav proj-gallery-next"
                  onClick={() => goTo((activeImg + 1) % allImages.length, allImages.length)}
                  aria-label="Next photo"
                >→</button>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {allImages.length > 1 && (
            <div className="proj-gallery-strip">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  className={'proj-thumb ' + (activeImg === i ? 'active' : '')}
                  onClick={() => goTo(i, allImages.length)}
                  aria-label={`View photo ${i + 1}`}
                >
                  <img src={sized(img.src, 'thumb')} alt={img.alt || ''} loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — info (scrolls) */}
        <div className="proj-info-col">
          <span className={'chip cat-' + category} style={{ marginBottom: 14, display: 'inline-flex' }}>
            {norm}
          </span>

          <h1 className="proj-title">{project.header}</h1>

          <div className="proj-meta-chips">
            {project.location && <span className="proj-meta-chip">📍 {project.location}</span>}
            {project.workshop_date && <span className="proj-meta-chip">{formatDate(project.workshop_date)}</span>}
            {project.volunteers != null && (
              <span className="proj-meta-chip">
                {/* the count itself is the link — these are real people you can find */}
                <Link to="/members" style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1px dashed var(--line-2)' }}>{project.volunteers}</Link> volunteers
              </span>
            )}
          </div>

          {/* Key stat — huge pull-quote */}
          {project.key_statistic && (
            <div className="proj-stat-pull" style={{ color: accentColor }}>
              {project.key_statistic}
            </div>
          )}

          {/* Summary */}
          {project.short_summary && (
            <p className="proj-summary">{project.short_summary}</p>
          )}

          {/* Partner + photos link */}
          {(project.collab_name || project.google_drive_link) && (
            <div className="row gap-2 flex-wrap" style={{ margin: '0 0 28px' }}>
              {project.collab_name && (
                <div className="card" style={{ padding: '10px 14px', display: 'inline-flex', gap: 10, alignItems: 'center' }}>
                  <span className="mono xs upper muted" style={{ fontWeight: 700 }}>partner</span>
                  {project.collab_logo && (
                    <img
                      src={project.collab_logo}
                      alt={project.collab_name}
                      style={{
                        height: 24, width: 'auto', maxWidth: 80,
                        objectFit: 'contain', display: 'block',
                        outline: '1px solid rgba(0,0,0,0.1)',
                        outlineOffset: -1,
                        borderRadius: 4,
                      }}
                    />
                  )}
                  <Link
                    to={`/projects?q=${encodeURIComponent(project.collab_name)}`}
                    style={{ fontWeight: 700, fontSize: 14, color: 'var(--mint)', textDecoration: 'none' }}
                  >
                    {project.collab_name}
                  </Link>
                </div>
              )}
              {project.google_drive_link && (
                <a href={project.google_drive_link} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                  view photos ↗
                </a>
              )}
            </div>
          )}

          {/* Long writeup */}
          {writeupParagraphs.length > 0 && (
            <div className="proj-writeup">
              {writeupParagraphs.map((para, i) => <p key={i}>{para}</p>)}
            </div>
          )}
        </div>
      </div>

      {/* ── Quiet bridge: "you read what we did" → "here's how to be part of it" ── */}
      <div className="container" style={{ padding: '4px var(--page-px,16px) clamp(28px,4vw,40px)' }}>
        <Link to="/volunteer" className="aq-thread-link" style={{ letterSpacing: '0.04em' }}>
          {OBJECTIVE_BRIDGE[norm] || 'this is what AquaTerra does →'}
        </Link>
      </div>

      {/* ── SIMILAR PROJECTS ── */}
      {related.length > 0 && (
        <div style={{
          borderTop: '2px solid var(--ink)',
          padding: 'clamp(32px,5vw,56px) 0 0',
          marginTop: 'clamp(32px,5vw,48px)',
        }}>
          <div className="container">
            {/* Section label */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <span className="sticker sticker-mint" style={{ display: 'inline-flex', fontSize: 10, marginBottom: 10 }}>
                  ★ MORE LIKE THIS
                </span>
                <h2 className="h-display" style={{ fontSize: 'clamp(28px,4vw,42px)', margin: 0, lineHeight: 0.95 }}>
                  similar <span style={{ fontStyle: 'italic', fontFamily: 'var(--serif)', fontWeight: 400, color: accentColor }}>projects.</span>
                </h2>
              </div>
              <Link to="/projects" className="btn btn-sm btn-ghost" style={{ flexShrink: 0 }}>
                all projects →
              </Link>
            </div>

            {/* Ticket grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 16,
              paddingBottom: 'clamp(32px,5vw,60px)',
            }}>
              {related.map(r => {
                const rNorm = normalizeObj(r.objective)
                const rColor = OBJ_COLORS[rNorm] || OBJ_COLORS['Others']
                return (
                  <Link
                    key={r.slug}
                    to={`/projects/${r.slug}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{
                      border: '2px solid var(--ink)',
                      borderRadius: 18,
                      overflow: 'hidden',
                      background: 'var(--card)',
                      boxShadow: '3px 3px 0 0 var(--ink)',
                      transition: 'transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s',
                      cursor: 'pointer',
                    }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '5px 7px 0 0 var(--ink)' }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = '3px 3px 0 0 var(--ink)' }}
                    >
                      {/* Image */}
                      {r.main_image ? (
                        <div style={{ aspectRatio: '4/3', overflow: 'hidden' }}>
                          <img
                            src={sized(r.main_image, 'card')}
                            alt={r.main_image_alt || r.header}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      ) : (
                        <div style={{ aspectRatio: '4/3', background: rColor + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 32, color: rColor, opacity: 0.5 }}>{rNorm[0]}</span>
                        </div>
                      )}

                      {/* Content */}
                      <div style={{ padding: '14px 16px 16px' }}>
                        {/* Category tag */}
                        <span style={{
                          fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                          color: rColor, display: 'block', marginBottom: 6,
                        }}>
                          {rNorm}
                        </span>
                        {/* Title */}
                        <div style={{
                          fontFamily: 'var(--display)', fontWeight: 800, fontSize: 15,
                          lineHeight: 1.2, color: 'var(--ink)', marginBottom: 8,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                          overflow: 'hidden',
                        }}>
                          {r.header}
                        </div>
                        {/* Meta row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          {r.location && (
                            <span className="mono xs muted">📍 {r.location}</span>
                          )}
                          {r.volunteers != null && (
                            <span className="mono xs muted" style={{ fontVariantNumeric: 'tabular-nums' }}>{r.volunteers} vol.</span>
                          )}
                          {r.key_statistic && (
                            <span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 12, color: rColor, marginLeft: 'auto' }}>
                              {r.key_statistic}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── CTA ── */}
      <div className="container" style={{ padding: '0 16px 80px' }}>
        <div className="card" style={{ padding: 'clamp(28px, 5vw, 48px) clamp(20px, 4vw, 36px)', background: 'var(--ink)', color: 'var(--bg)', textAlign: 'center' }}>
          <div className="h-display" style={{ fontSize: 'clamp(28px, 6vw, 44px)', lineHeight: 0.95, marginBottom: 12 }}>
            want to be<br />part of the next one<span style={{ color: 'var(--mint)' }}>?</span>
          </div>
          <p style={{ fontSize: 15, opacity: 0.75, marginBottom: 20, maxWidth: 380, margin: '0 auto 20px' }}>
            welfare drives happen regularly. join AquaTerra to get notified and show up.
          </p>
          <div className="row gap-2" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/recruitment" className="btn btn-primary">Come do the work with us</Link>
            <Link to="/projects" className="btn" style={{ background: 'transparent', color: 'var(--bg)' }}>browse all projects</Link>
          </div>
        </div>
      </div>

      <style>{`
        /* ─── PROJECT DETAIL — mobile-first ─── */

        /* ─── TWO-COLUMN LAYOUT ─── */
        .proj-layout {
          max-width: 1240px; margin: 0 auto;
          padding: 18px var(--page-px, 16px) 0;
        }
        @media (min-width: 980px) {
          .proj-layout {
            display: grid;
            grid-template-columns: minmax(0, 1.04fr) minmax(0, 0.96fr);
            gap: clamp(28px, 4vw, 56px);
            align-items: start;
            padding-top: 24px;
          }
          /* sticky media — stays in view while the info column scrolls */
          .proj-media-col {
            position: sticky;
            top: calc(var(--nav-h) + 20px);
          }
        }
        .proj-media-col { min-width: 0; }
        .proj-info-col { min-width: 0; }
        @media (max-width: 979px) {
          .proj-info-col { padding-top: 24px; }
        }

        /* Media viewer — concentric: 2px border + 20px outer radius, image
           clipped to match via overflow:hidden. Drops to 18px on mobile. */
        .proj-viewer {
          position: relative;
          border: 2px solid var(--ink);
          border-radius: 20px;
          overflow: hidden;
          background: var(--bg-2);
          aspect-ratio: 4 / 3;
          box-shadow: 4px 5px 0 0 var(--ink);
        }
        .proj-viewer > img {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
        }
        .proj-viewer-ph { width: 100%; height: 100%; display: grid; place-items: center; }
        .proj-media-col .proj-gallery-strip { margin-top: 10px; margin-bottom: 0; }
        @media (max-width: 979px) {
          .proj-viewer { border-radius: 18px; box-shadow: 3px 4px 0 0 var(--ink); }
        }

        /* Info column */
        .proj-title {
          font-family: var(--display); font-weight: 900;
          font-size: clamp(30px, 4.4vw, 56px);
          line-height: 0.96; letter-spacing: -0.03em;
          color: var(--ink); margin: 0 0 16px; text-wrap: balance;
        }
        .proj-meta-chips { display: flex; gap: 8px; flex-wrap: wrap; margin: 0 0 26px; }
        .proj-meta-chip {
          font-family: var(--mono); font-size: 11px; font-weight: 600;
          color: var(--ink-2);
          background: var(--bg-2);
          border: 1.5px solid var(--line);
          padding: 5px 11px; border-radius: 999px;
          letter-spacing: 0.02em;
        }

        .proj-stat-pull {
          font-family: var(--display);
          font-weight: 800;
          font-size: clamp(38px, 9vw, 72px);
          line-height: 0.95;
          letter-spacing: -0.04em;
          margin: 0 0 22px;
          font-family: var(--eina);
        }

        .proj-summary {
          font-family: var(--eina);
          font-size: clamp(17px, 2.5vw, 22px);
          line-height: 1.55;
          font-weight: 500;
          color: var(--ink);
          margin: 0 0 28px;
        }

        .proj-writeup {
          font-family: var(--eina);
          margin-bottom: 40px;
        }
        .proj-writeup p {
          font-family: var(--eina);
          font-size: 16px;
          line-height: 1.75;
          color: var(--ink-2);
          margin: 0 0 18px;
        }

        /* ─── GALLERY ─── */
        .proj-gallery { margin-bottom: 40px; }

        .proj-gallery-strip {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 8px;
          margin-bottom: 8px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          overscroll-behavior-x: none;
        }
        .proj-gallery-strip::-webkit-scrollbar { display: none; }

        .proj-thumb {
          width: 64px; height: 64px;
          flex-shrink: 0;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid transparent;
          transition: border-color 0.15s, transform 0.15s;
          cursor: pointer;
          padding: 0;
          background: none;
        }
        .proj-thumb.active {
          border-color: var(--ink);
          transform: scale(1.05);
        }
        .proj-thumb img {
          width: 100%; height: 100%; object-fit: cover;
        }

        .proj-gallery-main {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          background: var(--bg-2);
          border: 2px solid var(--ink);
          aspect-ratio: 16/10;
        }
        .proj-gallery-main img {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
        }
        .proj-gallery-caption {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 12px 14px;
          font-size: 12px;
          font-weight: 600;
          color: rgba(255,255,255,0.92);
          background: linear-gradient(transparent, rgba(0,0,0,0.65));
          letter-spacing: -0.01em;
        }
        .proj-gallery-counter {
          position: absolute; top: 10px; left: 10px;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(6px);
          color: rgba(255,255,255,0.85);
          font-family: var(--mono); font-size: 10px; font-weight: 700;
          padding: 3px 8px; border-radius: 999px;
        }
        .proj-gallery-nav {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 40px; height: 40px;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(8px);
          color: #fff;
          border: none; border-radius: 50%; cursor: pointer;
          font-size: 18px; display: grid; place-items: center;
          transition: background 0.15s, transform 0.15s;
        }
        .proj-gallery-nav:hover { background: rgba(0,0,0,0.7); }
        .proj-gallery-nav:active { transform: translateY(-50%) scale(0.96); }
        .proj-gallery-prev { left: 10px; }
        .proj-gallery-next { right: 10px; }

        .proj-single-img {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          border: 2px solid var(--ink);
          margin-bottom: 40px;
        }
        .proj-single-img img { width: 100%; display: block; }

        /* ─── RELATED ─── */
        .proj-related {
          padding: 40px 0 48px;
          border-top: 2px solid var(--ink);
          margin-top: 40px;
        }
        .proj-related-scroll {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 14px;
        }
        @media (max-width: 640px) {
          .proj-related-scroll {
            display: flex;
            gap: 12px;
            overflow-x: auto;
            padding-bottom: 8px;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior-x: none;
            scrollbar-width: none;
          }
          .proj-related-scroll::-webkit-scrollbar { display: none; }
        }
        .proj-related-card {
          background: var(--card);
          border: 2px solid var(--ink);
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          min-width: 200px;
          transition: transform 0.15s;
          color: var(--ink);
        }
        @media (max-width: 640px) {
          .proj-related-card { min-width: 200px; flex-shrink: 0; }
        }
        .proj-related-card:hover { transform: translateY(-3px); }
        .proj-related-img {
          aspect-ratio: 16/10; overflow: hidden;
          border-bottom: 2px solid var(--ink);
        }
        .proj-related-img img { width: 100%; height: 100%; object-fit: cover; }
        .proj-related-placeholder { display: grid; place-items: center; }
        .proj-related-body { padding: 14px 16px 16px; }

        /* ─── Slideshow progress bar ─── */
        .proj-progress-bar {
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 3px; background: rgba(255,255,255,0.18);
          pointer-events: none;
        }
        .proj-progress-fill {
          height: 100%;
          background: rgba(255,255,255,0.82);
          animation: proj-progress linear forwards;
          width: 0%;
        }
        @keyframes proj-progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
        /* Visible chip stays at ~28px so it doesn't crowd the photo, but
           a transparent ::before pseudo extends the hit target to 44×44
           (touch-target floor). The pseudo is positioned outside the
           visible chip so click-through reaches the real button. */
        .proj-gallery-playpause {
          position: absolute; bottom: 10px; right: 10px; z-index: 3;
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          color: rgba(255,255,255,0.85);
          border: none; cursor: pointer; font-size: 10px;
          display: grid; place-items: center;
          transition: background 0.15s;
        }
        .proj-gallery-playpause::before {
          content: ''; position: absolute; inset: -8px;
        }
        .proj-gallery-playpause:hover { background: rgba(0,0,0,0.7); }
      `}</style>
    </div>
  )
}
