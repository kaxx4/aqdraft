// Right-size remote images at render time.
//
// THE PROBLEM: the bulk of our content imagery (post images, project covers,
// blog headers) lives on Framer's CDN (`framerusercontent.com`) at full
// resolution — ~3.3 MB JPEGs. A feed or projects grid renders ~20 of them into
// cards that are only ~400–640 px wide, so the browser downloads tens of MB to
// paint thumbnails. That is the single biggest cause of "the data takes forever
// to load."
//
// THE FIX: Framer's CDN supports on-the-fly downscaling via `?scale-down-to=N`
// (caps the longer edge to N px) AND automatically negotiates WebP from the
// browser's Accept header. A 3.3 MB original drops to ~225 KB at 1024 px / WebP
// — a 15× cut — with zero visible quality loss at the sizes we actually render.
// It only ever downscales (never upscales), and it's free: it's Framer's CDN,
// not Supabase, so the project's plan tier is irrelevant.
//
// SAFETY: this rewrites ONLY `framerusercontent.com` image URLs. Every other
// source — Supabase storage, Google avatars/Drive, data:/blob: URIs, relative
// paths, already-sized URLs — is passed through untouched. That makes `img()`
// safe to wrap around any <img src> without knowing the host.

export type ImgContext = 'avatar' | 'thumb' | 'card' | 'cover' | 'full'

// Target longer-edge px per render context. Sized ~2× the CSS display size so
// they stay crisp on retina/2× displays — quality is preserved, only wasted
// resolution is trimmed.
const SIZE: Record<ImgContext, number> = {
  avatar: 192,   // 40–96 px avatars
  thumb: 320,    // small inline thumbnails
  card: 1280,    // feed / project / blog cards (display ~400–640 px)
  cover: 1600,   // list cover / hero strips
  full: 2000,    // lightbox / full detail view (near-original)
}

export function sized(url: string | null | undefined, ctx: ImgContext = 'card'): string {
  if (!url || typeof url !== 'string') return url ?? ''
  // Only Framer's CDN supports the resize param; everything else is left as-is.
  if (!url.includes('framerusercontent.com/images/')) return url
  // Respect a size that's already baked into the URL.
  if (url.includes('scale-down-to=')) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}scale-down-to=${SIZE[ctx]}`
}
