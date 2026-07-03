import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, LinkRow, MediumBadge, MeaningLine, ScrollBuild, processSrc } from './Shared'

const ASSEMBLY = [
  { file: '01-modus-band-concept-render.jpeg', caption: 'The concept — musical notation, engraved before anything was built.' },
  { file: '02-technical-blueprint-spec-sheet.jpeg', caption: '42mm sensor module. 20mm links. Toleranced like a jeweller\'s drawing.' },
  { file: '04-mechanism-assembly-diagram.jpeg', caption: 'Align. Slide. Lock. Secure. — the snap mechanism, worked out to the millimetre.' },
  { file: '03-wrist-mockup-render.jpeg', caption: 'Worn, not charged — the design brief, resolved.' },
]

// Chapter 07 — 404-Idea Not Found. The atelier: a full-bleed photographic
// cold open on the wrist itself — the object before the name — with the
// pitch name ("Photon") burning off into the real one ("Modus Band") as
// you scroll, before the assembly line of all four real images: concept,
// blueprint, mechanism, object, in invention order.
export default function Chapter07IdeaNotFound({ team }: { team: AQLabsTeam }) {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15])

  return (
    <section id={team.slug} style={{ background: '#0B0C0E' }}>
      {/* ── cold open ── */}
      <div ref={heroRef} style={{ position: 'relative', minHeight: '90vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div style={{ position: 'absolute', inset: 0, scale: heroScale }}>
          <img
            src={processSrc(team.slug, '03-wrist-mockup-render.jpeg')}
            alt="Worn, not charged"
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.35)' }}
          />
          <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 45%, rgba(11,12,14,0.35), rgba(11,12,14,0.75))' }} />
        </motion.div>

        <div style={{ position: 'relative', textAlign: 'center', padding: '0 24px' }}>
          <ChapterEyebrow team={team} dark />
          <div style={{ display: 'flex', justifyContent: 'center' }}><MediumBadge team={team} dark /></div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{ fontFamily: 'var(--mono)', fontSize: 'clamp(13px,1.6vw,16px)', color: 'rgba(244,239,224,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}
          >
            pitched as "{team.projectName}" · built as —
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(42px,7.5vw,90px)', color: '#F4EFE0',
              textShadow: '0 4px 30px rgba(0,0,0,0.6)',
            }}
          >
            Modus Band
          </motion.h2>
        </div>
      </div>

      {/* ── the assembly line ── */}
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '80px 24px 60px' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(244,239,224,0.4)', marginBottom: 20 }}>
          the order it was actually invented in
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="aql-assembly-grid">
          {ASSEMBLY.map((a, i) => (
            <ScrollBuild key={a.file} y={34}>
              <figure style={{ margin: 0 }}>
                <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.14)' }}>
                  <div style={{
                    position: 'absolute', top: 8, left: 8, zIndex: 2, fontFamily: 'var(--mono)', fontSize: 10.5,
                    color: '#0B0C0E', background: team.mood, borderRadius: 999, padding: '2px 8px', fontWeight: 700,
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <img src={processSrc(team.slug, a.file)} alt={a.caption} loading="lazy" decoding="async"
                    style={{ width: '100%', display: 'block', aspectRatio: '4/5', objectFit: 'cover' }} />
                </div>
                <figcaption style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 11.5, lineHeight: 1.4, color: 'rgba(244,239,224,0.5)', marginTop: 8 }}>
                  {a.caption}
                </figcaption>
              </figure>
            </ScrollBuild>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 24px 110px' }}>
        <ScrollBuild>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(19px,2.3vw,24px)', lineHeight: 1.5, color: '#F4EFE0', marginBottom: 20 }}>
            {team.spark}
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(244,239,224,0.65)', marginBottom: 20 }}>
            {team.tension}
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(244,239,224,0.65)', marginBottom: 32 }}>
            {team.craft}
          </p>
          <MeaningLine team={team} dark />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <LinkRow links={team.links} dark mood={team.mood} />
            <CopyLinkButton slug={team.slug} dark mood={team.mood} />
          </div>
        </ScrollBuild>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .aql-assembly-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  )
}
