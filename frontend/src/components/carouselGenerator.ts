// ── AquaTerra project carousel generator ─────────────────────────────────────
// Turns one welfare project into a multi-slide Instagram carousel (1080×1350,
// 4:5) in the exact brand language of the poster studio — same palette, type,
// grid, stars, stickers and logo badge (all reused from posterGenerator's
// brandKit, nothing duplicated). A project yields a coherent deck: a cover, a
// "what we did" slide, an impact-stat slide, one slide per captioned photo, and
// a closing CTA. One seeded accent runs across every slide so the set reads as a
// single piece. "Regenerate" rolls a new seed → new accent + decoration.

import { brandKit, type Rng } from './posterGenerator'

const {
  INK, WHITE, ACCENTS, DISPLAY, MONO, SERIF, catColor,
  mulberry32, pick, rrange, chance,
  grid, star, rrect, fitHeadline, drawLines, logo, drawCover,
  decorate, darkBg, accentBg, creamBg, hardShadow, stripEmoji, loadImage, loadLogo,
} = brandKit

// Matches the AQ brand kit's carousel spec — same canvas as a single post, not
// a separate 4:5 ratio.
const W = 1080, H = 1440

export interface CarouselImage { url: string; label?: string | null }
export interface CarouselProject {
  title: string
  location?: string | null
  keyStatistic?: string | null
  objective?: string | null
  shortSummary?: string | null
  longWriteup?: string | null
  collabName?: string | null
  volunteers?: number | null
  workshopDate?: string | null
  category?: string
  slug?: string
  mainImage?: string | null
  images?: CarouselImage[]
}

export interface CarouselSlide { dataUrl: string; kind: string }
export interface CarouselResult { slides: CarouselSlide[]; accent: string; seed: number }

// ── Small local helpers (carousel-specific chrome) ───────────────────────────

// Tiny "01 / 06" page counter, bottom-left.
function pageTag(ctx: CanvasRenderingContext2D, i: number, total: number, color: string) {
  ctx.save()
  ctx.font = `700 22px ${MONO}`; ctx.fillStyle = color; ctx.globalAlpha = 0.9
  const s = `${String(i + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`
  ctx.fillText(s, 72, H - 60)
  ctx.restore()
}

// Progress dots across the top so the deck reads as a set.
function progressDots(ctx: CanvasRenderingContext2D, i: number, total: number, accent: string, onDark: boolean) {
  const gap = 22, d = 9, totalW = (total - 1) * gap
  const startX = W / 2 - totalW / 2, y = 64
  for (let k = 0; k < total; k++) {
    ctx.beginPath(); ctx.arc(startX + k * gap, y, d / 2, 0, Math.PI * 2)
    if (k === i) { ctx.fillStyle = accent; ctx.fill() }
    else { ctx.fillStyle = onDark ? 'rgba(255,255,255,0.32)' : 'rgba(10,10,10,0.28)'; ctx.fill() }
  }
}

// "swipe →" nudge, bottom-right of the cover.
function swipeHint(ctx: CanvasRenderingContext2D, color: string) {
  ctx.save()
  ctx.font = `700 24px ${MONO}`; ctx.fillStyle = color
  const label = 'swipe →'
  const w = ctx.measureText(label).width
  ctx.fillText(label, W - 72 - w, H - 58)
  ctx.restore()
}

// Bottom scrim so white type stays legible over any photo.
function bottomScrim(ctx: CanvasRenderingContext2D, from = 0.4) {
  const g = ctx.createLinearGradient(0, H * from, 0, H)
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.92)')
  ctx.fillStyle = g; ctx.fillRect(0, H * from, W, H * (1 - from))
}

function topBottomBars(ctx: CanvasRenderingContext2D, accent: string, accent2: string) {
  ctx.fillStyle = accent; ctx.fillRect(0, 0, W, 12)
  ctx.fillStyle = accent2; ctx.fillRect(0, H - 12, W, 12)
}

// Mono kicker label (e.g. "WHAT WE DID").
function kicker(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, accent: string) {
  ctx.font = `700 26px ${MONO}`; ctx.fillStyle = accent
  ctx.fillText(text.toUpperCase(), x, y)
}

