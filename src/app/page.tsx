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
          Hi, I'm <span className="text-blue-600">Zachary Zeller</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-4 max-w-2xl mx-auto">
          Senior Data Analyst
        </p>
        <p className="text-lg text-gray-600 mb-12 max-w-xl mx-auto">
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
        <Link href="/about" className="group">
          <div className="p-6 rounded-lg border border-gray-200 hover:border-blue-600 transition-all hover:shadow-lg bg-white">
            <Code className="mb-4 text-blue-600" size={32} />
            <h3 className="text-xl font-semibold mb-2">About Me</h3>
            <p className="text-gray-600 mb-4">
              Learn more about my background and skills
            </p>
            <span className="text-blue-600 flex items-center gap-2 group-hover:gap-3 transition-all">
              Read more <ArrowRight size={16} />
            </span>
          </div>
        </Link>

        <Link href="/resume" className="group">
          <div className="p-6 rounded-lg border border-gray-200 hover:border-blue-600 transition-all hover:shadow-lg bg-white">
            <FileText className="mb-4 text-blue-600" size={32} />
            <h3 className="text-xl font-semibold mb-2">Resume</h3>
            <p className="text-gray-600 mb-4">
              View my experience and qualifications
            </p>
            <span className="text-blue-600 flex items-center gap-2 group-hover:gap-3 transition-all">
              View resume <ArrowRight size={16} />
            </span>
          </div>
        </Link>

        <Link href="/contact" className="group">
          <div className="p-6 rounded-lg border border-gray-200 hover:border-blue-600 transition-all hover:shadow-lg bg-white">
            <Mail className="mb-4 text-blue-600" size={32} />
            <h3 className="text-xl font-semibold mb-2">Contact</h3>
            <p className="text-gray-600 mb-4">
              Let's connect and work together
            </p>
            <span className="text-blue-600 flex items-center gap-2 group-hover:gap-3 transition-all">
              Get in touch <ArrowRight size={16} />
            </span>
          </div>
        </Link>
      </section>
    </div>
  )
}
