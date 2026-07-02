import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { WelfareProject } from '../lib/supabase'
import { useConfirm } from '../components/Confirm'
import { useToast } from '../components/Toast'

type Project = WelfareProject

const LIST_COLS = 'id,slug,is_draft,header,featured,objective,location,workshop_date,volunteers,main_image,main_image_alt,key_statistic'

const OBJECTIVES = [
  'Workshop', 'Feeding Dogs', 'Plantation Drive', 'Distribution Drive',
  'Sundarbans Relief', 'Old Age Home Visit', 'Fundraising Event', 'Others',
]

type ListProject = Pick<Project,
  'id' | 'slug' | 'is_draft' | 'header' | 'featured' | 'objective' |
  'location' | 'workshop_date' | 'volunteers' | 'main_image' | 'main_image_alt' | 'key_statistic'
>

const BLANK: Omit<Project, 'id'> = {
  slug: '', is_draft: true, header: '', featured: false,
  location: null, key_statistic: null, workshop_date: null,
  objective: null, short_summary: null, long_writeup: null,
  collab_name: null, collab_logo: null,
  image_1: null, image_1_alt: null, label_1: null,
  image_2: null, image_2_alt: null, label_2: null,
  image_3: null, image_3_alt: null, label_3: null,
  image_4: null, image_4_alt: null, label_4: null,
  volunteers: null, instagram_link: null,
  main_image: null, main_image_alt: null, google_drive_link: null,
}

let _listCache: ListProject[] | null = null

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)
}

// ─── Image uploader ──────────────────────────────────────────────────────────

const BUCKET = 'project-images'
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: '86400', upsert: false })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

function ImageUploadZone({
  value, alt, onUrlChange, onAltChange, label, hint, compact,
}: {
  value: string | null
  alt?: string | null
  onUrlChange: (url: string | null) => void
  onAltChange?: (alt: string | null) => void
  label: string
  hint?: string
  compact?: boolean
}) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    const file = files[0]
    if (!file.type.startsWith('image/')) { setError('That’s not an image file — use JPG, PNG or WebP.'); return }
    if (file.size > MAX_SIZE) { setError('Too big — keep it under 5 MB.'); return }
    setError(null); setUploading(true)
    try {
      const url = await uploadImage(file)
      onUrlChange(url)
    } catch (e: any) {
      setError(e.message || 'Upload failed')
    } finally { setUploading(false) }
  }

  const h = compact ? 100 : 170

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {label && <span className="pm-label">{label}</span>}
      {hint && <span className="pm-hint" style={{ marginTop: -4 }}>{hint}</span>}

      {value ? (
        <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line-2)' }}>
          <img src={value} alt={alt ?? ''} style={{ width: '100%', height: h, objectFit: 'cover', display: 'block' }} />
          <span className="pm-img-ok">✓ uploaded</span>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 50%)', display: 'flex', alignItems: 'flex-end', padding: 10, gap: 8 }}>
            <button type="button" className="pm-img-btn" onClick={() => inputRef.current?.click()}>Replace</button>
            <button type="button" className="pm-img-btn pm-img-btn-danger" onClick={() => onUrlChange(null)}>Remove</button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
          style={{
            height: h, borderRadius: 12, cursor: 'pointer',
            border: `2px dashed ${dragOver ? 'var(--mint)' : 'var(--line-2)'}`,
            background: dragOver ? 'rgba(0,229,160,0.04)' : 'var(--bg-2)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'border-color 0.15s, background 0.15s', textAlign: 'center', padding: 10,
          }}>
          {uploading ? (
            <>
              <span className="pm-spinner" />
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--mint)' }}>Uploading…</span>
            </>
          ) : (
            <>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={dragOver ? 'var(--mint)' : 'var(--ink-3)'} strokeWidth="1.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: dragOver ? 'var(--mint)' : 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {dragOver ? 'Drop to upload' : 'Drop image or click to browse'}
              </span>
              {!compact && <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--ink-3)', opacity: 0.8 }}>JPG · PNG · WebP, up to 5 MB</span>}
            </>
          )}
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => { handleFiles(e.target.files); e.target.value = '' }} />

      {onAltChange && (
        <div className="pm-field" style={{ gap: 4 }}>
          <input className="input pm-input" placeholder="Describe the photo (for screen readers)" value={alt ?? ''}
            onChange={e => onAltChange(e.target.value || null)} style={{ fontSize: 12 }} />
          <span className="pm-hint">Alt text — a short description for visually-impaired visitors & SEO.</span>
        </div>
      )}

      {error && <span className="pm-err">⚠ {error}</span>}
    </div>
  )
}

// ─── Modal ───────────────────────────────────────────────────────────────────
type ModalTab = 'basics' | 'content' | 'images' | 'links'

// A labelled field with a description line and optional inline error.
function Field({ label, hint, required, error, children, span2 }: {
  label: string; hint?: string; required?: boolean; error?: string; children: ReactNode; span2?: boolean
}) {
  return (
    <div className={'pm-field' + (span2 ? ' pm-span-2' : '')}>
      <span className="pm-label">{label}{required && <b className="pm-req"> required</b>}</span>
      {children}
      {error
        ? <span className="pm-err">⚠ {error}</span>
        : hint && <span className="pm-hint">{hint}</span>}
    </div>
  )
}

