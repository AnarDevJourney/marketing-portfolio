import type { ReactNode } from 'react'
import { Link } from 'react-router'

type Variant = 'primary' | 'outline' | 'ghost'

interface ButtonProps {
  children: ReactNode
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: Variant
  className?: string
  disabled?: boolean
  /** Cursor label shown by the custom cursor (see Cursor). */
  cursor?: string
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-background hover:bg-fg',
  outline:
    'border border-fg/20 text-fg hover:border-fg hover:bg-fg hover:text-background',
  ghost: 'text-fg hover:text-primary',
}

/**
 * Pill button whose label rolls up on hover (two stacked copies, transform only).
 * Renders a router Link for "/..." hrefs, an <a> for other hrefs, else a <button>.
 */
export function Button({
  children,
  href,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled,
  cursor,
}: ButtonProps) {
  const classes = `group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full px-8 text-sm font-medium uppercase tracking-[0.14em] transition-colors duration-500 ease-out-quart disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant]} ${className}`
  const label = (
    <span className="relative block overflow-hidden">
      <span className="block transition-transform duration-500 ease-out-expo group-hover:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-out-expo group-hover:translate-y-0"
      >
        {children}
      </span>
    </span>
  )

  if (href?.startsWith('/')) {
    return (
      <Link to={href} className={classes} data-cursor={cursor}>
        {label}
      </Link>
    )
  }
  if (href) {
    const external = /^https?:/.test(href)
    return (
      <a
        href={href}
        className={classes}
        data-cursor={cursor}
        {...(external && { target: '_blank', rel: 'noreferrer' })}
      >
        {label}
      </a>
    )
  }
  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      disabled={disabled}
      data-cursor={cursor}
    >
      {label}
    </button>
  )
}
