import { motion } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, FilmStrip, LinkRow, MediumBadge } from './Shared'

// Chapter 05 — Idea Architects. A slow-turning ring room: the story beats
// orbit the tagline like items moving through a shared community — nothing
// owned, everything circulating. The stage is forced square with the old
// padding-bottom trick (not the `aspect-ratio` CSS property) so it renders
// as a true circle on every browser, not just modern ones.
export default function Chapter05IdeaArchitects({ team }: { team: AQLabsTeam }) {
  const n = team.storyBeats.length
  const radius = 40 // percent of stage

  return (
    <section id={team.slug} style={{ background: '#160B2E', padding: '110px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
        <ChapterEyebrow team={team} dark />
        <MediumBadge team={team} dark />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="h-display"
          style={{ fontSize: 'clamp(34px,5vw,58px)', color: '#fff' }}
        >
          {team.projectName}
        </motion.h2>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(17px,2.1vw,23px)', color: team.mood, margin: '10px 0 8px' }}>
          {team.tagline}
        </p>

        {/* square stage: width is the source of truth, height comes from
            padding-bottom so the box is always exactly square. Hidden below
            640px — a radial layout has no good answer for a narrow phone
            screen, so mobile gets the plain stacked list further down instead. */}
        <div className="aql-ring-desktop-only" style={{ width: 'min(480px, 90vw)', margin: '30px auto 0', position: 'relative' }}>
          <div style={{ paddingBottom: '100%' }} />
          <div className="aql-ring-stage" style={{ position: 'absolute', inset: 0 }}>
            <motion.div
              aria-hidden
              style={{
                position: 'absolute', top: '10%', left: '10%', right: '10%', bottom: '10%',
                borderRadius: '50%', border: `1.5px dashed ${team.mood}55`,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
            />
            {/* center */}
            <div style={{
              position: 'absolute', top: '25%', left: '25%', right: '25%', bottom: '25%',
              borderRadius: '50%', background: team.mood,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '18%',
              boxSizing: 'border-box', boxShadow: `0 0 60px ${team.mood}55`,
            }}>
              <span style={{
                fontFamily: 'var(--display)', fontWeight: 800, fontSize: 'clamp(8px,2.2vw,11px)', color: '#fff',
                textAlign: 'center', lineHeight: 1.35,
              }}>
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
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.12 }}
                  style={{
                    position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)',
                    width: '36%',
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
        </div>

        {/* mobile fallback — same content, plain stacked cards around a
            small badge, no radial math to overflow a narrow viewport */}
        <div className="aql-ring-mobile-only" style={{ display: 'none', margin: '30px auto 0', maxWidth: 420 }}>
          <div style={{
            width: 96, height: 96, borderRadius: '50%', background: team.mood, margin: '0 auto 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18, boxSizing: 'border-box',
            boxShadow: `0 0 40px ${team.mood}55`,
          }}>
            <span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 8.5, color: '#fff', textAlign: 'center', lineHeight: 1.3 }}>
              {team.category}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {team.storyBeats.map((b, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.06)', border: `1px solid ${team.mood}55`, borderRadius: 14,
                padding: '12px 14px', fontSize: 12.5, lineHeight: 1.5, color: 'rgba(255,255,255,0.85)', textAlign: 'left',
              }}>
                {b}
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.65)', maxWidth: 620, margin: '40px auto 24px' }}>
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
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <FilmStrip team={team} dark />
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .aql-ring-desktop-only { display: none !important; }
          .aql-ring-mobile-only { display: block !important; }
        }
      `}</style>
    </section>
  )
}
