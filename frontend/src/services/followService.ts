import { supabaseCommunity } from '../lib/supabaseCommunity'
import { getCachedMemberId } from '../lib/authCache'
import { notificationService } from './notificationService'

// ─────────────────────────────────────────────────────────────────────────────
// followService — real follow graph backed by the public.follows table.
// Schema: follows(follow_id, follower_id, followee_id, created_at)
// UNIQUE (follower_id, followee_id), CHECK follower_id <> followee_id
// RLS: anyone can read; insert/delete restricted to the current member.
// ─────────────────────────────────────────────────────────────────────────────

export interface FollowerListItem {
  memberId: number
  uuid: string
  fullName: string
  avatarUrl?: string
  role: string
  followedAt: string
}

async function resolveMemberIdFromUuid(uuid: string): Promise<number | null> {
  const { data, error } = await supabaseCommunity
    .from('members')
    .select('member_id')
    .eq('uuid', uuid)
    .maybeSingle()
  if (error || !data) return null
  return data.member_id as number
}

export const followService = {
  /** Follow another member by their member_id. Idempotent (ignores duplicates). */
  async follow(followeeMemberId: number) {
    const followerId = await getCachedMemberId()
    if (!followerId) throw new Error('Not authenticated')
    if (followerId === followeeMemberId) throw new Error('Cannot follow yourself')

    const { error } = await supabaseCommunity
      .from('follows')
      .insert({ follower_id: followerId, followee_id: followeeMemberId })

    // 23505 = unique_violation — already following, treat as success silently.
    if (error && (error as any).code !== '23505') throw error

    // ── Notify the followee (only on a genuine new follow, not a re-tap) ──
    if (!error) {
      const [{ data: actor }, { data: target }] = await Promise.all([
        supabaseCommunity.from('members').select('full_name, uuid').eq('member_id', followerId).single(),
        supabaseCommunity.from('members').select('uuid').eq('member_id', followeeMemberId).single(),
      ])
      if (actor) {
        await notificationService.create({
          memberId: followeeMemberId,
          type: 'follow',
          title: `${(actor as any).full_name} started following you`,
          link: `/member/${(actor as any).uuid}`,
        })
      }
      void target // currently unused — left for future "you follow them too" logic
    }

    return { success: true }
  },

  /** Unfollow another member. Idempotent. */
  async unfollow(followeeMemberId: number) {
    const followerId = await getCachedMemberId()
    if (!followerId) throw new Error('Not authenticated')

    const { error } = await supabaseCommunity
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('followee_id', followeeMemberId)

    if (error) throw error
    return { success: true }
  },

  /** Convenience: follow/unfollow by the target member's UUID. */
  async followByUuid(targetUuid: string) {
    const id = await resolveMemberIdFromUuid(targetUuid)
    if (!id) throw new Error('Member not found')
    return this.follow(id)
  },
  async unfollowByUuid(targetUuid: string) {
    const id = await resolveMemberIdFromUuid(targetUuid)
    if (!id) throw new Error('Member not found')
    return this.unfollow(id)
  },

  /** Whether the current member is following the target. */
  async isFollowing(targetUuid: string): Promise<boolean> {
    const me = await getCachedMemberId()
    if (!me) return false
    const targetId = await resolveMemberIdFromUuid(targetUuid)
    if (!targetId) return false

    const { count, error } = await supabaseCommunity
      .from('follows')
      .select('follow_id', { count: 'exact', head: true })
      .eq('follower_id', me)
      .eq('followee_id', targetId)
    if (error) return false
    return (count ?? 0) > 0
  },

  /** Follower / following counts for a profile (by UUID). */
  async getCounts(targetUuid: string): Promise<{ followers: number; following: number }> {
    const targetId = await resolveMemberIdFromUuid(targetUuid)
    if (!targetId) return { followers: 0, following: 0 }

    const [{ count: followers }, { count: following }] = await Promise.all([
      supabaseCommunity
        .from('follows')
        .select('follow_id', { count: 'exact', head: true })
        .eq('followee_id', targetId),
      supabaseCommunity
        .from('follows')
        .select('follow_id', { count: 'exact', head: true })
        .eq('follower_id', targetId),
    ])
    return { followers: followers ?? 0, following: following ?? 0 }
  },

  /** List followers of a member. */
  async getFollowers(targetUuid: string, params: { limit?: number; offset?: number } = {}): Promise<FollowerListItem[]> {
    const targetId = await resolveMemberIdFromUuid(targetUuid)
    if (!targetId) return []

    const limit = params.limit ?? 50
    const offset = params.offset ?? 0

    const { data, error } = await supabaseCommunity
      .from('follows')
      .select('created_at, members!follower_id (member_id, uuid, full_name, avatar_url, role)')
      .eq('followee_id', targetId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return (data ?? []).map((row: any) => ({
      memberId: row.members.member_id,
      uuid: row.members.uuid,
      fullName: row.members.full_name,
      avatarUrl: row.members.avatar_url ?? undefined,
      role: row.members.role ?? 'member',
      followedAt: row.created_at,
    }))
  },

  /** List who a member is following. */
  async getFollowing(sourceUuid: string, params: { limit?: number; offset?: number } = {}): Promise<FollowerListItem[]> {
    const sourceId = await resolveMemberIdFromUuid(sourceUuid)
    if (!sourceId) return []

    const limit = params.limit ?? 50
    const offset = params.offset ?? 0

    const { data, error } = await supabaseCommunity
      .from('follows')
      .select('created_at, members!followee_id (member_id, uuid, full_name, avatar_url, role)')
      .eq('follower_id', sourceId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return (data ?? []).map((row: any) => ({
      memberId: row.members.member_id,
      uuid: row.members.uuid,
      fullName: row.members.full_name,
      avatarUrl: row.members.avatar_url ?? undefined,
      role: row.members.role ?? 'member',
      followedAt: row.created_at,
    }))
  },
}

export default followService
