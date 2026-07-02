import { motion } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, CountTo, FilmStrip, LinkRow, MediumBadge, slideSrc } from './Shared'

const STATS: { value: number; decimals?: number; prefix?: string; suffix: string; label: string }[] = [
  { value: 1.5, decimals: 1, suffix: ' Cr', label: 'higher-ed grads, every year' },
  { value: 42.6, decimals: 1, suffix: '%', label: 'considered employable' },
  { value: 25, suffix: '%', label: 'digital talent gap' },
  { value: 25, suffix: ' L', label: 'skilled people emigrate yearly' },
]

// Chapter 02 — Merge Conflicts. A dark, data-forward "situation room": the
// stats count themselves up the moment they enter view.
export default function Chapter02MergeConflicts({ team }: { team: AQLabsTeam }) {
  return (
    <section id={team.slug} style={{ background: '#0A0A0A', padding: '110px 24px', position: 'relative', overflow: 'hidden' }}>
      {/* faint vertical bar-chart texture */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none',
        backgroundImage: `repeating-linear-gradient(90deg, ${team.mood} 0 2px, transparent 2px 48px)`,
      }} />
      <div style={{ maxWidth: 980, margin: '0 auto', position: 'relative' }}>
        <ChapterEyebrow team={team} dark />
        <MediumBadge team={team} dark />
        <motion.h2
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="h-display"
          style={{ fontSize: 'clamp(36px,5.4vw,64px)', color: '#fff' }}
        >
          {team.projectName}<span style={{ color: team.mood }}>.</span>
        </motion.h2>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(18px,2.2vw,24px)', color: team.mood, margin: '10px 0 34px' }}>
          {team.tagline}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 40 }} className="aql-stat-grid">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30, rotate: i % 2 === 0 ? -2 : 2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.2, 0, 0, 1] }}
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)',
                borderRadius: 16, padding: '20px 16px',
              }}
            >
              <div className="h-display" style={{ fontSize: 'clamp(26px,3.2vw,36px)', color: team.mood }}>
                <CountTo value={s.value} decimals={s.decimals} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.55)', marginTop: 6, lineHeight: 1.4 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 32, alignItems: 'start', marginBottom: 26 }} className="aql-cc-grid">
          <p style={{ fontSize: 15.5, lineHeight: 1.75, color: 'rgba(255,255,255,0.72)' }}>
            {team.description}
          </p>
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{ borderRadius: 12, overflow: 'hidden', border: `1.5px solid ${team.mood}44`, boxShadow: `0 20px 50px ${team.mood}22` }}
          >
            <img src={slideSrc(team.slug, team.heroSlide)} alt={`${team.projectName} — product screenshot`}
              loading="lazy" decoding="async" style={{ width: '100%', display: 'block' }} />
          </motion.div>
        </div>

        <blockquote style={{
          fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(22px,3vw,32px)',
          color: '#fff', borderLeft: `3px solid ${team.mood}`, paddingLeft: 18, margin: '0 0 28px', maxWidth: 620,
        }}>
          “{team.quote}”
        </blockquote>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <LinkRow links={team.links} dark mood={team.mood} />
          <CopyLinkButton slug={team.slug} dark mood={team.mood} />
        </div>
        <FilmStrip team={team} dark />
      </div>

      <style>{`
        @media (max-width: 720px) {
          .aql-stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .aql-cc-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
