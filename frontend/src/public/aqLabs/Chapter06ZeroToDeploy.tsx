import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, LinkRow, MediumBadge, MeaningLine, PhotoPop, ScrollBuild, processSrc } from './Shared'

const LADDER = [
  { tier: 'Institute', weight: 'highest', width: '100%' },
  { tier: 'Employer', weight: 'high', width: '82%' },
  { tier: 'Portfolio', weight: 'moderate', width: '58%' },
  { tier: 'Peer', weight: 'low', width: '30%' },
  { tier: 'Self-declared', weight: 'none', width: '8%' },
]

// Chapter 06 — Zero to Deploy. The seal: the wordmark doesn't sit inline
// with the title, it fills the screen and stamps down like an official
// seal being pressed onto a document — then the chapter proper opens
// below, where their own trust-weighting argument gets built twice: once
// as their real chart, once as a ladder of bars that grows shorter rung
// by rung, so "self-declared claims are worth nothing" is something you
// watch happen, not just read.
export default function Chapter06ZeroToDeploy({ team }: { team: AQLabsTeam }) {
  return (
    <section id={team.slug} style={{
      background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0 2px, transparent 2px 22px), #141210',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* ── the seal ── */}
      <div style={{ minHeight: '86vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '90px 24px 40px', position: 'relative' }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(circle at 50% 45%, ${team.mood}14, transparent 55%)`,
        }} />
        <div style={{ position: 'absolute', top: 24, left: 24 }}>
          <ChapterEyebrow team={team} dark />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 2.4, rotate: 14 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          style={{
            background: '#F4EFE0', borderRadius: 20, padding: '26px 40px', flexShrink: 0,
            boxShadow: `0 0 0 3px ${team.mood}55, 0 30px 70px rgba(0,0,0,0.5)`, marginBottom: 30,
          }}
        >
          <img src={processSrc(team.slug, 'logo.jpg')} alt="हुनर — Hunar" style={{ height: 'min(90px, 14vw)', display: 'block' }} />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(38px,6.5vw,68px)', color: '#F4EFE0' }}
        >
          {team.projectName}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          style={{ fontFamily: 'var(--mono)', fontSize: 12, color: team.mood, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 8 }}
        >
          {team.tagline}
        </motion.p>
        <div style={{ marginTop: 20 }}><MediumBadge team={team} dark /></div>
      </div>

      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '30px 24px 110px', position: 'relative' }}>
        <ScrollBuild>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(20px,2.6vw,28px)', lineHeight: 1.4, color: '#F4EFE0', maxWidth: 680, marginBottom: 22 }}>
            {team.spark}
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(244,239,224,0.65)', maxWidth: 680, marginBottom: 48 }}>
            {team.tension}
          </p>
        </ScrollBuild>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 44, alignItems: 'start' }} className="aql-hunar-grid">
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(244,239,224,0.4)', marginBottom: 16 }}>
              their argument, watched happening
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {LADDER.map((l) => (
                <LadderRow key={l.tier} tier={l.tier} weight={l.weight} width={l.width} color={team.mood} />
              ))}
            </div>
            <ScrollBuild>
              <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'rgba(244,239,224,0.5)', marginTop: 18 }}>
                {team.craft}
              </p>
            </ScrollBuild>
          </div>

          <PhotoPop fromLeft={false}>
            <figure style={{ margin: 0, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.14)', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}>
              <img
                src={processSrc(team.slug, '01-trust-sources-donut-chart.jpeg')}
                alt="Their own weighting model — five sources of proof, ranked by how hard each is to fake."
                loading="lazy" decoding="async"
                style={{ width: '100%', display: 'block', aspectRatio: '9/17', objectFit: 'cover' }}
              />
            </figure>
            <figcaption style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12.5, lineHeight: 1.4, color: 'rgba(244,239,224,0.5)', marginTop: 8 }}>
              Their own slide — the same ranking, in their own words.
            </figcaption>
          </PhotoPop>
        </div>

        <ScrollBuild>
          <div style={{ marginTop: 48 }}>
            <MeaningLine team={team} dark />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <LinkRow links={team.links} dark mood={team.mood} />
              <CopyLinkButton slug={team.slug} dark mood={team.mood} />
            </div>
          </div>
        </ScrollBuild>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .aql-hunar-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}

function LadderRow({ tier, weight, width, color }: { tier: string; weight: string; width: string; color: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.95', 'start 0.6'] })
  const barWidth = useTransform(scrollYProgress, [0, 1], ['0%', width])
  const labelOpacity = useTransform(scrollYProgress, [0, 1], [0.2, 1])
  return (
    <div ref={ref}>
      <motion.div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(244,239,224,0.7)', marginBottom: 4, opacity: labelOpacity }}>
        <span>{tier}</span>
        <span style={{ fontFamily: 'var(--mono)', color }}>{weight}</span>
      </motion.div>
      <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
        <motion.div style={{ height: '100%', background: color, borderRadius: 999, width: barWidth }} />
      </div>
    </div>
  )
}
