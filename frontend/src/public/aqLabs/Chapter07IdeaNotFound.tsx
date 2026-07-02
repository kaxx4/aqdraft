import { motion } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, LinkRow, slideSrc } from './Shared'

const SPECS = ['heart rate', 'SpO2', 'sleep', 'activity', 'stress']

// Chapter 07 — 404-Idea Not Found. A minimal, near-black spotlight room:
// the bracelet opens into view like a camera aperture, haloed by a slow
// breathing glow — light as the whole point.
export default function Chapter07IdeaNotFound({ team }: { team: AQLabsTeam }) {
  return (
    <section id={team.slug} style={{ background: '#0B0B0B', padding: '110px 24px 130px', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{
        position: 'absolute', top: '18%', left: '50%', width: 460, height: 460, transform: 'translateX(-50%)',
        borderRadius: '50%', background: `radial-gradient(circle, ${team.mood}33, transparent 70%)`,
        animation: 'aql-breathe 4.5s ease-in-out infinite',
      }} />
      <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative', textAlign: 'center' }}>
        <ChapterEyebrow team={team} dark />
        <p style={{ fontFamily: 'var(--mono)', fontSize: 11.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: team.mood, marginBottom: 18 }}>
          {team.tagline}
        </p>

        <motion.div
          initial={{ clipPath: 'circle(0% at 50% 50%)', opacity: 0.4 }}
          whileInView={{ clipPath: 'circle(75% at 50% 50%)', opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.9, ease: [0.2, 0, 0, 1] }}
          style={{ width: 240, margin: '0 auto 30px', borderRadius: '50%', overflow: 'hidden', boxShadow: `0 0 70px ${team.mood}44` }}
        >
          <img src={slideSrc(team.slug, 1)} alt={team.projectName} loading="lazy" decoding="async"
            style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(40px,7vw,76px)', color: '#F4EFE0', letterSpacing: '0.02em', marginBottom: 20 }}
        >
          {team.projectName}
        </motion.h2>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
          {SPECS.map(s => (
            <span key={s} style={{
              fontFamily: 'var(--mono)', fontSize: 10.5, color: 'rgba(244,239,224,0.55)',
              border: '1px solid rgba(244,239,224,0.18)', borderRadius: 999, padding: '5px 12px',
            }}>{s}</span>
          ))}
        </div>

        <p style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(244,239,224,0.62)', maxWidth: 560, margin: '0 auto 30px' }}>
          {team.description}
        </p>

        <blockquote style={{
          fontFamily: 'var(--serif)', fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(20px,2.8vw,28px)',
          color: '#F4EFE0', margin: '0 0 34px',
        }}>
          “{team.quote}”
        </blockquote>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'center' }}>
          <LinkRow links={team.links} dark mood={team.mood} />
          <CopyLinkButton slug={team.slug} dark mood={team.mood} />
        </div>
      </div>

      <style>{`
        @keyframes aql-breathe {
          0%, 100% { opacity: 0.55; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.9; transform: translateX(-50%) scale(1.12); }
        }
      `}</style>
    </section>
  )
}
