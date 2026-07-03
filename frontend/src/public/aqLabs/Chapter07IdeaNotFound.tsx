import { motion } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, LinkRow, MediumBadge, MeaningLine, processSrc } from './Shared'

const ASSEMBLY = [
  { file: '01-modus-band-concept-render.jpeg', caption: 'The concept — musical notation, engraved before anything was built.' },
  { file: '02-technical-blueprint-spec-sheet.jpeg', caption: '42mm sensor module. 20mm links. Toleranced like a jeweller\'s drawing.' },
  { file: '04-mechanism-assembly-diagram.jpeg', caption: 'Align. Slide. Lock. Secure. — the snap mechanism, worked out to the millimetre.' },
  { file: '03-wrist-mockup-render.jpeg', caption: 'Worn, not charged — the design brief, resolved.' },
]

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}>
      {children}
    </motion.div>
  )
}

// Chapter 07 — 404-Idea Not Found. The atelier: the pitch was "Photon,"
// but the real story is an assembly line — concept, blueprint, mechanism,
// object — each of their four real images placed in the order the thing
// was actually invented, not the order that photographs best.
export default function Chapter07IdeaNotFound({ team }: { team: AQLabsTeam }) {
  return (
    <section id={team.slug} style={{ background: '#0B0C0E', padding: '110px 24px 120px', position: 'relative' }}>
      <div style={{ maxWidth: 720, margin: '0 auto 60px' }}>
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
          style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(42px,7vw,80px)', color: '#F4EFE0', letterSpacing: '0.01em' }}
        >
          Modus Band
        </motion.h2>
      </div>

      {/* the assembly line */}
      <div style={{ maxWidth: 1080, margin: '0 auto 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="aql-assembly-grid">
          {ASSEMBLY.map((a, i) => (
            <motion.figure
              key={a.file}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.12, ease: [0.2, 0, 0, 1] }}
              style={{ margin: 0 }}
            >
              <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.14)' }}>
                <div style={{
                  position: 'absolute', top: 8, left: 8, zIndex: 2, fontFamily: 'var(--mono)', fontSize: 10.5,
                  color: '#0B0C0E', background: team.mood, borderRadius: 999, padding: '2px 8px', fontWeight: 700,
                }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <img src={processSrc(team.slug, a.file)} alt={a.caption} loading="lazy" decoding="async"
                  style={{ width: '100%', display: 'block', aspectRatio: '4/5', objectFit: 'cover' }} />
              </div>
              <figcaption style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 11.5, lineHeight: 1.4, color: 'rgba(244,239,224,0.5)', marginTop: 8 }}>
                {a.caption}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Reveal>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(19px,2.3vw,24px)', lineHeight: 1.5, color: '#F4EFE0', marginBottom: 20 }}>
            {team.spark}
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(244,239,224,0.65)', marginBottom: 20 }}>
            {team.tension}
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(244,239,224,0.65)', marginBottom: 32 }}>
            {team.craft}
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <MeaningLine team={team} dark />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <LinkRow links={team.links} dark mood={team.mood} />
            <CopyLinkButton slug={team.slug} dark mood={team.mood} />
          </div>
        </Reveal>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .aql-assembly-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  )
}
