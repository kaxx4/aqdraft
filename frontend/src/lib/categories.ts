// Maps a post/role/feed category to the slug of its department card on
// /everything-we-do (each department <article> carries this id as an anchor).
// Used by the passive content-network links on PostPage, OpportunitiesPage,
// and FeedPage so a category chip becomes "see what this team does".
export const CAT_TO_DEPT: Record<string, string> = {
  events: 'events',
  welfare: 'welfare-projects',
  content: 'social-media',
  operations: 'collabs',
  labs: 'shikshaq',
}
