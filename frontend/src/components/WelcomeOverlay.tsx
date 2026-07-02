import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

// First-visit, full-screen welcome takeover for brand-new, logged-out visitors.
// Shows ONCE (localStorage), only when auth has resolved to "not signed in",
// and never on the auth / intake / sub-app routes where it would be noise.
//
// Pre-login phase: public "log in" and "join" both funnel to /recruitment (the
// live intake form) exactly like the rest of the site. When real login goes
// live, point JOIN_PATH / LOGIN_PATH at /register and /login.
const SEEN_KEY = 'aq_welcome_v1'
const JOIN_PATH = '/recruitment'
const LOGIN_PATH = '/recruitment'

// Routes where the takeover must never appear — auth flows, the intake form
// itself, the hidden onboarding/brand sheets, and the Paradox sub-app.
const EXCLUDED = ['/_login', '/login', '/register', '/recruitment', '/welcome', '/pending', '/rejected', '/brand']
const isExcluded = (path: string) => path.startsWith('/paradox') || EXCLUDED.some(p => path === p || path.startsWith(p + '/'))

// Vivid accent set for the dark hero (the theme tokens are tuned for the cream
// surface; on ink we want the punchy variants — same family as the brand posters).
const MINT = '#00E5A0', PINK = '#FF6BD6', LEMON = '#FFC700', SKY = '#3DA9FC', GRAPE = '#7E5BFF'

function Star({ size, color, style }: { size: number; color: string; style?: React.CSSProperties }) {
  const pts = Array.from({ length: 16 }, (_, i) => {
    const a = (i * Math.PI) / 8 - Math.PI / 2
    const r = i % 2 === 0 ? size : size * 0.38
    return `${50 + Math.cos(a) * r * (50 / size)},${50 + Math.sin(a) * r * (50 / size)}`
  }).join(' ')
  return (
    <svg viewBox="0 0 100 100" width={size * 2} height={size * 2} style={style} aria-hidden focusable="false">
      <polygon points={pts} fill={color} />
    </svg>
  )
}

