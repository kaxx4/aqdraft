import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, CountTo, LinkRow, MediumBadge, MeaningLine, processSrc } from './Shared'

const STATS: { value: number; decimals?: number; prefix?: string; suffix: string; label: string }[] = [
  { value: 1.5, decimals: 1, suffix: ' Cr', label: 'higher-ed grads, every year' },
  { value: 42.6, decimals: 1, suffix: '%', label: 'considered employable' },
  { value: 25, suffix: '%', label: 'digital talent gap' },
  { value: 25, suffix: ' L', label: 'skilled people emigrate yearly' },
]

const slam = { type: 'spring' as const, stiffness: 340, damping: 16 }

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}>
      {children}
    </motion.div>
  )
}

// Chapter 02 — Merge Conflicts. Opens like a breaking-news broadcast: the
// paradox scrolls across a ticker before anything else loads, the numbers
// slam in like a headline hitting a screen, and the story closes on two
// real screenshots of their own site — checked on someone's own phone,
// the night it actually shipped.
export default function Chapter02MergeConflicts({ team }: { team: AQLabsTeam }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const scanY = useTransform(scrollYProgress, [0.15, 0.55], ['-10%', '110%'])

  return (
    <section id={team.slug} ref={ref} style={{ background: '#0A0A0A', position: 'relative', overflow: 'hidden' }}>
      {/* breaking-news ticker */}
      <div style={{ background: team.mood, padding: '7px 0', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          style={{ display: 'inline-block', fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: '#0A0A0A' }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} style={{ marginRight: 40 }}>JOBS EMPTY. GRADS JOBLESS. · SAME COUNTRY. SAME YEAR. BOTH TRUE. · </span>
          ))}
        </motion.div>
      </div>

      <div aria-hidden style={{
        position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none',
        backgroundImage: `repeating-linear-gradient(90deg, ${team.mood} 0 2px, transparent 2px 48px)`,
      }} />
      <div style={{ maxWidth: 1080, margin: '0 auto', position: 'relative', padding: '90px 24px 110px' }}>
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
              <motion.div aria-hidden initial={{ opacity: 0.5 }} animate={{ opacity: 0 }} transition={{ duration: 0.5, delay: i * 0.12 + 0.05 }}
                style={{ position: 'absolute', inset: 0, background: team.mood }} />
              <div className="h-display" style={{ fontSize: 'clamp(26px,3.2vw,36px)', color: team.mood, position: 'relative' }}>
                <CountTo value={s.value} decimals={s.decimals} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.55)', marginTop: 6, lineHeight: 1.4, position: 'relative' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        <Reveal>
          <p style={{ fontSize: 15.5, lineHeight: 1.8, color: 'rgba(255,255,255,0.72)', maxWidth: 640, marginBottom: 20 }}>
            {team.spark}
          </p>
          <p style={{ fontSize: 15.5, lineHeight: 1.8, color: 'rgba(255,255,255,0.72)', maxWidth: 640, marginBottom: 44 }}>
            {team.tension}
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
            proof, not a mockup
          </div>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 48 }} className="aql-cc-shots">
          <Reveal delay={0.1}>
            <figure style={{ margin: 0, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.14)', position: 'relative' }}>
              <img src={processSrc(team.slug, '01-live-site-11pm.jpg')} alt="Their own site, checked at 11PM the night it shipped"
                loading="lazy" decoding="async" style={{ width: '100%', display: 'block', aspectRatio: '9/19', objectFit: 'cover' }} />
              <motion.div aria-hidden style={{
                position: 'absolute', left: 0, right: 0, top: scanY, height: '18%',
                background: `linear-gradient(to bottom, transparent, ${team.mood}33, transparent)`, pointerEvents: 'none',
              }} />
              <figcaption style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 12px',
                fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 11.5, color: '#fff',
                background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)',
              }}>
                11:00 PM, June 15 — checking their own build had actually gone live.
              </figcaption>
            </figure>
          </Reveal>
          <Reveal delay={0.18}>
            <figure style={{ margin: 0, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.14)' }}>
              <img src={processSrc(team.slug, '02-live-site-landing.jpg')} alt="The full landing page, live"
                loading="lazy" decoding="async" style={{ width: '100%', display: 'block', aspectRatio: '9/19', objectFit: 'cover', objectPosition: 'top' }} />
            </figure>
            <figcaption style={{ display: 'block', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12.5, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>
              The full dashboard — sectors, stats, and a "View Opportunities" button that actually works.
            </figcaption>
          </Reveal>
        </div>

        <Reveal>
          <MeaningLine team={team} dark />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <LinkRow links={team.links} dark mood={team.mood} />
            <CopyLinkButton slug={team.slug} dark mood={team.mood} />
          </div>
        </Reveal>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .aql-stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .aql-cc-shots { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
