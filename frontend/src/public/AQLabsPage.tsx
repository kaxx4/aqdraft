import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMeta } from '../hooks/useMeta'
import { pageMetadata } from '../lib/metaConfig'
import { AQ_LABS_TEAMS, type AQLabsTeam } from './aqLabs/data'
import { processSrc } from './aqLabs/Shared'
import Chapter01Karyaarth from './aqLabs/Chapter01Karyaarth'
import Chapter02MergeConflicts from './aqLabs/Chapter02MergeConflicts'
import Chapter03ExecutionPending from './aqLabs/Chapter03ExecutionPending'
import Chapter04AlterEgo from './aqLabs/Chapter04AlterEgo'
import Chapter05IdeaArchitects from './aqLabs/Chapter05IdeaArchitects'
import Chapter06ZeroToDeploy from './aqLabs/Chapter06ZeroToDeploy'
import Chapter07IdeaNotFound from './aqLabs/Chapter07IdeaNotFound'

const CHAPTERS = [
  Chapter01Karyaarth,
  Chapter02MergeConflicts,
  Chapter03ExecutionPending,
  Chapter04AlterEgo,
  Chapter05IdeaArchitects,
  Chapter06ZeroToDeploy,
  Chapter07IdeaNotFound,
]

function useHashScrollOnMount() {
  useEffect(() => {
    if (!window.location.hash) return
    const id = window.location.hash.slice(1)
    const t = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 160)
    return () => clearTimeout(t)
  }, [])
}

// A scattered wall of real photographs — actual screens and shots pulled
// from all seven teams — so the very first thing a visitor sees is proof,
// not a promise. Each card links straight down to its chapter.
const HERO_WALL: { slug: string; file: string; alt: string; rotate: number; top: string; side: 'left' | 'right'; offset: string; size: number }[] = [
  { slug: 'karyaarth', file: '08-graded-icecream-vendor-portrait.jpg', alt: 'Karyaarth', rotate: -6, top: '6%', side: 'left', offset: '2%', size: 152 },
  { slug: 'merge-conflicts', file: '02-live-site-landing.jpg', alt: 'Merge Conflicts', rotate: 4, top: '46%', side: 'left', offset: '8%', size: 138 },
  { slug: 'execution-pending', file: '02-meet-quirk-live-site.png', alt: 'Execution Pending', rotate: -3, top: '76%', side: 'left', offset: '1%', size: 168 },
  { slug: 'alter-ego', file: '03-world-explorer-quiz.png', alt: 'Alter Ego', rotate: 7, top: '10%', side: 'right', offset: '3%', size: 158 },
  { slug: 'idea-architects', file: '02-cirqle-categories-infographic.jpg', alt: 'Idea Architects', rotate: -5, top: '48%', side: 'right', offset: '10%', size: 140 },
  { slug: 'zero-to-deploy', file: '02-hunar-live-homepage.png', alt: 'Zero to Deploy', rotate: 5, top: '78%', side: 'right', offset: '0%', size: 170 },
]

