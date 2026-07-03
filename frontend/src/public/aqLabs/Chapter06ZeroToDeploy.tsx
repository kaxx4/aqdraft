import { motion } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, LinkRow, MediumBadge, MeaningLine, Narrative, processSrc } from './Shared'

// Chapter 06 — Zero to Deploy. The seal: the Devanagari wordmark doesn't
// fade in, it stamps — a fast overshoot-then-settle, the way a rubber
// stamp thuds down — and the trust chart opens like a circular aperture,
// which is the whole point of what that chart is arguing (verification
// revealed, not declared).
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

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 44, alignItems: 'start' }} className="aql-hunar-grid">
          <div>
            <Narrative team={team} dark />
            <MeaningLine team={team} dark />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <LinkRow links={team.links} dark mood={team.mood} />
              <CopyLinkButton slug={team.slug} dark mood={team.mood} />
            </div>
          </div>
          <motion.figure
            initial={{ clipPath: 'circle(0% at 50% 40%)', opacity: 0.5 }}
            animate={{ clipPath: 'circle(75% at 50% 40%)', opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            style={{ margin: 0 }}
          >
            <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.14)', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}>
              <img
                src={processSrc(team.slug, '01-trust-sources-donut-chart.jpeg')}
                alt="Their own weighting model — five sources of proof, ranked by how hard each is to fake."
                loading="lazy" decoding="async"
                style={{ width: '100%', display: 'block', aspectRatio: '9/17', objectFit: 'cover' }}
              />
            </div>
            <figcaption style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12.5, lineHeight: 1.4, color: 'rgba(244,239,224,0.5)', marginTop: 8 }}>
              Their own weighting model — five sources of proof, ranked by how hard each is to fake.
            </figcaption>
          </motion.figure>
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .aql-hunar-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
