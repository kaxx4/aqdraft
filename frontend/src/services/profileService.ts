import { supabaseCommunity } from '../lib/supabaseCommunity'
import { getCachedMemberId } from '../lib/authCache'
import { attachDocuments } from '../lib/postDocuments'
import { Post, PaginatedResponse } from './api'

// Exactly the columns the post mapper below reads — projecting these
// instead of `*` drops the unused view columns (pinned_title, team_*,
// updated_at) from the payload. No behavior change.
const POST_FEED_COLS =
  'post_id, uuid, category, body, link_url, link_title, link_image, status, created_at, author_id, author_uuid, author_name, author_avatar, author_role, like_count, comment_count, images, tagged_members'

export interface MemberProfile {
  uuid: string
  email?: string
  fullName: string
  avatarUrl?: string
  classGrade?: string
  phone?: string
  joinReason?: string
  bio?: string
  role: 'member' | 'director'
  status: string
  createdAt?: string
  postCount?: number
  taggedCount?: number
  schoolId?: number
  schoolUuid?: string
  schoolName?: string
  classId?: number
  classUuid?: string
  className?: string
}

export interface UpdateProfileData {
  fullName?: string
  email?: string
  avatarUrl?: string
  classGrade?: string
  phone?: string
  bio?: string
  schoolId?: number
}

