import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, LinkRow, MediumBadge, MeaningLine, processSrc } from './Shared'

const GALLERY = [
  '03-vendor-handoff.jpg',
  '04-interview-mic-rose.jpg',
  '05-momo-vendor-closeup.jpg',
  '06-crew-candid-market.jpg',
  '02-flower-market-portrait.jpg',
  '07-corn-roaster-daytime.jpg',
  '09-interview-icecream-vendor.jpg',
]

// Chapter 01 — Karyaarth. Layout: a magazine spread, not a scroll of
// stacked sections. One large graded portrait holds the left column and
// stays put while the right column — the actual editorial copy — scrolls
// past it, the way a print spread lets a photo anchor a page of text.
// The real shoot footage runs underneath as a contact sheet: one
// continuous filmstrip, not a grid, so it reads as one night, one roll
// of film, rather than seven separate images.
export default function Chapter01Karyaarth({ team }: { team: AQLabsTeam }) {
  const spreadRef = useRef<HTMLDivElement>(null)

  return (
    <section id={team.slug} style={{
      background: 'repeating-radial-gradient(circle at 0 0, rgba(255,255,255,0.028) 0 1px, transparent 1px 3px), #0A0A0A',
    }}>
      <div ref={spreadRef} className="aql-k-spread">
        {/* ── left — the portrait, pinned ── */}
        <div className="aql-k-photo">
          <img
            src={processSrc(team.slug, '08-graded-icecream-vendor-portrait.jpg')}
            alt="An ice-cream vendor, Kolkata, graded from the team's own footage"
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.3) contrast(1.08)' }}
          />
          <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.75), transparent 40%)' }} />
          <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em' }}>
              1:02 AM · a corner of Kolkata this vendor has held for years
            </span>
          </div>
        </div>

        {/* ── right — the copy, scrolling ── */}
        <div className="aql-k-copy">
          <ChapterEyebrow team={team} dark />
          <MediumBadge team={team} dark />
          <h2
            style={{
              fontFamily: "'Eina01', sans-serif", fontWeight: 700, textTransform: 'lowercase',
              fontSize: 'clamp(38px, 5vw, 64px)', color: '#fff', letterSpacing: '-0.01em', lineHeight: 1, marginTop: 4,
            }}
          >
            {team.teamName}<span style={{ color: team.mood }}>.</span>
          </h2>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(16px,2vw,20px)', color: team.mood, marginTop: 6, marginBottom: 30 }}>
            {team.tagline}
          </p>

          <CopyBlock label="the question nobody asked">
            A tea stall, held twenty years. An ice-cream cart, every afternoon, same corner.
            Karyaarth started with the people who walked past them daily — and realised
            they'd never once learned a name.
          </CopyBlock>
          <CopyBlock label="what was missing">
            Kolkata runs on labour nobody points a camera at on its own terms — it's
            background noise in someone else's shot, or it isn't there at all.
          </CopyBlock>
          <CopyBlock label="how they shot it">
            After dark, no script, no studio light — just a phone, the vendor's own bulb,
            and the patience to wait until the last customer left before asking.
          </CopyBlock>

          <div style={{ marginTop: 8, marginBottom: 28 }}>
            <MeaningLine team={team} dark />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <LinkRow links={team.links} dark mood={team.mood} />
            <CopyLinkButton slug={team.slug} dark mood={team.mood} />
          </div>
        </div>
      </div>

      {/* ── the contact sheet — one continuous filmstrip of the real shoot ── */}
      <div style={{ padding: '0 0 40px' }}>
        <div style={{ padding: '28px 24px 14px', fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
          the roll — every real frame from that night
        </div>
        <Filmstrip team={team} />
      </div>

      <style>{`
        .aql-k-spread { display: grid; grid-template-columns: 52% 48%; }
        .aql-k-photo { position: sticky; top: 0; height: 100vh; overflow: hidden; }
        .aql-k-copy { padding: 120px 40px 80px; display: flex; flex-direction: column; justify-content: center; }
        @media (max-width: 860px) {
          .aql-k-spread { display: block; }
          .aql-k-photo { position: relative; height: 62vh; }
          .aql-k-copy { padding: 48px 24px 56px; }
        }
      `}</style>
    </section>
  )
}

function CopyBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24, maxWidth: 460 }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
        {label}
      </div>
      <p style={{ fontFamily: "'Eina01', sans-serif", fontSize: 15, lineHeight: 1.65, color: 'rgba(244,239,224,0.75)', margin: 0 }}>
        {children}
      </p>
    </div>
  )
}

function Filmstrip({ team }: { team: AQLabsTeam }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const x = useTransform(scrollYProgress, [0, 1], ['2%', '-18%'])
  return (
    <div ref={ref} style={{ overflow: 'hidden' }}>
      <motion.div style={{ display: 'flex', gap: 4, x, width: 'max-content' }}>
        {[...GALLERY, ...GALLERY.slice(0, 3)].map((file, i) => (
          <div key={i} style={{ position: 'relative', flexShrink: 0, width: 220, aspectRatio: '3/4' }}>
            <img src={processSrc(team.slug, file)} alt="" loading="lazy" decoding="async"
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.2)' }} />
            <div aria-hidden style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
        ))}
      </motion.div>
    </div>
  )
}
