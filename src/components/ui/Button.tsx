import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
          {
            'bg-[var(--accent)] text-white hover:bg-[var(--accent-dim)] active:bg-[var(--accent-dim)]': variant === 'default',
            'border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)]': variant === 'outline',
            'text-[var(--text-secondary)] hover:text-[var(--accent)]': variant === 'ghost',
            'h-8 px-3 text-xs tracking-wide uppercase': size === 'sm',
            'h-10 px-5 text-sm tracking-wide uppercase': size === 'md',
            'h-12 px-7 text-sm tracking-wider uppercase': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export default Button