export default function WelcomeOverlay() {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const primaryRef = useRef<HTMLButtonElement>(null)

  // Decide whether to show — once auth resolves, on a non-excluded public route,
  // for a first-time logged-out visitor. Small delay lets the page paint first
  // so the overlay animates IN over real content rather than a blank frame.
  useEffect(() => {
    if (isLoading || isAuthenticated) return
    if (isExcluded(pathname)) return
    let seen = false
    try { seen = localStorage.getItem(SEEN_KEY) === '1' } catch { /* private mode */ }
    if (seen) return
    const t = setTimeout(() => setOpen(true), 650)
    return () => clearTimeout(t)
  }, [isLoading, isAuthenticated, pathname])

  // Lock body scroll + focus the primary CTA while open.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const f = setTimeout(() => primaryRef.current?.focus(), 420)
    return () => { document.body.style.overflow = prev; clearTimeout(f) }
  }, [open])

  const dismiss = () => {
    try { localStorage.setItem(SEEN_KEY, '1') } catch { /* ignore */ }
    setClosing(true)
    setTimeout(() => { setOpen(false); setClosing(false) }, 280)
  }

  const go = (path: string) => {
    try { localStorage.setItem(SEEN_KEY, '1') } catch { /* ignore */ }
    setClosing(true)
    setTimeout(() => { setOpen(false); navigate(path) }, 220)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to AquaTerra"
      className={`aqwel-root${closing ? ' aqwel-closing' : ''}`}
      onClick={dismiss}
    >
      <style>{AQWEL_CSS}</style>

      {/* Paper texture + faint ink grid — the cream brand surface */}
      <div className="aqwel-grain" aria-hidden />
      <div className="aqwel-grid" aria-hidden />

      {/* Big off-brand-killing brand furniture: stars + rotated stickers */}
      <Star size={70} color={MINT} style={{ position: 'absolute', top: '-3%', right: '-2%', opacity: 0.9, transform: 'rotate(-12deg)' }} />
      <Star size={22} color={LEMON} style={{ position: 'absolute', bottom: '16%', left: '7%', opacity: 0.9 }} />
      <Star size={15} color={PINK} style={{ position: 'absolute', top: '20%', left: '13%', opacity: 0.85, transform: 'rotate(8deg)' }} />

      <span className="aqwel-tag aqwel-tag-mint" style={{ top: '15%', right: '9%', ['--rot' as string]: '-7deg' }}>★ STUDENT-LED</span>
      <span className="aqwel-tag aqwel-tag-pink aqwel-tag-hide" style={{ bottom: '24%', right: '12%', ['--rot' as string]: '5deg' }}>NON-PROFIT</span>
      <span className="aqwel-tag aqwel-tag-lemon aqwel-tag-hide" style={{ top: '46%', left: '4%', ['--rot' as string]: '4deg' }}>♥ ZERO FEES</span>

      {/* Top bar — wordmark + skip */}
      <div className="aqwel-top" onClick={e => e.stopPropagation()}>
        <div className="aqwel-mark">
          AQUATERRA<span className="aqwel-mark-dot">.</span>
        </div>
        <button className="aqwel-skip" onClick={dismiss} aria-label="Close welcome">
          skip <span aria-hidden>✕</span>
        </button>
      </div>

      {/* Card */}
      <div className="aqwel-card" onClick={e => e.stopPropagation()}>
        <div className="aqwel-eyebrow aqwel-stagger" style={{ animationDelay: '0.05s' }}>
          <span className="aqwel-dot" /> welcome, friend
        </div>

        <h1 className="aqwel-head aqwel-stagger" style={{ animationDelay: '0.12s' }}>
          where students<br />
          <span className="aqwel-serif">change things.</span>
        </h1>

        <p className="aqwel-sub aqwel-stagger" style={{ animationDelay: '0.2s' }}>
          AquaTerra is a youth-run movement for welfare, climate &amp; community
          across Kolkata. come build something that actually matters.
        </p>

        {/* Primary CTAs */}
        <div className="aqwel-cta-row aqwel-stagger" style={{ animationDelay: '0.28s' }}>
          <button ref={primaryRef} className="aqwel-btn aqwel-btn-primary" onClick={() => go(JOIN_PATH)}>
            join the community <span aria-hidden>→</span>
          </button>
          <button className="aqwel-btn aqwel-btn-ghost" onClick={() => go(LOGIN_PATH)}>
            log in
          </button>
        </div>

        {/* Secondary explore links */}
        <div className="aqwel-links aqwel-stagger" style={{ animationDelay: '0.36s' }}>
          <button className="aqwel-link" onClick={() => go('/everything-we-do')}>
            <span className="aqwel-link-ico" style={{ color: SKY }}>✦</span> explore what we do
          </button>
          <span className="aqwel-sep" aria-hidden>·</span>
          <button className="aqwel-link" onClick={() => go('/about')}>
            <span className="aqwel-link-ico" style={{ color: GRAPE }}>◆</span> about us
          </button>
        </div>

        <button className="aqwel-later aqwel-stagger" style={{ animationDelay: '0.44s' }} onClick={dismiss}>
          I'll look around on my own first
        </button>
      </div>

      <div className="aqwel-foot" onClick={e => e.stopPropagation()}>
        student-run · no account needed to explore
      </div>
    </div>
  )
}

