import { supabaseCommunity } from '../lib/supabaseCommunity'
// Welfare projects live in the legacy welfare Supabase project (not the
// community DB). Same `supabase` client `PublicProjectsPage` uses.
import { supabase as supabaseWelfare } from '../lib/supabase'

export interface SearchPerson {
  memberId: number
  uuid: string
  fullName: string
  avatarUrl?: string
  email: string
  classGrade?: string
  role: string | null
}

export interface SearchProject {
  uuid: string
  title: string
  description: string
  category: string
  status: string
  coverImageUrl?: string
  memberCount: number
}

export interface SearchTeam {
  uuid: string
  name: string
  description: string
  category: string
  logoUrl?: string
  memberCount: number
}

export interface SearchSchool {
  uuid: string
  name: string
  shortName?: string
  logoUrl?: string
  location?: string
  memberCount: number
}

export interface SearchPost {
  postId: number
  uuid: string
  body: string
  authorName: string
  authorUuid: string
  createdAt: string
  category: string
  likeCount: number
  commentCount: number
  images: { url?: string; blobUrl?: string; displayOrder?: number }[]
}

// `class_grade` is stored as free-text on `members` (no normalised
// classes table exists). Class search derives buckets by grouping
// matching `class_grade` values client-side and surfacing each as a
// SearchClass row with a member count.
export interface SearchClass {
  /** Doubles as both stable key and display name — class_grade string. */
  uuid: string
  name: string
  memberCount: number
}

export interface SearchResults {
  people: SearchPerson[]
  projects: SearchProject[]
  teams: SearchTeam[]
  schools: SearchSchool[]
  classes: SearchClass[]
  posts: SearchPost[]
}

export interface SearchResponse {
  success: boolean
  data: {
    query: string
    type: string
    totalCount: number
    results: SearchResults
  }
}

export interface QuickSearchSuggestion {
  uuid: string
  name: string
  type: 'person' | 'project' | 'team'
  image?: string
}

export interface QuickSearchResponse {
  success: boolean
  data: {
    suggestions: QuickSearchSuggestion[]
  }
}

