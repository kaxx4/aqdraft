import { motion } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, LinkRow, slideSrc } from './Shared'

const spring = { type: 'spring' as const, stiffness: 260, damping: 20 }

// Chapter 04 — Alter Ego. A bouncy "level map" room: four story beats sit
// as level nodes along a winding dotted path that draws itself in on scroll.
export default function Chapter04AlterEgo({ team }: { team: AQLabsTeam }) {
  return (
    <section id={team.slug} style={{ background: '#EAF4EA', padding: '110px 24px', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', background: `${team.mood}14` }} />
      <div style={{ maxWidth: 1080, margin: '0 auto', position: 'relative' }}>
        <ChapterEyebrow team={team} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 40, alignItems: 'start', marginBottom: 20 }} className="aql-forest-head">
          <div>
            <motion.h2
              initial={{ opacity: 0, scale: 0.9, y: 16 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={spring}
              className="h-display"
              style={{ fontSize: 'clamp(36px,5.4vw,60px)', color: team.mood }}
            >
              {team.projectName}
            </motion.h2>
            <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(17px,2vw,22px)', color: 'var(--ink)', margin: '8px 0 16px' }}>
              {team.tagline}
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--txt-2)', maxWidth: 480 }}>{team.description}</p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
            whileInView={{ opacity: 1, scale: 1, rotate: -4 }}
            viewport={{ once: true }}
            transition={{ ...spring, delay: 0.15 }}
            style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 14px 32px rgba(0,0,0,0.14)', border: '6px solid #fff' }}
          >
            <img src={slideSrc(team.slug, 1)} alt={team.projectName} loading="lazy" decoding="async" style={{ width: '100%', display: 'block', aspectRatio: '4/5', objectFit: 'cover' }} />
          </motion.div>
        </div>

        {/* winding level path */}
        <div style={{ position: 'relative', margin: '36px 0 30px' }}>
          <svg viewBox="0 0 800 90" style={{ width: '100%', height: 70, display: 'block' }} preserveAspectRatio="none">
            <motion.path
              d="M20,45 C 160,-10 240,100 400,45 C 560,-10 640,100 780,45"
              fill="none" stroke={team.mood} strokeWidth="3" strokeDasharray="2 14" strokeLinecap="round"
              initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.1 }}
            />
          </svg>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${team.storyBeats.length}, 1fr)`, gap: 14, marginTop: -10 }} className="aql-level-grid">
            {team.storyBeats.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.4, y: 24 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ ...spring, delay: i * 0.14 }}
                style={{
                  background: '#fff', borderRadius: 16, padding: '14px 14px', textAlign: 'center',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.08)', border: `2px solid ${team.mood}33`,
                }}
              >
                <div className="h-display" style={{
                  width: 26, height: 26, borderRadius: '50%', background: team.mood, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, margin: '0 auto 8px',
                }}>{i + 1}</div>
                <div style={{ fontSize: 12.5, color: 'var(--txt-2)', lineHeight: 1.45 }}>{b}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={spring}
          style={{
            display: 'inline-block', background: team.mood, color: '#fff', borderRadius: 16,
            padding: '14px 22px', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(18px,2.4vw,24px)',
            marginBottom: 26, transform: 'rotate(-1deg)',
          }}
        >
          “{team.quote}”
        </motion.div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <LinkRow links={team.links} mood={team.mood} />
          <CopyLinkButton slug={team.slug} mood={team.mood} />
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .aql-forest-head { grid-template-columns: 1fr !important; }
          .aql-level-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  )
}
