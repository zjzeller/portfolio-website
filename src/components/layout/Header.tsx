'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SITE_CONFIG } from '@/lib/constants'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/resume', label: 'Resume' },
  { href: '/contact', label: 'Contact' },
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#A8DADC] bg-[#F1FAEE]/95 backdrop-blur supports-[backdrop-filter]:bg-[#F1FAEE]/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image
            src="/assets/logos/logo.svg"
            alt={SITE_CONFIG.name}
            width={40}
            height={40}
            priority
          />
          <span className="text-xl font-bold text-[#1D3557]">
            {SITE_CONFIG.name}
          </span>
        </Link>

        <ul className="flex gap-6">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-[#E63946]',
                  pathname === link.href
                    ? 'text-[#E63946]'
                    : 'text-[#457B9D]'
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
