import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Burst, Marquee } from '../components/v6Shared'

// ── Data ──────────────────────────────────────────────────────────
const ACCENTS = ['#00E5A0', '#FFC700', '#FF6BD6', '#3DA9FC', '#7E5BFF', '#FF7A1A', '#FF4D8C']

const STATS = [
  { value: '3,500+', label: 'kids in workshops' },
  { value: '4,000+', label: 'saplings planted' },
  { value: '1,600+', label: 'medical checkups' },
  { value: '15,000+', label: 'bananas distributed' },
  { value: '500+', label: 'campaigns & projects' },
  { value: '1,500+', label: 'dogs fed' },
  { value: '2,500kg', label: 'clothes distributed' },
]

const DRIVE_STEPS = [
  { title: 'Community poll', body: 'Volunteering opportunities are shared as polls in the Community WhatsApp group.' },
  { title: 'Drive details', body: 'Each poll lists the date, time, location, and nature of the drive.' },
  { title: 'Vote to join', body: 'Voting “Yes” adds you to a drive-specific WhatsApp group.' },
  { title: 'Get briefed', body: 'All instructions, content, and guidelines are shared in that group.' },
]

const COMMUNITIES = [
  { name: 'Community AquaTerra', tag: 'All volunteers', desc: 'The default group for every registered volunteer. Drive polls, announcements, and general opportunities land here.', color: '#00E5A0' },
  { name: 'Team AQ', tag: 'Department members', desc: 'For volunteers actively working within departments. Team updates and coordination happen here.', color: '#3DA9FC' },
  { name: 'Core AQ', tag: 'Heads of departments', desc: 'A leadership group of selected Heads of Departments (HoDs) only.', color: '#FFC700' },
]

const STARTUPS = [
  { name: 'ROOTS', color: '#FF7A1A', desc: 'Student-designed merch. Every purchase funds our welfare work.' },
  { name: 'ShikshAQ', color: '#7E5BFF', desc: 'A student-built EdTech platform making quality education accessible.' },
]

const FAQS = [
  { q: 'What is AquaTerra?', a: "AquaTerra is a student-led NGO based in Kolkata, registered under DARPAN (REG: AAFTT2300ME20251). We run welfare drives for animals and communities, organise cultural events, and build technology projects — all driven entirely by volunteers aged 14–25. We started in 2021 with a dog feeding drive in South Kolkata. Four years later we've run 534+ welfare projects, built AQ Tech, launched Prism Media, and grown to 1,200+ members across 15+ schools." },
  { q: 'Is AquaTerra registered with the government?', a: 'Yes. AquaTerra is certified by DARPAN, an initiative of NITI Aayog, Govt. of India. Our registration number is AAFTT2300ME20251.' },
  { q: 'Where does AquaTerra primarily operate?', a: 'AquaTerra is based in Kolkata and runs most on-ground drives across South and Central Kolkata. Our tech and content arms (AQ Tech, Prism Media) operate remotely and are open to volunteers outside Kolkata.' },
  { q: 'Do I need prior experience to volunteer?', a: "No. We don't require prior experience, specific skills, or any kind of portfolio. We do ask that you're serious about showing up. We have limited spots and we're looking for people who want to do real work, not pad a resume." },
  { q: 'Is there a volunteer fee?', a: 'No. There is no fee to volunteer with AquaTerra. Participation is completely free.' },
  { q: "What's the time commitment?", a: "Minimum 4–6 hours per month. Most active volunteers put in 10–15 hours. Drives are usually on weekends. Virtual coordination happens on WhatsApp throughout the week. We understand you have school and exams — we expect genuine effort and communication when you can't make it." },
  { q: 'What do I get out of it?', a: "Real experience doing real things. You'll work alongside directors who've run hundreds of welfare drives. You'll build relationships with 1,200+ members from across Kolkata's schools. You'll be credited for every project you contribute to. We're not going to tell you it looks good on a college application — it probably does, but that's not why we're here." },
  { q: 'How does the approval process work?', a: "Apply via this website. A director reviews your application within 2–5 days. If approved, you'll get access to the AquaTerra community platform where you can see all internal posts, team updates, and initiatives. Some departments (especially Labs and Director-track roles) have additional screening." },
]

