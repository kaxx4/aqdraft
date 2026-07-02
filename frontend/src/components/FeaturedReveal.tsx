import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { sized } from '../lib/imageUrl'

/**
 * FeaturedReveal — an editorial reveal list of featured projects.
 * Adapted from the "reveal images" recipe to the AquaTerra stack: no shadcn
 * tokens / Tailwind utilities, cream/ink palette, display type, brutalist
 * hairlines.
 *
 * Two ways the project image floats in:
 *  • hover / keyboard focus (pointer devices), and
 *  • SCROLL — whichever row is closest to the viewport centre becomes
 *    "active" and reveals its image. This makes the section come alive as
 *    you scroll, and is the primary reveal on touch where there is no hover.
 * Keyboard-operable and reduced-motion safe.
 */

export interface FeaturedRevealItem {
  slug: string
  header: string
  image?: string
  alt?: string
  tag?: string
  color?: string
}

export default function FeaturedReveal({ items }: { items: FeaturedRevealItem[] }) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const rowsRef = useRef<Map<string, HTMLElement>>(new Map())

  // Pick the row whose centre is nearest the viewport centre (within a comfy
  // band) and mark it active. Cheap rAF-throttled rect reads on scroll/resize.
  useEffect(() => {
    let raf = 0
    const compute = () => {
      raf = 0
      const vh = window.innerHeight || 0
      const centre = vh / 2
      let best: string | null = null
      let bestDist = Infinity
      rowsRef.current.forEach((el, slug) => {
        const r = el.getBoundingClientRect()
        const c = r.top + r.height / 2
        // only consider rows comfortably inside the viewport
        if (c < vh * 0.12 || c > vh * 0.88) return
        const d = Math.abs(c - centre)
        if (d < bestDist) { bestDist = d; best = slug }
      })
      setActiveSlug(best)
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(compute) }
    compute()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [items])

  return (
    <div className="frv">
      <style>{frvStyles}</style>
      {items.map(it => (
        <Link
          key={it.slug}
          to={`/projects/${it.slug}`}
          className={'frv-row' + (activeSlug === it.slug ? ' is-active' : '')}
          ref={(el) => {
            if (el) rowsRef.current.set(it.slug, el)
            else rowsRef.current.delete(it.slug)
          }}
        >
          <span className="frv-main">
            {it.tag && (
              <span className="frv-tag" style={{ color: it.color || 'var(--ink-3)' }}>
                {it.tag}
              </span>
            )}
            <span className="frv-title">{it.header}</span>
          </span>

          {it.image && (
            <span className="frv-imgwrap">
              <img className="frv-img" src={sized(it.image, 'cover')} alt={it.alt || it.header} loading="lazy" decoding="async" />
            </span>
          )}

          <span className="frv-arrow" aria-hidden>↗</span>
        </Link>
      ))}
    </div>
  )
}

const frvStyles = `
.frv { display: flex; flex-direction: column; border-top: 1.5px solid var(--line); }
.frv-row {
  position: relative; isolation: isolate;
  display: flex; align-items: center; gap: 18px;
  padding: clamp(14px, 2.4vw, 26px) clamp(2px, 1vw, 12px);
  border-bottom: 1.5px solid var(--line);
  text-decoration: none; color: var(--ink); overflow: visible;
}
.frv-main { display: flex; flex-direction: column; gap: 6px; min-width: 0; flex: 1; }
.frv-tag {
  font-family: var(--mono); font-size: 10px; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  transition: opacity .4s ease;
}
.frv-title {
  font-family: var(--display); font-weight: 900; text-transform: uppercase;
  font-size: clamp(26px, 5.5vw, 64px); line-height: 0.95; letter-spacing: -0.03em;
  color: var(--ink); text-wrap: balance;
  transition: opacity .5s cubic-bezier(.2,.7,.2,1), transform .5s cubic-bezier(.2,.7,.2,1);
}
.frv-row:hover .frv-title,
.frv-row:focus-visible .frv-title,
.frv-row.is-active .frv-title { opacity: 0.32; transform: translateX(8px); }
.frv-row:focus-visible { outline: 3px solid var(--accent); outline-offset: 4px; border-radius: 8px; }

/* image floats in from the right on hover / focus / scroll-active */
.frv-imgwrap {
  position: absolute; right: clamp(8px, 6vw, 72px); top: 50%; z-index: 4;
  width: clamp(140px, 22vw, 260px); aspect-ratio: 4 / 3;
  border-radius: 12px; overflow: hidden;
  box-shadow: 6px 8px 0 var(--ink);
  outline: 1px solid rgba(0,0,0,0.1); outline-offset: -1px;
  opacity: 0; pointer-events: none;
  transform: translateY(-50%) scale(0.4) rotate(-8deg);
  transition: opacity .45s cubic-bezier(.2,.7,.2,1), transform .55s cubic-bezier(.2,.7,.2,1);
}
.frv-row:hover .frv-imgwrap,
.frv-row:focus-visible .frv-imgwrap,
.frv-row.is-active .frv-imgwrap { opacity: 1; transform: translateY(-50%) scale(1) rotate(4deg); }
.frv-img { width: 100%; height: 100%; object-fit: cover; display: block; }

.frv-arrow {
  flex-shrink: 0; font-family: var(--mono); font-size: clamp(16px, 2.4vw, 24px);
  font-weight: 700; color: var(--ink-3); z-index: 5;
  transition: transform .3s cubic-bezier(.2,.7,.2,1), color .3s;
}
.frv-row:hover .frv-arrow,
.frv-row.is-active .frv-arrow { transform: translate(4px, -4px); color: var(--ink); }

/* On touch, the floating reveal is slightly smaller so it never overruns a
   narrow row; scroll-active drives it (there is no hover). */
@media (hover: none) {
  .frv-imgwrap { right: clamp(8px, 5vw, 40px); width: clamp(120px, 34vw, 200px); }
}

@media (prefers-reduced-motion: reduce) {
  .frv-title, .frv-imgwrap, .frv-arrow { transition: opacity .2s linear !important; }
  .frv-row:hover .frv-imgwrap, .frv-row:focus-visible .frv-imgwrap,
  .frv-row.is-active .frv-imgwrap { transform: translateY(-50%) scale(1) rotate(0deg); }
  .frv-row:hover .frv-title, .frv-row:focus-visible .frv-title,
  .frv-row.is-active .frv-title { transform: none; }
}
`
