import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'

interface ImageLightboxProps {
  /**
   * When truthy, the lightbox opens. Pass `null` to dismiss — the
   * component stays mounted and AnimatePresence plays the exit
   * animation before unmounting the inner overlay.
   */
  src: string | null
  alt?: string
  onClose: () => void
}

export default function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  // Keep the last non-null src around so the exit animation has
  // something to render (otherwise we'd flash to a blank img).
  const [lastSrc, setLastSrc] = useState<string | null>(src)
  useEffect(() => {
    if (src) setLastSrc(src)
  }, [src])

  // Close on Escape key + body scroll-lock while open.
  useEffect(() => {
    if (!src) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [src, onClose])

  return createPortal(
    <AnimatePresence>
      {src && (
        <motion.div
          className="aq-lightbox-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
        >
          <motion.img
            src={lastSrc ?? src}
            alt={alt || ''}
            className="aq-lightbox-img"
            onClick={e => e.stopPropagation()}
            draggable={false}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
          />
          <button
            className="aq-lightbox-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