// Washi-tape strip — translucent, rotated, faint outline.
function tape(ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: number, color: string) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot)
  ctx.globalAlpha = 0.62; ctx.fillStyle = color; ctx.fillRect(-56, -17, 112, 34)
  ctx.globalAlpha = 1; ctx.strokeStyle = 'rgba(0,0,0,0.16)'; ctx.lineWidth = 1.5; ctx.strokeRect(-56, -17, 112, 34)
  ctx.restore()
}

// ── Slides ───────────────────────────────────────────────────────────────────

type SlideCtx = {
  ctx: CanvasRenderingContext2D; p: CarouselProject; accent: string; accent2: string
  r: Rng; i: number; total: number
}

// COVER — main photo full-bleed, a photo taped to the paper, or (no photo)
// cream type. Cream/paper is the lead surface per brand law; the full-bleed
// photo path is the only one that goes dark (it needs the scrim for legible
// white type over a real image).
function slideCover({ ctx, p, accent, accent2, r, i, total }: SlideCtx, img: HTMLImageElement | null) {
  const taped = !!img && chance(r, 0.4)
  const fullBleed = !!img && !taped
  const fg = fullBleed ? WHITE : INK

  if (taped) {
    // TAPED scrapbook cover — the photo in a tilted, taped frame on paper.
    creamBg(ctx, W, H)
    const fw = W * 0.7, fh = fw * 0.8, pad = 24
    const fx = (W - fw) / 2, fy = H * 0.17
    ctx.save()
    ctx.translate(fx + fw / 2, fy + fh / 2); ctx.rotate(rrange(r, -0.05, 0.05)); ctx.translate(-(fx + fw / 2), -(fy + fh / 2))
    hardShadow(ctx, fx, fy, fw, fh + 50, 10, INK, 10)
    rrect(ctx, fx, fy, fw, fh + 50, 10); ctx.fillStyle = WHITE; ctx.fill()
    drawCover(ctx, img!, fx + pad, fy + pad, fw - pad * 2, fh - pad)
    tape(ctx, fx + 44, fy + 2, -0.5, accent); tape(ctx, fx + fw - 44, fy + 2, 0.5, accent2)
    ctx.restore()
    star(ctx, W - 116, fy + fh + 30, rrange(r, 46, 60), accent, 0.85, rrange(r, -0.3, 0.3))
  } else if (fullBleed) {
    drawCover(ctx, img!, 0, 0, W, H)
    // top scrim for the logo + kicker
    const tg = ctx.createLinearGradient(0, 0, 0, H * 0.28)
    tg.addColorStop(0, 'rgba(0,0,0,0.62)'); tg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = tg; ctx.fillRect(0, 0, W, H * 0.28)
    bottomScrim(ctx, 0.42)
  } else {
    creamBg(ctx, W, H)
    star(ctx, W - 120, H * 0.24, rrange(r, 120, 170), accent, 0.14, rrange(r, -0.3, 0.3))
    decorate(ctx, W, H, r, accent, false)
  }
  topBottomBars(ctx, accent, accent2)
  logo(ctx, 72, 120, accent, 50, !fullBleed, fullBleed ? 'photo' : undefined)
  kicker(ctx, p.category === 'welfare' ? 'WELFARE PROJECT' : (p.category || 'AQUATERRA'), 76, 188, accent)

  // Title block, bottom-anchored.
  const title = (p.title || 'AquaTerra project').slice(0, 120)
  const { lines, font, lhMul, size } = fitHeadline(ctx, title, W - 150, 5, 116, 52, r)
  const lh = size * 1.04 * lhMul
  const blockH = lines.length * lh
  const top = H - 230 - blockH
  ctx.font = font; ctx.fillStyle = fg
  drawLines(ctx, lines, 76, top, lh)
  ctx.fillStyle = accent; ctx.fillRect(76, top + blockH + 22, 130, 10)
  ctx.fillStyle = accent2; ctx.fillRect(76 + 142, top + blockH + 22, 42, 10)

  // Location + date row.
  const meta = [p.location, p.workshopDate].filter(Boolean).join('  ·  ')
  if (meta) {
    ctx.font = `700 26px ${MONO}`; ctx.fillStyle = fullBleed ? 'rgba(255,255,255,0.82)' : 'rgba(10,10,10,0.62)'
    ctx.fillText(ellipsize(ctx, meta.toUpperCase(), W - 150), 76, top + blockH + 78)
  }
  progressDots(ctx, i, total, accent, fullBleed)
  swipeHint(ctx, fullBleed ? accent : accent)
}

