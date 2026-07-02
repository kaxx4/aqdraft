import { useState, useEffect, useMemo, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useReducedMotion, type Transition } from 'framer-motion'

/**
 * DynamicIslandTOC — an Apple-Dynamic-Island-style floating table of contents.
 * Adapted from the recipe to the AquaTerra stack: inline styles + brand vars
 * (no shadcn tokens / Tailwind utilities / cn), framer-motion (already a dep),
 * an inline X icon (no lucide), no Lenis. Themed as a dark pill with cream text
 * and mint accents so it pops on the cream pages. Reduced-motion safe.
 *
 * Drive it off explicit `[data-toc]` elements (default selector); tag any
 * section anchor with `data-toc data-toc-title="…"` and it appears here.
 */

type HeadingData = { id: string; text: string; level: number; element: HTMLElement }

const ease: Transition['ease'] = [0.22, 1, 0.36, 1]
const islandTransition: Transition = { type: 'tween', ease, duration: 0.5 }

const CREAM = 'var(--bg)'
const INK = 'var(--ink)'
const MINT = 'var(--mint)'

function CircleProgress({ percentage }: { percentage: number }) {
  const size = 24
  const strokeWidth = 2.5
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(244,239,224,0.25)" strokeWidth={strokeWidth} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={MINT} strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        strokeLinecap="round"
      />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

export default function DynamicIslandTOC({ selector = '[data-toc]' }: { selector?: string }) {
  const reduced = useReducedMotion()
  const [headings, setHeadings] = useState<HeadingData[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [progress, setProgress] = useState(0)

  // Scan headings (slight delay lets the page render first).
  useEffect(() => {
    const scan = () => {
      const els = Array.from(document.querySelectorAll(selector)) as HTMLElement[]
      const valid = els
        .filter(el => !el.hasAttribute('data-toc-ignore'))
        .map((el, index) => {
          if (!el.id) {
            const gen = el.textContent?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || `toc-${index}`
            el.id = gen
          }
          const depthAttr = el.getAttribute('data-toc-depth')
          let level = 2
          if (depthAttr) level = parseInt(depthAttr, 10)
          else {
            const tag = el.tagName.toUpperCase()
            if (tag.startsWith('H') && tag.length === 2) level = parseInt(tag[1], 10)
          }
          const text = el.getAttribute('data-toc-title') || el.textContent || 'Section'
          return { id: el.id, text, level, element: el }
        })
      valid.sort((a, b) => (a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
      setHeadings(valid)
    }
    const t = setTimeout(scan, 120)
    return () => clearTimeout(t)
  }, [selector])

  // Scroll spy + progress.
  // rAF-batched: raw scroll events fire faster than the screen repaints, and
  // each one read layout (getBoundingClientRect) + setState. Coalescing to one
  // computation per frame moves the layout reads off the scroll handler (no
  // forced sync reflow mid-scroll) and caps re-renders to the frame rate.
  // Progress is rounded to whole percent so setProgress only re-renders on an
  // actual 1% step, not every sub-pixel — visually identical on the 24px ring.
  useEffect(() => {
    let ticking = false
    const compute = () => {
      ticking = false
      let current: string | null = null
      for (const h of headings) {
        if (h.element.getBoundingClientRect().top <= 120) current = h.id
        else break
      }
      if (!current && headings.length > 0) current = headings[0].id
      setActiveId(current)
      const total = document.documentElement.scrollHeight - window.innerHeight
      setProgress(total > 0 ? Math.round(Math.min(100, Math.max(0, (window.scrollY / total) * 100))) : 0)
    }
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(compute)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    compute()
    return () => window.removeEventListener('scroll', onScroll)
  }, [headings])

  const activeHeading = headings.find(h => h.id === activeId)
  const minLevel = useMemo(() => (headings.length === 0 ? 1 : Math.min(...headings.map(h => h.level))), [headings])

  // Nothing worth navigating — don't show the island.
  if (headings.length < 2) return null
  if (typeof document === 'undefined') return null

  // Portalled to <body> so no page-level transform (e.g. the .route-enter
  // entrance) can become the containing block and break position:fixed.
  return createPortal(
    <>
      {/* Rail offset: clears the top nav (backdrop starts below it) and, on
          mobile, sits above the bottom nav bar so the pill never overlaps it. */}
      <style>{`
        .bp-toc-rail { bottom: 28px; }
        @media (max-width: 767px) { .bp-toc-rail { bottom: calc(96px + env(safe-area-inset-bottom, 0px)); } }
      `}</style>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={islandTransition}
            onClick={() => setIsExpanded(false)}
            /* starts below the navbar so the nav stays visually clear */
            style={{ position: 'fixed', top: 'var(--nav-h, 70px)', left: 0, right: 0, bottom: 0, zIndex: 9998, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
          />
        )}
      </AnimatePresence>

      {/* Full-width centering rail — centers via flex so framer-motion's
          entrance transform can't clobber a translateX(-50%). */}
      <div className="bp-toc-rail" style={{ position: 'fixed', left: 0, right: 0, zIndex: 9999, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <motion.div
        initial={reduced ? false : { y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 25 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'auto' }}
      >
        <motion.div
          onClick={() => { if (!isExpanded) setIsExpanded(true) }}
          initial={false}
          animate={{ width: isExpanded ? 340 : 280, height: isExpanded ? 400 : 52, borderRadius: isExpanded ? 24 : 26 }}
          transition={reduced ? { duration: 0 } : islandTransition}
          style={{
            position: 'relative', overflow: 'hidden', cursor: isExpanded ? 'default' : 'pointer',
            maxWidth: 'calc(100vw - 24px)',
            // Never let the expanded island reach up under the top navbar —
            // cap its height below the nav (the inner list scrolls instead).
            maxHeight: 'calc(100svh - var(--nav-h, 70px) - 40px)',
            background: INK, color: CREAM, border: '1px solid rgba(244,239,224,0.12)',
            boxShadow: '0 18px 50px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.25)',
          }}
          aria-label="Table of contents"
        >
          {/* CLOSED PILL */}
          <motion.div
            initial={false}
            animate={{ opacity: isExpanded ? 0 : 1, scale: isExpanded ? 0.95 : 1, filter: isExpanded ? 'blur(4px)' : 'blur(0px)' }}
            transition={{ ...islandTransition, delay: isExpanded ? 0 : 0.1 }}
            style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 16, padding: '0 18px', pointerEvents: isExpanded ? 'none' : 'auto' }}
          >
            <div style={{ height: 8, width: 8, flexShrink: 0, borderRadius: '50%', background: MINT }} />
            <div style={{ position: 'relative', display: 'flex', height: '100%', flex: 1, alignItems: 'center', overflow: 'hidden', textAlign: 'left' }}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={activeId || 'empty'}
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  style={{ display: 'block', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--eina)', fontSize: 14, fontWeight: 600, color: CREAM }}
                >
                  {activeHeading?.text || 'Contents'}
                </motion.span>
              </AnimatePresence>
            </div>
            <CircleProgress percentage={progress} />
          </motion.div>

          {/* EXPANDED MENU */}
          <motion.div
            initial={false}
            animate={{ opacity: isExpanded ? 1 : 0, scale: isExpanded ? 1 : 1.05 }}
            transition={{ ...islandTransition, delay: isExpanded ? 0.1 : 0 }}
            style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', pointerEvents: isExpanded ? 'auto' : 'none' }}
          >
            <div style={{ display: 'flex', flexShrink: 0, alignItems: 'center', justifyContent: 'space-between', padding: '20px 22px 12px' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(244,239,224,0.5)' }}>
                TABLE OF CONTENTS
              </span>
              <button
                onClick={e => { e.stopPropagation(); setIsExpanded(false) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(244,239,224,0.6)', display: 'flex', padding: 0 }}
                aria-label="Close"
              >
                <XIcon />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', padding: '0 10px 14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {headings.map(h => {
                  const isActive = activeId === h.id
                  const isHovered = hoveredId === h.id
                  const indent = Math.max(0, h.level - minLevel)
                  const paddingLeft = indent * 14 + 12
                  const itemStyle: CSSProperties = {
                    display: 'flex', width: '100%', flexShrink: 0, alignItems: 'center',
                    borderRadius: 9, border: 'none', cursor: 'pointer', textAlign: 'left',
                    padding: '9px 12px 9px ' + paddingLeft + 'px', fontFamily: 'var(--eina)', fontSize: 14,
                    transition: 'background 0.25s ease, color 0.25s ease',
                    background: isActive ? 'rgba(244,239,224,0.12)' : isHovered ? 'rgba(244,239,224,0.06)' : 'transparent',
                    color: isActive ? CREAM : isHovered ? 'rgba(244,239,224,0.85)' : 'rgba(244,239,224,0.45)',
                    fontWeight: isActive ? 600 : 400,
                  }
                  return (
                    <button
                      key={h.id}
                      onMouseEnter={() => setHoveredId(h.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={e => {
                        e.stopPropagation()
                        const y = h.element.getBoundingClientRect().top + window.scrollY - 80
                        window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' })
                        setIsExpanded(false)
                      }}
                      style={itemStyle}
                    >
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.text}</span>
                      <motion.span
                        initial={false}
                        animate={{ scale: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        style={{ marginLeft: 12, height: 6, width: 6, flexShrink: 0, borderRadius: '50%', background: MINT, display: 'inline-block' }}
                      />
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
      </div>
    </>,
    document.body
  )
}
