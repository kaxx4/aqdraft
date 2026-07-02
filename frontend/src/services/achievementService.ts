import { supabaseCommunity } from '../lib/supabaseCommunity'
import { getCachedMemberId } from '../lib/authCache'
import { Achievement, AchievementReview, PaginatedResponse } from './api'

const mapAchievementFromDB = (data: any): Achievement => ({
  achievementId: data.achievement_id,
  uuid: data.uuid,
  memberId: data.member_id,
  title: data.title,
  description: data.description,
  achievementType: data.achievement_type,
  achievementDate: data.achievement_date,
  achievementEndDate: data.achievement_end_date,
  proofUrl: data.proof_url,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  status: data.status ?? 'approved',
  reviewedBy: data.reviewed_by,
  reviewedAt: data.reviewed_at,
  reviewNote: data.review_note,
})

export const achievementService = {
  async getCurrentMemberId() {
    // Reuse the shared cached member-id (in-flight dedup) instead of a fresh
    // getSession + members round-trip on every achievement call.
    const id = await getCachedMemberId()
    if (id == null) throw new Error('Not authenticated')
    return id
  },

  async getMyAchievements(params: { page?: number; limit?: number; type?: string } = {}) {
    const currentMemberId = await this.getCurrentMemberId()
    const page = params.page || 1
    const limit = params.limit || 10
    const offset = (page - 1) * limit

    let query = supabaseCommunity
      .from('external_achievements')
      .select('*', { count: 'exact' })
      .eq('member_id', currentMemberId)
      .order('achievement_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (params.type) {
      query = query.eq('achievement_type', params.type)
    }

    const { data, count, error } = await query
    if (error) throw error

    const mapped = (data || []).map(mapAchievementFromDB)
    const totalItems = count || 0
    const totalPages = Math.ceil(totalItems / limit)

    return {
      success: true,
      data: mapped,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    } as PaginatedResponse<Achievement>
  },

  async getMemberAchievements(memberUuid: string, params: { page?: number; limit?: number; type?: string } = {}) {
    const page = params.page || 1
    const limit = params.limit || 10
    const offset = (page - 1) * limit

    const { data: member, error: memberError } = await supabaseCommunity
      .from('members')
      .select('member_id')
      .eq('uuid', memberUuid)
      .single()

    if (memberError) throw memberError

    let query = supabaseCommunity
      .from('external_achievements')
      .select('*', { count: 'exact' })
      .eq('member_id', member.member_id)
      .order('achievement_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (params.type) {
      query = query.eq('achievement_type', params.type)
    }

    const { data, count, error } = await query
    if (error) throw error

    const mapped = (data || []).map(mapAchievementFromDB)
    const totalItems = count || 0
    const totalPages = Math.ceil(totalItems / limit)

    return {
      success: true,
      data: mapped,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    } as PaginatedResponse<Achievement>
  },

  async createAchievement(data: {
    title: string
    description?: string
    achievementType: string
    achievementDate: string
    achievementEndDate?: string | null
    proofUrl?: string
  }) {
    const currentMemberId = await this.getCurrentMemberId()

    const { data: inserted, error } = await supabaseCommunity
      .from('external_achievements')
      .insert({
        member_id: currentMemberId,
        title: data.title,
        description: data.description,
        achievement_type: data.achievementType,
        achievement_date: data.achievementDate,
        achievement_end_date: data.achievementEndDate,
        proof_url: data.proofUrl
      })
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      message: 'Achievement created successfully',
      data: { achievement: mapAchievementFromDB(inserted) }
    }
  },

  async updateAchievement(uuid: string, data: {
    title?: string
    description?: string
    achievementType?: string
    achievementDate?: string
    achievementEndDate?: string | null
    proofUrl?: string
  }) {
    const updateData: any = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.achievementType !== undefined) updateData.achievement_type = data.achievementType
    if (data.achievementDate !== undefined) updateData.achievement_date = data.achievementDate
    if (data.achievementEndDate !== undefined) updateData.achievement_end_date = data.achievementEndDate
    if (data.proofUrl !== undefined) updateData.proof_url = data.proofUrl

    const { data: updated, error } = await supabaseCommunity
      .from('external_achievements')
      .update(updateData)
      .eq('uuid', uuid)
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      message: 'Achievement updated successfully',
      data: { achievement: mapAchievementFromDB(updated) }
    }
  },

  async deleteAchievement(uuid: string) {
    const { error } = await supabaseCommunity
      .from('external_achievements')
      .delete()
      .eq('uuid', uuid)

    if (error) throw error

    return {
      success: true,
      message: 'Achievement deleted successfully'
    }
  },

  // ── Director-side review queue ──────────────────────────────────────────
  // Joins external_achievements to members for the reviewer card so the
  // queue UI shows "<member name> · <school>" without an extra fetch.
  async getPendingReviews(params: { limit?: number } = {}) {
    const limit = params.limit ?? 50
    const { data, error } = await supabaseCommunity
      .from('external_achievements')
      .select(`
        *,
        members:member_id ( full_name, uuid, avatar_url )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(limit)
    if (error) throw error

    const mapped: AchievementReview[] = (data || []).map((row: any) => ({
      ...mapAchievementFromDB(row),
      memberFullName: row.members?.full_name ?? 'Unknown member',
      memberUuid: row.members?.uuid ?? '',
      memberAvatarUrl: row.members?.avatar_url ?? null,
    }))
    return { success: true, data: mapped }
  },

  // Approve a pending achievement. Idempotent — re-approving an already
  // approved row just refreshes the reviewer + timestamp.
  async approveAchievement(uuid: string) {
    const reviewerId = await this.getCurrentMemberId().catch(() => null)
    const { data, error } = await supabaseCommunity
      .from('external_achievements')
      .update({
        status: 'approved',
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        review_note: null,
      })
      .eq('uuid', uuid)
      .select()
      .single()
    if (error) throw error
    return { success: true, data: { achievement: mapAchievementFromDB(data) } }
  },

  // Reject a pending achievement with an optional reviewer note that the
  // owner can read on their profile (so they know why and can re-submit).
  async rejectAchievement(uuid: string, note?: string) {
    const reviewerId = await this.getCurrentMemberId().catch(() => null)
    const { data, error } = await supabaseCommunity
      .from('external_achievements')
      .update({
        status: 'rejected',
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        review_note: note?.trim() || null,
      })
      .eq('uuid', uuid)
      .select()
      .single()
    if (error) throw error
    return { success: true, data: { achievement: mapAchievementFromDB(data) } }
  },

  // ── Share an approved achievement as a feed post ────────────────────────
  // Builds the post body from the achievement title + description, posts
  // it via the existing feedService.createPost path, and attaches the
  // proof image if one was uploaded. Returns the new post's uuid so the
  // caller can navigate or toast a link to it.
  async shareAsPost(uuid: string, options: { category?: string } = {}) {
    // Lazy-import so this service doesn't drag feedService into the
    // initial bundle unless a user actually clicks Share.
    const { default: feedService } = await import('./feedService')

    // Re-fetch the achievement first so we never share stale local state.
    const { data: row, error: fetchErr } = await supabaseCommunity
      .from('external_achievements')
      .select('*')
      .eq('uuid', uuid)
      .single()
    if (fetchErr) throw fetchErr
    if (row.status !== 'approved') {
      throw new Error('Only approved achievements can be shared to the feed')
    }

    const ach = mapAchievementFromDB(row)
    const bodyLines = [
      `🏆 ${ach.title}`,
      ach.description ? '' : null,
      ach.description ?? null,
    ].filter((l): l is string => l !== null)

    // Map achievement_type → post category for visual continuity.
    const categoryByType: Record<string, string> = {
      leadership: 'operations',
      academic: 'content',
      competition: 'events',
      personal_project: 'labs',
      other: 'content',
    }
    const category = options.category || categoryByType[ach.achievementType] || 'content'

    const result = await feedService.createPost({
      body: bodyLines.join('\n'),
      category,
      // If the achievement had a proof image, pass it as the post's image
      // so the feed card has the visual context.
      imageUrls: ach.proofUrl ? [ach.proofUrl] : undefined,
    })

    return result
  },
}

export default achievementService
