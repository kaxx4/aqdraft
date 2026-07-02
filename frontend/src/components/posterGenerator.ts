// ── AquaTerra social-poster generator ────────────────────────────────────────
// Turns a feed post into an Instagram-ready graphic. Two formats — Post
// (1080×1440, 4:5) and Story (1080×1920, 9:16) — and a pool of brand-compliant
// templates. Every call picks a random template + accent + decoration, so the
// same post yields a fresh design each time ("regenerate" = new random seed).
//
// Brand language is lifted straight from the site: NeutralFace black display,
// JetBrains Mono labels, the mint/lemon/pink/orange/sky/grape accent family on
// near-black ink, grid texture, sticker chips, stars, thick borders, the
// AQUATERRA. wordmark. Photos (when the post has one) are used full-bleed,
// framed polaroid-style, or split — otherwise we fall back to bold typography.

export interface PosterData {
  body?: string
  authorName?: string
  authorSchool?: string
  category?: string
  uuid?: string
  imageUrl?: string // first post image, if any
}

export type PosterFormat = 'post' | 'story'

// ── Palette (AQ brand kit, canonical hex — cream paper is the base surface;
// pink is the default "shout" accent; six accents rotate one-per-slide) ─────
const CREAM = '#F4EFE0', CREAM2 = '#EDE6D0', CREAM3 = '#E2D9BD'
const INK = '#0A0A0A', INK2 = '#2A2A28', WHITE = '#FFFFFF', CARD = '#141414'
const PINK = '#FF4D8C', MINT = '#1B8A5A', LEMON = '#FFC700', TOMATO = '#FF4D2E', SKY = '#3DA9FC', GRAPE = '#7E5BFF'
const ACCENTS = [PINK, MINT, LEMON, TOMATO, SKY, GRAPE]
// Brighter "pop" tints — no hard line from the accents above; these read best
// on sticker badges and stat tiles but aren't limited to them.
const POP_MINT = '#00E5A0', POP_PINK = '#FF6BD6', POP_LEMON = '#FFE94A', POP_ORANGE = '#FF7A1A', POP_SKY = '#6FD7FF', POP_GRAPE = '#B084FF'
const POPS = [POP_MINT, POP_PINK, POP_LEMON, POP_ORANGE, POP_SKY, POP_GRAPE]
// Department → accent, matched to each color's brand-kit role (mint = identity
// / welfare · grape = Paradox / events · lemon = energy · sky = info / ops ·
// pink = default shout / content).
const CAT_COLORS: Record<string, string> = { welfare: MINT, events: GRAPE, labs: LEMON, operations: SKY, content: PINK }
const catColor = (c?: string) => CAT_COLORS[(c || '').toLowerCase()] || PINK
// Lemon and sky need ink text for contrast (brand law); every other accent —
// and ink itself — takes white.
const inkTextOn = (accent: string) => (accent === LEMON || accent === SKY) ? INK : WHITE

const DISPLAY = '"NeutralFace","Arial Black",Impact,sans-serif'
const MONO = '"JetBrains Mono",monospace'
const SERIF = '"Instrument Serif","Times New Roman",Georgia,serif'
const EINA = '"Eina01",system-ui,sans-serif'

// ── Headline font variation ──────────────────────────────────────────────────
// Each render rolls a headline style so posters don't all look identical: the
// brand's black display most of the time, occasionally a lighter cut, sometimes
// an editorial serif italic. lhMul nudges line-height to suit the face.
type HeadStyle = { fam: string; weight: number; italic: boolean; lhMul: number }
function pickHeadStyle(r: () => number): HeadStyle {
  const x = r()
  if (x < 0.55) return { fam: DISPLAY, weight: 900, italic: false, lhMul: 1.0 }
  if (x < 0.72) return { fam: DISPLAY, weight: 800, italic: false, lhMul: 1.04 }
  if (x < 0.86) return { fam: SERIF, weight: 500, italic: true, lhMul: 0.9 }
  return { fam: SERIF, weight: 600, italic: false, lhMul: 0.92 }
}
const headFont = (st: HeadStyle) => (s: number) => `${st.italic ? 'italic ' : ''}${st.weight} ${s}px ${st.fam}`

const STICKERS = ['NEW', '★ FRESH', 'LIVE', 'THIS!', 'READ ME', 'AQ', '+1', 'GOOD']

// The actual nav header logo (/logo.png), loaded once and reused across renders.
let logoImgCache: HTMLImageElement | null = null

// ── Tiny RNG (so a single generate call is internally consistent) ────────────
export type Rng = () => number
function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const pick = <T,>(r: Rng, arr: T[]): T => arr[Math.floor(r() * arr.length)]
const rrange = (r: Rng, min: number, max: number) => min + r() * (max - min)
const chance = (r: Rng, p: number) => r() < p

// ── Canvas helpers ───────────────────────────────────────────────────────────
// `rgb` lets a cream/paper surface use a faint INK grid instead of the white
// lines that only read against a dark background (the default keeps every
// existing dark-slide call site unchanged).
function grid(ctx: CanvasRenderingContext2D, W: number, H: number, alpha = 0.045, step = 80, rgb = '255,255,255') {
  ctx.save(); ctx.strokeStyle = `rgba(${rgb},${alpha})`; ctx.lineWidth = 1
  for (let x = 0; x < W; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
  for (let y = 0; y < H; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
  ctx.restore()
}

// The paper base — cream fill, optionally a whisper of ink grid texture
// (AQ's "paper grain"). This should be the LEAD background for most slides;
// ink-dark is the deliberate one-slide-per-deck exception, not the default.
function creamBg(ctx: CanvasRenderingContext2D, W: number, H: number, textured = true) {
  ctx.fillStyle = CREAM; ctx.fillRect(0, 0, W, H)
  if (textured) grid(ctx, W, H, 0.05, 84, '10,10,10')
}

// Hard-offset "shadow" in the brutalist-scrapbook sense: not a blur, a solid
// duplicate shape nudged behind-and-right. Call this immediately BEFORE
// filling the real shape at the same (x, y, w, h, radius).
function hardShadow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number, color: string = INK, offset = 8) {
  rrect(ctx, x + offset, y + offset, w, h, radius)
  ctx.fillStyle = color; ctx.fill()
}

// Strip emoji from any text before it's measured/drawn on a generated
// graphic. Brand law: "no emojis on graphics" — stickers and ★ carry that
// energy instead. Feed post bodies routinely start with an emoji (💌🐾🛡️),
// which is fine in-app but must never bake onto a poster/carousel PNG.
function stripEmoji(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}️]/gu, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/^[ \t]+|[ \t]+$/gm, '')
    .trim()
}

