import { motion } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, LinkRow, MediumBadge, MeaningLine, processSrc } from './Shared'

const sprout = { type: 'spring' as const, stiffness: 220, damping: 14 }

const TRACKS = [
  { name: 'Words', desc: 'vocabulary, in disguise as a game', color: '#E8A33D' },
  { name: 'Logic', desc: 'little puzzles, big brain', color: '#3D8EE8' },
  { name: 'The World', desc: 'GK that actually sticks', color: '#1E8449' },
]

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}>
      {children}
    </motion.div>
  )
}

// Chapter 04 — Alter Ego. A storybook: the logo sprouts like a seed
// opening, then the narrative reads as the book's opening page, then the
// three tracks turn like three separate storybook pages — each its own
// colour, each flipping into place a beat after the last — before the
// level-path closes the chapter.
export default function Chapter04AlterEgo({ team }: { team: AQLabsTeam }) {
  return (
    <section id={team.slug} style={{ background: '#EAF4EA', padding: '110px 24px', position: 'relative', overflow: 'hidden' }}>
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
        style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', background: `${team.mood}14` }}
      />
      <div style={{ maxWidth: 940, margin: '0 auto', position: 'relative' }}>
        <ChapterEyebrow team={team} />
        <MediumBadge team={team} />

        <div style={{ display: 'flex', gap: 32, alignItems: 'center', marginBottom: 36 }} className="aql-forest-head">
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -30 }}
            animate={{ opacity: 1, scale: 1, rotate: -4 }}
            transition={sprout}
            style={{
              width: 148, height: 148, flexShrink: 0, borderRadius: '50%', overflow: 'hidden',
              border: '5px solid #fff', boxShadow: '0 14px 32px rgba(0,0,0,0.14)',
            }}
          >
            <img src={processSrc(team.slug, 'logo.jpg')} alt="Wisdom Woods logo" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </motion.div>
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...sprout, delay: 0.15 }}
              className="h-display"
              style={{ fontSize: 'clamp(34px,5vw,54px)', color: team.mood }}
            >
              {team.projectName}
            </motion.h2>
            <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(16px,2vw,20px)', color: 'var(--ink)' }}>
              {team.tagline}
            </p>
          </div>
        </div>

        <Reveal>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(19px,2.3vw,24px)', lineHeight: 1.5, color: 'var(--ink)', marginBottom: 20 }}>
            {team.spark}
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--txt-2)', marginBottom: 44, maxWidth: 620 }}>
            {team.tension}
          </p>
        </Reveal>

        {/* three storybook pages, turning in one after another */}
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 14 }}>
          three tracks, one forest
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40, perspective: 1200 }} className="aql-tracks-grid">
          {TRACKS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              transition={{ duration: 0.65, delay: i * 0.18, ease: [0.2, 0, 0, 1] }}
              style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d' }}
            >
              <div style={{
                background: '#fff', borderRadius: 16, padding: '22px 18px', height: '100%',
                boxShadow: '0 8px 22px rgba(0,0,0,0.08)', borderTop: `4px solid ${t.color}`,
              }}>
                <div className="h-display" style={{ fontSize: 22, color: t.color, marginBottom: 6 }}>{t.name}</div>
                <div style={{ fontSize: 13, color: 'var(--txt-2)', lineHeight: 1.5 }}>{t.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <Reveal>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--txt-2)', marginBottom: 20, maxWidth: 620 }}>
            {team.craft}
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <MeaningLine team={team} />
        </Reveal>

        <Reveal delay={0.1}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <LinkRow links={team.links} mood={team.mood} />
            <CopyLinkButton slug={team.slug} mood={team.mood} />
          </div>
        </Reveal>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .aql-forest-head { flex-direction: column !important; align-items: flex-start !important; }
          .aql-tracks-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
