'use client'

import { usePageView } from '@/hooks/useAnalytics'
import Card from '@/components/ui/Card'

export default function AboutPage() {
  usePageView('/about', 'About')

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 animate-fade-in">About Me</h1>

      <Card className="mb-8 animate-fade-in">
        <h2 className="text-2xl font-semibold mb-4">Background</h2>
        <p className="text-gray-700 mb-4">
          I'm a software developer passionate about creating elegant solutions to complex problems.
          With a background in data science and economics, I bring a unique analytical perspective
          to software development.
        </p>
        <p className="text-gray-700">
          I specialize in building modern web applications using React, Next.js, and TypeScript,
          with a focus on clean code, performance, and user experience.
        </p>
      </Card>

      <Card className="mb-8 animate-fade-in">
        <h2 className="text-2xl font-semibold mb-4">Skills</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-3 text-blue-600">Frontend Development</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                React & Next.js
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                TypeScript & JavaScript
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Tailwind CSS
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Responsive Design
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3 text-blue-600">Backend & Tools</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Node.js & APIs
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Supabase & Databases
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Git & GitHub
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Vercel & Deployment
              </li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="animate-fade-in">
        <h2 className="text-2xl font-semibold mb-4">Interests</h2>
        <p className="text-gray-700 mb-4">
          When I'm not coding, I enjoy exploring new technologies and staying up to date with the
          latest developments in web development and AI. I'm particularly interested in:
        </p>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            Modern web frameworks and tooling
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            Data visualization and analytics
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            AI-assisted development tools
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            Open source contributions
          </li>
        </ul>
      </Card>
    </div>
  )
}
