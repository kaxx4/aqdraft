// Type-only exports — no Axios, no HTTP client.
// Community services use supabaseCommunity directly.

export interface Member {
  uuid: string
  email: string
  fullName: string
  avatarUrl?: string
  classGrade?: string
  phone?: string
  role: 'member' | 'hod' | 'director' | 'super_admin'
  status: 'pending_approval' | 'active' | 'rejected' | 'suspended'
  rejectionNote?: string
  isSuperAdmin?: boolean
  createdAt?: string
}

export interface Post {
  postId: number
  uuid: string
  category: string
  body: string
  linkUrl?: string
  linkTitle?: string
  linkImage?: string
  status: string
  createdAt: string
  authorId: number
  authorUuid: string
  authorName: string
  authorAvatar?: string
  authorRole: string
  likeCount: number
  commentCount: number
  // Post images can carry either `blobUrl` (new posts, from Supabase
  // signed/public URLs) or `url` (legacy / sample posts, plain CDN URLs).
  // We normalize at render time by reading both; both fields are kept
  // optional so the type doesn't lie about either branch existing.
  images?: { blobUrl?: string; url?: string; displayOrder: number }[]
  // PDF / PPTX attachments. Backend post_documents table — selectors
  // need to be extended to JOIN before this field will be populated;
  // until then it stays `undefined` and renders nothing.
  documents?: { url: string; fileName: string; mimeType: string; size: number; displayOrder: number }[]
  taggedMembers?: { memberId: number; uuid: string; fullName: string; avatarUrl?: string }[]
  isLiked?: boolean
  teamName?: string
  teamUuid?: string
  pinned?: boolean
  pinnedTitle?: string | null
}

export interface Achievement {
  achievementId: number
  uuid: string
  memberId: number
  title: string
  description?: string
  achievementType: 'leadership' | 'academic' | 'competition' | 'personal_project' | 'other'
  achievementDate: string
  achievementEndDate?: string | null
  proofUrl?: string
  createdAt: string
  updatedAt: string
  // Approval workflow. New achievements start as 'pending'; only
  // 'approved' rows show on public profile pages. Owner sees own at
  // any status with a status badge.
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: number | null
  reviewedAt?: string | null
  reviewNote?: string | null
}

// Used by the director-side review queue — joins the achievement
// to the submitting member's name + avatar so the queue card has
// context without an extra fetch.
export interface AchievementReview extends Achievement {
  memberFullName: string
  memberUuid: string
  memberAvatarUrl?: string | null
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface School {
  uuid: string
  name: string
  shortName?: string
  logoUrl?: string
  location?: string
  website?: string
  memberCount: number
  createdAt: string
}

export interface SchoolDetails extends School {
  recentMembers: {
    uuid: string
    fullName: string
    avatarUrl?: string
    classGrade?: string
    role: string
  }[]
  classes: {
    uuid: string
    name: string
    gradeLevel?: string
    academicYear?: string
    memberCount: number
  }[]
}

export interface SchoolMember {
  uuid: string
  fullName: string
  avatarUrl?: string
  classGrade?: string
  role: string
  bio?: string
  className?: string
  classUuid?: string
  createdAt: string
}
