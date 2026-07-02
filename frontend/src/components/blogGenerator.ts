// ── AquaTerra blog-graphic generator ─────────────────────────────────────────
// Turns a blog post into a shareable Instagram graphic (Post 1080×1440 or Story
// 1080×1920) in the brand language — same palette, type, grid, logo badge and
// background/accent variation as the poster studio (all reused from
// posterGenerator's brandKit). Uses the blog's title, header image, writer name
// and read time, and always ends on a "READ NOW · ngoaquaterra.com/blogs" CTA.
// Every call rolls a random template + accent + decoration, so a post yields a
// fresh design each time ("regenerate" = new seed).

import { brandKit, type Rng } from './posterGenerator'

const {
  INK, WHITE, ACCENTS, DISPLAY, MONO, SERIF, catColor,
  mulberry32, pick, rrange, chance,
  grid, star, rrect, fitHeadline, drawLines, logo, drawCover,
  decorate, darkBg, accentBg, loadImage, loadLogo,
} = brandKit

const READ_URL = 'ngoaquaterra.com/blogs'
const KICKERS = ['GROUNDWORK DIARIES', 'AQUATERRA BLOG', 'FROM THE FIELD', 'STUDENT JOURNAL']

export type BlogFormat = 'post' | 'story'
export interface BlogData {
  title: string
  author?: string | null
  readMinutes?: number | null
  imageUrl?: string | null
  category?: string
  slug?: string
}
export interface BlogResult { dataUrl: string; template: string; format: BlogFormat; usedPhoto: boolean }

type C2D = CanvasRenderingContext2D
type Ctx = { ctx: C2D; W: number; H: number; d: BlogData; accent: string; accent2: string; r: Rng; img: HTMLImageElement | null }

// ── Shared chrome ─────────────────────────────────────────────────────────────

// "by Writer · 6 min read" byline.
function byline(d: BlogData): string {
  const bits: string[] = []
  if (d.author) bits.push('by ' + d.author)
  if (d.readMinutes) bits.push(`${d.readMinutes} min read`)
  return bits.join('   ·   ')
}

// The call-to-action band, pinned to the bottom. `light` = sits on a light panel.
function ctaBar(ctx: C2D, W: number, H: number, accent: string, r: Rng) {
  const h = 132
  const y = H - h
  // a few rolled looks so the CTA isn't always identical
  const m = r()
  if (m < 0.5) { ctx.fillStyle = accent; ctx.fillRect(0, y, W, h) }
  else { const g = ctx.createLinearGradient(0, y, W, y); g.addColorStop(0, accent); g.addColorStop(1, accent); ctx.fillStyle = g; ctx.fillRect(0, y, W, h) }
  ctx.fillStyle = INK
  ctx.font = `900 44px ${DISPLAY}`
  ctx.fillText('READ NOW', 76, y + 56)
  // arrow
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  const ax = 76 + ctx.measureText('READ NOW').width + 26, ay = y + 41
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + 40, ay); ctx.moveTo(ax + 24, ay - 14); ctx.lineTo(ax + 40, ay); ctx.lineTo(ax + 24, ay + 14); ctx.stroke()
  ctx.font = `700 30px ${MONO}`
  ctx.fillStyle = INK; ctx.globalAlpha = 0.8
  ctx.fillText(READ_URL, 76, y + 100); ctx.globalAlpha = 1
}

function kicker(ctx: C2D, text: string, x: number, y: number, color: string) {
  ctx.font = `700 26px ${MONO}`; ctx.fillStyle = color
  ctx.fillText(text, x, y)
}

// "min read" pill / tag.
function readTag(ctx: C2D, label: string, x: number, y: number, accent: string) {
  ctx.font = `800 24px ${DISPLAY}`
  const w = ctx.measureText(label).width + 40
  rrect(ctx, x, y, w, 46, 23); ctx.fillStyle = accent; ctx.fill()
  ctx.fillStyle = INK; ctx.fillText(label, x + 20, y + 31)
  return w
}