function Hero() {
  return (
    <section style={{
      background: '#0A0A0A', color: '#fff', padding: '110px 24px 80px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div aria-hidden style={{
        position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '54px 54px',
      }} />

      <div aria-hidden className="aql-hero-wall" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {HERO_WALL.map((p, i) => (
          <motion.a
            key={p.slug}
            href={`#${p.slug}`}
            aria-hidden
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.8, rotate: p.rotate * 2 }}
            animate={{ opacity: 1, scale: 1, rotate: p.rotate }}
            transition={{ duration: 0.6, delay: 0.15 + i * 0.06, ease: [0.2, 0, 0, 1] }}
            style={{
              position: 'absolute', top: p.top, [p.side]: p.offset,
              width: p.size, pointerEvents: 'auto', display: 'block',
              borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.14)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
            }}
          >
            <img src={processSrc(p.slug, p.file)} alt={p.alt} loading="eager" decoding="async"
              style={{ width: '100%', display: 'block', aspectRatio: '4/3', objectFit: 'cover', filter: 'brightness(0.8)' }} />
          </motion.a>
        ))}
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 26,
            background: 'var(--mint)', color: '#0A0A0A', borderRadius: 999, padding: '6px 14px',
            fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 11.5, letterSpacing: '0.06em',
            transform: 'rotate(-2deg)',
          }}
        >
          ★ AQ LABS '26 · SHOWCASE
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
          className="h-display"
          style={{ fontSize: 'clamp(48px, 9vw, 108px)', lineHeight: 0.94 }}
        >
          AQ <span style={{ fontStyle: 'italic', fontFamily: 'var(--serif)', fontWeight: 400, color: 'var(--mint)' }}>Labs</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
          style={{ fontSize: 'clamp(15px,2vw,19px)', color: 'rgba(255,255,255,0.68)', maxWidth: 480, margin: '22px auto 0', lineHeight: 1.6 }}
        >
          Seven teams. Seven things that didn't exist six weeks ago — and now do.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.45 }}
          style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 34, flexWrap: 'wrap' }}
        >
          <a href="#aq-labs-index" className="btn btn-primary" style={{ background: 'var(--mint)', borderColor: 'var(--mint)', color: '#0A0A0A' }}>
            Walk the gallery ↓
          </a>
        </motion.div>
      </div>

      <style>{`
        .aql-hero-wall a { transition: transform 0.2s ease; }
        .aql-hero-wall a:hover { transform: scale(1.06) !important; z-index: 2; }
        @media (max-width: 900px) { .aql-hero-wall { display: none; } }
      `}</style>
    </section>
  )
}

// A navigation system that belongs to this page only — a 3D cylindrical
// carousel of the seven chapters, sticky under the global nav. Drag (or
// use the arrows) to spin the ring; whichever card faces front is "next
// up" — click it to jump straight to that chapter.
function ChapterCylinder() {
  const n = AQ_LABS_TEAMS.length
  const step = 360 / n
  const [rotation, setRotation] = useState(0)
  const [visible, setVisible] = useState(false)
  const dragState = useRef<{ startX: number; startRotation: number } | null>(null)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const spin = (dir: number) => setRotation(r => r + dir * step)

  const onPointerDown = (e: React.PointerEvent) => {
    dragState.current = { startX: e.clientX, startRotation: rotation }
    setDragging(true)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current) return
    const dx = e.clientX - dragState.current.startX
    setRotation(dragState.current.startRotation + dx * 0.4)
  }
  const onPointerUp = () => { dragState.current = null; setDragging(false) }

  // Which card is closest to facing the viewer right now (front = 0deg).
  const frontIndex = (() => {
    const norm = ((-rotation % 360) + 360) % 360
    return Math.round(norm / step) % n
  })()

  const radius = 190

  return (
    <div
      className="aql-cyl-wrap"
      style={{
        position: 'sticky', top: 'var(--nav-h)', zIndex: 30,
        opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.2s ease',
        background: 'linear-gradient(to bottom, var(--bg) 55%, transparent)',
        padding: '14px 0 26px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <button className="aql-cyl-arrow" onClick={() => spin(-1)} aria-label="Spin left">‹</button>

        <div
          className="aql-cyl-stage"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{ cursor: dragging ? 'grabbing' : 'grab', touchAction: 'pan-y' }}
        >
          <div
            className="aql-cyl-ring"
            style={{ transform: `rotateY(${rotation}deg)`, transition: dragging ? 'none' : 'transform 0.4s cubic-bezier(0.2,0,0,1)' }}
          >
            {AQ_LABS_TEAMS.map((t, i) => (
              <a
                key={t.slug}
                href={`#${t.slug}`}
                onClick={e => { if (dragging) e.preventDefault() }}
                className={'aql-cyl-card' + (i === frontIndex ? ' is-front' : '')}
                style={{
                  transform: `rotateY(${i * step}deg) translateZ(${radius}px)`,
                  ['--card-mood' as string]: t.mood,
                }}
              >
                <span className="aql-cyl-idx">{t.chapter}</span>
                <span className="aql-cyl-name">{t.projectName}</span>
              </a>
            ))}
          </div>
        </div>

        <button className="aql-cyl-arrow" onClick={() => spin(1)} aria-label="Spin right">›</button>
      </div>

      <style>{`
        .aql-cyl-stage {
          width: 220px; height: 92px;
          perspective: 900px;
          display: flex; align-items: center; justify-content: center;
          user-select: none;
        }
        .aql-cyl-ring {
          position: relative; width: 148px; height: 68px;
          transform-style: preserve-3d;
        }
        .aql-cyl-card {
          position: absolute; inset: 0;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
          border-radius: 10px;
          background: var(--bg-3, #fff);
          border: 1px solid var(--line-2);
          text-decoration: none;
          backface-visibility: hidden;
          opacity: 0.55;
          transition: opacity 0.25s, background 0.25s, border-color 0.25s, box-shadow 0.25s;
        }
        .aql-cyl-idx {
          font-family: var(--mono); font-size: 9px; font-weight: 700; color: var(--ink-4);
        }
        .aql-cyl-name {
          font-family: var(--mono); font-size: 10.5px; font-weight: 700;
          letter-spacing: 0.03em; text-transform: uppercase; color: var(--ink-2);
        }
        .aql-cyl-card.is-front {
          opacity: 1;
          background: var(--card-mood);
          border-color: var(--card-mood);
          box-shadow: 0 10px 26px -8px rgba(0,0,0,0.35);
        }
        .aql-cyl-card.is-front .aql-cyl-idx { color: rgba(255,255,255,0.75); }
        .aql-cyl-card.is-front .aql-cyl-name { color: #fff; }
        .aql-cyl-arrow {
          width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
          border: 1px solid var(--line-2); background: var(--bg-3, #fff); color: var(--ink-3);
          font-size: 16px; line-height: 1; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, color 0.15s;
        }
        .aql-cyl-arrow:hover { background: var(--ink); color: var(--bg); }
        @media (max-width: 640px) {
          .aql-cyl-stage { width: 180px; }
        }
      `}</style>
    </div>
  )
}

