import { motion } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, FilmStrip, LinkRow, MediumBadge } from './Shared'

// Chapter 06 — Zero to Deploy. A quiet editorial room: a single column,
// a wax-seal "verified" stamp, and a manifesto that wipes into view line
// by line — the confident, understated register of their own product.
export default function Chapter06ZeroToDeploy({ team }: { team: AQLabsTeam }) {
  return (
    <section id={team.slug} style={{ background: '#0C1F16', padding: '110px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative' }}>
        <ChapterEyebrow team={team} dark />
        <MediumBadge team={team} dark />

        <motion.div
          initial={{ scale: 1.5, opacity: 0, rotate: -18 }}
          animate={{ scale: 1, opacity: 1, rotate: -10 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          style={{
            position: 'absolute', top: -8, right: 0, width: 92, height: 92, borderRadius: '50%',
            border: `2px dashed ${team.mood}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 9, color: team.mood, letterSpacing: '0.06em',
            lineHeight: 1.3, padding: 8,
          }}
          className="aql-stamp"
        >
          VERIFIED · 2026 · HUNAR
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(38px,6vw,68px)', color: '#F4EFE0', lineHeight: 1.02, marginBottom: 6 }}
        >
          {team.projectName}
        </motion.h2>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: team.mood, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 30 }}>
          {team.tagline}
        </p>

        <blockquote style={{
          fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(24px,3.6vw,36px)',
          color: '#F4EFE0', lineHeight: 1.25, borderTop: `1px solid ${team.mood}55`, borderBottom: `1px solid ${team.mood}55`,
          padding: '22px 0', margin: '0 0 26px',
        }}>
          “{team.quote}”
        </blockquote>

        <p style={{ fontSize: 15.5, lineHeight: 1.8, color: 'rgba(244,239,224,0.72)', marginBottom: 26 }}>
          {team.description}
        </p>

        <ol style={{ padding: 0, margin: '0 0 30px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {team.storyBeats.map((b, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
              animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              style={{ display: 'flex', gap: 12, fontSize: 13, color: 'rgba(244,239,224,0.6)', lineHeight: 1.5 }}
            >
              <span style={{ fontFamily: 'var(--mono)', color: team.mood }}>{String(i + 1).padStart(2, '0')}</span>{b}
            </motion.li>
          ))}
        </ol>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <LinkRow links={team.links} dark mood={team.mood} />
          <CopyLinkButton slug={team.slug} dark mood={team.mood} />
        </div>
        <FilmStrip team={team} dark />
      </div>

      <style>{`
        @media (max-width: 560px) {
          .aql-stamp { position: static !important; margin-bottom: 20px; transform: rotate(-6deg); }
        }
      `}</style>
    </section>
  )
}