function topScrim(ctx: C2D, W: number, H: number, to = 0.34) {
  const g = ctx.createLinearGradient(0, 0, 0, H * to)
  g.addColorStop(0, 'rgba(0,0,0,0.66)'); g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H * to)
}
function bottomScrim(ctx: C2D, W: number, H: number, from = 0.4) {
  const g = ctx.createLinearGradient(0, H * from, 0, H)
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.94)')
  ctx.fillStyle = g; ctx.fillRect(0, H * from, W, H * (1 - from))
}

// ── Templates ─────────────────────────────────────────────────────────────────

// IMAGE HERO — featured image full-bleed, title over a bottom scrim, CTA band.
function bImageHero({ ctx, W, H, d, accent, accent2, r, img }: Ctx) {
  if (img) drawCover(ctx, img, 0, 0, W, H); else darkBg(ctx, W, H, accent, r)
  topScrim(ctx, W, H, 0.3)
  bottomScrim(ctx, W, H, 0.34)
  ctx.fillStyle = accent; ctx.fillRect(0, 0, W, 12)
  logo(ctx, 72, 120, accent)
  kicker(ctx, pick(r, KICKERS), 76, 190, accent)

  const ctaH = 132
  const title = (d.title || 'AquaTerra journal').slice(0, 150)
  const { size, lines, font, lhMul } = fitHeadline(ctx, title, W - 150, H > 1600 ? 6 : 5, H > 1600 ? 100 : 92, 46, r)
  const lh = size * 1.05 * lhMul
  const blockH = lines.length * lh
  const top = H - ctaH - 70 - blockH - (d.author || d.readMinutes ? 56 : 0)
  ctx.font = font; ctx.fillStyle = WHITE
  drawLines(ctx, lines, 76, top, lh)
  ctx.fillStyle = accent; ctx.fillRect(76, top + blockH + 20, 120, 9)
  ctx.fillStyle = accent2; ctx.fillRect(76 + 132, top + blockH + 20, 40, 9)
  const bl = byline(d)
  if (bl) { ctx.font = `700 28px ${MONO}`; ctx.fillStyle = 'rgba(255,255,255,0.82)'; ctx.fillText(bl.slice(0, 52), 76, top + blockH + 78) }

  ctaBar(ctx, W, H, accent, r)
}

// SPLIT — image on top, accent/ink panel below holding title + meta, CTA band.
function bSplit({ ctx, W, H, d, accent, accent2, r, img }: Ctx) {
  const splitY = Math.round(H * (H > 1600 ? 0.5 : 0.46))
  if (img) drawCover(ctx, img, 0, 0, W, splitY); else { darkBg(ctx, W, H, accent, r) }
  const light = chance(r, 0.45)
  ctx.fillStyle = light ? accent : INK; ctx.fillRect(0, splitY, W, H - splitY)
  if (!light) grid(ctx, W, H, 0.05)
  ctx.fillStyle = accent2; ctx.fillRect(0, splitY, W, 10)
  logo(ctx, 72, 120, accent)

  // read-time tag straddling the seam
  if (d.readMinutes) readTag(ctx, `${d.readMinutes} MIN READ`, 76, splitY - 23, accent2)
  kicker(ctx, pick(r, KICKERS), 76, splitY + 78, light ? INK : accent)

  const ctaH = 132
  const title = (d.title || 'AquaTerra journal').slice(0, 150)
  const { size, lines, font, lhMul } = fitHeadline(ctx, title, W - 150, 5, 84, 42, r)
  const lh = size * 1.08 * lhMul
  const top = splitY + 130
  ctx.font = font; ctx.fillStyle = light ? INK : WHITE
  drawLines(ctx, lines, 76, top, lh)
  const blockH = lines.length * lh
  if (d.author) { ctx.font = `italic 600 34px ${SERIF}`; ctx.fillStyle = light ? INK : 'rgba(255,255,255,0.85)'; ctx.fillText(('by ' + d.author).slice(0, 40), 76, Math.min(top + blockH + 50, H - ctaH - 50)) }

  ctaBar(ctx, W, H, accent, r)
}

