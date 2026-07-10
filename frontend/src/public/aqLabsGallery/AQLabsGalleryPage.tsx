import { useEffect, useRef, useState } from 'react'
import { useMeta } from '../../hooks/useMeta'
import { pageMetadata } from '../../lib/metaConfig'
import './aqLabsGallery.css'

const A = (slug: string, file: string) => `/aq-labs-gallery/assets/${slug}/${file}`
const LOGO = '/aq-labs-gallery/assets/aquaterra-logo-color.png'

// Team-name slugs — kept identical to the previous build so any link
// already handed out (a CV, a DM, a saved bookmark) still resolves.
const TEAMS: { id: string; label: string; c: string; glyph: string; cat: string }[] = [
  { id: 'karyaarth', label: 'karyaarth', c: '--tomato', glyph: '★', cat: 'documentary' },
  { id: 'merge-conflicts', label: 'careercompass', c: '--sky', glyph: '◆', cat: 'career data' },
  { id: 'execution-pending', label: 'quirk', c: '--pink', glyph: '✦', cat: 'hardware' },
  { id: 'alter-ego', label: 'wisdom woods', c: '--mint', glyph: '♥', cat: 'ed-game' },
  { id: 'idea-architects', label: 'cirqle rentals', c: '--lemon', glyph: '◆', cat: 'rentals' },
  { id: 'zero-to-deploy', label: 'hunar', c: '--grape', glyph: '★', cat: 'placement' },
  { id: 'idea-not-found', label: 'photon', c: '--sky', glyph: '✦', cat: 'wearable' },
  { id: 'unfiltered-minds', label: 'human manual', c: '--pink', glyph: '♠', cat: 'card game' },
]
const TC: Record<string, string> = {
  '--tomato': 'var(--cream)', '--sky': 'var(--ink)', '--pink': 'var(--ink)',
  '--mint': 'var(--cream)', '--lemon': 'var(--ink)', '--grape': 'var(--cream)',
}
const MARQUEE_ITEMS = ['AQ LABS', '2026', 'KOLKATA', '08 WORKS', 'ONE ROOM', 'STUDENT BUILT', 'GOT OUT OF HAND']
const MARQUEE_DOTS = ['--tomato', '--sky', '--pink', '--mint', '--lemon', '--grape', '--tomato']

function Marquee({ light }: { light?: boolean }) {
  const seg = (offset: 0 | 1) => MARQUEE_ITEMS.map((t, i) => (
    <span key={`${offset}-${t}`} className={i % 2 ? 'o' : undefined}>
      <span className="dot" style={{ ['--mc' as string]: `var(${MARQUEE_DOTS[i % 7]})` }} />
      {t}
    </span>
  ))
  return (
    <div className={'marquee' + (light ? ' light' : '')} aria-hidden="true">
      <div className="mtrack">{seg(0)}{seg(1)}</div>
    </div>
  )
}

function Nameplate({ npRef, glowRef, kicker, word }: { npRef: (el: HTMLDivElement | null) => void; glowRef: (el: HTMLDivElement | null) => void; kicker: string; word: string }) {
  return (
    <div className="nameplate reveal" style={{ ['--i' as string]: 0 }} ref={npRef}>
      <div className="npglow" ref={glowRef} />
      <div className="npkicker">{kicker}</div>
      <h2 className="npword">{word}</h2>
    </div>
  )
}

function EndBand({ c, chapter, next }: { c: string; chapter: string; next: string }) {
  return (
    <div className="endband" style={{ ['--c' as string]: `var(${c})` }}>
      <span>end of chapter {chapter}</span>
      <span>next · {next} ↓</span>
    </div>
  )
}

function Foot({ handle, chapter }: { handle: string; chapter: string }) {
  return <div className="foot"><span>{handle}</span><span>chapter {chapter} / 08</span></div>
}

