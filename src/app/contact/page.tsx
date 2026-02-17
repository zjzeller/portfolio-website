import Link from 'next/link'
import PageViewTracker from '@/components/analytics/PageViewTracker'
import Button from '@/components/ui/Button'
import { SITE_CONFIG } from '@/lib/constants'
import { Github, Linkedin, Mail, ArrowUpRight } from 'lucide-react'

const contactMethods = [
  {
    icon: Mail,
    label: 'Email',
    value: SITE_CONFIG.links.email,
    href: `mailto:${SITE_CONFIG.links.email}`,
    external: false,
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    value: 'Connect professionally',
    href: SITE_CONFIG.links.linkedin,
    external: true,
  },
  {
    icon: Github,
    label: 'GitHub',
    value: 'View projects & code',
    href: SITE_CONFIG.links.github,
    external: true,
  },
]

export default function ContactPage() {
  return (
    <div className="container mx-auto px-6 md:px-8 py-16 md:py-24 max-w-4xl">
      <PageViewTracker pagePath="/contact" pageTitle="Contact" />

      {/* Header */}
      <div className="mb-16 animate-reveal">
        <span className="section-label">Contact</span>
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl mt-4 tracking-tight">
          Let&apos;s <span className="text-[var(--accent)]">Connect</span>
        </h1>
        <div className="editorial-rule w-16 mt-6" />
      </div>

      <p className="text-[var(--text-secondary)] text-lg leading-relaxed max-w-lg mb-14 animate-reveal-delay-1">
        I&apos;m always open to discussing new opportunities, collaborations, or chatting about data and technology.
      </p>

      {/* Contact methods */}
      <div className="space-y-px bg-[var(--border)] mb-20 animate-reveal-delay-2">
        {contactMethods.map((method) => (
          <a
            key={method.label}
            href={method.href}
            target={method.external ? '_blank' : undefined}
            rel={method.external ? 'noopener noreferrer' : undefined}
            className="group flex items-center justify-between p-6 md:p-8 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] transition-all duration-300"
          >
            <div className="flex items-center gap-5">
              <method.icon size={20} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors duration-300" />
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-[var(--text-muted)] mb-1">{method.label}</p>
                <p className="text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors duration-300">
                  {method.value}
                </p>
              </div>
            </div>
            <ArrowUpRight
              size={18}
              className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-300"
            />
          </a>
        ))}
      </div>

      {/* Quick links */}
      <div className="animate-reveal-delay-3">
        <div className="flex items-center gap-4 mb-8">
          <span className="section-label">Quick Links</span>
          <div className="flex-1 h-px bg-[var(--border-subtle)]" />
        </div>

        <div className="flex gap-3 flex-wrap">
          <a href="/assets/resume/zachary-zeller-resume.pdf" download>
            <Button variant="outline" size="sm">Download Resume</Button>
          </a>
          <Link href="/about">
            <Button variant="ghost" size="sm">About Me</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
