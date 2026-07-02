import { supabaseCommunity } from '../lib/supabaseCommunity'
import { getCachedMemberId } from '../lib/authCache'

// ─────────────────────────────────────────────────────────────────────────────
// notificationService — real notifications via public.notifications.
// Schema: notifications(id uuid, member_id int, type text, title text,
//                       subtitle text?, full_note text?, link text?,
//                       is_read bool, created_at timestamptz)
// RLS: a member can read/update only their own rows; insert is allowed for any
//      authenticated user (so service code can write notifications targeted at
//      another member when they like / comment / tag / follow).
// ─────────────────────────────────────────────────────────────────────────────

export type NotificationType =
  | 'like'
  | 'comment'
  | 'tag'
  | 'follow'
  | 'post_approved'
  | 'post_rejected'
  | 'team_invite'
  | 'team_join_request'
  | 'team_join_accepted'
  | 'system'

export interface NotificationRow {
  id: string
  memberId: number
  type: NotificationType
  title: string
  subtitle?: string | null
  fullNote?: string | null
  link?: string | null
  isRead: boolean
  createdAt: string
}

interface CreateNotificationInput {
  memberId: number          // recipient
  type: NotificationType
  title: string
  subtitle?: string
  fullNote?: string
  link?: string
}

const mapRow = (r: any): NotificationRow => ({
  id: r.id,
  memberId: r.member_id,
  type: r.type as NotificationType,
  title: r.title,
  subtitle: r.subtitle ?? null,
  fullNote: r.full_note ?? null,
  link: r.link ?? null,
  isRead: r.is_read,
  createdAt: r.created_at,
})

export const notificationService = {
  /** List notifications for the current member, newest first. */
  async list(params: { limit?: number; offset?: number; unreadOnly?: boolean } = {}) {
    const memberId = await getCachedMemberId()
    if (!memberId) return { items: [] as NotificationRow[], totalUnread: 0 }

    const limit = params.limit ?? 50
    const offset = params.offset ?? 0

    let query = supabaseCommunity
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (params.unreadOnly) query = query.eq('is_read', false)

    const { data, error } = await query
    if (error) throw error

    // Count unread separately (so list with unreadOnly doesn't affect badge count)
    const { count: unreadCount } = await supabaseCommunity
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('member_id', memberId)
      .eq('is_read', false)

    return {
      items: (data ?? []).map(mapRow),
      totalUnread: unreadCount ?? 0,
    }
  },

  /** Unread count badge for the nav bar. */
  async getUnreadCount(): Promise<number> {
    const memberId = await getCachedMemberId()
    if (!memberId) return 0
    const { count } = await supabaseCommunity
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('member_id', memberId)
      .eq('is_read', false)
    return count ?? 0
  },

  /** Mark a single notification as read. */
  async markRead(id: string) {
    const { error } = await supabaseCommunity
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
    if (error) throw error
  },

  /** Mark all of the current member's notifications as read. */
  async markAllRead() {
    const memberId = await getCachedMemberId()
    if (!memberId) return
    const { error } = await supabaseCommunity
      .from('notifications')
      .update({ is_read: true })
      .eq('member_id', memberId)
      .eq('is_read', false)
    if (error) throw error
  },

  /** Service-side helper to create a notification. Called from feed/follow code. */
  async create(input: CreateNotificationInput) {
    // Skip self-notifications (no point notifying yourself about your own action).
    const me = await getCachedMemberId()
    if (me && me === input.memberId) return

    const { error } = await supabaseCommunity
      .from('notifications')
      .insert({
        member_id: input.memberId,
        type: input.type,
        title: input.title,
        subtitle: input.subtitle,
        full_note: input.fullNote,
        link: input.link,
      })
    // Notifications are non-critical — never throw out of a write path.
    if (error) console.warn('[notification] create failed:', error.message)
  },
}

export default notificationService
