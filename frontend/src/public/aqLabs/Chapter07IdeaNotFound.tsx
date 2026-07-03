import { motion } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, LinkRow, MediumBadge, MeaningLine, Narrative, processSrc } from './Shared'

// Chapter 07 — 404-Idea Not Found. The atelier: the reveal itself IS the
// transition — "Photon" types out, then a beat of silence, then "Modus
// Band" arrives with a slow-dawning light-sweep across the wrist photo,
// like the name and the light are the same idea. The blueprint slides
// in afterward, from below, the way a drawing gets placed on a table.
export default function Chapter07IdeaNotFound({ team }: { team: AQLabsTeam }) {
  return (
    <section id={team.slug} style={{ background: '#0B0C0E', padding: '110px 24px 120px', position: 'relative' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <ChapterEyebrow team={team} dark />
        <MediumBadge team={team} dark />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          style={{ fontFamily: 'var(--mono)', fontSize: 11.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: team.mood, marginBottom: 10 }}
        >
          pitched as {team.projectName} · built as —
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
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
            <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.14)', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}>
              <img
                src={processSrc(team.slug, '03-wrist-mockup-render.jpeg')}
                alt="Worn, not charged — the design brief in one image"
                loading="lazy" decoding="async"
                style={{ width: '100%', display: 'block', aspectRatio: '4/5', objectFit: 'cover' }}
              />
              <motion.div
                aria-hidden
                initial={{ x: '-120%' }}
                animate={{ x: '220%' }}
                transition={{ duration: 1.6, delay: 0.6, ease: 'easeInOut' }}
                style={{
                  position: 'absolute', top: 0, bottom: 0, width: '40%',
                  background: `linear-gradient(100deg, transparent, ${team.mood}55, transparent)`,
                  pointerEvents: 'none', mixBlendMode: 'screen',
                }}
              />
            </div>
            <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12.5, lineHeight: 1.4, color: 'rgba(244,239,224,0.5)' }}>
              Worn, not charged — the design brief in one image.
            </p>

            <motion.figure
              initial={{ opacity: 0, y: 60, rotate: -3 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
              style={{ margin: 0 }}
            >
              <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.14)', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}>
                <img
                  src={processSrc(team.slug, '02-technical-blueprint-spec-sheet.jpeg')}
                  alt="42mm sensor module, 20mm links — toleranced like a jeweller's drawing"
                  loading="lazy" decoding="async"
                  style={{ width: '100%', display: 'block' }}
                />
              </div>
              <figcaption style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12.5, lineHeight: 1.4, color: 'rgba(244,239,224,0.5)', marginTop: 8 }}>
                42mm sensor module. 20mm links. Toleranced like a jeweller's drawing, not a pitch deck.
              </figcaption>
            </motion.figure>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .aql-modus-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
