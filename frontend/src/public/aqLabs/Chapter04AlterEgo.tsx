import { motion } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, LinkRow, MediumBadge, MeaningLine, Narrative, processSrc } from './Shared'

const sprout = { type: 'spring' as const, stiffness: 220, damping: 14 }

// Chapter 04 — Alter Ego. A storybook page: the logo doesn't fade in,
// it sprouts — scaling up from nothing with an elastic overshoot, like a
// seed opening — and the four level-cards flip in one after another like
// pages turning, not a static grid appearing all at once.
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
      <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
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

        <Narrative team={team} />
        <MeaningLine team={team} />

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${team.storyBeats.length}, 1fr)`, gap: 12, margin: '8px 0 32px', perspective: 900 }} className="aql-level-grid">
          {team.storyBeats.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, rotateX: -70, y: 24 }}
              animate={{ opacity: 1, rotateX: 0, y: 0 }}
              transition={{ duration: 0.55, delay: i * 0.14, ease: [0.2, 0, 0, 1] }}
              style={{ transformOrigin: 'top center', transformStyle: 'preserve-3d' }}
            >
              <div style={{
                background: '#fff', borderRadius: 14, padding: '12px 12px', textAlign: 'center',
                boxShadow: '0 6px 16px rgba(0,0,0,0.07)', border: `1.5px solid ${team.mood}33`,
              }}>
                <div className="h-display" style={{
                  width: 22, height: 22, borderRadius: '50%', background: team.mood, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, margin: '0 auto 7px',
                }}>{i + 1}</div>
                <div style={{ fontSize: 11.5, color: 'var(--txt-2)', lineHeight: 1.4 }}>{b}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <LinkRow links={team.links} mood={team.mood} />
          <CopyLinkButton slug={team.slug} mood={team.mood} />
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .aql-forest-head { flex-direction: column !important; align-items: flex-start !important; }
          .aql-level-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  )
}
