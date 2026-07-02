import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Marquee } from './v6Shared'
import ParadoxBanner from './ParadoxBanner'

export default function AQFooter() {
  const navigate = useNavigate()

  // ── Secret keyboard backdoor — Shift+L three times in under 1.2s ──
  // Bulletproof fallback for when the visual secret button is hard to
  // hit (small screens, fat-finger taps, etc). Listens globally so it
  // works on any page that mounts this footer. Resets on timeout.
  useEffect(() => {
    let presses: number[] = []
    function onKey(e: KeyboardEvent) {
      if (!e.shiftKey || e.key.toLowerCase() !== 'l') return
      const tag = (e.target as HTMLElement | null)?.tagName
      // Don't trigger while typing in a form
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      const now = Date.now()
      presses = presses.filter(t => now - t < 1200)
      presses.push(now)
      if (presses.length >= 3) {
        presses = []
        navigate('/_login')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  return (
    <footer className="aq-footer">
      <div className="container">
        <div className="aq-footer-grid">
          <div className="aq-footer-brand">
            <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 48, letterSpacing: '-0.04em', lineHeight: 0.9 }}>
              AQUA<br />TERRA<span style={{ color: 'var(--mint)' }}>.</span>
            </div>
            <p style={{ marginTop: 16, color: '#aaa', maxWidth: 320, fontSize: 14 }}>
              A community of students documenting work, water, and weird ideas. Open access. Always.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
              <span className="sticker sticker-mint" style={{ fontSize: 11 }}>EST 2021</span>
              {/* Secret mobile login — looks like a sticker, tappable anywhere on it */}
              <button
                type="button"
                aria-label="staff login"
                onClick={() => navigate('/_login')}
                className="sticker sticker-pink"
                style={{ fontSize: 11, transform: 'rotate(2deg)', cursor: 'default', WebkitTapHighlightColor: 'transparent', userSelect: 'none' }}
              >STUDENT-RUN</button>
            </div>
          </div>

          {[
            { h: 'Explore',      links: [['Everything we do','/everything-we-do'],['Projects','/projects'],['Teams','/teams'],['Members','/members'],['Schools','/schools'],['Classes','/classes']] },
            { h: 'Read & connect', links: [['Blog','/blog'],['Quick Links','/links'],['Search','/search'],['Feed','/'],['Contact','/contact']] },
            { h: 'Organisation', links: [['About','/about'],['FAQ','/faq'],['Collaborate','/collaborations'],['Brand','/brand'],['Paradox','/paradox']] },
            { h: 'Be a part', links: [['Join the work','/recruitment'],['Open roles','/opportunities'],['Volunteer handbook','/volunteer'],['Support us','/support']] },
          ].map(col => (
            <div key={col.h}>
              <h5 className="mono upper xs" style={{ color: 'var(--mint)', margin: '0 0 14px' }}>{col.h}</h5>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                {col.links.map(([label, href]) => (
                  <li key={href}>
                    <Link
                      to={href}
                      style={{ color: '#aaa', fontSize: 14, fontFamily: 'var(--sans)', textDecoration: 'none', transition: 'color .15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#aaa')}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #333', paddingTop: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, color: '#666', fontFamily: 'var(--mono)', fontSize: 11 }}>
          <div>
            © 2026 AQUATERRA — open community, no rights reserved
            {/* Secret login escape hatch.
                ── Where it is: a clickable period sitting flush against
                   "reserved" in the bottom-left copyright row.
                ── How it stays hidden: same colour as the surrounding
                   #666 mono text, no cursor change, no hover, no focus
                   ring, no underline. Looks like punctuation.
                ── How it stays tappable: the <button> has 14px invisible
                   padding on every side (~44×44px hit area — HIG-sized
                   touch target) and is `inline-block` so it never
                   collapses onto a new line.
                ── Fallback: Shift+L three times in under 1.2s from any
                   non-form input also navigates to /_login. See the
                   useEffect at the top of this component. */}
            <button
              type="button"
              aria-label="staff login"
              onClick={() => navigate('/_login')}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                font: 'inherit',
                cursor: 'default',
                display: 'inline-block',
                verticalAlign: 'baseline',
                padding: '14px',
                margin: '-14px 0 -14px -10px',
                outline: 'none',
                WebkitTapHighlightColor: 'transparent',
                userSelect: 'none',
              }}
              onFocus={(e) => { e.currentTarget.style.outline = 'none' }}
            >.</button>
          </div>
          <div>v6.0.0 / made with love + chaos</div>
        </div>
      </div>

      <style>{`
        .aq-footer-grid {
          display: grid;
          grid-template-columns: 1.8fr 1fr 1fr 1fr 1fr;
          gap: 32px;
          margin-bottom: 40px;
        }
        @media (max-width: 980px) {
          .aq-footer-grid {
            grid-template-columns: 1fr 1fr 1fr;
            gap: 28px 24px;
          }
          .aq-footer-brand { grid-column: 1 / -1; }
        }
        @media (max-width: 620px) {
          .aq-footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 26px 20px;
          }
          .aq-footer-brand { grid-column: 1 / -1; order: -1; }
        }
      `}</style>

      <ParadoxBanner />

      {/* ── Green marquee — absolute bottom of the footer ── */}
      <div className="aq-footer-marquee">
        <Marquee
          items={['★ KOLKATA BORN', 'STUDENT RUN', '★ DARPAN CERTIFIED', 'ZERO FEES EVER', '★ 1,200+ MEMBERS', '534+ DRIVES', '★ 4,000 SAPLINGS', '15,000 BANANAS', '★ OPEN ACCESS']}
          color="mint"
        />
      </div>
    </footer>
  )
}
