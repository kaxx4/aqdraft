import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, LinkRow, MediumBadge, MeaningLine, Narrative, Plate, processSrc } from './Shared'

const WALL = [
  { file: '01-bts-filming-market-night.jpg', caption: 'The crew, filming after dark — a single string of market bulbs for light.' },
  { file: '09-interview-icecream-vendor.jpg', caption: 'No boom mic. A phone, held steady, and a question worth waiting for.' },
  { file: '05-momo-vendor-closeup.jpg', caption: 'Steam off the momo baskets — the kind of detail a script would never think to ask for.' },
  { file: '07-corn-roaster-daytime.jpg', caption: 'Daylight, for once — a bhutta seller over open coals.' },
]

// Chapter 01 — Karyaarth. A gallery wall, shot like a documentary trailer:
// the hero portrait holds a slow Ken-Burns push the whole way through the
// chapter, and the contact-sheet below drifts up at staggered speeds as
// you scroll past it — like someone laying prints out on a table one at
// a time, faster than you can look away.
export default function Chapter01Karyaarth({ team }: { team: AQLabsTeam }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.16])
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '-6%'])
  const numeralY = useTransform(scrollYProgress, [0, 0.5], ['0%', '-40%'])
  const numeralOpacity = useTransform(scrollYProgress, [0, 0.3], [0.14, 0.04])

  return (
    <section id={team.slug} ref={ref} style={{ background: '#F3EDE1', padding: '110px 24px', overflow: 'hidden', position: 'relative' }}>
      <motion.div
        aria-hidden
        style={{
          position: 'absolute', top: -40, left: 24, y: numeralY, opacity: numeralOpacity,
          fontFamily: 'var(--display)', fontWeight: 800, fontSize: 'min(46vw,420px)', lineHeight: 1,
          color: team.mood, pointerEvents: 'none', userSelect: 'none',
        }}
      >
        01
      </motion.div>

      <div style={{ maxWidth: 1180, margin: '0 auto', position: 'relative' }}>
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
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(18px,2.2vw,24px)', color: team.mood, margin: '10px 0 40px' }}>
          {team.tagline}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.1fr)', gap: 56 }} className="aql-two-col">
          <div>
            <Narrative team={team} />
            <MeaningLine team={team} />
            <blockquote style={{
              fontFamily: 'var(--mono)', fontSize: 12.5, color: 'var(--txt-3)',
              borderLeft: `2px solid ${team.mood}`, paddingLeft: 14, margin: '0 0 26px',
            }}>
              “{team.quote}”
            </blockquote>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <LinkRow links={team.links} mood={team.mood} />
              <CopyLinkButton slug={team.slug} mood={team.mood} />
            </div>
          </div>

          <div style={{ overflow: 'hidden', borderRadius: 10 }}>
            <motion.div style={{ scale: heroScale, y: heroY }}>
              <img
                src={processSrc(team.slug, '08-graded-icecream-vendor-portrait.jpg')}
                alt="An ice-cream vendor, Kolkata"
                style={{ width: '100%', display: 'block', aspectRatio: '4/3', objectFit: 'cover' }}
              />
            </motion.div>
            <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12.5, color: 'var(--txt-3)', marginTop: 8 }}>
              An ice-cream vendor, Kolkata — the first frame anyone actually kept.
            </p>
          </div>
        </div>

        {/* the wall — staggered parallax drift, like prints being laid out */}
        <div style={{ marginTop: 56 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 16 }}>
            from the shoot
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }} className="aql-wall-grid">
            {WALL.map((w, i) => (
              <WallPlate key={w.file} team={team} file={w.file} caption={w.caption} index={i} scrollYProgress={scrollYProgress} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .aql-two-col { grid-template-columns: 1fr !important; }
          .aql-wall-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  )
}

function WallPlate({ team, file, caption, index, scrollYProgress }: {
  team: AQLabsTeam; file: string; caption: string; index: number
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress']
}) {
  const drift = useTransform(scrollYProgress, [0.35, 1], ['0%', `${-(6 + index * 4)}%`])
  return (
    <motion.div style={{ y: drift }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.08 }}
      >
        <Plate src={processSrc(team.slug, file)} caption={caption} aspect="4/3" />
      </motion.div>
    </motion.div>
  )
}