export const profileService = {
  async getCurrentMember() {
    const memberId = await getCachedMemberId()
    if (!memberId) throw new Error('Not authenticated')

    const { data: member } = await supabaseCommunity
      .from('members')
      .select('*, schools (school_id, uuid, name, short_name, logo_url)')
      .eq('member_id', memberId)
      .single()

    if (!member) throw new Error('Member profile not found')
    return member as any
  },

  async getOwnProfile() {
    const member = await this.getCurrentMember()
    const school = member.schools as any

    const profile: MemberProfile = {
      uuid: member.uuid,
      email: member.email,
      fullName: member.full_name,
      avatarUrl: member.avatar_url ?? undefined,
      classGrade: member.class_grade ?? undefined,
      phone: member.phone ?? undefined,
      joinReason: member.join_reason ?? undefined,
      bio: member.bio ?? undefined,
      role: (member.role === 'super_admin' ? 'director' : member.role) as 'member' | 'director',
      status: member.status ?? 'active',
      createdAt: member.created_at ?? undefined,
      schoolId: member.school_id ?? undefined,
      schoolUuid: school?.uuid ?? undefined,
      schoolName: school?.name ?? undefined,
      postCount: 0,
      taggedCount: 0
    }

    return { success: true, data: { member: profile } }
  },

  async updateProfile(data: UpdateProfileData) {
    const member = await this.getCurrentMember()

    const updateData: any = {}
    if (data.fullName !== undefined) updateData.full_name = data.fullName
    if (data.email !== undefined) updateData.email = data.email
    if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl
    if (data.classGrade !== undefined) updateData.class_grade = data.classGrade
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.bio !== undefined) updateData.bio = data.bio
    if (data.schoolId !== undefined) updateData.school_id = data.schoolId || null

    const { data: updated, error } = await supabaseCommunity
      .from('members')
      .update(updateData)
      .eq('member_id', member.member_id)
      .select('*, schools (school_id, uuid, name, short_name, logo_url)')
      .single()

    if (error) throw error
    const u = updated as any
    const school = u.schools as any

    const profile: MemberProfile = {
      uuid: u.uuid,
      email: u.email,
      fullName: u.full_name,
      avatarUrl: u.avatar_url ?? undefined,
      classGrade: u.class_grade ?? undefined,
      phone: u.phone ?? undefined,
      joinReason: u.join_reason ?? undefined,
      bio: u.bio ?? undefined,
      role: (u.role === 'super_admin' ? 'director' : u.role) as 'member' | 'director',
      status: u.status ?? 'active',
      createdAt: u.created_at ?? undefined,
      schoolId: u.school_id ?? undefined,
      schoolUuid: school?.uuid ?? undefined,
      schoolName: school?.name ?? undefined,
      postCount: 0,
      taggedCount: 0
    }

    return { success: true, message: 'Profile updated successfully', data: { member: profile } }
  },

  async getPublicProfile(uuid: string) {
    const { data: member, error } = await supabaseCommunity
      .from('members')
      .select('*, schools (school_id, uuid, name, short_name, logo_url)')
      .eq('uuid', uuid)
      .single()

    if (error) throw error
    const m = member as any
    const school = m.schools as any

    const profile: MemberProfile = {
      uuid: m.uuid,
      fullName: m.full_name,
      avatarUrl: m.avatar_url ?? undefined,
      classGrade: m.class_grade ?? undefined,
      bio: m.bio ?? undefined,
      role: (m.role === 'super_admin' ? 'director' : m.role) as 'member' | 'director',
      status: m.status ?? 'active',
      createdAt: m.created_at ?? undefined,
      schoolId: m.school_id ?? undefined,
      schoolUuid: school?.uuid ?? undefined,
      schoolName: school?.name ?? undefined,
      postCount: 0,
      taggedCount: 0
    }

    return { success: true, data: { profile } }
  },

  async getMemberPosts(uuid: string, params: { page?: number; limit?: number }) {
    const page = params.page || 1
    const limit = params.limit || 10
    const offset = (page - 1) * limit

    const { data: member } = await supabaseCommunity.from('members').select('member_id').eq('uuid', uuid).single()
    if (!member) throw new Error('Member not found')

    const { data, count, error } = await supabaseCommunity
      .from('post_feed_view')
      .select(POST_FEED_COLS, { count: 'exact' })
      .eq('author_id', member.member_id)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    const posts = (data || []).map((post: any) => ({
      postId: post.post_id,
      uuid: post.uuid,
      category: post.category,
      body: post.body,
      linkUrl: post.link_url,
      linkTitle: post.link_title,
      linkImage: post.link_image,
      status: post.status,
      createdAt: post.created_at,
      authorId: post.author_id,
      authorUuid: post.author_uuid,
      authorName: post.author_name,
      authorAvatar: post.author_avatar,
      authorRole: post.author_role,
      likeCount: post.like_count || 0,
      commentCount: post.comment_count || 0,
      images: post.images ? (post.images as any[]).map((img: any) => ({
        blobUrl: img.url,
        displayOrder: img.order
      })) : [],
      taggedMembers: post.tagged_members ? (post.tagged_members as any[]).map((m: any) => ({
        memberId: m.id,
        uuid: m.uuid,
        fullName: m.name
      })) : []
    }))

    await attachDocuments(posts)
    const totalItems = count || 0
    const totalPages = Math.ceil(totalItems / limit)

    return {
      success: true,
      data: posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    } as PaginatedResponse<Post>
  },

  async getTaggedPosts(uuid: string, params: { page?: number; limit?: number }) {
    const page = params.page || 1
    const limit = params.limit || 10
    const offset = (page - 1) * limit

    const { data: member } = await supabaseCommunity.from('members').select('member_id').eq('uuid', uuid).single()
    if (!member) throw new Error('Member not found')

    const { data: tags } = await supabaseCommunity.from('post_tags').select('post_id').eq('tagged_member_id', member.member_id)
    const postIds = tags?.map(t => t.post_id) || []

    if (postIds.length === 0) {
      return {
        success: true,
        data: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limit,
          hasNextPage: false,
          hasPrevPage: false
        }
      } as PaginatedResponse<Post>
    }

    const { data, count, error } = await supabaseCommunity
      .from('post_feed_view')
      .select(POST_FEED_COLS, { count: 'exact' })
      .in('post_id', postIds)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    const posts = (data || []).map((post: any) => ({
      postId: post.post_id,
      uuid: post.uuid,
      category: post.category,
      body: post.body,
      linkUrl: post.link_url,
      linkTitle: post.link_title,
      linkImage: post.link_image,
      status: post.status,
      createdAt: post.created_at,
      authorId: post.author_id,
      authorUuid: post.author_uuid,
      authorName: post.author_name,
      authorAvatar: post.author_avatar,
      authorRole: post.author_role,
      likeCount: post.like_count || 0,
      commentCount: post.comment_count || 0,
      images: post.images ? (post.images as any[]).map((img: any) => ({
        blobUrl: img.url,
        displayOrder: img.order
      })) : [],
      taggedMembers: post.tagged_members ? (post.tagged_members as any[]).map((m: any) => ({
        memberId: m.id,
        uuid: m.uuid,
        fullName: m.name
      })) : []
    }))

    await attachDocuments(posts)
    const totalItems = count || 0
    const totalPages = Math.ceil(totalItems / limit)

    return {
      success: true,
      data: posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    } as PaginatedResponse<Post>
  },

  async uploadAvatar(file: File) {
    const member = await this.getCurrentMember()
    const previousUrl: string | null = member.avatar_url ?? null
    const fileExt = file.name.split('.').pop()
    const fileName = `${member.uuid}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { error: uploadError } = await supabaseCommunity.storage
      .from('avatars')
      .upload(filePath, file, { cacheControl: '3600', upsert: false })

    if (uploadError) throw uploadError

    const { data: publicUrlData } = supabaseCommunity.storage
      .from('avatars')
      .getPublicUrl(filePath)

    const newUrl = publicUrlData.publicUrl

    // Persist immediately to members.avatar_url so the DB is always in sync —
    // even if the user navigates away before clicking "save".
    const { error: updateError } = await supabaseCommunity
      .from('members')
      .update({ avatar_url: newUrl })
      .eq('member_id', member.member_id)

    if (updateError) {
      // Roll back the upload to avoid orphan blobs in storage. Log to
      // console if the rollback itself fails — orphan file at
      // `filePath` will need manual cleanup but doesn't block the user.
      await supabaseCommunity.storage.from('avatars').remove([filePath])
        .catch((err) => console.warn('[profileService] rollback delete failed for', filePath, err))
      throw updateError
    }

    // Best-effort cleanup of the previous blob (skipped if it's not in our bucket
    // or if the storage delete is denied by RLS — never blocks the happy path).
    if (previousUrl) {
      const marker = '/storage/v1/object/public/avatars/'
      const idx = previousUrl.indexOf(marker)
      if (idx >= 0) {
        const oldPath = previousUrl.slice(idx + marker.length)
        // Log failures so accumulating orphan blobs are debuggable, but
        // never block the happy path — the user already has a new avatar.
        supabaseCommunity.storage.from('avatars').remove([oldPath])
          .catch((err) => console.warn('[profileService] old avatar cleanup failed for', oldPath, err))
      }
    }

    return { success: true, data: { url: newUrl } }
  }
}

export default profileService
