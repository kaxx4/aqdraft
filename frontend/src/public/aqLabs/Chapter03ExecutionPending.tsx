import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, LinkRow, slideSrc } from './Shared'

const PARTS = [
  { label: 'ESP32', note: 'the brain', pos: { top: '4%', left: '2%' } },
  { label: 'FSR', note: 'pressure pad', pos: { top: '4%', right: '2%' } },
  { label: 'OLED', note: 'the screen', pos: { bottom: '4%', left: '2%' } },
  { label: '200×200mm', note: 'the board', pos: { bottom: '4%', right: '2%' } },
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

// Chapter 03 — Execution Pending. A black-on-black schematic room: the
// console mockup sits center-stage, ringed by labeled hardware callouts,
// with the tagline typed out live like a terminal boot log.
export default function Chapter03ExecutionPending({ team }: { team: AQLabsTeam }) {
  return (
    <section id={team.slug} style={{ background: '#000', padding: '110px 24px', position: 'relative' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <ChapterEyebrow team={team} dark />
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="h-display"
          style={{ fontSize: 'clamp(36px,5.4vw,64px)', color: '#fff', textAlign: 'center' }}
        >
          {team.projectName}<span style={{ color: team.mood }}>_</span>
        </motion.h2>
        <p style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 13, color: team.mood, margin: '10px 0 40px', letterSpacing: '0.04em' }}>
          {team.tagline}
        </p>

        <div style={{ position: 'relative', maxWidth: 460, margin: '0 auto 40px' }} className="aql-schematic">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            style={{ border: `1.5px solid ${team.mood}55`, borderRadius: 18, overflow: 'hidden', boxShadow: `0 0 60px ${team.mood}22` }}
          >
            <img src={slideSrc(team.slug, 2)} alt={`${team.projectName} hardware`} loading="lazy" decoding="async"
              style={{ width: '100%', display: 'block', aspectRatio: '4/5', objectFit: 'cover' }} />
          </motion.div>
          {PARTS.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.12 }}
              style={{
                position: 'absolute', ...p.pos,
                background: '#000', border: `1px solid ${team.mood}`, borderRadius: 8,
                padding: '5px 9px', fontFamily: 'var(--mono)', fontSize: 10.5,
              }}
              className="aql-part-chip"
            >
              <div style={{ color: team.mood, fontWeight: 700 }}>{p.label}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)' }}>{p.note}</div>
            </motion.div>
          ))}
        </div>

        <Typewriter text={team.quote} mood={team.mood} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '24px 0 22px', fontFamily: 'var(--mono)', fontSize: 12.5, color: 'rgba(255,255,255,0.6)' }}>
          {team.storyBeats.map((b, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
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
      </div>

      <style>{`
        @keyframes aql-caret { 50% { opacity: 0; } }
        @media (max-width: 560px) {
          .aql-part-chip { display: none; }
        }
      `}</style>
    </section>
  )
}
