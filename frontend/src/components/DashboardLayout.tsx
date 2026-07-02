import { useState, Suspense, lazy } from 'react'
import { Outlet } from 'react-router-dom'
import AQNav from './AQNav'
import MobileMenuBar from './MobileMenuBar'
// Lazy: compose modal + its framer-motion load only on first open.
const CreatePostModal = lazy(() => import('../feed/CreatePostModal'))

const DashboardLayout = () => {
  const [showCompose, setShowCompose] = useState(false)
  const [composeMounted, setComposeMounted] = useState(false)
  const openCompose = () => { setComposeMounted(true); setShowCompose(true) }

  return (
    // 100dvh follows the iOS dynamic viewport (URL bar collapse) — 100vh
    // would leave a gap when Safari's chrome shrinks. Falls back to 100vh
    // on browsers that don't support dvh via the @supports check.
    <div style={{ background: 'var(--bg)', minHeight: '100dvh' }}>
      <AQNav onCompose={openCompose} />

      {/* Main content. Reserves space for the floating MobileMenuBar pill
          (~84px tall on mobile) so the final row of content + footer don't
          hide behind it. Bar is only rendered <640px so the spacer is
          conditional via CSS media query in v6.css (.aq-bottom-bar-spacer). */}
      <main id="main-content" tabIndex={-1} style={{ outline: 'none', paddingTop: 'var(--nav-h, 70px)' }}>
        <Outlet />
        <div className="aq-bottom-bar-spacer" aria-hidden="true" />
      </main>

      {/* Animated bottom tab bar — mobile only */}
      <MobileMenuBar onCompose={openCompose} />

      {/* Compose modal — lazy, mounted on first open */}
      {composeMounted && (
        <Suspense fallback={null}>
          <CreatePostModal
            isOpen={showCompose}
            onClose={() => setShowCompose(false)}
            onPostCreated={() => setShowCompose(false)}
          />
        </Suspense>
      )}
    </div>
  )
}

export default DashboardLayout
