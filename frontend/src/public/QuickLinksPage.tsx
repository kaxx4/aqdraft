import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DEPARTMENTS, type Department } from '../lib/departments'

// ── External links ───────────────────────────────────────────────
const INSTAGRAM  = 'https://instagram.com/ngo.aquaterra'
const WHATSAPP   = 'https://wa.me/919748679979'
const LINKEDIN   = 'https://linkedin.com/company/ngo-aquaterra'

// ── 4 big CTAs (the marquee destinations) ────────────────────────
const BIG_CTAS = [
  {
    name: 'PROJECTS',
    tag: 'Welfare Drives',
    desc: 'Dogs, saplings, kids, communities. 500+ drives since 2021.',
    href: '/projects',
    gradient: 'linear-gradient(135deg, #001020 0%, #003060 100%)',
    accent: '#3DA9FC',
  },
  {
    name: 'PARADOX',
    tag: 'Events & Fundraising',
    desc: "AQ's annual cultural fest. 80G certified. All proceeds to charity.",
    href: '/paradox',
    gradient: 'linear-gradient(135deg, #12003d 0%, #2a0070 100%)',
    accent: '#7E5BFF',
  },
  {
    name: 'ROOTS',
    tag: 'D2C / B2B Merch',
    desc: 'Student-designed merch. Every purchase funds our welfare work.',
    href: '/support',
    gradient: 'linear-gradient(135deg, #1a0a00 0%, #3d1800 100%)',
    accent: '#FF7A1A',
  },
  {
    name: 'SHIKSHAQ',
    tag: 'EdTech Start-up',
    desc: 'A student-built EdTech platform making quality education accessible.',
    href: '/everything-we-do',
    gradient: 'linear-gradient(135deg, #001a10 0%, #003d26 100%)',
    accent: '#00E5A0',
  },
]

// ── Small links (everything else) ────────────────────────────────
type SmallLink = {
  label: string
  sub: string
  href: string
  external?: boolean
  color: string
  icon: string
}

const SMALL_LINKS: SmallLink[] = [
  { label: 'Volunteer Handbook', sub: 'Everything about volunteering',  href: '/volunteer',                     color: '#FFC700', icon: '📖' },
  { label: 'Blog',               sub: 'Stories from the community',     href: '/blog',                          color: '#FF7A1A', icon: '✍' },
  { label: 'Collaborate',        sub: 'Events, sponsorships, schools',  href: '/collaborations',                color: '#3DA9FC', icon: '🤝' },
  { label: 'WhatsApp Community',  sub: 'Join the group to hear first',  href: WHATSAPP,         external: true, color: '#25D366', icon: '💬' },
  { label: 'Instagram',          sub: '@ngo.aquaterra',                href: INSTAGRAM,        external: true, color: '#FF6BD6', icon: '📸' },
  { label: 'LinkedIn',           sub: 'Follow our work',               href: LINKEDIN,         external: true, color: '#0A66C2', icon: '💼' },
  { label: 'Contact Us',         sub: 'Get in touch directly',         href: '/contact',                       color: '#FF6BD6', icon: '✉' },
]

// One expandable department card — tap to reveal what the team builds.
function DeptCard({ d }: { d: Department }) {
  const [open, setOpen] = useState(false)
  return (
    <button
      type="button"
      className={'ql-dept' + (open ? ' open' : '')}
      style={{ ['--dc' as string]: d.color }}
      onClick={() => setOpen(o => !o)}
      aria-expanded={open}
    >
      <span className="ql-dept-head">
        <span className="ql-dept-icon" aria-hidden>{d.icon}</span>
        <span className="ql-dept-name">{d.name}</span>
        <span className="ql-dept-cat">{d.category}</span>
        <span className="ql-dept-plus" aria-hidden>⌄</span>
      </span>
      <span className="ql-dept-wrap">
        <span className="ql-dept-body">
          <span style={{ display: 'block' }}>
            <span className="ql-dept-desc" style={{ display: 'block' }}>{d.desc}</span>
            <span className="ql-dept-stat">★ {d.stat}</span>
          </span>
        </span>
      </span>
    </button>
  )
}

