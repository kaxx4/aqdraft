import { motion } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, FilmStrip, LinkRow, MediumBadge, slideSrc } from './Shared'

// Chapter 01 — Karyaarth. A photo-documentary spread: headline copy on the
// left, five "scattered polaroids" on the right that straighten and lift
// on hover — the room feels like a wall of street photography.
export default function Chapter01Karyaarth({ team }: { team: AQLabsTeam }) {
  const rotations = [-6, 4, -3, 7, -8]
  return (
    <section id={team.slug} style={{ background: 'var(--bg)', padding: '110px 24px', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.05fr)', gap: 56, alignItems: 'center' }}
        className="aql-two-col">
        <div>
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
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(18px,2.2vw,24px)', color: team.mood, margin: '10px 0 22px' }}
          >
            {team.tagline}
          </motion.p>
          <p style={{ fontSize: 15.5, lineHeight: 1.7, color: 'var(--txt-2)', maxWidth: 480, marginBottom: 20 }}>{team.description}</p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 26, padding: 0, listStyle: 'none' }}>
            {team.storyBeats.map((b, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                style={{ display: 'flex', gap: 10, fontSize: 13.5, color: 'var(--txt-3)', lineHeight: 1.5 }}
              >
                <span style={{ color: team.mood, flexShrink: 0 }}>—</span>{b}
              </motion.li>
            ))}
          </ul>
          <blockquote style={{
            fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(20px,2.6vw,28px)',
            color: 'var(--ink)', borderLeft: `3px solid ${team.mood}`, paddingLeft: 18, margin: '0 0 26px',
          }}>
            “{team.quote}”
          </blockquote>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <LinkRow links={team.links} mood={team.mood} />
            <CopyLinkButton slug={team.slug} mood={team.mood} />
          </div>
          <FilmStrip team={team} />
        </div>

        <div style={{ position: 'relative', height: 480 }} className="aql-polaroid-stage">
          {[1, 2, 3, 4, 5].map((n, i) => (
            <motion.div
              key={n}
              initial={{ opacity: 0, y: 40, rotate: rotations[i] }}
              animate={{ opacity: 1, y: 0, rotate: rotations[i] }}
              whileHover={{ rotate: 0, scale: 1.07, zIndex: 10, boxShadow: '0 24px 60px rgba(0,0,0,0.28)' }}
              transition={{ duration: 0.55, delay: i * 0.09, ease: [0.2, 0, 0, 1] }}
              style={{
                position: 'absolute',
                width: '46%',
                left: `${(i % 3) * 22 + (i >= 3 ? 14 : 0)}%`,
                top: `${Math.floor(i / 3) * 46 + (i % 3) * 6}%`,
                background: '#fff', padding: 8, borderRadius: 10,
                boxShadow: '0 10px 30px rgba(0,0,0,0.16)', cursor: 'pointer',
                zIndex: i,
              }}
            >
              <img src={slideSrc(team.slug, n)} alt={`${team.teamName} — slide ${n}`} loading="lazy" decoding="async"
                style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', borderRadius: 4, display: 'block' }} />
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .aql-two-col { grid-template-columns: 1fr !important; }
          .aql-polaroid-stage { height: 340px !important; margin-top: 20px; }
        }
      `}</style>
    </section>
  )
}
