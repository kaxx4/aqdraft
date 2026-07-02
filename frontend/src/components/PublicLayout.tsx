import { useState, Suspense, lazy } from 'react'
import { Outlet } from 'react-router-dom'
import AQNav from './AQNav'
import AQFooter from './AQFooter'
import MobileMenuBar from './MobileMenuBar'
// Lazy: the compose modal (and its framer-motion) only loads the first time a
// user actually opens it, keeping motion off the first-paint critical path.
const CreatePostModal = lazy(() => import('../feed/CreatePostModal'))

const PublicLayout = () => {
  const [showCompose, setShowCompose] = useState(false)
  // Once opened, stay mounted so the modal's own close animation still plays.
  const [composeMounted, setComposeMounted] = useState(false)
  const openCompose = () => { setComposeMounted(true); setShowCompose(true) }

  return (
    <div style={{ background: 'var(--bg)' }}>
      <AQNav onCompose={openCompose} />
      <main id="main-content" tabIndex={-1} style={{ outline: 'none', paddingTop: 'var(--nav-h, 70px)' }}>
        <Outlet />
      </main>
      <AQFooter />
      {/* Reserves space below the footer for the floating MobileMenuBar
          (≈84px) so the footer's last row isn't covered on mobile.
          Spacer is rendered always but only takes height <640px via CSS. */}
      <div className="aq-bottom-bar-spacer" aria-hidden="true" />
      <MobileMenuBar onCompose={openCompose} />
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

export default PublicLayout
