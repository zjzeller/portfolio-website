import { pageMetadata } from '@/lib/metadata'

// The page itself is a client component (it uses state), and client components
// can't export metadata, so the title and description live in this layout.
export const metadata = pageMetadata(
  'What Your Name Says About When You Were Born',
  'Predicting birth year from first name with 100+ years of Social Security data, plus an interactive name explorer.',
)

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
