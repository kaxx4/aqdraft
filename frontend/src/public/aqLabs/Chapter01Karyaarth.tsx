import { motion } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, FilmStrip, LinkRow, MediumBadge, MeaningLine, Narrative, Plate, processSrc } from './Shared'

const WALL = [
  { file: '01-bts-filming-market-night.jpg', caption: 'The crew, filming after dark — a single string of market bulbs for light.' },
  { file: '09-interview-icecream-vendor.jpg', caption: 'No boom mic. A phone, held steady, and a question worth waiting for.' },
  { file: '05-momo-vendor-closeup.jpg', caption: 'Steam off the momo baskets — the kind of detail a script would never think to ask for.' },
  { file: '07-corn-roaster-daytime.jpg', caption: 'Daylight, for once — a bhutta seller over open coals.' },
]

// Chapter 01 — Karyaarth. A gallery wall: one large graded portrait as the
// hero, a small contact-sheet of the real behind-the-scenes photography
// underneath, each with its own museum caption. The Instagram carousel is
// kept, but tucked away as a secondary, clearly-labelled artifact.
export default function Chapter01Karyaarth({ team }: { team: AQLabsTeam }) {
  return (
    <section id={team.slug} style={{ background: '#F3EDE1', padding: '110px 24px', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <ChapterEyebrow team={team} />
        <MediumBadge team={team} />
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
          className="h-display"
          style={{ fontSize: 'clamp(38px, 5.4vw, 68px)', color: 'var(--ink)' }}
        >
          {team.teamName}<span style={{ color: team.mood }}>.</span>
        </motion.h2>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(18px,2.2vw,24px)', color: team.mood, margin: '10px 0 40px' }}>
          {team.tagline}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.1fr)', gap: 56 }} className="aql-two-col">
          <div>
            <Narrative team={team} />
            <MeaningLine team={team} />
            <blockquote style={{
              fontFamily: 'var(--mono)', fontSize: 12.5, color: 'var(--txt-3)',
              borderLeft: `2px solid ${team.mood}`, paddingLeft: 14, margin: '0 0 26px',
            }}>
              “{team.quote}”
            </blockquote>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <LinkRow links={team.links} mood={team.mood} />
              <CopyLinkButton slug={team.slug} mood={team.mood} />
            </div>
          </div>

          <div>
            <Plate
              src={processSrc(team.slug, '08-graded-icecream-vendor-portrait.jpg')}
              caption="An ice-cream vendor, Kolkata — the first frame anyone actually kept."
              aspect="4/3"
            />
          </div>
        </div>

        {/* the wall — contact-sheet of the real BTS shots */}
        <div style={{ marginTop: 56 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 16 }}>
            from the shoot
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }} className="aql-wall-grid">
            {WALL.map(w => (
              <Plate key={w.file} src={processSrc(team.slug, w.file)} caption={w.caption} aspect="4/3" />
            ))}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-4)', margin: '32px 0 4px' }}>
            the Instagram cut
          </div>
          <FilmStrip team={team} />
        </div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .aql-two-col { grid-template-columns: 1fr !important; }
          .aql-wall-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  )
}