// TEXT — an editorial slide on paper (cream is the lead surface; the deck's
// one deliberate dark beat is the closing slide, not this one). Rolls between
// four layouts so a multi-text deck doesn't repeat itself.
function slideText({ ctx, accent, accent2, r, i, total }: SlideCtx, head: string, body: string) {
  creamBg(ctx, W, H)
  decorate(ctx, W, H, r, accent, false)
  topBottomBars(ctx, accent, accent2)
  logo(ctx, 72, 120, accent, 50, true)

  // A generous perf ceiling only — real project write-ups run 400-700 chars and
  // deserve to read in full. fitHeadline (used below) does the actual fitting:
  // it shrinks to the smallest readable size and only ellipsizes if the text
  // still can't fit, instead of this call silently lopping off everything past
  // an arbitrary 360th character mid-sentence.
  const text = (body || '').slice(0, 900)
  const roll = r()

  if (roll < 0.22) {
    // RANSOM — the line broken into cut-out word boxes, mixed fonts + angles.
    // Loud on purpose — the one text layout that keeps the deck's energy up.
    kicker(ctx, head, 76, 250, accent)
    const words = text.toUpperCase().replace(/\s+/g, ' ').trim().split(' ').slice(0, 16)
    const fonts = [DISPLAY, SERIF, MONO]; const cols = [...ACCENTS, INK]
    ctx.textBaseline = 'middle'
    let x = 76, y = 360, lineH = 0
    for (const w of words) {
      const fs = Math.round(rrange(r, 40, 74))
      ctx.font = `900 ${fs}px ${pick(r, fonts)}`
      const tw = ctx.measureText(w).width; const padX = 14, padY = 8
      const bw = tw + padX * 2, bh = fs + padY * 2
      if (x + bw > W - 76) { x = 76; y += lineH + 16; lineH = 0 }
      ctx.save(); ctx.translate(x + bw / 2, y); ctx.rotate(rrange(r, -0.12, 0.12))
      const fill = pick(r, cols)
      hardShadow(ctx, -bw / 2, -bh / 2, bw, bh, 7, INK, 5)
      rrect(ctx, -bw / 2, -bh / 2, bw, bh, 7); ctx.fillStyle = fill; ctx.fill()
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke()
      ctx.fillStyle = fill === INK ? WHITE : INK; ctx.fillText(w, -tw / 2, 2); ctx.restore()
      x += bw + 14; lineH = Math.max(lineH, bh)
    }
    ctx.textBaseline = 'alphabetic'
  } else if (roll < 0.48) {
    // Big serif quote mark, statement set beneath it.
    ctx.fillStyle = accent; ctx.font = `900 280px ${SERIF}`
    ctx.fillText('“', 60, 360)
    const { lines, font, lhMul, size } = fitHeadline(ctx, text, W - 150, 7, 96, 44, r)
    const lh = size * 1.12 * lhMul; const blockH = lines.length * lh
    const top = 400
    ctx.font = font; ctx.fillStyle = INK
    drawLines(ctx, lines, 76, top, lh)
    ctx.font = `700 26px ${MONO}`; ctx.fillStyle = accent
    ctx.fillText('— ' + head.toUpperCase(), 76, Math.min(top + blockH + 60, H - 140))
  } else if (roll < 0.74) {
    kicker(ctx, head, 76, 250, accent)
    const { lines, font, lhMul, size } = fitHeadline(ctx, text, W - 150, 8, 86, 40, r)
    const lh = size * 1.18 * lhMul; const blockH = lines.length * lh
    const top = Math.max(330, (H - blockH) / 2 - 30)
    ctx.font = font; ctx.fillStyle = INK
    drawLines(ctx, lines, 76, top, lh)
    ctx.fillStyle = accent; ctx.fillRect(76, top + blockH + 30, 120, 9)
    ctx.fillStyle = accent2; ctx.fillRect(76 + 132, top + blockH + 30, 40, 9)
  } else {
    // CARD — a tilted white index card, taped at the corners, floating on the
    // paper. A fourth, distinct silhouette from the three full-bleed layouts.
    const cw = W - 176, ch = H - 560, cx = 88, cy = 300
    ctx.save()
    ctx.translate(cx + cw / 2, cy + ch / 2); ctx.rotate(rrange(r, -0.025, 0.025)); ctx.translate(-(cx + cw / 2), -(cy + ch / 2))
    hardShadow(ctx, cx, cy, cw, ch, 14, INK, 10)
    rrect(ctx, cx, cy, cw, ch, 14); ctx.fillStyle = WHITE; ctx.fill()
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke()
    tape(ctx, cx + 60, cy + 4, -0.4, accent); tape(ctx, cx + cw - 60, cy + 4, 0.4, accent2)

    ctx.font = `700 24px ${MONO}`; ctx.fillStyle = accent
    ctx.fillText(head.toUpperCase(), cx + 44, cy + 68)
    ctx.fillStyle = accent; ctx.fillRect(cx + 44, cy + 84, 56, 6)

    const { lines, font, lhMul, size } = fitHeadline(ctx, text, cw - 88, 8, 66, 34, r)
    const lh = size * 1.2 * lhMul
    ctx.font = font; ctx.fillStyle = INK
    drawLines(ctx, lines, cx + 44, cy + 140, lh)
    ctx.restore()
    star(ctx, W - 100, cy - 30, rrange(r, 40, 56), accent, 0.9, rrange(r, -0.3, 0.3))
  }

  progressDots(ctx, i, total, accent, false)
  pageTag(ctx, i, total, 'rgba(10,10,10,0.55)')
}

