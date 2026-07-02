import { useState, useEffect, useCallback, Fragment, useRef } from 'react'
import { supabaseCommunity as supabase } from '../lib/supabaseCommunity'
import { AdminLayout, AdminTabHeader, EmptyState } from './adminKit'

interface VolApp {
  id: number
  created_at: string
  full_name: string
  email: string
  phone: string | null
  age: number | null
  college: string | null
  year_of_study: string | null
  interests: string[]
  availability: string | null
  why_aquaterra: string
  previous_experience: string | null
  instagram_handle: string | null
  reviewed: boolean | null
  review_note: string | null
  texted: boolean
  texted_by: string | null
  added: boolean
  vol_label: string | null
}

type LabelKey = 'texted' | 'joined' | 'repeated' | 'in_aq' | 'expired'

const LABELS: { key: LabelKey; name: string; color: string; xlsBg: string }[] = [
  { key: 'texted',   name: 'Texted',             color: '#FFC700', xlsBg: '#FFFACC' },
  { key: 'joined',   name: 'Joined',              color: '#00E5A0', xlsBg: '#CCFAEC' },
  { key: 'repeated', name: 'Repeated name',       color: '#FF7A1A', xlsBg: '#FFE8D6' },
  { key: 'in_aq',    name: 'Already in AQ',       color: '#7E5BFF', xlsBg: '#EEE5FF' },
  { key: 'expired',  name: 'Expired / passed',    color: '#E05C5C', xlsBg: '#FFE5E5' },
]
const LMAP = Object.fromEntries(LABELS.map(l => [l.key, l]))

const ROW_TINT: Record<string, string> = {
  texted:   'rgba(255,199,0,0.18)',
  joined:   'rgba(0,229,160,0.16)',
  repeated: 'rgba(255,122,26,0.16)',
  in_aq:    'rgba(126,91,255,0.15)',
  expired:  'rgba(224,92,92,0.16)',
}

const INTEREST_COLORS: Record<string, string> = {
  'Animal Welfare': '#00E5A0',
  'Plantation / Environment': '#7BCB6A',
  'Community Relief': '#FF7A1A',
  'Events & Culture': '#FF6BD6',
  'Content Creation': '#FFC700',
  'Technology (AQ Tech)': '#3DA9FC',
  'Media (Prism)': '#7E5BFF',
  'Operations / HR': '#e05c5c',
  'Finance': '#3DA9FC',
}

const formatDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return d }
}


