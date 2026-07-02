import {
  createContext, useCallback, useContext, useEffect,
  useMemo, useRef, useState,
} from 'react'
import { createPortal } from 'react-dom'
// (No framer-motion: this provider is mounted at app root on every page, so
// importing motion here put the whole ~44KB-gz library on the critical path.
// The identical fade/scale/slide enter+exit is now done in CSS below.)

/**
 * Branded confirm() replacement.
 *
 * Usage:
 *   const confirm = useConfirm()
 *   if (await confirm({ title: 'Delete?', body: '...', danger: true })) {
 *     // user clicked confirm
 *   }
 *
 * Mirrors the useToast() pattern — context + Provider + hook + portal.
 * The modal stays mounted at app root and AnimatePresence drives the
 * enter/exit animations (so the dismiss animation actually plays
 * instead of the modal vanishing instantly).
 */

export interface ConfirmOptions {
  title: string
  body?: string
  /** Defaults to "Confirm". */
  confirmLabel?: string
  /** Defaults to "Cancel". */
  cancelLabel?: string
  /** Renders the confirm button in tomato red instead of mint. */
  danger?: boolean
}

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn>(async () => false)

// Internal state shape — `resolver` is how the Promise gets settled
// when the user clicks confirm/cancel.
interface PendingConfirm extends ConfirmOptions {
  id: string
  resolver: (v: boolean) => void
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null)
  // Mirror of `pending.resolver` in a ref so `confirm()` (which is a
  // stable useCallback with no deps) can settle an in-flight confirm
  // before replacing it. Without this, a second confirm() call while
  // the first is still open would overwrite `pending` and the first
  // Promise would never settle — any `await confirm(...)` on it hangs
  // forever, leaving the calling button stuck in its busy state.
  const resolverRef = useRef<((v: boolean) => void) | null>(null)

  const confirm = useCallback<ConfirmFn>((opts) => {
    // A confirm is already open → resolve it false (treat as cancelled)
    // before this new one takes the slot.
    if (resolverRef.current) {
      resolverRef.current(false)
      resolverRef.current = null
    }
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
      setPending({
        ...opts,
        id: Date.now().toString() + Math.random(),
        resolver: resolve,
      })
    })
  }, [])

  const settle = useCallback((result: boolean) => {
    // Resolve via the ref (always the live resolver) and clear it so a
    // double-settle (e.g. Enter + backdrop in the same frame) can't
    // resolve twice. Then unmount the modal.
    if (resolverRef.current) {
      resolverRef.current(result)
      resolverRef.current = null
      setPending(null)
    }
  }, [])

  // Escape = cancel. Body scroll-lock while open.
  useEffect(() => {
    if (!pending) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') settle(false)
      if (e.key === 'Enter') settle(true)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [pending, settle])

  const value = useMemo(() => confirm, [confirm])

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined' && createPortal(
        <ConfirmModal pending={pending} onSettle={settle} />,
        document.body,
      )}
    </ConfirmContext.Provider>
  )
}

const AQC_CSS = `
@keyframes aqcOverlayIn { from { opacity: 0 } to { opacity: 1 } }
@keyframes aqcOverlayOut { from { opacity: 1 } to { opacity: 0 } }
@keyframes aqcDialogIn { from { opacity: 0; transform: scale(.96) translateY(8px) } to { opacity: 1; transform: none } }
@keyframes aqcDialogOut { from { opacity: 1; transform: none } to { opacity: 0; transform: scale(.98) translateY(4px) } }
.aqc-overlay { animation: aqcOverlayIn .18s cubic-bezier(.2,0,0,1); }
.aqc-overlay.aqc-closing { animation: aqcOverlayOut .18s cubic-bezier(.4,0,1,1) forwards; }
.aqc-dialog { animation: aqcDialogIn .18s cubic-bezier(.2,0,0,1); }
.aqc-overlay.aqc-closing .aqc-dialog { animation: aqcDialogOut .18s cubic-bezier(.4,0,1,1) forwards; }
@media (prefers-reduced-motion: reduce) { .aqc-overlay, .aqc-dialog { animation: none !important; } }
`

