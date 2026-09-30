import type { Metadata } from 'next'
import { SITE_CONFIG } from '@/lib/constants'

// Builds a page's title, description and link-preview tags in one place.
// Why a helper: when a page sets `openGraph`, Next.js REPLACES the site-wide
// openGraph settings instead of merging them, so the preview image and site
// name would disappear. This re-adds them every time.
// `image` lets a page use its own preview card (the retention case study does).
export function pageMetadata(
  title: string,
  description: string,
  image = '/opengraph-image.png'
): Metadata {
  return {
    title,
    description,
    openGraph: {
      type: 'website',
      siteName: SITE_CONFIG.name,
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      images: [image],
    },
  }
}