function star(ctx: CanvasRenderingContext2D, cx: number, cy: number, sz: number, color: string, alpha = 1, rot = 0) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.translate(cx, cy); ctx.rotate(rot); ctx.beginPath()
  for (let i = 0; i < 16; i++) { const a = (i * Math.PI) / 8 - Math.PI / 2, rr = i % 2 === 0 ? sz : sz * 0.38; i === 0 ? ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) }
  ctx.closePath(); ctx.fill(); ctx.restore()
}

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2)
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + r, r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.arcTo(x, y + h, x, y + h - r, r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath()
}

// Break `text` into lines that fit `maxW` at the ctx's current font. A literal
// newline in the source (e.g. a feed post's own "Title\nBody\n📍 Location"
// structure, or a "\n\n" paragraph break in a project write-up) is a forced
// line break, not just whitespace — splitting on /\s+/ alone used to swallow
// it and run everything into one collapsed sentence.
function layoutLines(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const lines: string[] = []
  for (const para of text.split(/\n+/)) {
    const words = para.split(/\s+/).filter(Boolean)
    let line = ''
    for (const w of words) {
      const t = line ? `${line} ${w}` : w
      if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w } else line = t
    }
    lines.push(line)
  }
  while (lines.length && lines[lines.length - 1] === '') lines.pop()
  return lines
}

// Pick the largest size that fits `text` into ≤ maxLines at maxW, in a rolled
// headline style. Returns the resolved `font` string and `lhMul` so the caller
// draws with the same face. Pass the seeded rng to vary the font each render.
function fitHeadline(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number, start: number, min: number, r?: () => number): { size: number; lines: string[]; font: string; lhMul: number } {
  const st = r ? pickHeadStyle(r) : { fam: DISPLAY, weight: 900, italic: false, lhMul: 1 }
  const mk = headFont(st)
  for (let s = start; s >= min; s -= 4) {
    ctx.font = mk(s)
    const lines = layoutLines(ctx, text, maxW)
    // Accept only when both the line count fits AND every line is within maxW —
    // the width check catches a single unbroken word that would bleed off-canvas.
    const widest = lines.reduce((m, ln) => Math.max(m, ctx.measureText(ln).width), 0)
    if (lines.length <= maxLines && widest <= maxW) return { size: s, lines, font: mk(s), lhMul: st.lhMul }
  }
  // Even at the smallest size the text still runs past maxLines — hard-cap to
  // maxLines and ellipsize the last visible line. Without this the caller's
  // block-height math (lines.length * lh) silently goes unbounded and the text
  // either bleeds off the canvas edge or (if the caller separately truncates
  // the array) a real sentence just stops mid-word with no indication it was cut.
  ctx.font = mk(min)
  let lines = layoutLines(ctx, text, maxW)
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines)
    let last = lines[maxLines - 1]
    while (last.length > 0 && ctx.measureText(last + '…').width > maxW) last = last.slice(0, -1).trimEnd()
    lines[maxLines - 1] = last.trimEnd() + '…'
  }
  return { size: min, lines, font: mk(min), lhMul: st.lhMul }
}

function drawLines(ctx: CanvasRenderingContext2D, lines: string[], x: number, y: number, lh: number, align: CanvasTextAlign = 'left') {
  ctx.textAlign = align
  lines.forEach((ln, i) => ctx.fillText(ln, x, y + i * lh))
  ctx.textAlign = 'left'
}

// Pill treatment per brand law: on cream/paper the real logo needs no pill at
// all (`onLight`); on a photo it sits in a solid INK pill (`surface:'photo'`);
// on anything else — ink-dark or a saturated accent flood, both count as
// "dark/colored" — it sits in a solid CREAM pill (the default).
function logo(ctx: CanvasRenderingContext2D, x: number, y: number, accent: string, size = 50, onLight = false, surface?: 'photo') {
  const img = logoImgCache
  if (img) {
    // The actual nav header logo, sat inside a white rounded badge so it stays
    // legible on any poster background (mirrors the nav, where the logo lives on
    // a light pill). `y` is the old text baseline — the badge bottom lands there.
    const lh = size * 0.72
    const lw = lh * (img.width / img.height)
    if (onLight) {
      // Cream / paper surface — the real logo needs no pill at all.
      ctx.drawImage(img, x, y - lh, lw, lh)
      return
    }
    const padX = 16, padY = 12
    const bw = lw + padX * 2, bh = lh + padY * 2
    const bx = x, by = y - bh
    rrect(ctx, bx, by, bw, bh, bh * 0.32)
    ctx.fillStyle = surface === 'photo' ? INK : CREAM; ctx.fill()
    ctx.drawImage(img, bx + padX, by + padY, lw, lh)
    return
  }
  // Fallback (logo didn't load): the AQUATERRA. wordmark in type.
  ctx.font = `900 ${size}px ${DISPLAY}`
  ctx.fillStyle = onLight ? INK : WHITE; ctx.fillText('AQUA', x, y)
  ctx.fillStyle = onLight ? '#0A0A0A' : accent
  if (onLight) ctx.globalAlpha = 0.62
  ctx.fillText('TERRA.', x + ctx.measureText('AQUA').width + size * 0.1, y)
  ctx.globalAlpha = 1
}

// object-fit: cover for an image into a box
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const ir = img.width / img.height, br = w / h
  let sw = img.width, sh = img.height, sx = 0, sy = 0
  if (ir > br) { sw = img.height * br; sx = (img.width - sw) / 2 } else { sh = img.width / br; sy = (img.height - sh) / 2 }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