// EDITORIAL — typographic, no photo needed: big serif title on a dark/accent
// field, blog tag, byline, CTA. The fallback when there's no header image.
function bEditorial({ ctx, W, H, d, accent, accent2, r }: Ctx) {
  const flood = chance(r, 0.4)
  if (flood) { accentBg(ctx, W, H, accent, accent2, r) } else { darkBg(ctx, W, H, accent, r); grid(ctx, W, H, 0.05) }
  const ink = flood
  decorate(ctx, W, H, r, accent, flood)
  if (!flood) star(ctx, W - 120, H * 0.22, rrange(r, 120, 170), accent, 0.14, rrange(r, -0.3, 0.3))
  ctx.fillStyle = accent; ctx.fillRect(0, 0, W, 12)
  logo(ctx, 72, 120, accent, 50, flood)
  kicker(ctx, pick(r, KICKERS), 76, 200, ink ? INK : accent)

  const ctaH = 132
  const title = (d.title || 'AquaTerra journal').slice(0, 160)
  const { size, lines, font, lhMul } = fitHeadline(ctx, title, W - 150, 7, H > 1600 ? 116 : 104, 50, r)
  const lh = size * 1.04 * lhMul
  const blockH = lines.length * lh
  const top = Math.max(280, (H - ctaH - blockH) / 2 - 30)
  ctx.font = font; ctx.fillStyle = ink ? INK : WHITE
  drawLines(ctx, lines, 76, top, lh)
  ctx.fillStyle = ink ? INK : accent; ctx.fillRect(76, top + blockH + 26, 130, 10)
  ctx.fillStyle = accent2; ctx.fillRect(76 + 142, top + blockH + 26, 42, 10)
  const bl = byline(d)
  if (bl) { ctx.font = `700 28px ${MONO}`; ctx.fillStyle = ink ? 'rgba(10,10,10,0.7)' : 'rgba(255,255,255,0.7)'; ctx.fillText(bl.slice(0, 52), 76, top + blockH + 84) }

  ctaBar(ctx, W, H, accent, r)
}

// CARD — image dimmed full-bleed, a raised card holds the title + meta, CTA band.
function bCard({ ctx, W, H, d, accent, r, img }: Ctx) {
  if (img) { drawCover(ctx, img, 0, 0, W, H); ctx.fillStyle = 'rgba(10,10,10,0.55)'; ctx.fillRect(0, 0, W, H) }
  else { darkBg(ctx, W, H, accent, r); grid(ctx, W, H, 0.05) }
  ctx.fillStyle = accent; ctx.fillRect(0, 0, W, 12)
  logo(ctx, 72, 120, accent)

  const ctaH = 132
  const cx = 56, cw = W - 112
  const title = (d.title || 'AquaTerra journal').slice(0, 150)
  ctx.font = `900 80px ${DISPLAY}`
  const { size, lines, font, lhMul } = fitHeadline(ctx, title, cw - 100, 6, 80, 44, r)
  const lh = size * 1.1 * lhMul
  const blockH = lines.length * lh
  const ch = blockH + 230
  const cy = (H - ctaH - ch) / 2 + 20
  rrect(ctx, cx, cy, cw, ch, 32); ctx.fillStyle = '#141414'; ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 2; ctx.stroke()
  // accent tab
  rrect(ctx, cx + 40, cy - 24, 250, 50, 25); ctx.fillStyle = accent; ctx.fill()
  ctx.font = `900 24px ${DISPLAY}`; ctx.fillStyle = INK; ctx.fillText(pick(r, KICKERS).slice(0, 18), cx + 62, cy + 8)

  ctx.font = font; ctx.fillStyle = WHITE
  drawLines(ctx, lines, cx + 50, cy + 110, lh)
  ctx.fillStyle = accent; ctx.fillRect(cx + 50, cy + 110 + blockH + 4, 110, 8)
  const bl = byline(d)
  if (bl) { ctx.font = `700 26px ${MONO}`; ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillText(bl.slice(0, 48), cx + 50, cy + ch - 36) }

  ctaBar(ctx, W, H, accent, r)
}

