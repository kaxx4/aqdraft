import { supabaseCommunity } from './supabaseCommunity'

let _cachedAuthUid: string | null = null
let _cachedMemberId: number | null = null
let _pendingFetch: Promise<number | null> | null = null

export async function getCachedMemberId(): Promise<number | null> {
  const { data: { session } } = await supabaseCommunity.auth.getSession()
  if (!session?.user) { clearAuthCache(); return null }

  // Cache hit
  if (_cachedAuthUid === session.user.id && _cachedMemberId !== null) {
    return _cachedMemberId
  }

  // If a fetch is already in-flight, await it instead of firing a duplicate query
  if (_pendingFetch) return _pendingFetch

  _pendingFetch = (async () => {
    try {
      const { data: member } = await supabaseCommunity
        .from('members')
        .select('member_id')
        .eq('auth_uid', session.user.id)
        .single()
      _cachedAuthUid = session.user.id
      _cachedMemberId = member?.member_id ?? null
    } catch {
      _cachedMemberId = null
    } finally {
      _pendingFetch = null
    }
    return _cachedMemberId
  })()

  return _pendingFetch
}

export function clearAuthCache() {
  _cachedAuthUid = null
  _cachedMemberId = null
  _pendingFetch = null
}

supabaseCommunity.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') clearAuthCache()
})