// Author name + school are intentionally NOT drawn on posters — kept as a
// no-op so the templates' call sites don't need touching.
function authorRow(_ctx: CanvasRenderingContext2D, _d: PosterData, _x: number, _y: number, _accent: string, _light = false) {
  /* removed: avatar / name / school */
}

function chip(ctx: CanvasRenderingContext2D, label: string, x: number, y: number, accent: string) {
  ctx.font = `700 24px ${MONO}`; const w = ctx.measureText(label).width + 48
  rrect(ctx, x, y, w, 48, 24); ctx.fillStyle = accent + '26'; ctx.fill(); ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.stroke()
  ctx.fillStyle = accent; ctx.fillText(label, x + 24, y + 31); return w
}

function footer(ctx: CanvasRenderingContext2D, W: number, H: number, accent: string, _light = false) {
  // Just the accent base bar — no link / handle text.
  ctx.fillStyle = accent; ctx.fillRect(0, H - 12, W, 12)
}

function sticker(ctx: CanvasRenderingContext2D, label: string, cx: number, cy: number, color: string, rot: number) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot)
  ctx.font = `900 26px ${DISPLAY}`; const w = ctx.measureText(label).width + 36
  rrect(ctx, -w / 2, -26, w, 52, 14); ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke()
  ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText(label, 0, 9); ctx.textAlign = 'left'; ctx.restore()
}

// ── Random vector flourishes ────────────────────────────────────────────────
// A pool of small marks scattered into the margins each render (seeded, so a
// given seed reproduces). Drawn before the headline → never hurt legibility.
type C2D = CanvasRenderingContext2D
function vRing(ctx: C2D, x: number, y: number, rad: number, color: string, lw: number, a: number) { ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.stroke(); ctx.restore() }
function vConcentric(ctx: C2D, x: number, y: number, color: string, a: number) { for (let i = 1; i <= 3; i++) vRing(ctx, x, y, i * 14, color, 2.5, a) }
function vDisc(ctx: C2D, x: number, y: number, rad: number, color: string, a: number) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill(); ctx.restore() }
function vPlus(ctx: C2D, x: number, y: number, sz: number, color: string, a: number) { ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.lineWidth = Math.max(3, sz * 0.2); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - sz, y); ctx.lineTo(x + sz, y); ctx.moveTo(x, y - sz); ctx.lineTo(x, y + sz); ctx.stroke(); ctx.restore() }
function vCross(ctx: C2D, x: number, y: number, sz: number, color: string, a: number) { ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.lineWidth = Math.max(3, sz * 0.2); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - sz, y - sz); ctx.lineTo(x + sz, y + sz); ctx.moveTo(x + sz, y - sz); ctx.lineTo(x - sz, y + sz); ctx.stroke(); ctx.restore() }
function vTriangle(ctx: C2D, x: number, y: number, sz: number, color: string, a: number) { ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.lineWidth = 3.5; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(x, y - sz); ctx.lineTo(x + sz * 0.92, y + sz * 0.7); ctx.lineTo(x - sz * 0.92, y + sz * 0.7); ctx.closePath(); ctx.stroke(); ctx.restore() }
function vArrow(ctx: C2D, x: number, y: number, len: number, ang: number, color: string, a: number) { ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(ang); ctx.strokeStyle = color; ctx.lineWidth = 4.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-len / 2, 0); ctx.lineTo(len / 2, 0); ctx.moveTo(len / 2 - 13, -10); ctx.lineTo(len / 2, 0); ctx.lineTo(len / 2 - 13, 10); ctx.stroke(); ctx.restore() }
function vSquiggle(ctx: C2D, x: number, y: number, w: number, color: string, a: number) { ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.lineWidth = 4.5; ctx.lineCap = 'round'; ctx.beginPath(); const seg = w / 4; for (let i = 0; i <= w; i += 2) { const yy = y + Math.sin((i / seg) * Math.PI) * 9; i === 0 ? ctx.moveTo(x + i, yy) : ctx.lineTo(x + i, yy) } ctx.stroke(); ctx.restore() }
function vDashes(ctx: C2D, x: number, y: number, color: string, a: number) { ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.lineCap = 'round'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x + i * 18, y); ctx.lineTo(x + i * 18 + 10, y); ctx.stroke() } ctx.restore() }
function vDots(ctx: C2D, x: number, y: number, color: string, a: number, r: Rng) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = color; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(x + rrange(r, -24, 24), y + rrange(r, -24, 24), rrange(r, 3, 6), 0, Math.PI * 2); ctx.fill() } ctx.restore() }
function vChevron(ctx: C2D, x: number, y: number, sz: number, color: string, a: number) { ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.lineWidth = 4.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; for (let k = 0; k < 2; k++) { const ox = x + k * sz * 0.7 - sz * 0.35; ctx.beginPath(); ctx.moveTo(ox, y - sz * 0.6); ctx.lineTo(ox + sz * 0.5, y); ctx.lineTo(ox, y + sz * 0.6); ctx.stroke() } ctx.restore() }

// One or two small marks tucked into the outer margins — just enough texture,
// not the confetti it was. Drawn before the headline so legibility is fine.
function decorate(ctx: C2D, W: number, H: number, r: Rng, accent: string, dark = true) {
  const palette = dark ? [accent, WHITE] : [INK]
  const zones: number[][] = [
    [60, W - 60, 80, H * 0.18],
    [60, W - 60, H * 0.82, H - 80],
    [44, 120, H * 0.28, H * 0.72],
    [W - 120, W - 44, H * 0.28, H * 0.72],
  ]
  const n = Math.floor(r() * 2.4) // 0, 1, or 2 (2 least likely)
  for (let i = 0; i < n; i++) {
    const z = pick(r, zones)
    const x = rrange(r, z[0], z[1]), y = rrange(r, z[2], z[3])
    const c = pick(r, palette), a = rrange(r, 0.25, 0.5), sz = rrange(r, 16, 30)
    switch (Math.floor(r() * 11)) {
      case 0: vRing(ctx, x, y, sz, c, 3, a); break
      case 1: vConcentric(ctx, x, y, c, a); break
      case 2: vDisc(ctx, x, y, sz * 0.4, c, a); break
      case 3: vPlus(ctx, x, y, sz, c, a); break
      case 4: vCross(ctx, x, y, sz, c, a); break
      case 5: vTriangle(ctx, x, y, sz, c, a); break
      case 6: vArrow(ctx, x, y, sz * 1.7, rrange(r, -0.6, 0.6), c, a); break
      case 7: vSquiggle(ctx, x, y, sz * 2, c, a); break
      case 8: vDashes(ctx, x, y, c, a); break
      case 9: vDots(ctx, x, y, c, a, r); break
      default: vChevron(ctx, x, y, sz, c, a)
    }
  }
}

