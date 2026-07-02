import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, Suspense } from 'react'
import { lazyWithRetry as lazy } from './lib/lazyWithRetry'
import { AuthProvider, useAuth } from './auth/AuthContext'
import ToastProvider from './components/Toast'
import ConfirmProvider from './components/Confirm'
import ErrorBoundary from './components/ErrorBoundary'
import WelcomeOverlay from './components/WelcomeOverlay'

function ScrollToTop() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname, search])
  return null
}

/**
 * Cmd+K / Ctrl+K global shortcut to jump to /search.
 * Rendered as a sibling of <Routes> inside <BrowserRouter> so
 * `useNavigate` resolves to the right router context.
 *
 * Ignores the shortcut when the user is mid-typing in an editable
 * field (input / textarea / contentEditable) — they probably mean
 * to insert the literal character, not jump pages.
 */
function GlobalShortcuts() {
  const navigate = useNavigate()
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key !== 'k') return
      const t = e.target as HTMLElement | null
      const tag = t?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (t && t.isContentEditable)) return
      e.preventDefault()
      navigate('/search')
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [navigate])
  return null
}

function RouteFallback() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: 32, height: 32, border: '2px solid var(--line-2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

/**
 * Auth-aware gate for /register during the pre-login phase.
 *
 * The public still can't self-register — an UNauthenticated visitor (old
 * bookmark / stale link) is funnelled to /recruitment exactly as before. But an
 * AUTHENTICATED user who needs to finish their profile (post-OAuth, missing
 * class/grade or join-reason) is sent here by LoginPage and ProtectedRoute;
 * they must reach the real RegisterPage instead of bouncing to /recruitment.
 * Without this, a brand-new Google sign-in via the /_login escape hatch
 * dead-ended on the recruitment form and could never complete their account.
 */
function RegisterGate() {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <RouteFallback />
  return isAuthenticated ? <RegisterPage /> : <Navigate to="/recruitment" replace />
}

// Eager — needed on first paint / every route
import ProtectedRoute from './auth/ProtectedRoute'
import HomeRoute from './auth/HomeRoute'
import PublicLayout from './components/PublicLayout'
import DashboardLayout from './components/DashboardLayout'

// Public Pages
const PublicProfilePage      = lazy(() => import('./profile/PublicProfilePage'))
// Login / Register pages parked during pre-login phase — the canonical
// /login and /register routes redirect to /recruitment (see Routes block
// below). LoginPage is still mounted at the obfuscated `/_login` path so
// admins / directors can authenticate during the closed phase via the
// hidden footer escape hatch in <AQFooter>. RegisterPage stays parked.
const LoginPage              = lazy(() => import('./auth/LoginPage'))
const RegisterPage           = lazy(() => import('./auth/RegisterPage'))
const PendingApprovalPage    = lazy(() => import('./auth/PendingApprovalPage'))
const RejectedPage           = lazy(() => import('./auth/RejectedPage'))
const EverythingWeDoPage     = lazy(() => import('./public/EverythingWeDoPage'))
const PublicProjectsPage     = lazy(() => import('./public/PublicProjectsPage'))
const PublicProjectDetailPage = lazy(() => import('./public/PublicProjectDetailPage'))
const BlogListPage           = lazy(() => import('./public/BlogListPage'))
const BlogPostPage           = lazy(() => import('./public/BlogPostPage'))
const SupportPage            = lazy(() => import('./public/SupportPage'))
const VolunteerHandbookPage  = lazy(() => import('./public/VolunteerHandbookPage'))
const QuickLinksPage         = lazy(() => import('./public/QuickLinksPage'))
// `/volunteer/apply` was the legacy intake form. It now redirects to
// /recruitment — see the Route below — and the page component is gone.
const VolunteerThankYouPage  = lazy(() => import('./public/VolunteerThankYouPage'))
const RecruitmentPage        = lazy(() => import('./public/RecruitmentPage'))
// Hidden 5-step onboarding flow at /welcome — not linked from any nav,
// footer, or sitemap. Reachable only by direct URL; share with
// prospective members who want a guided tour before applying.
const OnboardingPage         = lazy(() => import('./public/OnboardingPage'))
const CollaborationsPage     = lazy(() => import('./public/CollaborationsPage'))
const ContactPage            = lazy(() => import('./public/ContactPage'))
const AboutPage              = lazy(() => import('./public/AboutPage'))
const FAQPage                = lazy(() => import('./public/FAQPage'))
const OpportunitiesPage      = lazy(() => import('./public/OpportunitiesPage'))
const SchoolsPage            = lazy(() => import('./public/SchoolsPage'))
const ClassesPage            = lazy(() => import('./public/ClassesPage'))
const SettingsPage           = lazy(() => import('./auth/SettingsPage'))
// Unlisted brand / design-system reference sheet (not in nav or sitemap).
const BrandPage              = lazy(() => import('./public/BrandPage'))

