'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/resume', label: 'Resume' },
  { href: '/contact', label: 'Contact' },
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-subtle)] bg-[var(--bg)]/90 backdrop-blur-md">
      <nav className="container mx-auto flex h-14 items-center justify-between px-6 md:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="font-[family-name:var(--font-playfair)] text-lg text-[var(--text-primary)] tracking-tight">
            ZZ
          </span>
          <span className="hidden sm:block h-4 w-px bg-[var(--border)]" />
          <span className="hidden sm:block text-xs tracking-[0.2em] uppercase text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors duration-300">
            Portfolio
          </span>
        </Link>

        <ul className="flex gap-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  'relative px-3 py-1.5 text-xs tracking-[0.15em] uppercase transition-colors duration-300',
                  pathname === link.href
                    ? 'text-[var(--accent)] font-medium'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-3 right-3 h-px bg-[var(--accent)]" />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
