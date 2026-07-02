import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { AdminLayout, AdminTabHeader, EmptyState, FilterPill } from './adminKit'

// Collaboration + contact form submissions both live in the welfare/legacy
// Supabase project (the public site writes them there). This tab surfaces them
// in the HoD desk so directors can read enquiries without leaving the app.
//
// Shapes mirror the inserts in CollaborationsPage / ContactPage:
type CollabRow = {
  id: number
  org_name: string
  contact_name: string
  email: string
  phone: string | null
  collab_type: string | null
  message: string
  created_at: string
}
type ContactRow = {
  id: number
  full_name: string
  email: string
  subject: string | null
  message: string
  created_at: string
}

type Kind = 'collab' | 'contact'

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
    })
  } catch { return iso }
}

function Field({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', minWidth: 0 }}>
      <span className="mono xs upper" style={{ fontWeight: 700, color: 'var(--ink-3)', flexShrink: 0, width: 64 }}>{label}</span>
      {href
        ? <a href={href} style={{ color: 'var(--ink)', textDecoration: 'underline', wordBreak: 'break-word' }}>{value}</a>
        : <span style={{ color: 'var(--ink-2)', wordBreak: 'break-word' }}>{value}</span>}
    </div>
  )
}

export default function FormResponses() {
  const [kind, setKind] = useState<Kind>('collab')
  const [collabs, setCollabs] = useState<CollabRow[]>([])
  const [contacts, setContacts] = useState<ContactRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true); setError(null)
      const [c, k] = await Promise.all([
        supabase.from('collaboration_submissions').select('*').order('created_at', { ascending: false }),
        supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }),
      ])
      if (!active) return
      // Both failing usually means the tables don't grant read access yet.
      if (c.error && k.error) {
        setError("Couldn't load submissions — the form tables may not allow read access for this role yet.")
      }
      setCollabs((c.data as CollabRow[] | null) ?? [])
      setContacts((k.data as ContactRow[] | null) ?? [])
      setLoading(false)
    })()
    return () => { active = false }
  }, [])

  const rows = kind === 'collab' ? collabs : contacts
  const tabs: { key: Kind; label: string; count: number; color: string }[] = [
    { key: 'collab', label: 'Collaborations', count: collabs.length, color: 'var(--sky)' },
    { key: 'contact', label: 'Contact', count: contacts.length, color: 'var(--mint)' },
  ]

  return (
    <AdminLayout>
      <AdminTabHeader
        label="Enquiries"
        title="Form responses"
        subtitle="Collaboration requests and contact messages from the public site."
        count={collabs.length + contacts.length}
      />

      {/* Sub-toggle */}
      <div className="adm-toolbar-filters" style={{ marginBottom: 18 }}>
        {tabs.map(t => (
          <FilterPill key={t.key} active={kind === t.key} onClick={() => setKind(t.key)}>
            {t.label} ({t.count})
          </FilterPill>
        ))}
      </div>

      {loading && (
        <div className="sk-group" style={{ display: 'grid', gap: 12 }}>
          {[0, 1, 2].map(i => <div key={i} className="v6-skeleton" style={{ height: 120, borderRadius: 16 }} />)}
        </div>
      )}

      {!loading && error && (
        <div className="card" style={{ padding: 24, borderColor: 'var(--tomato)' }}>
          <div style={{ fontFamily: 'var(--display)', fontWeight: 800, marginBottom: 6 }}>Couldn't load enquiries</div>
          <p style={{ color: 'var(--ink-2)', fontSize: 14, margin: 0 }}>{error}</p>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <EmptyState
          icon="📭"
          title={`No ${kind === 'collab' ? 'collaboration requests' : 'messages'} yet`}
          hint="New submissions from the public site will appear here automatically."
        />
      )}

      {!loading && !error && rows.length > 0 && (
        <div style={{ display: 'grid', gap: 12 }}>
          {kind === 'collab'
            ? collabs.map(r => (
              <div key={r.id} className="card" style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 18, lineHeight: 1.1 }}>{r.org_name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {r.collab_type && <span className="chip" style={{ background: 'var(--sky)', color: '#0A0A0A', borderColor: 'var(--ink)' }}>{r.collab_type}</span>}
                    <span className="mono xs" style={{ color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{fmtDate(r.created_at)}</span>
                  </div>
                </div>
                <div style={{ display: 'grid', gap: 4, marginBottom: 10 }}>
                  <Field label="Contact" value={r.contact_name} />
                  <Field label="Email" value={r.email} href={`mailto:${r.email}`} />
                  {r.phone && <Field label="Phone" value={r.phone} href={`tel:${r.phone}`} />}
                </div>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: 'var(--ink)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{r.message}</p>
              </div>
            ))
            : contacts.map(r => (
              <div key={r.id} className="card" style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 18, lineHeight: 1.1 }}>{r.full_name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {r.subject && <span className="chip" style={{ background: 'var(--mint)', color: '#0A0A0A', borderColor: 'var(--ink)' }}>{r.subject}</span>}
                    <span className="mono xs" style={{ color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{fmtDate(r.created_at)}</span>
                  </div>
                </div>
                <div style={{ display: 'grid', gap: 4, marginBottom: 10 }}>
                  <Field label="Email" value={r.email} href={`mailto:${r.email}`} />
                </div>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: 'var(--ink)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{r.message}</p>
              </div>
            ))}
        </div>
      )}
    </AdminLayout>
  )
}
