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
        </motion.div>
      </div>

      {/* ── narration over dark ── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '90px 24px 70px' }}>
        <Reveal>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: team.mood, marginBottom: 10 }}>
            the spark
          </div>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(20px,2.6vw,28px)', lineHeight: 1.45, color: '#F4EFE0', marginBottom: 38 }}>
            {team.spark}
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: team.mood, marginBottom: 10 }}>
            the gap
          </div>
          <p style={{ fontSize: 15.5, lineHeight: 1.8, color: 'rgba(244,239,224,0.68)', marginBottom: 38 }}>
            {team.tension}
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: team.mood, marginBottom: 10 }}>
            the making
          </div>
          <p style={{ fontSize: 15.5, lineHeight: 1.8, color: 'rgba(244,239,224,0.68)' }}>
            {team.craft}
          </p>
        </Reveal>
      </div>

      {/* ── the cascade — every real photo from the shoot ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 40px' }}>
        {GALLERY.map((g, i) => (
          <CascadePhoto key={g.file} team={team} file={g.file} caption={g.caption} index={i} />
        ))}
      </div>

      {/* ── close ── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 24px 110px' }}>
        <Reveal>
          <MeaningLine team={team} dark />
          <blockquote style={{
            fontFamily: 'var(--mono)', fontSize: 12.5, color: 'rgba(244,239,224,0.5)',
            borderLeft: `2px solid ${team.mood}`, paddingLeft: 14, margin: '0 0 26px',
          }}>
            “{team.quote}”
          </blockquote>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <LinkRow links={team.links} dark mood={team.mood} />
            <CopyLinkButton slug={team.slug} dark mood={team.mood} />
          </div>
        </Reveal>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .aql-cascade-row { flex-direction: column !important; }
          .aql-cascade-row p { text-align: left !important; }
        }
      `}</style>
    </section>
  )
}

function CascadePhoto({ team, file, caption, index }: { team: AQLabsTeam; file: string; caption: string; index: number }) {
  const flip = index % 2 === 1
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.95', 'start 0.55'] })
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const x = useTransform(scrollYProgress, [0, 1], [flip ? 70 : -70, 0])
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.12, 1])
  return (
    <motion.div
      ref={ref}
      style={{
        display: 'flex', flexDirection: flip ? 'row-reverse' : 'row', alignItems: 'center', gap: 32,
        padding: '26px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', opacity, x,
      }}
      className="aql-cascade-row"
    >
      <div style={{ flex: '0 0 56%', borderRadius: 10, overflow: 'hidden' }}>
        <motion.img src={processSrc(team.slug, file)} alt={caption} loading="lazy" decoding="async"
          style={{ width: '100%', display: 'block', aspectRatio: '16/10', objectFit: 'cover', scale: imgScale }} />
      </div>
      <p style={{
        flex: 1, fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(16px,2vw,20px)',
        lineHeight: 1.5, color: 'rgba(244,239,224,0.75)', textAlign: flip ? 'right' : 'left',
      }}>
        {caption}
      </p>
    </motion.div>
  )
}