function Manifesto() {
  return (
    <section style={{ background: 'var(--bg)', padding: '48px 24px 12px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
        <p style={{
          fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(19px,2.8vw,26px)',
          color: 'var(--ink)', lineHeight: 1.35, margin: 0,
        }}>
          Not a project directory — a gallery. Every room was built by someone who,
          six weeks ago, had nothing but an idea.
        </p>
      </div>
    </section>
  )
}

// The gallery index — a directory, not a scroll prompt. Pick a room; each
// one tells its own story and doesn't ask you to sit through the others
// first. This is the primary way anyone moves through the page.
function GalleryIndex() {
  return (
    <section id="aq-labs-index" style={{ background: 'var(--bg)', padding: '50px 24px 110px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-4)' }}>
            the gallery — seven rooms
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-4)' }}>
            pick any room, in any order
          </div>
        </div>
        <div style={{ borderTop: '1.5px solid var(--ink)' }}>
          {AQ_LABS_TEAMS.map(t => (
            <a
              key={t.slug}
              href={`#${t.slug}`}
              className="aql-index-row"
              style={{
                display: 'flex', alignItems: 'center', gap: 20, padding: '20px 4px',
                textDecoration: 'none', color: 'inherit', borderBottom: '1.5px solid var(--line)',
                position: 'relative', overflow: 'hidden',
              }}
            >
              <span
                aria-hidden
                className="aql-index-wash"
                style={{ position: 'absolute', inset: 0, background: t.mood, opacity: 0, transition: 'opacity 0.25s' }}
              />
              <span
                className="h-display"
                style={{ position: 'relative', fontSize: 'clamp(20px,3vw,28px)', color: t.mood, width: 44, flexShrink: 0 }}
              >
                {t.chapter}
              </span>
              <span style={{ position: 'relative', flex: 1, minWidth: 0 }}>
                <span className="h-display" style={{ fontSize: 'clamp(18px,2.6vw,24px)', color: 'var(--ink)', display: 'block' }}>
                  {t.projectName}
                </span>
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--ink-4)', textTransform: 'uppercase',
                  letterSpacing: '0.04em', display: 'block', marginTop: 2,
                }}>
                  {t.teamName} · {t.category}
                </span>
              </span>
              <span
                className="aql-index-hook"
                style={{
                  position: 'relative', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14,
                  color: 'var(--txt-3)', maxWidth: 260, textAlign: 'right', display: 'none',
                }}
              >
                {t.tagline}
              </span>
              <span className="aql-index-arrow" style={{ position: 'relative', fontSize: 18, color: t.mood, flexShrink: 0 }}>
                →
              </span>
            </a>
          ))}
        </div>
      </div>

      <style>{`
        .aql-index-row:hover .aql-index-wash { opacity: 0.06; }
        .aql-index-row .aql-index-arrow { transform: translateX(-4px); opacity: 0; transition: transform 0.2s, opacity 0.2s; }
        .aql-index-row:hover .aql-index-arrow { transform: translateX(0); opacity: 1; }
        @media (min-width: 780px) {
          .aql-index-hook { display: block !important; }
        }
      `}</style>
    </section>
  )
}

