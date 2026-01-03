'use client'

import Link from 'next/link'
import Button from '@/components/ui/Button'
import { ArrowRight, Code, FileText, Mail } from 'lucide-react'
import { usePageView } from '@/hooks/useAnalytics'

export default function HomePage() {
  usePageView('/', 'Home')

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <section className="text-center py-20 animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          Hi, I'm <span className="text-[#E63946]">Zachary Zeller</span>
        </h1>
        <p className="text-xl md:text-2xl text-[#1D3557] mb-4 max-w-2xl mx-auto">
          Senior Data Analyst
        </p>
        <p className="text-lg text-[#457B9D] mb-12 max-w-xl mx-auto">
          Passionate about learning new data tools, automation, and optimization to deliver actionable insights.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/resume">
            <Button size="lg" className="gap-2">
              View Resume <FileText size={20} />
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="lg" className="gap-2">
              Get in Touch <Mail size={20} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <Link href="/about" className="group h-full">
          <div className="h-full p-6 rounded-lg border border-[#A8DADC] hover:border-[#E63946] transition-all hover:shadow-lg bg-white flex flex-col">
            <Code className="mb-4 text-[#457B9D]" size={32} />
            <h3 className="text-xl font-semibold mb-2 text-[#1D3557]">About Me</h3>
            <p className="text-[#457B9D] mb-4 flex-grow">
              Learn more about my background and skills
            </p>
            <span className="text-[#E63946] flex items-center gap-2 group-hover:gap-3 transition-all">
              Read more <ArrowRight size={16} />
            </span>
          </div>
        </Link>

        <Link href="/resume" className="group h-full">
          <div className="h-full p-6 rounded-lg border border-[#A8DADC] hover:border-[#E63946] transition-all hover:shadow-lg bg-white flex flex-col">
            <FileText className="mb-4 text-[#457B9D]" size={32} />
            <h3 className="text-xl font-semibold mb-2 text-[#1D3557]">Resume</h3>
            <p className="text-[#457B9D] mb-4 flex-grow">
              View my experience and qualifications
            </p>
            <span className="text-[#E63946] flex items-center gap-2 group-hover:gap-3 transition-all">
              View resume <ArrowRight size={16} />
            </span>
          </div>
        </Link>

        <Link href="/contact" className="group h-full">
          <div className="h-full p-6 rounded-lg border border-[#A8DADC] hover:border-[#E63946] transition-all hover:shadow-lg bg-white flex flex-col">
            <Mail className="mb-4 text-[#457B9D]" size={32} />
            <h3 className="text-xl font-semibold mb-2 text-[#1D3557]">Contact</h3>
            <p className="text-[#457B9D] mb-4 flex-grow">
              Let's connect and work together
            </p>
            <span className="text-[#E63946] flex items-center gap-2 group-hover:gap-3 transition-all">
              Get in touch <ArrowRight size={16} />
            </span>
          </div>
        </Link>
      </section>
    </div>
  )
}