const AQWEL_CSS = `
.aqwel-root{
  position:fixed; inset:0; z-index:1000;
  background:var(--bg,#F4EFE0); color:var(--ink,#0A0A0A);
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  padding:24px; overflow:hidden;
  animation:aqwelFade .42s cubic-bezier(.2,0,0,1);
}
.aqwel-closing{ animation:aqwelOut .28s cubic-bezier(.4,0,1,1) forwards; }
@keyframes aqwelFade{ from{opacity:0} to{opacity:1} }
@keyframes aqwelOut{ from{opacity:1} to{opacity:0} }

/* paper grain — the tactile cream surface */
.aqwel-grain{
  position:absolute; inset:0; pointer-events:none; opacity:.5; mix-blend-mode:multiply;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
}
/* faint ink grid, radially masked */
.aqwel-grid{
  position:absolute; inset:0; pointer-events:none;
  background-image:linear-gradient(rgba(10,10,10,.05) 1px,transparent 1px),
                   linear-gradient(90deg,rgba(10,10,10,.05) 1px,transparent 1px);
  background-size:60px 60px;
  -webkit-mask-image:radial-gradient(ellipse 86% 78% at 50% 46%,#000 30%,transparent 78%);
          mask-image:radial-gradient(ellipse 86% 78% at 50% 46%,#000 30%,transparent 78%);
}

/* rotated brand stickers — bright pop, ink border + hard offset shadow */
.aqwel-tag{
  position:absolute; z-index:1; transform:rotate(var(--rot,0deg));
  font-family:var(--display); font-weight:800; font-size:13px; letter-spacing:.01em;
  color:#0A0A0A; border:2px solid var(--ink,#0A0A0A); border-radius:999px;
  padding:8px 15px; box-shadow:3px 3px 0 0 var(--ink,#0A0A0A); pointer-events:none; white-space:nowrap;
}
.aqwel-tag-mint{ background:#00E5A0; } .aqwel-tag-pink{ background:#FF6BD6; } .aqwel-tag-lemon{ background:#FFE94A; }
@media (max-width:760px){ .aqwel-tag-hide{ display:none; } }

.aqwel-top{
  position:absolute; top:0; left:0; right:0;
  display:flex; align-items:center; justify-content:space-between;
  padding:18px clamp(18px,4vw,40px); z-index:2;
}
.aqwel-mark{ font-family:var(--display); font-weight:900; font-size:22px; letter-spacing:-.02em; color:var(--ink); }
.aqwel-mark-dot{ color:var(--mint,#1B8A5A); }
.aqwel-skip{
  font-family:var(--mono); font-size:12px; font-weight:700; letter-spacing:.04em;
  color:var(--ink-2,#2A2A28); background:var(--bg,#F4EFE0);
  border:2px solid var(--ink,#0A0A0A); border-radius:999px; box-shadow:2px 2px 0 0 var(--ink,#0A0A0A);
  padding:8px 15px; cursor:pointer; display:inline-flex; align-items:center; gap:7px;
  transition:transform .1s cubic-bezier(.2,0,0,1), box-shadow .12s, color .15s, background .15s;
}
.aqwel-skip:hover{ background:var(--ink,#0A0A0A); color:var(--bg,#F4EFE0); }
.aqwel-skip:active{ transform:translate(2px,2px); box-shadow:0 0 0 0 var(--ink,#0A0A0A); }

.aqwel-card{
  position:relative; z-index:2; width:100%; max-width:680px; text-align:center;
  display:flex; flex-direction:column; align-items:center;
}
.aqwel-eyebrow{
  display:inline-flex; align-items:center; gap:9px; align-self:center;
  font-family:var(--mono); font-size:12px; font-weight:800; letter-spacing:.1em; text-transform:uppercase;
  color:#0A0A0A; background:#00E5A0; border:2px solid var(--ink,#0A0A0A);
  border-radius:999px; padding:8px 16px; margin-bottom:22px;
  box-shadow:3px 3px 0 0 var(--ink,#0A0A0A); transform:rotate(-2deg);
}
.aqwel-dot{ width:8px; height:8px; border-radius:50%; background:#0A0A0A; animation:aqwelPulse 2s ease-in-out infinite; }
@keyframes aqwelPulse{ 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.45;transform:scale(.7)} }

.aqwel-head{
  font-family:var(--display); font-weight:900; color:var(--ink);
  font-size:clamp(44px,9vw,86px); line-height:.94; letter-spacing:-.03em;
  margin:0 0 20px; text-wrap:balance;
}
.aqwel-serif{
  font-family:var(--serif); font-style:italic; font-weight:400; color:var(--mint,#1B8A5A);
  letter-spacing:-.01em;
}
.aqwel-sub{
  font-family:var(--eina); font-size:clamp(15px,2.4vw,19px); line-height:1.6;
  color:var(--ink-2,#2A2A28); max-width:520px; margin:0 0 34px; text-wrap:pretty;
}

.aqwel-cta-row{ display:flex; gap:14px; width:100%; max-width:480px; margin-bottom:22px; }
.aqwel-btn{
  font-family:var(--display); font-weight:800; font-size:16px; white-space:nowrap;
  border:2px solid var(--ink,#0A0A0A); border-radius:14px; padding:15px 22px; cursor:pointer;
  display:inline-flex; align-items:center; justify-content:center; gap:9px;
  box-shadow:4px 4px 0 0 var(--ink,#0A0A0A);
  transition:transform .12s cubic-bezier(.2,0,0,1), box-shadow .14s, background .16s;
}
.aqwel-btn:hover{ transform:translate(-2px,-2px); box-shadow:6px 6px 0 0 var(--ink,#0A0A0A); }
.aqwel-btn:active{ transform:translate(2px,2px); box-shadow:1px 1px 0 0 var(--ink,#0A0A0A); }
.aqwel-btn-primary{ flex:1.6; background:#FFC700; color:#0A0A0A; }
.aqwel-btn-ghost{ flex:.8; background:var(--bg,#F4EFE0); color:var(--ink,#0A0A0A); }
.aqwel-btn-ghost:hover{ background:#EDE6D0; }

.aqwel-links{ display:flex; align-items:center; gap:14px; margin-bottom:26px; flex-wrap:wrap; justify-content:center; }
.aqwel-link{
  font-family:var(--mono); font-size:13px; font-weight:700; letter-spacing:.02em;
  color:var(--ink-2,#2A2A28); background:none; border:none; cursor:pointer;
  display:inline-flex; align-items:center; gap:7px; padding:6px 4px;
  transition:color .15s; position:relative;
}
.aqwel-link::after{ content:''; position:absolute; left:4px; right:4px; bottom:2px; height:2px; background:currentColor; opacity:0; transform:scaleX(.4); transform-origin:left; transition:opacity .18s, transform .18s; }
.aqwel-link:hover{ color:var(--ink,#0A0A0A); }
.aqwel-link:hover::after{ opacity:1; transform:scaleX(1); }
.aqwel-link-ico{ font-size:12px; }
.aqwel-sep{ color:var(--ink-3,#5A5A55); }

.aqwel-later{
  font-family:var(--mono); font-size:12px; color:var(--ink-3,#5A5A55);
  background:none; border:none; cursor:pointer; padding:8px; letter-spacing:.02em;
  transition:color .15s; min-height:40px;
}
.aqwel-later:hover{ color:var(--ink,#0A0A0A); text-decoration:underline; }

.aqwel-foot{
  position:absolute; bottom:0; left:0; right:0; text-align:center; padding:16px;
  font-family:var(--mono); font-size:11px; letter-spacing:.06em; color:var(--ink-3,#5A5A55); z-index:2;
}

/* staggered entrance — only when motion is welcome */
@media (prefers-reduced-motion:no-preference){
  .aqwel-stagger{ opacity:0; transform:translateY(14px); animation:aqwelUp .55s cubic-bezier(.2,0,0,1) forwards; }
  @keyframes aqwelUp{ to{ opacity:1; transform:translateY(0); } }
}

@media (max-width:560px){
  .aqwel-cta-row{ flex-direction:column; max-width:320px; }
  .aqwel-btn-ghost{ flex:1; }
  .aqwel-foot{ font-size:10px; }
}
@media (max-height:680px){
  .aqwel-eyebrow{ margin-bottom:14px; }
  .aqwel-head{ margin-bottom:14px; }
  .aqwel-sub{ margin-bottom:22px; }
}
`
