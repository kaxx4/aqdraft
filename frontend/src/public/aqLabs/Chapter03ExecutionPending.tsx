import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, CountTo, LinkRow, MediumBadge, MeaningLine, ScrollBuild, processSrc } from './Shared'

const STATS = [
  { value: 366, suffix: 'M', label: 'adults live with ADHD — more common than bipolar, OCD and PTSD combined' },
  { value: 20, prefix: '<', suffix: '%', label: 'are ever diagnosed or treated' },
  { value: 205, suffix: '×', label: 'average daily phone pickups' },
  { value: 42, prefix: '+', suffix: '%', label: 'year over year, and it still isn\'t working' },
]
const GAMES = ['Hoops Blitz', 'Flappy Press', 'Stack', 'Rhythm Tap', 'Reaction Rush']
const TIERS = [
  { name: 'Quirk Lite', price: '₹1,799', spec: 'USB · 0.96" OLED · white or black' },
  { name: 'Quirk Pro', price: '₹3,999', spec: 'USB + BT 5.0 · 1.3" OLED · all colours · early access' },
  { name: 'DIY Box', price: '₹1,299', spec: 'every component included · no soldering · firmware free' },
]
const SWOT: { tag: string; items: string[] }[] = [
  { tag: 'strong', items: ['first mover in an empty gap', 'open-source moat', 'games live before hardware ships', 'built by the actual target user'] },
  { tag: 'weakness', items: ['hardware isn\'t done yet — we know', 'make-to-order limits early scale', 'just a small founding team'] },
  { tag: 'opportunity', items: ['366M adults globally underserved', 'ADHD awareness growing fast', 'maker communities = free distribution'] },
  { tag: 'threat', items: ['a bigger brand could enter', 'component supply chain', 'FSR input still unfamiliar to most'] },
]

function Reveal({ children, y = 22 }: { children: React.ReactNode; delay?: number; y?: number }) {
  return <ScrollBuild y={y}>{children}</ScrollBuild>
}

// Chapter 03 — Execution Pending. Told the way their own pitch deck tells
// it: a 3AM cold-open, a problem stated as an epidemic, a real cited
// study for why fidgeting is the fix, an actual price list, and — rarest
// of all in a hype page — an honest SWOT. Four movements, one chapter.
export default function Chapter03ExecutionPending({ team }: { team: AQLabsTeam }) {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '26%'])

  return (
    <section id={team.slug} style={{ background: '#000' }}>
      {/* ── movement 1 — 3AM cold open ── */}
      <div ref={heroRef} style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.4, 1] }} transition={{ duration: 0.7, times: [0, 0.4, 0.55, 1] }}
          style={{ position: 'absolute', inset: 0, y: imgY }}>
          <img
            src={processSrc(team.slug, '01-breadboard-esp32-1am.jpeg')}
            alt="ESP32, OLED and pressure-pad module hand-wired on a breadboard, 1:02 AM"
            style={{ width: '100%', height: '128%', objectFit: 'cover', objectPosition: '35% 45%', filter: 'brightness(0.5) contrast(1.05)' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #000 15%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.7) 100%)' }} />
        </motion.div>

        <div style={{ position: 'relative', maxWidth: 1000, margin: '0 auto', padding: '160px 24px 48px', width: '100%' }}>
          <ChapterEyebrow team={team} dark />
          <MediumBadge team={team} dark />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="h-display"
            style={{ fontSize: 'clamp(48px,9vw,110px)', color: team.mood, lineHeight: 1, marginBottom: 4, textShadow: '0 4px 30px rgba(0,0,0,0.7)' }}
          >
            3:02 AM
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, letterSpacing: '0.3em' }}
            animate={{ opacity: 1, letterSpacing: '0em' }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="h-display"
            style={{ fontSize: 'clamp(30px,5vw,54px)', color: '#fff', textShadow: '0 4px 30px rgba(0,0,0,0.7)' }}
          >
            "we built this at 3am."
          </motion.h2>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 12.5, color: 'rgba(255,255,255,0.5)', marginTop: 10 }}>
            a kitchen counter · four teenagers · one breadboard
          </p>
        </div>
      </div>

      {/* ── movement 2 — the epidemic, in numbers ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '100px 24px 60px' }}>
        <Reveal>
          <h3 style={{
            fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(24px,3.6vw,38px)',
            color: '#fff', lineHeight: 1.3, marginBottom: 44, maxWidth: 640,
          }}>
            Your brain isn't broken. Your tools are.
          </h3>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }} className="aql-quirk-stats">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1}>
              <div style={{ borderTop: `2px solid ${team.mood}`, paddingTop: 12 }}>
                <div className="h-display" style={{ fontSize: 'clamp(32px,4.6vw,50px)', color: team.mood }}>
                  <CountTo value={s.value} prefix={s.prefix} suffix={s.suffix} />
                </div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', marginTop: 6, lineHeight: 1.5 }}>{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── movement 3 — the science + the product ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 24px 60px' }}>
        <Reveal>
          <div style={{
            border: `1px solid ${team.mood}55`, borderRadius: 16, padding: '24px 26px', marginBottom: 56,
            background: `${team.mood}0A`,
          }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: team.mood, marginBottom: 10 }}>
              the science — UC Davis, 2024
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: 'rgba(255,255,255,0.75)', margin: 0 }}>
              ADHD adults score higher on cognitive tasks while fidgeting — and the longer the task runs,
              the bigger the effect. Movement releases the exact dopamine and norepinephrine an ADHD brain
              runs short on. Fidgeting isn't the distraction. It's the correction.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
            the product — real prices, not a mockup
          </div>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 30 }} className="aql-quirk-tiers">
          {TIERS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <div style={{ border: '1.5px solid rgba(255,255,255,0.14)', borderRadius: 14, padding: '18px 16px', height: '100%' }}>
                <div className="h-display" style={{ fontSize: 17, color: '#fff', marginBottom: 4 }}>{t.name}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 20, color: team.mood, fontWeight: 700, marginBottom: 8 }}>{t.price}</div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{t.spec}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {GAMES.map(g => (
              <span key={g} style={{
                fontFamily: 'var(--mono)', fontSize: 11, color: '#fff', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.14)', borderRadius: 999, padding: '5px 11px',
              }}>{g}</span>
            ))}
          </div>
        </Reveal>
      </div>

      {/* ── movement 4 — the honest SWOT ── */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 24px 60px' }}>
        <Reveal>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(20px,2.8vw,28px)', color: '#fff', marginBottom: 30, maxWidth: 640 }}>
            We know what we are. And what we're not.
          </p>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }} className="aql-swot-grid">
          {SWOT.map((s, i) => (
            <Reveal key={s.tag} delay={i * 0.08}>
              <div style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', padding: '14px 14px', height: '100%' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: team.mood, marginBottom: 8 }}>
                  {s.tag}
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {s.items.map(it => (
                    <li key={it} style={{ fontSize: 11, lineHeight: 1.5, color: 'rgba(255,255,255,0.6)' }}>{it}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── movement 5 — the meaning ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 24px 110px' }}>
        <Reveal>
          <MeaningLine team={team} dark />
        </Reveal>
        <Reveal delay={0.1}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <LinkRow links={team.links} dark mood={team.mood} />
            <CopyLinkButton slug={team.slug} dark mood={team.mood} />
          </div>
        </Reveal>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .aql-quirk-stats { grid-template-columns: 1fr !important; }
          .aql-quirk-tiers { grid-template-columns: 1fr !important; }
          .aql-swot-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  )
}
