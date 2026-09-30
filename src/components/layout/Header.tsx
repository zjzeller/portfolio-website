'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/resume', label: 'Resume' },
  { href: '/contact', label: 'Contact' },
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-subtle)] bg-[var(--bg)]/90 backdrop-blur-md">
      <nav className="container mx-auto flex h-14 items-center justify-between px-6 md:px-8">
        <Link href="/" className="group flex items-center gap-3">
          {/* Monogram tile: same design as the favicon so the tab and page match */}
          <span className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-[var(--border)] bg-[var(--bg)] font-[family-name:var(--font-playfair)] text-[15px] font-bold leading-none text-[var(--accent)] transition-colors duration-300 group-hover:border-[var(--accent)]/60">
            ZZ
          </span>
          <span className="hidden sm:block h-4 w-px bg-[var(--border)]" />
          <span className="hidden sm:block text-xs tracking-[0.2em] uppercase text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors duration-300">
            Portfolio
          </span>
        </Link>

        <ul className="flex gap-0 sm:gap-1">
          {navLinks.map((link) => (
            // On phones the ZZ logo already links home, so the Home link is hidden to save space
            <li key={link.href} className={link.href === '/' ? 'hidden sm:block' : undefined}>
              <Link
                href={link.href}
                className={cn(
                  'relative px-2 sm:px-3 py-1.5 text-xs tracking-[0.08em] sm:tracking-[0.15em] uppercase transition-colors duration-300',
                  pathname === link.href
                    ? 'text-[var(--accent)] font-medium'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-2 right-2 sm:left-3 sm:right-3 h-px bg-[var(--accent)]" />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
