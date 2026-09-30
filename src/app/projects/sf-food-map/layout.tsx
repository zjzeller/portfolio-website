import { pageMetadata } from '@/lib/metadata'

// The page itself is a client component (it uses state), and client components
// can't export metadata, so the title and description live in this layout.
export const metadata = pageMetadata(
  'Top 5 Date Night Dinner Spots',
  'Five Bay Area restaurants worth the reservation, on an interactive map.',
)

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
