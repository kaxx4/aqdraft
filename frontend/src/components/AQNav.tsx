import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { hasLeaderAccess } from '../lib/roles'
import { notificationService } from '../services/notificationService'

// SVG Icons matching the prototype
const SearchSVG = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const PlusSVG = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const BellSVG = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0"/>
  </svg>
)
const SparklesSVG = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0l1.5 6.5L20 8l-6.5 1.5L12 16l-1.5-6.5L4 8l6.5-1.5z"/>
    <path d="M19 14l.7 3 3 .7-3 .7L19 22l-.7-3-3-.7 3-.7z"/>
  </svg>
)
const WaveSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M2 12c2 0 2-3 5-3s3 3 5 3 3-3 5-3 3 3 5 3"/>
    <path d="M2 17c2 0 2-3 5-3s3 3 5 3 3-3 5-3 3 3 5 3"/>
  </svg>
)
const BoltSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)
const FlagSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
    <line x1="4" y1="22" x2="4" y2="15"/>
  </svg>
)
const FlaskSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M9 2v6.5L4 18a2 2 0 001.8 3h12.4a2 2 0 001.8-3l-5-9.5V2"/>
    <line x1="7" y1="2" x2="17" y2="2"/>
    <line x1="7.5" y1="13" x2="16.5" y2="13"/>
  </svg>
)
const PenSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M12 19l7-7 3 3-7 7H12v-3z"/>
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
  </svg>
)
const GlobeSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15 15 0 010 20 15 15 0 010-20z"/>
  </svg>
)

interface AQNavProps {
  onCompose?: () => void
}