export default function QuickLinksPage() {
  return (
    <div className="route-enter">
      {/* Scoped polish: focus-visible rings + press feedback + reduced-motion safety */}
      <style>{`
        .ql-focus:focus-visible { outline: 2px solid var(--mint); outline-offset: 3px; border-radius: 14px; }
        .ql-press { transition: transform 0.12s cubic-bezier(.2,0,0,1); }
        .ql-press:active { transform: scale(0.97); }

        /* Interactive "everything we do" accordion */
        .ql-depts { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap: 12px; }
        .ql-dept {
          --dc: var(--mint);
          text-align: left; width: 100%; cursor: pointer; font: inherit; color: var(--ink);
          background: var(--bg-2); border: 2px solid var(--ink); border-radius: 16px; overflow: hidden;
          transition: box-shadow .18s, transform .12s cubic-bezier(.2,0,0,1);
        }
        .ql-dept:hover { box-shadow: 5px 6px 0 var(--ink); }
        .ql-dept:active { transform: scale(0.99); }
        .ql-dept:focus-visible { outline: 3px solid var(--dc); outline-offset: 3px; }
        .ql-dept.open { box-shadow: 5px 6px 0 var(--dc); }
        .ql-dept-head { display: flex; align-items: center; gap: 12px; padding: 16px 18px; }
        .ql-dept-icon { width: 38px; height: 38px; flex-shrink: 0; display: grid; place-items: center; font-size: 19px; border-radius: 11px; background: color-mix(in srgb, var(--dc) 18%, transparent); border: 1.5px solid color-mix(in srgb, var(--dc) 36%, transparent); }
        .ql-dept-name { flex: 1; min-width: 0; font-family: var(--display); font-weight: 800; font-size: 16px; letter-spacing: -0.02em; }
        .ql-dept-cat { font: 700 9px var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-3); }
        .ql-dept-plus { width: 22px; height: 22px; flex-shrink: 0; display: grid; place-items: center; font-family: var(--mono); font-size: 16px; font-weight: 700; color: var(--dc); transition: transform .25s cubic-bezier(.2,.7,.2,1); }
        .ql-dept.open .ql-dept-plus { transform: rotate(180deg); }
        /* smooth height via grid-template-rows 0fr → 1fr (interruptible) */
        .ql-dept-wrap { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .3s cubic-bezier(.2,.7,.2,1); }
        .ql-dept.open .ql-dept-wrap { grid-template-rows: 1fr; }
        .ql-dept-body { overflow: hidden; }
        .ql-dept-body > span { display: block; padding: 0 18px 18px; }
        .ql-dept-desc { font-family: var(--eina); font-size: 13.5px; line-height: 1.6; color: var(--ink-2); margin: 0 0 10px; text-wrap: pretty; }
        .ql-dept-stat { font: 700 10px var(--mono); text-transform: uppercase; letter-spacing: 0.05em; color: var(--dc); }

        @media (prefers-reduced-motion: reduce) {
          .ql-press, .ql-press:active { transition: none; transform: none; }
          .ql-dept-wrap { transition: none; }
          .ql-dept-plus { transition: none; }
        }
      `}</style>

      {/* ── ① Recruitment-nudge header (the big ask) ─────────────── */}
      <section className="bleed-under-nav" style={{
        minHeight: '92svh',
        background: '#0A0A0A',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        // Top padding carries the nav height back so the centred content clears
        // the floating nav; the negative margin (class) bleeds the black up
        // behind it so there's no cream strip above the hero.
        padding: 'calc(var(--nav-h, 70px) + clamp(40px,8vw,80px)) var(--page-px,24px) clamp(40px,8vw,80px)',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
        borderBottom: '1px solid #1f1f1f',
      }}>
        {/* Background glow — tuned to the real --mint (#1B8A5A) */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 50% at 50% 42%, rgba(27,138,90,0.14) 0%, transparent 65%)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, width: '100%' }}>
          {/* Trust badge */}
          <div style={{ marginBottom: 22 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)' }}>
              DARPAN Certified NGO · Reg: AAFTT2300ME20251
            </span>
          </div>

          {/* Brand wordmark — now the supporting element */}
          <div style={{ fontFamily: 'var(--display)', fontWeight: 900,
            fontSize: 'clamp(26px,5vw,40px)', letterSpacing: '-0.03em', lineHeight: 1,
            color: 'rgba(255,255,255,0.75)', marginBottom: 18 }}>
            AQUA<span style={{ color: 'var(--mint)' }}>TERRA</span>
          </div>

          {/* The big recruitment headline */}
          <h1 style={{ fontFamily: 'var(--display)', fontWeight: 900,
            fontSize: 'clamp(46px,10vw,92px)', letterSpacing: '-0.045em', lineHeight: 0.9,
            color: '#fff', margin: '0 0 20px', textWrap: 'balance' } as React.CSSProperties}>
            Join the<br /><span style={{ color: 'var(--mint)' }}>movement.</span>
          </h1>

          {/* Pitch */}
          <p style={{ fontFamily: 'var(--eina)', fontSize: 16, lineHeight: 1.65,
            color: 'rgba(255,255,255,0.55)', maxWidth: 440, margin: '0 auto 34px' }}>
            Student-led NGO from Kolkata. Real work, real impact, LoRs &amp; certificates
            for the best — and zero fees, always.
          </p>

          {/* Primary CTA — the dominant button */}
          <Link to="/recruitment" className="ql-press ql-focus"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'var(--mint)', color: '#0A0A0A',
              fontFamily: 'var(--display)', fontWeight: 800,
              fontSize: 'clamp(15px,2.4vw,18px)', letterSpacing: '-0.01em',
              padding: '17px 36px', borderRadius: 999, textDecoration: 'none',
              boxShadow: '0 8px 30px rgba(27,138,90,0.4)',
              transition: 'transform 0.12s cubic-bezier(.2,0,0,1), box-shadow 0.18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 44px rgba(27,138,90,0.55)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 8px 30px rgba(27,138,90,0.4)' }}>
            Start with one weekend →
          </Link>

          {/* Secondary social pills */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 22 }}>
            {[
              { href: WHATSAPP, label: 'WhatsApp', bg: 'rgba(37,211,102,0.14)', fg: '#43e07d', bd: 'rgba(37,211,102,0.3)' },
              { href: INSTAGRAM, label: 'Instagram', bg: 'rgba(255,107,214,0.12)', fg: '#ff8fe0', bd: 'rgba(255,107,214,0.3)' },
              { href: LINKEDIN, label: 'LinkedIn', bg: 'rgba(10,102,194,0.16)', fg: '#5aa6ee', bd: 'rgba(10,102,194,0.4)' },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                className="ql-press ql-focus"
                style={{
                  display: 'inline-flex', alignItems: 'center',
                  background: s.bg, color: s.fg, border: `1px solid ${s.bd}`,
                  fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  padding: '9px 16px', borderRadius: 999, textDecoration: 'none',
                }}>
                {s.label} ↗
              </a>
            ))}
          </div>

          {/* Down hint */}
          <div style={{ marginTop: 44, color: 'rgba(255,255,255,0.22)',
            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.06em' }}>
            explore everything ↓
          </div>
        </div>
      </section>

      {/* ── ② 4 big CTAs ─────────────────────────────────────────── */}
      <section style={{ background: '#0A0A0A', borderTop: '1px solid #1a1a1a',
        padding: 'clamp(44px,7vw,80px) var(--page-px,24px)' }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: 18 }}>
            Start here
          </div>
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: 900,
            fontSize: 'clamp(28px,5vw,52px)', letterSpacing: '-0.03em', color: '#fff',
            margin: '0 0 12px', lineHeight: 1, textWrap: 'balance' } as React.CSSProperties}>
            Four ways in.
          </h2>
          <p style={{ fontFamily: 'var(--eina)', fontSize: 15, lineHeight: 1.7,
            color: 'rgba(255,255,255,0.4)', maxWidth: 500, margin: '0 0 36px' }}>
            Real tools, real organisations, real impact — something students rarely get the
            opportunity to build. Why? Why not.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {BIG_CTAS.map(p => (
              <Link key={p.name} to={p.href} className="ql-focus" style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{
                  background: p.gradient,
                  border: `1px solid ${p.accent}22`,
                  borderRadius: 18, padding: 'clamp(26px,3vw,34px) 24px',
                  minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  transition: 'transform 0.15s cubic-bezier(.2,0,0,1), border-color 0.15s, box-shadow 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px)'; el.style.borderColor = `${p.accent}66`; el.style.boxShadow = `0 16px 40px ${p.accent}22` }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.borderColor = `${p.accent}22`; el.style.boxShadow = 'none' }}>
                  <div>
                    <span style={{
                      fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.07em',
                      color: p.accent, background: `${p.accent}18`,
                      padding: '3px 9px', borderRadius: 999, display: 'inline-block',
                      marginBottom: 16,
                    }}>
                      {p.tag}
                    </span>
                    <div style={{ fontFamily: 'var(--display)', fontWeight: 900,
                      fontSize: 'clamp(24px,2.8vw,32px)', letterSpacing: '-0.03em',
                      color: '#fff', lineHeight: 1, marginBottom: 12 }}>
                      {p.name}
                    </div>
                    <p style={{ fontFamily: 'var(--eina)', fontSize: 13.5, lineHeight: 1.6,
                      color: 'rgba(255,255,255,0.55)', margin: 0 }}>
                      {p.desc}
                    </p>
                  </div>
                  <div style={{ marginTop: 22, fontFamily: 'var(--mono)', fontSize: 11,
                    fontWeight: 700, color: p.accent, letterSpacing: '0.04em' }}>
                    Explore →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── ③ Everything we do (interactive accordion) ───────────── */}
      <section style={{ padding: 'clamp(44px,7vw,72px) var(--page-px,24px)', background: 'var(--bg)', borderTop: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: 'var(--ink-3)', marginBottom: 14 }}>
            Everything we do
          </div>
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: 900,
            fontSize: 'clamp(28px,5vw,48px)', letterSpacing: '-0.03em', color: 'var(--ink)',
            margin: '0 0 10px', lineHeight: 0.95, textWrap: 'balance' } as React.CSSProperties}>
            8 departments,<br />all student-run.
          </h2>
          <p style={{ fontFamily: 'var(--eina)', fontSize: 15, lineHeight: 1.6,
            color: 'var(--ink-3)', maxWidth: 480, margin: '0 0 28px' }}>
            Tap any team to see what they actually build. Every one of them runs on volunteers.
          </p>

          <div className="ql-depts">
            {DEPARTMENTS.map(d => <DeptCard key={d.name} d={d} />)}
          </div>

          <div style={{ marginTop: 22 }}>
            <Link to="/everything-we-do" className="ql-focus"
              style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', textDecoration: 'none' }}>
              full breakdown <span style={{ color: 'var(--ink)', borderBottom: '1.5px solid var(--mint)' }}>everything we do →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── ④ All the small links ────────────────────────────────── */}
      <section style={{ padding: 'clamp(40px,6vw,64px) var(--page-px,24px)', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: 'var(--ink-3)', marginBottom: 24 }}>
            More links
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SMALL_LINKS.map(a => {
              const inner = (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '14px 18px',
                  background: 'var(--bg-2)',
                  border: '1.5px solid var(--line)',
                  borderRadius: 14,
                  textDecoration: 'none',
                  transition: 'border-color 0.15s, transform 0.1s',
                  cursor: 'pointer',
                }}>
                  {/* Icon */}
                  <span style={{
                    width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${a.color}18`,
                    border: `1.5px solid ${a.color}33`,
                    fontSize: 18, lineHeight: 1,
                  }}>
                    {a.icon}
                  </span>
                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 14.5,
                      letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: 2 }}>
                      {a.label}
                    </div>
                    <div style={{ fontFamily: 'var(--eina)', fontSize: 12, color: 'var(--ink-3)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.sub}
                    </div>
                  </div>
                  {/* Arrow */}
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 14, color: a.color,
                    fontWeight: 700, flexShrink: 0 }}>
                    {a.external ? '↗' : '→'}
                  </span>
                </div>
              )

              return a.external ? (
                <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer"
                  className="ql-focus"
                  style={{ textDecoration: 'none', display: 'block' }}
                  onMouseEnter={e => { const c = e.currentTarget.firstElementChild as HTMLElement; if (c) { c.style.borderColor = a.color; c.style.transform = 'translateY(-1px)' } }}
                  onMouseLeave={e => { const c = e.currentTarget.firstElementChild as HTMLElement; if (c) { c.style.borderColor = 'var(--line)'; c.style.transform = '' } }}>
                  {inner}
                </a>
              ) : (
                <Link key={a.label} to={a.href} className="ql-focus" style={{ textDecoration: 'none', display: 'block' }}
                  onMouseEnter={e => { const c = e.currentTarget.firstElementChild as HTMLElement; if (c) { c.style.borderColor = a.color; c.style.transform = 'translateY(-1px)' } }}
                  onMouseLeave={e => { const c = e.currentTarget.firstElementChild as HTMLElement; if (c) { c.style.borderColor = 'var(--line)'; c.style.transform = '' } }}>
                  {inner}
                </Link>
              )
            })}
          </div>

          {/* Soft recruitment reinforcement */}
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <Link to="/recruitment" className="ql-focus"
              style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                color: 'var(--ink-3)', textDecoration: 'none' }}>
              Still here? <span style={{ color: 'var(--ink)', borderBottom: '1.5px solid var(--mint)' }}>Join AquaTerra →</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
