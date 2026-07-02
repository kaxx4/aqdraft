import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, FilmStrip, LinkRow, MediumBadge, slideSrc } from './Shared'

const PARTS = [
  { label: 'ESP32', note: 'the brain' },
  { label: 'FSR', note: 'pressure pad' },
  { label: 'OLED', note: 'the screen' },
  { label: '200×200mm', note: 'the board' },
]
const GAMES = ['Hoops Blitz', 'Flappy Press', 'Stack', 'Rhythm Tap', 'Reaction Rush']

function Typewriter({ text, mood }: { text: string; mood: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!inView) return
    const id = setInterval(() => {
      setN(v => {
        if (v >= text.length) { clearInterval(id); return v }
        return v + 1
      })
    }, 26)
    return () => clearInterval(id)
  }, [inView, text])
  return (
    <p ref={ref} style={{ fontFamily: 'var(--mono)', fontSize: 'clamp(15px,2vw,19px)', color: '#EDEDED', lineHeight: 1.6, minHeight: '3.2em' }}>
      {text.slice(0, n)}
      <span style={{ color: mood, animation: 'aql-caret 0.9s steps(1) infinite' }}>▍</span>
    </p>
  )
}

// Chapter 03 — Execution Pending. A black-on-black schematic room. The
// team's own slide is shown clean (nothing overlaid on top of it — it
// already carries its own copy) with the hardware spec sheet sitting
// underneath, like a parts list under a photo, not stamped over it.
export default function Chapter03ExecutionPending({ team }: { team: AQLabsTeam }) {
  return (
    <section id={team.slug} style={{ background: '#000', padding: '110px 24px', position: 'relative' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <ChapterEyebrow team={team} dark />
        <MediumBadge team={team} dark />
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="h-display"
          style={{ fontSize: 'clamp(36px,5.4vw,64px)', color: '#fff', textAlign: 'center' }}
        >
          {team.projectName}<span style={{ color: team.mood }}>_</span>
        </motion.h2>
        <p style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 13, color: team.mood, margin: '10px 0 40px', letterSpacing: '0.04em' }}>
          {team.tagline}
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          style={{
            maxWidth: 420, margin: '0 auto 18px', border: `1.5px solid ${team.mood}55`, borderRadius: 18,
            overflow: 'hidden', boxShadow: `0 0 60px ${team.mood}22`,
          }}
        >
          <img src={slideSrc(team.slug, team.heroSlide)} alt={`${team.projectName} — from the team's own deck`}
            loading="lazy" decoding="async" style={{ width: '100%', display: 'block' }} />
        </motion.div>

        {/* spec sheet — sits below the slide, never on top of it */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 700, margin: '0 auto 40px' }}>
          {PARTS.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              style={{
                background: '#0A0A0A', border: `1px solid ${team.mood}55`, borderRadius: 10,
                padding: '8px 14px', fontFamily: 'var(--mono)', fontSize: 11.5,
              }}
            >
              <span style={{ color: team.mood, fontWeight: 700 }}>{p.label}</span>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}> · {p.note}</span>
            </motion.div>
          ))}
        </div>

        <Typewriter text={team.quote} mood={team.mood} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '24px 0 22px', fontFamily: 'var(--mono)', fontSize: 12.5, color: 'rgba(255,255,255,0.6)' }}>
          {team.storyBeats.map((b, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
            >
              <span style={{ color: team.mood }}>{'>'}</span> {b}
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 26 }}>
          {GAMES.map(g => (
            <span key={g} style={{
              fontFamily: 'var(--mono)', fontSize: 11, color: '#fff', background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.14)', borderRadius: 999, padding: '5px 11px',
            }}>{g}</span>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <LinkRow links={team.links} dark mood={team.mood} />
          <CopyLinkButton slug={team.slug} dark mood={team.mood} />
        </div>
        <FilmStrip team={team} dark />
      </div>

      <style>{`
        @keyframes aql-caret { 50% { opacity: 0; } }
      `}</style>
    </section>
  )
}
