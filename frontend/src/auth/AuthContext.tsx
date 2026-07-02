import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { supabaseCommunity } from '../lib/supabaseCommunity'
import { Database } from '../lib/database.types'

type Member = Database['public']['Tables']['members']['Row']

interface AuthContextType {
  member: Member | null
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
  refreshMember: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

// ── Member cache (stale-while-revalidate) ──────────────────────────────────
// The app derives isAuthenticated from the members-table row. Without a cache,
// EVERY page load blocked on a Tokyo round-trip (~150ms+) before it knew you
// were logged in — which read as "slow" and, when the fetch stalled/raced,
// as "signed in sometimes, signed out other times / stuck on loading".
// We persist the row in localStorage and hydrate it synchronously on boot, so
// the UI paints logged-in instantly and revalidates in the background. The
// network is the source of truth; the cache only removes the blocking wait.
// (Client-side role only chooses which UI renders — all data access is still
// RLS-gated server-side, so a tampered cache cannot read protected data.)
const MEMBER_CACHE_KEY = 'aq_member_v1'

// Does a Supabase auth-token actually exist in storage? supabase-js persists the
// session under `sb-<ref>-auth-token` (possibly chunked `.0/.1`). If it's gone,
// there is no session — so a lingering member cache is STALE and must not be
// trusted, otherwise the login page would treat a logged-out visitor as logged
// in and instantly redirect them away ("auth page is buggy").
function hasSupabaseSession(): boolean {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith('sb-') && k.includes('-auth-token')) return true
    }
  } catch {
    /* storage blocked — fall through */
  }
  return false
}

function readMemberCache(): Member | null {
  try {
    // Only trust the cached member if a session token is present. A cache that
    // outlives its session (server-side expiry, sign-out elsewhere) is dropped.
    if (!hasSupabaseSession()) {
      localStorage.removeItem(MEMBER_CACHE_KEY)
      return null
    }
    const raw = localStorage.getItem(MEMBER_CACHE_KEY)
    return raw ? (JSON.parse(raw) as Member) : null
  } catch {
    return null
  }
}

function writeMemberCache(m: Member | null) {
  try {
    if (m) localStorage.setItem(MEMBER_CACHE_KEY, JSON.stringify(m))
    else localStorage.removeItem(MEMBER_CACHE_KEY)
  } catch {
    /* private mode / quota — caching is best-effort */
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Hydrate from cache synchronously: a returning user is logged-in on frame 1.
  const [member, setMemberState] = useState<Member | null>(() => readMemberCache())
  // Only BLOCK first paint when we have nothing cached and must ask the network
  // who this is. With a cached member we render immediately and revalidate.
  const [isLoading, setIsLoading] = useState<boolean>(() => readMemberCache() === null)

  // Single setter that keeps the persistent cache in lock-step with state.
  const setMember = useCallback((m: Member | null) => {
    setMemberState(m)
    writeMemberCache(m)
  }, [])

  // Resolve the members row for an auth user. CRITICAL: only clear the member
  // when the query SUCCEEDS but returns no row AND we self-heal to nothing.
  // On a transient failure (network blip, RLS hiccup, timeout) we KEEP the
  // current/cached member — nulling there is exactly what surfaced as random
  // mid-session "logouts". maybeSingle() distinguishes 0-rows from real errors.
  const fetchMember = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabaseCommunity
        .from('members')
        .select('*')
        .eq('auth_uid', userId)
        .maybeSingle()

      if (error) {
        console.error('[Auth] fetchMember transient error (keeping state):', error)
        return // keep cached/in-memory member — do NOT flip to logged-out
      }
      if (data) { setMember(data); return }

      // Valid session but NO members row (row removed, or an OAuth user the
      // signup trigger missed). members has no INSERT RLS policy, so bootstrap
      // via the SECURITY DEFINER ensure_member() RPC (creates only the caller's
      // own pending row), then re-read. On RPC/refetch failure keep state.
      const { error: rpcErr } = await supabaseCommunity.rpc('ensure_member' as never)
      if (rpcErr) {
        console.error('[Auth] ensure_member RPC failed (keeping state):', rpcErr)
        return
      }
      const { data: healed, error: reErr } = await supabaseCommunity
        .from('members')
        .select('*')
        .eq('auth_uid', userId)
        .maybeSingle()
      if (reErr) {
        console.error('[Auth] post-heal refetch error (keeping state):', reErr)
        return
      }
      setMember(healed ?? null)
    } catch (err) {
      console.error('[Auth] fetchMember threw (keeping state):', err)
    }
  }, [setMember])

  useEffect(() => {
    let mounted = true

    const withTimeout = <T,>(p: Promise<T>, ms: number, label: string): Promise<T> =>
      Promise.race([
        p,
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
        ),
      ])

    const initSession = async () => {
      try {
        const { data: { session } } = await withTimeout(
          supabaseCommunity.auth.getSession(),
          8000,
          'getSession'
        )
        if (!mounted) return

        if (session?.user) {
          // If the cached row belongs to a DIFFERENT user (shared browser, account
          // switch), drop it before revalidating so we never show the wrong identity.
          const cached = readMemberCache()
          if (cached && cached.auth_uid !== session.user.id) setMember(null)
          await withTimeout(fetchMember(session.user.id), 8000, 'fetchMember').catch((err) => {
            console.error('[Auth] init fetchMember failed/timed out (keeping state):', err)
          })
        } else {
          // Genuinely no session → logged out. Clear any stale cache.
          setMember(null)
        }
      } catch (err) {
        // getSession failed/timed out — transient (cold start, slow network).
        // Do NOT signOut() and do NOT null the member: a tampered/destroyed
        // session would log the user out for real. Keep the cached member; the
        // next event / getSession corrects it.
        console.error('[Auth] init getSession failed (keeping state):', err)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    initSession()

    const { data: { subscription } } = supabaseCommunity.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      if (event === 'INITIAL_SESSION') return // handled by initSession()
      // A token refresh / metadata change never changes which member row maps to
      // this user. Re-fetching on these (Supabase fires TOKEN_REFRESHED on a timer
      // and on tab focus) was the main cause of spurious mid-session "logouts".
      if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') return

      if (event === 'SIGNED_OUT' || !session?.user) {
        setMember(null)
        setIsLoading(false)
        return
      }

      // SIGNED_IN / PASSWORD_RECOVERY etc. — load the member, but NEVER let this
      // hang isLoading (the previous code awaited with no timeout → permanent
      // spinner if the round-trip stalled). Always clear isLoading in finally.
      try {
        await withTimeout(fetchMember(session.user.id), 8000, 'fetchMember(onAuth)')
      } catch (err) {
        console.error('[Auth] onAuthStateChange fetchMember failed (keeping state):', err)
      } finally {
        if (mounted) setIsLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchMember, setMember])

  const logout = useCallback(async () => {
    setMember(null) // clears cache too
    await supabaseCommunity.auth.signOut()
  }, [setMember])

  const refreshMember = useCallback(async () => {
    const { data: { session } } = await supabaseCommunity.auth.getSession()
    if (session?.user) await fetchMember(session.user.id)
    else setMember(null)
  }, [fetchMember, setMember])

  return (
    <AuthContext.Provider value={{
      member,
      isLoading,
      isAuthenticated: !!member,
      logout,
      refreshMember,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
