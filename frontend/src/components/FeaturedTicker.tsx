import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { sized } from '../lib/imageUrl'

export interface TickerItem {
  slug: string
  header: string
  image?: string
  alt?: string
  tag?: string
  color?: string
}

/**
 * FeaturedTicker — a seamless, auto-scrolling marquee of featured project cards.
 *
 * Mechanics: the track holds TWO copies of the card set and animates
 * translateX(0 → -50%); each card owns its trailing gap via margin-right so one
 * copy's width is exactly half the track → the loop is seamless (no jump). It
 * pauses on hover/focus so people can actually read + click a card, the edges
 * fade via a mask, and prefers-reduced-motion turns it into a plain swipe row.
 * The duplicate copy is aria-hidden / untabbable so AT + keyboard only see the
 * real set once.
 */
export default function FeaturedTicker({ items }: { items: TickerItem[] }) {
  // Pause the marquee whenever it isn't on screen. A continuously-animating
  // ~8600px-wide layer is needless compositor + battery load on mobile the
  // moment you scroll past it — this frees the main thread for smooth scrolling.
  const ref = useRef<HTMLDivElement>(null)
  const [onScreen, setOnScreen] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([e]) => setOnScreen(e.isIntersecting),
      { rootMargin: '120px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  if (!items.length) return null
  // With only a handful of items the single copy is too short to fill the track
  // (the loop would show a gap) — repeat until there are enough to span it.
  let base = items
  while (base.length < 6) base = [...base, ...items]
  const loop = [...base, ...base]
  // Calm, premium drift — slower with more cards, floored so it never sprints.
  const duration = Math.max(34, base.length * 5.5)

  return (
    <div className={`ftk${onScreen ? '' : ' ftk-off'}`} role="list" aria-label="Featured projects" ref={ref}>
      <div className="ftk-track" style={{ animationDuration: `${duration}s` }}>
        {loop.map((it, i) => {
          const dupe = i >= base.length
          return (
            <Link
              key={`${it.slug}-${i}`}
              to={`/projects/${it.slug}`}
              className="ftk-card"
              role="listitem"
              aria-hidden={dupe || undefined}
              tabIndex={dupe ? -1 : 0}
              style={{ ['--ftk-accent' as string]: it.color || 'var(--mint)' } as React.CSSProperties}
            >
              <div className="ftk-card-img">
                {it.image
                  ? <img src={sized(it.image, 'card')} alt={dupe ? '' : (it.alt || it.header)} loading="lazy" decoding="async" />
                  : <div className="ftk-card-noimg" />}
              </div>
              <div className="ftk-card-body">
                {it.tag && <span className="ftk-card-tag">{it.tag}</span>}
                <span className="ftk-card-title">{it.header}</span>
                <span className="ftk-card-cta">view project →</span>
              </div>
            </Link>
          )
        })}
      </div>

      <style>{`
        .ftk {
          position: relative; width: 100%; overflow: hidden;
          padding: 8px 0 14px;
          -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 5%, #000 95%, transparent 100%);
          mask-image: linear-gradient(90deg, transparent 0, #000 5%, #000 95%, transparent 100%);
        }
        .ftk-track {
          display: flex; width: max-content;
          padding-left: var(--page-px, 24px);
          animation-name: ftk-scroll;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .ftk:hover .ftk-track, .ftk:focus-within .ftk-track,
        .ftk-off .ftk-track { animation-play-state: paused; }
        @keyframes ftk-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        .ftk-card {
          position: relative; flex-shrink: 0;
          width: clamp(228px, 70vw, 290px);
          aspect-ratio: 3 / 4;
          margin-right: 18px;
          border-radius: 20px; overflow: hidden;
          text-decoration: none;
          background: #0a0a0a;
          box-shadow: 0 2px 10px rgba(0,0,0,0.12), 0 18px 44px -14px rgba(0,0,0,0.30);
          transition: transform .3s cubic-bezier(.2,0,0,1), box-shadow .3s;
        }
        @media (hover: hover) {
          .ftk-card:hover { transform: translateY(-6px); box-shadow: 0 10px 20px rgba(0,0,0,0.14), 0 30px 64px -14px rgba(0,0,0,0.40); }
        }
        .ftk-card:active { transform: scale(0.98); }
        .ftk-card:focus-visible { outline: 3px solid var(--mint); outline-offset: 3px; }

        .ftk-card-img { position: absolute; inset: 0; }
        .ftk-card-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .ftk-card-img::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(0deg, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.62) 32%, rgba(0,0,0,0.08) 64%, transparent 100%);
        }
        .ftk-card-noimg { position: absolute; inset: 0; background: linear-gradient(145deg, var(--ftk-accent) 0%, #0a0a0a 90%); opacity: 0.55; }

        .ftk-card-body {
          position: absolute; inset: 0; z-index: 1;
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 18px; gap: 9px;
        }
        .ftk-card-tag {
          align-self: flex-start;
          font-family: var(--mono); font-size: 10px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.07em;
          color: #0a0a0a; background: var(--ftk-accent);
          padding: 4px 10px; border-radius: 999px;
        }
        .ftk-card-title {
          font-family: var(--display); font-weight: 900;
          font-size: clamp(20px, 5vw, 24px); line-height: 0.98; letter-spacing: -0.02em;
          color: #fff; text-wrap: balance;
          display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
          text-shadow: 0 1px 8px rgba(0,0,0,0.45);
        }
        .ftk-card-cta {
          font-family: var(--mono); font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em; color: var(--ftk-accent);
          opacity: 0.95;
        }

        @media (prefers-reduced-motion: reduce) {
          .ftk { overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
          .ftk::-webkit-scrollbar { display: none; }
          .ftk-track { animation: none; }
        }
      `}</style>
    </div>
  )
}