// 1–2 random stickers tossed into a corner each render.
function scatterStickers(ctx: C2D, W: number, H: number, r: Rng) {
  const spots: number[][] = [[W - 150, 156], [156, H - 170], [W - 160, H - 200], [180, 210]]
  const n = 1 + Math.floor(r() * 2)
  for (let i = 0; i < n; i++) {
    const s = pick(r, spots)
    sticker(ctx, pick(r, STICKERS), s[0], s[1], pick(r, ACCENTS), rrange(r, -0.22, 0.22))
  }
}

// ── Background colour variation ──────────────────────────────────────────────
// A rolled dark field: flat ink, a soft accent glow, or a vertical gradient into
// a deep accent tint. Gives each render a different colour mood.
function darkBg(ctx: C2D, W: number, H: number, accent: string, r: Rng) {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H)
  const m = r()
  if (m < 0.42) return
  if (m < 0.72) {
    const gx = rrange(r, W * 0.2, W * 0.8), gy = rrange(r, H * 0.12, H * 0.5)
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, W * 0.95)
    g.addColorStop(0, accent + '26'); g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, INK); g.addColorStop(1, accent + '22')
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
  }
}

// A rolled bright field for the flood template: solid accent, a diagonal
// accent→accent2 gradient, or a two-tone horizontal split.
function accentBg(ctx: C2D, W: number, H: number, accent: string, accent2: string, r: Rng) {
  const m = r()
  if (m < 0.5) { ctx.fillStyle = accent; ctx.fillRect(0, 0, W, H) }
  else if (m < 0.8) {
    const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, accent); g.addColorStop(1, accent2)
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
  } else {
    ctx.fillStyle = accent; ctx.fillRect(0, 0, W, H)
    const sy = Math.round(rrange(r, H * 0.56, H * 0.7)); ctx.fillStyle = accent2; ctx.fillRect(0, sy, W, H - sy)
  }
}

// ── Templates ────────────────────────────────────────────────────────────────
// Each receives the ctx, dimensions, the post data, an accent colour, a second
// accent (for two-colour schemes), the RNG, and (optionally) a pre-loaded photo.
// They are written proportionally so the same template reads at both 4:5 and 9:16.

type TemplateCtx = { ctx: CanvasRenderingContext2D; W: number; H: number; d: PosterData; accent: string; accent2: string; r: Rng; img: HTMLImageElement | null }

// T1 — INK QUOTE: near-black field, grid, big white headline centred, accent bars.
function tInkQuote({ ctx, W, H, d, accent, accent2, r }: TemplateCtx) {
  darkBg(ctx, W, H, accent, r)
  if (chance(r, 0.85)) grid(ctx, W, H)
  // two-tone top rule: accent + a slim accent2 segment
  ctx.fillStyle = accent; ctx.fillRect(0, 0, W, 12); ctx.fillStyle = accent2; ctx.fillRect(0, 0, Math.round(W * 0.3), 12)
  logo(ctx, 72, 116, accent)
  // Measure in the chip's own font (700 24px MONO) so the right-aligned x matches
  // the width chip() actually draws — otherwise the chip clips or floats.
  const catLabel = (d.category || 'general').toUpperCase()
  ctx.font = `700 24px ${MONO}`
  chip(ctx, catLabel, W - 72 - (ctx.measureText(catLabel).width + 48), 76, accent)
  if (chance(r, 0.7)) star(ctx, W - 120, H * 0.34, rrange(r, 70, 100), accent, 0.6, rrange(r, -0.3, 0.3))
  star(ctx, 90, H - 240, rrange(r, 40, 60), pick(r, ACCENTS), 0.4)
  decorate(ctx, W, H, r, accent)
  scatterStickers(ctx, W, H, r)

  const body = (d.body || 'AquaTerra community update').slice(0, 240)
  const { size, lines, font, lhMul } = fitHeadline(ctx, body, W - 160, H > 1600 ? 7 : 5, H > 1600 ? 96 : 84, 44, r)
  const lh = size * 1.16 * lhMul
  const blockH = lines.length * lh
  const top = (H - blockH) / 2 - 40
  ctx.font = font; ctx.fillStyle = WHITE
  drawLines(ctx, lines, 80, top, lh)
  ctx.fillStyle = accent; ctx.fillRect(80, top + blockH + 24, 120, 10)
  ctx.fillStyle = accent2; ctx.fillRect(80 + 132, top + blockH + 24, 40, 10)

  authorRow(ctx, d, 80, H - 150, accent)
  footer(ctx, W, H, accent)
}

