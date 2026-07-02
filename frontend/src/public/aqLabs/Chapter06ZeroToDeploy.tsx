import { motion } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, FilmStrip, LinkRow, MediumBadge, MeaningLine, Narrative, Plate, processSrc } from './Shared'

// Chapter 06 — Zero to Deploy. The seal: their Devanagari wordmark sits at
// the top like a letterpress stamp, and their own trust-weighting chart —
// a genuine piece of design reasoning, not a decoration — carries the
// second half of the room.
export default function Chapter06ZeroToDeploy({ team }: { team: AQLabsTeam }) {
  return (
    <section id={team.slug} style={{ background: '#141210', padding: '110px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1040, margin: '0 auto', position: 'relative' }}>
        <ChapterEyebrow team={team} dark />
        <MediumBadge team={team} dark />

        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 8 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.5 }}
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
            transition={{ duration: 0.6 }}
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
          <Plate
            src={processSrc(team.slug, '01-trust-sources-donut-chart.jpeg')}
            caption="Their own weighting model — five sources of proof, ranked by how hard each is to fake."
            aspect="9/17"
            dark
          />
        </div>

        <FilmStrip team={team} dark />
      </div>

      <style>{`
        @media (max-width: 720px) {
          .aql-hunar-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
