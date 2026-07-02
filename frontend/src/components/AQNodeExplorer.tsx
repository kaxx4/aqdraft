import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Types ──
interface AQNode {
  id: string
  label: string
  desc: string
  stat?: string
  category: string
  color: string
  children?: string[]
}

interface LayoutNode { id: string; label: string; color: string; hasChildren: boolean; isCenter: boolean }
interface LayoutEdge { from: string; to: string }
interface Position { x: number; y: number }

// ── Data ──
// The canonical "everything we do" taxonomy: AquaTerra → its 8 student-run
// departments → the real activities inside each. Colours are deepened brand
// hues (legible on the light card surface) that line up with the department
// cards on /everything-we-do.
// Vivid brand accents — they glow on the dark canvas (matches the posters /
// welcome takeover). White node labels keep everything legible on ink.
const C = {
  green: '#00E5A0', orange: '#FF7A1A', socialPink: '#FF6BD6', amber: '#FFC700',
  grape: '#7E5BFF', sky: '#3DA9FC', magenta: '#FF4D8C', gold: '#FFE94A', root: '#00E5A0',
}

const AQ_DATA: Record<string, AQNode> & { root: AQNode } = {
  root: { id: 'root', label: 'AquaTerra', desc: 'A student-run NGO from Kolkata. Eight departments — welfare drives, events, a streetwear brand, a marketing agency, a tuition platform, and more — all operated entirely by students.', stat: 'Since 2021 · 1,200+ members', category: 'organization', color: C.root, children: ['events', 'welfare', 'social', 'collabs', 'roots', 'ventures', 'shikshaq', 'hr'] },

  // ── Departments ──
  events: { id: 'events', label: 'Events', desc: 'Plans and runs every large-scale gathering — flagship fests, fundraisers, and awareness nights. AQ-run events have crossed 6-digit revenue.', stat: '300+ at Paradox 3.0', category: 'events', color: C.orange, children: ['paradox', 'discoDiwali', 'starryNights', 'awareness'] },
  welfare: { id: 'welfare', label: 'Welfare Projects', desc: 'The heart of AQ: teaching workshops, relief trips, feeding and plantation drives, old-age home visits, and distribution drives.', stat: '3,500+ kids · 4,000+ saplings', category: 'welfare', color: C.green, children: ['teaching', 'sundarbans', 'dogFeeding', 'plantation', 'oldAge', 'clothes'] },
  social: { id: 'social', label: 'Social Media', desc: 'Real brand work by student creators — Instagram, LinkedIn, the website, reels, carousels and copy, shipped every single week.', stat: '3,200+ followers', category: 'content', color: C.socialPink, children: ['instagram', 'linkedin', 'reels', 'website'] },
  collabs: { id: 'collabs', label: 'Collabs', desc: 'Grows AQ through peer networks — school collabs, college partnerships, and inter-NGO collaborations across Kolkata.', stat: 'Partners across Kolkata', category: 'operations', color: C.amber, children: ['schoolCollabs', 'collegePartners', 'ngoCollabs'] },
  roots: { id: 'roots', label: 'ROOTS', desc: 'A student-run streetwear brand. Design, production, sales — and the profits fund welfare projects and events. Real merch, really shipped.', stat: 'Revenue funds AQ', category: 'content', color: C.grape, children: ['rootsDesign', 'rootsProduction', 'rootsSales'] },
  ventures: { id: 'ventures', label: 'AQ.Ventures', desc: 'A free marketing agency for student businesses. Real clients, real briefs, real deliverables — live marketing experience before college.', stat: 'Pro-bono for students', category: 'operations', color: C.sky, children: ['clientWork', 'briefs', 'deliverables'] },
  shikshaq: { id: 'shikshaq', label: 'ShikshAQ', desc: 'A tuition-discovery platform built by AQ members for students across Kolkata. Product, growth, content — small team, moving fast.', stat: 'Live as of 2026', category: 'labs', color: C.magenta, children: ['product', 'growth', 'shikContent'] },
  hr: { id: 'hr', label: 'Human Resources', desc: 'Recruitment, onboarding, certificates, and Letters of Recommendation. HR runs the intake pipeline — the first people new joiners meet.', stat: '1,200+ onboarded', category: 'operations', color: C.gold, children: ['recruitment', 'onboarding', 'certificates'] },

  // ── Events ──
  paradox: { id: 'paradox', label: 'Paradox', desc: "AQ's flagship fest — Paradox 3.0 drew 300+ attendees.", stat: '300+ attendees', category: 'events', color: C.orange },
  discoDiwali: { id: 'discoDiwali', label: 'Disco Diwali', desc: 'A Diwali fundraiser night — music, stalls and celebration that funds welfare drives.', category: 'events', color: C.orange },
  starryNights: { id: 'starryNights', label: 'Starry Nights', desc: 'An evening showcase of student talent and community.', category: 'events', color: C.orange },
  awareness: { id: 'awareness', label: 'Awareness Drives', desc: 'Street, school and social campaigns on welfare and the environment.', category: 'events', color: C.orange },

  // ── Welfare ──
  teaching: { id: 'teaching', label: 'Teaching Workshops', desc: 'Educational workshops for underserved kids. 3,500+ reached.', stat: '3,500+ kids reached', category: 'welfare', color: C.green },
  sundarbans: { id: 'sundarbans', label: 'Sundarbans Relief', desc: 'Relief trips to the Sundarbans — food, supplies and support.', stat: '8 trips', category: 'welfare', color: C.green },
  dogFeeding: { id: 'dogFeeding', label: 'Dog Feeding', desc: 'Street-dog feeding drives across Kolkata.', category: 'welfare', color: C.green },
  plantation: { id: 'plantation', label: 'Plantation Drives', desc: 'Tree-planting campaigns — 4,000+ saplings planted.', stat: '4,000+ saplings', category: 'welfare', color: C.green },
  oldAge: { id: 'oldAge', label: 'Old-Age Visits', desc: 'Old-age home visits — time, care and company.', category: 'welfare', color: C.green },
  clothes: { id: 'clothes', label: 'Clothes Distribution', desc: 'Clothes and essentials distribution drives.', category: 'welfare', color: C.green },

  // ── Social ──
  instagram: { id: 'instagram', label: 'Instagram', desc: '@ngo.aquaterra — 3,200+ followers and growing.', stat: '3,200+ followers', category: 'content', color: C.socialPink },
  linkedin: { id: 'linkedin', label: 'LinkedIn', desc: 'Professional storytelling and presence on LinkedIn.', category: 'content', color: C.socialPink },
  reels: { id: 'reels', label: 'Reels & Carousels', desc: 'Reels, carousels and copy by student creators.', category: 'content', color: C.socialPink },
  website: { id: 'website', label: 'Website', desc: 'This website — designed and run by AQ members.', category: 'content', color: C.socialPink },

  // ── Collabs ──
  schoolCollabs: { id: 'schoolCollabs', label: 'School Collabs', desc: 'Collaborations with schools across Kolkata.', category: 'operations', color: C.amber },
  collegePartners: { id: 'collegePartners', label: 'College Partners', desc: 'College partnerships that widen our reach.', category: 'operations', color: C.amber },
  ngoCollabs: { id: 'ngoCollabs', label: 'NGO Collabs', desc: 'Inter-NGO collaborations on shared causes.', category: 'operations', color: C.amber },

  // ── ROOTS ──
  rootsDesign: { id: 'rootsDesign', label: 'Design', desc: 'Streetwear design by the ROOTS team.', category: 'content', color: C.grape },
  rootsProduction: { id: 'rootsProduction', label: 'Production', desc: 'Production of real, shippable merch.', category: 'content', color: C.grape },
  rootsSales: { id: 'rootsSales', label: 'Sales', desc: 'Sales — profits fund welfare and events.', category: 'content', color: C.grape },

  // ── Ventures ──
  clientWork: { id: 'clientWork', label: 'Client Work', desc: 'Real student-business clients, served pro-bono.', category: 'operations', color: C.sky },
  briefs: { id: 'briefs', label: 'Live Briefs', desc: 'Live marketing briefs members work before college.', category: 'operations', color: C.sky },
  deliverables: { id: 'deliverables', label: 'Deliverables', desc: 'Real deliverables: brand, content and growth.', category: 'operations', color: C.sky },

  // ── ShikshAQ ──
  product: { id: 'product', label: 'Product', desc: 'Building the tuition-discovery platform. Live 2026.', stat: 'Live 2026', category: 'labs', color: C.magenta },
  growth: { id: 'growth', label: 'Growth', desc: 'Growth and user acquisition for ShikshAQ.', category: 'labs', color: C.magenta },
  shikContent: { id: 'shikContent', label: 'Content', desc: 'Education content and resources.', category: 'labs', color: C.magenta },

  // ── HR ──
  recruitment: { id: 'recruitment', label: 'Recruitment', desc: 'Recruitment and intake for 1,200+ members.', stat: '1,200+ onboarded', category: 'operations', color: C.gold },
  onboarding: { id: 'onboarding', label: 'Onboarding', desc: 'Onboarding — the first faces new joiners meet.', category: 'operations', color: C.gold },
  certificates: { id: 'certificates', label: 'Certificates & LORs', desc: 'Certificates and Letters of Recommendation.', category: 'operations', color: C.gold },
} as any

