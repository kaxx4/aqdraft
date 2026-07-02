import { motion } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, LinkRow } from './Shared'

// Chapter 05 — Idea Architects. A slow-turning ring room: the four story
// beats orbit the tagline like items moving through a shared community —
// nothing owned, everything circulating.
export default function Chapter05IdeaArchitects({ team }: { team: AQLabsTeam }) {
  const n = team.storyBeats.length
  const radius = 42 // percent
  return (
    <section id={team.slug} style={{ background: '#160B2E', padding: '110px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
        <ChapterEyebrow team={team} dark />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="h-display"
          style={{ fontSize: 'clamp(34px,5vw,58px)', color: '#fff' }}
        >
          {team.projectName}
        </motion.h2>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(17px,2.1vw,23px)', color: team.mood, margin: '10px 0 8px' }}>
          {team.tagline}
        </p>

        <div className="aql-ring-stage" style={{ position: 'relative', width: '100%', maxWidth: 560, aspectRatio: '1/1', margin: '30px auto' }}>
          <motion.div
            aria-hidden
            style={{ position: 'absolute', inset: '10%', borderRadius: '50%', border: `1.5px dashed ${team.mood}55` }}
            animate={{ rotate: 360 }}
            transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
          />
          {/* center */}
          <div style={{
            position: 'absolute', inset: '32%', borderRadius: '50%', background: team.mood,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12,
            boxShadow: `0 0 60px ${team.mood}55`,
          }}>
            <span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 14, color: '#fff', textAlign: 'center', lineHeight: 1.25 }}>
              {team.category}
            </span>
          </div>

          {team.storyBeats.map((b, i) => {
            const angle = (i / n) * Math.PI * 2 - Math.PI / 2
            const x = 50 + radius * Math.cos(angle)
            const y = 50 + radius * Math.sin(angle)
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.12 }}
                style={{
                  position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)',
                  width: '38%', maxWidth: 190,
                }}
              >
                <div style={{
                  background: 'rgba(255,255,255,0.06)', border: `1px solid ${team.mood}55`, borderRadius: 14,
                  padding: '12px 14px', fontSize: 11.5, lineHeight: 1.45, color: 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(4px)',
                }}>
                  {b}
                </div>
              </motion.div>
            )
          })}
        </div>

        <p style={{ fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.65)', maxWidth: 620, margin: '0 auto 24px' }}>
          {team.description}
        </p>

        <blockquote style={{
          fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(22px,3vw,30px)',
          color: '#fff', margin: '0 0 28px',
        }}>
          “{team.quote}”
        </blockquote>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'center' }}>
          <LinkRow links={team.links} dark mood={team.mood} />
          <CopyLinkButton slug={team.slug} dark mood={team.mood} />
        </div>
      </div>

      <style>{`
        @media (max-width: 560px) {
          .aql-ring-stage { max-width: 400px !important; }
        }
      `}</style>
    </section>
  )
}
