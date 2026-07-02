import { useEffect, useLayoutEffect } from 'react'

interface UseMetaProps {
  title: string
  description: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  author?: string
  publishDate?: string
}

const updateMeta = (property: string, content: string, isProperty = true) => {
  const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`
  const attrName = isProperty ? 'property' : 'name'
  let el = document.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attrName, property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

// useLayoutEffect on the client, useEffect on server (avoids SSR warning)
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * Hook to set meta tags for the current page
 * Handles Open Graph, Twitter Card, and basic meta tags
 *
 * Uses useLayoutEffect to update document.title synchronously before paint,
 * preventing the "flash of stale title" during route changes in SPAs.
 */
export const useMeta = ({
  title,
  description,
  image = '',
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = 'website',
  author,
  publishDate,
}: UseMetaProps) => {
  // Set title synchronously BEFORE paint to prevent flicker on route change
  useIsomorphicLayoutEffect(() => {
    if (typeof document !== 'undefined' && title) {
      document.title = title
    }
  }, [title])

  // Other meta tags can update after paint (crawlers read final DOM)
  useEffect(() => {
    // Update document title
    document.title = title

    // Update/create meta description
    updateMeta('description', description, false)

    // Update Open Graph tags
    updateMeta('og:type', type)
    updateMeta('og:title', title)
    updateMeta('og:description', description)
    updateMeta('og:url', url)
    updateMeta('og:site_name', 'AquaTerra')

    if (image) {
      updateMeta('og:image', image)
      updateMeta('og:image:width', '1200')
      updateMeta('og:image:height', '630')
      updateMeta('og:image:type', 'image/png')
    }

    // Twitter Card tags
    updateMeta('twitter:card', image ? 'summary_large_image' : 'summary', false)
    updateMeta('twitter:title', title, false)
    updateMeta('twitter:description', description, false)
    if (image) {
      updateMeta('twitter:image', image, false)
    }

    // Article specific tags
    if (type === 'article' && author) {
      updateMeta('article:author', author, false)
    }
    if (type === 'article' && publishDate) {
      updateMeta('article:published_time', publishDate)
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url)
  }, [title, description, image, url, type, author, publishDate])
}

export default useMeta