// ── Pre-compute layouts at module load (no per-render cost) ──
function runForce(
  nodes: LayoutNode[], edges: LayoutEdge[], centerId: string,
  w: number, h: number, nodeR: number, linkD: number
): Record<string, Position> {
  const cx = w / 2, cy = h / 2
  const pos: Record<string, Position> = {}
  const vel: Record<string, Position> = {}
  const count = nodes.length

  nodes.forEach((n, i) => {
    if (n.id === centerId) { pos[n.id] = { x: cx, y: cy } }
    else {
      // Evenly space children in a circle, offset by half a slot to avoid top collision
      const angle = ((i - 0.5) / Math.max(count - 1, 1)) * Math.PI * 2
      pos[n.id] = { x: cx + Math.cos(angle) * linkD * 0.85, y: cy + Math.sin(angle) * linkD * 0.85 }
    }
    vel[n.id] = { x: 0, y: 0 }
  })

  for (let iter = 0; iter < 150; iter++) {
    const f: Record<string, Position> = {}
    nodes.forEach(n => { f[n.id] = { x: 0, y: 0 } })

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j]
        const dx = pos[b.id].x - pos[a.id].x, dy = pos[b.id].y - pos[a.id].y
        const d2 = dx * dx + dy * dy + 0.01, d = Math.sqrt(d2)
        const rep = 7000 / d2
        f[a.id].x -= (dx / d) * rep; f[a.id].y -= (dy / d) * rep
        f[b.id].x += (dx / d) * rep; f[b.id].y += (dy / d) * rep
      }
    }
    edges.forEach(e => {
      const dx = pos[e.to].x - pos[e.from].x, dy = pos[e.to].y - pos[e.from].y
      const d = Math.sqrt(dx * dx + dy * dy + 0.01)
      const force = (d - linkD) * 0.12
      f[e.from].x += (dx / d) * force; f[e.from].y += (dy / d) * force
      f[e.to].x -= (dx / d) * force; f[e.to].y -= (dy / d) * force
    })
    nodes.forEach(n => {
      f[n.id].x += (cx - pos[n.id].x) * (n.id === centerId ? 0.2 : 0.025)
      f[n.id].y += (cy - pos[n.id].y) * (n.id === centerId ? 0.2 : 0.025)
    })
    nodes.forEach(n => {
      vel[n.id].x = (vel[n.id].x + f[n.id].x) * 0.55
      vel[n.id].y = (vel[n.id].y + f[n.id].y) * 0.55
      pos[n.id].x += vel[n.id].x; pos[n.id].y += vel[n.id].y
    })
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j]
        const dx = pos[b.id].x - pos[a.id].x, dy = pos[b.id].y - pos[a.id].y
        const d = Math.sqrt(dx * dx + dy * dy), min = nodeR * 2 + 18
        if (d < min) {
          const ov = min - d, ang = Math.atan2(dy, dx)
          pos[a.id].x -= Math.cos(ang) * ov * 0.5; pos[a.id].y -= Math.sin(ang) * ov * 0.5
          pos[b.id].x += Math.cos(ang) * ov * 0.5; pos[b.id].y += Math.sin(ang) * ov * 0.5
        }
      }
    }
    const mg = nodeR + 14
    nodes.forEach(n => {
      pos[n.id].x = Math.max(mg, Math.min(w - mg, pos[n.id].x))
      pos[n.id].y = Math.max(mg, Math.min(h - mg, pos[n.id].y))
    })
  }
  return pos
}