// Washi-tape strip — translucent, rotated, faint outline.
function tape(ctx: C2D, cx: number, cy: number, rot: number, color: string) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot)
  ctx.globalAlpha = 0.62; ctx.fillStyle = color; ctx.fillRect(-56, -17, 112, 34)
  ctx.globalAlpha = 1; ctx.strokeStyle = 'rgba(0,0,0,0.16)'; ctx.lineWidth = 1.5; ctx.strokeRect(-56, -17, 112, 34)
  ctx.restore()
}

// TAPED — header image in a tilted, taped scrapbook frame, title below, CTA band.
function bTaped({ ctx, W, H, d, accent, accent2, r, img }: Ctx) {
  darkBg(ctx, W, H, accent, r); grid(ctx, W, H, 0.05)
  ctx.fillStyle = accent; ctx.fillRect(0, 0, W, 12)
  logo(ctx, 72, 120, accent)
  kicker(ctx, pick(r, KICKERS), 76, 190, accent)

  const ctaH = 132
  const fw = W * 0.6, fh = fw * 0.82, pad = 24
  const fx = (W - fw) / 2, fy = 244
  ctx.save()
  ctx.translate(fx + fw / 2, fy + fh / 2); ctx.rotate(rrange(r, -0.06, 0.06)); ctx.translate(-(fx + fw / 2), -(fy + fh / 2))
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 20
  rrect(ctx, fx, fy, fw, fh + 56, 10); ctx.fillStyle = WHITE; ctx.fill(); ctx.shadowColor = 'transparent'
  if (img) drawCover(ctx, img, fx + pad, fy + pad, fw - pad * 2, fh - pad); else { ctx.fillStyle = '#e8e8e8'; ctx.fillRect(fx + pad, fy + pad, fw - pad * 2, fh - pad) }
  tape(ctx, fx + 40, fy + 2, -0.5, accent); tape(ctx, fx + fw - 40, fy + 2, 0.5, accent2)
  ctx.font = `italic 400 36px ${SERIF}`; ctx.fillStyle = INK; ctx.textAlign = 'center'
  ctx.fillText((d.author ? 'by ' + d.author : 'aquaterra').toLowerCase().slice(0, 28), fx + fw / 2, fy + fh + 32); ctx.textAlign = 'left'
  ctx.restore()
  star(ctx, W - 118, fy + 8, 54, accent, 0.9, rrange(r, -0.3, 0.3))

  const title = (d.title || 'AquaTerra journal').slice(0, 120)
  const { size, lines, font, lhMul } = fitHeadline(ctx, title, W - 150, 3, 76, 42, r)
  const lh = size * 1.08 * lhMul; const blockH = lines.length * lh
  const top = H - ctaH - 56 - blockH
  ctx.font = font; ctx.fillStyle = WHITE
  drawLines(ctx, lines, 76, top, lh)
  ctx.fillStyle = accent; ctx.fillRect(76, top + blockH + 18, 110, 9)
  ctaBar(ctx, W, H, accent, r)
}