function CopyLinkPill({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${slug}`
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1600) }
    try { await navigator.clipboard.writeText(url); done() } catch {
      const ta = document.createElement('textarea')
      ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0'
      document.body.appendChild(ta); ta.select()
      try { document.execCommand('copy'); done() } catch { /* clipboard unavailable */ }
      document.body.removeChild(ta)
    }
  }
  return <button className="pill" type="button" onClick={onCopy}>{copied ? '✓ copied' : '⧉ copy chapter link'}</button>
}

export default function AQLabsGalleryPage() {
  useMeta(pageMetadata.aqLabs)
  const rootRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState('karyaarth')
  const [showFab, setShowFab] = useState(false)
  const npRefs = useRef<HTMLDivElement[]>([])
  const glowRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const prevBehavior = document.documentElement.style.scrollBehavior
    const prevPadding = document.documentElement.style.scrollPaddingTop
    document.documentElement.style.scrollBehavior = 'smooth'
    document.documentElement.style.scrollPaddingTop = 'calc(var(--nav-h) + 52px)'

    // idle motion: folder sway + answer-card float
    if (!reduce) {
      root.querySelectorAll<HTMLElement>('.rack a.spine').forEach((sp, i) => {
        sp.classList.add('swayable')
        sp.style.setProperty('--sd', (i * 0.22).toFixed(2) + 's')
      })
      root.querySelectorAll<HTMLElement>('#unfiltered-minds .acard').forEach((ac, i) => {
        ac.classList.add('floaty')
        ac.style.setProperty('--ad', (i * 0.4).toFixed(2) + 's')
      })
    }

    // reveal-on-scroll
    const revealIo = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealIo.unobserve(e.target) } })
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })
    root.querySelectorAll('.chapter').forEach(s => { if (reduce) s.classList.add('in'); else revealIo.observe(s) })

    // scroll-spy for tabs
    const spyIo = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActiveTab(e.target.id) })
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 })
    root.querySelectorAll('section[data-team]').forEach(s => spyIo.observe(s))

    // count-up stats
    const parseStat = (s: string) => {
      const m = s.match(/([0-9]+(?:\.[0-9]+)?)/)
      return m ? { num: parseFloat(m[1]), pre: s.slice(0, m.index), suf: s.slice((m.index ?? 0) + m[1].length) } : null
    }
    const statEls = Array.from(root.querySelectorAll<HTMLElement>('.stat .n'))
    statEls.forEach(el => { el.dataset.target = el.textContent || '' })
    let countIo: IntersectionObserver | null = null
    if (!reduce) {
      const run = (el: HTMLElement) => {
        const p = parseStat(el.dataset.target || ''); if (!p) return
        const dur = 900, t0 = performance.now(), dec = p.num % 1 !== 0 ? 1 : 0
        const step = (t: number) => {
          const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3)
          el.textContent = p.pre + (p.num * e).toFixed(dec) + p.suf
          if (k < 1) requestAnimationFrame(step); else el.textContent = p.pre + p.num.toFixed(dec) + p.suf
        }
        el.textContent = p.pre + '0'.padStart(1, '0') + (dec ? '.0' : '') + p.suf
        requestAnimationFrame(step)
      }
      countIo = new IntersectionObserver(ents => {
        ents.forEach(e => { if (e.isIntersecting) { run(e.target as HTMLElement); countIo!.unobserve(e.target) } })
      }, { threshold: 0.6 })
      statEls.forEach(el => countIo!.observe(el))
    }

    // spotlit nameplates
    const smooth = (t: number) => { t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t) }
    const nps = npRefs.current.filter(Boolean)
    let raf = 0
    if (reduce) {
      nps.forEach(np => {
        const w = np.querySelector<HTMLElement>('.npword'); if (w) { w.style.opacity = '1'; w.style.filter = 'none' }
        const g = np.querySelector<HTMLElement>('.npglow'); if (g) g.style.opacity = '0.32'
      })
    } else {
      const P = { dim: 0.32, bri: 0.6, glow: 0.34 }
      const spotLoop = () => {
        const vh = window.innerHeight, cy = vh / 2
        nps.forEach(np => {
          const w = np.querySelector<HTMLElement>('.npword')
          const g = np.querySelector<HTMLElement>('.npglow')
          if (!w) return
          const r = np.getBoundingClientRect()
          if (r.bottom < -200 || r.top > vh + 200) return
          const c = r.top + r.height / 2
          const e = smooth(1 - Math.abs(c - cy) / (vh * 0.72))
          w.style.opacity = (P.dim + (1 - P.dim) * e).toFixed(3)
          w.style.filter = 'brightness(' + (P.bri + (1 - P.bri) * e).toFixed(3) + ')'
          if (g) g.style.opacity = (e * P.glow).toFixed(3)
        })
        raf = requestAnimationFrame(spotLoop)
      }
      raf = requestAnimationFrame(spotLoop)
    }

    const onScroll = () => setShowFab(window.scrollY > window.innerHeight * 0.8)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      document.documentElement.style.scrollBehavior = prevBehavior
      document.documentElement.style.scrollPaddingTop = prevPadding
      revealIo.disconnect(); spyIo.disconnect(); countIo?.disconnect()
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const registerNp = (i: number) => (el: HTMLDivElement | null) => { if (el) npRefs.current[i] = el }
  const registerGlow = (i: number) => (el: HTMLDivElement | null) => { glowRefs.current[i] = el }

  return (
    <div className="aqlg" ref={rootRef} id="aqlg-root">
      {/* ===== TEAM TABS — page-scoped nav, sits under the real site nav ===== */}
      <div className="tabbar" role="navigation" aria-label="AQ Labs chapters">
        {TEAMS.map((t, i) => (
          <a key={t.id} className={'tab' + (activeTab === t.id ? ' on' : '')} href={`#${t.id}`}
            style={{ ['--c' as string]: `var(${t.c})`, ['--tc' as string]: TC[t.c] }}>
            <span className="tnum">{String(i + 1).padStart(2, '0')}</span>
            <span className="tname">{t.label}</span>
          </a>
        ))}
      </div>

      {/* ===== FAB ===== */}
      <button className={'fab' + (showFab ? ' show' : '')} aria-label="back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>

      {/* ===== 00 INTRO ===== */}
      <section id="top" className="chapter intro dk" style={{ ['--c' as string]: 'var(--mint)', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', paddingTop: 'calc(var(--nav-h) + 52px + 30px)' }}>
        <div className="introglow" style={{ background: 'var(--mint)', opacity: 0.16 }} />
        <div className="floatcard" style={{ ['--r' as string]: '-8deg', top: '9%', left: '2%', width: 180, height: 150 }}><img src={A('karyaarth', 'p1-c.jpg')} alt="" /></div>
        <div className="floatcard" style={{ ['--r' as string]: '-10deg', ['--d' as string]: '.7s', top: '40%', left: '5%', width: 172, height: 150 }}><img src={A('merge-conflicts', 'site1.jpg')} alt="" /></div>
        <div className="floatcard" style={{ ['--r' as string]: '5deg', ['--d' as string]: '1.3s', bottom: '2%', left: '3%', width: 205, height: 150 }}><img src={A('execution-pending', 'site1.jpg')} alt="" /></div>
        <div className="floatcard" style={{ ['--r' as string]: '7deg', ['--d' as string]: '.4s', top: '11%', right: '3%', width: 200, height: 150 }}><img src={A('alter-ego', 'hero-poster.jpg')} alt="" /></div>
        <div className="floatcard" style={{ ['--r' as string]: '8deg', ['--d' as string]: '1s', top: '42%', right: '5%', width: 170, height: 150 }}><img src={A('idea-architects', 'hero-m.jpg')} alt="" /></div>
        <div className="floatcard" style={{ ['--r' as string]: '-6deg', ['--d' as string]: '1.6s', bottom: '2%', right: '2%', width: 150, height: 172 }}><img src={A('zero-to-deploy', 'site.jpg')} alt="" /></div>

        <div className="wrap" style={{ position: 'relative', zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="showpill reveal" style={{ ['--i' as string]: 0, marginBottom: 34 }}>★ AQ LABS '26 · AN AQUATERRA SHOWCASE</div>
          <h1 className="bigtitle reveal" style={{ ['--i' as string]: 1 }}>AQ <span className="lab">Labs</span></h1>
          <p className="lead reveal" style={{ ['--i' as string]: 2, fontSize: 'clamp(18px,2.2vw,25px)', margin: '26px auto 0', maxWidth: 600, color: '#C8C2B4', textTransform: 'uppercase', letterSpacing: '.02em', fontFamily: 'var(--gmono)', fontWeight: 600, lineHeight: 1.5 }}>
            eight teams. eight things that didn't exist six weeks ago, and now do.
          </p>
          <a className="walkbtn reveal" style={{ ['--i' as string]: 3, marginTop: 40 }} href="#karyaarth">walk the gallery <span className="arr">↓</span></a>
          <div className="sectlabel reveal" style={{ ['--i' as string]: 4, margin: '52px 0 4px' }}>// or pull a folder</div>
          <div className="rack reveal" style={{ ['--i' as string]: 4, width: '100%' }}>
            <div className="spine cover"><span className="cbar">▚</span><span className="ctitle">AQ LABS</span><span className="cmeta">08 works · 01 room</span></div>
            {TEAMS.map((t, i) => (
              <a key={t.id} className="spine" href={`#${t.id}`} style={{ ['--c' as string]: `var(${t.c})`, ['--tc' as string]: TC[t.c] }}>
                <span className="snum2">{String(i + 1).padStart(2, '0')}</span>
                <span className="sname2">{t.label}</span>
                <span className="scat2">{t.cat}</span>
                <span className="sglyph2">{t.glyph}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Marquee />

      {/* ===== 01 KARYAARTH ===== */}
      <section id="karyaarth" className="chapter dk" data-team="" style={{ ['--c' as string]: 'var(--tomato)' }}>
        <div className="wrap">
          <Nameplate npRef={registerNp(0)} glowRef={registerGlow(0)} kicker="chapter 01 · karyaarth · documentary" word="KARYAARTH" />
          <div className="split">
            <div className="stack">
              <h2 className="pull reveal" style={{ ['--i' as string]: 1 }}>the people who keep your city running. <span className="hl">documented properly, for once.</span></h2>
              <p className="lead reveal" style={{ ['--i' as string]: 2 }}>before it was a project, it was a question. who are the people we walk past every day and never actually see? a camera answered it. the ice cream cart. the tea stall. the man who has fixed shoes on the same corner for thirty years. turns out everyone has a story, once someone finally sits down long enough to hear it.</p>
              <div className="pills reveal" style={{ ['--i' as string]: 3 }}>
                <a className="pill solid" href="https://youtube.com/@karyaarth" target="_blank" rel="noopener noreferrer">▶ watch on youtube</a>
                <a className="pill" href="https://www.instagram.com/karyaarth" target="_blank" rel="noopener noreferrer">◎ @karyaarth</a>
              </div>
            </div>
            <div className="reveal" style={{ ['--i' as string]: 2 }}>
              <div className="macwin"><div className="macbar"><i className="r" /><i className="y" /><i className="g" /></div><img src={A('karyaarth', 'p1-c.jpg')} alt="karyaarth street vendor documentary" /></div>
            </div>
          </div>
          <div className="sectlabel reveal" style={{ ['--i' as string]: 0, margin: '48px 0 16px' }}>the field record</div>
          <div className="wall reveal" style={{ ['--i' as string]: 1 }}>
            <div><img src={A('karyaarth', 'p2-c.jpg')} alt="a tea stall owner mid-pour at his roadside counter" /></div>
            <div><img src={A('karyaarth', 'p3-c.jpg')} alt="an ice cream cart vendor waiting for customers" /></div>
            <div><img src={A('karyaarth', 'p4-c.jpg')} alt="a street craftsman at work with his tools" /></div>
            <div><img src={A('karyaarth', 'p5-c.jpg')} alt="a vendor arranging goods at his stall" /></div>
            <div><img src={A('karyaarth', 'p6-c.jpg')} alt="a shopkeeper behind his counter at dusk" /></div>
            <div><img src={A('karyaarth', 'p7-m.jpg')} alt="a roadside seller framed against the street" /></div>
            <div><img src={A('karyaarth', 'p8-m.jpg')} alt="hands at work preparing food on a cart" /></div>
            <div><img src={A('karyaarth', 'p9-c.jpg')} alt="a portrait of a local vendor looking to camera" /></div>
            <div><img src={A('karyaarth', 'p10-c.jpg')} alt="a street performer captured mid-act" /></div>
          </div>
          <Foot handle="@karyaarth" chapter="01" />
        </div>
      </section>
      <EndBand c="--sky" chapter="01" next="careercompass" />

      {/* ===== 02 CAREERCOMPASS ===== */}
      <section id="merge-conflicts" className="chapter" data-team="" style={{ ['--c' as string]: 'var(--sky)' }}>
        <div className="wrap">
          <Nameplate npRef={registerNp(1)} glowRef={registerGlow(1)} kicker="chapter 02 · merge conflicts · careercompass" word="CAREERCOMPASS" />
          <div className="split">
            <div className="stack">
              <h2 className="pull reveal" style={{ ['--i' as string]: 1 }}>a compass doesn't choose your direction. <span className="hl">it refuses to let you walk confidently the wrong way.</span></h2>
              <p className="lead reveal" style={{ ['--i' as string]: 2 }}>the counsellor said follow your passion and left the room. that was the whole plan. meanwhile india trains millions and still cannot fill the jobs that matter, the surplus and the shortage sitting in the same country, different rooms, never introduced. careercompass is the introduction: a tool that reads what industries actually need against what students actually study, and hands you a direction instead of a shrug.</p>
              <div className="pills reveal" style={{ ['--i' as string]: 3 }}>
                <a className="pill solid" href="https://careerrcompassindia.netlify.app" target="_blank" rel="noopener noreferrer">↗ visit site</a>
                <CopyLinkPill slug="merge-conflicts" />
              </div>
            </div>
            <div className="reveal" style={{ ['--i' as string]: 2 }}>
              <div className="sectlabel" style={{ marginBottom: 14 }}>the gap, in plain numbers</div>
              <div className="stats">
                <div className="stat"><div className="n">1.5 CR</div><div className="l">higher-ed grads / year</div></div>
                <div className="stat fill onlight" style={{ ['--c' as string]: 'var(--sky)' }}><div className="n">42.6%</div><div className="l">overall employability</div></div>
                <div className="stat"><div className="n">25%</div><div className="l">digital talent gap</div></div>
                <div className="stat fill ondark" style={{ ['--c' as string]: 'var(--grape)' }}><div className="n">25 L</div><div className="l">emigrating / year</div></div>
              </div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '.12em', color: 'var(--ink3)', marginTop: 14 }}>sources · aishe 2021-22 · mercer mettl 2025 · nasscom · smile foundation 2024</div>
            </div>
          </div>
          <div className="livetag reveal" style={{ ['--i' as string]: 0, margin: '52px 0 0' }}><span className="blip" />this isn't a mockup · it's live</div>
          <div className="grid2 reveal" style={{ ['--i' as string]: 1, marginTop: 16 }}>
            <div className="browser"><div className="bb"><i /><i /><i /></div><img src={A('merge-conflicts', 'site1.jpg')} alt="careercompass overview" /></div>
            <div className="browser"><div className="bb"><i /><i /><i /></div><img src={A('merge-conflicts', 'site3.jpg')} alt="careercompass find your path" /></div>
          </div>
          <Foot handle="@ngo.aquaterra" chapter="02" />
        </div>
      </section>
      <EndBand c="--pink" chapter="02" next="quirk" />

      {/* ===== 03 QUIRK ===== */}
      <section id="execution-pending" className="chapter dk" data-team="" style={{ ['--c' as string]: 'var(--pink)' }}>
        <div className="wrap">
          <Nameplate npRef={registerNp(2)} glowRef={registerGlow(2)} kicker="chapter 03 · execution pending · quirk · hardware" word="QUIRK" />
          <div className="split">
            <div className="stack">
              <h2 className="pull reveal" style={{ ['--i' as string]: 1 }}>built by teenagers <span className="hl">who got bored.</span></h2>
              <p className="lead reveal" style={{ ['--i' as string]: 2 }}>it started because someone could not sit still in class. not a fidget toy, not another app screaming for attention, something in between. what came out of the soldering iron was a pressure pad, a score, an OLED screen small enough to lose. five games run today. the enclosure is still a breadboard on a table, and honestly that is the most honest part of it.</p>
              <div className="pills reveal" style={{ ['--i' as string]: 3 }}>
                <a className="pill solid" href="https://quirkbyaq.vercel.app" target="_blank" rel="noopener noreferrer">↗ quirkbyaq.vercel.app</a>
              </div>
            </div>
            <div className="reveal" style={{ ['--i' as string]: 2 }}>
              <div className="frame shadow-c" style={{ aspectRatio: '16/10' }}><img src={A('execution-pending', 'v1-poster.jpg')} alt="quirk console" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
            </div>
          </div>
          <div className="sectlabel reveal" style={{ ['--i' as string]: 0, margin: '48px 0 16px' }}>the build log</div>
          <div className="grid2 reveal" style={{ ['--i' as string]: 1 }}>
            <div className="frame" style={{ aspectRatio: '16/10' }}><img src={A('execution-pending', 'board.jpg')} alt="quirk breadboard" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
            <div className="frame" style={{ aspectRatio: '16/10' }}><img src={A('execution-pending', 'v2-poster.jpg')} alt="quirk gameplay" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
          </div>
          <div className="livetag reveal" style={{ ['--i' as string]: 0, margin: '52px 0 0' }}><span className="blip" />this isn't a mockup · it's live</div>
          <div className="grid2 reveal" style={{ ['--i' as string]: 1, marginTop: 16 }}>
            <div className="browser"><div className="bb"><i /><i /><i /></div><img src={A('execution-pending', 'site1.jpg')} alt="meet quirk" /></div>
            <div className="browser"><div className="bb"><i /><i /><i /></div><img src={A('execution-pending', 'site2.jpg')} alt="quirk games" /></div>
          </div>
          <Foot handle="@ngo.aquaterra" chapter="03" />
        </div>
      </section>
      <EndBand c="--mint" chapter="03" next="wisdom woods" />

      {/* ===== 04 WISDOM WOODS ===== */}
      <section id="alter-ego" className="chapter" data-team="" style={{ ['--c' as string]: 'var(--mint)', background: 'var(--cream2)' }}>
        <div className="wrap">
          <Nameplate npRef={registerNp(3)} glowRef={registerGlow(3)} kicker="chapter 04 · alter ego · wisdom woods" word="WISDOM WOODS" />
          <div className="split wide-media">
            <div className="stack">
              <h2 className="pull reveal" style={{ ['--i' as string]: 1 }}>learning that <span className="hl">forgets it's learning.</span></h2>
              <p className="lead reveal" style={{ ['--i' as string]: 2 }}>a nine-year-old shuts a worksheet and opens a game in the same breath. one is a wall, the other an open door. wisdom woods hides the worksheet inside the game: vocabulary, logic and general knowledge for classes 3 to 7, dressed as an expedition. clear a level, earn an avatar, come back tomorrow. the trick is that they want to.</p>
              <div className="pills reveal" style={{ ['--i' as string]: 3 }}>
                <a className="pill solid" href="https://dipdagod.github.io/Wisdom-Woods/main.html" target="_blank" rel="noopener noreferrer">↗ play the demo</a>
                <a className="pill" href="https://www.instagram.com/wisdomwoods26" target="_blank" rel="noopener noreferrer">◎ @wisdomwoods26</a>
              </div>
            </div>
            <div className="reveal" style={{ ['--i' as string]: 2 }}>
              <div className="frame shadow-c" style={{ aspectRatio: '9/16', maxHeight: '70vh', margin: '0 auto', width: 'fit-content' }}><img src={A('alter-ego', 'hero-poster.jpg')} alt="wisdom woods app" style={{ height: '70vh', width: 'auto', maxWidth: '100%', objectFit: 'cover' }} /></div>
            </div>
          </div>
          <div className="sectlabel reveal" style={{ ['--i' as string]: 0, margin: '48px 0 16px' }}>what explorers see</div>
          <div className="grid2 reveal" style={{ ['--i' as string]: 1 }}>
            <figure style={{ margin: 0 }}><div className="browser"><div className="bb"><i /><i /><i /></div><img src={A('alter-ego', 'app1-m.jpg')} alt="enter the woods" /></div><figcaption className="cap" style={{ marginTop: 12 }}>pick a name, a place, an age. the woods set the difficulty, not a settings menu.</figcaption></figure>
            <figure style={{ margin: 0 }}><div className="browser"><div className="bb"><i /><i /><i /></div><img src={A('alter-ego', 'app2-m.jpg')} alt="world explorer quiz" /></div><figcaption className="cap" style={{ marginTop: 12 }}>world explorer. real geography, dressed as an expedition.</figcaption></figure>
          </div>
          <Foot handle="@wisdomwoods26" chapter="04" />
        </div>
      </section>
      <EndBand c="--lemon" chapter="04" next="cirqle rentals" />

      {/* ===== 05 CIRQLE ===== */}
      <section id="idea-architects" className="chapter" data-team="" style={{ ['--c' as string]: 'var(--lemon)' }}>
        <div className="wrap">
          <Nameplate npRef={registerNp(4)} glowRef={registerGlow(4)} kicker="chapter 05 · idea architects · cirqle rentals" word="CIRQLE RENTALS" />
          <div className="split">
            <div className="stack">
              <h2 className="pull reveal" style={{ ['--i' as string]: 1 }}>borrow the drill. <span className="hl" style={{ color: 'var(--tomato)' }}>keep the money.</span></h2>
              <p className="lead reveal" style={{ ['--i' as string]: 2 }}>you bought the drill, used it twice, and it has sat in a drawer for a decade. so has your neighbour's. cirqle noticed that quiet waste and built the loop that fixes it: location-based whatsapp groups where people rent what they need and lend what they own. borrow the drill, keep the money, and a neighbourhood slowly learns to trust itself.</p>
              <div className="loop reveal" style={{ ['--i' as string]: 3, justifyContent: 'flex-start' }}>
                <div className="loopnode" style={{ background: 'var(--card)' }}>rent</div>
                <span className="looparrow" style={{ color: 'var(--tomato)' }}>→</span>
                <div className="loopnode" style={{ background: 'var(--pink)', color: 'var(--cream)', borderColor: 'var(--ink)' }}>lend</div>
                <span className="looparrow" style={{ color: 'var(--tomato)' }}>→</span>
                <div className="loopnode" style={{ background: 'var(--grape)', color: 'var(--cream)', borderColor: 'var(--ink)' }}>repeat</div>
              </div>
              <div className="pills reveal" style={{ ['--i' as string]: 4 }}>
                <a className="pill" href="https://www.instagram.com/p/DZLEszYk031/" target="_blank" rel="noopener noreferrer">◎ see it on instagram</a>
              </div>
            </div>
            <div className="reveal" style={{ ['--i' as string]: 2 }}>
              <div className="frame shadow" style={{ aspectRatio: '1/1' }}><img src={A('idea-architects', 'hero-m.jpg')} alt="cirqle rentals" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} /></div>
            </div>
          </div>
          <Foot handle="@ngo.aquaterra" chapter="05" />
        </div>
      </section>
      <EndBand c="--grape" chapter="05" next="hunar" />

      {/* ===== 06 HUNAR ===== */}
      <section id="zero-to-deploy" className="chapter dk" data-team="" style={{ ['--c' as string]: 'var(--grape)' }}>
        <div className="wrap">
          <Nameplate npRef={registerNp(5)} glowRef={registerGlow(5)} kicker="chapter 06 · zero to deploy · hunar" word="HUNAR" />
          <div className="split">
            <div className="stack">
              <h2 className="pull reveal" style={{ ['--i' as string]: 1 }}>not a training problem. <span className="hl">a placement problem.</span></h2>
              <p className="lead reveal" style={{ ['--i' as string]: 2 }}>a qualified graduate finishes the course, holds the certificate, and still cannot get seen. everyone kept building more training; hunar realised that was never the gap. the break happens after the certificate, in a market that cannot find these people and cannot verify they are real. so hunar rebuilt the part everyone skips. that's not a UI choice. that's an argument about what trust is actually made of.</p>
              <div className="pills reveal" style={{ ['--i' as string]: 3 }}>
                <a className="pill solid" href="https://hunar-one.vercel.app" target="_blank" rel="noopener noreferrer">↗ visit the project</a>
              </div>
            </div>
            <div className="reveal" style={{ ['--i' as string]: 2 }}>
              <div className="sectlabel" style={{ marginBottom: 16 }}>where trust comes from, weighted</div>
              <div className="bars">
                <div className="bar"><div className="brow"><span className="bl">institute</span><span className="bv">highest</span></div><div className="btrack"><div className="bfill" style={{ ['--w' as string]: '100%' }} /></div></div>
                <div className="bar"><div className="brow"><span className="bl">employer</span><span className="bv">high</span></div><div className="btrack"><div className="bfill" style={{ ['--w' as string]: '78%' }} /></div></div>
                <div className="bar"><div className="brow"><span className="bl">portfolio</span><span className="bv">moderate</span></div><div className="btrack"><div className="bfill" style={{ ['--w' as string]: '52%' }} /></div></div>
                <div className="bar"><div className="brow"><span className="bl">peer</span><span className="bv">low</span></div><div className="btrack"><div className="bfill" style={{ ['--w' as string]: '28%' }} /></div></div>
                <div className="bar"><div className="brow"><span className="bl">self-declared</span><span className="bv">none</span></div><div className="btrack"><div className="bfill" style={{ ['--w' as string]: '6%' }} /></div></div>
              </div>
            </div>
          </div>
          <div className="livetag reveal" style={{ ['--i' as string]: 0, margin: '52px 0 0' }}><span className="blip" />this isn't a mockup · it's live</div>
          <div className="reveal" style={{ ['--i' as string]: 1, marginTop: 16 }}>
            <div className="macwin"><div className="macbar"><i className="r" /><i className="y" /><i className="g" /><span className="macurl">hunar-one.vercel.app</span></div><img src={A('zero-to-deploy', 'site.jpg')} alt="hunar live site" /></div>
          </div>
          <Foot handle="@ngo.aquaterra" chapter="06" />
        </div>
      </section>
      <EndBand c="--sky" chapter="06" next="photon" />

      {/* ===== 07 PHOTON / MODUS BAND ===== */}
      <section id="idea-not-found" className="chapter dk" data-team="" style={{ ['--c' as string]: 'var(--sky)' }}>
        <div className="wrap">
          <Nameplate npRef={registerNp(6)} glowRef={registerGlow(6)} kicker="chapter 07 · 404 idea not found · photon" word="PHOTON" />
          <div className="split">
            <div className="stack">
              <div className="chapnum reveal" style={{ ['--i' as string]: 0 }}>pitched as "photon" · built as <span style={{ color: 'var(--c)' }}>Modus Band</span></div>
              <p className="pull reveal" style={{ ['--i' as string]: 1, color: '#B8B2A4', fontSize: 'clamp(30px,5vw,58px)' }}>no screen. <span className="hl">no noise.</span></p>
              <p className="lead reveal" style={{ ['--i' as string]: 3 }}>the room is already full of screens, each one asking for a little more of you. photon is the wearable that asks for nothing. it reads your body through light and motion, tracks what matters, then goes quiet. you check it when you want to, not when it demands. technology you wear, not technology you serve.</p>
              <div className="pills reveal" style={{ ['--i' as string]: 4 }}>
                <span className="pill" style={{ cursor: 'default', opacity: 0.7 }}>◷ no live link yet</span>
              </div>
            </div>
            <div className="reveal" style={{ ['--i' as string]: 2 }}>
              <div className="grid2" style={{ gap: 14 }}>
                <div className="frame" style={{ aspectRatio: '1' }}><img src={A('idea-not-found', 'p1-m.jpg')} alt="photon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                <div className="frame" style={{ aspectRatio: '1' }}><img src={A('idea-not-found', 'p2.jpg')} alt="photon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                <div className="frame" style={{ aspectRatio: '1' }}><img src={A('idea-not-found', 'p3.jpg')} alt="photon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                <div className="frame" style={{ aspectRatio: '1' }}><img src={A('idea-not-found', 'p4.jpg')} alt="photon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
              </div>
            </div>
          </div>
          <Foot handle="@ngo.aquaterra" chapter="07" />
        </div>
      </section>
      <EndBand c="--pink" chapter="07" next="the human manual" />

      {/* ===== 08 THE HUMAN MANUAL ===== */}
      <section id="unfiltered-minds" className="chapter dk" data-team="" style={{ ['--c' as string]: 'var(--pink)' }}>
        <div className="wrap">
          <Nameplate npRef={registerNp(7)} glowRef={registerGlow(7)} kicker="chapter 08 · unfiltered minds · the human manual" word="THE HUMAN MANUAL" />
          <div className="split">
            <div className="stack">
              <h2 className="pull reveal" style={{ ['--i' as string]: 1 }}>a thousand questions about you. <span className="hl">no filters, no advice, no adults.</span></h2>
              <p className="lead reveal" style={{ ['--i' as string]: 2 }}>everyone hands teenagers advice and nobody hands them the manual. unfiltered minds wrote it as a deck instead of a lecture: a thousand questions you already ask yourself at 2am, sorted into suits you can actually name. pick your poison, draw a prompt, fill the blank honestly. it is teen psychology with the filter taken off, played against the only opponent who knows the answers. you.</p>
              <div className="pills reveal" style={{ ['--i' as string]: 3 }}>
                <a className="pill solid" href="https://human-manual.vercel.app/" target="_blank" rel="noopener noreferrer">↗ play the human manual</a>
                <CopyLinkPill slug="unfiltered-minds" />
              </div>
            </div>
            <div className="reveal" style={{ ['--i' as string]: 2 }}>
              <div className="promptbar">
                <div className="pmeta">prompt · free · 01</div>
                <div className="ptext">when everything's due at once, I <span className="bk">___________</span>.</div>
              </div>
              <div className="answers" style={{ marginTop: 16 }}>
                <div className="acard" style={{ ['--rot' as string]: '-5deg' }}><span className="al">answer</span><span className="at">lock in and do the obvious thing</span></div>
                <div className="acard" style={{ ['--rot' as string]: '3deg' }}><span className="al">answer</span><span className="at">take a strategic nap</span></div>
                <div className="acard blank" style={{ ['--rot' as string]: '8deg' }}><span className="al">blank</span><span className="at">say the real one yourself</span></div>
              </div>
            </div>
          </div>
          <div className="sectlabel reveal" style={{ ['--i' as string]: 0, margin: '30px 0 14px' }}>choose a suit · or just draw from the top</div>
          <div className="suits reveal" style={{ ['--i' as string]: 1 }}>
            <div className="suit ondark" style={{ ['--sc' as string]: 'var(--pink)' }}><span className="sglyph">⧖</span><span className="snum">01</span><span className="sname">Procrastination</span><span className="ssub">the mechanics of later</span><span className="sfoot"><span>3 prompts</span><span>draw →</span></span></div>
            <div className="suit onlight" style={{ ['--sc' as string]: 'var(--lemon)' }}><span className="sglyph">◈</span><span className="snum">02</span><span className="sname">Money</span><span className="ssub">why it felt like a personality</span><span className="sfoot"><span>3 prompts</span><span>draw →</span></span></div>
            <div className="suit onlight" style={{ ['--sc' as string]: 'var(--psky)' }}><span className="sglyph">◲</span><span className="snum">03</span><span className="sname">Stress &amp; Freeze</span><span className="ssub">the body acting without asking</span><span className="sfoot"><span>3 prompts</span><span>draw →</span></span></div>
            <div className="suit ondark" style={{ ['--sc' as string]: 'var(--grape)' }}><span className="sglyph">☾</span><span className="snum">04</span><span className="sname">Impulse &amp; Regret</span><span className="ssub">the 2am decision pipeline</span><span className="sfoot"><span>3 prompts</span><span>draw →</span></span></div>
            <div className="suit onlight" style={{ ['--sc' as string]: 'var(--ptom)' }}><span className="sglyph">☰</span><span className="snum">05</span><span className="sname">The Stories You Tell</span><span className="ssub">the lies with good PR</span><span className="sfoot"><span>3 prompts</span><span>draw →</span></span></div>
            <div className="suit deck"><span className="sglyph">▦</span><span className="sname">Top of Deck</span><span className="ssub" style={{ opacity: 0.7 }}>random suit, dealer's choice</span></div>
          </div>
          <Foot handle="@unfilteredminds" chapter="08" />
        </div>
      </section>

      {/* ===== OUTRO ===== */}
      <Marquee light />
      <section className="chapter" style={{ ['--c' as string]: 'var(--tomato)', textAlign: 'center', paddingTop: 96, paddingBottom: 120 }}>
        <div className="wrap">
          <div className="mono reveal" style={{ ['--i' as string]: 0, fontSize: 12, letterSpacing: '.26em', color: 'var(--ink3)', marginBottom: 22 }}>✦ end of the exhibition</div>
          <h2 className="disp reveal" style={{ ['--i' as string]: 1, fontSize: 'clamp(52px,11vw,150px)' }}>THAT'S THE SHOW.</h2>
          <p className="lead reveal" style={{ ['--i' as string]: 2, margin: '22px auto 0', maxWidth: 520 }}>eight teams. one room in kolkata that got out of hand. the resources they used are open. go build the next one.</p>
          <div className="pills reveal" style={{ ['--i' as string]: 3, justifyContent: 'center', marginTop: 40 }}>
            <a className="pill solid" style={{ ['--c' as string]: 'var(--pmint)' }} href="#top">↑ back to the top</a>
            <a className="pill" href="https://www.instagram.com/ngo.aquaterra" target="_blank" rel="noopener noreferrer">→ @ngo.aquaterra</a>
          </div>
        </div>
      </section>
      <img src={LOGO} alt="" width={1} height={1} style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} />
    </div>
  )
}
