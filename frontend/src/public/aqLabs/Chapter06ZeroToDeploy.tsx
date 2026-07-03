import { motion } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, LinkRow, MediumBadge, MeaningLine, processSrc } from './Shared'

const LADDER = [
  { tier: 'Institute', weight: 'highest', width: '100%' },
  { tier: 'Employer', weight: 'high', width: '82%' },
  { tier: 'Portfolio', weight: 'moderate', width: '58%' },
  { tier: 'Peer', weight: 'low', width: '30%' },
  { tier: 'Self-declared', weight: 'none', width: '8%' },
]

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}>
      {children}
    </motion.div>
  )
}

// Chapter 06 — Zero to Deploy. The seal: the wordmark stamps down, and
// their own trust-weighting argument gets built twice — once as their
// real chart, once as a ladder of bars that grows shorter rung by rung,
// so the "self-declared claims are worth nothing" argument is something
// you watch happen, not just read.
export default function Chapter06ZeroToDeploy({ team }: { team: AQLabsTeam }) {
  return (
    <section id={team.slug} style={{ background: '#141210', padding: '110px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1040, margin: '0 auto', position: 'relative' }}>
        <ChapterEyebrow team={team} dark />
        <MediumBadge team={team} dark />

        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 8 }}>
          <motion.div
            initial={{ opacity: 0, scale: 2.1, rotate: 12 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              background: '#F4EFE0', borderRadius: 12, padding: '10px 16px', flexShrink: 0,
              boxShadow: `0 0 0 1px ${team.mood}55`,
            }}
          >
            <img src={processSrc(team.slug, 'logo.jpg')} alt="हुनर — Hunar" style={{ height: 40, display: 'block' }} />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(34px,5.6vw,60px)', color: '#F4EFE0' }}
          >
            {team.projectName}
          </motion.h2>
        </div>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: team.mood, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 40px' }}>
          {team.tagline}
        </p>

        <Reveal>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(20px,2.6vw,28px)', lineHeight: 1.4, color: '#F4EFE0', maxWidth: 680, marginBottom: 22 }}>
            {team.spark}
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(244,239,224,0.65)', maxWidth: 680, marginBottom: 48 }}>
            {team.tension}
          </p>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 44, alignItems: 'start' }} className="aql-hunar-grid">
          <Reveal delay={0.05}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(244,239,224,0.4)', marginBottom: 16 }}>
              their argument, watched happening
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {LADDER.map((l, i) => (
                <div key={l.tier}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(244,239,224,0.7)', marginBottom: 4 }}>
                    <span>{l.tier}</span>
                    <span style={{ fontFamily: 'var(--mono)', color: team.mood }}>{l.weight}</span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: l.width }}
                      transition={{ duration: 0.7, delay: 0.1 + i * 0.1, ease: [0.2, 0, 0, 1] }}
                      style={{ height: '100%', background: team.mood, borderRadius: 999 }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'rgba(244,239,224,0.5)', marginTop: 18 }}>
              {team.craft}
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <figure style={{ margin: 0, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.14)', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}>
              <img
                src={processSrc(team.slug, '01-trust-sources-donut-chart.jpeg')}
                alt="Their own weighting model — five sources of proof, ranked by how hard each is to fake."
                loading="lazy" decoding="async"
                style={{ width: '100%', display: 'block', aspectRatio: '9/17', objectFit: 'cover' }}
              />
            </figure>
            <figcaption style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12.5, lineHeight: 1.4, color: 'rgba(244,239,224,0.5)', marginTop: 8 }}>
              Their own slide — the same ranking, in their own words.
            </figcaption>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div style={{ marginTop: 48 }}>
            <MeaningLine team={team} dark />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <LinkRow links={team.links} dark mood={team.mood} />
              <CopyLinkButton slug={team.slug} dark mood={team.mood} />
            </div>
          </div>
        </Reveal>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .aql-hunar-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
