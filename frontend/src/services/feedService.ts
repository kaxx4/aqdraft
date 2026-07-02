import { supabaseCommunity } from '../lib/supabaseCommunity'
import { getCachedMemberId } from '../lib/authCache'
import { attachDocuments, fetchDocumentRows, attachDocumentRows } from '../lib/postDocuments'
import { Post, PaginatedResponse } from './api'
import { notificationService } from './notificationService'

export interface CreatePostData {
  category: string
  body: string
  linkUrl?: string
  linkTitle?: string
  linkImage?: string
  imageUrls?: string[]
  /**
   * PDF / PPTX attachments. Each entry carries the public storage URL
   * + original filename + mimetype + size so post_documents can
   * reconstruct the attachment metadata for the post card UI.
   */
  documentUrls?: Array<{ url: string; fileName: string; mimeType: string; size: number }>
  taggedMemberIds?: number[]
}

const mapPostFromDB = (post: any, likedPostIds: number[]): Post => ({
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
  likeCount: post.like_count,
  commentCount: post.comment_count,
  pinned: post.pinned ?? false,
  pinnedTitle: post.pinned_title ?? null,
  images: post.images ? (post.images as any[]).map((img: any) => ({
    blobUrl: img.url,
    displayOrder: img.order
  })) : [],
  taggedMembers: post.tagged_members ? (post.tagged_members as any[]).map((member: any) => ({
    memberId: member.id,
    uuid: member.uuid,
    fullName: member.name
  })) : [],
  isLiked: likedPostIds.includes(post.post_id)
})

