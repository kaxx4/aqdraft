import { motion } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, LinkRow, MediumBadge, MeaningLine, processSrc } from './Shared'

const ORBIT_ICONS = ['📚', '🧮', '🥼', '🎨', '🏸', '🎒']

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}>
      {children}
    </motion.div>
  )
}

// Chapter 05 — Idea Architects. The commons: a ring of the actual items
// that move through the network keeps slowly circulating behind the
// headline — the idea made literal — while their own posters unroll
// below like prints being laid out, then settle into a perpetual sway.
export default function Chapter05IdeaArchitects({ team }: { team: AQLabsTeam }) {
  return (
    <section id={team.slug} style={{ background: '#F1F3EA', padding: '110px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', position: 'relative' }}>
        <ChapterEyebrow team={team} />
        <MediumBadge team={team} />

        <div style={{ position: 'relative', marginBottom: 8 }}>
          <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} style={{ position: 'absolute', top: -30, right: 20, width: 220, height: 220 }}>
              {ORBIT_ICONS.map((icon, i) => {
                const angle = (i / ORBIT_ICONS.length) * Math.PI * 2
                const x = 110 + 100 * Math.cos(angle)
                const y = 110 + 100 * Math.sin(angle)
                return (
                  <motion.span
                    key={icon}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                    style={{ position: 'absolute', left: x, top: y, fontSize: 22, opacity: 0.55 }}
                  >
                    {icon}
                  </motion.span>
                )
              })}
            </motion.div>
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="h-display"
            style={{ fontSize: 'clamp(36px,5.4vw,60px)', color: team.mood, position: 'relative' }}
          >
            {team.projectName}
          </motion.h2>
        </div>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(17px,2.1vw,23px)', color: 'var(--ink)', margin: '8px 0 40px' }}>
          {team.tagline}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 48, alignItems: 'start' }} className="aql-cirqle-grid">
          <div>
            <Reveal>
              <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(19px,2.3vw,24px)', lineHeight: 1.5, color: 'var(--ink)', marginBottom: 20 }}>
                {team.spark}
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--txt-2)', marginBottom: 20 }}>
                {team.tension}
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--txt-2)', marginBottom: 32 }}>
                {team.craft}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <MeaningLine team={team} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                <LinkRow links={team.links} mood={team.mood} />
                <CopyLinkButton slug={team.slug} mood={team.mood} />
              </div>
            </Reveal>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <UnrollPlate
              src={processSrc(team.slug, '01-what-is-cirqle-infographic.jpg')}
              caption="Their own icon for the idea itself — hand-drawn, not a stock graphic."
              delay={0}
            />
            <UnrollPlate
              src={processSrc(team.slug, '02-cirqle-categories-infographic.jpg')}
              caption="The full explainer poster, hand-illustrated — what actually moves through the network."
              delay={0.18}
            />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .aql-cirqle-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}

function UnrollPlate({ src, caption, delay }: { src: string; caption: string; delay: number }) {
  return (
    <motion.figure
      initial={{ opacity: 0, scaleY: 0.08 }}
      animate={{ opacity: 1, scaleY: 1 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ margin: 0, transformOrigin: 'top center' }}
    >
      <motion.div
        animate={{ rotate: [-0.6, 0.6, -0.6] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.7 }}
        style={{
          borderRadius: 10, overflow: 'hidden', border: '1px solid var(--line-2)',
          boxShadow: '0 14px 34px rgba(0,0,0,0.10)',
        }}
      >
        <img src={src} alt={caption} loading="lazy" decoding="async" style={{ width: '100%', display: 'block', aspectRatio: '1/1', objectFit: 'cover' }} />
      </motion.div>
      <figcaption style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12.5, lineHeight: 1.4, color: 'var(--txt-3)', marginTop: 8 }}>
        {caption}
      </figcaption>
    </motion.figure>
  )
}
