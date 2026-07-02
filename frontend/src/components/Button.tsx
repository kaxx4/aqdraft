import { ButtonHTMLAttributes, ReactNode } from 'react'
import Spinner from './Spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg [transition:background-color_200ms,box-shadow_200ms,color_200ms,transform_120ms] active:scale-[0.96] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'

  // Backgrounds/rings reference the canonical design-system CSS vars via
  // arbitrary-value utilities — the old forest-*/cream-* Tailwind colors were
  // never defined in the v4 @theme, so primary/secondary/ghost rendered with
  // a transparent background. Tokens keep these theme-aware.
  const variantStyles = {
    primary: 'text-white [background-color:var(--accent)] hover:[background-color:var(--accent-h)] focus:ring-[var(--accent)]',
    secondary: '[background-color:var(--surface)] [color:var(--txt)] border [border-color:var(--line)] hover:[background-color:var(--surface-2)] focus:ring-[var(--line-2)]',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
    ghost: 'bg-transparent [color:var(--txt)] hover:[background-color:var(--surface)] focus:ring-[var(--line-2)]'
  }

  const sizeStyles = {
    // min-h enforces ≥44×44 touch targets on mobile (Apple HIG).
    // sm: 40px (used in dense rows where 44 is too much, but never <40)
    // md: 44px — the standard CTA size
    // lg: 52px — primary/marketing hero CTAs
    sm: 'px-3 py-1.5 text-sm min-h-10',
    md: 'px-4 py-2 text-sm min-h-11',
    lg: 'px-6 py-3 text-base min-h-[52px]'
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" className="mr-2" />}
      {children}
    </button>
  )
}

export default Button