// STAT — the "impact" beat. Two layouts on a roll so a deck with more than one
// stat (or several projects posted back to back) doesn't repeat the identical
// composition every time: a bright accent flood, or a dark field with the
// number boxed in an offset outlined card.
function slideStat({ ctx, accent, accent2, r, i, total }: SlideCtx, stat: string, sub: string) {
  const dark = chance(r, 0.42)
  const ink = dark ? WHITE : INK
  const big = (stat || '').slice(0, 22)

  if (dark) {
    darkBg(ctx, W, H, accent, r); grid(ctx, W, H, 0.04)
    star(ctx, 120, H * 0.82, rrange(r, 90, 140), accent, 0.16, rrange(r, -0.3, 0.3))
  } else {
    accentBg(ctx, W, H, accent, accent2, r)
    star(ctx, W * rrange(r, 0.72, 0.9), H * rrange(r, 0.18, 0.3), rrange(r, 240, 320), INK, 0.06, rrange(r, -0.4, 0.4))
  }
  ctx.fillStyle = ink; ctx.fillRect(0, 0, W, 14); ctx.fillRect(0, H - 14, W, 14)
  // Both the dark box and the accent flood count as "dark/colored" per brand
  // law — neither is genuine cream paper, so both want the cream pill.
  logo(ctx, 72, 120, accent)
  kicker(ctx, 'BY THE NUMBERS', 76, 250, dark ? accent : INK)

  if (big) {
    if (dark) {
      // Boxed card — the number offset in an outlined frame rather than
      // flooding the whole canvas, a calmer, more editorial beat.
      const boxY = 360, boxH = 420
      rrect(ctx, 76, boxY, W - 152, boxH, 18)
      ctx.strokeStyle = accent; ctx.lineWidth = 4; ctx.stroke()
      let bs = 220
      ctx.font = `900 ${bs}px ${DISPLAY}`
      while (ctx.measureText(big).width > W - 152 - 88 && bs > 44) { bs -= 8; ctx.font = `900 ${bs}px ${DISPLAY}` }
      ctx.fillStyle = WHITE
      const by = boxY + 60 + bs * 0.72
      ctx.fillText(big, 120, by)

      if (sub) {
        ctx.font = `700 30px ${DISPLAY}`; ctx.fillStyle = accent
        const capTop = by + 56, availH = (boxY + boxH - 40) - capTop
        const maxCapLines = Math.max(1, Math.floor(availH / 38))
        const subLines = wrap(ctx, sub.toUpperCase(), W - 152 - 88, maxCapLines)
        subLines.forEach((ln, k) => ctx.fillText(ln, 120, capTop + k * 38))
      }
    } else {
      // The number, as large as it fits — shrink to the width, no hard floor
      // that would let it overflow the canvas.
      let bs = 280
      ctx.font = `900 ${bs}px ${DISPLAY}`
      while (ctx.measureText(big).width > W - 150 && bs > 44) { bs -= 8; ctx.font = `900 ${bs}px ${DISPLAY}` }
      ctx.fillStyle = INK
      const by = H / 2 + bs * 0.18
      ctx.fillText(big, 76, by)

      // Caption beneath the number. Most real stats are a full sentence ("100
      // toffees were distributed to passerbys and..."), not a short label —
      // so give it however many lines actually fit above the page tag instead
      // of a blind 2-line cap that chopped real sentences off mid-word.
      if (sub) {
        ctx.font = `800 38px ${DISPLAY}`; ctx.fillStyle = INK; ctx.globalAlpha = 0.78
        const capTop = by + 70, availH = (H - 150) - capTop
        const maxCapLines = Math.max(2, Math.floor(availH / 46))
        const subLines = wrap(ctx, sub.toUpperCase(), W - 150, maxCapLines)
        subLines.forEach((ln, k) => ctx.fillText(ln, 76, capTop + k * 46))
        ctx.globalAlpha = 1
      }
    }
  } else if (sub) {
    // No numeric value — render the whole stat as a wrapped headline instead
    // of a truncated fake "number".
    const { lines, font, lhMul, size } = fitHeadline(ctx, sub, W - 150, 5, 96, 44, r)
    const lh = size * 1.08 * lhMul
    const top = H / 2 - (lines.length * lh) / 2
    ctx.font = font; ctx.fillStyle = ink
    drawLines(ctx, lines, 76, top, lh)
  }
  progressDots(ctx, i, total, dark ? accent : INK, dark)
  pageTag(ctx, i, total, dark ? 'rgba(255,255,255,0.6)' : 'rgba(10,10,10,0.55)')
}

