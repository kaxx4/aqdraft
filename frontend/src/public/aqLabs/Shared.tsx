import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { useToast } from '../../components/Toast'
import type { AQLabsTeam } from './data'

export const slideSrc = (slug: string, n: number) => `/aq-labs/${slug}/slide-${n}.jpg`

export function ChapterEyebrow({ team, dark }: { team: AQLabsTeam; dark?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18,
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
