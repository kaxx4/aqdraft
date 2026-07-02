/**
 * AquaTerra Sitemap Generator
 * Run: node scripts/generate-sitemap.mjs
 *
 * Fetches project slugs from the public CMS Supabase,
 * then writes a complete sitemap.xml to public/sitemap.xml
 */

import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))

// ── Config ───────────────────────────────────────────────────────────────────
const BASE_URL = 'https://www.ngoaquaterra.com'
const OUT_PATH = join(__dir, '../public/sitemap.xml')

// Public CMS Supabase (welfare projects + blogs — read-only)
const CMS_URL = 'https://nurtpdbqfizmqtztmiwk.supabase.co'
const CMS_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51cnRwZGJxZml6bXF0enRtaXdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjE1NDQsImV4cCI6MjA5MTAzNzU0NH0.v-clxVi6B-tqQz8508ic4DwwQVPH0cUjhZJjtkdKwYA'

// ── AquaTerra static routes (actual live paths) ───────────────────────────────
const STATIC_AQ = [
  { path: '/',                   changefreq: 'daily',   priority: '1.0' },
  { path: '/project',            changefreq: 'weekly',  priority: '0.9' },
  { path: '/blog',               changefreq: 'weekly',  priority: '0.9' },
  { path: '/about-aquaterra',    changefreq: 'monthly', priority: '0.9' },
  { path: '/everythingwedo',     changefreq: 'monthly', priority: '0.9' },
  { path: '/collaborations',     changefreq: 'monthly', priority: '0.8' },
  { path: '/support-us',         changefreq: 'monthly', priority: '0.8' },
  { path: '/recruitment',        changefreq: 'monthly', priority: '0.8' },
  { path: '/contact',            changefreq: 'monthly', priority: '0.7' },
  { path: '/links',              changefreq: 'monthly', priority: '0.6' },
  { path: '/starrynight2026',    changefreq: 'monthly', priority: '0.6' },
  { path: '/volunteer-handbook', changefreq: 'monthly', priority: '0.6' },
]

// ── Paradox static routes ─────────────────────────────────────────────────────
const STATIC_PARADOX = [
  { path: '/paradox',            changefreq: 'weekly',  priority: '0.9' },
  { path: '/paradox/events',     changefreq: 'weekly',  priority: '0.8' },
  { path: '/paradox/blog',       changefreq: 'weekly',  priority: '0.8' },
  { path: '/paradox/afterparty', changefreq: 'monthly', priority: '0.7' },
  { path: '/paradox/team',       changefreq: 'monthly', priority: '0.6' },
  { path: '/paradox/contact',    changefreq: 'monthly', priority: '0.6' },
]

// ── AquaTerra blog slugs ──────────────────────────────────────────────────────
const AQ_BLOG_SLUGS = [
  'dynamics',
  'he-barks-i-heal',
  'art-of-empathy-(noun)',
  'voicing-one-s-opinions',
  'before-you-judge-read-this',
  'syntax-error',
  'a-cup-of-tea',
  'vibe-reviewing-booktok-s-answer-to-declining-imagery',
  'the-art-of-nostalgia-heartbreak',
  'pebbles-and-peaks',
  'people-in-the-mirror',
  'letter-to-my-city',
  'welcome-to-blogs',
]

// ── Paradox blog slugs (seeded May 2026) ─────────────────────────────────────
const PARADOX_BLOG_SLUGS = [
  'picklejam-paradox-2026',
  'startup-standoff-paradox-2026',
  'the-prodigy-paradox-2026',
  'wicket-wars-paradox-2026',
  'score-for-a-smile-paradox-2026',
  'terramun-paradox-2026',
  'dream-deck-paradox-2026',
  'showstopper-paradox-2026',
  'shutternaut-paradox-2026',
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function urlEntry(path, changefreq = 'monthly', priority = '0.5') {
  return [
    '  <url>',
    `    <loc>${BASE_URL}${path}</loc>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n')
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function generate() {
  const cms = createClient(CMS_URL, CMS_KEY)

  // ── Fetch project slugs from CMS ──
  console.log('Fetching project slugs…')
  const { data: projects, error: projErr } = await cms
    .from('welfare_projects')
    .select('slug')
    .eq('is_draft', false)
    .order('workshop_date', { ascending: false })

  if (projErr) console.warn('⚠ Could not fetch projects:', projErr.message)
  const projectSlugs = projects?.map(p => p.slug).filter(Boolean) ?? []
  console.log(`  Found ${projectSlugs.length} projects`)

  // ── Fetch AQ blog slugs from CMS (merge with known list) ──
  console.log('Fetching AQ blog slugs…')
  const { data: dbBlogs, error: blogErr } = await cms
    .from('blogs')
    .select('slug')
    .not('slug', 'is', null)
    .order('published_date', { ascending: false })

  if (blogErr) console.warn('⚠ Could not fetch blogs:', blogErr.message)
  const allAqBlogSlugs = [...new Set([
    ...(dbBlogs?.map(b => b.slug).filter(Boolean) ?? []),
    ...AQ_BLOG_SLUGS,
  ])]
  console.log(`  Found ${allAqBlogSlugs.length} AQ blog posts`)

  // ── Build XML ──────────────────────────────────────────────────────────────
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
    '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9',
    '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">',
    '',
    `  <!-- Generated ${new Date().toISOString()} -->`,
    '',
    '  <!-- ━━━ AQUATERRA STATIC ━━━ -->',
    ...STATIC_AQ.map(s => urlEntry(s.path, s.changefreq, s.priority)),
    '',
    '  <!-- ━━━ AQUATERRA BLOG POSTS ━━━ -->',
    ...allAqBlogSlugs.map(slug => urlEntry(`/blog/${slug}`, 'never', '0.6')),
    '',
    `  <!-- ━━━ WELFARE PROJECT PAGES (${projectSlugs.length}) ━━━ -->`,
    ...projectSlugs.map(slug => urlEntry(`/project/${slug}`, 'monthly', '0.5')),
    '',
    '  <!-- ━━━ PARADOX 4.0 STATIC ━━━ -->',
    ...STATIC_PARADOX.map(s => urlEntry(s.path, s.changefreq, s.priority)),
    '',
    '  <!-- ━━━ PARADOX BLOG POSTS ━━━ -->',
    ...PARADOX_BLOG_SLUGS.map(slug => urlEntry(`/paradox/blog/${slug}`, 'never', '0.7')),
    '',
    '</urlset>',
  ]

  writeFileSync(OUT_PATH, lines.join('\n'), 'utf8')

  const total = STATIC_AQ.length + allAqBlogSlugs.length + projectSlugs.length
                + STATIC_PARADOX.length + PARADOX_BLOG_SLUGS.length

  console.log(`\n✅ Sitemap written → public/sitemap.xml`)
  console.log(`   ${STATIC_AQ.length} AquaTerra static pages`)
  console.log(`   ${allAqBlogSlugs.length} AQ blog posts`)
  console.log(`   ${projectSlugs.length} project pages`)
  console.log(`   ${STATIC_PARADOX.length} Paradox static pages`)
  console.log(`   ${PARADOX_BLOG_SLUGS.length} Paradox blog posts`)
  console.log(`   ${total} URLs total`)
}

generate().catch(e => { console.error(e); process.exit(1) })
