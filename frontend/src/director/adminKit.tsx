import { ReactNode } from 'react'

/**
 * Admin desk kit — the small shared design system the HoD desk routes through.
 *
 * Goal: one header, one toolbar, one badge, one empty state across all 11 tabs,
 * so the desk reads as ONE product instead of eleven. Middle-ground brand: calm,
 * efficient controls with a few branded accents (the sticker section label, the
 * accent count chip). Styling lives under `.adm-*` in v6.css; the whole desk is
 * wrapped in `.admin`, which also flattens the public site's playful motion.
 */

/** One max-width + page padding for every tab — kills the width-jump on switch. */
export function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="adm-layout">{children}</div>
}

/** One header treatment everywhere: branded sticker label + clean title + count + actions. */
export function AdminTabHeader({
  label, title, subtitle, count, actions,
}: {
  label?: string
  title: string
  subtitle?: string
  count?: number
  actions?: ReactNode
}) {
  return (
    <header className="adm-header">
      <div className="adm-header-main">
        {label && <span className="adm-header-label">{label}</span>}
        <div className="adm-header-titlerow">
          <h2 className="adm-header-title">{title}</h2>
          {count != null && count > 0 && (
            <span className="adm-header-count" aria-label={`${count} items`}>{count}</span>
          )}
        </div>
        {subtitle && <p className="adm-header-sub">{subtitle}</p>}
      </div>
      {actions && <div className="adm-header-actions">{actions}</div>}
    </header>
  )
}

/** Search + filters + right-aligned primary actions — lifted from the best tab (Members). */
export function DataToolbar({
  search, onSearch, searchPlaceholder = 'Search…', children, actions,
}: {
  search?: string
  onSearch?: (v: string) => void
  searchPlaceholder?: string
  children?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="adm-toolbar">
      {onSearch && (
        <div className="adm-search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            value={search ?? ''}
            onChange={e => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            autoComplete="off"
          />
        </div>
      )}
      {children && <div className="adm-toolbar-filters">{children}</div>}
      {actions && <div className="adm-toolbar-actions">{actions}</div>}
    </div>
  )
}

export type BadgeTone = 'neutral' | 'success' | 'warn' | 'danger' | 'info'

/** One status vocabulary — replaces the desk's 5 different status representations. */
export function StatusBadge({ children, tone = 'neutral', dot }: { children: ReactNode; tone?: BadgeTone; dot?: boolean }) {
  return (
    <span className={'adm-badge adm-badge-' + tone}>
      {dot && <span className="adm-badge-dot" aria-hidden />}
      {children}
    </span>
  )
}

/** One empty state — title + optional hint + optional action. */
export function EmptyState({ icon = '—', title, hint, action }: { icon?: ReactNode; title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="adm-empty">
      <div className="adm-empty-icon" aria-hidden>{icon}</div>
      <div className="adm-empty-title">{title}</div>
      {hint && <p className="adm-empty-hint">{hint}</p>}
      {action && <div className="adm-empty-action">{action}</div>}
    </div>
  )
}

/** Filter pill used inside DataToolbar (consistent with the brand chip, calmed). */
export function FilterPill({ active, onClick, children }: { active?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={'adm-pill' + (active ? ' is-active' : '')} onClick={onClick} aria-pressed={active}>
      {children}
    </button>
  )
}
