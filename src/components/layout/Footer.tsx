import { SITE_CONFIG } from '@/lib/constants'
import { Github, Linkedin, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-[#A8DADC] mt-auto bg-[#F1FAEE]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#457B9D]">
            © {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
          </p>

          <div className="flex gap-4">
            <a
              href={SITE_CONFIG.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#457B9D] hover:text-[#E63946] transition-colors"
              aria-label="GitHub"
            >
              <Github size={20} />
            </a>
            <a
              href={SITE_CONFIG.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#457B9D] hover:text-[#E63946] transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={20} />
            </a>
            <a
              href={`mailto:${SITE_CONFIG.links.email}`}
              className="text-[#457B9D] hover:text-[#E63946] transition-colors"
              aria-label="Email"
            >
              <Mail size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
