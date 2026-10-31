import type { ReactNode } from 'react'

/** Page-width wrapper: max 1600px with fluid side gutters. */
export function Container({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`mx-auto w-full max-w-[1600px] px-gutter ${className}`}>
      {children}
    </div>
  )
}