// A hard cut between rooms — a beat of pure colour and a number, nothing
// else. Every chapter otherwise runs straight into the next section's
// content; this forces a full stop so consecutive chapters read as two
// different rooms instead of one continuous scroll.
function ChapterSeam({ team }: { team: AQLabsTeam }) {
  const flip = Number(team.chapter) % 2 === 0
  return (
    <div aria-hidden style={{
      background: team.mood, height: 72, display: 'flex', alignItems: 'center',
      justifyContent: flip ? 'flex-start' : 'flex-end', padding: '0 28px',
      clipPath: flip ? 'polygon(0 0,100% 0,100% 100%,0 60%)' : 'polygon(0 0,100% 0,100% 60%,0 100%)',
    }}>
      <span style={{
        fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
        textTransform: 'uppercase', color: 'rgba(0,0,0,0.55)',
      }}>
        end of chapter {team.chapter}
      </span>
    </div>
  )
}

function Finale() {
  return (
    <section style={{ background: 'var(--ink)', color: '#fff', padding: '110px 24px', textAlign: 'center' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mint)', marginBottom: 16 }}>
          chapter 08 — yours
        </div>
        <h2 className="h-display" style={{ fontSize: 'clamp(32px,5vw,52px)', marginBottom: 18 }}>
          write the next one.
        </h2>
        <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,0.68)', lineHeight: 1.7, marginBottom: 32 }}>
          Every team on this page started as three people, a Discord channel and an idea
          nobody had funded yet. AquaTerra gave them the room, the resources, and the
          recognition to finish it — and put it here, permanently, with a link they can
          hand to anyone who asks what they've built.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/recruitment" className="btn btn-primary btn-lg">Apply to AQ Labs →</Link>
          <Link to="/about" className="btn btn-lg" style={{ background: 'transparent', border: '1.5px solid rgba(255,255,255,0.25)', color: '#fff' }}>
            More about AquaTerra
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function AQLabsPage() {
  useMeta(pageMetadata.aqLabs)
  useHashScrollOnMount()
  const [showJump, setShowJump] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowJump(window.scrollY > 900)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div>
      <Hero />
      <ChapterCylinder />
      <Manifesto />
      <GalleryIndex />
      {AQ_LABS_TEAMS.map((team, i) => {
        const ChapterComponent = CHAPTERS[i]
        return (
          <div key={team.slug}>
            <ChapterComponent team={team} />
            <ChapterSeam team={team} />
          </div>
        )
      })}
      <Finale />

      {showJump && (
        <a
          href="#top"
          onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          style={{
            position: 'fixed', bottom: 24, right: 20, zIndex: 40,
            width: 44, height: 44, borderRadius: '50%', background: 'var(--mint)', color: '#0A0A0A',
            display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
            boxShadow: '0 8px 22px rgba(0,0,0,0.25)',
          }}
          aria-label="Back to top"
          title="Back to top"
        >
          ↑
        </a>
      )}
    </div>
  )
}