export const searchService = {
  async search(query: string, type: string = 'all', limit: number = 10): Promise<SearchResponse> {
    const results: SearchResults = {
      people: [],
      projects: [],
      teams: [],
      schools: [],
      classes: [],
      posts: [],
    }
    let totalCount = 0

    if (!query) {
      return { success: true, data: { query, type, totalCount: 0, results } }
    }

    // Strip PostgREST filter metacharacters before interpolating into
    // .ilike / .or filters. `%` and `_` are LIKE wildcards; `,` and `()`
    // are how .or() delimits + groups its filter list — an unescaped one
    // produces a malformed filter and 400s the request, and because all
    // branches run in one Promise.all a single bad branch rejects the
    // whole search. (Same guard directorService already applies.)
    const q = query.replace(/[%,()_]/g, '').trim()
    if (!q) {
      return { success: true, data: { query, type, totalCount: 0, results } }
    }

    const queries = []

    if (type === 'all' || type === 'people') {
      queries.push(
        supabaseCommunity.from('members')
          .select('*')
          .eq('status', 'active')
          // Match name OR class_grade so "Class 11" / "Grade 10" surfaces
          // members in that grade — supports the class-card click-through.
          .or(`full_name.ilike.%${q}%,class_grade.ilike.%${q}%`)
          .limit(limit)
          .then(({ data }) => {
            if (data) {
              results.people = data.map(m => ({
                memberId: m.member_id,
                uuid: m.uuid,
                fullName: m.full_name,
                avatarUrl: m.avatar_url ?? undefined,
                email: m.email,
                classGrade: m.class_grade ?? undefined,
                role: m.role
              }))
              totalCount += data.length
            }
          })
      )
    }

    // Class search — `members.class_grade` is free-text (no `classes` table
    // exists). Derive class buckets by fetching matching grades and grouping
    // client-side, then surface each as a SearchClass row with a count.
    if (type === 'all' || type === 'classes') {
      queries.push(
        supabaseCommunity.from('members')
          .select('class_grade')
          .eq('status', 'active')
          .not('class_grade', 'is', null)
          .ilike('class_grade', `%${q}%`)
          .limit(500)
          .then(({ data }) => {
            if (!data) return
            const counts = new Map<string, number>()
            for (const row of data) {
              const grade = (row as any).class_grade as string | null
              if (!grade) continue
              counts.set(grade, (counts.get(grade) ?? 0) + 1)
            }
            results.classes = Array.from(counts.entries())
              .sort((a, b) => b[1] - a[1])
              .slice(0, limit)
              .map(([name, memberCount]) => ({ uuid: name, name, memberCount }))
            totalCount += results.classes.length
          })
      )
    }

    if (type === 'all' || type === 'teams') {
      queries.push(
        supabaseCommunity.from('teams')
          .select('*')
          .eq('is_active', true)
          .ilike('name', `%${q}%`)
          .limit(limit)
          .then(({ data }) => {
            if (data) {
              results.teams = data.map((t: any) => ({
                uuid: t.uuid,
                name: t.name,
                description: t.description ?? '',
                category: t.category,
                logoUrl: t.logo_url ?? undefined,
                memberCount: 0
              }))
              totalCount += data.length
            }
          })
      )
    }

    if (type === 'all' || type === 'schools') {
      queries.push(
        supabaseCommunity.from('schools')
          .select('*')
          .ilike('name', `%${q}%`)
          .limit(limit)
          .then(({ data }) => {
            if (data) {
              results.schools = data.map((s: any) => ({
                uuid: s.uuid,
                name: s.name,
                shortName: s.short_name ?? undefined,
                logoUrl: s.logo_url ?? undefined,
                location: s.location ?? undefined,
                memberCount: 0,
              }))
              totalCount += data.length
            }
          })
      )
    }

    if (type === 'all' || type === 'posts') {
      queries.push(
        supabaseCommunity.from('post_feed_view')
          .select('post_id,uuid,body,author_name,author_uuid,created_at,category,like_count,comment_count,images')
          .eq('status', 'published')
          .ilike('body', `%${q}%`)
          .order('created_at', { ascending: false })
          .limit(limit)
          .then(({ data }) => {
            if (data) {
              results.posts = data.map((p: any) => ({
                postId: p.post_id,
                uuid: p.uuid,
                body: p.body,
                authorName: p.author_name,
                authorUuid: p.author_uuid,
                createdAt: p.created_at,
                category: p.category,
                likeCount: p.like_count || 0,
                commentCount: p.comment_count || 0,
                images: p.images || [],
              }))
              totalCount += data.length
            }
          })
      )
    }

    // Welfare projects search — uses the LEGACY welfare Supabase project
    // (welfare_projects table) since that's where the public-facing
    // projects already live. Slug is used as the linkable id because
    // /projects/:slug is how PublicProjectsPage routes them.
    if (type === 'all' || type === 'projects') {
      queries.push(
        supabaseWelfare.from('welfare_projects')
          .select('id, slug, header, objective, main_image, workshop_date')
          .eq('is_draft', false)
          .or(`header.ilike.%${q}%,objective.ilike.%${q}%`)
          .order('workshop_date', { ascending: false })
          .limit(limit)
          .then(({ data }) => {
            if (data) {
              results.projects = data.map((p: any) => ({
                uuid: p.slug,
                title: p.header,
                description: p.objective ?? '',
                category: p.objective ?? 'Others',
                status: 'active',
                coverImageUrl: p.main_image ?? undefined,
                memberCount: 0,
              }))
              totalCount += data.length
            }
          })
      )
    }

    await Promise.all(queries)

    return {
      success: true,
      data: {
        query,
        type,
        totalCount,
        results
      }
    }
  },

  async quickSearch(query: string, limit: number = 5): Promise<QuickSearchResponse> {
    const suggestions: QuickSearchSuggestion[] = []

    if (!query) {
      return { success: true, data: { suggestions } }
    }

    // Same metachar strip as search() — keeps LIKE wildcards from
    // corrupting matches on queries containing % or _.
    const q = query.replace(/[%,()_]/g, '').trim()
    if (!q) {
      return { success: true, data: { suggestions } }
    }

    const [peopleRes, teamsRes] = await Promise.all([
      supabaseCommunity.from('members')
        .select('uuid, full_name, avatar_url')
        .ilike('full_name', `%${q}%`)
        .limit(limit),
      supabaseCommunity.from('teams')
        .select('uuid, name, logo_url')
        .ilike('name', `%${q}%`)
        .limit(limit)
    ])

    if (peopleRes.data) {
      suggestions.push(...peopleRes.data.map(m => ({
        uuid: m.uuid,
        name: m.full_name,
        type: 'person' as const,
        image: m.avatar_url ?? undefined
      })))
    }

    if (teamsRes.data) {
      suggestions.push(...teamsRes.data.map(t => ({
        uuid: t.uuid,
        name: t.name,
        type: 'team' as const,
        image: t.logo_url ?? undefined
      })))
    }

    return {
      success: true,
      data: {
        suggestions: suggestions.slice(0, limit * 2)
      }
    }
  }
}

export default searchService
