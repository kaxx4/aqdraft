// ──────────────────────────────────────────────────────────────────────────
// AquaTerra · /welcome — animated 5-step onboarding
// ──────────────────────────────────────────────────────────────────────────
// Hidden URL — not wired into AQNav, AQFooter, sitemap.xml, or metaConfig.
// Reachable only by direct URL.
//
// Architecture: single-file SPA-style onboarding. Owns step state +
// directional slide transitions + keyboard nav. Each step has its own
// inline "visual" component (StickerStack, MockFeedCard, MemberOrbit,
// MockForm, UnlockBurst) so the page reads as illustrated rather than
// a wall of text — visuals fill the right column on desktop and stack
// above the copy on mobile.
//
// Visual language follows the v6 main-site palette (mint / lemon / pink
// / cream / ink) and uses existing utility classes from
// aq-design-system.css. All new styling is scoped to .onb-root via an
// inline <style> block so we don't leak anything site-wide.
// ──────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

// ═══════════════════════════════════════════════════════════════════════════
// SHARED MOTION
// ═══════════════════════════════════════════════════════════════════════════
const SOFT_SPRING = { type: 'spring', stiffness: 280, damping: 28, bounce: 0 } as const
const SNAPPY = { type: 'spring', stiffness: 380, damping: 26, bounce: 0 } as const

// ═══════════════════════════════════════════════════════════════════════════
// STEP 1 — WELCOME — bouncing wordmark + floating stickers + sparkle rain
// Three layered animations stacked on top of each other:
//   1. AQUATERRA wordmark with each letter bobbing on its own sine offset
//   2. 4 stickers orbiting + bobbing around the wordmark (continuous)
//   3. 14 sparkle dots drifting upward in the background, fading out at top
// The result is a "party energy" frame instead of the static badge pile.
// ═══════════════════════════════════════════════════════════════════════════
const WORDMARK = 'AQUATERRA'.split('')
const FLOAT_STICKERS = [
  { label: '★ EST 2021',      cls: 'sticker-mint', x: -120, y: -90, baseRot: -8,  phase: 0.0 },
  { label: 'STUDENT RUN',     cls: 'sticker-pink', x:  118, y: -84, baseRot:  7,  phase: 1.2 },
  { label: '1,200+',          cls: 'sticker-mint', x: -130, y:  86, baseRot: -4,  phase: 2.4 },
  { label: '★ OPEN ACCESS',   cls: 'sticker-pink', x:  110, y:  90, baseRot:  9,  phase: 3.6 },
]
const SPARKLES = Array.from({ length: 14 }).map((_, i) => ({
  x: -130 + (i * 19) % 260,
  delay: (i * 0.27) % 4.2,
  size: i % 3 === 0 ? 6 : i % 3 === 1 ? 4 : 3,
  color: ['var(--mint)', 'var(--pink)', 'var(--lemon)', '#7E5BFF', '#FF7A1A'][i % 5],
}))