function ProjectModal({
  initial, onSave, onClose,
}: {
  initial: Partial<Project>
  onSave: (data: Partial<Project>) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState<Partial<Project>>({ ...BLANK, ...initial })
  const [tab, setTab] = useState<ModalTab>('basics')
  const [saving, setSaving] = useState(false)
  const [slugLocked, setSlugLocked] = useState(!!initial.slug)
  const [loadingFull, setLoadingFull] = useState(!!initial.id)
  const [touched, setTouched] = useState<Set<string>>(new Set())
  // Which tabs have their "advanced / optional" section expanded. Progressive
  // disclosure: each tab shows only its essentials until you ask for more.
  const [adv, setAdv] = useState<Set<ModalTab>>(new Set())
  const toggleAdv = (t: ModalTab) => setAdv(s => { const n = new Set(s); n.has(t) ? n.delete(t) : n.add(t); return n })
  const toast = useToast()
  const confirm = useConfirm()
  const [dirty, setDirty] = useState(false)
  // Discard-guard: a stray backdrop tap or ✕ must not silently throw away
  // unsaved edits to an 11-field form with image uploads.
  const requestClose = async () => {
    if (!dirty || saving) { onClose(); return }
    const ok = await confirm({ title: 'Discard changes?', body: 'You have unsaved edits to this project. Close without saving?', confirmLabel: 'Discard', danger: true })
    if (ok) onClose()
  }

  useEffect(() => {
    if (!initial.id) return
    supabase.from('welfare_projects').select('*').eq('id', initial.id).single()
      .then(({ data, error }) => {
        if (error) toast.error('Failed to load project')
        else if (data) {
          setForm(data)
          // Auto-expand any optional section that already holds data, so editing
          // never hides content behind a collapsed reveal.
          const open = new Set<ModalTab>()
          if (data.location || data.volunteers || data.key_statistic) open.add('basics')
          if (data.long_writeup || data.collab_name || data.collab_logo) open.add('content')
          if (data.image_1 || data.image_2 || data.image_3 || data.image_4) open.add('images')
          if (open.size) setAdv(open)
        }
        setLoadingFull(false)
      })
  }, [initial.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const set = (k: keyof Project, v: unknown) => { setDirty(true); setForm(f => ({ ...f, [k]: v })) }
  const touch = (k: string) => setTouched(t => (t.has(k) ? t : new Set(t).add(k)))

  const handleHeaderChange = (v: string) => {
    set('header', v)
    if (!slugLocked) set('slug', slugify(v))
  }

  // ── Validation ──
  const headerErr = touched.has('header') && !form.header?.trim() ? 'Give the project a title.' : ''
  const slugErr   = touched.has('slug')   && !form.slug?.trim()   ? 'A slug is required.' : ''
  // The slug lives under "more details" — if it ever errors, force that open so
  // the user can actually see and fix it.
  const basicsAdvOpen = adv.has('basics') || !!slugErr

  const handleSave = async () => {
    if (!form.header?.trim() || !form.slug?.trim()) {
      setTouched(new Set(['header', 'slug']))
      setTab('basics')
      toast.error('Title and slug are required.')
      return
    }
    setSaving(true)
    try { await onSave(form) }
    finally { setSaving(false) }
  }

  // ── Readiness checklist (what makes a strong live project) ──
  const checklist: [string, boolean][] = [
    ['Title', !!form.header?.trim()],
    ['Objective', !!form.objective],
    ['Date', !!form.workshop_date],
    ['Hero image', !!form.main_image],
    ['Summary', !!form.short_summary?.trim()],
  ]
  const readyCount = checklist.filter(([, d]) => d).length
  const readyPct = Math.round((readyCount / checklist.length) * 100)
  const allReady = readyCount === checklist.length

  // ── Per-tab "has content" dots ──
  const tabFilled: Record<ModalTab, boolean> = {
    basics: !!(form.objective || form.location || form.workshop_date || form.volunteers || form.key_statistic),
    content: !!(form.short_summary || form.long_writeup || form.collab_name),
    images: !!(form.main_image || form.image_1 || form.image_2 || form.image_3 || form.image_4),
    links: !!(form.instagram_link || form.google_drive_link),
  }

  const summaryLen = (form.short_summary ?? '').length

  const TABS: { key: ModalTab; label: string; icon: string }[] = [
    { key: 'basics',  label: 'Basics',  icon: '◎' },
    { key: 'content', label: 'Content', icon: '✎' },
    { key: 'images',  label: 'Images',  icon: '◫' },
    { key: 'links',   label: 'Links',   icon: '↗' },
  ]

  return (
    <div className="pm-overlay" onClick={e => { if (e.target === e.currentTarget) requestClose() }}>
      <div className="pm-modal">

        {/* Sidebar */}
        <div className="pm-sidebar">
          <div style={{ marginBottom: 16 }}>
            <div className="pm-label" style={{ color: 'var(--mint)', marginBottom: 8 }}>
              {initial.id ? '✎ Editing' : '+ New project'}
            </div>

            {/* Live mini-preview of the project card */}
            <div className="pm-preview">
              <div className="pm-preview-img">
                {form.main_image
                  ? <img src={form.main_image} alt="" />
                  : <span className="pm-preview-noimg">no image yet</span>}
                {form.objective && <span className="pm-preview-tag">{form.objective}</span>}
              </div>
              <div className="pm-preview-body">
                <div className="pm-preview-title">{form.header?.trim() || 'Untitled project'}</div>
                {form.location && <div className="pm-preview-loc">📍 {form.location}</div>}
              </div>
            </div>
          </div>

          {/* Readiness */}
          <div className="pm-ready">
            <div className="pm-ready-head">
              <span>{allReady ? '✓ Ready to publish' : 'Readiness'}</span>
              <span style={{ color: allReady ? 'var(--mint)' : 'var(--ink-3)' }}>{readyCount}/{checklist.length}</span>
            </div>
            <div className="pm-ready-bar"><span style={{ width: `${readyPct}%`, background: allReady ? 'var(--mint)' : 'var(--lemon)' }} /></div>
            <div className="pm-ready-list">
              {checklist.map(([label, done]) => (
                <div key={label} className={'pm-ready-item' + (done ? ' done' : '')}>
                  <span className="pm-ready-tick">{done ? '✓' : '○'}</span>{label}
                </div>
              ))}
            </div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, marginTop: 16 }}>
            {TABS.map(t => (
              <button key={t.key}
                onClick={() => setTab(t.key)}
                className={`pm-tab${tab === t.key ? ' pm-tab-active' : ''}`}>
                <span style={{ fontSize: 14, width: 20, textAlign: 'center' }}>{t.icon}</span>
                {t.label}
                {tabFilled[t.key] && <span className="pm-tab-dot" />}
              </button>
            ))}
          </nav>

          <div style={{ display: 'flex', gap: 8, flexDirection: 'column', marginTop: 16 }}>
            <span className="pm-hint" style={{ marginBottom: 2 }}>{form.is_draft ? 'Draft — hidden from the public site.' : 'Live — visible to everyone.'}</span>
            <div style={{ display: 'flex', gap: 16 }}>
              <label className="pm-toggle">
                <input type="checkbox" checked={!(form.is_draft ?? true)} onChange={e => set('is_draft', !e.target.checked)} />
                <span className="pm-toggle-dot" style={{ '--tc': 'var(--mint)' } as React.CSSProperties} />
                <span>{form.is_draft ? 'Draft' : 'Live'}</span>
              </label>
              <label className="pm-toggle">
                <input type="checkbox" checked={form.featured ?? false} onChange={e => set('featured', e.target.checked)} />
                <span className="pm-toggle-dot" style={{ '--tc': 'var(--lemon)' } as React.CSSProperties} />
                <span>Featured</span>
              </label>
            </div>
          </div>
        </div>

        {/* Content area — minHeight:0 lets the body scroll instead of pushing the
            footer past the modal edge (flexbox min-height:auto bug). */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>

          {/* Top bar — title (mobile) + always-present close affordance */}
          <div className="pm-topbar">
            <span className="pm-topbar-title">{initial.id ? '✎ Edit project' : '+ New project'}</span>
            <button type="button" className="pm-close" onClick={requestClose} aria-label="Close" disabled={saving}>✕</button>
          </div>

          {/* Mobile tab bar (sidebar hidden on mobile) */}
          <div className="pm-mobile-tabs">
            {TABS.map(t => (
              <button key={t.key}
                onClick={() => setTab(t.key)}
                className={`pm-mtab${tab === t.key ? ' pm-mtab-active' : ''}`}>
                {t.label}
                {tabFilled[t.key] && <span className="pm-tab-dot" />}
              </button>
            ))}
            <span className="pm-mobile-ready">{readyCount}/{checklist.length} ready</span>
          </div>

          {/* Mobile-only publish controls — these live in the sidebar on desktop,
              which is hidden on mobile, so surface them here or they're unreachable. */}
          <div className="pm-mobile-controls">
            <label className="pm-toggle">
              <input type="checkbox" checked={!(form.is_draft ?? true)} onChange={e => set('is_draft', !e.target.checked)} />
              <span className="pm-toggle-dot" style={{ '--tc': 'var(--mint)' } as React.CSSProperties} />
              <span>{form.is_draft ? 'Draft' : 'Live'}</span>
            </label>
            <label className="pm-toggle">
              <input type="checkbox" checked={form.featured ?? false} onChange={e => set('featured', e.target.checked)} />
              <span className="pm-toggle-dot" style={{ '--tc': 'var(--lemon)' } as React.CSSProperties} />
              <span>Featured</span>
            </label>
          </div>

          {/* Body */}
          {loadingFull ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-3)' }}>loading…</div>
          ) : (
            <div className="pm-body">

              {tab === 'basics' && (
                <div className="pm-grid">
                  {/* Essentials — the three things every project needs. */}
                  <Field label="Title" required error={headerErr} span2
                    hint="The card title and page headline. Be specific — name the activity + place.">
                    <input className={'input pm-input' + (headerErr ? ' pm-input-error' : '')} value={form.header ?? ''}
                      onChange={e => handleHeaderChange(e.target.value)} onBlur={() => touch('header')}
                      placeholder="e.g. Dog Feeding Drive, Ballygunge" />
                  </Field>

                  <Field label="Category" hint="Sets the accent colour & groups the project.">
                    <select className="input pm-input" value={form.objective ?? ''} onChange={e => set('objective', e.target.value || null)}>
                      <option value="">— pick a category —</option>
                      {OBJECTIVES.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </Field>

                  <Field label="Date" hint="Sorts projects (newest first) & shows on the card.">
                    <input className="input pm-input" type="date" value={form.workshop_date ?? ''} onChange={e => set('workshop_date', e.target.value || null)} />
                  </Field>

                  {/* Everything else is optional — tucked away until asked for. */}
                  <button type="button" className={'pm-adv-toggle pm-span-2' + (basicsAdvOpen ? ' pm-adv-open' : '')}
                    onClick={() => toggleAdv('basics')} aria-expanded={basicsAdvOpen}>
                    <span className="pm-adv-chev">⌄</span>{basicsAdvOpen ? 'Hide extra details' : 'More details — location, volunteers, stat, web address'}
                  </button>

                  {basicsAdvOpen && (
                    <>
                      <Field label="Location" hint="Shown under the title on the card & detail page.">
                        <input className="input pm-input" value={form.location ?? ''} onChange={e => set('location', e.target.value || null)} placeholder="e.g. Ballygunge, Kolkata" />
                      </Field>

                      <Field label="Volunteers" hint="Headline count shown on the card.">
                        <input className="input pm-input" type="number" min={0} value={form.volunteers ?? ''} onChange={e => set('volunteers', e.target.value ? parseInt(e.target.value) : null)} placeholder="e.g. 24" />
                      </Field>

                      <Field label="Key statistic" span2 hint="One punchy outcome shown on the card.">
                        <input className="input pm-input" value={form.key_statistic ?? ''} onChange={e => set('key_statistic', e.target.value || null)} placeholder="e.g. 200 meals served · 50 saplings planted" />
                      </Field>

                      <Field label="Web address (slug)" required error={slugErr} span2
                        hint="The URL: /projects/<slug>. Auto-fills from the title — only edit if needed.">
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input className={'input pm-input' + (slugErr ? ' pm-input-error' : '')} style={{ flex: 1 }} value={form.slug ?? ''}
                            onChange={e => { setSlugLocked(true); set('slug', e.target.value) }} onBlur={() => touch('slug')}
                            placeholder="dog-feeding-ballygunge" />
                          {slugLocked && <button className="pm-ghost-btn" onClick={() => { setSlugLocked(false); set('slug', slugify(form.header ?? '')) }}>↺ Auto</button>}
                        </div>
                      </Field>
                    </>
                  )}
                </div>
              )}

              {tab === 'content' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Essential — the one line that sells the project on the card. */}
                  <Field label="Short summary"
                    hint={`1–2 sentences shown on the card & as the page intro. ${summaryLen}/180 characters${summaryLen > 180 ? ' — a bit long' : ''}.`}>
                    <textarea className="input pm-input" rows={3} value={form.short_summary ?? ''} onChange={e => set('short_summary', e.target.value || null)} placeholder="e.g. Volunteers fed 60 street dogs across Ballygunge and set up three feeding points for the monsoon." style={{ resize: 'vertical' }} />
                  </Field>

                  <button type="button" className={'pm-adv-toggle' + (adv.has('content') ? ' pm-adv-open' : '')}
                    onClick={() => toggleAdv('content')} aria-expanded={adv.has('content')}>
                    <span className="pm-adv-chev">⌄</span>{adv.has('content') ? 'Hide write-up & partner' : 'Add the full write-up & a partner'}
                  </button>

                  {adv.has('content') && (
                    <>
                      <Field label="Full write-up" hint="The full story on the detail page — context, what happened, the impact. Markdown supported (## headings, **bold**, - lists).">
                        <textarea className="input pm-input" rows={11} value={form.long_writeup ?? ''} onChange={e => set('long_writeup', e.target.value || null)} placeholder={'## The drive\nWhat we set out to do…\n\n## Impact\n- 60 dogs fed\n- 3 feeding points set up'} style={{ resize: 'vertical', fontFamily: 'var(--mono)', fontSize: 13 }} />
                      </Field>

                      <Field label="Collaboration name" hint="Partner organisation credited on the project (optional).">
                        <input className="input pm-input" value={form.collab_name ?? ''} onChange={e => set('collab_name', e.target.value || null)} placeholder="e.g. Goonj · Calcutta Rescue" />
                      </Field>

                      <Field label="Collaboration logo" hint="Partner's logo, shown beside their name.">
                        <ImageUploadZone value={form.collab_logo ?? null} label="" onUrlChange={url => set('collab_logo', url)} compact />
                      </Field>
                    </>
                  )}
                </div>
              )}

              {tab === 'images' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <ImageUploadZone
                    value={form.main_image ?? null}
                    alt={form.main_image_alt}
                    onUrlChange={url => set('main_image', url)}
                    onAltChange={alt => set('main_image_alt', alt)}
                    label="Hero image"
                    hint="The headline photo — used as the card thumbnail and the detail-page banner. Best at landscape 4:3, at least 1200px wide." />

                  <button type="button" className={'pm-adv-toggle' + (adv.has('images') ? ' pm-adv-open' : '')}
                    onClick={() => toggleAdv('images')} aria-expanded={adv.has('images')}>
                    <span className="pm-adv-chev">⌄</span>{adv.has('images') ? 'Hide gallery photos' : 'Add gallery photos (up to 4)'}
                  </button>

                  {adv.has('images') && (
                    <div>
                      <span className="pm-hint" style={{ display: 'block', marginBottom: 14 }}>Extra photos shown in the detail-page gallery. Add a caption to each.</span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                        {([1,2,3,4] as const).map(n => (
                          <div key={n} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <ImageUploadZone
                              value={(form as any)[`image_${n}`] ?? null}
                              alt={(form as any)[`image_${n}_alt`]}
                              onUrlChange={url => set(`image_${n}` as any, url)}
                              onAltChange={alt => set(`image_${n}_alt` as any, alt)}
                              label={`Photo ${n}`} compact />
                            <input className="input pm-input" placeholder="Caption (optional)"
                              value={(form as any)[`label_${n}`] ?? ''}
                              onChange={e => set(`label_${n}` as any, e.target.value || null)}
                              style={{ fontSize: 12 }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === 'links' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <Field label="Instagram link" hint="Link to the project's Instagram post or reel. Shows an ‘View on Instagram’ button.">
                    <input className="input pm-input" value={form.instagram_link ?? ''} onChange={e => set('instagram_link', e.target.value || null)} placeholder="https://instagram.com/p/…" />
                  </Field>
                  <Field label="Google Drive link" hint="Public Drive folder with the full photo set (optional).">
                    <input className="input pm-input" value={form.google_drive_link ?? ''} onChange={e => set('google_drive_link', e.target.value || null)} placeholder="https://drive.google.com/…" />
                  </Field>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="pm-footer">
            <span className="pm-footer-status">
              {allReady ? <span style={{ color: 'var(--mint)' }}>✓ All set</span> : `${readyCount}/${checklist.length} essentials added`}
            </span>
            <button className="pm-ghost-btn" onClick={requestClose} disabled={saving}>Cancel</button>
            <button className="btn accent" style={{ borderRadius: 10, padding: '10px 24px', fontSize: 13, fontWeight: 700 }}
              onClick={handleSave} disabled={saving || loadingFull}>
              {saving ? 'Saving…' : initial.id ? 'Save changes' : 'Create project'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .pm-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          z-index: 1000; display: flex; align-items: center; justify-content: center;
          padding: 16px;
        }
        .pm-modal {
          background: var(--bg); border: 1.5px solid var(--line-2);
          border-radius: 20px; width: 100%; max-width: 840px;
          max-height: 92vh; display: flex; overflow: hidden;
          box-shadow: 0 24px 80px rgba(0,0,0,0.3), 0 4px 20px rgba(0,0,0,0.15);
        }
        .pm-sidebar {
          width: 216px; flex-shrink: 0;
          padding: 20px 16px; border-right: 1px solid var(--line-2);
          display: flex; flex-direction: column;
          background: var(--bg-2); overflow-y: auto;
        }
        .pm-label {
          font-family: var(--mono); font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.1em;
          color: var(--ink-3); user-select: none;
        }
        .pm-req { color: var(--mint); font-weight: 700; }
        .pm-hint { font-family: var(--sans); font-size: 11.5px; line-height: 1.45; color: var(--ink-3); }
        .pm-err { font-family: var(--sans); font-size: 11.5px; font-weight: 600; color: #e0544d; }
        .pm-input-error { border-color: #e0544d !important; }
        .pm-spinner { width: 18px; height: 18px; border: 2px solid var(--line-2); border-top-color: var(--mint); border-radius: 50%; animation: pmspin 0.7s linear infinite; }
        @keyframes pmspin { to { transform: rotate(360deg); } }
        .pm-img-ok { position: absolute; top: 8px; right: 8px; z-index: 2; font-family: var(--mono); font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #0A0A0A; background: var(--mint); padding: 3px 7px; border-radius: 999px; }
        /* live mini preview */
        .pm-preview { border: 1.5px solid var(--line-2); border-radius: 12px; overflow: hidden; background: var(--bg); }
        .pm-preview-img { position: relative; aspect-ratio: 16/10; background: var(--bg-3); display: flex; align-items: center; justify-content: center; }
        .pm-preview-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .pm-preview-noimg { font-family: var(--mono); font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-3); }
        .pm-preview-tag { position: absolute; top: 8px; left: 8px; font-family: var(--mono); font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #fff; background: rgba(0,0,0,0.55); backdrop-filter: blur(6px); padding: 3px 7px; border-radius: 999px; }
        .pm-preview-body { padding: 9px 11px 11px; }
        .pm-preview-title { font-family: var(--display); font-weight: 800; font-size: 13px; line-height: 1.2; color: var(--ink); word-break: break-word; }
        .pm-preview-loc { font-size: 10.5px; color: var(--ink-3); margin-top: 3px; }
        /* readiness */
        .pm-ready { background: var(--bg); border: 1.5px solid var(--line-2); border-radius: 12px; padding: 12px; }
        .pm-ready-head { display: flex; justify-content: space-between; font-family: var(--mono); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-2); margin-bottom: 8px; }
        .pm-ready-bar { height: 5px; border-radius: 3px; background: var(--line-2); overflow: hidden; margin-bottom: 10px; }
        .pm-ready-bar span { display: block; height: 100%; border-radius: 3px; transition: width 0.3s cubic-bezier(.2,.7,.2,1); }
        .pm-ready-list { display: flex; flex-direction: column; gap: 4px; }
        .pm-ready-item { display: flex; align-items: center; gap: 7px; font-family: var(--sans); font-size: 11.5px; color: var(--ink-3); }
        .pm-ready-item.done { color: var(--ink); }
        .pm-ready-tick { width: 14px; text-align: center; color: var(--ink-3); }
        .pm-ready-item.done .pm-ready-tick { color: var(--mint); font-weight: 700; }
        /* tab content dot */
        .pm-tab-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--mint); margin-left: auto; flex-shrink: 0; }
        .pm-mobile-ready { margin-left: auto; align-self: center; font-family: var(--mono); font-size: 10px; font-weight: 700; color: var(--ink-3); white-space: nowrap; padding-left: 12px; }
        .pm-footer-status { margin-right: auto; font-family: var(--mono); font-size: 11px; color: var(--ink-3); }
        .pm-tab {
          display: flex; align-items: center; gap: 10px;
          background: none; border: none; cursor: pointer;
          padding: 10px 12px; border-radius: 10px;
          font-family: var(--sans); font-size: 13px; font-weight: 600;
          color: var(--ink-2); text-align: left;
          transition: background 0.12s, color 0.12s;
        }
        .pm-tab:hover { background: rgba(0,229,160,0.06); color: var(--ink); }
        .pm-tab-active { background: rgba(0,229,160,0.1); color: var(--mint); }
        .pm-toggle {
          display: flex; align-items: center; gap: 7px; cursor: pointer;
          font-family: var(--mono); font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-2);
          user-select: none;
        }
        .pm-toggle input { display: none; }
        .pm-toggle-dot {
          width: 32px; height: 18px; border-radius: 9px;
          background: var(--line-2); position: relative;
          transition: background 0.15s;
        }
        .pm-toggle-dot::after {
          content: ''; position: absolute; top: 2px; left: 2px;
          width: 14px; height: 14px; border-radius: 7px;
          background: #fff; transition: transform 0.15s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .pm-toggle input:checked + .pm-toggle-dot { background: var(--tc, var(--mint)); }
        .pm-toggle input:checked + .pm-toggle-dot::after { transform: translateX(14px); }
        .pm-body {
          flex: 1; min-height: 0; overflow-y: auto; padding: 28px 28px 20px;
          -webkit-overflow-scrolling: touch;
        }
        .pm-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 18px;
        }
        .pm-span-2 { grid-column: span 2; }
        .pm-field { display: flex; flex-direction: column; gap: 6px; }
        .pm-input {
          border-radius: 10px !important; font-size: 14px !important;
          padding: 10px 14px !important;
          border: 1.5px solid var(--line-2) !important;
          transition: border-color 0.15s !important;
        }
        .pm-input:focus { border-color: var(--mint) !important; }
        /* Progressive-disclosure reveal — opens a tab's optional fields. */
        .pm-adv-toggle {
          display: inline-flex; align-items: center; gap: 9px; width: fit-content;
          background: none; border: none; cursor: pointer; text-align: left;
          font-family: var(--sans); font-size: 12.5px; font-weight: 600;
          color: var(--ink-3); padding: 8px 2px; min-height: 40px;
          transition: color .12s, transform .1s cubic-bezier(.2,0,0,1);
        }
        .pm-adv-toggle:hover { color: var(--ink); }
        .pm-adv-toggle:active { transform: scale(0.98); }
        .pm-adv-chev {
          display: inline-grid; place-items: center; flex-shrink: 0;
          width: 22px; height: 22px; border-radius: 7px;
          background: var(--bg-2); border: 1px solid var(--line-2);
          font-size: 11px; color: var(--ink-2);
          transition: transform .18s cubic-bezier(.2,0,0,1), border-color .12s;
        }
        .pm-adv-toggle:hover .pm-adv-chev { border-color: var(--ink-3); }
        .pm-adv-open .pm-adv-chev { transform: rotate(180deg); }
        .pm-footer {
          padding: 14px 28px; border-top: 1px solid var(--line-2);
          display: flex; justify-content: flex-end; gap: 10px;
          background: var(--bg);
        }
        .pm-ghost-btn {
          background: none; border: 1.5px solid var(--line-2);
          border-radius: 10px; padding: 8px 18px; cursor: pointer;
          font-family: var(--sans); font-size: 13px; font-weight: 600;
          color: var(--ink-2); transition: border-color 0.15s, color 0.15s;
        }
        .pm-ghost-btn:hover { border-color: var(--ink-3); color: var(--ink); }
        .pm-img-btn {
          background: rgba(255,255,255,0.15); backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.2); border-radius: 8px;
          padding: 5px 12px; cursor: pointer;
          font-family: var(--mono); font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.06em;
          color: #fff; transition: background 0.15s;
        }
        .pm-img-btn:hover { background: rgba(255,255,255,0.25); }
        .pm-img-btn-danger { color: #ff6b6b; border-color: rgba(255,107,107,0.3); }
        .pm-img-btn-danger:hover { background: rgba(255,107,107,0.2); }
        .pm-mobile-tabs {
          display: none; padding: 0 20px;
          border-bottom: 1px solid var(--line-2);
          gap: 0; overflow-x: auto;
        }
        .pm-mtab {
          background: none; border: none; cursor: pointer;
          padding: 14px 14px 12px; font-family: var(--sans);
          font-size: 13px; font-weight: 600; color: var(--ink-3);
          border-bottom: 2px solid transparent;
          white-space: nowrap; transition: color 0.12s;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .pm-mtab-active { color: var(--mint); border-bottom-color: var(--mint); }
        /* Top bar — close lives here so the dialog is always dismissable (no header before). */
        .pm-topbar {
          display: flex; align-items: center; justify-content: flex-end;
          padding: 12px 14px 12px 20px; flex-shrink: 0;
        }
        .pm-topbar-title { display: none; font-family: var(--display); font-weight: 800; font-size: 15px; color: var(--ink); margin-right: auto; }
        .pm-close {
          width: 40px; height: 40px; flex-shrink: 0; border-radius: 10px;
          border: 1.5px solid var(--line-2); background: var(--bg);
          color: var(--ink-3); font-size: 15px; cursor: pointer;
          display: grid; place-items: center;
          transition: color .15s, border-color .15s, transform .1s cubic-bezier(.2,0,0,1);
        }
        .pm-close:hover { color: var(--ink); border-color: var(--ink-3); }
        .pm-close:active { transform: scale(0.96); }
        /* Mobile-only publish controls (sidebar toggles are hidden on mobile). */
        .pm-mobile-controls { display: none; }
        .pm-tab:active, .pm-mtab:active, .pm-ghost-btn:active { transform: scale(0.97); }
        @media (max-width: 700px) {
          /* Bottom sheet: rises from the bottom, rounded top, dodges the keyboard
             far better than a vertically-centred dialog. */
          .pm-overlay { align-items: flex-end; padding: 0; }
          .pm-modal {
            flex-direction: column; max-height: 92dvh; max-width: 100%;
            border-radius: 20px 20px 0 0; border-bottom: none;
            animation: pm-sheet-up .26s cubic-bezier(.2,0,0,1);
          }
          .pm-sidebar { display: none; }
          .pm-mobile-tabs { display: flex; }
          .pm-topbar-title { display: block; }
          .pm-mobile-controls {
            display: flex; gap: 20px; align-items: center; flex-wrap: wrap;
            padding: 10px 18px; border-bottom: 1px solid var(--line-2);
          }
          .pm-mobile-controls .pm-toggle { min-height: 40px; }
          .pm-grid { grid-template-columns: 1fr; }
          .pm-span-2 { grid-column: span 1; }
          .pm-body { padding: 18px 18px 16px; }
          /* 16px inputs stop iOS auto-zooming the whole page on focus. */
          .pm-input { font-size: 16px !important; }
          .pm-footer {
            padding: 12px 18px; padding-bottom: max(12px, env(safe-area-inset-bottom));
            flex-wrap: wrap; gap: 8px;
          }
          .pm-footer-status { display: none; }
          .pm-footer .pm-ghost-btn { min-height: 44px; }
          .pm-footer .btn.accent { flex: 1; min-height: 44px; }
        }
        @keyframes pm-sheet-up { from { transform: translateY(28px); } to { transform: none; } }
        @media (prefers-reduced-motion: reduce) { .pm-modal { animation: none; } }
      `}</style>
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function ProjectManager() {
  const [projects, setProjects] = useState<ListProject[]>(_listCache ?? [])
  const [loading, setLoading] = useState(!_listCache)
  const [search, setSearch] = useState('')
  const [filterObj, setFilterObj] = useState('All')
  const [filterDraft, setFilterDraft] = useState<'all' | 'draft' | 'live'>('all')
  const [editing, setEditing] = useState<Partial<Project> | null>(null)
  const [addingNew, setAddingNew] = useState(false)
  const confirm = useConfirm()
  const toast = useToast()
  const abortRef = useRef<AbortController | null>(null)

  const load = useCallback(async () => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    setLoading(true)
    const { data, error } = await supabase
      .from('welfare_projects')
      .select(LIST_COLS)
      .order('id', { ascending: false })
    if (error) { toast.error('Failed to load projects'); setLoading(false); return }
    const rows = (data ?? []) as ListProject[]
    _listCache = rows
    setProjects(rows)
    setLoading(false)
  }, [toast])

  useEffect(() => { if (!_listCache) load() }, [load])

  const filtered = projects.filter(p => {
    if (filterDraft === 'draft' && !p.is_draft) return false
    if (filterDraft === 'live'  && p.is_draft)  return false
    if (filterObj !== 'All' && p.objective !== filterObj) return false
    if (search) {
      const q = search.toLowerCase()
      return (p.header ?? '').toLowerCase().includes(q) || (p.location ?? '').toLowerCase().includes(q) || (p.slug ?? '').toLowerCase().includes(q)
    }
    return true
  })

  const handleSave = async (data: Partial<Project>) => {
    const { id, ...rest } = data as Project
    if (id) {
      const { error } = await supabase.from('welfare_projects').update(rest).eq('id', id)
      if (error) { toast.error('Save failed: ' + error.message); return }
      toast.success('Project updated')
    } else {
      const { error } = await supabase.from('welfare_projects').insert(rest)
      if (error) { toast.error('Create failed: ' + error.message); return }
      toast.success('Project created')
    }
    setEditing(null); setAddingNew(false)
    _listCache = null; load()
  }

  const toggleFeatured = async (p: ListProject) => {
    const { error } = await supabase.from('welfare_projects').update({ featured: !p.featured }).eq('id', p.id)
    if (error) { toast.error('Failed'); return }
    const updated = projects.map(x => x.id === p.id ? { ...x, featured: !p.featured } : x)
    _listCache = updated; setProjects(updated)
  }

  const toggleDraft = async (p: ListProject) => {
    const { error } = await supabase.from('welfare_projects').update({ is_draft: !p.is_draft }).eq('id', p.id)
    if (error) { toast.error('Failed'); return }
    const updated = projects.map(x => x.id === p.id ? { ...x, is_draft: !p.is_draft } : x)
    _listCache = updated; setProjects(updated)
  }

  const handleDelete = async (p: ListProject) => {
    const yes = await confirm({ title: 'Delete project?', body: `"${p.header}" will be permanently deleted.`, confirmLabel: 'Delete', danger: true })
    if (!yes) return
    const { error } = await supabase.from('welfare_projects').delete().eq('id', p.id)
    if (error) { toast.error('Delete failed'); return }
    toast.success('Project deleted')
    const updated = projects.filter(x => x.id !== p.id)
    _listCache = updated; setProjects(updated)
  }

  const live  = projects.filter(p => !p.is_draft).length
  const draft = projects.filter(p =>  p.is_draft).length
  const feat  = projects.filter(p =>  p.featured).length

  return (
    <div style={{ padding: 'clamp(16px,3vw,28px) var(--page-px,24px) 80px' }}>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        {[
          { label: 'Total',    val: projects.length, color: 'var(--mint)' },
          { label: 'Live',     val: live,            color: 'var(--mint)' },
          { label: 'Draft',    val: draft,           color: 'var(--lemon)' },
          { label: 'Featured', val: feat,            color: 'var(--pink)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '12px 20px', minWidth: 90, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-3)', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.val}</div>
          </div>
        ))}
        <button className="pm-ghost-btn" style={{ marginLeft: 'auto', alignSelf: 'center' }} onClick={() => { _listCache = null; load() }} disabled={loading}>
          {loading ? 'loading…' : '↻ Refresh'}
        </button>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18, alignItems: 'center' }}>
        <input className="input" style={{ maxWidth: 260, borderRadius: 10 }} placeholder="Search title, location, slug…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input" style={{ maxWidth: 180, borderRadius: 10 }} value={filterObj} onChange={e => setFilterObj(e.target.value)}>
          <option value="All">All objectives</option>
          {OBJECTIVES.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <select className="input" style={{ maxWidth: 140, borderRadius: 10 }} value={filterDraft} onChange={e => setFilterDraft(e.target.value as any)}>
          <option value="all">All status</option>
          <option value="live">Live only</option>
          <option value="draft">Drafts only</option>
        </select>
        <button className="btn accent" style={{ marginLeft: 'auto', borderRadius: 10 }} onClick={() => setAddingNew(true)}>
          + New Project
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink-3)' }}>loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink-3)' }}>
          {projects.length === 0 ? 'No projects yet.' : 'No projects match these filters.'}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 14 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: 'var(--sans)' }}>
              <thead>
                <tr style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--line-2)' }}>
                  {['','Title','Objective','Date','Vol.','Status','★',''].map((h, i) => (
                    <th key={i} style={{ padding: '10px 14px', textAlign: 'left', fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--line-2)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-2)', cursor: 'pointer', transition: 'background 0.1s' }}
                    onClick={() => setEditing(p)}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,229,160,0.04)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? 'transparent' : 'var(--bg-2)' }}>
                    <td style={{ padding: '8px 14px' }}>
                      {p.main_image
                        ? <img src={p.main_image} alt={p.main_image_alt ?? ''} style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line-2)', display: 'block' }} />
                        : <div style={{ width: 48, height: 36, borderRadius: 8, background: 'var(--line-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--ink-3)' }}>📷</div>}
                    </td>
                    <td style={{ padding: '8px 14px', maxWidth: 220 }}>
                      <div style={{ fontWeight: 600, lineHeight: 1.3, marginBottom: 2 }}>{p.header}</div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)' }}>{p.slug}</div>
                      {p.location && <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 1 }}>📍 {p.location}</div>}
                    </td>
                    <td style={{ padding: '8px 14px', whiteSpace: 'nowrap' }}>
                      {p.objective
                        ? <span style={{ background: 'rgba(0,229,160,0.13)', color: 'var(--mint)', border: '1px solid rgba(0,229,160,0.3)', fontFamily: 'var(--mono)', fontSize: 10, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap' }}>{p.objective}</span>
                        : <span style={{ color: 'var(--ink-3)', fontSize: 11 }}>—</span>}
                    </td>
                    <td style={{ padding: '8px 14px', whiteSpace: 'nowrap', color: 'var(--ink-2)', fontSize: 12 }}>
                      {p.workshop_date ? new Date(p.workshop_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
                    </td>
                    <td style={{ padding: '8px 14px', textAlign: 'center', fontVariantNumeric: 'tabular-nums', fontSize: 12 }}>
                      {p.volunteers ?? '—'}
                    </td>
                    <td style={{ padding: '8px 14px' }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => toggleDraft(p)}
                        style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999, border: 'none', cursor: 'pointer',
                          background: p.is_draft ? 'rgba(255,199,0,0.18)' : 'rgba(0,229,160,0.15)',
                          color: p.is_draft ? '#b8860b' : 'var(--mint)' }}>
                        {p.is_draft ? 'DRAFT' : 'LIVE'}
                      </button>
                    </td>
                    <td style={{ padding: '8px 14px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => toggleFeatured(p)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: p.featured ? 1 : 0.2, transition: 'opacity 0.15s' }}
                        title={p.featured ? 'Unfeature' : 'Feature'}>★</button>
                    </td>
                    <td style={{ padding: '8px 14px' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="pm-ghost-btn" style={{ padding: '4px 12px', fontSize: 11, fontWeight: 700 }} onClick={() => setEditing(p)} title="Edit project">✎ Edit</button>
                        <a href={`/projects/${p.slug}`} target="_blank" rel="noopener noreferrer" title="Open public page"
                          className="pm-ghost-btn" style={{ padding: '4px 10px', fontSize: 11, textDecoration: 'none' }}>↗</a>
                        <button className="pm-ghost-btn" style={{ padding: '4px 10px', fontSize: 11, color: 'var(--pink)', borderColor: 'rgba(255,107,214,0.3)' }} onClick={() => handleDelete(p)} title="Delete project">✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '10px 16px', borderTop: '1px solid var(--line-2)', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)' }}>
            {filtered.length} of {projects.length} projects
          </div>
        </div>
      )}

      {addingNew && <ProjectModal initial={{}} onSave={handleSave} onClose={() => setAddingNew(false)} />}
      {editing && <ProjectModal initial={editing} onSave={handleSave} onClose={() => setEditing(null)} />}

      <style>{`
        .pm-ghost-btn {
          background: none; border: 1.5px solid var(--line-2);
          border-radius: 10px; padding: 8px 18px; cursor: pointer;
          font-family: var(--sans); font-size: 13px; font-weight: 600;
          color: var(--ink-2); transition: border-color 0.15s, color 0.15s;
        }
        .pm-ghost-btn:hover { border-color: var(--ink-3); color: var(--ink); }
      `}</style>
    </div>
  )
}
