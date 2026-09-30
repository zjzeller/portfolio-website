import { pageMetadata } from '@/lib/metadata'

// The page itself is a client component (it uses state), and client components
// can't export metadata, so the title and description live in this layout.
export const metadata = pageMetadata(
  'The Case for Jaylen Brown',
  'A statistical comparison of Jaylen Brown and Jayson Tatum across scoring, clutch performance and advanced metrics.',
)

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
