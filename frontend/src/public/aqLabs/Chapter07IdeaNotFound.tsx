import { motion } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, FilmStrip, LinkRow, MediumBadge, MeaningLine, Narrative, Plate, processSrc } from './Shared'

// Chapter 07 — 404-Idea Not Found. The atelier: the pitch was "Photon," but
// their own worktable produced something with its own name — Modus Band —
// and a real jeweller's blueprint sheet to prove it. That reveal is the
// whole shape of this room.
export default function Chapter07IdeaNotFound({ team }: { team: AQLabsTeam }) {
  return (
    <section id={team.slug} style={{ background: '#0B0C0E', padding: '110px 24px 120px', position: 'relative' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <ChapterEyebrow team={team} dark />
        <MediumBadge team={team} dark />
        <p style={{ fontFamily: 'var(--mono)', fontSize: 11.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: team.mood, marginBottom: 10 }}>
          pitched as {team.projectName} · built as —
        </p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(42px,7vw,80px)', color: '#F4EFE0', letterSpacing: '0.01em', marginBottom: 44 }}
        >
          Modus Band
        </motion.h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 44, alignItems: 'start' }} className="aql-modus-grid">
          <div>
            <Narrative team={team} dark />
            <MeaningLine team={team} dark />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <LinkRow links={team.links} dark mood={team.mood} />
              <CopyLinkButton slug={team.slug} dark mood={team.mood} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Plate
              src={processSrc(team.slug, '03-wrist-mockup-render.jpeg')}
              caption="Worn, not charged — the design brief in one image."
              aspect="4/5"
              dark
            />
            <Plate
              src={processSrc(team.slug, '02-technical-blueprint-spec-sheet.jpeg')}
              caption="42mm sensor module. 20mm links. Toleranced like a jeweller's drawing, not a pitch deck."
              dark
            />
          </div>
        </div>

        <FilmStrip team={team} dark />
      </div>

      <style>{`
        @media (max-width: 720px) {
          .aql-modus-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
