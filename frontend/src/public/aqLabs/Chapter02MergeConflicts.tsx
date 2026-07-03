import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, CountTo, LinkRow, MediumBadge, MeaningLine, Narrative, Plate, processSrc } from './Shared'

const STATS: { value: number; decimals?: number; prefix?: string; suffix: string; label: string }[] = [
  { value: 1.5, decimals: 1, suffix: ' Cr', label: 'higher-ed grads, every year' },
  { value: 42.6, decimals: 1, suffix: '%', label: 'considered employable' },
  { value: 25, suffix: '%', label: 'digital talent gap' },
  { value: 25, suffix: ' L', label: 'skilled people emigrate yearly' },
]

const slam = { type: 'spring' as const, stiffness: 340, damping: 16 }

// Chapter 02 — Merge Conflicts. The situation room: the numbers don't
// fade in, they slam in — overshoot scale, a flash of the mood colour
// behind each card — like a headline hitting a newsroom screen. A scan-
// line sweeps the live-site screenshot once the room comes into view.
export default function Chapter02MergeConflicts({ team }: { team: AQLabsTeam }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const scanY = useTransform(scrollYProgress, [0.15, 0.55], ['-10%', '110%'])

  return (
    <section id={team.slug} ref={ref} style={{ background: '#0A0A0A', padding: '110px 24px', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{
        position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none',
        backgroundImage: `repeating-linear-gradient(90deg, ${team.mood} 0 2px, transparent 2px 48px)`,
      }} />
      <div style={{ maxWidth: 1080, margin: '0 auto', position: 'relative' }}>
        <ChapterEyebrow team={team} dark />
        <MediumBadge team={team} dark />
        <motion.h2
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="h-display"
          style={{ fontSize: 'clamp(36px,5.4vw,64px)', color: '#fff' }}
        >
          {team.projectName}<span style={{ color: team.mood }}>.</span>
        </motion.h2>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(18px,2.2vw,24px)', color: team.mood, margin: '10px 0 34px' }}>
          {team.tagline}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 48 }} className="aql-stat-grid">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 1.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...slam, delay: i * 0.12 }}
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)',
                borderRadius: 16, padding: '20px 16px', position: 'relative', overflow: 'hidden',
              }}
            >
              <motion.div
                aria-hidden
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: i * 0.12 + 0.05 }}
                style={{ position: 'absolute', inset: 0, background: team.mood }}
              />
              <div className="h-display" style={{ fontSize: 'clamp(26px,3.2vw,36px)', color: team.mood, position: 'relative' }}>
                <CountTo value={s.value} decimals={s.decimals} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.55)', marginTop: 6, lineHeight: 1.4, position: 'relative' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 40, alignItems: 'start' }} className="aql-cc-grid">
          <div>
            <Narrative team={team} dark />
            <MeaningLine team={team} dark />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <LinkRow links={team.links} dark mood={team.mood} />
              <CopyLinkButton slug={team.slug} dark mood={team.mood} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Plate
              src={processSrc(team.slug, 'logo.jpg')}
              caption="The wordmark, cropped straight off their own site."
              dark
            />
            <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden' }}>
              <Plate
                src={processSrc(team.slug, '01-live-site-11pm.jpg')}
                caption="11:00 PM, June 15 — checking their own build had actually gone live."
                aspect="9/19"
                dark
              />
              <motion.div
                aria-hidden
                style={{
                  position: 'absolute', left: 0, right: 0, top: scanY, height: '18%',
                  background: `linear-gradient(to bottom, transparent, ${team.mood}33, transparent)`,
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .aql-stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .aql-cc-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
