import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import PageViewTracker from '@/components/analytics/PageViewTracker'
import Button from '@/components/ui/Button'

// Shown for any URL that doesn't match a page. Replaces Next's default
// white 404 so a broken link still looks like the rest of the site.
export default function NotFound() {
  return (
    <div className="container mx-auto px-6 md:px-8 py-24 md:py-32 max-w-4xl">
      <PageViewTracker pagePath="/404" pageTitle="Not Found" />

      <span className="section-label">Error 404</span>
      <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl mt-4 tracking-tight">
        This page <span className="text-[var(--accent)]">doesn&apos;t exist</span>
      </h1>
      <div className="editorial-rule w-16 mt-6" />

      <p className="text-[var(--text-secondary)] text-lg leading-relaxed max-w-lg mt-8">
        The link may be old or mistyped. Everything on the site is reachable from the pages below.
      </p>

      <div className="flex flex-wrap gap-4 mt-10">
        <Link href="/">
          <Button size="lg" className="gap-2">
            Back home <ArrowRight size={16} />
          </Button>
        </Link>
        <Link href="/projects">
          <Button variant="outline" size="lg">
            Projects
          </Button>
        </Link>
      </div>
    </div>
  )
}
