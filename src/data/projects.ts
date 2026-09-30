import type { Project } from '@/types/projects'

export const PROJECTS: Project[] = [
  // Display order used on the homepage and /projects: strongest work first
  {
    href: '/projects/customer-retention',
    title: 'Who Comes Back? Customer Retention in dbt',
    description:
      'A tested dbt pipeline on BigQuery that measures cohort retention for an e-commerce store and asks whether acquisition channel or first purchase predicts repeat buyers.',
    tags: ['dbt', 'BigQuery', 'Analytics Engineering'],
    tools: ['dbt', 'BigQuery', 'SQL', 'Python', 'Recharts', 'Next.js'],
    githubUrl: 'https://github.com/zjzeller/thelook-analytics-dbt',
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
  {
    href: '/projects/baby-names',
    title: 'What Your Name Says About When You Were Born',
    description:
      'Predicting birth year from first name using 100+ years of US Social Security Administration data, with an interactive name explorer.',
    tags: ['Python', 'Data Analysis', 'Interactive'],
    tools: ['Python', 'Pandas', 'Recharts', 'Next.js'],
    githubUrl: 'https://github.com/zjzeller/portfolio-website',
  },
  {
    href: '/projects/sf-food-map',
    title: 'Top 5 Date Night Dinner Spots',
    description:
      'Five Bay Area restaurants worth the reservation, mapped across Oakland, San Francisco, and Berkeley.',
    tags: ['Personal', 'Maps', 'React Leaflet'],
    tools: ['React Leaflet', 'Next.js', 'TypeScript'],
    githubUrl: 'https://github.com/zjzeller/portfolio-website',
  },
]

export function requireProject(href: string): Project {
  const project = PROJECTS.find((p) => p.href === href)
  if (!project) throw new Error(`${href} project entry missing from PROJECTS`)
  return project
}