// Protected Pages
const NotificationsPage      = lazy(() => import('./feed/NotificationsPage'))
const SavedPostsPage         = lazy(() => import('./feed/SavedPostsPage'))
const MyPostsPage            = lazy(() => import('./feed/MyPostsPage'))
const ProfilePage            = lazy(() => import('./profile/ProfilePage'))
const EditProfilePage        = lazy(() => import('./profile/EditProfilePage'))
const NotFoundPage           = lazy(() => import('./pages/NotFoundPage'))

// Public Entity Pages
const PostPage               = lazy(() => import('./feed/PostPage'))
const TeamsPage              = lazy(() => import('./teams/TeamsPage'))
const TeamDetailPage         = lazy(() => import('./teams/TeamDetailPage'))
const SearchPage             = lazy(() => import('./search/SearchPage'))
const MembersPage            = lazy(() => import('./public/MembersPage'))



// Director Pages
const DirectorDashboard      = lazy(() => import('./director/DirectorDashboard'))
const DirectorManagement     = lazy(() => import('./director/DirectorManagement'))
const AccountApprovals       = lazy(() => import('./director/AccountApprovals'))
const PostModeration         = lazy(() => import('./director/PostModeration'))
const MemberDirectory        = lazy(() => import('./director/MemberDirectory'))
const CategoryManagement     = lazy(() => import('./director/CategoryManagement'))
const ContentManager         = lazy(() => import('./director/ContentManager'))
const TeamManagement         = lazy(() => import('./director/TeamManagement'))
const VolunteerApplications  = lazy(() => import('./director/VolunteerApplications'))

