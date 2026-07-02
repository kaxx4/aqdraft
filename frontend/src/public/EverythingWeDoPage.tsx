import { Link } from 'react-router-dom'
import { Star, Burst, Marquee } from '../components/v6Shared'
import { DEPARTMENTS } from '../lib/departments'
import AQNodeExplorer from '../components/AQNodeExplorer'
import { useMeta } from '../hooks/useMeta'
import { pageMetadata } from '../lib/metaConfig'

// Slug used both as the card's anchor id (#events, #welfare-projects, …) and
// to match the deep-links other pages point at via CAT_TO_DEPT.
const deptSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '')

// Where each department's "see the actual output" link goes — answers the
// implicit "can I see what this team makes?" at the end of each card.
const DEPT_LINKS: Record<string, { to: string; label: string }> = {
  'Events': { to: '/?category=events', label: 'see event posts →' },
  'Welfare Projects': { to: '/projects', label: 'browse the drives →' },
  'Social Media': { to: '/?category=content', label: 'see what we publish →' },
  'Collabs': { to: '/collaborations', label: 'partner with us →' },
  'ROOTS': { to: '/?category=content', label: 'see brand work →' },
  'AQ.Ventures': { to: '/opportunities', label: 'open roles →' },
  'ShikshAQ': { to: '/?category=labs', label: 'labs feed →' },
  'Human Resources': { to: '/recruitment', label: 'join the work →' },
}

