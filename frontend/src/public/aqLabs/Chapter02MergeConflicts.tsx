import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, CountTo, LinkRow, MediumBadge, MeaningLine, PhotoPop, ScrollBuild, processSrc } from './Shared'

const STATS: { value: number; decimals?: number; prefix?: string; suffix: string; label: string }[] = [
  { value: 1.5, decimals: 1, suffix: ' Cr', label: 'higher-ed grads, every year' },
  { value: 42.6, decimals: 1, suffix: '%', label: 'considered employable' },
  { value: 25, suffix: '%', label: 'digital talent gap' },
  { value: 25, suffix: ' L', label: 'skilled people emigrate yearly' },
]

// Chapter 02 — Merge Conflicts. A breaking-news cold open: a real ticker
// runs the paradox on loop under a giant blinking headline that fills the
// screen, before the numbers slam onto the record and the story settles
// into the two real screenshots that prove it shipped.
export default function Chapter02MergeConflicts({ team }: { team: AQLabsTeam }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const scanY = useTransform(scrollYProgress, [0.15, 0.55], ['-10%', '110%'])

  return (
    <section id={team.slug} ref={ref} style={{
      background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 3px), #0A0A0A',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* ── cold open — breaking news ── */}
      <div style={{ minHeight: '86vh', display: 'flex', flexDirection: 'column', paddingTop: 'calc(var(--nav-h, 70px) + 20px)' }}>
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

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
          <div style={{ maxWidth: 900, textAlign: 'center' }}>
            <ChapterEyebrow team={team} dark />
            <div style={{ display: 'flex', justifyContent: 'center' }}><MediumBadge team={team} dark /></div>
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="h-display"
              style={{ fontSize: 'clamp(40px,7.5vw,96px)', color: '#fff', lineHeight: 0.98 }}
            >
              {team.projectName}<span style={{ color: team.mood }}>.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(18px,2.4vw,26px)', color: team.mood, marginTop: 12 }}
            >
              {team.tagline}
            </motion.p>
            {team.links.website && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} style={{ marginTop: 22 }}>
                <a href={team.links.website} target="_blank" rel="noopener noreferrer" className="btn"
                  style={{ background: team.mood, borderColor: team.mood, color: '#0A0A0A', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  Open CareerCompass, live ↗
                </a>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div aria-hidden style={{
        position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none',
        backgroundImage: `repeating-linear-gradient(90deg, ${team.mood} 0 2px, transparent 2px 48px)`,
      }} />
      <div style={{ maxWidth: 1080, margin: '0 auto', position: 'relative', padding: '20px 24px 110px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 48 }} className="aql-stat-grid">
          {STATS.map((s) => (
            <ScrollBuild key={s.label} scale={0.82} y={16}>
              <div style={{
                background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)',
                borderRadius: 16, padding: '20px 16px', position: 'relative', overflow: 'hidden',
              }}>
                <div className="h-display" style={{ fontSize: 'clamp(26px,3.2vw,36px)', color: team.mood, position: 'relative' }}>
                  <CountTo value={s.value} decimals={s.decimals} suffix={s.suffix} />
                </div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.55)', marginTop: 6, lineHeight: 1.4, position: 'relative' }}>{s.label}</div>
              </div>
            </ScrollBuild>
          ))}
        </div>

        <ScrollBuild>
          <p style={{ fontSize: 15.5, lineHeight: 1.8, color: 'rgba(255,255,255,0.72)', maxWidth: 640, marginBottom: 20 }}>
            {team.spark}
          </p>
          <p style={{ fontSize: 15.5, lineHeight: 1.8, color: 'rgba(255,255,255,0.72)', maxWidth: 640, marginBottom: 44 }}>
            {team.tension}
          </p>
        </ScrollBuild>

        <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
          proof, not a mockup
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 24 }} className="aql-cc-shots">
          <PhotoPop fromLeft>
            <figure style={{ margin: 0, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.14)', position: 'relative' }}>
              <img src={processSrc(team.slug, '01-live-site-11pm.jpg')} alt="Their own site, checked at 11PM the night it shipped"
                loading="lazy" decoding="async" style={{ width: '100%', display: 'block', aspectRatio: '9/16', objectFit: 'cover', objectPosition: 'top' }} />
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
          </PhotoPop>
          <PhotoPop fromLeft={false}>
            <figure style={{ margin: 0, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.14)' }}>
              <img src={processSrc(team.slug, '02-live-site-landing.jpg')} alt="The stat grid and CTAs on the same live page, zoomed in"
                loading="lazy" decoding="async" style={{ width: '100%', display: 'block', aspectRatio: '9/16', objectFit: 'cover', objectPosition: 'bottom' }} />
            </figure>
            <figcaption style={{ display: 'block', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12.5, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>
              The same page, zoomed to the numbers — the real stat grid and a "View Opportunities" button that actually works.
            </figcaption>
          </PhotoPop>
        </div>

        <ScrollBuild scale={0.94} y={30}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 28, alignItems: 'center',
            background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.1)',
            borderRadius: 18, padding: 24, marginBottom: 48,
          }} className="aql-cc-quiz">
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: team.mood, marginBottom: 10 }}>
                and it doesn't stop at stats
              </div>
              <p style={{ fontSize: 15.5, lineHeight: 1.8, color: 'rgba(255,255,255,0.72)', margin: 0 }}>
                Five questions in, it stops describing the skill economy and starts pointing at your place in it —
                a real recommendation engine, not another dashboard to read past.
              </p>
            </div>
            <figure style={{ margin: 0, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.14)', boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }}>
              <img src={processSrc(team.slug, '03-career-path-intake-form.png')} alt="The 5-question career-path recommendation form, live"
                loading="lazy" decoding="async" style={{ width: '100%', display: 'block' }} />
            </figure>
          </div>
        </ScrollBuild>

        <ScrollBuild>
          <MeaningLine team={team} dark />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <LinkRow links={team.links} dark mood={team.mood} />
            <CopyLinkButton slug={team.slug} dark mood={team.mood} />
          </div>
        </ScrollBuild>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .aql-stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .aql-cc-shots { grid-template-columns: 1fr !important; }
          .aql-cc-quiz { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