// PHOTO — captioned full-bleed image with a label chip.
function slidePhoto({ ctx, accent, accent2, r, i, total }: SlideCtx, img: HTMLImageElement | null, label: string | null) {
  if (img) { drawCover(ctx, img, 0, 0, W, H); bottomScrim(ctx, 0.5) }
  else { creamBg(ctx, W, H); decorate(ctx, W, H, r, accent, false) }
  topBottomBars(ctx, accent, accent2)
  logo(ctx, 72, 120, accent, 50, !img, img ? 'photo' : undefined)
  if (chance(r, 0.6)) star(ctx, W - 110, 220, rrange(r, 50, 74), accent, 0.6, rrange(r, -0.3, 0.3))

  if (label) {
    const text = label.slice(0, 140)
    const { lines, font, lhMul, size } = fitHeadline(ctx, text, W - 150, 3, 72, 40, r)
    const lh = size * 1.12 * lhMul
    const blockH = lines.length * lh
    const top = H - 150 - blockH
    ctx.font = font; ctx.fillStyle = img ? WHITE : INK
    drawLines(ctx, lines, 76, top, lh)
    ctx.fillStyle = accent; ctx.fillRect(76, top - 34, 90, 9)
  }
  progressDots(ctx, i, total, accent, !!img)
  pageTag(ctx, i, total, img ? 'rgba(255,255,255,0.7)' : 'rgba(10,10,10,0.55)')
}

// CLOSING — recap + CTA + handle.
function slideClosing({ ctx, p, accent, accent2, r, i, total }: SlideCtx) {
  darkBg(ctx, W, H, accent, r); grid(ctx, W, H, 0.05)
  star(ctx, 120, H * 0.78, rrange(r, 120, 160), accent, 0.12, rrange(r, -0.4, 0.4))
  decorate(ctx, W, H, r, accent)
  topBottomBars(ctx, accent, accent2)
  logo(ctx, 72, 130, accent, 56)

  kicker(ctx, 'STUDENT-RUN · KOLKATA', 76, 250, accent)
  const head = 'this is what\nshowing up\nlooks like.'
  ctx.font = `900 96px ${DISPLAY}`; ctx.fillStyle = WHITE
  head.split('\n').forEach((ln, k) => ctx.fillText(ln, 76, 400 + k * 100))

  // Collab credit, if any — shrink to fit the width so long names don't bleed.
  if (p.collabName) {
    const credit = ('WITH ' + p.collabName).toUpperCase().slice(0, 48)
    let cs = 28; ctx.font = `700 ${cs}px ${MONO}`
    while (ctx.measureText(credit).width > W - 152 && cs > 16) { cs -= 2; ctx.font = `700 ${cs}px ${MONO}` }
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.fillText(credit, 76, 760)
  }

  // CTA pill.
  const cta = 'JOIN THE MOVEMENT'
  ctx.font = `900 34px ${DISPLAY}`
  const cw = ctx.measureText(cta).width + 72
  rrect(ctx, 76, H - 280, cw, 76, 38); ctx.fillStyle = accent; ctx.fill()
  ctx.fillStyle = INK; ctx.fillText(cta, 76 + 36, H - 280 + 50)

  // Handle.
  ctx.font = `700 30px ${MONO}`; ctx.fillStyle = accent2
  ctx.fillText('@ngo.aquaterra', 76, H - 165)

  progressDots(ctx, i, total, accent, true)
}

