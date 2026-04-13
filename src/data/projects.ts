export type Project = {
  href: string
  title: string
  description: string
  tags: string[]
  tools: string[]
  githubUrl: string
}

export const PROJECTS: Project[] = [
  {
    href: '/projects/sf-food-map',
    title: 'Top 5 Date Night Dinner Spots',
    description:
      'Five Bay Area restaurants worth the reservation — mapped across Oakland, San Francisco, and Berkeley.',
    tags: ['Personal', 'Maps', 'React Leaflet'],
    tools: ['React Leaflet', 'Next.js', 'TypeScript'],
    githubUrl: 'https://github.com/zjzeller/portfolio-website',
  },
  {
    href: '/projects/brown-vs-tatum',
    title: 'The Case for Jaylen Brown',
    description:
      'A statistical deep-dive comparing Jaylen Brown and Jayson Tatum across scoring, clutch performance, and advanced metrics.',
    tags: ['NBA', 'Python', 'Data Visualization'],
    tools: ['Python', 'Pandas', 'Recharts', 'Next.js'],
    githubUrl: 'https://github.com/zjzeller/portfolio-website',
  },
]