function ConfirmModal({
  pending, onSettle,
}: { pending: PendingConfirm | null; onSettle: (v: boolean) => void }) {
  // Keep the dialog mounted through its exit animation: when `pending` clears,
  // we play the closing animation, then unmount after the duration (this is
  // what AnimatePresence used to do, now done by hand so we don't ship motion).
  const [shown, setShown] = useState<PendingConfirm | null>(pending)
  const [closing, setClosing] = useState(false)
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (pending) { setShown(pending); setClosing(false) }
    else if (shown) {
      setClosing(true)
      const t = setTimeout(() => { setShown(null); setClosing(false) }, 180)
      return () => clearTimeout(t)
    }
  }, [pending]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-focus the cancel button on open — safer default than confirm,
  // since Enter still resolves true via the keyboard handler.
  useEffect(() => {
    if (shown && !closing) {
      const t = setTimeout(() => cancelRef.current?.focus(), 30)
      return () => clearTimeout(t)
    }
  }, [shown, closing])

  if (!shown) return null
  return (
    <>
      <style>{AQC_CSS}</style>
      <div
        className={'aqc-overlay' + (closing ? ' aqc-closing' : '')}
        onClick={() => onSettle(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}
      >
        <div
          className="aqc-dialog"
          onClick={(e) => e.stopPropagation()}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          style={{
            background: 'var(--card)',
            border: '2px solid var(--ink)',
            borderRadius: 18,
            boxShadow: '4px 4px 0 0 var(--ink)',
            padding: '22px 22px 18px',
            maxWidth: 400, width: '100%',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}
        >
            <h3
              id="confirm-title"
              style={{
                fontFamily: 'var(--display)', fontWeight: 800,
                fontSize: 20, lineHeight: 1.15, letterSpacing: '-0.01em',
                margin: 0, color: 'var(--ink)', textWrap: 'balance',
              } as React.CSSProperties}
            >
              {shown.title}
            </h3>

            {shown.body && (
              <p
                style={{
                  fontFamily: 'var(--eina)', fontSize: 14,
                  lineHeight: 1.55, color: 'var(--ink-2)',
                  margin: 0, textWrap: 'pretty',
                } as React.CSSProperties}
              >
                {shown.body}
              </p>
            )}

            <div
              style={{
                display: 'flex', gap: 8, marginTop: 6,
                flexDirection: 'row-reverse',
                /* Reverse so the primary action is right-aligned
                   (matches the rest of the codebase + iOS convention). */
              }}
            >
              <button
                onClick={() => onSettle(true)}
                style={{
                  flex: '1 1 auto', minHeight: 44,
                  padding: '0 18px', borderRadius: 999,
                  background: shown.danger ? 'var(--tomato, #FF4D2E)' : 'var(--mint)',
                  color: shown.danger ? '#fff' : '#0A0A0A',
                  border: shown.danger
                    ? '2px solid var(--tomato, #FF4D2E)'
                    : '2px solid var(--ink)',
                  boxShadow: '3px 3px 0 0 var(--ink)',
                  fontFamily: 'var(--display)', fontWeight: 800, fontSize: 14,
                  cursor: 'pointer',
                  transitionProperty: 'transform, box-shadow',
                  transitionDuration: '120ms',
                  transitionTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '5px 5px 0 0 var(--ink)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = ''
                  e.currentTarget.style.boxShadow = '3px 3px 0 0 var(--ink)'
                }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)' }}
                onMouseUp={(e) => { e.currentTarget.style.transform = '' }}
              >
                {shown.confirmLabel ?? 'Confirm'}
              </button>
              <button
                ref={cancelRef}
                onClick={() => onSettle(false)}
                style={{
                  flex: '0 0 auto', minHeight: 44,
                  padding: '0 18px', borderRadius: 999,
                  background: 'transparent', color: 'var(--ink-2)',
                  border: '1.5px solid var(--line-2)',
                  fontFamily: 'var(--display)', fontWeight: 700, fontSize: 14,
                  cursor: 'pointer',
                  transitionProperty: 'background, border-color, color',
                  transitionDuration: '120ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ink)'
                  e.currentTarget.style.color = 'var(--ink)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--line-2)'
                  e.currentTarget.style.color = 'var(--ink-2)'
                }}
              >
                {shown.cancelLabel ?? 'Cancel'}
              </button>
            </div>
        </div>
      </div>
    </>
  )
}

export function useConfirm() {
  return useContext(ConfirmContext)
}

export default ConfirmProvider
