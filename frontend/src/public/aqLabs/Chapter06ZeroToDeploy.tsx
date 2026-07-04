import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import type { AQLabsTeam } from './data'
import { ChapterEyebrow, CopyLinkButton, MediumBadge, MeaningLine, ScrollBuild, processSrc } from './Shared'

const LADDER = [
  { tier: 'Institute', weight: 'highest', width: '100%' },
  { tier: 'Employer', weight: 'high', width: '82%' },
  { tier: 'Portfolio', weight: 'moderate', width: '58%' },
  { tier: 'Peer', weight: 'low', width: '30%' },
  { tier: 'Self-declared', weight: 'none', width: '8%' },
]

// Chapter 06 — Zero to Deploy. Layout: a dossier, not a hero section.
// Hunar's whole pitch is "proof over claims" — so the chapter is staged
// as a case file: a single bordered document sitting on a dark desk, its
// evidence (the live site, the trust ranking) labelled and pinned in,
// not decorated. The seal stamps once at the top, then the rest reads
// like paperwork that's actually been filed.
export default function Chapter06ZeroToDeploy({ team }: { team: AQLabsTeam }) {
  return (
    <section id={team.slug} style={{ background: '#1C1914', padding: '90px 20px 100px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ marginBottom: 18 }}><ChapterEyebrow team={team} dark /></div>

        <div className="aql-h-doc">
          {/* ── header block — the stamp ── */}
          <div className="aql-h-header">
            <motion.div
              initial={{ opacity: 0, scale: 1.6, rotate: 10 }}
              animate={{ opacity: 1, scale: 1, rotate: -3 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              style={{
                display: 'inline-block', background: '#fff', borderRadius: 10, padding: '14px 22px',
                boxShadow: `0 0 0 2px ${team.mood}66`, marginBottom: 18,
              }}
            >
              <img src={processSrc(team.slug, 'logo.jpg')} alt="हुनर — Hunar" style={{ height: 46, display: 'block' }} />
            </motion.div>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: 900, fontSize: 'clamp(30px,4.5vw,44px)', color: '#1C1914', margin: 0 }}>
              {team.projectName}
            </h2>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: team.mood, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 6 }}>
              {team.tagline}
            </p>
          </div>

          <Rule />

          {/* ── case notes ── */}
          <Field label="the case">
            An electrician, a tailor, a mechanic — trained, certified on paper, still
            unhireable, because no employer two neighbourhoods away had any reason to
            trust a stranger's certificate.
          </Field>
          <Field label="the gap">
            Millions graduate India's vocational system every year into almost total
            silence — the failure isn't the training. It's everything that should
            happen right after.
          </Field>

          <Rule />

          {/* ── exhibit a — the live site ── */}
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a7a5c', marginBottom: 10 }}>
            exhibit A — filed, not mocked up
          </div>
          <ExhibitPhoto team={team} />

          <Rule />

          {/* ── the ranking of evidence ── */}
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a7a5c', marginBottom: 12 }}>
            ranking of evidence — hardest to fake, first
          </div>
          <table className="aql-h-table">
            <tbody>
              {LADDER.map(l => (
                <LadderRow key={l.tier} tier={l.tier} weight={l.weight} width={l.width} color={team.mood} />
              ))}
            </tbody>
          </table>
          <p style={{ fontFamily: "'Eina01', sans-serif", fontSize: 13.5, lineHeight: 1.65, color: '#4a4030', marginTop: 14 }}>
            हुनर, Devanagari for "skill," chosen over an English placeholder. Institutional
            verification weighs highest because it can't be self-granted; a self-declared
            claim weighs nothing, because anyone can type anything. Not a UI choice —
            an argument about what trust is actually made of.
          </p>

          <Rule />

          <div style={{ textAlign: 'center', padding: '4px 0 6px' }}>
            <MeaningLine team={team} />
            {team.links.website && (
              <a href={team.links.website} target="_blank" rel="noopener noreferrer" className="aql-h-stamp">
                open the live file ↗
              </a>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <CopyLinkButton slug={team.slug} dark mood={team.mood} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}><MediumBadge team={team} dark /></div>

      <style>{`
        .aql-h-doc {
          background: #F4EFE0; border: 1.5px solid rgba(28,25,20,0.5);
          border-radius: 4px; padding: 40px 36px 34px;
          box-shadow: 0 30px 70px rgba(0,0,0,0.5), 0 0 0 6px #1C1914, 0 0 0 7px rgba(255,255,255,0.06);
        }
        .aql-h-header { text-align: center; }
        .aql-h-table { width: 100%; border-collapse: collapse; }
        .aql-h-table td { padding: 8px 0; border-bottom: 1px solid rgba(28,25,20,0.14); font-family: var(--mono); font-size: 12.5px; color: #4a4030; }
        .aql-h-stamp {
          display: inline-flex; align-items: center; gap: 8px; margin-top: 6px;
          padding: 11px 22px; border-radius: 999px; border: 2px solid var(--tab-mood, #B8862E);
          font-family: var(--mono); font-weight: 700; font-size: 12.5px; text-transform: uppercase;
          color: #1C1914; background: transparent; text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .aql-h-stamp:hover { background: #B8862E; color: #1C1914; }
        @media (max-width: 600px) {
          .aql-h-doc { padding: 30px 20px 26px; }
        }
      `}</style>
    </section>
  )
}

function Rule() {
  return <div style={{ borderTop: '1px dashed rgba(28,25,20,0.25)', margin: '26px 0' }} />
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <ScrollBuild y={20} scale={1} start={0.98} end={0.75}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a7a5c', marginBottom: 6 }}>
          {label}
        </div>
        <p style={{ fontFamily: "'Eina01', sans-serif", fontSize: 14.5, lineHeight: 1.65, color: '#2c2820', margin: 0 }}>
          {children}
        </p>
      </div>
    </ScrollBuild>
  )
}

function LadderRow({ tier, weight, width, color }: { tier: string; weight: string; width: string; color: string }) {
  const ref = useRef<HTMLTableRowElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.95', 'start 0.65'] })
  const barWidth = useTransform(scrollYProgress, [0, 1], ['0%', width])
  return (
    <tr ref={ref}>
      <td style={{ width: '32%' }}>{tier}</td>
      <td style={{ width: '18%', color, fontWeight: 700 }}>{weight}</td>
      <td>
        <div style={{ height: 6, background: 'rgba(28,25,20,0.08)', borderRadius: 3, overflow: 'hidden' }}>
          <motion.div style={{ height: '100%', background: color, width: barWidth }} />
        </div>
      </td>
    </tr>
  )
}

function ExhibitPhoto({ team }: { team: AQLabsTeam }) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 20, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: -1.2 }}
      transition={{ duration: 0.5 }}
      style={{ margin: '0 auto 4px', maxWidth: 380 }}
    >
      <div style={{ border: '6px solid #fff', boxShadow: '0 10px 26px rgba(0,0,0,0.25)', position: 'relative' }}>
        <span aria-hidden style={{
          position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%) rotate(2deg)',
          width: 34, height: 14, background: 'rgba(184,134,46,0.35)',
        }} />
        <img src={processSrc(team.slug, '02-hunar-live-homepage.png')} alt="Hunar's live homepage" loading="lazy" decoding="async"
          style={{ width: '100%', display: 'block' }} />
      </div>
      <figcaption style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: '#8a7a5c', textAlign: 'center', marginTop: 8 }}>
        fig. 1 — the homepage, live, not a render
      </figcaption>
    </motion.figure>
  )
}
