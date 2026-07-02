import { useCallback, useEffect, useRef, useState, Suspense, lazy } from 'react'
// The flux loader (which uses framer-motion) is lazy so motion never lands on
// the home page's critical path. The intro itself reads reduced-motion natively.
const ProgressiveFluxLoader = lazy(() => import('./ProgressiveFluxLoader'))

/**
 * HomeIntro — a once-per-visitor, skippable intro overlay for the home page.
 * Shows the branded ProgressiveFluxLoader sweeping 0→100 with phase labels,
 * then fades out to reveal the page. Gated by localStorage so it only plays on
 * a visitor's first home load; honours reduced-motion by not showing at all.
 */

const KEY = 'aq_home_intro_v1'
const SWEEP_MS = 2600

const PHASES = [
  { at: 0, label: 'student-led' },
  { at: 30, label: 'kolkata born' },
  { at: 62, label: 'zero fees' },
  { at: 100, label: 'welcome' },
]

export default function HomeIntro() {
  const [reduced] = useState(() => {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false }
  })
  const [active, setActive] = useState(false)
  const [closing, setClosing] = useState(false)
  const [progress, setProgress] = useState(0)
  const closedRef = useRef(false)

  // Decide once on mount: first visit + motion allowed → show.
  useEffect(() => {
    let seen = true
    try { seen = localStorage.getItem(KEY) === '1' } catch { seen = false }
    if (!seen && !reduced) setActive(true)
  }, [reduced])

  const finish = useCallback(() => {
    if (closedRef.current) return
    closedRef.current = true
    try { localStorage.setItem(KEY, '1') } catch { /* private mode — fine, just shows again */ }
    document.body.style.overflow = ''
    setActive(false)
  }, [])

  const beginClose = useCallback(() => {
    setClosing(true)
    window.setTimeout(finish, 520)
  }, [finish])

  const skip = useCallback(() => {
    setProgress(100)
    beginClose()
  }, [beginClose])

  // Drive the sweep + lock scroll while active.
  // Uses setInterval (advances even when rAF is throttled, e.g. a backgrounded
  // tab) plus a HARD safety timeout that force-dismisses no matter what — a
  // full-screen scroll-locking overlay must never be able to trap the user.
  useEffect(() => {
    if (!active) return
    document.body.style.overflow = 'hidden'
    const start = Date.now()
    let doneTimer = 0
    const id = window.setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / SWEEP_MS) * 100)
      setProgress(pct)
      if (pct >= 100) { window.clearInterval(id); doneTimer = window.setTimeout(beginClose, 520) }
    }, 30)
    const safety = window.setTimeout(beginClose, SWEEP_MS + 2200)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') skip() }
    window.addEventListener('keydown', onKey)
    return () => {
      clearInterval(id)
      clearTimeout(doneTimer)
      clearTimeout(safety)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [active, beginClose, skip])

  if (!active) return null

  return (
    <div
      role="dialog"
      aria-label="Welcome to AquaTerra"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'var(--bg)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 'clamp(28px, 6vw, 52px)', padding: 'clamp(24px, 6vw, 64px)',
        opacity: closing ? 0 : 1,
        transform: closing ? 'scale(1.015)' : 'scale(1)',
        transition: 'opacity 0.5s cubic-bezier(.2,.7,.2,1), transform 0.5s cubic-bezier(.2,.7,.2,1)',
      }}
    >
      {/* Brand wordmark */}
      <div style={{
        fontFamily: 'var(--display)', fontWeight: 900,
        fontSize: 'clamp(48px, 12vw, 132px)', letterSpacing: '-0.05em', lineHeight: 0.85,
        color: 'var(--ink)', textAlign: 'center', textTransform: 'uppercase',
      }}>
        AQUA<span style={{ color: 'var(--mint)' }}>TERRA</span>
        <span style={{ color: 'var(--mint)' }}>.</span>
      </div>

      <Suspense fallback={<div style={{ minHeight: 96 }} aria-hidden />}>
        <ProgressiveFluxLoader value={progress} phases={PHASES} />
      </Suspense>

      {/* Skip */}
      <button
        onClick={skip}
        style={{
          marginTop: 4, background: 'transparent', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'var(--ink-3)', padding: '10px 16px',
        }}
      >
        skip intro →
      </button>
    </div>
  )
}