export default function AQNav({ onCompose }: AQNavProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { member, isAuthenticated, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  const path = location.pathname

  // Bell badge — unread notification count.
  //
  // On /notifications we DON'T refetch: that page marks-everything-read
  // on a 1.5s delay, so an immediate refetch here would read the still-
  // unread count and bounce the badge back to its old non-zero value
  // while the user sits on the page. Instead we trust the optimistic 0
  // and let the next real navigation re-sync.
  //
  // Elsewhere we use the lightweight head-count query (getUnreadCount —
  // a single `count: exact, head: true` request) instead of list({limit:1})
  // which fired two round-trips and pulled a full row needlessly.
  useEffect(() => {
    if (!isAuthenticated) { setUnreadCount(0); return }
    if (path === '/notifications') { setUnreadCount(0); return }
    let cancelled = false
    notificationService.getUnreadCount()
      .then(n => { if (!cancelled) setUnreadCount(n) })
      .catch(() => { /* keep the previous count on transient failures */ })
    return () => { cancelled = true }
  }, [isAuthenticated, path])

  // (Previously used to switch between "Log in" for returning visitors and
  // "Join" for first-timers. During the pre-login phase the nav shows a
  // single "Apply →" CTA for everyone, so the flag is unused.) The localStorage
  // write is kept so the flag is ready to use the moment login is re-enabled.
  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('aq_visited', '1')
  }, [])

  const isDirector = hasLeaderAccess(member?.role)
  const hodVisited = typeof window !== 'undefined' && !!localStorage.getItem('aq_hod_visited')
  const showHodPulse = isDirector && !hodVisited && !path.startsWith('/director')

  const navLinks = [
    { href: '/', label: 'Home', icon: <WaveSVG /> },
    { href: '/projects', label: 'Projects', icon: <BoltSVG /> },
    { href: '/teams', label: 'Teams', icon: <FlagSVG /> },
    { href: '/aq-labs', label: 'AQ Labs', icon: <FlaskSVG /> },
    // Blog hidden for directors — they have the director desk for moderation
    ...(!isAuthenticated || !isDirector ? [{ href: '/blog', label: 'Blog', icon: <PenSVG /> }] : []),
    { href: '/about', label: 'About', icon: <GlobeSVG /> },
    // Arcade hidden
  ]

  // Mobile hamburger sheet — secondary/discovery pages (primary nav is in the bottom bar)
  const mobileSheetLinks = [
    { href: '/projects',        label: 'Projects',       icon: <BoltSVG /> },
    { href: '/aq-labs',         label: 'AQ Labs',        icon: <FlaskSVG /> },
    { href: '/blog',            label: 'Blog',           icon: <PenSVG /> },
    { href: '/opportunities',   label: 'Openings',       icon: <SparklesSVG /> },
    { href: '/contact',         label: 'Contact',        icon: <GlobeSVG /> },
    { href: '/collaborations',  label: 'Collaborations', icon: <WaveSVG /> },
    { href: '/about',           label: 'About',          icon: <GlobeSVG /> },
  ]

  const isActive = (href: string) => {
    if (href === '/') return path === '/' || path === '/feed'
    return path.startsWith(href)
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { setShowMobileMenu(false) }, [path])

  // Dynamic theme-color — merges browser chrome with current page background
  useEffect(() => {
    const meta = document.getElementById('aq-theme-color') as HTMLMetaElement | null
    if (!meta) return
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#F4EFE0'
    meta.content = bg
  }, [path])

  // Shake animation on disabled button clicks
  useEffect(() => {
    function handleDisabledClick(e: MouseEvent) {
      const btn = (e.target as HTMLElement).closest('button:disabled, button[aria-disabled="true"]') as HTMLElement | null
      if (!btn) return
      btn.classList.remove('btn-shake')
      void btn.offsetWidth // force reflow to restart animation
      btn.classList.add('btn-shake')
      btn.addEventListener('animationend', () => btn.classList.remove('btn-shake'), { once: true })
    }
    document.addEventListener('click', handleDisabledClick, true)
    return () => document.removeEventListener('click', handleDisabledClick, true)
  }, [])

  const initials = member?.full_name
    ? member.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'
  const AVATAR_COLORS = ['#00E5A0','#FF6BD6','#FFC700','#7E5BFF','#FF7A1A','#3DA9FC']
  const hashColor = (s: string) => { let h = 0; for (let i = 0; i < (s?.length || 0); i++) h = s.charCodeAt(i) + ((h << 5) - h); return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length] }
  const avatarColor = hashColor(member?.full_name || member?.email || 'U')
  const avatarUrl = (member as any)?.avatar_url

  return (
    <>
      {/* Global keyframes for HoD pulse dot */}
      <style>{`@keyframes hodPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.5)}}`}</style>
      {/* Skip to main content — keyboard/screen reader users */}
      <a href="#main-content" className="skip-to-main">Skip to main content</a>
      <nav className="aq-nav" role="navigation" aria-label="Primary">
        <div className="aq-nav-inner">
          {/* LEFT — hamburger (mobile only) + logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              id="aq-hamburger-left"
              className="aq-nav-icon-btn aq-hamburger-left-btn"
              onClick={() => setShowMobileMenu(v => !v)}
              aria-label={showMobileMenu ? 'Close menu' : 'Open menu'}
              aria-expanded={showMobileMenu}
            >
              {/* Contextual icon animation (Principle 7): both icons live
                  in the DOM, one absolute-positioned, and they cross-fade
                  with scale + blur on toggle. cubic-bezier(0.2,0,0,1) is
                  the same easing used everywhere else for "snappy but soft"
                  motion. No motion library needed here — pure CSS. */}
              <span className="aq-icon-swap" aria-hidden>
                <svg
                  className={`aq-icon-swap-frame ${showMobileMenu ? 'is-hidden' : 'is-visible'}`}
                  width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                >
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
                <svg
                  className={`aq-icon-swap-frame ${showMobileMenu ? 'is-visible' : 'is-hidden'}`}
                  width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </span>
            </button>
            <button className="aq-logo" onClick={() => navigate('/')} aria-label="AquaTerra home">
              <img src="/logo.png" alt="AquaTerra" className="aq-logo-img no-outline" />
            </button>
          </div>

          {/* CENTER — floating pill */}
          <div className="aq-nav-pill">
            {navLinks.map(l => (
              <button
                key={l.href}
                className={'aq-nav-link' + (isActive(l.href) ? ' active' : '')}
                aria-current={isActive(l.href) ? 'page' : undefined}
                onClick={() => navigate(l.href)}
                data-nav
              >
                <span className="aq-nav-link-icon">{l.icon}</span>
                <span className="aq-nav-link-label">{l.label}</span>
              </button>
            ))}
            {isAuthenticated && isDirector && (
              <button
                className={'aq-nav-link aq-nav-link-director' + (path.startsWith('/director') ? ' active' : '')}
                onClick={() => {
                  localStorage.setItem('aq_hod_visited', '1')
                  navigate('/director')
                }}
                data-nav
                style={{ position: 'relative' }}
              >
                <span className="aq-nav-link-icon" style={{ position: 'relative' }}>
                  <SparklesSVG />
                  {showHodPulse && (
                    <span style={{
                      position: 'absolute',
                      top: -3,
                      right: -3,
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: 'var(--pink)',
                      animation: 'hodPulse 1.4s ease-in-out infinite',
                      display: 'block',
                    }} />
                  )}
                </span>
                <span className="aq-nav-link-label">HoD Desk</span>
                <span className="chip" style={{ background: 'var(--lemon)', color: '#0A0A0A', fontWeight: 700, fontSize: 9, padding: '1px 5px', marginLeft: 4, lineHeight: '14px' }}>
                  NEW
                </span>
              </button>
            )}
          </div>

          {/* RIGHT — actions */}
          <div className="aq-nav-actions">
            <button
              className={'aq-nav-icon-btn' + (path === '/search' ? ' active' : '')}
              onClick={() => navigate('/search')}
              title="Search"
              aria-label="Search"
            >
              <SearchSVG />
            </button>

            {isAuthenticated ? (
              <>
                <button
                  className="btn btn-sm btn-primary aq-post-btn"
                  onClick={onCompose}
                  title="New post"
                >
                  <PlusSVG />
                  <span className="aq-post-label">Post</span>
                </button>
                <button
                  className={'aq-nav-icon-btn' + (path === '/saved' ? ' active' : '')}
                  onClick={() => navigate('/saved')}
                  title="Saved posts"
                  aria-label="Saved posts"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={path === '/saved' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                </button>
                {isDirector ? (
                  <button
                    className={'aq-nav-icon-btn' + (path.startsWith('/director') ? ' active' : '')}
                    onClick={() => { localStorage.setItem('aq_hod_visited', '1'); navigate('/director') }}
                    title="HoD Desk"
                    aria-label="HoD Desk"
                    style={{ position: 'relative' }}
                  >
                    <SparklesSVG />
                    {showHodPulse && (
                      <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: 'var(--pink)', animation: 'hodPulse 1.4s ease-in-out infinite', display: 'block' }} />
                    )}
                  </button>
                ) : (
                  <button
                    className={'aq-nav-icon-btn aq-nav-icon-bell' + (path === '/notifications' ? ' active' : '')}
                    onClick={() => navigate('/notifications')}
                    title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
                    aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
                  >
                    <BellSVG />
                    {unreadCount > 0 && (
                      <span
                        className="aq-bell-dot"
                        aria-hidden
                        style={{
                          // Override the pulse-only dot with a count pill
                          // when there are unreads. Wider variant for 10+.
                          width: unreadCount > 9 ? 18 : 14,
                          height: 14,
                          borderRadius: 7,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--display)',
                          fontSize: 9,
                          fontWeight: 700,
                          color: '#0A0A0A',
                          lineHeight: 1,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                )}
                <div ref={menuRef} className="aq-avatar-wrapper" style={{ position: 'relative' }}>
                  <button
                    className="aq-avatar-btn"
                    onClick={() => setShowUserMenu(v => !v)}
                    title="Your profile"
                    aria-label="Your profile"
                    aria-expanded={showUserMenu}
                    aria-haspopup="menu"
                  >
                    <div className="avatar avatar-sm" style={{ background: avatarColor, overflow: 'hidden' }}>
                      {avatarUrl
                        ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                        : initials}
                    </div>
                  </button>
                  {showUserMenu && (
                    <div className="menu" role="menu" style={{ right: 0, top: 44, minWidth: 160 }}>
                      <button
                        type="button"
                        role="menuitem"
                        className="menu-item"
                        onClick={() => { setShowUserMenu(false); navigate('/profile/me') }}
                      >
                        Profile
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="menu-item"
                        onClick={() => { setShowUserMenu(false); navigate('/settings') }}
                      >
                        Settings
                      </button>
                      {isDirector && (
                        <button
                          type="button"
                          role="menuitem"
                          className="menu-item"
                          onClick={() => { setShowUserMenu(false); navigate('/notifications') }}
                        >
                          🔔 Alerts
                        </button>
                      )}
                      <div style={{ borderTop: '1px solid var(--line)', margin: '4px 0' }} />
                      <button
                        type="button"
                        role="menuitem"
                        className="menu-item danger"
                        onClick={async () => { setShowUserMenu(false); await logout(); navigate('/') }}
                      >
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Pre-login phase: login UI is hidden. The whole site funnels
                    into /recruitment until login goes live. `returningVisitor`
                    intentionally ignored — same CTA for everyone. */}
                <button className="btn btn-sm btn-primary" onClick={() => navigate('/recruitment')}>
                  Apply →
                </button>
              </>
            )}

            {/* Mobile hamburger — hidden desktop, shown mobile via CSS.
                Uses the same `aq-icon-swap` cross-fade pattern as the
                left-side hamburger so the two are visually identical. */}
            <button
              id="aq-hamburger"
              className="aq-nav-icon-btn aq-hamburger-btn"
              onClick={() => setShowMobileMenu(v => !v)}
              aria-label={showMobileMenu ? 'Close menu' : 'Open menu'}
              aria-expanded={showMobileMenu}
            >
              <span className="aq-icon-swap" aria-hidden>
                <svg
                  className={`aq-icon-swap-frame ${showMobileMenu ? 'is-hidden' : 'is-visible'}`}
                  width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                >
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
                <svg
                  className={`aq-icon-swap-frame ${showMobileMenu ? 'is-visible' : 'is-hidden'}`}
                  width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu — bottom sheet */}
      {showMobileMenu && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowMobileMenu(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 45,
              background: 'rgba(0,0,0,0.5)',
            }}
          />
          {/* Sheet — liquid-glass frosted cream */}
          <div style={{
            position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 46,
            background: 'rgba(244,239,224,0.82)',
            backdropFilter: 'blur(22px) saturate(1.7)',
            WebkitBackdropFilter: 'blur(22px) saturate(1.7)',
            borderRadius: '24px 24px 0 0',
            borderTop: '2px solid var(--ink)',
            boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.65), 0 -10px 44px rgba(0,0,0,0.18)',
            display: 'flex', flexDirection: 'column',
            maxHeight: '88dvh',
            overflow: 'hidden',
            animation: 'sheetUp 0.14s cubic-bezier(0.2,0,0,1)',
            willChange: 'transform',
          }}>
            {/* Handle */}
            <div style={{ padding: '12px 0 4px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--line-2)' }} />
            </div>

            {/* Logo row */}
            <div style={{ padding: '8px 20px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <img src="/logo.png" alt="AquaTerra" className="no-outline" style={{ height: 28, objectFit: 'contain' }} />
              <button
                onClick={() => setShowMobileMenu(false)}
                className="aq-nav-icon-btn"
                aria-label="Close menu"
                style={{ width: 36, height: 36, flexShrink: 0 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Nav links */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {/* HoD Desk — pinned at top for directors */}
              {isAuthenticated && isDirector && (
                <button
                  onClick={() => { localStorage.setItem('aq_hod_visited', '1'); navigate('/director'); setShowMobileMenu(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '15px 20px', width: '100%',
                    fontFamily: 'var(--display)', fontWeight: 700,
                    fontSize: 18, letterSpacing: '-0.02em',
                    color: path.startsWith('/director') ? 'var(--mint)' : 'var(--ink)',
                    background: 'rgba(0,229,160,0.06)',
                    borderBottom: '2px solid var(--ink)',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    animation: 'fadeSlideUp 0.18s cubic-bezier(0.2,0,0,1) 0ms both',
                    position: 'relative',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <SparklesSVG />
                    HoD Desk
                    {showHodPulse && (
                      <span style={{ display: 'inline-flex', width: 7, height: 7, borderRadius: '50%', background: 'var(--pink)', animation: 'hodPulse 1.4s ease-in-out infinite', flexShrink: 0 }} />
                    )}
                  </span>
                  <span style={{ fontSize: 20, opacity: path.startsWith('/director') ? 1 : 0.25 }}>
                    {path.startsWith('/director') ? '●' : '→'}
                  </span>
                </button>
              )}
              {mobileSheetLinks.map((l, i) => (
                <button
                  key={l.href}
                  onClick={() => { navigate(l.href); setShowMobileMenu(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '15px 20px', width: '100%',
                    fontFamily: 'var(--display)', fontWeight: 700,
                    fontSize: 18, letterSpacing: '-0.02em',
                    color: isActive(l.href) ? 'var(--mint)' : 'var(--ink)',
                    background: 'transparent',
                    borderBottom: '1px solid var(--line)',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    animation: `fadeSlideUp 0.18s cubic-bezier(0.2,0,0,1) ${(i + 1) * 40}ms both`,
                  }}
                >
                  <span>{l.label}</span>
                  <span style={{ fontSize: 20, opacity: isActive(l.href) ? 1 : 0.25 }}>
                    {isActive(l.href) ? '●' : '→'}
                  </span>
                </button>
              ))}
            </div>

            {/* Bottom CTA row */}
            <div style={{
              padding: '14px 20px',
              paddingBottom: 'max(14px, env(safe-area-inset-bottom))',
              borderTop: '2px solid var(--ink)',
              display: 'flex', gap: 10,
            }}>
              {isAuthenticated ? (
                <>
                  <button className="btn btn-primary" onClick={() => { navigate('/profile/me'); setShowMobileMenu(false) }}
                    style={{ flex: 1, justifyContent: 'center' }}>my profile</button>
                  <button className="btn" onClick={() => { navigate('/search'); setShowMobileMenu(false) }}
                    style={{ flex: 1, justifyContent: 'center' }}>search</button>
                </>
              ) : (
                <>
                  {/* Pre-login phase: single join CTA only */}
                  <button
                    className="btn btn-primary"
                    onClick={() => { navigate('/recruitment'); setShowMobileMenu(false) }}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Join the work →
                  </button>
                </>
              )}
            </div>
          </div>
          <style>{`
            @keyframes sheetUp {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
            @keyframes fadeSlideUp {
              from { opacity: 0; transform: translateY(8px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes hodPulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.5; transform: scale(1.4); }
            }
          `}</style>
        </>
      )}
    </>
  )
}