export const feedService = {
  async getFeed(params: { page?: number; limit?: number; category?: string }) {
    const page = params.page || 1
    const limit = params.limit || 10
    const offset = (page - 1) * limit

    let query = supabaseCommunity
      .from('post_feed_view')
      .select('post_id,uuid,category,body,link_url,link_title,link_image,status,created_at,author_id,author_uuid,author_name,author_avatar,author_role,like_count,comment_count,images,tagged_members', { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (params.category) {
      query = query.eq('category', params.category)
    }

    // Fetch posts and current member id in parallel
    const [{ data: posts, error, count }, memberId] = await Promise.all([
      query,
      getCachedMemberId(),
    ])
    if (error) throw error

    // Likes + documents both key off the same post ids and are independent of
    // each other — run them CONCURRENTLY (was: likes, then documents, a 3rd
    // serial round-trip) so the feed needs one fewer cross-region hop.
    const postIds = (posts || []).map((p: any) => p.post_id)
    const [likesRes, docRows] = await Promise.all([
      memberId && postIds.length
        ? supabaseCommunity.from('likes').select('post_id').eq('member_id', memberId).in('post_id', postIds)
        : Promise.resolve({ data: [] as any[] }),
      postIds.length ? fetchDocumentRows(postIds) : Promise.resolve([] as any[]),
    ])
    const likedPostIds: number[] = ((likesRes as any).data || []).map((l: any) => l.post_id)

    const mappedPosts = (posts || []).map((p: any) => mapPostFromDB(p, likedPostIds))
    attachDocumentRows(mappedPosts, docRows)
    const totalItems = count || 0
    const totalPages = Math.ceil(totalItems / limit)

    return {
      success: true,
      data: mappedPosts,
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

  async getPost(uuid: string) {
    const [{ data: post, error }, memberId] = await Promise.all([
      supabaseCommunity.from('post_feed_view').select('*').eq('uuid', uuid).single(),
      getCachedMemberId(),
    ])
    if (error) throw error

    let likedPostIds: number[] = []
    if (memberId && post) {
      // maybeSingle, not single — the common case is "viewer hasn't
      // liked this post", which .single() treats as an error (PGRST116)
      // and emits a 406 on every un-liked post view. maybeSingle returns
      // null cleanly.
      const { data: like } = await supabaseCommunity
        .from('likes')
        .select('post_id')
        .eq('member_id', memberId)
        .eq('post_id', (post as any).post_id)
        .maybeSingle()
      if (like) likedPostIds = [(like as any).post_id]
    }

    const mappedPost = mapPostFromDB(post as any, likedPostIds)
    await attachDocuments([mappedPost])
    return { success: true, data: { post: mappedPost } }
  },

  async createPost(data: CreatePostData) {
    const memberId = await getCachedMemberId()
    if (!memberId) throw new Error('Not authenticated')

    // Fetch role + name to determine auto-publish and to build notifications
    const { data: memberRow } = await supabaseCommunity
      .from('members')
      .select('member_id, role, full_name')
      .eq('member_id', memberId)
      .single()
    if (!memberRow) throw new Error('Member not found')

    const isLeader = ['director', 'hod', 'super_admin'].includes(memberRow.role ?? '')
    const status = isLeader ? 'published' : 'pending_review'

    const { data: post, error: postError } = await supabaseCommunity
      .from('posts')
      .insert({
        author_id: memberRow.member_id,
        category: data.category,
        body: data.body,
        link_url: data.linkUrl,
        link_title: data.linkTitle,
        link_image: data.linkImage,
        status,
      })
      .select()
      .single()

    if (postError) throw postError

    // Insert images, documents, tags, and category in parallel
    await Promise.all([
      data.imageUrls?.length
        ? supabaseCommunity.from('post_images').insert(
            data.imageUrls.map((url, index) => ({
              post_id: post.post_id,
              blob_url: url,
              blob_name: url.split('/').pop() || `image_${index}`,
              display_order: index
            }))
          ).then(({ error }) => { if (error) console.warn('[feedService] post_images insert failed', post.post_id, error) })
        : Promise.resolve(),

      // PDF / PPTX attachments — cast because types predate migration 013.
      data.documentUrls?.length
        ? (supabaseCommunity.from('post_documents' as any) as any).insert(
            data.documentUrls.map((doc: any, index: number) => ({
              post_id: post.post_id,
              blob_url: doc.url,
              blob_name: doc.url.split('/').pop() || `document_${index}`,
              file_name: doc.fileName,
              file_size: doc.size,
              mime_type: doc.mimeType,
              display_order: index,
            }))
          ).then(({ error }: any) => { if (error) console.warn('[feedService] post_documents insert failed', post.post_id, error) })
        : Promise.resolve(),

      data.taggedMemberIds?.length
        ? supabaseCommunity.from('post_tags').insert(
            data.taggedMemberIds.map(id => ({
              post_id: post.post_id,
              tagged_member_id: id
            }))
          )
        : Promise.resolve(),

      // post_categories has a CHECK constraint (events|welfare|content|operations|labs)
      // and a UNIQUE (post_id, category). Best-effort insert — never blocks
      // post creation if the category isn't in the denormalized allow-list
      // or the row already exists.
      supabaseCommunity.from('post_categories').insert({
        post_id: post.post_id,
        category: data.category
      }).then(({ error }) => {
        if (error && error.code !== '23505' && error.code !== '23514') {
          console.warn('[post_categories] insert failed:', error.message)
        }
      }),
    ])

    // ── Fire tag notifications (non-blocking, never throws) ──
    if (data.taggedMemberIds?.length) {
      const postLink = `/post/${post.uuid}`
      const subtitle = data.body?.slice(0, 140) ?? ''
      await Promise.all(
        data.taggedMemberIds.map(taggedId =>
          notificationService.create({
            memberId: taggedId,
            type: 'tag',
            title: `${memberRow.full_name} tagged you in a post`,
            subtitle,
            link: postLink,
          })
        )
      )
    }

    return this.getPost(post.uuid)
  },

  async toggleLike(uuid: string, knownPostId?: number) {
    const memberId = await getCachedMemberId()
    if (!memberId) throw new Error('Not authenticated')

    // Use caller-provided postId if available to skip a roundtrip
    let postId: number
    if (knownPostId) {
      postId = knownPostId
    } else {
      const { data: post } = await supabaseCommunity.from('posts').select('post_id').eq('uuid', uuid).single()
      if (!post) throw new Error('Post not found')
      postId = (post as any).post_id as number
    }

    // Check existing like and toggle in parallel-friendly sequence
    const { data: existingLike } = await supabaseCommunity
      .from('likes')
      .select('like_id')
      .eq('post_id', postId)
      .eq('member_id', memberId)
      .maybeSingle()

    let liked = false
    if (existingLike) {
      await supabaseCommunity.from('likes').delete().eq('like_id', (existingLike as any).like_id)
    } else {
      await supabaseCommunity.from('likes').insert({ post_id: postId as number, member_id: memberId as number })
      liked = true
    }

    const { count: likeCount } = await supabaseCommunity
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId as number)

    // ── Notify post author when liked (skip on unlike + skip self-likes via service) ──
    if (liked) {
      const [{ data: actor }, { data: postRow }] = await Promise.all([
        supabaseCommunity.from('members').select('full_name').eq('member_id', memberId).single(),
        supabaseCommunity.from('posts').select('author_id, uuid, body').eq('post_id', postId).single(),
      ])
      if (postRow && actor) {
        await notificationService.create({
          memberId: (postRow as any).author_id,
          type: 'like',
          title: `${(actor as any).full_name} liked your post`,
          subtitle: ((postRow as any).body as string)?.slice(0, 140),
          link: `/post/${(postRow as any).uuid}`,
        })
      }
    }

    return { success: true, data: { liked, likeCount: likeCount || 0 } }
  },

  async getLikers(uuid: string, params: { page?: number; limit?: number } = {}) {
    const page = params.page || 1
    const limit = params.limit || 10
    const offset = (page - 1) * limit

    const { data: post } = await supabaseCommunity
      .from('posts')
      .select('post_id')
      .eq('uuid', uuid)
      .single()

    if (!post) throw new Error('Post not found')

    const { data: likes, error, count } = await supabaseCommunity
      .from('likes')
      .select(`
        created_at,
        members!member_id (
          member_id,
          uuid,
          full_name,
          avatar_url,
          class_grade,
          role
        )
      `, { count: 'exact' })
      .eq('post_id', post.post_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    const mappedLikers = (likes || []).map((like: any) => ({
      memberId: like.members.member_id,
      uuid: like.members.uuid,
      fullName: like.members.full_name,
      avatarUrl: like.members.avatar_url,
      classGrade: like.members.class_grade,
      role: like.members.role,
      likedAt: like.created_at
    }))

    const totalItems = count || 0
    const totalPages = Math.ceil(totalItems / limit)

    return {
      success: true,
      data: mappedLikers,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  },

  async deletePost(uuid: string) {
    // `.select()` so we can detect a silently-blocked write: PostgREST
    // returns NO error + zero rows when RLS denies the delete. Without
    // this the UI would optimistically remove the card and report success
    // even though nothing was deleted.
    const { data, error } = await supabaseCommunity
      .from('posts')
      .delete()
      .eq('uuid', uuid)
      .select('post_id')

    if (error) throw error
    if (!data || data.length === 0) {
      throw new Error("Couldn't delete this post — you may not have permission.")
    }

    return { success: true, message: 'Post deleted successfully' }
  },

  async updatePost(uuid: string, data: { body?: string; category?: string }) {
    const { data: rows, error } = await supabaseCommunity
      .from('posts')
      .update({
        ...(data.body !== undefined ? { body: data.body } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
      })
      .eq('uuid', uuid)
      .select('post_id')

    if (error) throw error
    if (!rows || rows.length === 0) {
      throw new Error("Couldn't update this post — you may not have permission.")
    }

    return { success: true, message: 'Post updated successfully' }
  },

  async pinPost(uuid: string, pinned: boolean, pinnedTitle?: string) {
    const { data: rows, error } = await supabaseCommunity
      .from('posts')
      .update({
        pinned,
        pinned_title: pinned ? (pinnedTitle || null) : null,
      })
      .eq('uuid', uuid)
      .select('post_id')

    if (error) throw error
    if (!rows || rows.length === 0) {
      throw new Error("Couldn't update the notice board — you may not have permission.")
    }

    return { success: true, message: pinned ? 'Post pinned to notice board' : 'Post unpinned' }
  },

  async getPinnedPosts() {
    const { data, error } = await supabaseCommunity
      .from('posts')
      .select(`
        post_id, uuid, body, category, status, created_at,
        pinned, pinned_title,
        members!posts_author_id_fkey (
          uuid, full_name, avatar_url
        )
      `)
      .eq('status', 'published')
      .eq('pinned', true)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) throw error

    const mapped = (data || []).map((p: any) => ({
      uuid: p.uuid,
      category: p.category || 'welfare',
      body: p.body || '',
      pinnedTitle: p.pinned_title || null,
      authorName: p.members?.full_name || 'AquaTerra',
      authorUuid: p.members?.uuid || '',
      authorAvatar: p.members?.avatar_url || null,
      createdAt: p.created_at,
    }))

    return { success: true, data: mapped }
  },

  async searchMembers(query: string) {
    const { data, error } = await supabaseCommunity
      .from('members')
      .select('member_id, uuid, full_name, avatar_url, email, role')
      .eq('status', 'active')
      .ilike('full_name', `%${query}%`)
      .limit(10)

    if (error) throw error

    const mappedMembers = data.map(m => ({
      memberId: m.member_id,
      uuid: m.uuid,
      fullName: m.full_name,
      avatarUrl: m.avatar_url ?? undefined,
      email: m.email,
      role: m.role
    }))

    return { success: true, data: { members: mappedMembers } }
  },

  async getComments(postUuid: string, params: { page?: number; limit?: number; postId?: number } = {}) {
    const page = params.page || 1
    const limit = params.limit || 10
    const offset = (page - 1) * limit

    let postId: number
    if (params.postId) {
      postId = params.postId
    } else {
      const { data: post, error: postError } = await supabaseCommunity
        .from('posts').select('post_id').eq('uuid', postUuid).single()
      if (postError || !post) throw new Error('Post not found')
      postId = (post as any).post_id as number
    }

    const { data: comments, error, count } = await supabaseCommunity
      .from('comments')
      .select(`
        comment_id, uuid, body, created_at,
        author:members!author_id(member_id, uuid, full_name, avatar_url, role)
      `, { count: 'exact' })
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return {
      success: true,
      data: (comments || []).map((c: any) => ({
        commentId: c.comment_id,
        uuid: c.uuid,
        body: c.body,
        createdAt: c.created_at,
        authorId: c.author?.member_id,
        authorUuid: c.author?.uuid,
        authorName: c.author?.full_name || 'Member',
        authorAvatar: c.author?.avatar_url || null,
        authorRole: c.author?.role || 'member',
      })),
      pagination: {
        currentPage: page,
        totalItems: count || 0,
        hasNextPage: (count || 0) > page * limit,
      }
    }
  },

  async addComment(postUuid: string, body: string, knownPostId?: number) {
    const memberId = await getCachedMemberId()
    if (!memberId) throw new Error('Not authenticated')

    let postId: number
    if (knownPostId) {
      postId = knownPostId
    } else {
      const { data: postRow } = await supabaseCommunity.from('posts').select('post_id').eq('uuid', postUuid).single()
      if (!postRow) throw new Error('Post not found')
      postId = (postRow as any).post_id as number
    }

    const { data: comment, error } = await supabaseCommunity
      .from('comments')
      .insert({ post_id: postId as number, author_id: memberId as number, body: body.trim() })
      .select(`
        comment_id, uuid, body, created_at,
        author:members!author_id(member_id, uuid, full_name, avatar_url, role)
      `)
      .single()

    if (error) throw error

    // ── Notify the post author about the new comment ──
    const { data: postRow } = await supabaseCommunity
      .from('posts')
      .select('author_id, uuid, body')
      .eq('post_id', postId)
      .single()
    if (postRow) {
      const authorName = (comment as any).author?.full_name || 'Someone'
      await notificationService.create({
        memberId: (postRow as any).author_id,
        type: 'comment',
        title: `${authorName} commented on your post`,
        subtitle: body.trim().slice(0, 140),
        link: `/post/${(postRow as any).uuid}`,
      })
    }

    return {
      success: true,
      data: {
        commentId: (comment as any).comment_id,
        uuid: (comment as any).uuid,
        body: (comment as any).body,
        createdAt: (comment as any).created_at,
        authorId: (comment as any).author?.member_id,
        authorUuid: (comment as any).author?.uuid,
        authorName: (comment as any).author?.full_name || 'Member',
        authorAvatar: (comment as any).author?.avatar_url || null,
        authorRole: (comment as any).author?.role || 'member',
      }
    }
  },

  async deleteComment(commentUuid: string) {
    const memberId = await getCachedMemberId()
    if (!memberId) throw new Error('Not authenticated')

    const { data: member } = await supabaseCommunity
      .from('members')
      .select('member_id, role')
      .eq('member_id', memberId)
      .single()
    if (!member) throw new Error('Member not found')

    const isLeader = ['director', 'hod', 'super_admin'].includes(member.role ?? '')

    // Leaders can delete any comment; members can only delete their own.
    // `.select()` to detect an RLS-blocked / no-match delete (no error +
    // zero rows) so the UI doesn't falsely report the comment removed.
    let query = supabaseCommunity.from('comments').delete().eq('uuid', commentUuid)
    if (!isLeader) {
      query = query.eq('author_id', member.member_id) as any
    }

    const { data, error } = await query.select('comment_id')
    if (error) throw error
    if (!data || data.length === 0) {
      throw new Error("Couldn't delete this comment — you may not have permission.")
    }
    return { success: true }
  },

  async uploadImages(files: File[]) {
    const { data: { session } } = await supabaseCommunity.auth.getSession()
    if (!session?.user) throw new Error('Not authenticated')
    const userId = session.user.id

    const images = await Promise.all(files.map(async (file) => {
      const ext = file.name.split('.').pop()
      const fileName = `${userId}/${crypto.randomUUID()}.${ext}`

      const { data, error } = await supabaseCommunity.storage
        .from('post-images')
        .upload(fileName, file)

      if (error) throw error

      const { data: { publicUrl } } = supabaseCommunity.storage
        .from('post-images')
        .getPublicUrl(data.path)

      return { url: publicUrl, name: file.name, size: file.size }
    }))

    return { success: true, data: { images } }
  },

  /**
   * Upload PDF / PPTX attachments via Supabase Storage. Mirrors the
   * image-upload contract so CreatePostModal can use them interchangeably.
   *
   * Bucket: `post-documents`. The bucket needs to exist in Supabase with
   * appropriate RLS allowing authenticated INSERT + public SELECT. If it
   * doesn't exist yet, create it via the Supabase dashboard or apply:
   *
   *   INSERT INTO storage.buckets (id, name, public) VALUES
   *     ('post-documents', 'post-documents', true);
   *
   * The frontend mimetype filter on the file input restricts uploads to
   * PDF / PPTX before they ever hit the bucket; we still pass the original
   * filename + mimetype through so post_documents can store them for UI.
   */
  async uploadDocuments(files: File[]) {
    const { data: { session } } = await supabaseCommunity.auth.getSession()
    if (!session?.user) throw new Error('Not authenticated')
    const userId = session.user.id

    const documents = await Promise.all(files.map(async (file) => {
      const ext = file.name.split('.').pop()
      const fileName = `${userId}/${crypto.randomUUID()}.${ext}`

      const { data, error } = await supabaseCommunity.storage
        .from('post-documents')
        .upload(fileName, file, { contentType: file.type })

      if (error) throw error

      const { data: { publicUrl } } = supabaseCommunity.storage
        .from('post-documents')
        .getPublicUrl(data.path)

      return {
        url: publicUrl,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
      }
    }))

    return { success: true, data: { documents } }
  },
}

export default feedService