export default function VolunteerApplications() {
  const [apps, setApps] = useState<VolApp[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('pending')
  const [expanded, setExpanded] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [markingId, setMarkingId] = useState<number | null>(null)
  const [exporting, setExporting] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [liveOn, setLiveOn] = useState(false)
  const [newCount, setNewCount] = useState(0)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [batchWorking, setBatchWorking] = useState(false)
  const [labelFilter, setLabelFilter] = useState<LabelKey | null>(null)
  const [copied, setCopied] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingMoreRef = useRef(false)
  const PAGE = 20

  // Refs so fetchApps always reads the latest filter values without needing to be recreated
  const filterRef = useRef(filter)
  const searchRef = useRef(search)
  const labelFilterRef = useRef(labelFilter)
  filterRef.current = filter
  searchRef.current = search
  labelFilterRef.current = labelFilter

  const fetchApps = useCallback(async (pg: number, append = false, retry = 0) => {
    // Capture current filter values at call time (before any await)
    const currentFilter = filterRef.current
    const currentSearch = searchRef.current.trim().toLowerCase()
    const currentLabelFilter = labelFilterRef.current

    if (!append) setLoading(true)
    setError(null)
    try {
      const start = (pg - 1) * PAGE
      const end   = pg * PAGE - 1

      let query = supabase
        .from('volunteer_applications')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(start, end)

      // Push filters to DB — avoids downloading the whole table
      if (currentFilter === 'pending')  query = query.or('reviewed.is.null,reviewed.eq.false')
      if (currentFilter === 'reviewed') query = query.eq('reviewed', true)
      if (currentLabelFilter)           query = query.eq('vol_label' as any, currentLabelFilter)
      if (currentSearch)                query = query.or(`full_name.ilike.%${currentSearch}%,email.ilike.%${currentSearch}%`)

      const { data, error: err, count } = await query
      if (err) throw err
      const slice = (data || []) as VolApp[]
      const total = count ?? 0
      setTotal(total)
      if (append) setApps(prev => [...prev, ...slice])
      else        setApps(slice)
      setHasMore(pg * PAGE < total)
      setLoading(false)
    } catch (e: any) {
      const msg: string = e?.message || String(e)
      // Supabase auth-lock contention (realtime + fetch racing on startup) — transient, retry
      if (retry < 3 && (msg.includes('stole') || msg.toLowerCase().includes('lock'))) {
        setTimeout(() => fetchApps(pg, append, retry + 1), 700)
        return
      }
      setError(`Failed to load applications — ${msg}`)
      setLoading(false)
    }
  }, []) // stable reference — reads filter state from refs above

  useEffect(() => { setPage(1); setSelected(new Set()); fetchApps(1) }, [filter, search, labelFilter, fetchApps])

  // Infinite scroll: fire next page when sentinel enters the viewport
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loadingMoreRef.current) {
        loadingMoreRef.current = true
        setPage(p => {
          const next = p + 1
          fetchApps(next, true).finally(() => { loadingMoreRef.current = false })
          return next
        })
      }
    }, { rootMargin: '120px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, fetchApps])

  useEffect(() => {
    const channel = supabase
      .channel('vol-apps-live')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'volunteer_applications' }, payload => {
        const row = payload.new as VolApp
        setApps(prev => prev.some(a => a.id === row.id)
          ? prev.map(a => a.id === row.id ? { ...a, ...row } : a)
          : prev)
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'volunteer_applications' }, () =>
        setNewCount(n => n + 1))
      .subscribe(status => setLiveOn(status === 'SUBSCRIBED'))
    return () => { supabase.removeChannel(channel) }
  }, [])

  const copyPhone = async (id: number, phone: string) => {
    try {
      await navigator.clipboard.writeText(phone)
      setCopiedId(id)
      setTimeout(() => setCopiedId(c => c === id ? null : c), 1500)
    } catch {
      setError('Could not copy — clipboard access was blocked')
    }
  }

  const loadNew = () => { setNewCount(0); setPage(1); fetchApps(1) }

  const markReviewed = async (id: number, reviewed: boolean) => {
    setMarkingId(id)
    const { error: err } = await supabase.from('volunteer_applications').update({ reviewed }).eq('id', id)
    setMarkingId(null)
    if (err) { setError(`Failed to update — ${err.message}`); return }
    setApps(prev => prev.map(a => a.id === id ? { ...a, reviewed } : a))
  }

  const updateApp = async (id: number, patch: Partial<VolApp>) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a))
    const { data, error: err } = await supabase
      .from('volunteer_applications').update(patch as any).eq('id', id).select('id')
    if (err || !data || data.length === 0) {
      setError(`Couldn't save — ${err?.message || 'no row updated (check permissions)'}`)
      const { data: fresh } = await supabase.from('volunteer_applications').select('*').eq('id', id).maybeSingle()
      if (fresh) setApps(prev => prev.map(a => a.id === id ? (fresh as VolApp) : a))
    }
  }

  const setLabel = (id: number, label: string | null, prevLabel: string | null = null) => {
    const patch: Partial<VolApp> = { vol_label: label }
    if (label === 'texted') patch.texted = true
    else if (prevLabel === 'texted') patch.texted = false
    updateApp(id, patch)
  }

  const copySelected = async () => {
    const rows = apps.filter(a => selected.has(a.id))
    const text = rows.map(a =>
      [a.full_name, a.email, a.phone ?? ''].filter(Boolean).join('\t')
    ).join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      setError('Clipboard access was blocked')
    }
  }

  const toggleSelect = (id: number) => setSelected(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const toggleSelectAll = () =>
    setSelected(selected.size === apps.length ? new Set() : new Set(apps.map(a => a.id)))

  const batchSetLabel = async (label: string | null) => {
    setBatchWorking(true)
    const ids = Array.from(selected)
    setApps(prev => prev.map(a => selected.has(a.id) ? { ...a, vol_label: label } : a))
    await Promise.all(ids.map(id =>
      supabase.from('volunteer_applications').update({ vol_label: label } as any).eq('id', id)
    ))
    setSelected(new Set())
    setBatchWorking(false)
  }

  const exportXLS = async () => {
    setExporting(true)
    setError(null)
    try {
      let exportQuery = supabase
        .from('volunteer_applications').select('*').order('created_at', { ascending: false })
      if (filter === 'pending')  exportQuery = exportQuery.or('reviewed.is.null,reviewed.eq.false')
      if (filter === 'reviewed') exportQuery = exportQuery.eq('reviewed', true)
      if (labelFilter)           exportQuery = exportQuery.eq('vol_label' as any, labelFilter)
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        exportQuery = exportQuery.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
      }
      const { data, error: err } = await exportQuery
      if (err) throw err
      const rows = (data || []) as VolApp[]

      const esc = (s: unknown) =>
        String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')

      const hdrs = ['#','Submitted','Name','Email','Phone','Age','College','Year','Interests',
        'Availability','Why AquaTerra','Experience','Instagram','Status','Reviewed','Texted by','Added']
      const thS = 'padding:7px 11px;background:#111111;color:#FFFFFF;font-family:Arial;font-size:10pt;font-weight:700;border:1px solid #333;white-space:nowrap;'
      const thead = `<tr>${hdrs.map(h => `<th style="${thS}">${h}</th>`).join('')}</tr>`

      const tbody = rows.map((a, i) => {
        const meta = a.vol_label ? LMAP[a.vol_label] : null
        const bg   = meta?.xlsBg || '#FFFFFF'
        const td   = (v: unknown, extra = '') =>
          `<td style="padding:5px 10px;font-family:Arial;font-size:9pt;border:1px solid #D0D0D0;background:${bg};${extra}">${esc(v)}</td>`
        return `<tr>
          ${td(i + 1)}
          ${td(formatDate(a.created_at))}
          ${td(a.full_name)}
          ${td(a.email)}
          ${td(a.phone ?? '')}
          ${td(a.age ?? '')}
          ${td(a.college ?? '')}
          ${td(a.year_of_study ?? '')}
          ${td((a.interests ?? []).join('; '))}
          ${td(a.availability ?? '')}
          ${td(a.why_aquaterra)}
          ${td(a.previous_experience ?? '')}
          ${td(a.instagram_handle ?? '')}
          ${td(meta?.name ?? '—', meta ? `color:${meta.color};font-weight:700;` : 'color:#999;')}
          ${td(a.reviewed ? 'Yes' : 'No')}
          ${td(a.texted_by ?? '')}
          ${td(a.added ? 'Yes' : 'No')}
        </tr>`
      }).join('')

      const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><style>table{border-collapse:collapse}td,th{white-space:nowrap}</style></head>
<body><table>${thead}${tbody}</table></body></html>`

      const a = document.createElement('a')
      a.href = URL.createObjectURL(new Blob(['﻿' + html], { type: 'application/vnd.ms-excel;charset=utf-8' }))
      a.download = `aq-vol-apps-${filter}-${new Date().toISOString().slice(0, 10)}.xls`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch (e: any) {
      setError(`Export failed — ${e?.message || String(e)}`)
    } finally {
      setExporting(false)
    }
  }

  const selectMode  = selected.size > 0
  const allSelected = apps.length > 0 && selected.size === apps.length

  return (
    <AdminLayout>
      <div style={{ paddingTop: 'clamp(8px,2vw,16px)', paddingBottom: 80 }}>

        <AdminTabHeader
          label="Recruitment"
          title="Volunteer applications"
          count={total}
          subtitle="From the public /recruitment form."
          actions={liveOn ? (
            <span className="mono" title="Live — edits appear automatically"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--mint)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--mint)', animation: 'vol-live-pulse 1.8s ease-in-out infinite' }} />
              live
            </span>
          ) : undefined}
        />

      {/* ── Sticky controls ─────────────────────────────────────────── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'var(--bg)', paddingTop: 8, paddingBottom: 4, marginBottom: 0, borderBottom: '1px solid var(--line)' }}>

      {/* Color legend + filter */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.06em', color: 'var(--ink-3)', flexShrink: 0, marginRight: 2 }}>
          Status key:
        </span>
        <button
          onClick={() => setLabelFilter(null)}
          className={`chip${labelFilter === null ? ' on' : ''}`}
          style={{ fontSize: 11 }}>
          all
        </button>
        {LABELS.map(l => {
          const active = labelFilter === l.key
          return (
            <button key={l.key}
              onClick={() => setLabelFilter(active ? null : l.key)}
              title={`Filter by: ${l.name}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.05em',
                color: active ? l.color : 'var(--ink-2)',
                background: active ? `${l.color}18` : `${l.color}0a`,
                border: `1.5px solid ${active ? l.color : `${l.color}40`}`,
                borderRadius: 999, padding: '5px 12px', cursor: 'pointer',
                transition: 'border-color 0.12s, color 0.12s, background 0.12s',
                whiteSpace: 'nowrap',
              }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
              {l.name}
            </button>
          )
        })}
      </div>

      {/* Filters + search + export */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {(['pending', 'all', 'reviewed'] as const).map(f => (
          <button key={f} className={`chip${filter === f ? ' on' : ''}`} onClick={() => setFilter(f)}
            style={{ fontSize: 11, textTransform: 'capitalize' }}>
            {f === 'pending' ? '★ pending' : f}
          </button>
        ))}
        <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input className="input" placeholder="Search by name or email…" value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 32, height: 36, borderRadius: 999, fontSize: 12 }} />
        </div>
        <button className="btn btn-sm" onClick={exportXLS}
          disabled={exporting || loading || total === 0}
          title={`Export ${filter} applications as colour-coded Excel`}
          style={{ flexShrink: 0, minHeight: 36, whiteSpace: 'nowrap' }}>
          {exporting ? 'exporting…' : '⬇ Export XLS'}
        </button>
      </div>

      </div>{/* end sticky controls */}

      {error && (
        <div style={{ background: 'rgba(224,92,92,0.1)', border: '1.5px solid rgba(224,92,92,0.3)', borderRadius: 10, padding: '12px 16px', color: '#e05c5c', fontSize: 13, marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>✕</button>
        </div>
      )}

      {newCount > 0 && (
        <button onClick={loadNew} className="btn btn-sm"
          style={{ width: '100%', marginBottom: 12, justifyContent: 'center', background: 'var(--accent-bg)', borderColor: 'var(--accent-br)', color: 'var(--accent)' }}>
          ↻ {newCount} new application{newCount > 1 ? 's' : ''} — load
        </button>
      )}

      {loading ? (
        <div className="sk-group" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3,4].map(i => <div key={i} className="v6-skeleton" style={{ height: 52, borderRadius: 12 }} />)}
        </div>
      ) : apps.length === 0 ? (
        <EmptyState
          icon={filter === 'pending' ? '✓' : '📭'}
          title={filter === 'pending' ? 'All caught up' : 'Nothing here'}
          hint={filter === 'pending' ? 'No pending volunteer applications.' : 'No applications match your filters.'}
        />
      ) : (
        <>
          <div style={{ overflowX: 'auto', borderRadius: 14, border: '1.5px solid var(--line)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--line)', background: 'var(--bg-2)' }}>
                  {/* Select-all */}
                  <th style={{ width: 44, textAlign: 'center', padding: '10px 6px 10px 14px' }}>
                    <input type="checkbox" checked={allSelected}
                      ref={el => { if (el) el.indeterminate = selected.size > 0 && !allSelected }}
                      onChange={toggleSelectAll}
                      style={{ width: 15, height: 15, cursor: 'pointer', accentColor: 'var(--accent)' }} />
                  </th>
                  <th className="vol-th" style={{ width: 38, textAlign: 'center' }}>#</th>
                  <th className="vol-th">Name</th>
                  <th className="vol-th vol-hide-sm">College / Year</th>
                  <th className="vol-th vol-hide-sm">Applied</th>
                  <th className="vol-th" style={{ minWidth: 136 }}>Status</th>
                  <th style={{ width: 32 }} />
                </tr>
              </thead>
              <tbody>
                {apps.map((app, idx) => {
                  const isOpen    = expanded === app.id
                  const isPending = !app.reviewed
                  const rowNum    = (page - 1) * PAGE + idx + 1
                  const tint      = app.vol_label ? ROW_TINT[app.vol_label] : undefined
                  const isChecked = selected.has(app.id)

                  return (
                    <Fragment key={app.id}>
                      <tr
                        className="vol-row"
                        style={{
                          cursor: 'pointer',
                          background: isChecked ? 'rgba(61,169,252,0.06)' : tint,
                          borderBottom: isOpen ? 'none' : '1px solid var(--line)',
                          borderLeft: app.vol_label ? `5px solid ${LMAP[app.vol_label]?.color}` : '5px solid transparent',
                        }}
                      >
                        {/* Checkbox */}
                        <td style={{ textAlign: 'center', padding: '0 6px 0 14px', width: 44 }}>
                          <input type="checkbox" checked={isChecked}
                            onChange={() => toggleSelect(app.id)}
                            onClick={e => e.stopPropagation()}
                            style={{ width: 15, height: 15, cursor: 'pointer', accentColor: 'var(--accent)' }} />
                        </td>

                        {/* # + pending dot — number links to WhatsApp if phone exists */}
                        <td className="vol-td" style={{ textAlign: 'center', padding: '0 8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: isPending ? 'var(--lemon)' : 'var(--mint)' }} />
                            {app.phone ? (
                              <a
                                href={`https://wa.me/${app.phone.replace(/\D/g, '').replace(/^0/, '91').replace(/^(?!91)(\d{10})$/, '91$1')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                title={`WhatsApp ${app.full_name}`}
                                style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#25D366', fontVariantNumeric: 'tabular-nums', textDecoration: 'none', fontWeight: 700 }}
                              >
                                {rowNum}
                              </a>
                            ) : (
                              <span
                                onClick={() => setExpanded(isOpen ? null : app.id)}
                                style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums', cursor: 'pointer' }}>
                                {rowNum}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Name + email + WA button */}
                        <td className="vol-td" style={{ maxWidth: 240 }}
                          onClick={() => setExpanded(isOpen ? null : app.id)}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 13, letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                              {app.full_name}
                            </div>
                            {app.phone && (
                              <a
                                href={`https://wa.me/${app.phone.replace(/\D/g, '').replace(/^0/, '91').replace(/^(?!91)(\d{10})$/, '91$1')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                title={`WhatsApp ${app.full_name}`}
                                style={{
                                  flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 3,
                                  background: '#25D366', borderRadius: 6, padding: '2px 6px',
                                  fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 700,
                                  textTransform: 'uppercase', letterSpacing: '0.04em',
                                  color: '#fff', textDecoration: 'none', lineHeight: 1.4,
                                }}
                              >
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                                WA
                              </a>
                            )}
                          </div>
                          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {app.email}
                          </div>
                        </td>

                        {/* College / Year */}
                        <td className="vol-td vol-hide-sm" style={{ maxWidth: 180 }}
                          onClick={() => setExpanded(isOpen ? null : app.id)}>
                          <div style={{ fontFamily: 'var(--eina)', fontSize: 12, color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {app.college || <span style={{ color: 'var(--ink-3)' }}>—</span>}
                          </div>
                          {app.year_of_study && (
                            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>{app.year_of_study}</div>
                          )}
                        </td>

                        {/* Applied */}
                        <td className="vol-td vol-hide-sm"
                          style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
                          onClick={() => setExpanded(isOpen ? null : app.id)}>
                          {formatDate(app.created_at)}
                        </td>

                        {/* Status — active = solid filled dot, inactive = hollow dot */}
                        <td className="vol-td" style={{ padding: '0 10px' }}>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            {LABELS.map(l => {
                              const active = app.vol_label === l.key
                              return (
                                <button key={l.key}
                                  onClick={e => { e.stopPropagation(); setLabel(app.id, active ? null : l.key, app.vol_label) }}
                                  className={active ? undefined : 'vol-dot'}
                                  title={active ? `Clear: ${l.name}` : l.name}
                                  aria-label={active ? `Clear: ${l.name}` : l.name}
                                  style={{
                                    width: 14, height: 14, borderRadius: '50%', padding: 0, flexShrink: 0,
                                    cursor: 'pointer',
                                    border: `2px solid ${l.color}`,
                                    background: active ? l.color : 'transparent',
                                    opacity: active ? 1 : 0.3,
                                    transition: 'opacity 0.12s, background 0.12s',
                                  }}
                                />
                              )
                            })}
                          </div>
                        </td>

                        {/* Expand chevron */}
                        <td className="vol-td" style={{ textAlign: 'center', padding: '0 10px 0 4px' }}
                          onClick={() => setExpanded(isOpen ? null : app.id)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                            style={{ display: 'block', margin: 'auto', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--ink-3)' }}>
                            <path d="m6 9 6 6 6-6"/>
                          </svg>
                        </td>
                      </tr>

                      {/* Expanded detail */}
                      {isOpen && (
                        <tr>
                          <td colSpan={7} style={{ padding: '0 20px 22px', background: tint || 'var(--bg-2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderLeft: app.vol_label ? `5px solid ${LMAP[app.vol_label]?.color}` : '5px solid transparent' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginTop: 16, marginBottom: 16 }}>
                              {/* Contact */}
                              <div>
                                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', marginBottom: 6 }}>Contact</div>
                                <div style={{ fontFamily: 'var(--eina)', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.7 }}>
                                  <a href={`mailto:${app.email}`} style={{ color: 'var(--accent)' }}>{app.email}</a>
                                  {app.phone && (
                                    <>
                                      <br />
                                      <button type="button" onClick={e => { e.stopPropagation(); copyPhone(app.id, app.phone!) }}
                                        title="Click to copy"
                                        style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'var(--accent)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                        {app.phone}
                                        <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: copiedId === app.id ? 'var(--mint)' : 'var(--ink-3)', opacity: copiedId === app.id ? 1 : 0.55 }}>
                                          {copiedId === app.id ? '✓ copied' : '⧉ copy'}
                                        </span>
                                      </button>
                                    </>
                                  )}
                                  {app.instagram_handle && <><br />@{app.instagram_handle}</>}
                                </div>
                              </div>
                              {/* Background */}
                              <div>
                                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', marginBottom: 6 }}>Background</div>
                                <div style={{ fontFamily: 'var(--eina)', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.7 }}>
                                  {app.age && <>{app.age} years old<br /></>}
                                  {app.college && <>{app.college}<br /></>}
                                  {app.year_of_study && <>{app.year_of_study}<br /></>}
                                  {app.availability && <>Available: {app.availability}</>}
                                </div>
                              </div>
                              {/* Applied */}
                              <div>
                                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', marginBottom: 6 }}>Applied</div>
                                <div style={{ fontFamily: 'var(--eina)', fontSize: 13, color: 'var(--ink-2)' }}>{formatDate(app.created_at)}</div>
                              </div>
                            </div>

                            {/* Interests */}
                            {app.interests?.length > 0 && (
                              <div style={{ marginBottom: 14 }}>
                                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', marginBottom: 8 }}>Interests</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                  {app.interests.map(i => (
                                    <span key={i} style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: INTEREST_COLORS[i] || 'var(--ink-2)', border: `1px solid ${INTEREST_COLORS[i] || 'var(--line-2)'}`, borderRadius: 999, padding: '3px 10px' }}>
                                      {i}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Why */}
                            <div style={{ background: 'var(--card)', borderRadius: 10, padding: 14, marginBottom: 14 }}>
                              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', marginBottom: 8 }}>Why AquaTerra</div>
                              <p style={{ fontFamily: 'var(--eina)', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>
                                "{app.why_aquaterra}"
                              </p>
                            </div>

                            {/* Experience */}
                            {app.previous_experience && (
                              <div style={{ background: 'var(--card)', borderRadius: 10, padding: 14, marginBottom: 14 }}>
                                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', marginBottom: 8 }}>Previous Experience</div>
                                <p style={{ fontFamily: 'var(--eina)', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.65, margin: 0 }}>{app.previous_experience}</p>
                              </div>
                            )}

                            {/* Outreach */}
                            <div style={{ background: 'var(--card)', borderRadius: 10, padding: 14, marginBottom: 14 }}>
                              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', marginBottom: 10 }}>Outreach</div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
                                <label onClick={e => e.stopPropagation()}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: 'var(--eina)', fontSize: 13, color: app.texted ? 'var(--sky)' : 'var(--ink-2)', minHeight: 40 }}>
                                  <input type="checkbox" checked={!!app.texted}
                                    onChange={e => updateApp(app.id, e.target.checked
                                      ? { texted: true, vol_label: 'texted' }
                                      : { texted: false, vol_label: app.vol_label === 'texted' ? null : app.vol_label })}
                                    style={{ width: 18, height: 18, accentColor: 'var(--sky)', cursor: 'pointer' }} />
                                  {app.texted ? '✓ texted' : 'texted?'}
                                </label>
                                <label onClick={e => e.stopPropagation()}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: 'var(--eina)', fontSize: 13, color: app.added ? 'var(--mint)' : 'var(--ink-2)', minHeight: 40 }}>
                                  <input type="checkbox" checked={!!app.added}
                                    onChange={e => updateApp(app.id, { added: e.target.checked })}
                                    style={{ width: 18, height: 18, accentColor: 'var(--mint)', cursor: 'pointer' }} />
                                  {app.added ? '✓ added' : '✕ not added'}
                                </label>
                              </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                              {isPending ? (
                                <button onClick={e => { e.stopPropagation(); markReviewed(app.id, true) }}
                                  disabled={markingId === app.id} className="btn btn-sm btn-primary"
                                  style={{ background: 'var(--mint)', borderColor: 'var(--mint)', color: '#0A0A0A' }}>
                                  {markingId === app.id ? '…' : '✓ mark as reviewed'}
                                </button>
                              ) : (
                                <button onClick={e => { e.stopPropagation(); markReviewed(app.id, false) }}
                                  disabled={markingId === app.id} className="btn btn-sm" style={{ color: 'var(--ink-3)' }}>
                                  {markingId === app.id ? '…' : '↩ mark as pending'}
                                </button>
                              )}
                              <a href={`mailto:${app.email}?subject=Your AquaTerra volunteer application&body=Hi ${app.full_name.split(' ')[0]},%0A%0A`}
                                className="btn btn-sm" onClick={e => e.stopPropagation()} style={{ textDecoration: 'none' }}>
                                ✉ Email applicant
                              </a>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div ref={sentinelRef} style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 20, height: 20, border: '2px solid var(--line-2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          )}
        </>
      )}

      {/* Batch action bar */}
      {selectMode && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 200,
          background: 'var(--card)', border: '1.5px solid var(--line)', borderRadius: 14,
          padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)', maxWidth: 'calc(100vw - 32px)',
        }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>
            {selected.size} selected
          </span>
          <div style={{ width: 1, height: 18, background: 'var(--line)', flexShrink: 0 }} />
          {LABELS.map(l => (
            <button key={l.key} disabled={batchWorking} onClick={() => batchSetLabel(l.key)}
              title={`Mark all as: ${l.name}`}
              style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${l.color}`,
                background: l.color, cursor: 'pointer', padding: 0, flexShrink: 0,
                opacity: batchWorking ? 0.5 : 1, transition: 'transform 0.1s' }}
            />
          ))}
          <button disabled={batchWorking} onClick={() => batchSetLabel(null)}
            style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8,
              padding: '4px 10px', cursor: 'pointer', color: 'var(--ink-3)', opacity: batchWorking ? 0.5 : 1 }}>
            clear
          </button>
          <div style={{ width: 1, height: 18, background: 'var(--line)', flexShrink: 0 }} />
          <button onClick={copySelected}
            title="Copy name, email and phone for each selected row (tab-separated)"
            style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              background: copied ? 'var(--mint)' : 'var(--bg-2)',
              border: `1px solid ${copied ? 'var(--mint)' : 'var(--line)'}`, borderRadius: 8,
              padding: '4px 10px', cursor: 'pointer',
              color: copied ? '#0A0A0A' : 'var(--ink-2)',
              transition: 'background 0.15s, color 0.15s, border-color 0.15s',
              whiteSpace: 'nowrap' }}>
            {copied ? '✓ copied' : '⧉ copy'}
          </button>
          <button onClick={() => setSelected(new Set())}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)',
              padding: '4px 6px', fontFamily: 'var(--mono)', fontSize: 14, lineHeight: 1 }}>
            ✕
          </button>
        </div>
      )}

      <style>{`
        .vol-th {
          padding: 10px 12px;
          font-family: var(--mono);
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--ink-3);
          text-align: left;
          white-space: nowrap;
        }
        .vol-td { padding: 11px 12px; vertical-align: middle; }
        .vol-row:hover { background: var(--bg-2) !important; }
        .vol-dot:hover { opacity: 1 !important; }
        @media (max-width: 560px) { .vol-hide-sm { display: none; } }
        @keyframes vol-live-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.35; transform: scale(0.82); }
        }
      `}</style>
      </div>
    </AdminLayout>
  )
}