function buildLevel(centerId: string) {
  const center = AQ_DATA[centerId]
  if (!center) return { nodes: [] as LayoutNode[], edges: [] as LayoutEdge[] }
  const nodes: LayoutNode[] = [{ id: center.id, label: center.label, color: center.color, hasChildren: (center.children?.length ?? 0) > 0, isCenter: true }]
  const edges: LayoutEdge[] = []
  center.children?.forEach(cid => {
    const c = AQ_DATA[cid]
    if (c) { nodes.push({ id: c.id, label: c.label, color: c.color, hasChildren: (c.children?.length ?? 0) > 0, isCenter: false }); edges.push({ from: centerId, to: cid }) }
  })
  return { nodes, edges }
}

// Pre-bake layouts for every drillable level at a standard size.
const BAKED_W = 720, BAKED_H = 520, BAKED_R = 46, BAKED_LINK = 180
const DRILLABLE = ['root', 'events', 'welfare', 'social', 'collabs', 'roots', 'ventures', 'shikshaq', 'hr']
const BAKED_LAYOUTS: Record<string, { nodes: LayoutNode[]; edges: LayoutEdge[]; pos: Record<string, Position> }> = {}
DRILLABLE.forEach(id => {
  const { nodes, edges } = buildLevel(id)
  BAKED_LAYOUTS[id] = { nodes, edges, pos: runForce(nodes, edges, id, BAKED_W, BAKED_H, BAKED_R, BAKED_LINK) }
})