// RANSOM — the title as cut-out word boxes, mixed fonts + angles, then the CTA.
function bRansom({ ctx, W, H, d, accent, accent2, r }: Ctx) {
  darkBg(ctx, W, H, accent, r); grid(ctx, W, H, 0.05)
  ctx.fillStyle = accent; ctx.fillRect(0, 0, W, 12); ctx.fillStyle = accent2; ctx.fillRect(0, 18, W * 0.32, 8)
  logo(ctx, 72, 120, accent)
  kicker(ctx, pick(r, KICKERS), 76, 206, accent)

  const words = (d.title || 'AquaTerra journal').toUpperCase().replace(/\s+/g, ' ').trim().split(' ').slice(0, 12)
  const fonts = [DISPLAY, SERIF, MONO]
  const cols = [...ACCENTS, WHITE]
  ctx.textBaseline = 'middle'
  let x = 84, y = 320, lineH = 0
  for (const w of words) {
    const fs = Math.round(rrange(r, 52, 96))
    ctx.font = `900 ${fs}px ${pick(r, fonts)}`
    const tw = ctx.measureText(w).width
    const padX = 16, padY = 10
    const bw = tw + padX * 2, bh = fs + padY * 2
    if (x + bw > W - 84) { x = 84; y += lineH + 22; lineH = 0 }
    ctx.save(); ctx.translate(x + bw / 2, y); ctx.rotate(rrange(r, -0.12, 0.12))
    rrect(ctx, -bw / 2, -bh / 2, bw, bh, 8); ctx.fillStyle = pick(r, cols); ctx.fill()
    ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke()
    ctx.fillStyle = INK; ctx.fillText(w, -tw / 2, 2); ctx.restore()
    x += bw + 16; lineH = Math.max(lineH, bh)
  }
  ctx.textBaseline = 'alphabetic'
  const bl = byline(d)
  if (bl) { ctx.font = `700 28px ${MONO}`; ctx.fillStyle = 'rgba(255,255,255,0.72)'; ctx.fillText(bl.slice(0, 52), 84, y + lineH / 2 + 64) }
  ctaBar(ctx, W, H, accent, r)
}

const PHOTO_TEMPLATES = [bImageHero, bSplit, bCard, bTaped]
const TYPO_TEMPLATES = [bEditorial, bRansom]
const NAMES = new Map<Function, string>([
  [bImageHero, 'Image Hero'], [bSplit, 'Split'], [bCard, 'Card'], [bEditorial, 'Editorial'],
  [bTaped, 'Taped'], [bRansom, 'Ransom'],
])

export async function generateBlogGraphic(d: BlogData, format: BlogFormat, seed?: number): Promise<BlogResult> {
  await Promise.all([document.fonts?.ready ?? Promise.resolve(), loadLogo()])
  const s = seed ?? Math.floor(Math.random() * 0xffffffff)
  const r = mulberry32(s)

  const W = 1080
  const H = format === 'post' ? 1440 : 1920

  const img = d.imageUrl ? await loadImage(d.imageUrl) : null
  const accent = chance(r, 0.5) ? catColor(d.category || 'content') : pick(r, ACCENTS)
  const accent2 = pick(r, ACCENTS.filter((a: string) => a !== accent))

  let template
  if (img) template = chance(r, 0.78) ? pick(r, PHOTO_TEMPLATES) : pick(r, TYPO_TEMPLATES)
  else template = pick(r, TYPO_TEMPLATES)

  const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'
  ctx.textBaseline = 'alphabetic'
  template({ ctx, W, H, d, accent, accent2, r, img })

  let dataUrl: string
  try { dataUrl = canvas.toDataURL('image/png') }
  catch {
    // CORS-tainted header image — redraw typographic and export clean.
    ctx.clearRect(0, 0, W, H)
    const r2 = mulberry32(s + 1)
    bEditorial({ ctx, W, H, d, accent, accent2, r: r2, img: null })
    dataUrl = canvas.toDataURL('image/png')
    return { dataUrl, template: 'Editorial', format, usedPhoto: false }
  }
  return { dataUrl, template: NAMES.get(template) || 'Blog', format, usedPhoto: img !== null && PHOTO_TEMPLATES.includes(template as any) }
}

export function downloadBlogGraphic(dataUrl: string, filename: string) {
  const a = document.createElement('a'); a.href = dataUrl; a.download = filename
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
}
