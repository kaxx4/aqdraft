import { useState, useEffect, useCallback, useRef } from 'react'
import { generatePoster, downloadPoster, type PosterData, type PosterFormat, type PosterResult } from './posterGenerator'

interface PosterStudioModalProps {
  data: PosterData
  onClose: () => void
}

const FORMATS: { value: PosterFormat; label: string; dim: string; ratio: string }[] = [
  { value: 'post', label: 'Post', dim: '1080 × 1440', ratio: '4 / 5' },
  { value: 'story', label: 'Story', dim: '1080 × 1920', ratio: '9 / 16' },
]

// Role-gated Instagram graphic studio. Picks a random brand-compliant template
// every generate/regenerate so each export is a fresh design. Lives behind the
// HoD/Director/Super-Admin gate enforced by the caller.
export default function PosterStudioModal({ data, onClose }: PosterStudioModalProps) {
  const [format, setFormat] = useState<PosterFormat>('post')
  const [result, setResult] = useState<PosterResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const reqId = useRef(0)

  const run = useCallback(async (fmt: PosterFormat) => {
    const id = ++reqId.current
    setBusy(true); setError(null)
    try {
      const res = await generatePoster(data, fmt)
      if (id === reqId.current) setResult(res)
    } catch (e) {
      console.error('Poster generation failed:', e)
      if (id === reqId.current) setError('Could not generate — try again.')
    } finally {
      if (id === reqId.current) setBusy(false)
    }
  }, [data])

  // First design on open + whenever the format changes.
  useEffect(() => { run(format) }, [format, run])

  // Esc to close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleDownload = () => {
    if (!result) return
    const slug = (data.uuid || 'post').slice(0, 6)
    downloadPoster(result.dataUrl, `aquaterra-${format}-${slug}.png`)
  }

  return (
    <div
      onClick={e => { e.stopPropagation(); onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 320,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 460,
          background: 'var(--card)', borderRadius: 22, border: '2px solid var(--ink)',
          overflow: 'hidden', maxHeight: '92dvh', display: 'flex', flexDirection: 'column',
          animation: 'sheetUp 0.22s cubic-bezier(0.2,0,0,1)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '14px 18px 12px', borderBottom: '2px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ fontSize: 18 }}>🎨</span>
            <div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 17, lineHeight: 1 }}>poster studio</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 3, letterSpacing: '0.03em' }}>
                random brand design · instagram-ready
              </div>
            </div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onClose() }}
            aria-label="Close"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', fontSize: 18, width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: 8, transition: 'color 0.12s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-3)')}
          >✕</button>
        </div>

        {/* Format toggle */}
        <div style={{ padding: '14px 18px 6px', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8, background: 'var(--bg-2)', padding: 5, borderRadius: 14, border: '1.5px solid var(--line)' }}>
            {FORMATS.map(f => {
              const active = format === f.value
              return (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  aria-pressed={active}
                  style={{
                    flex: 1, padding: '9px 4px', borderRadius: 10, cursor: 'pointer', border: 'none',
                    background: active ? 'var(--ink)' : 'transparent',
                    color: active ? 'var(--card)' : 'var(--ink-2)',
                    transition: 'background 0.16s, color 0.16s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  }}
                >
                  <span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 14 }}>{f.label}</span>
                  <span className="mono" style={{ fontSize: 9.5, opacity: 0.7, fontVariantNumeric: 'tabular-nums' }}>{f.dim}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Preview */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              position: 'relative',
              aspectRatio: FORMATS.find(f => f.value === format)!.ratio,
              height: 'min(46dvh, 420px)',
              borderRadius: 14, overflow: 'hidden',
              border: '2px solid var(--line)', background: 'var(--bg-2)',
              display: 'grid', placeItems: 'center', flexShrink: 0,
              transition: 'aspect-ratio 0.2s',
            }}
          >
            {result && (
              <img
                src={result.dataUrl}
                alt="Generated poster preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: busy ? 0.4 : 1, transition: 'opacity 0.2s' }}
              />
            )}
            {busy && (
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 30, height: 30, border: '3px solid var(--line-2)', borderTopColor: 'var(--mint)', borderRadius: '50%', animation: 'login-spin 0.8s linear infinite' }} />
                  <span className="mono" style={{ fontSize: 11, color: 'var(--mint)' }}>designing…</span>
                </div>
              </div>
            )}
            {error && !busy && (
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', padding: 20, textAlign: 'center' }}>
                <span className="mono" style={{ fontSize: 12, color: '#FF4D2E' }}>{error}</span>
              </div>
            )}
          </div>
          {result && !busy && (
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.03em' }}>
              ✦ {result.template}{result.usedPhoto ? ' · photo' : ' · typographic'}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ padding: '12px 18px', borderTop: '2px solid var(--line)', display: 'flex', gap: 10, flexShrink: 0, paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <button
            className="btn btn-sm"
            onClick={() => run(format)}
            disabled={busy}
            style={{ flex: 1, transition: 'transform 0.1s cubic-bezier(0.2,0,0,1)' }}
            onMouseDown={e => !busy && ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.96)')}
            onMouseUp={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)')}
            title="Generate a new random design"
          >
            ↻ regenerate
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={handleDownload}
            disabled={busy || !result}
            style={{ flex: 1.4, transition: 'transform 0.1s cubic-bezier(0.2,0,0,1)' }}
            onMouseDown={e => !busy && result && ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.96)')}
            onMouseUp={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)')}
          >
            ↓ download PNG
          </button>
        </div>
      </div>
    </div>
  )
}