export default function EverythingWeDoPage() {
  useMeta(pageMetadata.everythingWeDo)
  return (
    <div className="route-enter">
      {/* Hero */}
      <section style={{ padding: 'clamp(44px, 8vw, 80px) var(--page-px,24px) clamp(32px, 5vw, 56px)', position: 'relative', overflow: 'hidden' }}>
        <Star size={120} color="var(--lemon)" style={{ position: 'absolute', top: 40, right: '8%', opacity: 0.7 }} className="spin-slow" />
        <Burst size={90} color="var(--pink)" style={{ position: 'absolute', bottom: 20, left: '6%', opacity: 0.5 }} />
        <div className="container" style={{ position: 'relative' }}>
          <div className="row gap-2" style={{ marginBottom: 18, flexWrap: 'wrap' }}>
            <span className="sticker sticker-mint sticker-float">★ 8 departments</span>
            <span className="sticker sticker-lemon wobble">534+ drives</span>
            <span className="sticker sticker-ghost">since 2021</span>
          </div>
          <h1 className="giant" style={{ margin: 0, lineHeight: 0.86 }}>
            everything<br />
            <span style={{ fontStyle: 'italic', fontFamily: 'var(--serif)', fontWeight: 400, color: 'var(--mint)' }}>we do</span>.
          </h1>
          <p style={{ fontSize: 20, lineHeight: 1.5, marginTop: 24, maxWidth: 560, color: 'var(--ink-2)' }}>
            AquaTerra runs 8 departments, each operated entirely by students. welfare drives, a streetwear brand, a marketing agency, and a tuition platform. all from Kolkata.
          </p>
        </div>
      </section>

      {/* Marquee */}
      <section style={{ padding: '20px 0', background: 'var(--ink)', color: 'var(--bg)', overflow: 'hidden' }}>
        <Marquee items={['★ WELFARE DRIVES', 'PLANTATION DRIVES', '★ SUNDARBANS RELIEF', 'ROOTS STREETWEAR', '★ AQ.VENTURES', 'SHIKSHAQ', '★ PARADOX', 'DISCO DIWALI', '★ SOCIAL MEDIA', 'TEACHING WORKSHOPS']} color="mint" />
      </section>

      {/* Interactive web diagram — the centerpiece. AquaTerra at the core,
          8 departments branching out, each drilling into its real activities. */}
      <section className="container" style={{ padding: 'clamp(48px, 7vw, 72px) 24px 8px' }}>
        <div className="row gap-2" style={{ marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="sticker sticker-sky">✦ interactive map</span>
          <span className="mono xs muted">click · drill in · explore</span>
        </div>
        <h2 className="h-display" style={{ fontSize: 'clamp(30px, 5vw, 52px)', margin: '0 0 10px', lineHeight: 0.96 }}>
          the whole web of <span style={{ color: 'var(--mint)' }}>what we do</span>.
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.55, color: 'var(--ink-2)', maxWidth: 560, margin: '0 0 22px' }}>
          start at the core and branch out. tap a department to drill into its real
          projects — every node is something students actually run.
        </p>
        <div style={{
          /* A radial web fills a square far better than a wide letterbox — this
             kills the wasted side/vertical space (worst on mobile). Capped width
             keeps it from over-spreading on large screens. */
          width: '100%',
          maxWidth: 560,
          margin: '0 auto',
          aspectRatio: '1 / 1',
          maxHeight: '66vh',
          borderRadius: 24,
          border: '2px solid var(--ink)',
          boxShadow: '6px 6px 0 0 var(--ink)',
          overflow: 'hidden',
          background: 'var(--ink)',
        }}>
          <AQNodeExplorer darkMode />
        </div>
      </section>

      {/* Department grid — accessible, at-a-glance browse of the same 8 teams */}
      <div className="container" style={{ padding: '48px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: 20 }}>
          {DEPARTMENTS.map((dept, i) => {
            const deptLink = DEPT_LINKS[dept.name]
            return (
            <article key={dept.name} id={deptSlug(dept.name)} className="card card-hover" style={{ padding: 0, overflow: 'hidden', transform: `rotate(${i % 2 ? 0.4 : -0.4}deg)`, scrollMarginTop: 'calc(var(--nav-h) + 16px)' }}>
              <div style={{ background: dept.color, color: '#0A0A0A', padding: '20px 22px 16px', borderBottom: '2px solid var(--ink)' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{dept.icon}</div>
                <div className="h-display" style={{ fontSize: 28, lineHeight: 1 }}>{dept.name}</div>
                <span className={'chip cat-' + dept.category} style={{ marginTop: 8, background: 'rgba(0,0,0,0.12)', border: 'none', color: '#0A0A0A' }}>{dept.category}</span>
              </div>
              <div style={{ padding: '18px 22px 20px' }}>
                <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.6, margin: '0 0 12px' }}>{dept.desc}</p>
                <div className="mono xs upper" style={{ fontWeight: 700, color: 'var(--ink-3)' }}>★ {dept.stat}</div>
                {deptLink && (
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
                    <Link
                      to={deptLink.to}
                      className="aq-thread-link"
                      onMouseEnter={e => (e.currentTarget.style.color = dept.color)}
                      onMouseLeave={e => (e.currentTarget.style.color = '')}
                    >
                      {deptLink.label}
                    </Link>
                  </div>
                )}
              </div>
            </article>
            )
          })}
        </div>

        {/* CTA */}
        <div className="card" style={{ padding: 'clamp(28px, 5vw, 48px) clamp(20px, 4vw, 36px)', marginTop: 48, background: 'var(--ink)', color: 'var(--bg)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <Star size={100} color="var(--mint)" style={{ position: 'absolute', top: -20, left: -20, opacity: 0.12 }} className="spin-slow" />
          <span className="sticker sticker-mint" style={{ marginBottom: 16, display: 'inline-flex' }}>★ open applications</span>
          <h2 className="h-display" style={{ fontSize: 'clamp(36px, 5vw, 60px)', margin: '0 0 16px', lineHeight: 0.95 }}>
            pick a department. show up.
          </h2>
          <p style={{ fontSize: 16, opacity: 0.75, maxWidth: 440, margin: '0 auto 24px' }}>2 minutes to apply. 24 hours to hear back. zero fees.</p>
          <div className="row gap-2" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/recruitment" className="btn btn-primary btn-lg">Come do the work with us</Link>
            <Link to="/opportunities" className="btn btn-lg" style={{ background: 'transparent', color: 'var(--bg)' }}>see open roles</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