// T2 — ACCENT FLOOD: full accent background, ink type, giant star watermark.
function tAccentFlood({ ctx, W, H, d, accent, accent2, r }: TemplateCtx) {
  accentBg(ctx, W, H, accent, accent2, r)
  star(ctx, W * rrange(r, 0.7, 0.9), H * rrange(r, 0.16, 0.28), rrange(r, 240, 340), INK, 0.07, rrange(r, -0.4, 0.4))
  ctx.fillStyle = INK; ctx.fillRect(0, 0, W, 14); ctx.fillRect(0, H - 14, W, 14)
  // A saturated accent flood counts as "dark/colored" per brand law, same as
  // ink-dark — it still needs a cream pill, not the bare no-pill treatment.
  logo(ctx, 72, 120, accent)
  sticker(ctx, pick(r, STICKERS), W - 150, 130, INK, rrange(r, -0.18, 0.18))
  ctx.fillStyle = INK; ctx.globalAlpha = 0.5; ctx.font = `700 24px ${MONO}`
  ctx.fillText((d.category || 'general').toUpperCase(), 76, 200); ctx.globalAlpha = 1
  decorate(ctx, W, H, r, accent, false)

  const body = (d.body || 'AquaTerra').slice(0, 220)
  const { size, lines, font, lhMul } = fitHeadline(ctx, body, W - 150, H > 1600 ? 7 : 5, H > 1600 ? 104 : 92, 46, r)
  const lh = size * 1.12 * lhMul; const blockH = lines.length * lh
  const top = (H - blockH) / 2 - 10
  ctx.font = font; ctx.fillStyle = INK
  drawLines(ctx, lines, 76, top, lh)
  // ink underline
  ctx.fillStyle = INK; ctx.fillRect(76, top + blockH + 22, 160, 12)

  authorRow(ctx, d, 76, H - 150, WHITE, true)
}

// T3 — CARD STACK: ink field with a raised card holding the quote + stickers.
function tCardStack({ ctx, W, H, d, accent, accent2, r }: TemplateCtx) {
  darkBg(ctx, W, H, accent, r); grid(ctx, W, H, 0.05)
  decorate(ctx, W, H, r, accent)
  ctx.fillStyle = accent; ctx.fillRect(0, 0, W, 12); ctx.fillStyle = accent2; ctx.fillRect(0, H - 12, W, 12)
  logo(ctx, 72, 116, accent)
  const cx = 56, cw = W - 112, cy = 220, ch = H - 220 - 180
  rrect(ctx, cx, cy, cw, ch, 36); ctx.fillStyle = CARD; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.09)'; ctx.lineWidth = 2; ctx.stroke()
  // accent tab
  rrect(ctx, cx + 40, cy - 26, 220, 54, 27); ctx.fillStyle = accent; ctx.fill()
  ctx.font = `900 26px ${DISPLAY}`; ctx.fillStyle = INK; ctx.fillText((d.category || 'GENERAL').toUpperCase().slice(0, 14), cx + 64, cy + 9)

  const body = (d.body || 'AquaTerra community update').slice(0, 230)
  const { size, lines, font, lhMul } = fitHeadline(ctx, body, cw - 110, H > 1600 ? 7 : 5, H > 1600 ? 80 : 72, 40, r)
  const lh = size * 1.18 * lhMul; const blockH = lines.length * lh
  ctx.font = font; ctx.fillStyle = WHITE
  drawLines(ctx, lines, cx + 55, cy + 130, lh)
  ctx.fillStyle = accent; ctx.fillRect(cx + 55, cy + 130 + blockH + 6, 110, 9)
  authorRow(ctx, d, cx + 55, cy + ch - 70, accent)

  // playful corner stickers
  sticker(ctx, pick(r, STICKERS), cx + cw - 80, cy + 40, pick(r, ACCENTS), rrange(r, 0.08, 0.3))
  if (chance(r, 0.6)) star(ctx, cx + 70, cy + ch + 90, 44, accent, 0.6)
  footer(ctx, W, H, accent)
}

// P1 — FULL-BLEED PHOTO: image covers the canvas, gradient scrim, text on top.
function pFullBleed({ ctx, W, H, d, accent, accent2, r, img }: TemplateCtx) {
  if (img) drawCover(ctx, img, 0, 0, W, H); else { ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H) }
  // top + bottom scrims for legibility
  let g = ctx.createLinearGradient(0, 0, 0, H * 0.3); g.addColorStop(0, 'rgba(0,0,0,0.7)'); g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H * 0.3)
  g = ctx.createLinearGradient(0, H * 0.42, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.92)')
  ctx.fillStyle = g; ctx.fillRect(0, H * 0.42, W, H * 0.58)
  ctx.fillStyle = accent; ctx.fillRect(0, 0, W, 12); ctx.fillStyle = accent2; ctx.fillRect(0, H - 12, W, 12)

  logo(ctx, 72, 116, accent, 50, false, 'photo')
  chip(ctx, (d.category || 'general').toUpperCase(), 72, 150, accent)
  scatterStickers(ctx, W, H, r)

  const body = (d.body || '').slice(0, 180)
  const { size, lines, font, lhMul } = fitHeadline(ctx, body, W - 150, 4, H > 1600 ? 92 : 84, 46, r)
  const lh = size * 1.14 * lhMul; const blockH = lines.length * lh
  const top = H - 150 - blockH - 90
  ctx.font = font; ctx.fillStyle = WHITE
  drawLines(ctx, lines, 76, top, lh)
  ctx.fillStyle = accent; ctx.fillRect(76, top + blockH + 18, 120, 10)
  authorRow(ctx, d, 76, H - 150, accent)
  footer(ctx, W, H, accent)
}