// Paradox 2026 sub-app — lazy: biggest single chunk win (~200KB gzipped)
const ParadoxRoot            = lazy(() => import('./paradox/ParadoxRoot'))

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ConfirmProvider>
        <AuthProvider>
        <BrowserRouter>
        <ScrollToTop />
        <GlobalShortcuts />
        <WelcomeOverlay />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomeRoute />} />
              <Route path="/everything-we-do" element={<EverythingWeDoPage />} />
              <Route path="/projects" element={<PublicProjectsPage />} />
              <Route path="/projects/:slug" element={<PublicProjectDetailPage />} />
              <Route path="/blog" element={<BlogListPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/volunteer" element={<VolunteerHandbookPage />} />
              <Route path="/volunteer-handbook" element={<Navigate to="/volunteer" replace />} />
              <Route path="/volunteer-handbook/edit" element={<Navigate to="/volunteer" replace />} />
              <Route path="/links" element={<QuickLinksPage />} />
              {/* Legacy intake form retired — every "Apply" / "Join" CTA on
                  the site now funnels through /recruitment. The redirect
                  catches old bookmarks and email links so they don't 404. */}
              <Route path="/volunteer/apply" element={<Navigate to="/recruitment" replace />} />
              <Route path="/volunteer/thank-you" element={<VolunteerThankYouPage />} />
              {/* Primary intake route during the "pre-login" phase — every
                  Apply / Log in / Join CTA across the site now points here. */}
              <Route path="/recruitment" element={<RecruitmentPage />} />
              <Route path="/collaborations" element={<CollaborationsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/opportunities" element={<OpportunitiesPage />} />
              <Route path="/schools" element={<SchoolsPage />} />
              <Route path="/classes" element={<ClassesPage />} />
              <Route path="/members" element={<MembersPage />} />
              <Route path="/member/:uuid" element={<PublicProfilePage />} />
              <Route path="/post/:uuid" element={<PostPage />} />
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/teams/:uuid" element={<TeamDetailPage />} />
              {/* Pre-login phase: /login redirects to /recruitment so anyone
                  hitting an old bookmark or a stale share link lands on the
                  live intake form. (The working login lives at /_login.)
                  /register is auth-aware via <RegisterGate/>: unauthenticated →
                  /recruitment, but an authenticated user finishing their profile
                  reaches the real RegisterPage. When login goes fully live, swap
                  /login back to <LoginPage />. */}
              <Route path="/login" element={<Navigate to="/recruitment" replace />} />
              <Route path="/register" element={<RegisterGate />} />
              {/* Hidden 5-step onboarding flow at /welcome.
                  Rendered INSIDE PublicLayout (so the chrome stays
                  consistent if a visitor reaches it from a deep link),
                  but the route itself is not listed in any nav, footer,
                  sitemap.xml, or metaConfig — shareable only by direct
                  URL. The page handles its own internal step navigation
                  via prev/next buttons + arrow keys + Esc to skip. */}
              <Route path="/welcome" element={<OnboardingPage />} />
              {/* Unlisted design-system / brand reference sheet — direct URL only. */}
              <Route path="/brand" element={<BrandPage />} />
              {/* Hidden login escape hatch reached via the secret button
                  in <AQFooter>. Path is intentionally non-discoverable —
                  no nav link, no sitemap entry, no SEO meta. Renders the
                  full LoginPage so admins / directors can sign in while
                  the public site is in "pre-login" mode. */}
              <Route path="/_login" element={<LoginPage />} />
              <Route path="/pending" element={<PendingApprovalPage />} />
              <Route path="/rejected" element={<RejectedPage />} />
            </Route>

            {/* The old standalone feed page is retired — home (/) is the feed.
                Redirect any /feed link (old bookmarks, share links) to home. */}
            <Route path="/feed" element={<Navigate to="/" replace />} />

            {/* Protected Routes - Active Members */}
            <Route path="/notifications" element={<ProtectedRoute requireActive><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<NotificationsPage />} />
            </Route>

            <Route path="/saved" element={<ProtectedRoute requireActive><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<SavedPostsPage />} />
            </Route>

            <Route path="/my-posts" element={<ProtectedRoute requireActive><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<MyPostsPage />} />
            </Route>

            <Route path="/profile" element={<ProtectedRoute requireActive><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/profile/me" replace />} />
              <Route path="me" element={<ProfilePage isOwn />} />
              <Route path="edit" element={<EditProfilePage />} />
              <Route path=":uuid" element={<ProfilePage />} />
            </Route>

            <Route path="/search" element={<ProtectedRoute requireActive><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<SearchPage />} />
            </Route>

            <Route path="/settings" element={<ProtectedRoute requireActive><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<SettingsPage />} />
            </Route>

            {/* Arcade — hidden; redirect all sub-routes home */}
            <Route path="/arcade/*" element={<Navigate to="/" replace />} />

            {/* Director Routes */}
            <Route path="/director" element={<ProtectedRoute requireDirector><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<DirectorDashboard />} />
              <Route path="approvals"  element={<AccountApprovals />} />
              <Route path="posts"      element={<PostModeration />} />
              <Route path="members"    element={<MemberDirectory />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="directors"  element={<DirectorManagement />} />
              <Route path="content"    element={<ContentManager />} />
              <Route path="teams"      element={<TeamManagement />} />
              <Route path="volunteers" element={<VolunteerApplications />} />
            </Route>

            {/* Paradox 2026 sub-app — brings its own Nav, Footer, AuthProvider, ToastProvider */}
            <Route path="/paradox/*" element={<ParadoxRoot />} />

            {/* Catch all — 404 */}
            <Route path="*" element={<PublicLayout />}>
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
        </AuthProvider>
        </ConfirmProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
