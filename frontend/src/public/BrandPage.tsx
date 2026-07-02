import { useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
import DynamicIslandTOC from '../components/DynamicIslandTOC'
import { supabase, normalizeObj, OBJ_COLORS } from '../lib/supabase'

/* ════════════════════════════════════════════════════════════════════
   AQUATERRA — DESIGN LANGUAGE
   A visual brand showcase: warm cream paper, heavy ink, sticker-bright
   accents, and real documentary photography from the field. No code —
   just the system, shown.
   ════════════════════════════════════════════════════════════════════ */

// ── Token data (real values, pulled from the live CSS custom properties) ──
type Swatch = { name: string; hex: string; fg: string; note: string }

const FOUNDATION: Swatch[] = [
  { name: 'Paper',   hex: '#F4EFE0', fg: '#0A0A0A', note: 'The canvas. ~90% of every screen.' },
  { name: 'Paper 2', hex: '#EDE6D0', fg: '#0A0A0A', note: 'Cards, wells, inset surfaces.' },
  { name: 'Paper 3', hex: '#E2D9BD', fg: '#0A0A0A', note: 'Deepest cream — hover / active.' },
  { name: 'Ink',     hex: '#0A0A0A', fg: '#F4EFE0', note: 'Text, borders, the dark sections.' },
  { name: 'Ink 2',   hex: '#2A2A28', fg: '#F4EFE0', note: 'Secondary text, warm near-black.' },
  { name: 'Ink 3',   hex: '#5A5A55', fg: '#F4EFE0', note: 'Muted labels, captions, meta.' },
]

const ACCENTS: Swatch[] = [
  { name: 'Mint',   hex: '#1B8A5A', fg: '#F4EFE0', note: 'Primary brand. Welfare, growth, “go”.' },
  { name: 'Lemon',  hex: '#FFC700', fg: '#0A0A0A', note: 'Energy. Big CTA blocks, highlights.' },
  { name: 'Pink',   hex: '#FF4D8C', fg: '#0A0A0A', note: 'The accent. Links, focus, emphasis.' },
  { name: 'Tomato', hex: '#FF4D2E', fg: '#F4EFE0', note: 'Alerts, heat, urgency.' },
  { name: 'Sky',    hex: '#3DA9FC', fg: '#0A0A0A', note: 'Info, calm, secondary data.' },
  { name: 'Grape',  hex: '#7E5BFF', fg: '#F4EFE0', note: 'Paradox, events, the playful edge.' },
]

const STICKERS: Swatch[] = [
  { name: 'Pop Mint',   hex: '#00E5A0', fg: '#0A0A0A', note: 'mint' },
  { name: 'Pop Pink',   hex: '#FF6BD6', fg: '#0A0A0A', note: 'pink' },
  { name: 'Pop Lemon',  hex: '#FFE94A', fg: '#0A0A0A', note: 'lemon' },
  { name: 'Pop Orange', hex: '#FF7A1A', fg: '#0A0A0A', note: 'orange' },
  { name: 'Pop Sky',    hex: '#6FD7FF', fg: '#0A0A0A', note: 'sky' },
  { name: 'Pop Grape',  hex: '#B084FF', fg: '#0A0A0A', note: 'grape' },
]

// The brand six, for the colophon easter egg (names → hex, memorable).
const BRAND_SIX: [string, string][] = [
  ['Mint', '#1B8A5A'], ['Lemon', '#FFC700'], ['Pink', '#FF4D8C'],
  ['Tomato', '#FF4D2E'], ['Sky', '#3DA9FC'], ['Grape', '#7E5BFF'],
]

// [css-var key, short label, real font-family name]
const TESTER_FONTS: [string, string, string][] = [
  ['display', 'Display', 'NeutralFace'],
  ['serif', 'Serif', 'Instrument Serif'],
  ['eina', 'Body', 'Eina01'],
  ['mono', 'Mono', 'JetBrains Mono'],
]

type Photo = { image: string; alt: string; header: string; tag: string; color: string; location?: string; stat?: string }

// Subtle paper grain (inline SVG noise) — gives the cream a tactile texture.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")"

export default function BrandPage() {
  const [copied, setCopied] = useState<string | null>(null)
  const [copiedLabel, setCopiedLabel] = useState<string>('')
  const [testerFont, setTesterFont] = useState<string>('display')
  const [accentIdx, setAccentIdx] = useState<number>(0)
  const [photos, setPhotos] = useState<Photo[]>([])
  const rootRef = useRef<HTMLDivElement>(null)

  const copy = useCallback((text: string, key: string, label?: string) => {
    try { navigator.clipboard?.writeText(text) } catch { /* no-op */ }
    setCopied(key)
    setCopiedLabel(label ?? key)
    window.setTimeout(() => setCopied(c => (c === key ? null : c)), 1500)
  }, [])

  // Export the whole sheet to PDF via the browser's print pipeline. We first
  // force every scroll-revealed block visible and freeze animations (otherwise
  // anything not yet scrolled into view prints blank), then open the dialog.
  const handleExportPdf = useCallback(() => {
    const root = rootRef.current
    if (root) {
      root.querySelectorAll('.bp-reveal').forEach(e => e.classList.add('in'))
      root.classList.add('bp-printing')
    }
    window.setTimeout(() => {
      window.print()
      root?.classList.remove('bp-printing')
    }, 150)
  }, [])

  // Pull real documentary photography from the welfare projects to show the
  // brand applied to actual work. Degrades gracefully — if the legacy welfare
  // DB is unreachable the photo blocks simply don't render.
  useEffect(() => {
    let cancelled = false
    supabase
      .from('welfare_projects')
      .select('slug,header,objective,location,key_statistic,main_image,main_image_alt,workshop_date')
      .eq('is_draft', false)
      .not('main_image', 'is', null)
      .order('workshop_date', { ascending: false })
      .limit(14)
      .then(({ data }) => {
        if (cancelled || !data) return
        const mapped: Photo[] = (data as any[])
          .filter(r => r.main_image)
          .map(r => {
            const norm = normalizeObj(r.objective)
            return {
              image: r.main_image as string,
              alt: (r.main_image_alt || r.header) as string,
              header: r.header as string,
              tag: norm,
              color: OBJ_COLORS[norm] || OBJ_COLORS['Others'],
              location: r.location || undefined,
              stat: r.key_statistic || undefined,
            }
          })
        setPhotos(mapped)
      })
    return () => { cancelled = true }
  }, [])

  // Scroll-triggered reveals — each section choreographs in as it enters view.
  // Bulletproofed: a safety timer reveals everything if the observer can't report.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const els = Array.from(root.querySelectorAll<HTMLElement>('.bp-reveal'))
    const revealAll = () => els.forEach(e => e.classList.add('in'))
    if (!('IntersectionObserver' in window)) { revealAll(); return }
    let ioAlive = false
    const io = new IntersectionObserver((entries) => {
      ioAlive = true
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target) } })
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 })
    els.forEach(e => io.observe(e))
    const safety = window.setTimeout(() => { if (!ioAlive) revealAll() }, 2200)
    return () => { io.disconnect(); window.clearTimeout(safety) }
  }, [])

  const accentName = BRAND_SIX[accentIdx][0]
  const accentHex = BRAND_SIX[accentIdx][1]
  const cycleAccent = () => {
    const n = (accentIdx + 1) % BRAND_SIX.length
    setAccentIdx(n)
    copy(BRAND_SIX[n][1], '__accent__', `${BRAND_SIX[n][0]} ${BRAND_SIX[n][1]}`)
  }

  const onMastMove = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  // Distribute photos across the visual blocks.
  const poster = photos[0]
  const cards = photos.slice(1, 5)
  const stickerPhotos = photos.slice(5, 7)
  const wildCard = photos[7] || photos[0]
  const mosaic = photos.slice(0, 9)

  return (
    <div className="route-enter brandpage" ref={rootRef} style={{ background: 'var(--bg)', color: 'var(--ink)', position: 'relative' }}>
      <style>{styles}</style>

      {/* Paper grain overlay */}
      <div aria-hidden className="bp-grain" style={{ backgroundImage: GRAIN }} />

      {/* Floating dynamic-island table of contents */}
      <DynamicIslandTOC />

      {/* Floating copy toast */}
      <div className={'bp-toast' + (copied ? ' on' : '')} aria-live="polite">
        Copied <b>{copiedLabel}</b> <span className="bp-toast-tick" key={copiedLabel}>✓</span>
      </div>

      {/* ═══════════ MASTHEAD ═══════════ */}
      <header className="bp-mast bp-reveal in" onPointerMove={onMastMove}>
        <div aria-hidden className="bp-aurora" />
        <div aria-hidden className="bp-mast-spot" />

        <div className="bp-mast-inner">
          <div className="bp-mast-kicker bp-rise" style={{ ['--rd' as string]: '40ms' }}>
            <span>AQUATERRA</span>
            <span className="bp-dash" />
            <span>VISUAL SYSTEM — V6</span>
            <span className="bp-dash" />
            <span>KOLKATA · EST 2021</span>
          </div>

          <h1 className="bp-mast-title">
            <span className="bp-rise" style={{ ['--rd' as string]: '90ms' }}>DESIGN</span>
            <span className="bp-rise bp-serif" style={{ ['--rd' as string]: '200ms' }}>language.</span>
          </h1>

          <p className="bp-mast-sub bp-rise" style={{ ['--rd' as string]: '320ms' }}>
            One cream page, one heavy face, six loud accents — and real documentary
            photography doing the talking. This is how AquaTerra looks, head to toe.
          </p>

          <div className="bp-mast-scroll bp-rise" style={{ ['--rd' as string]: '460ms' }}>scroll the sheet ↓</div>
        </div>

        {/* rotated stickers */}
        <span className="sticker sticker-mint bp-sticker" style={{ top: '15%', right: '8%', ['--rot' as string]: '-7deg' }}>★ STUDENT-LED</span>
        <span className="sticker sticker-pink bp-sticker" style={{ bottom: '22%', right: '13%', ['--rot' as string]: '5deg' }}>NON-PROFIT</span>
        <span className="sticker sticker-lemon bp-sticker bp-sticker-hide" style={{ top: '42%', left: '4%', ['--rot' as string]: '4deg' }}>♥ ZERO FEES</span>
      </header>

      {/* ═══════════ 01 · PALETTE ═══════════ */}
      <Section index="01" title="Palette" lead="Cream rules. Ink structures. Exactly one accent gets to shout per view.">
        <div className="bp-block-label bp-rise">Foundation</div>
        <div className="bp-swatch-grid">
          {FOUNDATION.map((s, i) => <SwatchCard key={s.hex} s={s} i={i} copied={copied} onCopy={copy} />)}
        </div>

        <div className="bp-block-label bp-rise" style={{ marginTop: 40 }}>Accents — the brand six</div>
        <div className="bp-swatch-grid">
          {ACCENTS.map((s, i) => <SwatchCard key={s.hex} s={s} i={i} copied={copied} onCopy={copy} />)}
        </div>

        <div className="bp-block-label bp-rise" style={{ marginTop: 40 }}>Sticker pops — loud, for stickers only</div>
        <div className="bp-pop-row">
          {STICKERS.map((s, i) => {
            const isC = copied === s.hex
            return (
              <button key={s.hex} className="bp-pop bp-rise"
                style={{ background: s.hex, color: s.fg, ['--rd' as string]: `${i * 45}ms` }}
                onClick={() => copy(s.hex, s.hex)} title="click to copy">
                <span className="bp-pop-hex">{isC ? <>copied <b className="bp-tick">✓</b></> : s.hex}</span>
                <span className="bp-pop-name">{s.note}</span>
              </button>
            )
          })}
        </div>

        <div className="bp-block-label bp-rise" style={{ marginTop: 40 }}>Combinations — pairs that work</div>
        <div className="bp-combos">
          {COMBOS.map(([a, b, name, note], i) => <Combo key={name} a={a} b={b} name={name} note={note} i={i} />)}
        </div>

        <Tutorial>
          <b>The 90 / 8 / 2 rule.</b> Paper is ~90% of the surface, ink is ~8% (type
          + hairlines), and a single accent is the last ~2%. Two accents fighting in
          one viewport is the fastest way to break the system.
        </Tutorial>
      </Section>

      {/* ═══════════ 02 · TYPE ═══════════ */}
      <Section index="02" title="Typography" lead="A brutal display face, a human serif, a clean body, a mono for the machine voice." dark>
        <div className="bp-tester bp-rise">
          <div className="bp-tester-controls">
            <span className="bp-tester-fontname" style={{ fontFamily: `var(--${testerFont})`, fontStyle: testerFont === 'serif' ? 'italic' : 'normal' }}>
              {(TESTER_FONTS.find(([k]) => k === testerFont) || ['', '', ''])[2]}
            </span>
            {TESTER_FONTS.map(([key, label]) => (
              <button key={key} className={'bp-tchip' + (testerFont === key ? ' on' : '')} onClick={() => setTesterFont(key)}>{label}</button>
            ))}
          </div>
          <div className="bp-tester-stage" contentEditable suppressContentEditableWarning spellCheck={false}
            style={{
              fontFamily: `var(--${testerFont})`,
              fontStyle: testerFont === 'serif' ? 'italic' : 'normal',
              textTransform: testerFont === 'mono' ? 'uppercase' : 'none',
              letterSpacing: testerFont === 'display' ? '-0.03em' : testerFont === 'mono' ? '0.04em' : '0',
              fontWeight: testerFont === 'display' ? 900 : 500,
            }}>
            Type something gorgeous.
          </div>
        </div>

        <div className="bp-type-grid">
          <TypeSpec role="Display" token="--display" family="NeutralFace" sample="OUR PROJECTS."
            note="900 weight, tight −0.04em, usually UPPERCASE. Headlines & numbers." />
          <TypeSpec role="Serif" token="--serif" family="Instrument Serif" sample="ects." italic
            note="Italic. The human counterpoint — one word, never a sentence." />
          <TypeSpec role="Body" token="--eina" family="Eina01" sample="Real work, real impact, zero fees."
            note="The reading voice. 1.6–1.7 line-height, generous and calm." />
          <TypeSpec role="Mono" token="--mono" family="JetBrains Mono" sample="[ FEATURED ]"
            note="Labels & meta only. UPPERCASE, 0.08em tracked, tiny." mono />
        </div>

        <div className="bp-scale">
          {[
            { px: 92, label: 'Hero / display', txt: 'Join the movement.' },
            { px: 52, label: 'Section head', txt: 'Explore our pillars.' },
            { px: 28, label: 'Card title', txt: 'Sunderbans Plantation 5.0' },
            { px: 16, label: 'Body', txt: 'Documented since 2021, run entirely by volunteers.' },
            { px: 11, label: 'Mono label', txt: '[ ALL DRIVES ] · 534 DRIVES' },
          ].map((row, i) => (
            <div key={row.px} className="bp-scale-row bp-rise" style={{ ['--rd' as string]: `${i * 60}ms` }}>
              <span className="bp-scale-meta">{row.px}px · {row.label}</span>
              <span className="bp-scale-txt" style={{
                fontSize: Math.min(row.px, 56),
                fontFamily: row.px <= 11 ? 'var(--mono)' : row.px <= 16 ? 'var(--eina)' : 'var(--display)',
                textTransform: row.px <= 11 ? 'uppercase' : 'none',
                letterSpacing: row.px >= 28 ? '-0.03em' : row.px <= 11 ? '0.08em' : '0',
                fontWeight: row.px >= 28 ? 900 : 500,
              }}>{row.txt}</span>
            </div>
          ))}
        </div>

        <Tutorial dark>
          <b>Pair, don’t pile.</b> A headline is NeutralFace; drop one Instrument-Serif
          italic word into it for warmth (<i>PROJ<span style={{ fontStyle: 'italic', fontFamily: 'var(--serif)' }}>ects</span></i>).
          Mono never sets paragraphs — it’s the label voice.
        </Tutorial>
      </Section>

      {/* ═══════════ 03 · PHOTOGRAPHY ═══════════ */}
      <Section index="03" title="Photography" lead="The brand lives on real work — documentary frames wrapped in cream and ink, one accent per picture.">
        {poster && (
          <div className="bp-poster bp-rise">
            <img className="bp-poster-img" src={poster.image} alt={poster.alt} loading="lazy" />
            <div className="bp-poster-grad" />
            <span className="sticker sticker-lemon bp-poster-sticker">★ since 2021</span>
            <div className="bp-poster-body">
              <span className="bp-photo-tag">{poster.tag}</span>
              <h3 className="bp-poster-title">welfare,<br /><span className="bp-serif">documented.</span></h3>
              {poster.location && <div className="bp-photo-meta">{poster.location}</div>}
            </div>
          </div>
        )}

        {cards.length > 0 && <>
          <div className="bp-block-label bp-rise" style={{ marginTop: 36 }}>Magazine cards</div>
          <div className="bp-photocards">
            {cards.map((p, i) => <PhotoCard key={p.image} p={p} i={i} num={i + 1} />)}
          </div>
        </>}

        {stickerPhotos.length > 0 && <>
          <div className="bp-block-label bp-rise" style={{ marginTop: 40 }}>Stickers, in the field</div>
          <div className="bp-stickerframes">
            {stickerPhotos.map((p, i) => (
              <figure key={p.image} className="bp-stickerframe bp-rise" style={{ ['--rd' as string]: `${i * 80}ms` }}>
                <img src={p.image} alt={p.alt} loading="lazy" />
                <span className={'sticker ' + (i % 2 ? 'sticker-pink' : 'sticker-mint')}
                  style={{ position: 'absolute', top: 14, left: 14, transform: `rotate(${i % 2 ? 4 : -5}deg)` }}>
                  {i % 2 ? 'good vibes' : '★ on ground'}
                </span>
                <span className="sticker sticker-lemon"
                  style={{ position: 'absolute', bottom: 14, right: 14, transform: 'rotate(-3deg)' }}>
                  {p.tag}
                </span>
              </figure>
            ))}
          </div>
        </>}

        <Tutorial>
          <b>Framing rules.</b> Every photo gets the same recipe: a 16px frame, a hairline
          black outline, a dark gradient rising from the bottom so type stays legible, and
          exactly one sticker or accent. Let the photograph carry the colour.
        </Tutorial>
      </Section>

      {/* ═══════════ 04 · IN THE WILD ═══════════ */}
      <Section index="04" title="In the wild" lead="The full kit, assembled — photography, type, colour and stickers doing their jobs together.">
        <div className="bp-wild">
          {wildCard
            ? <PhotoCard p={wildCard} i={0} num={1} />
            : <article className="bp-card bp-rise"><div className="bp-card-img bp-card-img-fallback" /></article>}

          <article className="bp-announce bp-rise" style={{ ['--rd' as string]: '80ms' }}>
            <div className="bp-photo-tag bp-photo-tag-dark">[ Be a part ]</div>
            <h3 className="bp-announce-title">join the<br /><span className="bp-serif">community.</span></h3>
            <p className="bp-announce-sub">LoRs and certificates for the best. Real work, real impact. Zero fees, always.</p>
            <span className="bp-cta-demo bp-cta-invert">Come do the work with us →</span>
          </article>

          <article className="bp-stats bp-rise" style={{ ['--rd' as string]: '160ms' }}>
            {[
              { k: '4,000+', v: 'saplings planted' },
              { k: '3,500+', v: 'kids reached' },
              { k: '523+', v: 'welfare drives' },
              { k: '8', v: 'Sundarbans trips' },
            ].map(s => (
              <div key={s.v} className="bp-stat">
                <div className="bp-stat-k">{s.k}</div>
                <div className="bp-stat-v">{s.v}</div>
              </div>
            ))}
          </article>
        </div>

        {mosaic.length > 2 && <>
          <div className="bp-block-label bp-rise" style={{ marginTop: 40 }}>Five years, in frames</div>
          <div className="bp-mosaic">
            {mosaic.map((p, i) => (
              <figure key={p.image} className="bp-mosaic-item bp-rise" style={{ ['--rd' as string]: `${i * 50}ms` }}>
                <img src={p.image} alt={p.alt} loading="lazy" />
                <figcaption>{p.tag}{p.location ? ` · ${p.location}` : ''}</figcaption>
              </figure>
            ))}
          </div>
        </>}
      </Section>

      {/* ═══════════ 05 · POSTERS ═══════════ */}
      <Section index="05" title="Posters" lead="Real photography, full-bleed or in cute frames — polaroids, taped prints, film strips, stamps — with a few pure-type frames between. Every one is a deliberate composition.">
        <span className="sticker sticker-lemon bp-float-sticker" style={{ ['--rot' as string]: '-4deg' }}>★ shot on cream</span>
        <div className="bp-posters">
          {(() => {
            let off = 0
            const n = Math.max(1, photos.length)
            return POSTERS.map((d, i) => {
              const need = picsNeeded(d.t)
              const pics = Array.from({ length: need }, (_, j) => photos[(off + j) % n])
              off += need
              return <PosterCard key={i} d={d} i={i} pics={pics} />
            })
          })()}
        </div>
        <Tutorial>
          <b>Infinite from a few parts.</b> Big type, a stat, a quote, an outline, a sticker
          bomb, a colour block — swap the palette and the copy and the system makes a fresh
          poster every time. Constraint is what makes it recognisable.
        </Tutorial>
      </Section>

      {/* ═══════════ COLOPHON (easter egg) ═══════════ */}
      <footer className="bp-colophon bp-reveal">
        <div className="bp-colophon-row bp-rise">
          <span>MADE ON CREAM</span>
          <span className="bp-dash" />
          <span>#F4EFE0 + #0A0A0A + ONE LOUD THING</span>
          <span className="bp-dash" />
          <span>AQUATERRA · 2021—</span>
        </div>
        <button className="bp-colophon-big bp-rise" onClick={cycleAccent} title="tap to recolour the accent" style={{ ['--rd' as string]: '80ms' }}>
          AQUA<span style={{ color: accentHex, transition: 'color 0.45s cubic-bezier(.2,.7,.2,1)' }}>TERRA</span>
          <span style={{ color: accentHex, transition: 'color 0.45s cubic-bezier(.2,.7,.2,1)' }}>.</span>
        </button>
        <div className="bp-colophon-hint bp-rise" style={{ ['--rd' as string]: '160ms' }}>
          accent → <b style={{ color: accentHex }}>{accentName} {accentHex}</b> · tap the wordmark to cycle
        </div>
      </footer>

      {/* ═══════════ EXPORT ═══════════ */}
      <div className="bp-export bp-reveal in">
        <button className="bp-export-btn" onClick={handleExportPdf}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export this page as PDF
        </button>
        <div className="bp-export-note">opens your browser’s print dialog — choose “Save as PDF”.</div>
      </div>

      <style>{exportStyles}</style>
    </div>
  )
}

