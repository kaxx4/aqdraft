import { useState, useEffect, useCallback, useRef } from 'react'
import { generateCarousel, downloadCarousel, type CarouselProject, type CarouselResult } from './carouselGenerator'

interface CarouselStudioModalProps {
  project: CarouselProject
  onClose: () => void
}

// Role-gated multi-slide carousel studio. Turns one welfare project into a
// ready-to-post Instagram deck (cover · story · stat · photos · CTA) in the
// brand language. Regenerate rolls a new accent + decoration across the set.
export default function CarouselStudioModal({ project, onClose }: CarouselStudioModalProps) {
  const [result, setResult] = useState<CarouselResult | null>(null)
  const [active, setActive] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const reqId = useRef(0)

  const run = useCallback(async () => {
    const id = ++reqId.current
    setBusy(true); setError(null)
    try {
      const res = await generateCarousel(project)
      if (id === reqId.current) { setResult(res); setActive(0) }
    } catch (e) {
      console.error('Carousel generation failed:', e)
      if (id === reqId.current) setError('Could not generate — try again.')
    } finally {
      if (id === reqId.current) setBusy(false)
    }
  }, [project])

  useEffect(() => { run() }, [run])

  // Esc to close, ←/→ to page through slides.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') setActive(i => Math.max(0, i - 1))
      else if (e.key === 'ArrowRight') setActive(i => (result ? Math.min(result.slides.length - 1, i + 1) : i))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, result])

  const handleDownload = () => {
    if (!result) return
    const slug = (project.slug || 'project').slice(0, 32)
    downloadCarousel(result.slides, slug)
  }

  const slides = result?.slides ?? []
  const total = slides.length
  const cur = slides[active]

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
          width: '100%', maxWidth: 480,
          background: 'var(--card)', borderRadius: 22, border: '2px solid var(--ink)',
          overflow: 'hidden', maxHeight: '94dvh', display: 'flex', flexDirection: 'column',
          animation: 'sheetUp 0.22s cubic-bezier(0.2,0,0,1)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '14px 18px 12px', borderBottom: '2px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ fontSize: 18 }}>🎠</span>
            <div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 17, lineHeight: 1 }}>carousel studio</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 3, letterSpacing: '0.03em' }}>
                project deck · instagram-ready{total > 0 ? ` · ${total} slides` : ''}
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

        {/* Preview */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              position: 'relative',
              aspectRatio: '4 / 5',
              height: 'min(52dvh, 480px)',
              borderRadius: 14, overflow: 'hidden',
              border: '2px solid var(--line)', background: 'var(--bg-2)',
              display: 'grid', placeItems: 'center', flexShrink: 0,
            }}
          >
            {cur && (
              <img
                src={cur.dataUrl}
                alt={`Slide ${active + 1} preview`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: busy ? 0.4 : 1, transition: 'opacity 0.2s' }}
              />
            )}
            {busy && (
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 30, height: 30, border: '3px solid var(--line-2)', borderTopColor: 'var(--mint)', borderRadius: '50%', animation: 'login-spin 0.8s linear infinite' }} />
                  <span className="mono" style={{ fontSize: 11, color: 'var(--mint)' }}>building deck…</span>
                </div>
              </div>
            )}
            {error && !busy && (
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', padding: 20, textAlign: 'center' }}>
                <span className="mono" style={{ fontSize: 12, color: '#FF4D2E' }}>{error}</span>
              </div>
            )}

            {/* Prev / next */}
            {total > 1 && !busy && (
              <>
                <button
                  onClick={() => setActive(i => Math.max(0, i - 1))}
                  disabled={active === 0}
                  aria-label="Previous slide"
                  style={navBtn('left', active === 0)}
                >←</button>
                <button
                  onClick={() => setActive(i => Math.min(total - 1, i + 1))}
                  disabled={active === total - 1}
                  aria-label="Next slide"
                  style={navBtn('right', active === total - 1)}
                >→</button>
                <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', color: 'rgba(255,255,255,0.9)', fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999, fontVariantNumeric: 'tabular-nums' }}>
                  {String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {total > 1 && !busy && (
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', maxWidth: '100%', padding: '3px 0 4px', scrollbarWidth: 'none' }}>
              {slides.map((sl, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`View slide ${i + 1}`}
                  style={{
                    width: 44, height: 55, flexShrink: 0, borderRadius: 7, overflow: 'hidden',
                    border: '2px solid ' + (active === i ? 'var(--ink)' : 'transparent'),
                    padding: 0, background: 'none', cursor: 'pointer',
                    transform: active === i ? 'scale(1.05)' : 'scale(1)',
                    transition: 'border-color 0.15s, transform 0.15s',
                  }}
                >
                  <img src={sl.dataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}

          {cur && !busy && (
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.03em' }}>
              ✦ {cur.kind} slide
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ padding: '12px 18px', borderTop: '2px solid var(--line)', display: 'flex', gap: 10, flexShrink: 0, paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <button
            className="btn btn-sm"
            onClick={run}
            disabled={busy}
            style={{ flex: 1, transition: 'transform 0.1s cubic-bezier(0.2,0,0,1)' }}
            onMouseDown={e => !busy && ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.96)')}
            onMouseUp={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)')}
            title="Generate a new design across the deck"
          >
            ↻ regenerate
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={handleDownload}
            disabled={busy || total === 0}
            style={{ flex: 1.5, transition: 'transform 0.1s cubic-bezier(0.2,0,0,1)' }}
            onMouseDown={e => !busy && total > 0 && ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.96)')}
            onMouseUp={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)')}
          >
            ↓ download all{total > 0 ? ` (${total})` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}

function navBtn(side: 'left' | 'right', disabled: boolean): React.CSSProperties {
  return {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    [side]: 10,
    width: 40, height: 40, borderRadius: '50%', border: 'none',
    background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', color: '#fff',
    fontSize: 18, display: 'grid', placeItems: 'center',
    cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.3 : 1,
    transition: 'opacity 0.15s, background 0.15s',
  }
}
