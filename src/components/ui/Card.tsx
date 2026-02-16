import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'border border-[var(--border)] bg-[var(--bg-surface)] p-6 md:p-8 transition-all duration-300 hover:border-[var(--border)]/80',
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = 'Card'

export default Card