// P2 — POLAROID FRAME: photo in a tilted white frame on an ink/grid field.
function pPolaroid({ ctx, W, H, d, accent, accent2, r, img }: TemplateCtx) {
  darkBg(ctx, W, H, accent, r); grid(ctx, W, H, 0.05)
  ctx.fillStyle = accent; ctx.fillRect(0, 0, W, 12); ctx.fillStyle = accent2; ctx.fillRect(0, H - 12, W, 12)
  logo(ctx, 72, 112, accent)
  star(ctx, W - 110, H * 0.2, 70, accent, 0.5)
  scatterStickers(ctx, W, H, r)

  const fw = W * 0.74, ph = fw * (H > 1600 ? 1 : 0.82), pad = 34
  const fx = (W - fw) / 2, fy = H * (H > 1600 ? 0.2 : 0.16)
  ctx.save(); ctx.translate(fx + fw / 2, fy + (ph + pad * 2) / 2); ctx.rotate(rrange(r, -0.05, 0.05)); ctx.translate(-(fx + fw / 2), -(fy + (ph + pad * 2) / 2))
  // Hard-offset shadow (brand law) in place of a soft blur.
  hardShadow(ctx, fx, fy, fw, ph + pad * 2 + 56, 14, INK, 10)
  rrect(ctx, fx, fy, fw, ph + pad * 2 + 56, 14); ctx.fillStyle = WHITE; ctx.fill()
  if (img) drawCover(ctx, img, fx + pad, fy + pad, fw - pad * 2, ph); else { ctx.fillStyle = '#e8e8e8'; ctx.fillRect(fx + pad, fy + pad, fw - pad * 2, ph) }
  ctx.font = `700 26px ${MONO}`; ctx.fillStyle = INK; ctx.textAlign = 'center'
  ctx.fillText((d.category || 'aquaterra').toLowerCase(), fx + fw / 2, fy + pad + ph + 42); ctx.textAlign = 'left'
  ctx.restore()

  const body = (d.body || '').slice(0, 150)
  const { size, lines, font, lhMul } = fitHeadline(ctx, body, W - 160, 3, 72, 40, r)
  const lh = size * 1.16 * lhMul; const blockH = lines.length * lh
  const top = fy + ph + pad * 2 + 120
  ctx.font = font; ctx.fillStyle = WHITE
  drawLines(ctx, lines, 80, top, lh, 'left')
  ctx.fillStyle = accent; ctx.fillRect(80, top + blockH + 16, 100, 9)
  authorRow(ctx, d, 80, H - 150, accent)
  footer(ctx, W, H, accent)
}

// P3 — SPLIT: photo on top, accent/ink panel with the quote below.
function pSplit({ ctx, W, H, d, accent, accent2, r, img }: TemplateCtx) {
  const splitY = Math.round(H * (H > 1600 ? 0.52 : 0.5))
  if (img) drawCover(ctx, img, 0, 0, W, splitY); else { ctx.fillStyle = CARD; ctx.fillRect(0, 0, W, splitY) }
  const lightPanel = chance(r, 0.5)
  ctx.fillStyle = lightPanel ? accent : INK; ctx.fillRect(0, splitY, W, H - splitY)
  if (!lightPanel) grid(ctx, W, H, 0.05)
  ctx.fillStyle = accent; ctx.fillRect(0, 0, W, 12); ctx.fillStyle = accent2; ctx.fillRect(0, H - 12, W, 12)
  // category chip straddling the seam
  const cl = (d.category || 'general').toUpperCase()
  ctx.font = `700 24px ${MONO}`; const cw = ctx.measureText(cl).width + 48
  rrect(ctx, 72, splitY - 24, cw, 48, 24); ctx.fillStyle = lightPanel ? INK : accent; ctx.fill()
  ctx.fillStyle = lightPanel ? accent : INK; ctx.fillText(cl, 72 + 24, splitY - 24 + 31)

  // Logo sits in the top panel — a real photo when one loaded, else a plain
  // CARD (white) fill, both of which want the ink pill (never no-pill,
  // since CARD white isn't the brand's cream paper).
  logo(ctx, 72, 110, accent, 50, false, 'photo')
  const onLight = lightPanel
  const body = (d.body || '').slice(0, 200)
  const { size, lines, font, lhMul } = fitHeadline(ctx, body, W - 160, 5, H > 1600 ? 84 : 76, 42, r)
  const lh = size * 1.15 * lhMul; const blockH = lines.length * lh
  const top = splitY + 90
  ctx.font = font; ctx.fillStyle = onLight ? INK : WHITE
  drawLines(ctx, lines, 80, top, lh)
  ctx.fillStyle = onLight ? INK : accent; ctx.fillRect(80, Math.min(top + blockH + 18, H - 230), 110, 9)
  authorRow(ctx, d, 80, H - 150, onLight ? WHITE : accent, onLight)
  footer(ctx, W, H, accent, onLight)
}

// T4 — MAGAZINE: masthead rules top & bottom, a giant centred headline between.
function tMagazine({ ctx, W, H, d, accent, accent2, r }: TemplateCtx) {
  const flood = chance(r, 0.42)
  if (flood) accentBg(ctx, W, H, accent, accent2, r); else { darkBg(ctx, W, H, accent, r); grid(ctx, W, H, 0.04) }
  const ink = flood
  const fg = ink ? INK : WHITE
  decorate(ctx, W, H, r, accent, flood)
  // top masthead
  ctx.font = `700 26px ${MONO}`; ctx.fillStyle = ink ? INK : accent
  ctx.fillText('AQUATERRA', 76, 128)
  ctx.textAlign = 'right'; ctx.fillStyle = fg
  ctx.fillText((d.category || 'JOURNAL').toUpperCase().slice(0, 18), W - 76, 128); ctx.textAlign = 'left'
  ctx.fillStyle = fg; ctx.fillRect(76, 150, W - 152, 4)

  const body = (d.body || 'AquaTerra').slice(0, 200)
  const { size, lines, font, lhMul } = fitHeadline(ctx, body, W - 152, H > 1600 ? 7 : 6, H > 1600 ? 126 : 112, 54, r)
  const lh = size * 1.0 * lhMul; const blockH = lines.length * lh
  const top = (H - blockH) / 2 + 10
  ctx.font = font; ctx.fillStyle = fg
  drawLines(ctx, lines, 76, top, lh)
  ctx.fillStyle = accent2; ctx.fillRect(76, top + blockH + 22, 140, 10)

  // bottom rule + wordmark — flood (accent) or dark are both "dark/colored"
  // per brand law, so both want the cream pill, never the no-pill treatment.
  ctx.fillStyle = fg; ctx.fillRect(76, H - 150, W - 152, 4)
  logo(ctx, 76, H - 56, accent)
  ctx.fillStyle = accent; ctx.fillRect(0, 0, W, 12)
}