const spring = { type: 'spring', duration: 0.3, bounce: 0 } as const

// ── Small reusable bits ───────────────────────────────────────────
function SectionLabel({ children }: { children: string }) {
  return (
    <div className="mono xs upper" style={{ fontWeight: 700, letterSpacing: '0.08em', color: 'var(--ink-3)', marginBottom: 14 }}>
      [ {children} ]
    </div>
  )
}

export default function VolunteerHandbookPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <div className="route-enter">

      {/* ── HERO ── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(44px,8vw,96px) var(--page-px,24px) clamp(32px,5vw,56px)' }}>
        <Star size={130} color="var(--lemon)" className="spin-slow" style={{ position: 'absolute', top: 36, right: '7%', opacity: 0.7 }} />
        <Burst size={92} color="var(--pink)" style={{ position: 'absolute', bottom: 8, left: '5%', opacity: 0.5 }} />
        <div className="container" style={{ position: 'relative' }}>
          <div className="row gap-2" style={{ marginBottom: 18, flexWrap: 'wrap' }}>
            <span className="sticker sticker-mint sticker-float">★ DARPAN certified</span>
            <span className="sticker sticker-lemon wobble">est 2021</span>
            <span className="sticker sticker-ghost">free · no experience needed</span>
          </div>
          <h1 className="giant" style={{ margin: 0, lineHeight: 0.86 }}>
            volunteer<br />
            <span style={{ fontStyle: 'italic', fontFamily: 'var(--serif)', fontWeight: 400, color: 'var(--mint)' }}>handbook</span>.
          </h1>
          <p style={{ fontSize: 20, lineHeight: 1.5, marginTop: 24, maxWidth: 560, color: 'var(--ink-2)' }}>
            How drives work, how we're structured, and how to grow with us. Everything
            a new volunteer needs — student-run, Kolkata-born, zero fees.
          </p>
          <div className="row gap-2" style={{ marginTop: 30, flexWrap: 'wrap' }}>
            <Link to="/recruitment" className="btn btn-primary btn-lg">Show up for one drive →</Link>
            <a href="#faqs" className="btn btn-lg">read the FAQs</a>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <section style={{ padding: '18px 0', background: 'var(--ink)', color: 'var(--bg)', overflow: 'hidden' }}>
        <Marquee items={['★ 3,500+ KIDS REACHED', '4,000+ SAPLINGS', '★ 1,500+ DOGS FED', '15,000 BANANAS', '★ 500+ PROJECTS', '2,500 KG CLOTHES', '★ 1,600+ CHECKUPS', 'ZERO FEES EVER']} color="mint" />
      </section>

      {/* ── IMPACT STATS ── */}
      <section className="container" style={{ padding: 'clamp(44px,6vw,80px) var(--page-px,24px)' }}>
        <SectionLabel>the impact, by numbers</SectionLabel>
        <h2 className="h-display" style={{ fontSize: 'clamp(31px,5.4vw,50px)', margin: '0 0 28px', lineHeight: 0.92 }}>
          what volunteers have <span style={{ color: 'var(--mint)' }}>built</span>.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 16 }}>
          {STATS.map((s, i) => {
            const c = ACCENTS[i % ACCENTS.length]
            return (
              <div key={i} className="card" style={{ padding: '22px 20px', transform: `rotate(${i % 2 ? 0.5 : -0.5}deg)` }}>
                <div style={{ height: 8, width: 44, borderRadius: 3, background: c, marginBottom: 14 }} />
                <div className="h-display" style={{ fontSize: 'clamp(34px,4.8vw,46px)', lineHeight: 0.95, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums', color: 'var(--ink)' }}>
                  {s.value}
                </div>
                <div style={{ fontFamily: 'var(--eina)', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5, marginTop: 8 }}>
                  {s.label}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: 'var(--bg-2)', borderTop: '2px solid var(--ink)', borderBottom: '2px solid var(--ink)', padding: 'clamp(44px,6vw,80px) var(--page-px,24px)' }}>
        <div className="container">
          <SectionLabel>how volunteering works</SectionLabel>
          <h2 className="h-display" style={{ fontSize: 'clamp(31px,5.4vw,50px)', margin: '0 0 10px', lineHeight: 0.92 }}>
            drive-based & <span style={{ fontStyle: 'italic', fontFamily: 'var(--serif)', fontWeight: 400, color: 'var(--mint)' }}>optional</span>.
          </h2>
          <p style={{ fontFamily: 'var(--eina)', fontSize: 16, lineHeight: 1.6, color: 'var(--ink-2)', maxWidth: 540, margin: '0 0 34px' }}>
            Show up for what fits your schedule. Every drive is shared, voted on, and briefed
            through WhatsApp — no pressure, no minimum streak.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {DRIVE_STEPS.map((step, i) => (
              <div key={i} className="card card-hover" style={{ padding: '22px 20px' }}>
                <div className="h-display" style={{ fontSize: 40, lineHeight: 1, color: 'var(--mint)', letterSpacing: '-0.04em', marginBottom: 12 }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 17, color: 'var(--ink)', marginBottom: 8 }}>
                  {step.title}
                </div>
                <p style={{ fontFamily: 'var(--eina)', fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink-2)', margin: 0 }}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMUNITY STRUCTURE ── */}
      <section className="container" style={{ padding: 'clamp(44px,6vw,80px) var(--page-px,24px)' }}>
        <SectionLabel>how we're organised</SectionLabel>
        <h2 className="h-display" style={{ fontSize: 'clamp(31px,5.4vw,50px)', margin: '0 0 10px', lineHeight: 0.92 }}>
          three <span style={{ color: 'var(--mint)' }}>communities</span>.
        </h2>
        <p style={{ fontFamily: 'var(--eina)', fontSize: 16, lineHeight: 1.6, color: 'var(--ink-2)', maxWidth: 520, margin: '0 0 34px' }}>
          To keep communication clear, AquaTerra runs on three WhatsApp communities.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {COMMUNITIES.map(c => (
            <div key={c.name} className="card card-hover" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: 8, background: c.color, borderBottom: '2px solid var(--ink)' }} />
              <div style={{ padding: '20px 22px 22px' }}>
                <span className="sticker" style={{ fontSize: 10, background: c.color, color: '#0A0A0A', marginBottom: 14, display: 'inline-flex' }}>
                  {c.tag}
                </span>
                <div className="h-display" style={{ fontSize: 22, lineHeight: 1, marginBottom: 10 }}>
                  <Link to="/everything-we-do" style={{ color: 'var(--ink)', textDecoration: 'none', borderBottom: '1px dashed var(--line-2)' }}>
                    {c.name}
                  </Link>
                </div>
                <p style={{ fontFamily: 'var(--eina)', fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)', margin: 0 }}>
                  {c.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── GROW WITH US ── */}
      <section style={{ background: 'var(--bg-2)', borderTop: '2px solid var(--ink)', padding: 'clamp(44px,6vw,80px) var(--page-px,24px)' }}>
        <div className="container">
          <SectionLabel>grow with us</SectionLabel>
          <h2 className="h-display" style={{ fontSize: 'clamp(31px,5.4vw,50px)', margin: '0 0 28px', lineHeight: 0.92 }}>
            go beyond <span style={{ fontStyle: 'italic', fontFamily: 'var(--serif)', fontWeight: 400, color: 'var(--mint)' }}>showing up</span>.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, alignItems: 'start' }}>
            {/* Team inductions */}
            <div className="card" style={{ padding: 'clamp(24px,3vw,32px)' }}>
              <span className="sticker sticker-sky" style={{ fontSize: 10, marginBottom: 16, display: 'inline-flex' }}>★ join a team</span>
              <h3 className="h-display" style={{ fontSize: 26, lineHeight: 1, margin: '0 0 12px' }}>Team inductions</h3>
              <p style={{ fontFamily: 'var(--eina)', fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)', margin: 0 }}>
                Want ongoing roles and real responsibility? Join the work. We read every application.
                Recruitment for select teams stays open 24/7, so you can grow into a closer,
                more involved part of everything we do.
              </p>
            </div>
            {/* Startups */}
            <div className="card" style={{ padding: 'clamp(24px,3vw,32px)' }}>
              <span className="sticker sticker-grape" style={{ fontSize: 10, marginBottom: 16, display: 'inline-flex' }}>★ student-led startups</span>
              <h3 className="h-display" style={{ fontSize: 26, lineHeight: 1, margin: '0 0 16px' }}>Beyond welfare</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {STARTUPS.map(s => (
                  <div key={s.name} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 16px', borderRadius: 12, border: '2px solid var(--ink)', background: s.color + '14' }}>
                    <span className="sticker" style={{ fontSize: 10, background: s.color, color: '#0A0A0A', flexShrink: 0, whiteSpace: 'nowrap' }}>{s.name}</span>
                    <span style={{ fontFamily: 'var(--eina)', fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-2)' }}>{s.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQs ── */}
      <section id="faqs" style={{ padding: 'clamp(44px,6vw,80px) var(--page-px,24px)' }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <SectionLabel>questions, answered</SectionLabel>
          <h2 className="giant" style={{ fontSize: 'clamp(34px,6vw,68px)', margin: '0 0 32px', lineHeight: 0.9 }}>
            got <span style={{ color: 'var(--mint)' }}>questions?</span>
          </h2>
          <div style={{ border: '2px solid var(--ink)', borderRadius: 18, overflow: 'hidden', background: 'var(--card)' }}>
            {FAQS.map((f, i) => {
              const isOpen = openIdx === i
              return (
                <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? '2px solid var(--ink)' : 'none' }}>
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : i)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                      padding: 'clamp(16px,2.4vw,22px) clamp(16px,2.4vw,24px)', background: isOpen ? 'var(--bg-2)' : 'transparent',
                      border: 'none', cursor: 'pointer', textAlign: 'left', gap: 18, minHeight: 44,
                      transition: 'background 0.15s',
                    }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1 }}>
                      <span className="mono" style={{ fontSize: 11, fontWeight: 700, flexShrink: 0, paddingTop: 4, fontVariantNumeric: 'tabular-nums', color: isOpen ? 'var(--mint)' : 'var(--ink-3)' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 'clamp(15px,1.7vw,18px)', letterSpacing: '-0.01em', color: 'var(--ink)', textWrap: 'balance' }}>
                        {f.q}
                      </span>
                    </div>
                    <motion.svg
                      width="20" height="20" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      animate={{ rotate: isOpen ? 45 : 0 }} transition={spring}
                      style={{ flexShrink: 0, marginTop: 2, color: isOpen ? 'var(--mint)' : 'var(--ink-3)' }}>
                      <path d="M12 5v14M5 12h14" />
                    </motion.svg>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }}
                        transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
                        style={{ overflow: 'hidden' }}>
                        <p style={{ padding: '0 clamp(16px,2.4vw,24px) clamp(18px,2.4vw,24px) 44px', fontFamily: 'var(--eina)', fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)', margin: 0, textWrap: 'pretty' }}>
                          {f.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: 'var(--lemon)', borderTop: '2px solid var(--ink)', padding: 'clamp(48px,8vw,96px) var(--page-px,24px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <Burst size={110} color="#0A0A0A" style={{ position: 'absolute', top: -20, left: '8%', opacity: 0.08 }} />
        <Star size={90} color="#0A0A0A" className="spin-slow" style={{ position: 'absolute', bottom: -10, right: '8%', opacity: 0.08 }} />
        <div className="container" style={{ position: 'relative' }}>
          <span className="sticker sticker-mint" style={{ marginBottom: 18, display: 'inline-flex' }}>★ applications open</span>
          <h2 className="h-display" style={{ fontSize: 'clamp(34px,6vw,68px)', margin: '0 0 12px', lineHeight: 0.92, color: '#0A0A0A' }}>
            ready to show up?
          </h2>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: '#0A0A0A', opacity: 0.72, fontSize: 18, margin: '0 auto 28px', maxWidth: 440 }}>
            Takes 5 minutes. No fees, no experience needed — we read every application.
          </p>
          <Link to="/recruitment" className="btn btn-lg" style={{ background: '#0A0A0A', color: 'var(--lemon)', border: '2px solid #0A0A0A' }}>
            join AquaTerra →
          </Link>
        </div>
      </section>

      {/* Quiet aside for the curious-but-not-ready: see who's already here. */}
      <div style={{ textAlign: 'center', padding: 'clamp(22px,4vw,32px) var(--page-px,24px)' }}>
        <Link to="/members" className="aq-thread-link">1,200+ members already here →</Link>
      </div>

    </div>
  )
}
