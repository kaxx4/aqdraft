import { motion } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, LinkRow, MediumBadge, MeaningLine, Narrative, processSrc } from './Shared'

// Chapter 05 — Idea Architects. The commons: their own poster doesn't
// fade in, it unrolls — scaling up from a flat strip anchored at the top,
// like a print being unrolled onto a table — and settles into a gentle,
// perpetual sway once it's up, like it's still catching a breeze.
export default function Chapter05IdeaArchitects({ team }: { team: AQLabsTeam }) {
  return (
    <section id={team.slug} style={{ background: '#F1F3EA', padding: '110px 24px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <ChapterEyebrow team={team} />
        <MediumBadge team={team} />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="h-display"
          style={{ fontSize: 'clamp(36px,5.4vw,60px)', color: team.mood }}
        >
          {team.projectName}
        </motion.h2>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(17px,2.1vw,23px)', color: 'var(--ink)', margin: '8px 0 40px' }}>
          {team.tagline}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 48, alignItems: 'start' }} className="aql-cirqle-grid">
          <div>
            <Narrative team={team} />
            <MeaningLine team={team} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <LinkRow links={team.links} mood={team.mood} />
              <CopyLinkButton slug={team.slug} mood={team.mood} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <UnrollPlate
              src={processSrc(team.slug, '01-what-is-cirqle-infographic.jpg')}
              caption="Their own icon for the idea itself — hand-drawn, not a stock graphic."
              delay={0}
            />
            <UnrollPlate
              src={processSrc(team.slug, '02-cirqle-categories-infographic.jpg')}
              caption="The full explainer poster, hand-illustrated — what actually moves through the network."
              delay={0.18}
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

function UnrollPlate({ src, caption, delay }: { src: string; caption: string; delay: number }) {
  return (
    <motion.figure
      initial={{ opacity: 0, scaleY: 0.08 }}
      animate={{ opacity: 1, scaleY: 1 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ margin: 0, transformOrigin: 'top center' }}
    >
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