// P4 — DUOTONE: photo pushed to a branded accent duotone, bold headline on top.
function pDuotone({ ctx, W, H, d, accent, accent2, r, img }: TemplateCtx) {
  if (img) drawCover(ctx, img, 0, 0, W, H); else { darkBg(ctx, W, H, accent, r) }
  // crush to near-mono, then tint with the accent via an overlay pass
  ctx.fillStyle = 'rgba(10,10,10,0.42)'; ctx.fillRect(0, 0, W, H)
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.5; ctx.fillStyle = accent; ctx.fillRect(0, 0, W, H); ctx.restore()
  const g = ctx.createLinearGradient(0, H * 0.45, 0, H)
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.92)')
  ctx.fillStyle = g; ctx.fillRect(0, H * 0.45, W, H * 0.55)
  ctx.fillStyle = accent; ctx.fillRect(0, 0, W, 12); ctx.fillStyle = accent2; ctx.fillRect(0, H - 12, W, 12)

  logo(ctx, 72, 116, accent, 50, false, img ? 'photo' : undefined)
  chip(ctx, (d.category || 'general').toUpperCase(), 72, 150, accent)
  scatterStickers(ctx, W, H, r)

  const body = (d.body || '').slice(0, 180)
  const { size, lines, font, lhMul } = fitHeadline(ctx, body, W - 150, 4, H > 1600 ? 96 : 88, 46, r)
  const lh = size * 1.12 * lhMul; const blockH = lines.length * lh
  const top = H - 150 - blockH - 70
  ctx.font = font; ctx.fillStyle = WHITE
  drawLines(ctx, lines, 76, top, lh)
  ctx.fillStyle = accent; ctx.fillRect(76, top + blockH + 18, 120, 10)
  footer(ctx, W, H, accent)
}

// A strip of washi tape — translucent, rotated, faint outline. Pure wonk.
function tape(ctx: C2D, cx: number, cy: number, rot: number, color: string) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot)
  ctx.globalAlpha = 0.62; ctx.fillStyle = color; ctx.fillRect(-56, -17, 112, 34)
  ctx.globalAlpha = 1; ctx.strokeStyle = 'rgba(0,0,0,0.16)'; ctx.lineWidth = 1.5; ctx.strokeRect(-56, -17, 112, 34)
  ctx.restore()
}

// T5 — RANSOM: cut-out word boxes in mixed fonts, colours and angles. Maximum wonk.
function tRansom({ ctx, W, H, d, accent, accent2, r }: TemplateCtx) {
  darkBg(ctx, W, H, accent, r); grid(ctx, W, H, 0.05)
  ctx.fillStyle = accent; ctx.fillRect(0, 0, W, 12); ctx.fillStyle = accent2; ctx.fillRect(0, H - 12, W, 12)
  logo(ctx, 72, 116, accent)
  const words = (d.body || 'AquaTerra community update').toUpperCase().replace(/\s+/g, ' ').trim().split(' ').slice(0, 13)
  const fonts = [DISPLAY, SERIF, MONO]
  const cols = [MINT, LEMON, PINK, TOMATO, SKY, GRAPE, WHITE]
  ctx.textBaseline = 'middle'
  let x = 84, y = H * 0.32, lineH = 0
  for (const w of words) {
    const fs = Math.round(rrange(r, 46, 90))
    ctx.font = `900 ${fs}px ${pick(r, fonts)}`
    const tw = ctx.measureText(w).width
    const padX = 16, padY = 10
    const bw = tw + padX * 2, bh = fs + padY * 2
    if (x + bw > W - 84) { x = 84; y += lineH + 20; lineH = 0 }
    ctx.save()
    ctx.translate(x + bw / 2, y); ctx.rotate(rrange(r, -0.13, 0.13))
    rrect(ctx, -bw / 2, -bh / 2, bw, bh, 8); ctx.fillStyle = pick(r, cols); ctx.fill()
    ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke()
    ctx.fillStyle = INK; ctx.fillText(w, -tw / 2, 2)
    ctx.restore()
    x += bw + 16; lineH = Math.max(lineH, bh)
  }
  ctx.textBaseline = 'alphabetic'
  scatterStickers(ctx, W, H, r)
  footer(ctx, W, H, accent)
}

// P5 — SCRAPBOOK: a tilted taped photo, overlapping stickers + a star, headline below.
function pScrapbook({ ctx, W, H, d, accent, accent2, r, img }: TemplateCtx) {
  darkBg(ctx, W, H, accent, r); grid(ctx, W, H, 0.05)
  ctx.fillStyle = accent; ctx.fillRect(0, 0, W, 12); ctx.fillStyle = accent2; ctx.fillRect(0, H - 12, W, 12)
  logo(ctx, 72, 116, accent)
  const fw = W * 0.64, fh = fw * 0.92, pad = 26
  const fx = (W - fw) / 2 + rrange(r, -26, 26), fy = H * 0.19
  ctx.save()
  ctx.translate(fx + fw / 2, fy + fh / 2); ctx.rotate(rrange(r, -0.08, 0.08)); ctx.translate(-(fx + fw / 2), -(fy + fh / 2))
  // Hard-offset shadow (brand law) in place of a soft blur.
  hardShadow(ctx, fx, fy, fw, fh + 64, 10, INK, 10)
  rrect(ctx, fx, fy, fw, fh + 64, 10); ctx.fillStyle = WHITE; ctx.fill()
  if (img) drawCover(ctx, img, fx + pad, fy + pad, fw - pad * 2, fh - pad); else { ctx.fillStyle = '#e8e8e8'; ctx.fillRect(fx + pad, fy + pad, fw - pad * 2, fh - pad) }
  tape(ctx, fx + 44, fy + 4, -0.5, accent); tape(ctx, fx + fw - 44, fy + 4, 0.5, LEMON)
  ctx.font = `italic 400 42px ${SERIF}`; ctx.fillStyle = INK; ctx.textAlign = 'center'
  ctx.fillText((d.category || 'on the ground').toLowerCase().slice(0, 22), fx + fw / 2, fy + fh + 38); ctx.textAlign = 'left'
  ctx.restore()
  star(ctx, W - 128, fy + 24, rrange(r, 48, 66), accent, 0.9, rrange(r, -0.3, 0.3))
  sticker(ctx, pick(r, STICKERS), 158, fy + fh + 46, pick(r, ACCENTS), rrange(r, -0.32, 0.0))
  sticker(ctx, pick(r, STICKERS), W - 190, fy + fh + 92, pick(r, ACCENTS), rrange(r, 0.08, 0.4))
  const body = (d.body || '').slice(0, 120)
  const { size, lines, font, lhMul } = fitHeadline(ctx, body, W - 160, 3, 74, 40, r)
  const lh = size * 1.12 * lhMul; const blockH = lines.length * lh
  const top = fy + fh + 160
  ctx.font = font; ctx.fillStyle = WHITE
  drawLines(ctx, lines, 80, top, lh)
  ctx.fillStyle = accent; ctx.fillRect(80, top + blockH + 14, 100, 9)
  footer(ctx, W, H, accent)
}

