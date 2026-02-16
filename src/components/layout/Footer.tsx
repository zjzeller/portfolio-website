import { SITE_CONFIG } from '@/lib/constants'
import { Github, Linkedin, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)] mt-auto">
      <div className="container mx-auto px-6 md:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="font-[family-name:var(--font-playfair)] text-sm text-[var(--text-muted)]">
              {SITE_CONFIG.name}
            </span>
            <span className="h-3 w-px bg-[var(--border)]" />
            <span className="text-xs tracking-wider text-[var(--text-muted)]">
              &copy; {new Date().getFullYear()}
            </span>
          </div>

          <div className="flex gap-5">
            <a
              href={SITE_CONFIG.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-300"
              aria-label="GitHub"
            >
              <Github size={16} />
            </a>
            <a
              href={SITE_CONFIG.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-300"
              aria-label="LinkedIn"
            >
              <Linkedin size={16} />
            </a>
            <a
              href={`mailto:${SITE_CONFIG.links.email}`}
              className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-300"
              aria-label="Email"
            >
              <Mail size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
