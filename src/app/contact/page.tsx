'use client'

import { usePageView } from '@/hooks/useAnalytics'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { SITE_CONFIG } from '@/lib/constants'
import { Github, Linkedin, Mail } from 'lucide-react'

export default function ContactPage() {
  usePageView('/contact', 'Contact')

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 animate-fade-in">Get in Touch</h1>

      <Card className="mb-8 animate-fade-in">
        <h2 className="text-2xl font-semibold mb-4 text-[#1D3557]">Let's Connect</h2>
        <p className="text-[#1D3557] mb-6">
          I'm always open to discussing new opportunities, collaborations, or just chatting
          about technology. Feel free to reach out through any of the following channels:
        </p>

        <div className="space-y-4">
          <a
            href={`mailto:${SITE_CONFIG.links.email}`}
            className="flex items-center gap-4 p-4 rounded-lg border border-[#A8DADC] hover:border-[#E63946] hover:bg-[#A8DADC]/10 transition-all group"
          >
            <div className="p-3 bg-[#A8DADC]/30 rounded-lg group-hover:bg-[#E63946] transition-colors">
              <Mail className="text-[#457B9D] group-hover:text-white transition-colors" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-[#1D3557]">Email</h3>
              <p className="text-[#457B9D]">{SITE_CONFIG.links.email}</p>
            </div>
          </a>

          <a
            href={SITE_CONFIG.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-lg border border-[#A8DADC] hover:border-[#E63946] hover:bg-[#A8DADC]/10 transition-all group"
          >
            <div className="p-3 bg-[#A8DADC]/30 rounded-lg group-hover:bg-[#E63946] transition-colors">
              <Linkedin className="text-[#457B9D] group-hover:text-white transition-colors" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-[#1D3557]">LinkedIn</h3>
              <p className="text-[#457B9D]">Connect with me professionally</p>
            </div>
          </a>

          <a
            href={SITE_CONFIG.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-lg border border-[#A8DADC] hover:border-[#E63946] hover:bg-[#A8DADC]/10 transition-all group"
          >
            <div className="p-3 bg-[#A8DADC]/30 rounded-lg group-hover:bg-[#E63946] transition-colors">
              <Github className="text-[#457B9D] group-hover:text-white transition-colors" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-[#1D3557]">GitHub</h3>
              <p className="text-[#457B9D]">Check out my projects and code</p>
            </div>
          </a>
        </div>
      </Card>

      <Card className="animate-fade-in">
        <h2 className="text-2xl font-semibold mb-4 text-[#1D3557]">Quick Links</h2>
        <p className="text-[#1D3557] mb-4">
          Want to learn more about my work or download my resume?
        </p>
        <div className="flex gap-4 flex-wrap">
          <a href="/assets/resume/zachary-zeller-resume.pdf" download>
            <Button variant="outline">Download Resume</Button>
          </a>
          <a href="/about">
            <Button variant="ghost">Learn More About Me</Button>
          </a>
        </div>
      </Card>
    </div>
  )
}