function StickerStack() {
  return (
    <div className="onb-vis onb-vis-stickers" aria-hidden>
      {/* Background sparkle rain — dots drift upward continuously, fading
          out near the top. Each one has its own delay so they don't all
          travel together. */}
      <div className="onb-sparkle-layer">
        {SPARKLES.map((s, i) => (
          <motion.span
            key={i}
            className="onb-sparkle"
            style={{
              left: `calc(50% + ${s.x}px)`,
              width: s.size,
              height: s.size,
              background: s.color,
            }}
            initial={{ y: 140, opacity: 0 }}
            animate={{ y: -160, opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 4.6,
              delay: s.delay,
              repeat: Infinity,
              ease: 'linear',
              times: [0, 0.15, 0.7, 1],
            }}
          />
        ))}
      </div>

      {/* Mint glow behind the wordmark */}
      <div className="onb-welcome-glow" />

      {/* Centred AQUATERRA wordmark — each letter bobs independently */}
      <div className="onb-wordmark" role="presentation">
        {WORDMARK.map((ch, i) => (
          <motion.span
            key={i}
            className="onb-wordmark-char"
            initial={{ opacity: 0, y: 18 }}
            animate={{
              opacity: 1,
              y: [0, -6, 0],
            }}
            transition={{
              opacity: { duration: 0.4, delay: 0.05 * i },
              y: {
                duration: 2.4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.4 + i * 0.12,
                repeatType: 'mirror',
              },
            }}
          >
            {ch}
          </motion.span>
        ))}
      </div>

      {/* Floating stickers around the wordmark — each on its own bob cycle */}
      {FLOAT_STICKERS.map((s, i) => (
        <motion.span
          key={s.label}
          className={`sticker ${s.cls} onb-float-sticker`}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: [s.x, s.x + 6, s.x - 6, s.x],
            y: [s.y, s.y - 8, s.y + 4, s.y],
            rotate: [s.baseRot, s.baseRot + 3, s.baseRot - 2, s.baseRot],
          }}
          whileHover={{ scale: 1.1, rotate: s.baseRot * 1.8 }}
          transition={{
            opacity: { duration: 0.4, delay: 0.3 + i * 0.08, ease: 'easeOut' },
            scale:   { ...SOFT_SPRING, delay: 0.3 + i * 0.08 },
            x:       { duration: 5.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: s.phase },
            y:       { duration: 5.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: s.phase },
            rotate:  { duration: 5.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: s.phase },
          }}
          style={{
            position: 'absolute',
            left: '50%', top: '50%',
            marginLeft: -55, marginTop: -16,
            fontSize: 11,
            padding: '6px 11px',
            boxShadow: '2px 2px 0 var(--ink)',
            cursor: 'default',
            zIndex: 2,
          }}
        >
          {s.label}
        </motion.span>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 2 — THE FEED — live mock card with hearts, toast, and pulse
// The card auto-likes itself on a loop, hearts float up from the like
// button each time, a "✨ new post" toast slides in periodically from
// the top of the visual, and a live-dot pulses next to the timestamp.
// Three concurrent animations make the card feel alive instead of static.
// ═══════════════════════════════════════════════════════════════════════════
function MockFeedCard() {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(23)
  // Each "heart burst" gets a unique id so we can let multiple hearts
  // co-exist on screen — one heart per like, fading + drifting upward
  // for 1.2s before being cleaned up.
  const [hearts, setHearts] = useState<{ id: number; dx: number }[]>([])
  const [showToast, setShowToast] = useState(false)

  // Loop the like state every 3.4s so the card stays animated forever.
  useEffect(() => {
    let count = 23
    let toggle = false
    let nextHeartId = 0
    const tick = setInterval(() => {
      toggle = !toggle
      if (toggle) {
        count += 1
        nextHeartId += 1
        const id = nextHeartId
        const dx = (Math.random() - 0.5) * 24
        setHearts((h) => [...h, { id, dx }])
        // Auto-remove hearts after their float animation ends
        setTimeout(() => setHearts((h) => h.filter((x) => x.id !== id)), 1200)
      } else {
        count -= 1
      }
      setLiked(toggle)
      setLikeCount(count)
    }, 1700)
    return () => clearInterval(tick)
  }, [])

  // "New post" toast — slides in periodically from the top of the visual
  // to suggest the feed is live and updating in real-time.
  useEffect(() => {
    const cycle = setInterval(() => {
      setShowToast(true)
      setTimeout(() => setShowToast(false), 2200)
    }, 5000)
    // Show it once shortly after mount so users see it immediately
    const initial = setTimeout(() => {
      setShowToast(true)
      setTimeout(() => setShowToast(false), 2200)
    }, 1800)
    return () => { clearInterval(cycle); clearTimeout(initial) }
  }, [])

  const handleManualLike = () => {
    const willLike = !liked
    setLiked(willLike)
    setLikeCount(likeCount + (willLike ? 1 : -1))
    if (willLike) {
      const id = Date.now()
      setHearts((h) => [...h, { id, dx: (Math.random() - 0.5) * 24 }])
      setTimeout(() => setHearts((h) => h.filter((x) => x.id !== id)), 1200)
    }
  }

  return (
    <div className="onb-vis onb-vis-card" aria-hidden>
      {/* "New post" toast — slides in from top */}
      <AnimatePresence initial={false}>
        {showToast && (
          <motion.div
            className="onb-feed-toast"
            initial={{ opacity: 0, y: -22, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={SNAPPY}
          >
            <span style={{ marginRight: 6 }}>✨</span>
            new post from <strong style={{ marginLeft: 4 }}>Karan</strong>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="onb-mock-card"
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={SOFT_SPRING}
      >
        {/* Header */}
        <div className="onb-mock-head">
          <div className="onb-mock-avatar" style={{ background: '#FF7A1A' }}>R</div>
          <div className="onb-mock-meta">
            <div className="onb-mock-name">Riya G.</div>
            <div className="onb-mock-sub">
              <span style={{ color: '#FF7A1A', fontWeight: 700 }}>welfare</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span style={{ opacity: 0.7 }}>2h</span>
              {/* Live pulse dot — indicates the feed is "active" */}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, opacity: 0.6 }}>
                <motion.span
                  className="onb-live-dot"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                />
                <span style={{ fontSize: 9, letterSpacing: '0.1em' }}>LIVE</span>
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="onb-mock-body">
          fed 18 strays in ballygunge this morning. team showed up at 5am.
          left snacks for the rest of the week 🐕
        </div>

        {/* Photo placeholder w/ gradient */}
        <div className="onb-mock-photo" />

        {/* Actions */}
        <div className="onb-mock-actions">
          <motion.button
            className="onb-mock-like"
            onClick={handleManualLike}
            whileTap={{ scale: 0.92 }}
            transition={SNAPPY}
            style={{ position: 'relative' }}
          >
            <motion.span
              animate={liked ? { scale: [1, 1.4, 1] } : { scale: 1 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'inline-block', color: liked ? '#FF6BD6' : 'var(--ink-3)', fontSize: 16 }}
            >
              {liked ? '♥' : '♡'}
            </motion.span>
            <motion.span
              key={likeCount}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={SNAPPY}
              style={{ fontVariantNumeric: 'tabular-nums', display: 'inline-block', fontWeight: 600 }}
            >
              {likeCount}
            </motion.span>

            {/* Floating-up hearts — one spawns per like, drifts upward,
                wobbles sideways, then fades out at 1.2s. Multiple can
                live concurrently for rapid likes. */}
            <AnimatePresence>
              {hearts.map((h) => (
                <motion.span
                  key={h.id}
                  className="onb-float-heart"
                  initial={{ opacity: 0, y: 0, x: 0, scale: 0.6 }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    y: -54,
                    x: h.dx,
                    scale: [0.6, 1.1, 1, 0.95],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: 'easeOut', times: [0, 0.2, 0.7, 1] }}
                >
                  ♥
                </motion.span>
              ))}
            </AnimatePresence>
          </motion.button>
          <span className="onb-mock-meta-act">💬 4</span>
          <span className="onb-mock-meta-act">🔖</span>
        </div>
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 3 — THE PEOPLE — member orbit
// "You" at the center, surrounded by orbiting member avatars. Avatars
// stagger in around a circle. Subtle continuous rotation makes the
// constellation feel alive.
// ═══════════════════════════════════════════════════════════════════════════
const ORBIT_MEMBERS = [
  { initial: 'A', color: '#00E5A0', angle: 0 },
  { initial: 'P', color: '#FF6BD6', angle: 60 },
  { initial: 'K', color: '#FFC700', angle: 120 },
  { initial: 'S', color: '#7E5BFF', angle: 180 },
  { initial: 'M', color: '#3DA9FC', angle: 240 },
  { initial: 'J', color: '#FF7A1A', angle: 300 },
]

function MemberOrbit() {
  const radius = 95
  return (
    <div className="onb-vis onb-vis-orbit" aria-hidden>
      <motion.div
        className="onb-orbit-frame"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        {ORBIT_MEMBERS.map((m, i) => {
          const rad = (m.angle * Math.PI) / 180
          const x = Math.cos(rad) * radius
          const y = Math.sin(rad) * radius
          return (
            <motion.div
              key={m.initial}
              className="onb-orbit-node"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...SOFT_SPRING, delay: 0.1 + i * 0.06 }}
              style={{
                background: m.color,
                left: `calc(50% + ${x}px - 22px)`,
                top: `calc(50% + ${y}px - 22px)`,
              }}
            >
              {/* Counter-rotate the avatar so text stays upright as the parent spins */}
              <motion.span
                animate={{ rotate: -360 }}
                transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                style={{ display: 'inline-block' }}
              >
                {m.initial}
              </motion.span>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Center "you" */}
      <motion.div
        className="onb-orbit-you"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...SOFT_SPRING, delay: 0.05 }}
      >
        you
      </motion.div>

      {/* Background concentric circles */}
      <svg className="onb-orbit-rings" viewBox="-150 -150 300 300" aria-hidden>
        <circle cx="0" cy="0" r="95" fill="none" stroke="var(--line)" strokeWidth="1" strokeDasharray="3 6" />
        <circle cx="0" cy="0" r="60" fill="none" stroke="var(--line)" strokeWidth="1" strokeDasharray="3 6" />
      </svg>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 4 — APPLY — auto-filling mock form
// Form fields type themselves with checkmarks landing as each one
// "completes". Simulates the recruitment flow in miniature.
// ═══════════════════════════════════════════════════════════════════════════
const MOCK_FIELDS = [
  { label: 'Full name',  value: 'Riya Ghosh',         delay: 0.25 },
  { label: 'School',     value: 'St. Xavier\'s',      delay: 0.85 },
  { label: 'WhatsApp',   value: '+91 90734 55396',    delay: 1.40 },
  { label: 'Instagram',  value: '@riya.ghosh',        delay: 1.95 },
]

function MockForm() {
  const [filled, setFilled] = useState<boolean[]>(new Array(MOCK_FIELDS.length).fill(false))

  useEffect(() => {
    const timers = MOCK_FIELDS.map((f, i) =>
      setTimeout(() => {
        setFilled((prev) => {
          const next = [...prev]
          next[i] = true
          return next
        })
      }, f.delay * 1000),
    )
    return () => timers.forEach((t) => clearTimeout(t))
  }, [])

  return (
    <div className="onb-vis onb-vis-form" aria-hidden>
      <motion.div
        className="onb-mock-form"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SOFT_SPRING}
      >
        <div className="onb-mock-form-head">
          <span className="sticker sticker-mint" style={{ fontSize: 10, padding: '3px 8px' }}>★ JOIN AQUATERRA</span>
        </div>
        {MOCK_FIELDS.map((f, i) => (
          <div key={f.label} className="onb-mock-row">
            <div className="onb-mock-label">{f.label}</div>
            <div className="onb-mock-input" data-filled={filled[i] || undefined}>
              <AnimatePresence mode="wait" initial={false}>
                {filled[i] ? (
                  <motion.span
                    key="val"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={SNAPPY}
                    className="onb-mock-value"
                  >
                    {f.value}
                  </motion.span>
                ) : (
                  <motion.span
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="onb-mock-placeholder"
                  >
                    typing…
                  </motion.span>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {filled[i] && (
                  <motion.span
                    key="check"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={SNAPPY}
                    className="onb-mock-check"
                  >
                    ✓
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
        <motion.div
          className="onb-mock-submit"
          initial={{ opacity: 0.4 }}
          animate={{ opacity: filled.every(Boolean) ? 1 : 0.4 }}
          transition={{ duration: 0.25 }}
        >
          submit →
        </motion.div>
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 5 — ONCE YOU'RE IN — unlock burst
// Big "APPROVED" stamp lands with rotation + scale impact, four action
// chips fly out radially around it, light dust particles fade in.
// ═══════════════════════════════════════════════════════════════════════════
const UNLOCKS = [
  { label: '📝 post',     dx: -88, dy: -52, delay: 0.30 },
  { label: '👥 join',     dx:  88, dy: -52, delay: 0.40 },
  { label: '🔖 save',     dx: -88, dy:  52, delay: 0.50 },
  { label: '🔔 notify',   dx:  88, dy:  52, delay: 0.60 },
]

function UnlockBurst() {
  return (
    <div className="onb-vis onb-vis-unlock" aria-hidden>
      {/* Confetti dots */}
      <svg className="onb-unlock-confetti" viewBox="-150 -150 300 300" aria-hidden>
        {Array.from({ length: 14 }).map((_, i) => {
          const angle = (i / 14) * Math.PI * 2
          const r = 110 + (i % 3) * 8
          const x = Math.cos(angle) * r
          const y = Math.sin(angle) * r
          const colors = ['var(--mint)', 'var(--pink)', 'var(--lemon)', '#7E5BFF', '#FF7A1A']
          return (
            <motion.circle
              key={i}
              cx={x} cy={y} r="3"
              fill={colors[i % colors.length]}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0.6], scale: [0, 1.2, 1] }}
              transition={{ duration: 1.2, delay: 0.4 + (i % 5) * 0.06, ease: 'easeOut' }}
            />
          )
        })}
      </svg>

      {/* Center APPROVED stamp */}
      <motion.div
        className="onb-unlock-stamp"
        initial={{ rotate: -28, scale: 0, opacity: 0 }}
        animate={{ rotate: -8, scale: 1, opacity: 1 }}
        transition={{ ...SOFT_SPRING, stiffness: 360, damping: 22 }}
      >
        <div style={{ fontSize: 11, letterSpacing: '0.18em', opacity: 0.8 }}>director</div>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1, marginTop: 2 }}>APPROVED</div>
        <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4, fontFamily: 'var(--mono)' }}>welcome aboard</div>
      </motion.div>

      {/* Action chips */}
      {UNLOCKS.map((u) => (
        <motion.div
          key={u.label}
          className="onb-unlock-chip"
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: 1, x: u.dx, y: u.dy, scale: 1 }}
          transition={{ ...SOFT_SPRING, delay: u.delay }}
        >
          {u.label}
        </motion.div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP CONTENT — text columns paired with each visual
// ═══════════════════════════════════════════════════════════════════════════
function StepHello() {
  return (
    <div className="onb-step">
      <span className="sticker sticker-mint" style={{ display: 'inline-flex', marginBottom: 14 }}>★ WELCOME</span>
      <h2 className="h-display onb-step-title">
        you found <span style={{ color: 'var(--mint)' }}>aquaterra</span>.
      </h2>
      <p className="onb-step-body">
        We're a community of <strong>1,200+ Kolkata students</strong> documenting
        real welfare drives, real projects, and very real weird ideas.
        Open access. Always.
      </p>
      <p className="onb-step-meta">5 quick steps to know how this place works.</p>
    </div>
  )
}

function StepFeed() {
  return (
    <div className="onb-step">
      <span className="sticker sticker-pink" style={{ display: 'inline-flex', marginBottom: 14 }}>★ THE FEED</span>
      <h2 className="h-display onb-step-title">
        what we're <span style={{ color: 'var(--pink)' }}>up to.</span>
      </h2>
      <p className="onb-step-body">
        Every member posts updates from their drives, classes, and projects.
        Scroll the <span className="onb-code">home feed</span> to see what's happening
        live across <strong>six categories</strong>.
      </p>
      <p className="onb-step-meta">
        Welfare, content, events, labs, ops, all — one chronological timeline,
        zero algorithm.
      </p>
    </div>
  )
}

function StepPeople() {
  return (
    <div className="onb-step">
      <span className="sticker sticker-ghost" style={{ display: 'inline-flex', marginBottom: 14, color: 'var(--ink)' }}>★ FIND YOUR PEOPLE</span>
      <h2 className="h-display onb-step-title">
        a directory, not a{' '}
        <span style={{ color: 'var(--mint)' }}>follower count.</span>
      </h2>
      <p className="onb-step-body">
        Browse <span className="onb-code">/members</span> to find every student
        in the community. Tap any profile to see their posts, teams, and
        project history.
      </p>
      <p className="onb-step-meta">Follow people whose work you actually want to see. Save posts to come back to.</p>
    </div>
  )
}

function StepApply() {
  return (
    <div className="onb-step">
      <span className="sticker sticker-mint" style={{ display: 'inline-flex', marginBottom: 14 }}>★ JOIN US</span>
      <h2 className="h-display onb-step-title">
        one form, <span style={{ color: 'var(--mint)' }}>two minutes.</span>
      </h2>
      <p className="onb-step-body">
        Posting requires being a member. Fill the form at{' '}
        <span className="onb-code">/recruitment</span> — name, school, WhatsApp,
        instagram. <strong>No fee, no test.</strong>
      </p>
      <p className="onb-step-meta">
        Make sure your phone is on WhatsApp — directors text new applicants there
        for onboarding.
      </p>
    </div>
  )
}

function StepInside() {
  return (
    <div className="onb-step">
      <span className="sticker sticker-pink wobble" style={{ display: 'inline-flex', marginBottom: 14 }}>★ ONCE YOU'RE IN</span>
      <h2 className="h-display onb-step-title">
        you'll get <span style={{ color: 'var(--pink)' }}>the keys.</span>
      </h2>
      <p className="onb-step-body">
        After a director approves you (usually within <strong>48 hours</strong>),
        post to the feed, join teams, save anything worth re-reading, and get
        notified when someone tags you.
      </p>
      <p className="onb-step-meta">Welcome aboard. Now make something.</p>
    </div>
  )
}

const STEPS = [
  { kicker: '01 · welcome',         Body: StepHello,  Visual: StickerStack },
  { kicker: '02 · the feed',        Body: StepFeed,   Visual: MockFeedCard },
  { kicker: '03 · the people',      Body: StepPeople, Visual: MemberOrbit },
  { kicker: '04 · apply',           Body: StepApply,  Visual: MockForm },
  { kicker: '05 · once you\'re in', Body: StepInside, Visual: UnlockBurst },
]

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE TRANSITION VARIANTS
// ═══════════════════════════════════════════════════════════════════════════
const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 32 : -32, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -32 : 32, opacity: 0 }),
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════
export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)

  const goNext = useCallback(() => {
    if (step < STEPS.length - 1) { setDirection(1); setStep((s) => s + 1) }
    else navigate('/recruitment')
  }, [step, navigate])

  const goPrev = useCallback(() => {
    if (step > 0) { setDirection(-1); setStep((s) => s - 1) }
  }, [step])

  const goTo = useCallback((i: number) => {
    if (i === step) return
    setDirection(i > step ? 1 : -1)
    setStep(i)
  }, [step])

  const skip = useCallback(() => navigate('/'), [navigate])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') { e.preventDefault(); goNext() }
      else if (e.key === 'ArrowLeft')  { e.preventDefault(); goPrev() }
      else if (e.key === 'Escape')     { e.preventDefault(); skip() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goNext, goPrev, skip])

  const { Body, Visual } = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="onb-root route-enter">
      {/* ── Top bar: progress + skip ─────────────────────────────────────── */}
      <header className="onb-topbar">
        <div className="onb-progress" role="tablist" aria-label="Onboarding progress">
          {STEPS.map((s, i) => {
            const done = i < step
            const active = i === step
            return (
              <button
                key={i}
                role="tab"
                aria-selected={active}
                aria-label={`Step ${i + 1} of ${STEPS.length}: ${s.kicker}`}
                onClick={() => goTo(i)}
                className="onb-dot"
                data-active={active || undefined}
                data-done={done || undefined}
              >
                <span className="onb-dot-bar" />
              </button>
            )
          })}
        </div>
        <button onClick={skip} className="onb-skip" aria-label="Skip onboarding">skip →</button>
      </header>

      {/* ── Kicker counter ───────────────────────────────────────────────── */}
      <div className="onb-kicker">
        <motion.span
          key={`num-${step}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SNAPPY}
          className="onb-kicker-num"
        >
          {STEPS[step].kicker}
        </motion.span>
        <span className="onb-kicker-total">/ {STEPS.length} steps</span>
      </div>

      {/* ── Stage: 2-column on desktop, stacked on mobile ────────────────── */}
      <main className="onb-stage">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ ...SOFT_SPRING, opacity: { duration: 0.18 } }}
            className="onb-step-grid"
          >
            <div className="onb-step-text"><Body /></div>
            <div className="onb-step-visual"><Visual /></div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Bottom nav ───────────────────────────────────────────────────── */}
      <footer className="onb-nav">
        <button onClick={goPrev} disabled={step === 0} className="btn onb-prev" aria-label="Previous step">
          ← back
        </button>
        <button onClick={goNext} className="btn btn-primary onb-next" aria-label={isLast ? 'Come do the work with us' : 'Next step'}>
          {isLast ? 'come do the work with us →' : 'next →'}
        </button>
      </footer>

      {/* ── Scoped styles ────────────────────────────────────────────────── */}
      <style>{`
        .onb-root {
          min-height: 100dvh;
          background: var(--bg);
          color: var(--ink);
          display: flex;
          flex-direction: column;
          padding: clamp(16px, 3vw, 28px) clamp(16px, 4vw, 40px);
          max-width: 1080px;
          margin: 0 auto;
        }

        /* ── Top bar ── */
        .onb-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding-bottom: clamp(20px, 3vw, 32px);
        }
        .onb-progress { display: flex; gap: 8px; flex: 1; max-width: 420px; }
        .onb-dot {
          flex: 1;
          height: 6px;
          padding: 12px 0;
          background: none;
          border: 0;
          cursor: pointer;
          position: relative;
        }
        .onb-dot-bar {
          display: block;
          height: 6px;
          width: 100%;
          border-radius: 999px;
          background: var(--line);
          transition: background 220ms cubic-bezier(0.2,0,0,1), transform 220ms cubic-bezier(0.2,0,0,1);
        }
        .onb-dot[data-done] .onb-dot-bar { background: var(--mint); }
        .onb-dot[data-active] .onb-dot-bar { background: var(--ink); transform: scaleY(1.2); }

        .onb-skip {
          background: none;
          border: 0;
          padding: 12px 8px;
          min-height: 40px;
          cursor: pointer;
          font-family: var(--mono);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--ink-3);
          transition: color 150ms cubic-bezier(0.2,0,0,1), transform 120ms;
        }
        .onb-skip:hover { color: var(--ink); }
        .onb-skip:active { transform: scale(0.96); }

        /* ── Kicker ── */
        .onb-kicker {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 8px;
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .onb-kicker-num { color: var(--ink); font-weight: 700; }
        .onb-kicker-total { color: var(--ink-3); font-weight: 500; font-variant-numeric: tabular-nums; }

        /* ── Stage layout ── */
        .onb-stage {
          flex: 1;
          display: flex;
          align-items: stretch;
          padding: clamp(8px, 2vw, 24px) 0;
          min-height: 0;
        }
        .onb-step-grid {
          width: 100%;
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(24px, 4vw, 48px);
          align-items: center;
        }
        @media (min-width: 760px) {
          .onb-step-grid {
            grid-template-columns: 1fr 1fr;
            gap: clamp(32px, 5vw, 64px);
          }
        }
        .onb-step-visual {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 280px;
        }

        /* ── Step text ── */
        .onb-step {
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-width: 480px;
        }
        .onb-step-title {
          font-size: clamp(36px, 6vw, 60px);
          line-height: 0.96;
          letter-spacing: -0.03em;
          margin: 0;
          text-wrap: balance;
          color: var(--ink);
        }
        .onb-step-body {
          font-size: clamp(15px, 1.8vw, 17px);
          line-height: 1.6;
          color: var(--ink-2);
          text-wrap: pretty;
          margin: 0;
        }
        .onb-step-meta {
          font-size: 13px;
          line-height: 1.55;
          color: var(--ink-3);
          text-wrap: pretty;
          margin: 0;
        }
        .onb-code {
          font-family: var(--mono);
          font-size: 0.88em;
          background: var(--bg-2);
          padding: 2px 8px;
          border-radius: 6px;
          border: 1px solid var(--line);
          white-space: nowrap;
        }

        /* ──────────────────────────────────────────────────────────────────
           VISUAL: STEP 1 — sticker stack
           ────────────────────────────────────────────────────────────────── */
        .onb-vis {
          position: relative;
          width: 100%;
          height: 320px;
          max-width: 420px;
        }
        .onb-vis-stickers {
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 24px;
        }
        .onb-welcome-glow {
          position: absolute;
          left: 50%; top: 50%;
          width: 280px; height: 180px;
          margin-left: -140px; margin-top: -90px;
          background: radial-gradient(ellipse at center, rgba(0,229,160,0.22) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          filter: blur(8px);
        }
        .onb-sparkle-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .onb-sparkle {
          position: absolute;
          top: 50%;
          border-radius: 50%;
          box-shadow: 0 0 6px currentColor;
        }
        .onb-wordmark {
          position: relative;
          z-index: 1;
          display: flex;
          gap: 2px;
          font-family: var(--display);
          font-weight: 900;
          font-size: clamp(28px, 4.5vw, 44px);
          letter-spacing: -0.04em;
          color: var(--ink);
          line-height: 1;
        }
        .onb-wordmark-char {
          display: inline-block;
          will-change: transform;
        }
        .onb-float-sticker {
          will-change: transform;
        }

        /* ──────────────────────────────────────────────────────────────────
           VISUAL: STEP 2 — mock feed card
           ────────────────────────────────────────────────────────────────── */
        .onb-mock-card {
          background: var(--bg);
          border: 1.5px solid var(--line);
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 4px 18px rgba(0,0,0,0.06);
          width: 100%;
          max-width: 360px;
        }
        .onb-mock-head {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        .onb-mock-avatar {
          width: 36px; height: 36px;
          border-radius: 50%;
          color: #fff;
          display: grid; place-items: center;
          font-family: var(--display);
          font-weight: 900;
          font-size: 13px;
          outline: 1px solid rgba(0,0,0,0.1);
          outline-offset: -1px;
        }
        .onb-mock-name { font-size: 14px; font-weight: 700; letter-spacing: -0.01em; color: var(--ink); }
        .onb-mock-sub { display: flex; gap: 5px; font-family: var(--mono); font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }
        .onb-mock-body {
          font-size: 13.5px;
          line-height: 1.6;
          color: var(--ink-2);
          margin-bottom: 12px;
        }
        .onb-mock-photo {
          aspect-ratio: 16 / 10;
          background: linear-gradient(135deg, #FFD09B 0%, #FF7A1A 60%, #FF6BD6 100%);
          border-radius: 10px;
          margin-bottom: 12px;
          outline: 1px solid rgba(0,0,0,0.1);
          outline-offset: -1px;
        }
        .onb-mock-actions {
          display: flex;
          align-items: center;
          gap: 14px;
          padding-top: 10px;
          border-top: 1px solid var(--line);
          font-size: 12px;
        }
        .onb-mock-like {
          background: none;
          border: 0;
          padding: 6px 10px;
          margin: -6px -10px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--ink);
          border-radius: 8px;
          transition: background 150ms cubic-bezier(0.2,0,0,1);
        }
        .onb-mock-like:hover { background: var(--bg-2); }
        .onb-mock-meta-act { color: var(--ink-3); }

        /* Step 2 — live indicator pulse */
        .onb-live-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #FF6BD6;
          margin-left: 6px;
          box-shadow: 0 0 4px rgba(255,107,214,0.6);
        }

        /* Step 2 — "new post" toast above the card */
        .onb-vis-card {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .onb-feed-toast {
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--ink);
          color: var(--bg);
          padding: 7px 14px;
          border-radius: 999px;
          font-family: var(--mono);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          white-space: nowrap;
          box-shadow: 0 4px 18px rgba(0,0,0,0.25);
          z-index: 5;
          display: inline-flex;
          align-items: center;
        }

        /* Step 2 — floating hearts that spawn from the like button */
        .onb-float-heart {
          position: absolute;
          left: 14px;
          bottom: 6px;
          font-size: 18px;
          color: #FF6BD6;
          text-shadow: 0 0 4px rgba(255,107,214,0.4);
          pointer-events: none;
          will-change: transform, opacity;
        }

        /* ──────────────────────────────────────────────────────────────────
           VISUAL: STEP 3 — member orbit
           ────────────────────────────────────────────────────────────────── */
        .onb-vis-orbit {
          height: 320px;
        }
        .onb-orbit-rings {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .onb-orbit-frame {
          position: absolute;
          inset: 0;
        }
        .onb-orbit-node {
          position: absolute;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: #0A0A0A;
          font-family: var(--display);
          font-weight: 900;
          font-size: 16px;
          outline: 1.5px solid var(--ink);
          outline-offset: -1.5px;
          box-shadow: 2px 2px 0 var(--ink);
        }
        .onb-orbit-you {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 76px;
          height: 76px;
          border-radius: 50%;
          background: var(--ink);
          color: var(--bg);
          display: grid;
          place-items: center;
          font-family: var(--display);
          font-weight: 900;
          font-size: 14px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          box-shadow: 4px 4px 0 var(--mint);
        }

        /* ──────────────────────────────────────────────────────────────────
           VISUAL: STEP 4 — auto-filling form
           ────────────────────────────────────────────────────────────────── */
        .onb-vis-form { height: auto; }
        .onb-mock-form {
          background: var(--bg);
          border: 1.5px solid var(--line);
          border-radius: 16px;
          padding: 18px 18px 22px;
          width: 100%;
          max-width: 320px;
          box-shadow: 4px 4px 0 var(--ink);
        }
        .onb-mock-form-head { margin-bottom: 14px; }
        .onb-mock-row { margin-bottom: 10px; }
        .onb-mock-label {
          font-family: var(--mono);
          font-size: 9.5px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink-3);
          margin-bottom: 4px;
        }
        .onb-mock-input {
          position: relative;
          border: 1.5px solid var(--line);
          border-radius: 8px;
          padding: 8px 32px 8px 10px;
          min-height: 32px;
          display: flex;
          align-items: center;
          background: var(--bg);
          transition: border-color 200ms cubic-bezier(0.2,0,0,1);
        }
        .onb-mock-input[data-filled] { border-color: var(--mint); background: rgba(0,229,160,0.06); }
        .onb-mock-placeholder { color: var(--ink-3); font-size: 12.5px; font-style: italic; opacity: 0.55; }
        .onb-mock-value { color: var(--ink); font-size: 13px; font-weight: 500; }
        .onb-mock-check {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--mint);
          color: #0A0A0A;
          font-size: 12px;
          font-weight: 900;
          display: grid;
          place-items: center;
        }
        .onb-mock-submit {
          margin-top: 14px;
          padding: 10px;
          background: var(--ink);
          color: var(--bg);
          border-radius: 999px;
          text-align: center;
          font-family: var(--display);
          font-weight: 700;
          font-size: 13px;
        }

        /* ──────────────────────────────────────────────────────────────────
           VISUAL: STEP 5 — unlock burst
           ────────────────────────────────────────────────────────────────── */
        .onb-vis-unlock { height: 320px; }
        .onb-unlock-confetti {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .onb-unlock-stamp {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%) rotate(-8deg);
          background: var(--bg);
          border: 3px solid var(--pink);
          border-radius: 12px;
          padding: 14px 22px;
          color: var(--pink);
          text-align: center;
          font-family: var(--display);
          box-shadow: 4px 4px 0 var(--ink);
        }
        .onb-unlock-chip {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          background: var(--bg);
          border: 1.5px solid var(--ink);
          border-radius: 999px;
          padding: 8px 14px;
          font-family: var(--display);
          font-weight: 700;
          font-size: 13px;
          color: var(--ink);
          box-shadow: 2px 2px 0 var(--ink);
          white-space: nowrap;
        }

        /* ── Bottom nav ── */
        .onb-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding-top: clamp(20px, 3vw, 32px);
          margin-top: auto;
        }
        .onb-prev, .onb-next {
          min-height: 48px;
          padding: 12px 22px;
          font-family: var(--display, var(--mono));
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.02em;
          border-radius: 999px;
          cursor: pointer;
          transition: background-color 150ms cubic-bezier(0.2,0,0,1),
                      color 150ms cubic-bezier(0.2,0,0,1),
                      transform 120ms cubic-bezier(0.2,0,0,1),
                      opacity 150ms cubic-bezier(0.2,0,0,1);
        }
        .onb-prev { background: transparent; border: 1.5px solid var(--line); color: var(--ink); }
        .onb-prev:hover:not(:disabled) { border-color: var(--ink); }
        .onb-prev:active:not(:disabled) { transform: scale(0.96); }
        .onb-prev:disabled { opacity: 0.35; cursor: not-allowed; }
        .onb-next { background: var(--ink); color: var(--bg); border: 1.5px solid var(--ink); }
        .onb-next:hover { background: var(--mint); color: var(--ink); border-color: var(--mint); }
        .onb-next:active { transform: scale(0.96); }

        /* ──────────────────────────────────────────────────────────────────
           MOBILE OPTIMISATION
           At <760px the layout collapses from 2-col to stacked. Without
           further intervention the visuals (designed for ~420px wide
           desktop slots) sit at full size on a 360px phone with their
           absolute-positioned children pushed outside the viewport.
           Below we tighten everything proportionally so the whole flow
           fits in one phone screen — visual on top, text in the middle,
           nav buttons at the bottom — without scrolling.
           ────────────────────────────────────────────────────────────────── */
        @media (max-width: 759px) {
          /* Tighter outer padding + viewport-height shell so we fit
             cleanly in 100dvh without a scrollbar on common phone
             sizes (iPhone 12 = 844, Pixel 7 = 915). */
          .onb-root {
            padding: 14px 16px 18px;
            min-height: 100dvh;
          }

          /* Stage gets a smaller, flexible gap. Visual sits closer to
             the text so the eye reads them as one unit. */
          .onb-step-grid {
            gap: 18px;
            align-items: start;
          }
          .onb-stage {
            padding: 8px 0;
          }

          /* All visuals get a uniform downscale + reduced container
             height. transform-origin: top keeps the visual anchored
             so the text below doesn't get pushed by leftover space. */
          .onb-vis {
            transform: scale(0.74);
            transform-origin: top center;
            height: 220px;
            margin: 0 auto -40px; /* claw back the layout space the scale leaves behind */
          }

          /* Step text — smaller display title so it doesn't crowd the
             screen, and tighter line-height because the big headline
             often takes two lines on mobile. */
          .onb-step-title {
            font-size: clamp(28px, 9vw, 40px);
            line-height: 0.98;
          }
          .onb-step {
            gap: 10px;
          }
          .onb-step-body {
            font-size: 14.5px;
            line-height: 1.5;
          }
          .onb-step-meta {
            font-size: 12.5px;
          }

          /* Progress bar gets shorter so it doesn't dominate the
             top of the viewport, but stays tappable. */
          .onb-progress {
            max-width: 240px;
          }
          .onb-dot { padding: 10px 0; }
          .onb-skip { padding: 10px 4px; font-size: 11px; }

          /* Step 2 toast — could otherwise spill out of a narrow
             card slot at the top. Cap its width and shrink its font. */
          .onb-feed-toast {
            font-size: 10px;
            padding: 6px 11px;
            max-width: calc(100% - 24px);
          }

          /* Nav buttons can be slightly tighter on phones — still
             ≥44px tall (HIG) via padding + line-height math. */
          .onb-prev, .onb-next {
            min-height: 44px;
            padding: 10px 18px;
            font-size: 14px;
          }
        }

        /* Even narrower phones (iPhone SE-class, 375px and below)
           need one more notch of compression on the wordmark since
           the 9vw clamp still produces a large letter on these
           screens — drop the floor. */
        @media (max-width: 400px) {
          .onb-wordmark { font-size: clamp(22px, 7.5vw, 30px); }
          .onb-vis { transform: scale(0.68); margin: 0 auto -56px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .onb-skip, .onb-prev, .onb-next, .onb-mock-input,
          .onb-dot-bar { transition: none; }
          .onb-orbit-frame { animation: none !important; }
          /* Continuous bobs/pulses also strip out so reduced-motion
             users don't get any infinite animation. */
          .onb-wordmark-char, .onb-float-sticker,
          .onb-sparkle, .onb-live-dot { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
