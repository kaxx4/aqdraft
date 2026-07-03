import { motion } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, LinkRow, MediumBadge, MeaningLine, ScrollBuild, processSrc } from './Shared'

const sprout = { type: 'spring' as const, stiffness: 220, damping: 14 }

const TRACKS = [
  { name: 'Words', desc: 'vocabulary, in disguise as a game', color: '#E8A33D' },
  { name: 'Logic', desc: 'little puzzles, big brain', color: '#3D8EE8' },
  { name: 'The World', desc: 'GK that actually sticks', color: '#1E8449' },
]

// Chapter 04 — Alter Ego. A storybook cover: the logo opens the chapter
// filling most of the screen, huge, like a book cover — then the page
// turns (a real flip, rotateX) into the narrative, and the three tracks
// arrive as three separate pages, each turning a beat after the last.
export default function Chapter04AlterEgo({ team }: { team: AQLabsTeam }) {
  return (
    <section id={team.slug} style={{
      background: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px) 0 0/16px 16px, #0F2E1D',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* ── cover ── */}
      <div style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '90px 24px 60px', position: 'relative' }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.05), transparent 60%)',
        }} />
        <div style={{ position: 'absolute', top: 24, left: 24, right: 24 }}>
          <ChapterEyebrow team={team} dark />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={sprout}
          style={{
            width: 'min(280px, 60vw)', height: 'min(280px, 60vw)', borderRadius: '50%', overflow: 'hidden',
            border: '7px solid rgba(255,255,255,0.15)', boxShadow: '0 30px 70px rgba(0,0,0,0.5)', marginBottom: 26,
          }}
        >
          <img src={processSrc(team.slug, 'logo.jpg')} alt="Wisdom Woods logo" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...sprout, delay: 0.2 }}
          className="h-display"
          style={{ fontSize: 'clamp(38px,6.5vw,72px)', color: '#fff', textAlign: 'center' }}
        >
          {team.projectName}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(17px,2.2vw,22px)', color: '#9FD4B0', textAlign: 'center', marginTop: 6 }}
        >
          {team.tagline}
        </motion.p>
        <div style={{ marginTop: 20 }}><MediumBadge team={team} dark /></div>
      </div>

      {/* ── page turn into the story ── */}
      <motion.div
        initial={{ rotateX: -35, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.2, 0, 0, 1] }}
        style={{
          transformOrigin: 'top center',
          background: 'radial-gradient(rgba(15,46,29,0.05) 1px, transparent 1px) 0 0/16px 16px, #EAF4EA',
          borderRadius: '28px 28px 0 0', padding: '64px 24px 90px',
        }}
      >
        <div style={{ maxWidth: 940, margin: '0 auto' }}>
          <ScrollBuild>
            <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(19px,2.3vw,24px)', lineHeight: 1.5, color: 'var(--ink)', marginBottom: 20 }}>
              {team.spark}
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--txt-2)', marginBottom: 44, maxWidth: 620 }}>
              {team.tension}
            </p>
          </ScrollBuild>

          <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 14 }}>
            three tracks, one forest
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40, perspective: 1200 }} className="aql-tracks-grid">
            {TRACKS.map((t) => (
              <ScrollBuild key={t.name} scale={0.9}>
                <div style={{
                  background: '#fff', borderRadius: 16, padding: '22px 18px', height: '100%',
                  boxShadow: '0 8px 22px rgba(0,0,0,0.08)', borderTop: `4px solid ${t.color}`,
                }}>
                  <div className="h-display" style={{ fontSize: 22, color: t.color, marginBottom: 6 }}>{t.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--txt-2)', lineHeight: 1.5 }}>{t.desc}</div>
                </div>
              </ScrollBuild>
            ))}
          </div>

          <ScrollBuild>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--txt-2)', marginBottom: 20, maxWidth: 620 }}>
              {team.craft}
            </p>

            <MeaningLine team={team} />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <LinkRow links={team.links} mood={team.mood} />
              <CopyLinkButton slug={team.slug} mood={team.mood} />
            </div>
          </ScrollBuild>
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 640px) {
          .aql-tracks-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
