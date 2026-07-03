import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, LinkRow, MediumBadge, MeaningLine, ScrollBuild, processSrc } from './Shared'

// Chapter 05 — Idea Architects. Cold open: their own poster fills the
// screen, dimmed and blurred just enough to read the title over it, bold
// and full-width against the plain wash. Then the poster surfaces
// properly, unrolled like a print being laid on a table, before it
// settles into a perpetual sway.
export default function Chapter05IdeaArchitects({ team }: { team: AQLabsTeam }) {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15])

  return (
    <section id={team.slug} style={{
      background: 'repeating-radial-gradient(circle at 50% 50%, transparent 0 18px, rgba(30,60,20,0.045) 18px 19px, transparent 19px 42px), #F1F3EA',
    }}>
      {/* ── cold open ── */}
      <div ref={heroRef} style={{ position: 'relative', minHeight: '88vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div style={{ position: 'absolute', inset: 0, scale: heroScale }}>
          <img
            src={processSrc(team.slug, '02-cirqle-categories-infographic.jpg')}
            alt="Their own explainer poster"
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(2px) brightness(0.35)' }}
          />
          <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 45%, rgba(22,20,10,0.35), rgba(15,15,8,0.75))' }} />
        </motion.div>

        <div style={{ position: 'relative', textAlign: 'center', padding: '0 24px', width: '100%' }}>
          <ChapterEyebrow team={team} dark />
          <div style={{ display: 'flex', justifyContent: 'center' }}><MediumBadge team={team} dark /></div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="h-display"
            style={{
              fontSize: 'clamp(52px,11vw,132px)', fontWeight: 900, color: '#fff', lineHeight: 0.96,
              textShadow: '0 4px 30px rgba(0,0,0,0.7)', letterSpacing: '-0.02em',
            }}
          >
            {team.projectName}
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ width: 72, height: 5, background: team.mood, margin: '18px auto 0', transformOrigin: 'center' }}
          />
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(17px,2.1vw,24px)', color: team.mood, marginTop: 14, textShadow: '0 2px 16px rgba(0,0,0,0.6)' }}>
            {team.tagline}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '70px 24px 110px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 48, alignItems: 'start' }} className="aql-cirqle-grid">
          <ScrollBuild>
            <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(19px,2.3vw,24px)', lineHeight: 1.5, color: 'var(--ink)', marginBottom: 20 }}>
              {team.spark}
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--txt-2)', marginBottom: 20 }}>
              {team.tension}
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--txt-2)', marginBottom: 32 }}>
              {team.craft}
            </p>
            <MeaningLine team={team} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <LinkRow links={team.links} mood={team.mood} />
              <CopyLinkButton slug={team.slug} mood={team.mood} />
            </div>
          </ScrollBuild>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <UnrollPlate
              src={processSrc(team.slug, '01-what-is-cirqle-infographic.jpg')}
              caption="Their own icon for the idea itself — hand-drawn, not a stock graphic."
              delay={0}
              fromLeft
            />
            <UnrollPlate
              src={processSrc(team.slug, '02-cirqle-categories-infographic.jpg')}
              caption="The full explainer poster, hand-illustrated — what actually moves through the network."
              delay={0.18}
              fromLeft={false}
            />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .aql-cirqle-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}

function UnrollPlate({ src, caption, delay, fromLeft }: { src: string; caption: string; delay: number; fromLeft: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.95', 'start 0.5'] })
  const scaleY = useTransform(scrollYProgress, [0, 1], [0.08, 1])
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const x = useTransform(scrollYProgress, [0, 1], [fromLeft ? -60 : 60, 0])
  return (
    <motion.figure ref={ref} style={{ margin: 0, transformOrigin: 'top center', scaleY, opacity, x }}>
      <motion.div
        animate={{ rotate: [-0.6, 0.6, -0.6] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.7 }}
        style={{
          borderRadius: 10, overflow: 'hidden', border: '1px solid var(--line-2)',
          boxShadow: '0 14px 34px rgba(0,0,0,0.10)',
        }}
      >
        <img src={src} alt={caption} loading="lazy" decoding="async" style={{ width: '100%', display: 'block', aspectRatio: '1/1', objectFit: 'cover' }} />
      </motion.div>
      <figcaption style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12.5, lineHeight: 1.4, color: 'var(--txt-3)', marginTop: 8 }}>
        {caption}
      </figcaption>
    </motion.figure>
  )
}
