import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMeta } from '../hooks/useMeta'
import { pageMetadata } from '../lib/metaConfig'
import { AQ_LABS_TEAMS } from './aqLabs/data'
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

function Hero() {
  return (
    <section style={{
      background: '#0A0A0A', color: '#fff', padding: '120px 24px 90px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div aria-hidden style={{
        position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '54px 54px',
      }} />
      <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', textAlign: 'center' }}>
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
          style={{ fontSize: 'clamp(15px,2vw,19px)', color: 'rgba(255,255,255,0.68)', maxWidth: 620, margin: '22px auto 0', lineHeight: 1.6 }}
        >
          Seven teams. Seven ideas that didn't exist six weeks ago. This is the room where
          AquaTerra hands its members the trust, the time and the resources to go build
          something real — and this is where that work finally gets seen.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.45 }}
          style={{ display: 'flex', gap: 28, justifyContent: 'center', marginTop: 42, flexWrap: 'wrap' }}
        >
          {[['7', 'teams shipped'], ['35', 'slides of process'], ['1', 'gallery, all yours']].map(([n, l]) => (
            <div key={l as string}>
              <div className="h-display" style={{ fontSize: 30, color: 'var(--mint)' }}>{n}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function Manifesto() {
  return (
    <section style={{ background: 'var(--bg)', padding: '86px 24px 60px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <p style={{
          fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(22px,3.4vw,32px)',
          color: 'var(--ink)', lineHeight: 1.35, marginBottom: 20,
        }}>
          This isn't a project directory. It's a gallery — and every room in it was built
          by someone who, six weeks ago, had nothing but an idea and a Sunday afternoon.
        </p>
        <p style={{ fontSize: 14.5, color: 'var(--txt-3)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
          AQ Labs is AquaTerra's innovation track: real teams, real budgets, real deadlines,
          and a stage at the end of it. No professor grading a submission — an audience, a
          published page, and a link members can put on their own CV. Scroll through what
          seven teams shipped this cycle, chapter by chapter.
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 900, margin: '36px auto 0' }}>
        {AQ_LABS_TEAMS.map(t => (
          <a
            key={t.slug}
            href={`#${t.slug}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, textDecoration: 'none',
              padding: '8px 14px', borderRadius: 999, border: '1.5px solid var(--line-2)',
              fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--ink-2)', fontWeight: 700,
            }}
          >
            <span style={{ color: t.mood }}>{t.chapter}</span> {t.projectName}
          </a>
        ))}
      </div>
    </section>
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
      <Manifesto />
      {AQ_LABS_TEAMS.map((team, i) => {
        const ChapterComponent = CHAPTERS[i]
        return <ChapterComponent key={team.slug} team={team} />
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