// Single-line truncate at the current font — trims to whatever actually fits
// `maxW` and appends "…", instead of a blind character-count slice that can
// either overflow the canvas (string narrower than its char count implies) or
// cut a short one needlessly (string wider than it implies).
function ellipsize(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text
  let s = text
  while (s.length > 0 && ctx.measureText(s + '…').width > maxW) s = s.slice(0, -1).trimEnd()
  return s.trimEnd() + '…'
}

// Local word-wrap at current font (slideStat caption). Wraps the FULL text
// first, then — only if it still runs past `maxLines` — caps it there and
// ellipsizes the last visible line. This is the difference between a sentence
// reading as complete (or cleanly "…"-cut) and one that just stops mid-word.
function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines = Infinity): string[] {
  // Forced paragraph breaks first (see layoutLines in posterGenerator.ts for
  // why — a literal newline in a stat sentence must not collapse into a space).
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
  if (lines.length > maxLines) {
    const cut = lines.slice(0, maxLines)
    let last = cut[maxLines - 1]
    while (last.length > 0 && ctx.measureText(last + '…').width > maxW) last = last.slice(0, -1).trimEnd()
    cut[maxLines - 1] = last.trimEnd() + '…'
    return cut
  }
  return lines
}

// ── Deck planning ─────────────────────────────────────────────────────────────

type Plan =
  | { kind: 'cover' }
  | { kind: 'text'; head: string; body: string }
  | { kind: 'stat'; stat: string; sub: string }
  | { kind: 'photo'; src: string; label: string | null }
  | { kind: 'closing' }

// Decide which slides this project supports. Always cover + closing; the middle
// is filled from whatever content exists. `coverSrc` is the resolved cover image
// URL so the same photo is never repeated as a photo slide.
function planDeck(p: CarouselProject, coverSrc: string | null): Plan[] {
  const plan: Plan[] = [{ kind: 'cover' }]

  // Build the middle content in priority order, then cap the whole deck to
  // the brand kit's 3-5 slide carousel length (cover + up to 3 middle +
  // closing = 5 max) — a project with a full write-up and 4 photos used to
  // produce an 8-slide deck; nobody swipes that far.
  const middle: Plan[] = []

  const objective = (p.objective || p.shortSummary || '').trim()
  if (objective) middle.push({ kind: 'text', head: 'what we set out to do', body: objective })

  if (p.keyStatistic && p.keyStatistic.trim()) {
    const parts = splitStat(p.keyStatistic.trim())
    middle.push({ kind: 'stat', stat: parts.value, sub: parts.label })
  } else if (p.volunteers && p.volunteers > 0) {
    middle.push({ kind: 'stat', stat: String(p.volunteers), sub: 'volunteers on the ground' })
  }

  // A second narrative beat from the long write-up, if it adds anything.
  const recap = (p.shortSummary && p.shortSummary !== objective ? p.shortSummary
    : p.longWriteup || '').trim()
  if (recap && recap !== objective) middle.push({ kind: 'text', head: 'the story', body: recap })

  // Captioned photos (skip whichever photo the cover already uses).
  const photos = (p.images || []).filter(im => im.url && im.url !== coverSrc)
  for (const im of photos) middle.push({ kind: 'photo', src: im.url, label: im.label || null })

  // Real project data always carries at least a title, but guard the
  // theoretical empty case so the deck is never just cover + closing.
  if (middle.length === 0) middle.push({ kind: 'text', head: 'the story', body: p.title || 'a project by AquaTerra.' })

  plan.push(...middle.slice(0, 3))
  plan.push({ kind: 'closing' })
  return plan
}