const TYPO_TEMPLATES = [tInkQuote, tAccentFlood, tCardStack, tMagazine, tRansom]
const PHOTO_TEMPLATES = [pFullBleed, pPolaroid, pSplit, pDuotone, pScrapbook]

// ── Image loading (CORS-safe; falls back to typographic on failure) ──────────
function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise(resolve => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    let settled = false
    const done = (v: HTMLImageElement | null) => { if (!settled) { settled = true; resolve(v) } }
    img.onload = () => done(img)
    img.onerror = () => done(null)
    setTimeout(() => done(null), 7000)
    img.src = url
  })
}

// Load the nav logo once and cache it (same-origin → no canvas taint). The
// promise is cached so concurrent generate calls all await the same load.
let logoPromise: Promise<void> | null = null
function loadLogo(): Promise<void> {
  if (!logoPromise) logoPromise = loadImage('/logo.png').then(im => { logoImgCache = im })
  return logoPromise
}

export interface PosterResult { dataUrl: string; template: string; format: PosterFormat; usedPhoto: boolean }

const TEMPLATE_NAMES = new Map<Function, string>([
  [tInkQuote, 'Ink Quote'], [tAccentFlood, 'Accent Flood'], [tCardStack, 'Card Stack'], [tMagazine, 'Magazine'], [tRansom, 'Ransom'],
  [pFullBleed, 'Full-bleed Photo'], [pPolaroid, 'Polaroid'], [pSplit, 'Split'], [pDuotone, 'Duotone'], [pScrapbook, 'Scrapbook'],
])

// Generate one poster. `seed` makes the random pick reproducible if supplied;
// omit it (or pass a fresh value) to get a brand-new design each call.
export async function generatePoster(d: PosterData, format: PosterFormat, seed?: number): Promise<PosterResult> {
  await Promise.all([document.fonts?.ready ?? Promise.resolve(), loadLogo()])
  // No emojis on graphics — brand law. Real post bodies routinely start with
  // one (💌🐾🛡️); strip it here, once, rather than at every template call site.
  d = { ...d, body: d.body ? stripEmoji(d.body) : d.body }
  const s = seed ?? Math.floor(Math.random() * 0xffffffff)
  const r = mulberry32(s)

  const W = 1080
  const H = format === 'post' ? 1440 : 1920

  // Load the photo up front (if any). Tainted/blocked images resolve null and
  // we silently use a typographic template instead.
  const img = d.imageUrl ? await loadImage(d.imageUrl) : null

  // Accent: usually the category colour, sometimes a random brand accent — both
  // are on-brand, and the mix keeps "every time" feeling fresh. accent2 is a
  // distinct brand accent for two-colour schemes (gradients, splits, bars).
  const accent = chance(r, 0.5) ? catColor(d.category) : pick(r, ACCENTS)
  const accent2 = pick(r, ACCENTS.filter(a => a !== accent))

  // Template pool: with a usable photo, weight toward photo templates but keep a
  // typographic option in the mix. Without one, typography only.
  let template
  if (img) template = chance(r, 0.72) ? pick(r, PHOTO_TEMPLATES) : pick(r, TYPO_TEMPLATES)
  else template = pick(r, TYPO_TEMPLATES)

  const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'
  ctx.textBaseline = 'alphabetic'
  template({ ctx, W, H, d, accent, accent2, r, img })

  let dataUrl: string
  try {
    dataUrl = canvas.toDataURL('image/png')
  } catch {
    // Canvas tainted (CORS) — redraw without the photo and export clean.
    ctx.clearRect(0, 0, W, H)
    const fallback = pick(mulberry32(s + 1), TYPO_TEMPLATES)
    fallback({ ctx, W, H, d, accent, accent2, r: mulberry32(s + 1), img: null })
    dataUrl = canvas.toDataURL('image/png')
    return { dataUrl, template: TEMPLATE_NAMES.get(fallback) || 'Typographic', format, usedPhoto: false }
  }

  return { dataUrl, template: TEMPLATE_NAMES.get(template) || 'Poster', format, usedPhoto: img !== null && PHOTO_TEMPLATES.includes(template as any) }
}

export function downloadPoster(dataUrl: string, filename: string) {
  const a = document.createElement('a'); a.href = dataUrl; a.download = filename
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
}

// ── Shared brand kit ─────────────────────────────────────────────────────────
// The same palette + canvas primitives the poster templates use, re-exported so
// the project carousel generator draws in the identical visual language without
// duplicating any of it. Internal — consumed only by carouselGenerator.ts.
export const brandKit = {
  // palette + type
  CREAM, CREAM2, CREAM3, MINT, LEMON, PINK, TOMATO, SKY, GRAPE, INK, INK2, WHITE, CARD,
  ACCENTS, POPS, POP_MINT, POP_PINK, POP_LEMON, POP_ORANGE, POP_SKY, POP_GRAPE,
  DISPLAY, MONO, SERIF, EINA, catColor, inkTextOn,
  // rng
  mulberry32, pick, rrange, chance,
  // primitives
  grid, star, rrect, layoutLines, fitHeadline, drawLines, logo, drawCover,
  chip, sticker, decorate, scatterStickers, darkBg, accentBg, creamBg, hardShadow, stripEmoji,
  // assets
  loadImage, loadLogo,
}
