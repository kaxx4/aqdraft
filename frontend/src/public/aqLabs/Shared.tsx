import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { useToast } from '../../components/Toast'
import type { AQLabsTeam } from './data'

export const slideSrc = (slug: string, n: number) => `/aq-labs/${slug}/slide-${n}.jpg`

export function ChapterEyebrow({ team, dark }: { team: AQLabsTeam; dark?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap',
      fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700,
      letterSpacing: '0.08em', textTransform: 'uppercase',
      color: dark ? 'rgba(255,255,255,0.55)' : 'var(--ink-3)',
    }}>
      <span style={{ color: team.mood }}>chapter {team.chapter}</span>
      <span style={{ opacity: 0.4 }}>·</span>
      <span>{team.teamName}</span>
      <span style={{ opacity: 0.4 }}>·</span>
      <span>{team.category}</span>
    </div>
  )
}

export function MediumBadge({ team, dark }: { team: AQLabsTeam; dark?: boolean }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 18,
      padding: '4px 11px', borderRadius: 999,
      border: `1px solid ${team.mood}`, color: team.mood,
      fontFamily: 'var(--mono)', fontSize: 10.5, fontWeight: 700,
      letterSpacing: '0.04em', textTransform: 'uppercase',
      background: dark ? `${team.mood}14` : `${team.mood}0F`,
    }}>
      ● {team.medium}
    </div>
  )
}

// A compact strip of every slide the team actually submitted, so the whole
// carousel stays reachable even when a chapter's hero layout only features
// one or two of the five images. Click any thumbnail to open it full-size.
export function FilmStrip({ team, dark }: { team: AQLabsTeam; dark?: boolean }) {
  const [openAt, setOpenAt] = useState<number | null>(null)
  return (
    <div style={{ marginTop: 28 }}>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase',
        color: dark ? 'rgba(255,255,255,0.4)' : 'var(--ink-4)', marginBottom: 8,
      }}>
        full submission — {team.slides} slides
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {Array.from({ length: team.slides }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            onClick={() => setOpenAt(n)}
            style={{
              width: 52, height: 65, borderRadius: 8, overflow: 'hidden', padding: 0, cursor: 'pointer',
              border: `1.5px solid ${dark ? 'rgba(255,255,255,0.18)' : 'var(--line-2)'}`, background: 'none',
              flexShrink: 0,
            }}
            title={`Open slide ${n} of ${team.slides}`}
          >
            <img src={slideSrc(team.slug, n)} alt="" loading="lazy" decoding="async"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </button>
        ))}
      </div>
      {openAt !== null && (
        <Lightbox team={team} index={openAt} onChange={setOpenAt} onClose={() => setOpenAt(null)} />
      )}
    </div>
  )
}

function Lightbox({ team, index, onChange, onClose }: {
  team: AQLabsTeam; index: number; onChange: (n: number) => void; onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onChange(index < team.slides ? index + 1 : 1)
      if (e.key === 'ArrowLeft') onChange(index > 1 ? index - 1 : team.slides)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, onChange, onClose, team.slides])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.86)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <button
        onClick={e => { e.stopPropagation(); onClose() }}
        aria-label="Close"
        style={{
          position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 18,
        }}
      >✕</button>
      <button
        onClick={e => { e.stopPropagation(); onChange(index > 1 ? index - 1 : team.slides) }}
        aria-label="Previous slide"
        style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
          color: '#fff', border: 'none', cursor: 'pointer', fontSize: 20,
        }}
      >‹</button>
      <button
        onClick={e => { e.stopPropagation(); onChange(index < team.slides ? index + 1 : 1) }}
        aria-label="Next slide"
        style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
          color: '#fff', border: 'none', cursor: 'pointer', fontSize: 20,
        }}
      >›</button>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: 420, width: '100%' }}>
        <img src={slideSrc(team.slug, index)} alt={`${team.teamName} — slide ${index}`}
          style={{ width: '100%', borderRadius: 12, display: 'block', boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }} />
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--mono)', fontSize: 11.5, marginTop: 12 }}>
          {team.teamName} · slide {index} / {team.slides}
        </div>
      </div>
    </div>
  )
}

export function CopyLinkButton({ slug, dark, mood }: { slug: string; dark?: boolean; mood: string }) {
  const toast = useToast()
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    const url = `${window.location.origin}/aq-labs#${slug}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // clipboard API unavailable — still flip the button state so the user
      // sees feedback; they can copy the URL bar manually.
    }
    setCopied(true)
    toast?.success('Chapter link copied', 'Perfect for a CV or a resume link.')
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '9px 14px', borderRadius: 999,
        background: 'transparent',
        border: `1.5px solid ${dark ? 'rgba(255,255,255,0.25)' : 'var(--line-2)'}`,
        color: dark ? '#fff' : 'var(--ink)',
        fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
        letterSpacing: '0.02em', cursor: 'pointer',
        transition: 'border-color 0.15s, color 0.15s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = mood }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = dark ? 'rgba(255,255,255,0.25)' : 'var(--line-2)' }}
      title="Copy a direct link to this chapter"
    >
      {copied ? '✓ copied' : '⛓ copy chapter link'}
    </button>
  )
}

export function LinkRow({ links, dark, mood }: { links: AQLabsTeam['links']; dark?: boolean; mood: string }) {
  const items: { label: string; href: string }[] = []
  if (links.website) items.push({ label: 'visit site ↗', href: links.website })
  if (links.instagram) items.push({ label: 'instagram ↗', href: links.instagram })
  if (links.youtube) items.push({ label: 'youtube ↗', href: links.youtube })
  if (!items.length) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {items.map(it => (
        <a
          key={it.href}
          href={it.href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 16px', borderRadius: 999,
            background: mood, color: '#0A0A0A',
            fontFamily: 'var(--display)', fontWeight: 700, fontSize: 12.5,
            textDecoration: 'none',
            boxShadow: dark ? '0 0 0 1px rgba(255,255,255,0.15)' : 'none',
          }}
        >
          {it.label}
        </a>
      ))}
    </div>
  )
}

// Counts up from 0 to a numeric value the first time it scrolls into view.
export function CountTo({ value, suffix = '', prefix = '', decimals = 0 }: {
  value: number; suffix?: string; prefix?: string; decimals?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (!inView) return
    const duration = 1100
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(value * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value])
  return (
    <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {prefix}{display.toFixed(decimals)}{suffix}
    </span>
  )
}
