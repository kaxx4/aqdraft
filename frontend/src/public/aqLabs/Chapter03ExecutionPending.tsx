import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, LinkRow, MediumBadge, MeaningLine, Narrative, processSrc } from './Shared'

const GAMES = ['Hoops Blitz', 'Flappy Press', 'Stack', 'Rhythm Tap', 'Reaction Rush']

// Chapter 03 — Execution Pending. The workbench: the breadboard photo
// parallax-drifts slower than the page — like it's sitting further back
// on the desk than everything typed over it — and boots in with a CRT
// power-on flicker instead of a plain fade.
export default function Chapter03ExecutionPending({ team }: { team: AQLabsTeam }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])

  return (
    <section id={team.slug} style={{ background: '#000', position: 'relative' }}>
      <div ref={ref} style={{ position: 'relative', minHeight: '78vh', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.4, 1] }}
          transition={{ duration: 0.7, times: [0, 0.4, 0.55, 1] }}
          style={{ position: 'absolute', inset: 0, y: imgY }}
        >
          <img
            src={processSrc(team.slug, '01-breadboard-esp32-1am.jpeg')}
            alt="ESP32, OLED and pressure-pad module hand-wired on a breadboard, 1:02 AM"
            style={{ width: '100%', height: '124%', objectFit: 'cover', objectPosition: '35% 45%', filter: 'brightness(0.55) contrast(1.05)' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #000 5%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.55) 100%)' }} />
        </motion.div>

        <div style={{ position: 'relative', maxWidth: 1000, margin: '0 auto', padding: '160px 24px 48px', width: '100%' }}>
          <ChapterEyebrow team={team} dark />
          <MediumBadge team={team} dark />
          <motion.h2
            initial={{ opacity: 0, letterSpacing: '0.3em' }}
            animate={{ opacity: 1, letterSpacing: '0em' }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="h-display"
            style={{ fontSize: 'clamp(40px,7vw,84px)', color: '#fff' }}
          >
            {team.projectName}<span style={{ color: team.mood }}>_</span>
          </motion.h2>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 12.5, color: team.mood, letterSpacing: '0.04em' }}>
            1:02 AM · a kitchen counter · the first working build
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '56px 24px 110px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 40, alignItems: 'start' }} className="aql-quirk-grid">
          <div>
            <Narrative team={team} dark />
            <MeaningLine team={team} dark />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>
              five games, live today
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 26 }}>
              {GAMES.map((g, i) => (
                <motion.span
                  key={g}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 + i * 0.07 }}
                  style={{
                    fontFamily: 'var(--mono)', fontSize: 11, color: '#fff', background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.14)', borderRadius: 999, padding: '5px 11px',
                  }}
                >{g}</motion.span>
              ))}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12.5, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
              ESP32 · the brain<br />FSR · the pressure pad<br />OLED · the screen<br />200×200mm · the board
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', margin: '36px 0 6px' }}>
          <LinkRow links={team.links} dark mood={team.mood} />
          <CopyLinkButton slug={team.slug} dark mood={team.mood} />
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .aql-quirk-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
