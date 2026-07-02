import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabaseCommunity } from '../lib/supabaseCommunity'
import { useIsMobile } from '../hooks/useMobile'

/**
 * /recruitment — the primary intake form during the "pre-login" phase of
 * AquaTerra v6. Every CTA across the site that used to send users to
 * /login or /register now lands here instead. When login goes live, this
 * page sticks around as a fallback for prospective members.
 *
 * Schema mapping (writes into the existing `volunteer_applications` table
 * so the director-side admin tool keeps working without changes):
 *   form.name       → full_name
 *   form.email      → email
 *   form.phone      → phone
 *   form.school     → college
 *   form.classYear  → year_of_study
 *   form.instagram  → instagram_handle
 *
 * Columns not asked here (age, interests, availability, why_aquaterra,
 * previous_experience) are intentionally sent as null / '' so the row is
 * still readable by the admin pages that expect these fields to exist.
 */

interface Form {
  name: string
  school: string
  classYear: string
  phone: string
  instagram: string
  email: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[\d\s\-()]{7,}$/

const labelSt: React.CSSProperties = {
  fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.06em',
  color: 'var(--ink-3)', display: 'block', marginBottom: 6,
}

// Module-scope so it has a stable identity across re-renders.
// (Defining it inside RecruitmentPage causes React to remount every input on
// each keystroke, killing focus.)
function FieldRow({ label, htmlFor, error, children }: { label: string; htmlFor?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <label htmlFor={htmlFor} style={labelSt}>{label}</label>
        {error && (
          <span className="mono xs" style={{ color: '#e05c5c', fontSize: 10, fontWeight: 700 }}>
            ↘ {error}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

export default function RecruitmentPage() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [form, setForm] = useState<Form>({
    name: '', school: '', classYear: '', phone: '', instagram: '', email: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState<Partial<Record<keyof Form, boolean>>>({})

  const set = (k: keyof Form, v: string) => setForm(f => ({ ...f, [k]: v }))
  const mark = (k: keyof Form) => setTouched(t => ({ ...t, [k]: true }))

  // Pure validation — empty error map = ready to submit.
  const errs: Partial<Record<keyof Form, string>> = {}
  if (!form.name.trim()) errs.name = 'required'
  if (!form.school.trim()) errs.school = 'required'
  if (!form.classYear.trim()) errs.classYear = 'required'
  if (!form.phone.trim()) errs.phone = 'required'
  else if (!PHONE_RE.test(form.phone)) errs.phone = 'invalid phone'
  if (!form.instagram.trim()) errs.instagram = 'required'
  if (!form.email.trim()) errs.email = 'required'
  else if (!EMAIL_RE.test(form.email.trim())) errs.email = 'invalid email'

  const err = (k: keyof Form): string | undefined => touched[k] ? errs[k] : undefined

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Flag everything touched so all errors render on submit attempt
    setTouched({ name: true, school: true, classYear: true, phone: true, instagram: true, email: true })
    if (Object.keys(errs).length > 0) {
      setError('Please fix the highlighted fields and try again.')
      return
    }
    setLoading(true); setError(null)
    // Normalise instagram: strip a leading @ if present so admin sees a
    // consistent handle format.
    const igHandle = form.instagram.trim().replace(/^@+/, '')

    const { error: dbErr } = await supabaseCommunity.from('volunteer_applications').insert([{
      full_name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      college: form.school.trim(),
      year_of_study: form.classYear.trim(),
      instagram_handle: igHandle,
      // Required-or-defaulted columns the admin tooling expects. Send
      // safe placeholders so existing director pages don't choke on null.
      interests: [],
      availability: null,
      why_aquaterra: '',
      previous_experience: null,
      age: null,
    }])
    setLoading(false)
    if (dbErr) {
      console.error('[recruitment] submit failed:', dbErr)
      setError(dbErr.message || 'Submission failed. Please try again.')
      return
    }
    navigate('/volunteer/thank-you')
  }

  return (
    <div className="route-enter">
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section style={{
        padding: 'clamp(40px,6vw,72px) var(--page-px,24px) 40px',
        borderBottom: '2px solid var(--ink)',
        background: 'var(--bg-2)',
      }}>
        <div className="container">
          <span className="sticker wobble" style={{ display: 'inline-flex', marginBottom: 14 }}>
            ★ JOIN THE COMMUNITY
          </span>
          <h1 className="h-display" style={{
            fontSize: 'clamp(36px,7vw,72px)', margin: '0 0 12px', lineHeight: 0.95, textWrap: 'balance' as const,
          }}>
            join <span style={{ fontStyle: 'italic', fontFamily: 'var(--serif)', fontWeight: 400, color: 'var(--mint)' }}>aquaterra</span>.
          </h1>
          <p style={{ fontSize: 15, color: 'var(--ink-2)', maxWidth: 520, lineHeight: 1.55, textWrap: 'pretty' as const }}>
            1,200+ Kolkata students running real welfare drives, building real projects,
            and learning by doing. Fill this in — takes 2 minutes — and our team will
            reach out on WhatsApp.
          </p>
          {/* Social-proof sticker row — a little bold energy before the form */}
          <div className="row gap-2" style={{ marginTop: 18, flexWrap: 'wrap' }}>
            <span className="sticker sticker-mint">★ 1,200+ members</span>
            <span className="sticker sticker-lemon wobble">zero fees, always</span>
            <span className="sticker sticker-sky">since 2021</span>
          </div>
        </div>
      </section>

      {/* ── Form ───────────────────────────────────────────────────────────── */}
      <div className="container" style={{ padding: 'clamp(28px,4vw,48px) var(--page-px,24px) 80px' }}>
        <div style={{ maxWidth: 640 }}>
          {error && (
            <div
              role="alert"
              style={{
                background: 'rgba(224,92,92,0.1)',
                border: '1.5px solid rgba(224,92,92,0.3)',
                borderRadius: 'var(--r)',
                padding: '12px 16px',
                marginBottom: 20,
                color: '#e05c5c',
                fontSize: 13,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                aria-label="Dismiss error"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 900, fontSize: 18, padding: 0, minWidth: 40, minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate name="recruitment" id="recruitment-form">
            <div className="card" style={{ padding: 28, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <span className="sticker sticker-mint" style={{ fontSize: 12, padding: '4px 11px' }}>01</span>
                <span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 19, letterSpacing: '-0.01em' }}>Your details</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <FieldRow label="Full name *" htmlFor="ra-name" error={err('name')}>
                  <input
                    id="ra-name"
                    name="name"
                    className="input"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    onBlur={() => mark('name')}
                    placeholder="Your full name"
                    autoComplete="name"
                    required
                  />
                </FieldRow>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
                  <FieldRow label="School / College *" htmlFor="ra-school" error={err('school')}>
                    <input
                      id="ra-school"
                      name="organization"
                      className="input"
                      value={form.school}
                      onChange={e => set('school', e.target.value)}
                      onBlur={() => mark('school')}
                      placeholder="Your institution"
                      autoComplete="organization"
                      required
                    />
                  </FieldRow>
                  <FieldRow label="Class / Year *" htmlFor="ra-classyear" error={err('classYear')}>
                    <input
                      id="ra-classyear"
                      name="class-year"
                      className="input"
                      value={form.classYear}
                      onChange={e => set('classYear', e.target.value)}
                      onBlur={() => mark('classYear')}
                      placeholder="e.g. Class 11 / 2nd year"
                      autoComplete="on"
                      required
                    />
                  </FieldRow>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
                  <FieldRow label="Mobile no. (WhatsApp) *" htmlFor="ra-phone" error={err('phone')}>
                    <input
                      id="ra-phone"
                      name="tel"
                      className="input"
                      type="tel"
                      inputMode="tel"
                      value={form.phone}
                      onChange={e => set('phone', e.target.value)}
                      onBlur={() => mark('phone')}
                      placeholder="+91 XXXXX XXXXX"
                      autoComplete="tel"
                      required
                    />
                  </FieldRow>
                  <FieldRow label="Instagram ID *" htmlFor="ra-instagram" error={err('instagram')}>
                    <input
                      id="ra-instagram"
                      name="instagram"
                      className="input"
                      value={form.instagram}
                      onChange={e => set('instagram', e.target.value)}
                      onBlur={() => mark('instagram')}
                      placeholder="@yourhandle"
                      autoComplete="nickname"
                      data-1p-ignore
                      data-lpignore="true"
                      required
                    />
                  </FieldRow>
                </div>

                <FieldRow label="Email *" htmlFor="ra-email" error={err('email')}>
                  <input
                    id="ra-email"
                    name="email"
                    className="input"
                    type="email"
                    inputMode="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    onBlur={() => mark('email')}
                    placeholder="you@email.com"
                    autoComplete="email"
                    required
                  />
                </FieldRow>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', minHeight: 56 }}
              disabled={loading}
            >
              {loading ? 'Submitting…' : 'Submit application →'}
            </button>

            <p className="mono xs muted" style={{ marginTop: 18, fontSize: 11, textAlign: 'center', lineHeight: 1.6 }}>
              We read every application personally. You'll hear back on WhatsApp within
              a couple of days. Questions?{' '}
              <Link to="/contact" style={{ color: 'var(--mint)', textDecoration: 'underline' }}>
                Reach out
              </Link>
              .
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