// Fit the web's bounding box into the container — UNIFORM scale (no x/y
// distortion) and centred, with `pad` reserved on every side for node radius +
// glow. This makes the web fill the space evenly instead of squashing into a
// narrow ellipse (the old per-axis scaling) or overflowing.
function scaledPos(baked: Record<string, Position>, sw: number, sh: number, pad = 54): { pos: Record<string, Position>; scale: number } {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const id in baked) {
    const p = baked[id]
    if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y
  }
  const boxW = Math.max(maxX - minX, 1), boxH = Math.max(maxY - minY, 1)
  const s = Math.min((sw - pad * 2) / boxW, (sh - pad * 2) / boxH)
  const ox = (sw - boxW * s) / 2 - minX * s
  const oy = (sh - boxH * s) / 2 - minY * s
  const result: Record<string, Position> = {}
  for (const id in baked) result[id] = { x: baked[id].x * s + ox, y: baked[id].y * s + oy }
  return { pos: result, scale: s }
}

// ── Detail Panel ──
function DetailPanel({ node, compact, dark, onClose, onDrill }: { node: AQNode; compact: boolean; dark?: boolean; onClose: () => void; onDrill?: () => void }) {
  const c = node.color
  const panelBg = dark ? '#181818' : 'var(--bg-card)'
  const titleColor = dark ? '#FFFFFF' : 'var(--ink)'
  const bodyColor = dark ? 'rgba(255,255,255,0.74)' : 'var(--ink-2)'
  const hairline = dark ? 'rgba(255,255,255,0.14)' : 'var(--line)'

  return (
    <motion.div
      key={node.id}
      initial={compact ? { y: 60, opacity: 0 } : { x: 40, opacity: 0 }}
      animate={compact ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
      exit={compact ? { y: 40, opacity: 0 } : { x: 24, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 38, bounce: 0 }}
      style={{
        position: 'absolute', zIndex: 20,
        background: panelBg,
        overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
        WebkitFontSmoothing: 'antialiased',
        ...(compact
          ? { left: 0, right: 0, bottom: 0, maxHeight: '52%', borderTop: `2px solid ${hairline}`, boxShadow: '0 -10px 32px rgba(0,0,0,0.35)', borderRadius: '18px 18px 0 0' }
          : { top: 0, right: 0, bottom: 0, width: 300, boxShadow: `-1px 0 0 0 ${hairline}, -12px 0 32px rgba(0,0,0,0.28)` }),
      }}
    >
      {/* Colour header band */}
      <div style={{
        position: 'relative', padding: '28px 20px 22px',
        background: `linear-gradient(135deg, ${c}22 0%, ${c}08 100%)`,
        borderBottom: `1px solid ${c}20`, flexShrink: 0,
      }}>
        {/* Big ghost letter — decorative */}
        <div style={{
          position: 'absolute', right: 14, top: 8,
          fontFamily: 'var(--display)', fontWeight: 900,
          fontSize: 72, lineHeight: 1, letterSpacing: '-0.06em',
          color: c, opacity: 0.1, userSelect: 'none', pointerEvents: 'none',
        }}>{node.label.charAt(0)}</div>

        {/* Close — 40×40 hit area */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 10, right: 10,
          background: 'none', border: `1px solid ${hairline}`, borderRadius: '50%',
          width: 40, height: 40, cursor: 'pointer', color: dark ? 'rgba(255,255,255,0.55)' : 'var(--ink-3)', fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.1s, color 0.1s, border-color 0.1s',
          zIndex: 1,
        }}
          onMouseEnter={e => { e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.1)' : 'var(--bg)'; e.currentTarget.style.color = dark ? '#fff' : 'var(--ink)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = dark ? 'rgba(255,255,255,0.55)' : 'var(--ink-3)' }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          aria-label="Close"
        >×</button>

        {/* Category pill */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '3px 9px', marginBottom: 12,
          background: `${c}20`, border: `1px solid ${c}40`,
          borderRadius: 6,
          fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em', color: c,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: c, display: 'inline-block', flexShrink: 0 }} />
          {node.category}
        </span>

        <h3 style={{
          fontFamily: 'var(--display)', fontWeight: 900,
          fontSize: 'clamp(17px,2vw,23px)', letterSpacing: '-0.04em',
          color: titleColor, lineHeight: 1.15,
          textWrap: 'balance' as any, margin: 0,
        }}>{node.label}</h3>
      </div>

      {/* Body */}
      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        <p style={{
          fontFamily: 'var(--serif)', fontSize: 13, lineHeight: 1.75,
          color: bodyColor, margin: 0, textWrap: 'pretty' as any,
        }}>{node.desc}</p>

        {node.stat && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px',
            background: `${c}0e`,
            borderRadius: 6,
            border: `1px solid ${c}25`,
          }}>
            <div style={{ width: 3, height: 28, background: c, borderRadius: 2, flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: c, letterSpacing: '0.03em', fontVariantNumeric: 'tabular-nums', lineHeight: 1.5 }}>
              {node.stat}
            </span>
          </div>
        )}

        {onDrill && (
          <button onClick={onDrill} style={{
            marginTop: 'auto', padding: '12px 16px', background: c, color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontFamily: 'var(--display)', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            WebkitFontSmoothing: 'antialiased',
            transition: 'opacity 0.1s, transform 0.1s',
            boxShadow: `0 2px 8px ${c}40`,
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.86')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Explore {node.label} →
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ── Canvas ──
function Canvas({
  nodes, edges, pos, onNodeClick, selectedId, nodeR, centerR, darkMode,
}: {
  nodes: LayoutNode[]; edges: LayoutEdge[]; pos: Record<string, Position>
  onNodeClick: (id: string) => void; selectedId: string | null
  nodeR: number; centerR: number; darkMode: boolean
}) {
  const [hov, setHov] = useState<string | null>(null)
  const [pressed, setPressed] = useState<string | null>(null)

  return (
    <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      {/* Static edges — no animated values, just CSS opacity transition */}
      {edges.map(e => {
        const from = pos[e.from], to = pos[e.to]
        if (!from || !to) return null
        const toNode = nodes.find(n => n.id === e.to)
        const c = toNode?.color || '#1B8A5A'
        const lit = hov === e.from || hov === e.to || selectedId === e.to
        return (
          <line key={`${e.from}-${e.to}`}
            x1={from.x} y1={from.y} x2={to.x} y2={to.y}
            stroke={c} strokeWidth={lit ? 2.5 : 1.75}
            strokeOpacity={lit ? (darkMode ? 0.85 : 0.55) : (darkMode ? 0.34 : 0.2)}
            style={{ transition: 'stroke-opacity 0.12s, stroke-width 0.12s' }}
          />
        )
      })}

      {/* Nodes */}
      <AnimatePresence initial={false}>
        {nodes.map((node, i) => {
          const p = pos[node.id]
          if (!p) return null
          const c = node.color
          const r = node.isCenter ? centerR : nodeR
          const isSel = selectedId === node.id
          const isHov = hov === node.id
          const isPrs = pressed === node.id
          // text box — wider than the inscribed square so longer labels
          // ("Welfare Projects", "Human Resources") fit without truncating. The
          // gaps opened up by the smaller node radius give this room to spill.
          const ts = r * 1.95

          return (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: isPrs ? 0.96 : isHov ? 1.05 : 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28, delay: i * 0.02, bounce: 0 }}
              style={{ cursor: 'pointer' }}
              onClick={() => onNodeClick(node.id)}
              onMouseEnter={() => setHov(node.id)}
              onMouseLeave={() => { setHov(null); setPressed(null) }}
              onMouseDown={() => setPressed(node.id)}
              onMouseUp={() => setPressed(null)}
              role="button" aria-label={node.label} tabIndex={0}
              onKeyDown={ke => ke.key === 'Enter' && onNodeClick(node.id)}
            >
              {/* Glow — CSS transition, not framer. Stronger on the dark canvas. */}
              <circle cx={p.x} cy={p.y} r={r + 14} fill={c}
                style={{ opacity: isSel ? (darkMode ? 0.42 : 0.25) : isHov ? (darkMode ? 0.32 : 0.18) : node.isCenter ? (darkMode ? 0.2 : 0.1) : 0, transition: 'opacity 0.1s' }} />

              {/* Pulsing ring on center */}
              {node.isCenter && (
                <motion.circle cx={p.x} cy={p.y} r={r + 8}
                  stroke={c} strokeWidth={1.5} strokeDasharray="5 5" fill="none"
                  animate={{ scale: [1, 1.07, 1], opacity: [0.4, 0.6, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}

              {/* Selection ring */}
              {isSel && !node.isCenter && (
                <motion.circle cx={p.x} cy={p.y} r={r + 5}
                  stroke={c} strokeWidth={2} fill="none"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 0.8, scale: 1 }}
                  transition={{ duration: 0.18 }}
                />
              )}

              {/* Main circle — CSS transitions for fill/stroke */}
              <circle cx={p.x} cy={p.y} r={r} fill={c} stroke={c}
                style={{
                  fillOpacity: isPrs ? (darkMode ? 0.42 : 0.3) : isHov ? (darkMode ? 0.3 : 0.2) : (darkMode ? 0.2 : 0.12),
                  strokeWidth: isSel ? 3 : isHov ? 2.4 : 1.8,
                  strokeOpacity: isPrs ? 1 : isSel ? 1 : isHov ? 0.95 : (darkMode ? 0.82 : 0.6),
                  transition: 'fill-opacity 0.1s, stroke-opacity 0.1s, stroke-width 0.1s',
                }}
              />

              {/* Label */}
              <foreignObject x={p.x - ts / 2} y={p.y - ts / 2} width={ts} height={ts} style={{ pointerEvents: 'none' }}>
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 5 }}>
                  <span style={{
                    fontFamily: 'var(--display)', color: darkMode ? '#FFFFFF' : 'var(--ink)',
                    // Scale the label with the node so text stays proportionate
                    // as the web shrinks into a small container (with a floor so
                    // it never drops below legibility).
                    fontSize: Math.max(node.isCenter ? 11 : 9, r * (node.isCenter ? 0.26 : 0.30)),
                    fontWeight: node.isCenter ? 800 : 600,
                    lineHeight: 1.12, letterSpacing: '-0.03em',
                    display: '-webkit-box', WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
                    WebkitFontSmoothing: 'antialiased',
                  }}>{node.label}</span>
                </div>
              </foreignObject>

              {/* Expand badge */}
              {node.hasChildren && !node.isCenter && (
                <>
                  <circle cx={p.x + r - 9} cy={p.y - r + 9} r={9} fill={c} />
                  <text x={p.x + r - 9} y={p.y - r + 9}
                    textAnchor="middle" dominantBaseline="middle"
                    fill={darkMode ? '#0c0c0a' : '#fff'} fontSize={11} fontWeight={700}
                    style={{ pointerEvents: 'none', fontFamily: 'var(--display)' }}
                  >+</text>
                </>
              )}
            </motion.g>
          )
        })}
      </AnimatePresence>
    </svg>
  )
}

// ── Breadcrumbs ──
function Crumbs({ path, onNav, dark }: { path: string[]; onNav: (id: string) => void; dark?: boolean }) {
  const last = dark ? '#FFFFFF' : 'var(--ink)'
  const dim = dark ? 'rgba(255,255,255,0.5)' : 'var(--ink-3)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.04em', flexWrap: 'wrap' }}>
      {path.map((id, i) => {
        const n = AQ_DATA[id]
        const isLast = i === path.length - 1
        return (
          <span key={id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <button onClick={() => !isLast && onNav(id)} disabled={isLast} style={{
              background: 'none', border: 'none', padding: 0,
              cursor: isLast ? 'default' : 'pointer',
              color: isLast ? last : dim,
              fontWeight: isLast ? 700 : 400, fontFamily: 'inherit', fontSize: 'inherit',
              textTransform: 'uppercase', textDecoration: isLast ? 'none' : 'underline',
              transition: 'color 0.1s',
            }}>{n?.label || id}</button>
            {!isLast && <span style={{ color: dim }}>/</span>}
          </span>
        )
      })}
    </div>
  )
}

// ── Main ──
export default function AQNodeExplorer({ darkMode = false }: { darkMode?: boolean }) {
  const [path, setPath] = useState(['root'])
  const [panel, setPanel] = useState<AQNode | null>(null)
  const [dims, setDims] = useState({ w: BAKED_W, h: BAKED_H })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Measure immediately on mount — the ResizeObserver's first callback can be
    // late/missed, which left dims at the 720px default and rendered the web at
    // full baked size inside a ~344px phone container (half off-screen, wasted
    // space). clientWidth/Height is correct as soon as the effect runs.
    const measure = () => setDims({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const obs = new ResizeObserver(measure)
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const currentId = path[path.length - 1]
  // On narrow viewports the detail panel becomes a bottom sheet instead of a
  // 300px side rail (which would crush the graph on a phone).
  const compact = dims.w < 560

  // Use baked layout if available, otherwise compute on-the-fly.
  const { nodes, edges, scaledPositions, layoutScale } = useMemo(() => {
    const graphW = panel && !compact ? dims.w - 300 : dims.w
    // When the bottom sheet is open, squeeze the web into the top portion so
    // nodes never hide behind the panel.
    const graphH = panel && compact ? Math.max(dims.h * 0.5, 220) : dims.h
    if (BAKED_LAYOUTS[currentId]) {
      const baked = BAKED_LAYOUTS[currentId]
      const { pos, scale } = scaledPos(baked.pos, graphW, graphH)
      return { nodes: baked.nodes, edges: baked.edges, scaledPositions: pos, layoutScale: scale }
    }
    const { nodes: ns, edges: es } = buildLevel(currentId)
    const fr = dims.w < 500 ? 38 : 46
    const linkD = dims.w < 500 ? 130 : 165
    return { nodes: ns, edges: es, scaledPositions: runForce(ns, es, currentId, graphW, graphH, fr, linkD), layoutScale: 1 }
  }, [currentId, dims, panel, compact])

  // Node size tracks the layout scale so the size-to-spacing ratio stays
  // constant: the baked web keeps even gaps instead of cramming when it's
  // scaled into a small (mobile) container. Clamped so nodes stay legible at
  // the small end and don't bloat on a big screen.
  const nodeR = Math.max(17, Math.min(42, BAKED_R * 0.82 * layoutScale))
  const centerR = Math.max(24, Math.min(54, BAKED_R * 1.08 * layoutScale))

  const handleNodeClick = useCallback((id: string) => {
    const node = AQ_DATA[id]
    if (!node) return
    if ((node.children?.length ?? 0) > 0 && id !== currentId) {
      setPath(prev => [...prev, id])
      setPanel(null)
    } else {
      setPanel(prev => prev?.id === id ? null : node)
    }
  }, [currentId])

  const drillDown = useCallback((id: string) => {
    setPath(prev => [...prev, id])
    setPanel(null)
  }, [])

  const goBack = useCallback(() => {
    setPath(prev => prev.length > 1 ? prev.slice(0, -1) : prev)
    setPanel(null)
  }, [])

  const navTo = useCallback((id: string) => {
    setPath(prev => {
      const idx = prev.indexOf(id)
      return idx !== -1 ? prev.slice(0, idx + 1) : prev
    })
    setPanel(null)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { if (panel) setPanel(null); else goBack() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [panel, goBack])

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', height: '100%', background: darkMode ? '#0E0E0E' : 'var(--bg-card)', borderRadius: darkMode ? 0 : 16, border: darkMode ? 'none' : '1px solid var(--line)', overflow: 'hidden', display: 'flex' }}>
      {/* Dot grid */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: darkMode ? 0.06 : 0.07 }}>
        <defs><pattern id="aq-dots" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill={darkMode ? '#fff' : '#000'} /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#aq-dots)" />
      </svg>

      {/* Graph area */}
      <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
        {/* Top bar */}
        <div style={{ position: 'absolute', top: 14, left: 16, right: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, zIndex: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AnimatePresence initial={false}>
              {path.length > 1 && (
                <motion.button
                  key="back"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  onClick={goBack}
                  style={{ background: darkMode ? 'rgba(255,255,255,0.1)' : 'var(--bg)', border: `1px solid ${darkMode ? 'rgba(255,255,255,0.2)' : 'var(--line)'}`, borderRadius: 8, padding: '10px 14px', color: darkMode ? '#fff' : 'var(--ink)', fontFamily: 'var(--display)', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'background 0.1s', WebkitFontSmoothing: 'antialiased', backdropFilter: darkMode ? 'blur(8px)' : undefined }}
                  onMouseEnter={e => (e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.18)' : 'var(--bg-2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.1)' : 'var(--bg)')}
                  whileTap={{ scale: 0.96 }}
                >← Back</motion.button>
              )}
            </AnimatePresence>
            <Crumbs path={path} onNav={navTo} dark={darkMode} />
          </div>
        </div>

        <Canvas
          nodes={nodes} edges={edges} pos={scaledPositions}
          onNodeClick={handleNodeClick} selectedId={panel?.id ?? null}
          nodeR={nodeR} centerR={centerR} darkMode={darkMode}
        />

        {/* Hint */}
        {path.length === 1 && !panel && (
          <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--mono)', fontSize: 10, color: darkMode ? 'rgba(255,255,255,0.45)' : 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
            tap a department to drill in · any node for details
          </div>
        )}
      </div>

      {/* Panel */}
      <AnimatePresence initial={false}>
        {panel && (
          <DetailPanel
            key={panel.id}
            node={panel}
            compact={compact}
            dark={darkMode}
            onClose={() => setPanel(null)}
            onDrill={(panel.children?.length ?? 0) > 0 ? () => drillDown(panel.id) : undefined}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
