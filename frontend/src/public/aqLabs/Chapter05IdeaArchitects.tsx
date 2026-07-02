import { motion } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, FilmStrip, LinkRow, MediumBadge, MeaningLine, Narrative, Plate, processSrc } from './Shared'

// Chapter 05 — Idea Architects. The commons: their own hand-illustrated
// explainer poster, framed like a print on a gallery wall, carries the
// chapter — real material instead of an invented diagram.
export default function Chapter05IdeaArchitects({ team }: { team: AQLabsTeam }) {
  return (
    <section id={team.slug} style={{ background: '#F1F3EA', padding: '110px 24px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <ChapterEyebrow team={team} />
        <MediumBadge team={team} />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="h-display"
          style={{ fontSize: 'clamp(36px,5.4vw,60px)', color: team.mood }}
        >
          {team.projectName}
        </motion.h2>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(17px,2.1vw,23px)', color: 'var(--ink)', margin: '8px 0 40px' }}>
          {team.tagline}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 48, alignItems: 'start' }} className="aql-cirqle-grid">
          <div>
            <Narrative team={team} />
            <MeaningLine team={team} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <LinkRow links={team.links} mood={team.mood} />
              <CopyLinkButton slug={team.slug} mood={team.mood} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <Plate
              src={processSrc(team.slug, '01-what-is-cirqle-infographic.jpg')}
              caption="Their own icon for the idea itself — hand-drawn, not a stock graphic."
              aspect="1/1"
            />
            <Plate
              src={processSrc(team.slug, '02-cirqle-categories-infographic.jpg')}
              caption="The full explainer poster, hand-illustrated — what actually moves through the network."
              aspect="1/1"
            />
          </div>
        </div>

        <FilmStrip team={team} />
      </div>

      <style>{`
        @media (max-width: 760px) {
          .aql-cirqle-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