/* Print + export-button styles. Kept separate from the main `styles` blob so the
   print pipeline is easy to reason about. */
const exportStyles = `
  .bp-export {
    text-align: center;
    padding: clamp(40px, 7vw, 80px) 24px clamp(64px, 9vw, 110px);
    background: var(--bg);
  }
  .bp-export-btn {
    display: inline-flex; align-items: center; gap: 11px;
    font-family: var(--display); font-weight: 800;
    font-size: clamp(16px, 2.4vw, 20px); letter-spacing: -0.01em;
    color: var(--bg); background: var(--ink);
    border: 2px solid var(--ink); border-radius: 999px;
    padding: 16px 30px; cursor: pointer;
    box-shadow: 5px 5px 0 0 var(--ink);
    transition: transform 0.12s cubic-bezier(.2,0,0,1), box-shadow 0.12s cubic-bezier(.2,0,0,1), background 0.15s;
  }
  .bp-export-btn:hover { transform: translate(-2px, -2px); box-shadow: 7px 7px 0 0 var(--ink); background: #1a1a1a; }
  .bp-export-btn:active { transform: translate(2px, 2px) scale(0.99); box-shadow: 2px 2px 0 0 var(--ink); }
  .bp-export-note {
    margin-top: 16px; font-family: var(--mono); font-size: 11px;
    text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-3);
  }

  /* While the print snapshot is being taken: reveal everything, kill motion. */
  .bp-printing .bp-reveal, .bp-printing .bp-rise { opacity: 1 !important; transform: none !important; }
  .bp-printing *, .bp-printing *::before, .bp-printing *::after { transition: none !important; animation: none !important; }

  @media print {
    @page { margin: 12mm; }
    html, body { background: #F4EFE0 !important; }
    /* force brand backgrounds/colours to actually print */
    .brandpage, .brandpage * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    /* floating / interactive chrome has no place in a PDF */
    .bp-toc-rail, .bp-toast, .bp-grain, .bp-export, .bp-mast-scroll, .bp-tester-controls { display: none !important; }
    /* nothing should hide behind a fold in print */
    .bp-reveal, .bp-rise { opacity: 1 !important; transform: none !important; }
    .bp-mast { min-height: auto !important; }
    /* keep compositions whole across page breaks */
    .bp-section, .bp-poster-card, .bp-card, .bp-swatch, .bp-combo,
    .bp-mosaic-item, .bp-stickerframe, .bp-spec, .bp-poster, .bp-scale-row, .bp-pop { break-inside: avoid; }
  }
`