// Pull a leading number out of a stat string ("4,000 saplings planted" → value
// "4,000", label "saplings planted"; "₹2.5L raised" → "₹2.5L" / "raised"). When
// there's no leading number, value is empty and the whole string is the label so
// the stat slide renders it as text instead of a broken truncated "number".
function splitStat(s: string): { value: string; label: string } {
  const m = s.match(/^\s*([₹$]?\d[\d,.]*\+?%?\s*(?:[kKmMbB]|[lL](?:akh)?|[cC]r|[mM]n)?)\s*(.*)$/)
  if (m && m[1]) return { value: m[1].trim(), label: m[2].trim() }
  return { value: '', label: s }
}

// ── Public API ────────────────────────────────────────────────────────────────

// Render one carousel. `seed` makes the accent + decoration reproducible; omit
// for a fresh look each call ("regenerate").
export async function generateCarousel(p: CarouselProject, seed?: number): Promise<CarouselResult> {
  await Promise.all([document.fonts?.ready ?? Promise.resolve(), loadLogo()])
  // No emojis on graphics — brand law. Strip once here rather than at every
  // slide's text-drawing call site.
  const se = (s?: string | null) => (s ? stripEmoji(s) : s)
  p = {
    ...p,
    title: stripEmoji(p.title || '') || p.title,
    location: se(p.location),
    keyStatistic: se(p.keyStatistic),
    objective: se(p.objective),
    shortSummary: se(p.shortSummary),
    longWriteup: se(p.longWriteup),
    collabName: se(p.collabName),
    images: p.images?.map(im => ({ ...im, label: se(im.label) })),
  }
  const s = seed ?? Math.floor(Math.random() * 0xffffffff)
  const r = mulberry32(s)

  // One accent for the whole deck so it reads as a set.
  const accent = chance(r, 0.55) ? catColor(p.category || 'welfare') : pick(r, ACCENTS)
  const accent2 = pick(r, ACCENTS.filter((a: string) => a !== accent))

  // Resolve the cover image first so photo slides can dedupe against it.
  const coverSrc = p.mainImage || (p.images && p.images[0]?.url) || null
  const plan = planDeck(p, coverSrc)

  // Preload every photo the deck needs (cover + photo slides), in parallel.
  const photoSrcs = plan.filter(pl => pl.kind === 'photo').map(pl => (pl as { src: string }).src)
  const [coverImg, ...photoImgs] = await Promise.all([
    coverSrc ? loadImage(coverSrc) : Promise.resolve(null),
    ...photoSrcs.map(src => loadImage(src)),
  ])
  const photoQueue = [...photoImgs]

  const total = plan.length
  const slides: CarouselSlide[] = []

  for (let i = 0; i < plan.length; i++) {
    const item = plan[i]
    const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'
    ctx.textBaseline = 'alphabetic'
    // Each slide gets its own rng stream seeded from the deck seed so decoration
    // varies slide-to-slide but is still reproducible.
    const sr = mulberry32(s + i * 1013 + 7)
    const base: SlideCtx = { ctx, p, accent, accent2, r: sr, i, total }

    switch (item.kind) {
      case 'cover': slideCover(base, coverImg); break
      case 'text': slideText(base, item.head, item.body); break
      case 'stat': slideStat(base, item.stat, item.sub); break
      case 'photo': slidePhoto(base, photoQueue.shift() ?? null, item.label); break
      case 'closing': slideClosing(base); break
    }

    let dataUrl: string
    try { dataUrl = canvas.toDataURL('image/png') }
    catch {
      // Photo tainted by CORS — redraw that slide as a typographic fallback.
      ctx.clearRect(0, 0, W, H)
      if (item.kind === 'cover') slideCover(base, null)
      else if (item.kind === 'photo') slidePhoto(base, null, item.label)
      dataUrl = canvas.toDataURL('image/png')
    }
    slides.push({ dataUrl, kind: item.kind })
  }

  return { slides, accent, seed: s }
}

// Save every slide. Downloads are staggered ~250ms apart: browsers throttle or
// silently drop multiple programmatic downloads fired in one synchronous burst,
// so a tight loop would only save the first slide of the deck.
export function downloadCarousel(slides: CarouselSlide[], slug: string) {
  slides.forEach((sl, i) => {
    setTimeout(() => {
      const a = document.createElement('a')
      a.href = sl.dataUrl
      a.download = `aquaterra-${slug}-${String(i + 1).padStart(2, '0')}.png`
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
    }, i * 250)
  })
}
