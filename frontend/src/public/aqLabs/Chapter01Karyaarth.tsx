import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, LinkRow, MediumBadge, MeaningLine, ScrollBuild, processSrc } from './Shared'

const GALLERY = [
  { file: '03-vendor-handoff.jpg', caption: 'The reach across a vegetable stall — the actual moment the interview started.' },
  { file: '04-interview-mic-rose.jpg', caption: 'A crochet flower for a mic. She talked for twenty minutes anyway.' },
  { file: '05-momo-vendor-closeup.jpg', caption: 'Steam off the momo baskets — a detail no script would think to ask for.' },
  { file: '06-crew-candid-market.jpg', caption: 'The crew, mid-market, mid-sentence.' },
  { file: '02-flower-market-portrait.jpg', caption: 'Between takes.' },
  { file: '07-corn-roaster-daytime.jpg', caption: 'Daylight, for once — a bhutta seller over open coals.' },
  { file: '09-interview-icecream-vendor.jpg', caption: 'No boom mic. A phone, held steady, and a question worth waiting for.' },
]

function Reveal({ children }: { children: React.ReactNode; delay?: number }) {
  return <ScrollBuild>{children}</ScrollBuild>
}

// Chapter 01 — Karyaarth. A documentary trailer, not a case study: a
// full-bleed cold open on the actual handshake that started an interview,
// then the spark and the gap as narration over a dark screen, then a
// cascading photo sequence — every real shot from the night, one after
// another — before the quiet close.
export default function Chapter01Karyaarth({ team }: { team: AQLabsTeam }) {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.14])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const titleY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%'])

  return (
    <section id={team.slug} style={{
      background: 'repeating-radial-gradient(circle at 0 0, rgba(255,255,255,0.028) 0 1px, transparent 1px 3px), #0A0A0A',
    }}>
      {/* ── cold open ── */}
      <div ref={heroRef} style={{ position: 'relative', minHeight: '94vh', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
        <motion.div style={{ position: 'absolute', inset: 0, scale: heroScale, opacity: heroOpacity }}>
          <img
            src={processSrc(team.slug, '08-graded-icecream-vendor-portrait.jpg')}
            alt="An ice-cream vendor, Kolkata"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0A0A0A 8%, rgba(10,10,10,0.1) 50%, rgba(10,10,10,0.55) 100%)' }} />
        </motion.div>

        <motion.div style={{ position: 'relative', maxWidth: 1180, margin: '0 auto', padding: '160px 24px 56px', width: '100%', y: titleY }}>
          <ChapterEyebrow team={team} dark />
          <MediumBadge team={team} dark />
          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.2, 0, 0, 1] }}
            className="h-display"
            style={{ fontSize: 'clamp(46px, 8vw, 100px)', color: '#fff' }}
          >
            {team.teamName}<span style={{ color: team.mood }}>.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(18px,2.4vw,26px)', color: team.mood, marginTop: 8 }}
          >
            {team.tagline}
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.35 }} style={{ marginTop: 16 }}>
            <LinkRow links={team.links} dark mood={team.mood} />
          </motion.div>
        </motion.div>
      </div>

      {/* ── narration over dark — kept tight, one screenful ── */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '56px 24px 44px' }}>
        <Reveal>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(18px,2.2vw,23px)', lineHeight: 1.4, color: '#F4EFE0', marginBottom: 18 }}>
            {team.spark}
          </p>
          <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'rgba(244,239,224,0.62)', marginBottom: 8 }}>
            {team.tension}
          </p>
          <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'rgba(244,239,224,0.62)' }}>
            {team.craft}
          </p>
        </Reveal>
      </div>

      {/* ── the cascade — every real photo from the shoot, as a compact contact sheet ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 50px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }} className="aql-contact-sheet">
          {GALLERY.map((g, i) => (
            <ContactPhoto key={g.file} team={team} file={g.file} caption={g.caption} index={i} />
          ))}
        </div>
      </div>

      {/* ── close ── */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '10px 24px 100px' }}>
        <Reveal>
          <MeaningLine team={team} dark />
          <blockquote style={{
            fontFamily: 'var(--mono)', fontSize: 12.5, color: 'rgba(244,239,224,0.5)',
            borderLeft: `2px solid ${team.mood}`, paddingLeft: 14, margin: '0 0 22px',
          }}>
            “{team.quote}”
          </blockquote>
          <CopyLinkButton slug={team.slug} dark mood={team.mood} />
        </Reveal>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .aql-contact-sheet { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  )
}

function ContactPhoto({ team, file, caption, index }: { team: AQLabsTeam; file: string; caption: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.95', 'start 0.65'] })
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1])
  return (
    <motion.figure
      ref={ref}
      style={{ margin: 0, opacity, scale, transitionDelay: `${(index % 4) * 0.03}s` }}
    >
      <div style={{ borderRadius: 8, overflow: 'hidden' }}>
        <img src={processSrc(team.slug, file)} alt={caption} loading="lazy" decoding="async"
          style={{ width: '100%', display: 'block', aspectRatio: '4/5', objectFit: 'cover' }} />
      </div>
      <figcaption style={{
        fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 11.5,
        lineHeight: 1.35, color: 'rgba(244,239,224,0.6)', marginTop: 6,
      }}>
        {caption}
      </figcaption>
    </motion.figure>
  )
}