/* ───────────────────────── sub-components ───────────────────────── */

function Section({ index, title, lead, children, dark }: {
  index: string; title: string; lead: string; children: ReactNode; dark?: boolean
}) {
  return (
    <section className={'bp-section bp-reveal' + (dark ? ' bp-section-dark' : '')}>
      <div className="bp-section-head">
        <span className="bp-section-idx bp-rise">{index}</span>
        <div>
          <h2 className="bp-section-title bp-rise" style={{ ['--rd' as string]: '60ms' }} data-toc data-toc-title={title}>{title}</h2>
          <p className="bp-section-lead bp-rise" style={{ ['--rd' as string]: '120ms' }}>{lead}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function SwatchCard({ s, i, copied, onCopy }: {
  s: Swatch; i: number; copied: string | null; onCopy: (t: string, k: string) => void
}) {
  const isCopied = copied === s.hex
  return (
    <button className="bp-swatch bp-rise" style={{ ['--rd' as string]: `${i * 55}ms` }}
      onClick={() => onCopy(s.hex, s.hex)} title="Click to copy hex">
      <div className="bp-swatch-chip" style={{ background: s.hex, color: s.fg }}>
        <span className="bp-swatch-hint">click to copy</span>
        <span className="bp-swatch-hexbig">{isCopied ? <>copied <b className="bp-tick">✓</b></> : s.hex}</span>
      </div>
      <div className="bp-swatch-info">
        <div className="bp-swatch-name">{s.name}</div>
        <div className="bp-swatch-note">{s.note}</div>
      </div>
    </button>
  )
}

function TypeSpec({ role, token, family, sample, note, italic, mono }: {
  role: string; token: string; family: string; sample: string; note: string; italic?: boolean; mono?: boolean
}) {
  return (
    <div className="bp-spec">
      <div className="bp-spec-aa" style={{ fontFamily: `var(${token})`, fontStyle: italic ? 'italic' : 'normal' }}>Aa</div>
      <div className="bp-spec-meta">
        <div className="bp-spec-role">{role}</div>
        <div className="bp-spec-fam">{family}</div>
      </div>
      <div className="bp-spec-sample" style={{
        fontFamily: `var(${token})`, fontStyle: italic ? 'italic' : 'normal',
        textTransform: mono ? 'uppercase' : 'none',
        letterSpacing: mono ? '0.06em' : role === 'Display' ? '-0.03em' : '0',
        fontWeight: role === 'Display' ? 900 : 500,
      }}>{sample}</div>
      <div className="bp-spec-note">{note}</div>
    </div>
  )
}

function PhotoCard({ p, i, num }: { p: Photo; i: number; num: number }) {
  return (
    <article className="bp-card bp-rise" style={{ ['--rd' as string]: `${i * 70}ms` }}>
      <div className="bp-card-img">
        <img className="bp-card-photo" src={p.image} alt={p.alt} loading="lazy" />
        <div className="bp-card-num">#{String(num).padStart(3, '0')}</div>
        <div className="bp-card-grad" />
        <div className="bp-card-body">
          <span className="bp-photo-tag">{p.tag}</span>
          <h3 className="bp-card-title">{p.header}</h3>
          {(p.location || p.stat) && <div className="bp-photo-meta">{[p.location, p.stat].filter(Boolean).join(' · ')}</div>}
        </div>
      </div>
    </article>
  )
}

function Tutorial({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <div className={'bp-tut bp-rise' + (dark ? ' bp-tut-dark' : '')}>
      <span className="bp-tut-mark">TIP</span>
      <p>{children}</p>
    </div>
  )
}

/* ───────────────────── colour combinations ───────────────────── */
// [colour A, colour B, name, when-to-use]
const COMBOS: [string, string, string, string][] = [
  ['var(--mint)', 'var(--lemon)', 'Mint + Lemon', 'the default duo'],
  ['var(--ink)', 'var(--lemon)', 'Ink + Lemon', 'max-contrast CTA'],
  ['var(--accent)', 'var(--ink)', 'Pink + Ink', 'editorial pop'],
  ['var(--grape)', 'var(--lemon)', 'Grape + Lemon', 'paradox energy'],
  ['var(--sky)', 'var(--ink)', 'Sky + Ink', 'calm & clear'],
  ['var(--tomato)', 'var(--bg)', 'Tomato + Cream', 'warm alarm'],
  ['var(--mint)', 'var(--accent)', 'Mint + Pink', 'playful clash'],
  ['var(--bg)', 'var(--ink)', 'Cream + Ink', 'the foundation'],
]

function Combo({ a, b, name, note, i }: { a: string; b: string; name: string; note: string; i: number }) {
  return (
    <div className="bp-combo bp-rise" style={{ ['--rd' as string]: `${i * 45}ms` }}>
      <div className="bp-combo-swatch">
        <span style={{ background: a }} />
        <span style={{ background: b }} />
      </div>
      <div className="bp-combo-info">
        <div className="bp-combo-name">{name}</div>
        <div className="bp-combo-note">{note}</div>
      </div>
    </div>
  )
}

/* ───────────────────── poster generator ───────────────────── */
// 10 brand palettes: [background, foreground, accent]
const PAL: [string, string, string][] = [
  ['var(--bg)', 'var(--ink)', 'var(--mint)'],
  ['var(--ink)', 'var(--bg)', 'var(--lemon)'],
  ['var(--mint)', '#06140d', 'var(--lemon)'],
  ['var(--lemon)', 'var(--ink)', 'var(--tomato)'],
  ['var(--accent)', '#22000c', '#ffffff'],
  ['var(--sky)', '#04101e', 'var(--ink)'],
  ['var(--grape)', '#f4efe0', 'var(--lemon)'],
  ['var(--tomato)', '#f4efe0', 'var(--lemon)'],
  ['var(--bg-2)', 'var(--ink)', 'var(--accent)'],
  ['#06140d', 'var(--mint)', 'var(--lemon)'],
]

type PosterT =
  | 'editorial' | 'cover' | 'statshot' | 'quoteshot'   // full-bleed photo
  | 'polaroid' | 'taped' | 'window' | 'circle' | 'filmstrip' | 'stamp' // cute frames
  | 'mega' | 'stat' | 'stack' | 'serifquote'           // type-only
type Poster = { t: PosterT; p: number; a?: string[]; s?: string; k?: string; v?: string; m?: string; tag?: string; lines?: string[] }

const PHOTO_T = new Set<PosterT>(['editorial', 'cover', 'statshot', 'quoteshot', 'polaroid', 'taped', 'window', 'circle', 'filmstrip', 'stamp'])
const picsNeeded = (t: PosterT) => (t === 'filmstrip' ? 3 : PHOTO_T.has(t) ? 1 : 0)

// 28 curated posters — photography-forward (full-bleed or cute frames) with a
// few pure-type frames for rhythm. Each is a deliberate composition.
const POSTERS: Poster[] = [
  { t: 'editorial', p: 0, tag: 'WELFARE', k: 'on the\nground.', m: 'kolkata · since 2021' },
  { t: 'polaroid', p: 1, v: 'sundarbans, ’23' },
  { t: 'mega', p: 2, k: 'grow.', m: '4,000+ saplings' },

  { t: 'window', p: 3, k: 'PLANT' },
  { t: 'statshot', p: 4, k: '523', v: 'welfare drives' },
  { t: 'stack', p: 5, a: ['REAL', 'WORK', 'ZERO', 'FEES'], m: '★ student-led' },

  { t: 'cover', p: 9, lines: ['534+ drives', 'zero fees', 'open access'], v: 'ISSUE 06' },
  { t: 'taped', p: 6, v: 'feeding drive' },
  { t: 'serifquote', p: 7, s: 'why? why not.', v: '— the founders' },

  { t: 'circle', p: 8, k: 'teach.' },
  { t: 'filmstrip', p: 0, v: 'five years' },
  { t: 'stat', p: 1, k: '1,200', v: 'members strong', m: 'kolkata born' },

  { t: 'quoteshot', p: 2, s: 'leave it greener.', v: 'sundarbans 8.0' },
  { t: 'stamp', p: 3, v: 'kolkata', m: '₹0' },
  { t: 'mega', p: 4, k: 'rise.', m: 'real work, real impact' },

  { t: 'editorial', p: 5, tag: 'DISTRIBUTION', k: '1000 kgs\ndonated.', m: 'goonj × aquaterra' },
  { t: 'polaroid', p: 6, v: 'workshop kids' },
  { t: 'window', p: 7, k: 'ROOTS' },

  { t: 'statshot', p: 8, k: '8', v: 'sundarbans trips' },
  { t: 'taped', p: 9, v: 'plantation day' },
  { t: 'stack', p: 2, a: ['PLANT', 'FEED', 'TEACH'], m: '★ 534+ drives' },

  { t: 'cover', p: 4, lines: ['paradox 3.0', '300 attendees', '80G certified'], v: 'EVENTS' },
  { t: 'circle', p: 1, k: 'feed.' },
  { t: 'serifquote', p: 0, s: 'show up. stand out.', v: '— the handbook' },

  { t: 'filmstrip', p: 3, v: 'in the field' },
  { t: 'stamp', p: 5, v: 'sundarbans', m: 'EST 2021' },
  { t: 'quoteshot', p: 6, s: 'real work, real impact.', v: 'every drive' },
  { t: 'editorial', p: 7, tag: 'PLANTATION', k: 'leave it\ngreener.', m: '4,000+ saplings' },
]

function Pic({ photo, className, alt = '' }: { photo?: Photo; className?: string; alt?: string }) {
  return photo?.image
    ? <img className={className} src={photo.image} alt={alt} loading="lazy" />
    : <div className={(className || '') + ' bpp-noimg'} />
}

function PosterCard({ d, i, pics }: { d: Poster; i: number; pics: Photo[] }) {
  const [bg, fg, ac] = PAL[d.p]
  const vars = { background: bg, color: fg, ['--pac' as string]: ac, ['--pfg' as string]: fg, ['--pbg' as string]: bg, ['--rd' as string]: `${(i % 6) * 45}ms` } as React.CSSProperties
  const p0 = pics[0]

  return (
    <div className={`bp-poster-card bpt-${d.t} bp-rise`} style={vars} aria-hidden>

      {/* ── full-bleed photo ── */}
      {d.t === 'editorial' && <>
        <Pic photo={p0} className="bpp-photo" />
        <div className="bpp-photo-grad" />
        {d.tag && <span className="bpp-chip bpp-chip-photo">{d.tag}</span>}
        <div className="bpp-photo-foot">
          <div className="bpp-photo-title">{d.k}</div>
          {d.m && <div className="bpp-photo-meta">{d.m}</div>}
        </div>
      </>}

      {d.t === 'cover' && <>
        <Pic photo={p0} className="bpp-photo" />
        <div className="bpp-cover-grad" />
        <div className="bpp-cover-mast">AQUA<span>TERRA</span></div>
        <div className="bpp-cover-lines">{d.lines!.map((l, j) => <span key={j}>{l}</span>)}</div>
        <span className="bpp-cover-issue">{d.v}</span>
      </>}

      {d.t === 'statshot' && <>
        <Pic photo={p0} className="bpp-photo" />
        <div className="bpp-scrim" />
        <div className="bpp-shot-num">{d.k}</div>
        <div className="bpp-shot-lbl">{d.v}</div>
      </>}

      {d.t === 'quoteshot' && <>
        <Pic photo={p0} className="bpp-photo" />
        <div className="bpp-scrim" />
        <span className="bpp-shot-q">“</span>
        <div className="bpp-shot-quote">{d.s}</div>
        {d.v && <div className="bpp-shot-attr">— {d.v}</div>}
      </>}

      {/* ── cute frames ── */}
      {d.t === 'polaroid' && (
        <figure className="bpp-polaroid">
          <Pic photo={p0} className="bpp-polaroid-img" />
          <figcaption className="bpp-polaroid-cap">{d.v}</figcaption>
        </figure>
      )}

      {d.t === 'taped' && (
        <figure className="bpp-taped">
          <span className="bpp-tape bpp-tape-1" />
          <span className="bpp-tape bpp-tape-2" />
          <Pic photo={p0} className="bpp-taped-img" />
          <figcaption className="bpp-taped-cap">{d.v}</figcaption>
        </figure>
      )}

      {d.t === 'window' && <>
        <div className="bpp-window"><Pic photo={p0} className="bpp-window-img" /></div>
        <div className="bpp-window-label">{d.k}</div>
        <span className="bpp-window-mono">aquaterra · welfare</span>
      </>}

      {d.t === 'circle' && <>
        <div className="bpp-circle"><Pic photo={p0} className="bpp-circle-img" /></div>
        <div className="bpp-circle-word">{d.k}</div>
      </>}

      {d.t === 'filmstrip' && (
        <div className="bpp-filmstrip">
          {[0, 1, 2].map(j => <div key={j} className="bpp-film-frame"><Pic photo={pics[j]} className="bpp-film-img" /></div>)}
          <span className="bpp-film-label">{d.v}</span>
        </div>
      )}

      {d.t === 'stamp' && (
        <figure className="bpp-stamp">
          <Pic photo={p0} className="bpp-stamp-img" />
          <figcaption className="bpp-stamp-foot">
            <span className="bpp-stamp-name">AQUATERRA</span>
            <span className="bpp-stamp-loc">{d.v}</span>
            <span className="bpp-stamp-val">{d.m}</span>
          </figcaption>
        </figure>
      )}

      {/* ── type only ── */}
      {d.t === 'mega' && <>
        <div className="bpp-mega">{d.k}</div>
        {d.m && <div className="bpp-foot">{d.m}</div>}
        <span className="bpp-corner">AQ</span>
      </>}

      {d.t === 'stat' && <>
        <span className="bpp-bar" />
        <div className="bpp-num">{d.k}</div>
        <div className="bpp-sub">{d.v}</div>
        {d.m && <div className="bpp-foot">{d.m}</div>}
      </>}

      {d.t === 'stack' && <>
        <div className="bpp-stack">{d.a!.map((w, j) => <span key={j} style={{ color: j % 2 ? ac : fg }}>{w}</span>)}</div>
        {d.m && <div className="bpp-foot">{d.m}</div>}
      </>}

      {d.t === 'serifquote' && <>
        <span className="bpp-qmark">“</span>
        <div className="bpp-serifquote">{d.s}</div>
        <span className="bpp-rule" />
        {d.v && <div className="bpp-foot">{d.v}</div>}
      </>}
    </div>
  )
}

/* ───────────────────────── styles ───────────────────────── */
const styles = `
.brandpage { overflow-x: hidden; }
.bp-grain { position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.045; mix-blend-mode: multiply; background-size: 160px; }
.brandpage > *:not(.bp-grain) { position: relative; z-index: 1; }

.bp-dash { width: 22px; height: 1px; background: currentColor; opacity: 0.4; display: inline-block; }
.bp-serif { font-family: var(--serif); font-style: italic; font-weight: 400; }

/* ── reveal choreography (transition-based; resting state always visible) ── */
.bp-reveal .bp-rise { opacity: 0; translate: 0 18px; filter: blur(8px); }
.bp-reveal.in .bp-rise {
  opacity: 1; translate: 0 0; filter: blur(0);
  transition:
    opacity .7s cubic-bezier(.2,.7,.2,1) var(--rd,0ms),
    translate .7s cubic-bezier(.2,.7,.2,1) var(--rd,0ms),
    filter .7s cubic-bezier(.2,.7,.2,1) var(--rd,0ms),
    transform .18s cubic-bezier(.2,.7,.2,1),
    box-shadow .2s ease, border-color .2s ease;
}

/* ── story-scroll swing (cream sections only) ── */
.bp-section.bp-reveal { transform-origin: bottom left; }
@media (prefers-reduced-motion: no-preference) {
  .bp-section.bp-reveal:not(.bp-section-dark) { transform: rotate(3deg); transition: transform 0.9s cubic-bezier(.2,.7,.2,1); }
  .bp-section.bp-reveal.in:not(.bp-section-dark) { transform: rotate(0deg); }
}

/* ── contextual tick (scale 0.25→1, blur 4→0) ── */
@keyframes bpTick { from { opacity: 0; transform: scale(0.25); filter: blur(4px); } to { opacity: 1; transform: scale(1); filter: blur(0); } }
.bp-tick { display: inline-block; animation: bpTick 0.3s cubic-bezier(.2,0,0,1) both; font-weight: 800; }

/* ── toast ── */
.bp-toast { position: fixed; left: 50%; bottom: 28px; transform: translate(-50%, 24px); background: var(--ink); color: var(--bg); font: 600 12px/1 var(--mono); letter-spacing: 0.04em; padding: 12px 18px; border-radius: 999px; z-index: 50; opacity: 0; pointer-events: none; transition: opacity .2s, transform .3s cubic-bezier(.2,.7,.2,1); box-shadow: 0 10px 40px rgba(0,0,0,0.32); display: flex; align-items: center; gap: 6px; }
.bp-toast.on { opacity: 1; transform: translate(-50%, 0); }
.bp-toast b { color: var(--lemon); font-weight: 700; }
.bp-toast-tick { display: inline-block; animation: bpTick 0.3s cubic-bezier(.2,0,0,1) both; }

/* ── masthead ── */
.bp-mast { min-height: 90svh; display: flex; align-items: center; border-bottom: 2px solid var(--ink); position: relative; overflow: hidden; }
.bp-mast-inner { position: relative; z-index: 2; width: 100%; max-width: 1180px; margin: 0 auto; padding: clamp(80px,12vw,140px) var(--page-px,24px) clamp(48px,7vw,80px); }
.bp-aurora { position: absolute; inset: -25%; z-index: 0; pointer-events: none; opacity: 0.5;
  background: radial-gradient(38% 44% at 22% 30%, rgba(27,138,90,0.16), transparent 60%), radial-gradient(34% 40% at 80% 22%, rgba(255,77,140,0.13), transparent 60%), radial-gradient(40% 46% at 70% 78%, rgba(126,91,255,0.12), transparent 62%), radial-gradient(30% 38% at 30% 82%, rgba(255,199,0,0.12), transparent 60%);
  filter: blur(8px); animation: bpAurora 26s ease-in-out infinite alternate; }
@keyframes bpAurora { 0% { transform: translate3d(0,0,0) rotate(0deg) scale(1); } 50% { transform: translate3d(2%,-2%,0) rotate(6deg) scale(1.08); } 100% { transform: translate3d(-2%,1%,0) rotate(-4deg) scale(1.04); } }
.bp-mast-spot { position: absolute; inset: 0; z-index: 1; pointer-events: none; background: radial-gradient(240px circle at var(--mx,50%) var(--my,32%), rgba(27,138,90,0.14), transparent 68%); transition: opacity .3s; }
.bp-mast-kicker { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; font: 700 10px var(--mono); letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-3); margin-bottom: clamp(24px,4vw,40px); }
.bp-mast-title { font-family: var(--display); font-weight: 900; margin: 0; font-size: clamp(64px,16vw,184px); line-height: 0.82; letter-spacing: -0.05em; text-transform: uppercase; display: flex; flex-direction: column; }
.bp-mast-title .bp-serif { text-transform: lowercase; letter-spacing: -0.02em; color: var(--mint); font-size: 0.86em; margin-top: -0.04em; }
.bp-mast-sub { font-family: var(--eina); font-size: clamp(15px,1.8vw,18px); line-height: 1.65; color: var(--ink-2); max-width: 540px; margin: clamp(24px,3vw,32px) 0 0; text-wrap: pretty; }
.bp-mast-scroll { margin-top: clamp(36px,5vw,56px); font: 700 10px var(--mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); }
.bp-sticker { position: absolute; z-index: 3; transform: rotate(var(--rot,0deg)); animation: bpStickerIn 0.7s cubic-bezier(.34,1.56,.64,1) both; animation-delay: 0.5s; transition: transform .18s cubic-bezier(.34,1.56,.64,1); }
.bp-sticker:hover { transform: rotate(0deg) scale(1.07); }
@keyframes bpStickerIn { from { opacity: 0; transform: rotate(var(--rot,0deg)) scale(0.6); } to { opacity: 1; transform: rotate(var(--rot,0deg)) scale(1); } }
@media (max-width: 720px) { .bp-sticker-hide { display: none; } }

/* ── section shell ── */
.bp-section { max-width: 1180px; margin: 0 auto; padding: clamp(56px,9vw,120px) var(--page-px,24px); border-bottom: 2px solid var(--ink); }
.bp-section-dark { background: var(--ink); color: var(--bg); max-width: none; margin: 0; padding-left: max(var(--page-px,24px), calc((100vw - 1180px)/2 + 24px)); padding-right: max(var(--page-px,24px), calc((100vw - 1180px)/2 + 24px)); }
.bp-section-head { display: flex; gap: clamp(16px,3vw,32px); margin-bottom: clamp(36px,5vw,56px); align-items: flex-start; }
.bp-section-idx { font-family: var(--display); font-weight: 900; font-size: clamp(40px,6vw,80px); line-height: 0.8; letter-spacing: -0.04em; color: var(--accent); flex-shrink: 0; }
.bp-section-dark .bp-section-idx { color: var(--lemon); }
.bp-section-title { font-family: var(--display); font-weight: 900; font-size: clamp(28px,4.5vw,56px); letter-spacing: -0.035em; margin: 0 0 8px; line-height: 0.95; text-wrap: balance; }
.bp-section-lead { font-family: var(--eina); font-size: clamp(14px,1.6vw,17px); line-height: 1.6; color: var(--ink-3); max-width: 520px; margin: 0; text-wrap: pretty; }
.bp-section-dark .bp-section-lead { color: rgba(244,239,224,0.55); }
.bp-block-label { font: 700 10px var(--mono); letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); margin-bottom: 16px; }
.bp-section-dark .bp-block-label { color: rgba(244,239,224,0.5); }

/* ── swatches ── */
.bp-swatch-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; }
.bp-swatch { text-align: left; border: 2px solid var(--ink); border-radius: 16px; overflow: hidden; background: var(--bg); cursor: pointer; padding: 0; font: inherit; transition: transform .18s cubic-bezier(.2,.7,.2,1), box-shadow .2s; }
.bp-swatch:hover { transform: translateY(-4px); box-shadow: 6px 8px 0 var(--ink); }
.bp-swatch:active { transform: translateY(-1px) scale(0.985); }
.bp-swatch:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }
.bp-swatch-chip { position: relative; height: 96px; display: flex; align-items: flex-end; padding: 12px; }
.bp-swatch-hexbig { font: 700 13px var(--mono); letter-spacing: 0.04em; }
.bp-swatch-hint { position: absolute; top: 10px; right: 12px; font: 700 8px var(--mono); letter-spacing: 0.1em; text-transform: uppercase; opacity: 0; transform: translateY(-3px); transition: opacity .18s, transform .18s; background: rgba(0,0,0,0.18); padding: 4px 7px; border-radius: 999px; }
.bp-swatch:hover .bp-swatch-hint { opacity: 0.85; transform: translateY(0); }
.bp-swatch-info { padding: 12px 14px 14px; }
.bp-swatch-name { font-family: var(--display); font-weight: 900; font-size: 16px; letter-spacing: -0.02em; margin-bottom: 4px; }
.bp-swatch-note { font-family: var(--eina); font-size: 11.5px; line-height: 1.45; color: var(--ink-3); text-wrap: pretty; }

/* sticker pops */
.bp-pop-row { display: flex; flex-wrap: wrap; gap: 10px; }
.bp-pop { border: 2px solid var(--ink); border-radius: 12px; padding: 12px 16px; cursor: pointer; display: flex; flex-direction: column; gap: 4px; transition: transform .16s cubic-bezier(.34,1.56,.64,1); }
.bp-pop:hover { transform: translateY(-3px) rotate(-2deg); }
.bp-pop:active { transform: translateY(-1px) scale(0.97); }
.bp-pop:focus-visible { outline: 3px solid var(--ink); outline-offset: 2px; }
.bp-pop-hex { font: 700 13px var(--mono); letter-spacing: 0.03em; }
.bp-pop-name { font: 600 9px var(--mono); letter-spacing: 0.06em; text-transform: lowercase; opacity: 0.7; }

/* ── tutorial ── */
.bp-tut { display: flex; gap: 14px; margin-top: 36px; padding: 18px 20px; border: 1.5px dashed var(--line-2); border-radius: 14px; background: var(--bg-2); }
.bp-tut-dark { background: rgba(244,239,224,0.05); border-color: rgba(244,239,224,0.2); }
.bp-tut-mark { font: 800 10px var(--mono); letter-spacing: 0.1em; color: var(--accent); border: 2px solid var(--accent); border-radius: 6px; padding: 4px 7px; height: fit-content; flex-shrink: 0; }
.bp-section-dark .bp-tut-mark { color: var(--lemon); border-color: var(--lemon); }
.bp-tut p { margin: 0; font-family: var(--eina); font-size: 14px; line-height: 1.65; color: var(--ink-2); text-wrap: pretty; }
.bp-section-dark .bp-tut p { color: rgba(244,239,224,0.8); }

/* ── type tester ── */
.bp-tester { border: 2px solid rgba(244,239,224,0.25); border-radius: 18px; padding: 14px; margin-bottom: 40px; background: rgba(244,239,224,0.03); }
.bp-tester-controls { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
.bp-tester-hint { font: 700 9px var(--mono); letter-spacing: 0.08em; text-transform: uppercase; color: rgba(244,239,224,0.4); margin-right: auto; }
.bp-tester-fontname { margin-right: auto; font-size: 19px; font-weight: 700; color: var(--bg); letter-spacing: -0.01em; line-height: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bp-tchip { font: 700 11px var(--mono); letter-spacing: 0.04em; text-transform: uppercase; cursor: pointer; background: transparent; color: rgba(244,239,224,0.6); border: 1.5px solid rgba(244,239,224,0.25); border-radius: 999px; padding: 7px 14px; transition: transform .14s, background .18s, color .18s, border-color .18s; }
.bp-tchip:hover { border-color: var(--lemon); color: var(--bg); }
.bp-tchip:active { transform: scale(0.96); }
.bp-tchip.on { background: var(--lemon); color: var(--ink); border-color: var(--lemon); }
.bp-tchip:focus-visible { outline: 2px solid var(--lemon); outline-offset: 2px; }
.bp-tester-stage { font-size: clamp(34px,7vw,72px); line-height: 1.05; color: var(--bg); padding: 18px 14px 22px; outline: none; border-radius: 12px; transition: background .2s; caret-color: var(--lemon); min-height: 1.2em; text-wrap: balance; }
.bp-tester-stage:focus { background: rgba(244,239,224,0.04); }

/* ── type specimens (static, no code) ── */
.bp-type-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; margin-bottom: 40px; }
.bp-spec { border: 2px solid rgba(244,239,224,0.25); border-radius: 16px; background: rgba(244,239,224,0.03); padding: 22px; }
.bp-spec-aa { font-size: 72px; line-height: 1; margin-bottom: 14px; }
.bp-spec-meta { display: flex; justify-content: space-between; align-items: baseline; border-top: 1px solid rgba(244,239,224,0.2); padding-top: 12px; }
.bp-spec-role { font-family: var(--display); font-weight: 900; font-size: 17px; letter-spacing: -0.02em; }
.bp-spec-fam { font: 700 11px var(--mono); color: var(--lemon); letter-spacing: 0.02em; }
.bp-spec-sample { font-size: 19px; line-height: 1.3; margin: 14px 0 10px; color: rgba(244,239,224,0.92); text-wrap: balance; }
.bp-spec-note { font-family: var(--eina); font-size: 11.5px; line-height: 1.45; color: rgba(244,239,224,0.5); text-wrap: pretty; }

.bp-scale { border-top: 1px solid rgba(244,239,224,0.2); }
.bp-scale-row { display: flex; align-items: baseline; gap: 20px; padding: 16px 0; border-bottom: 1px solid rgba(244,239,224,0.1); }
.bp-scale-meta { font: 600 10px var(--mono); color: rgba(244,239,224,0.4); width: 130px; flex-shrink: 0; letter-spacing: 0.04em; font-variant-numeric: tabular-nums; }
.bp-scale-txt { color: var(--bg); line-height: 1.1; }

/* ── photography: poster ── */
.bp-poster { position: relative; border-radius: 20px; overflow: hidden; aspect-ratio: 16 / 7; border: 2px solid var(--ink); box-shadow: 8px 10px 0 var(--ink); }
.bp-poster-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; outline: 1px solid rgba(0,0,0,0.1); outline-offset: -1px; }
.bp-poster-grad { position: absolute; inset: 0; background: linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 42%, rgba(0,0,0,0.1) 100%); }
.bp-poster-sticker { position: absolute; top: 16px; right: 16px; transform: rotate(5deg); }
.bp-poster-body { position: absolute; left: 0; right: 0; bottom: 0; padding: clamp(20px,4vw,40px); z-index: 2; }
.bp-poster-title { font-family: var(--display); font-weight: 900; font-size: clamp(34px,6vw,84px); line-height: 0.9; letter-spacing: -0.04em; color: #fff; margin: 10px 0 0; text-transform: uppercase; text-shadow: 0 2px 12px rgba(0,0,0,0.5); text-wrap: balance; }
.bp-poster-title .bp-serif { color: var(--lemon); text-transform: lowercase; }

/* shared photo chips */
.bp-photo-tag { display: inline-block; font: 700 9px var(--mono); letter-spacing: 0.07em; text-transform: uppercase; color: #fff; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); padding: 5px 10px; border-radius: 999px; }
.bp-photo-tag-dark { color: var(--ink); background: transparent; backdrop-filter: none; padding: 0; opacity: 0.6; margin-bottom: 14px; }
.bp-photo-meta { font-family: var(--eina); font-size: 12px; color: rgba(255,255,255,0.78); margin-top: 8px; }

/* photo cards (magazine) */
.bp-photocards { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
.bp-card { border: 2px solid var(--ink); border-radius: 16px; overflow: hidden; transition: transform .2s cubic-bezier(.2,.7,.2,1), box-shadow .2s; }
.bp-card:hover { transform: translateY(-4px); box-shadow: 8px 10px 0 var(--ink); }
.bp-card-img { position: relative; aspect-ratio: 3/4; display: flex; background: var(--bg-3); }
.bp-card-img-fallback { background: linear-gradient(150deg, #1a6b6b 0%, #0d3d3d 100%); }
.bp-card-photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; outline: 1px solid rgba(0,0,0,0.1); outline-offset: -1px; }
.bp-card-num { position: absolute; top: 12px; right: 14px; font: 700 12px var(--mono); color: rgba(255,255,255,0.6); z-index: 2; font-variant-numeric: tabular-nums; }
.bp-card-grad { position: absolute; inset: 0; background: linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 45%, transparent 72%); }
.bp-card-body { position: relative; z-index: 2; margin-top: auto; padding: 18px; }
.bp-card-body .bp-photo-tag { margin-bottom: 10px; }
.bp-card-title { font-family: var(--display); font-weight: 900; font-size: 19px; letter-spacing: -0.02em; color: #fff; margin: 0; line-height: 1.05; text-shadow: 0 1px 4px rgba(0,0,0,0.6); text-wrap: balance; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* stickers on photo */
.bp-stickerframes { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
.bp-stickerframe { position: relative; margin: 0; border-radius: 16px; overflow: hidden; border: 2px solid var(--ink); aspect-ratio: 4/3; }
.bp-stickerframe img { width: 100%; height: 100%; object-fit: cover; display: block; outline: 1px solid rgba(0,0,0,0.1); outline-offset: -1px; }

/* in the wild — announce + stats */
.bp-wild { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; align-items: stretch; }
.bp-announce { background: var(--lemon); border: 2px solid var(--ink); border-radius: 16px; padding: clamp(24px,3vw,34px); display: flex; flex-direction: column; }
.bp-announce-title { font-family: var(--display); font-weight: 900; font-size: clamp(32px,4vw,46px); letter-spacing: -0.035em; line-height: 0.9; color: var(--ink); margin: 0 0 14px; text-wrap: balance; }
.bp-announce-title .bp-serif { color: var(--ink); }
.bp-announce-sub { font-family: var(--eina); font-size: 14px; line-height: 1.6; color: var(--ink); opacity: 0.7; margin: 0 0 auto; padding-bottom: 22px; text-wrap: pretty; }
.bp-announce .bp-cta-demo { align-self: flex-start; }
.bp-cta-demo { display: inline-flex; background: var(--ink); color: var(--bg); font: 700 12px var(--mono); text-transform: uppercase; letter-spacing: 0.06em; padding: 14px 26px 14px 28px; border-radius: 999px; transition: transform .15s cubic-bezier(.2,.7,.2,1); }
.bp-cta-demo:active { transform: scale(0.96); }
.bp-cta-invert { background: var(--ink); color: var(--lemon); }
.bp-stats { border: 2px solid var(--ink); border-radius: 16px; padding: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--ink); overflow: hidden; }
.bp-stat { background: var(--bg); padding: 22px 18px; display: flex; flex-direction: column; gap: 6px; }
.bp-stat-k { font-family: var(--display); font-weight: 900; font-size: clamp(26px,3vw,34px); letter-spacing: -0.04em; color: var(--mint); font-variant-numeric: tabular-nums; line-height: 1; }
.bp-stat-v { font: 700 10px var(--mono); letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-3); }

/* photo mosaic (masonry) */
.bp-mosaic { column-count: 3; column-gap: 12px; }
.bp-mosaic-item { position: relative; break-inside: avoid; margin: 0 0 12px; border-radius: 12px; overflow: hidden; border: 2px solid var(--ink); }
.bp-mosaic-item img { width: 100%; display: block; outline: 1px solid rgba(0,0,0,0.1); outline-offset: -1px; }
.bp-mosaic-item figcaption { position: absolute; left: 0; right: 0; bottom: 0; padding: 16px 12px 9px; font: 700 9px var(--mono); letter-spacing: 0.06em; text-transform: uppercase; color: #fff; background: linear-gradient(0deg, rgba(0,0,0,0.78), transparent); }
@media (max-width: 760px) { .bp-mosaic { column-count: 2; } }
@media (max-width: 420px) { .bp-mosaic { column-count: 1; } }

/* ── colophon ── */
.bp-colophon { background: var(--ink); color: var(--bg); padding: clamp(48px,7vw,90px) var(--page-px,24px); text-align: center; overflow: hidden; }
.bp-colophon-row { display: inline-flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: center; font: 700 10px var(--mono); letter-spacing: 0.12em; color: rgba(244,239,224,0.55); margin-bottom: 24px; }
.bp-colophon-big { display: block; margin: 0 auto; background: none; border: none; color: var(--bg); cursor: pointer; font-family: var(--display); font-weight: 900; font-size: clamp(56px,15vw,200px); letter-spacing: -0.05em; line-height: 0.8; padding: 0; transition: transform .15s cubic-bezier(.2,.7,.2,1); }
.bp-colophon-big:hover { transform: scale(1.01); }
.bp-colophon-big:active { transform: scale(0.99); }
.bp-colophon-big:focus-visible { outline: 3px solid var(--lemon); outline-offset: 8px; border-radius: 8px; }
.bp-colophon-hint { margin-top: 22px; font: 600 11px var(--mono); letter-spacing: 0.06em; color: rgba(244,239,224,0.4); }
.bp-colophon-hint b { font-weight: 700; }

/* ── colour combinations ── */
.bp-combos { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px,1fr)); gap: 12px; }
.bp-combo { border: 2px solid var(--ink); border-radius: 14px; overflow: hidden; background: var(--bg); transition: transform .18s cubic-bezier(.2,.7,.2,1), box-shadow .2s; }
.bp-combo:hover { transform: translateY(-3px); box-shadow: 5px 6px 0 var(--ink); }
.bp-combo-swatch { display: flex; height: 60px; }
.bp-combo-swatch span { flex: 1; }
.bp-combo-info { padding: 10px 12px 12px; }
.bp-combo-name { font-family: var(--display); font-weight: 900; font-size: 13px; letter-spacing: -0.01em; }
.bp-combo-note { font: 600 9px var(--mono); letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-3); margin-top: 3px; }

/* ── posters gallery (3-up, photography-forward) ── */
.bp-posters { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
@media (max-width: 860px) { .bp-posters { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 520px) { .bp-posters { grid-template-columns: 1fr; } }
.bp-float-sticker { position: absolute; right: var(--page-px,24px); top: clamp(54px,9vw,118px); transform: rotate(var(--rot,0deg)); z-index: 4; }
.bp-poster-card {
  container-type: inline-size;
  position: relative; aspect-ratio: 3/4; border: 2px solid var(--ink); border-radius: 14px; overflow: hidden;
  display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 2px;
  padding: 18px; transition: transform .2s cubic-bezier(.2,.7,.2,1), box-shadow .2s;
}
.bp-poster-card:hover { transform: translateY(-5px); box-shadow: 7px 9px 0 var(--ink); z-index: 2; }
.bp-poster-card > *, .bpp-stack span { max-width: 100%; overflow-wrap: anywhere; }
.bpp-photo { max-width: none; }
.bpp-noimg { background: var(--bg-3); }

/* shared accents */
.bpp-corner { position: absolute; top: 13px; right: 15px; z-index: 3; font: 700 10px var(--mono); letter-spacing: 0.04em; opacity: 0.5; }
.bpp-foot { position: absolute; left: 18px; right: 18px; bottom: 14px; z-index: 3; font: 700 9px var(--mono); letter-spacing: 0.05em; text-transform: uppercase; opacity: 0.72; text-align: center; }
.bpp-bar { position: absolute; top: 18px; left: 18px; width: 30px; height: 4px; border-radius: 2px; background: var(--pac); }
.bpp-rule { width: 40px; height: 2px; background: var(--pac); margin-top: 14px; }
.bpp-qmark { position: absolute; top: 6px; left: 16px; font-family: var(--serif); font-size: 92px; line-height: 1; opacity: 0.13; }
.bpp-chip { position: absolute; top: 14px; left: 14px; z-index: 3; font: 700 8.5px var(--mono); letter-spacing: 0.06em; text-transform: uppercase; color: #fff; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); padding: 4px 9px; border-radius: 999px; }

/* ── full-bleed photo ── */
.bpt-editorial, .bpt-cover, .bpt-statshot, .bpt-quoteshot { padding: 0; }
.bpp-photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.bpp-photo-grad { position: absolute; inset: 0; background: linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.35) 48%, rgba(0,0,0,0.04) 100%); }
.bpp-photo-foot { position: absolute; left: 0; right: 0; bottom: 0; z-index: 2; padding: 20px; }
.bpp-photo-title { font-family: var(--display); font-weight: 900; font-size: clamp(28px,13cqw,54px); line-height: 0.9; letter-spacing: -0.04em; color: #fff; text-transform: uppercase; white-space: pre-line; text-shadow: 0 2px 14px rgba(0,0,0,0.6); }
.bpp-photo-meta { font: 700 9.5px var(--mono); letter-spacing: 0.06em; text-transform: uppercase; color: rgba(255,255,255,0.85); margin-top: 9px; }
.bpp-scrim { position: absolute; inset: 0; background: rgba(0,0,0,0.46); }
.bpp-shot-num { position: relative; z-index: 2; font-family: var(--display); font-weight: 900; font-size: clamp(54px,30cqw,128px); line-height: 0.8; letter-spacing: -0.05em; color: #fff; font-variant-numeric: tabular-nums; text-shadow: 0 2px 20px rgba(0,0,0,0.4); }
.bpp-shot-lbl { position: relative; z-index: 2; font: 700 11px var(--mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--pac); margin-top: 12px; }
.bpp-shot-q { position: absolute; top: 6px; left: 16px; z-index: 2; font-family: var(--serif); font-size: 96px; line-height: 1; color: rgba(255,255,255,0.28); }
.bpp-shot-quote { position: relative; z-index: 2; font-family: var(--serif); font-style: italic; font-size: clamp(22px,14cqw,44px); line-height: 1.06; color: #fff; text-align: center; padding: 0 6px; text-wrap: balance; text-shadow: 0 2px 14px rgba(0,0,0,0.5); }
.bpp-shot-attr { position: relative; z-index: 2; font: 700 9.5px var(--mono); letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.82); margin-top: 14px; }
.bpp-cover-grad { position: absolute; inset: 0; background: linear-gradient(0deg, rgba(0,0,0,0.85), transparent 50%), linear-gradient(180deg, rgba(0,0,0,0.6), transparent 26%); }
.bpp-cover-mast { position: absolute; top: 14px; left: 16px; right: 16px; z-index: 2; font-family: var(--display); font-weight: 900; font-size: clamp(24px,11cqw,42px); letter-spacing: -0.035em; color: #fff; text-transform: uppercase; line-height: 1; }
.bpp-cover-mast span { color: var(--pac); }
.bpp-cover-lines { position: absolute; left: 16px; right: 16px; bottom: 16px; z-index: 2; display: flex; flex-direction: column; gap: 4px; }
.bpp-cover-lines span { font: 700 12px var(--mono); text-transform: lowercase; letter-spacing: 0.01em; color: #fff; }
.bpp-cover-lines span:first-child { color: var(--pac); }
.bpp-cover-issue { position: absolute; top: 16px; right: 16px; z-index: 2; font: 700 9px var(--mono); letter-spacing: 0.08em; color: rgba(255,255,255,0.72); }

/* ── cute frames ── */
.bpt-polaroid { background: var(--pbg); }
.bpp-polaroid { width: 80%; background: #fff; padding: 9px 9px 0; border-radius: 3px; box-shadow: 0 14px 32px rgba(0,0,0,0.28), 0 2px 6px rgba(0,0,0,0.18); transform: rotate(-3deg); }
.bpp-polaroid-img { width: 100%; aspect-ratio: 1/1; object-fit: cover; display: block; }
.bpp-polaroid-cap { font-family: var(--serif); font-style: italic; font-size: clamp(15px,8cqw,26px); color: #1a1a1a; text-align: center; padding: 11px 4px 14px; line-height: 1; }

.bpt-taped { background: var(--pbg); }
.bpp-taped { position: relative; width: 82%; transform: rotate(2deg); }
.bpp-taped-img { width: 100%; aspect-ratio: 4/3; object-fit: cover; display: block; border-radius: 2px; box-shadow: 0 12px 28px rgba(0,0,0,0.22); }
.bpp-tape { position: absolute; top: -10px; width: 52px; height: 20px; background: color-mix(in srgb, var(--pac) 45%, #fff); opacity: 0.8; z-index: 2; box-shadow: 0 1px 2px rgba(0,0,0,0.12); }
.bpp-tape-1 { left: 13%; transform: rotate(-7deg); }
.bpp-tape-2 { right: 13%; transform: rotate(6deg); }
.bpp-taped-cap { font: 700 9.5px var(--mono); text-transform: uppercase; letter-spacing: 0.08em; text-align: center; margin-top: 14px; opacity: 0.75; }

.bpt-window { background: var(--pbg); color: var(--pfg); padding: 16px; align-items: stretch; justify-content: flex-start; }
.bpp-window { height: 64%; border-radius: 11px; overflow: hidden; border: 3px solid var(--pac); }
.bpp-window-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.bpp-window-label { font-family: var(--display); font-weight: 900; font-size: clamp(28px,18cqw,58px); letter-spacing: -0.04em; text-transform: uppercase; line-height: 0.9; margin-top: 14px; }
.bpp-window-mono { font: 700 8.5px var(--mono); letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.55; margin-top: 5px; }

.bpt-circle { background: var(--pbg); color: var(--pfg); }
.bpp-circle { width: 66%; aspect-ratio: 1; border-radius: 50%; overflow: hidden; border: 4px solid var(--pac); box-shadow: 0 10px 26px rgba(0,0,0,0.16); }
.bpp-circle-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.bpp-circle-word { font-family: var(--display); font-weight: 900; font-size: clamp(32px,18cqw,62px); letter-spacing: -0.04em; text-transform: lowercase; margin-top: 16px; }

.bpt-filmstrip { background: var(--pbg); }
.bpp-filmstrip { width: 56%; background: #111; padding: 14px 11px; border-radius: 4px; display: flex; flex-direction: column; gap: 6px; position: relative; box-shadow: 0 14px 32px rgba(0,0,0,0.32); }
.bpp-filmstrip::before, .bpp-filmstrip::after { content: ''; position: absolute; top: 6px; bottom: 22px; width: 5px; background-image: repeating-linear-gradient(#fff 0 5px, transparent 5px 11px); opacity: 0.85; }
.bpp-filmstrip::before { left: 3px; }
.bpp-filmstrip::after { right: 3px; }
.bpp-film-frame { aspect-ratio: 4/3; overflow: hidden; border-radius: 1px; }
.bpp-film-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.bpp-film-label { font: 700 8px var(--mono); letter-spacing: 0.1em; text-transform: uppercase; color: #fff; text-align: center; margin-top: 2px; }

.bpt-stamp { background: var(--pbg); }
.bpp-stamp { width: 76%; background: #fff; padding: 7px; border-radius: 2px; position: relative; filter: drop-shadow(0 8px 16px rgba(0,0,0,0.22)); }
.bpp-stamp::before { content: ''; position: absolute; inset: -2px; border: 2px dashed rgba(0,0,0,0.28); border-radius: 5px; pointer-events: none; }
.bpp-stamp-img { width: 100%; aspect-ratio: 1/1; object-fit: cover; display: block; }
.bpp-stamp-foot { display: grid; grid-template-columns: 1fr auto; align-items: center; column-gap: 6px; padding: 6px 3px 2px; }
.bpp-stamp-name { grid-column: 1; grid-row: 1; font-family: var(--display); font-weight: 900; font-size: clamp(10px,5cqw,15px); letter-spacing: -0.01em; color: #111; line-height: 1; }
.bpp-stamp-loc { grid-column: 1; grid-row: 2; font: 600 8px var(--mono); text-transform: uppercase; letter-spacing: 0.05em; color: #666; margin-top: 2px; }
.bpp-stamp-val { grid-column: 2; grid-row: 1 / 3; align-self: center; font-family: var(--display); font-weight: 900; font-size: clamp(13px,7cqw,22px); color: var(--pac); }

/* ── type only ── */
.bpp-mega { font-family: var(--display); font-weight: 900; font-size: clamp(34px,22cqw,84px); line-height: 0.8; letter-spacing: -0.05em; text-transform: lowercase; text-align: center; }
.bpp-stack { display: flex; flex-direction: column; align-items: center; text-align: center; font-family: var(--display); font-weight: 900; font-size: clamp(26px,16cqw,56px); line-height: 0.84; letter-spacing: -0.04em; text-transform: uppercase; }
.bpp-num { font-family: var(--display); font-weight: 900; font-size: clamp(42px,26cqw,98px); letter-spacing: -0.05em; line-height: 0.78; color: var(--pac); font-variant-numeric: tabular-nums; text-align: center; }
.bpp-sub { font: 700 10px var(--mono); letter-spacing: 0.07em; text-transform: uppercase; margin-top: 12px; opacity: 0.82; text-align: center; }
.bpp-serifquote { font-family: var(--serif); font-style: italic; font-size: clamp(24px,15cqw,46px); line-height: 1.05; text-align: center; text-wrap: balance; position: relative; z-index: 1; }

@media (prefers-reduced-motion: reduce) {
  .bp-reveal .bp-rise { opacity: 1 !important; translate: none !important; filter: none !important; transition: none !important; }
  .bp-sticker { animation: none !important; opacity: 1 !important; }
  .bp-aurora { animation: none !important; opacity: 0.35; }
  .bp-mast-spot { opacity: 0; }
  .bp-tick, .bp-toast-tick { animation: none !important; }
  .bp-swatch:hover, .bp-pop:hover, .bp-card:hover, .bp-colophon-big:hover,
  .bp-poster-card:hover, .bp-combo:hover { transform: none; }
}
`
