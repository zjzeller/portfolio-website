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
    thumbnail: '/assets/projects/customer-retention.webp',
    thumbnailAlt: 'Cohort retention heatmap: each row is a quarterly cohort, brighter cells mean more customers came back',
  },
  {
    href: '/projects/cal-football',
    title: 'Cal Football, 2000 to Now: Rise, Peak and Drift',
    description:
      'A six-chapter data story on how Cal football rose, peaked and drifted: talent vs. results, NFL draft outcomes, attendance, the transfer portal and where Cal stands in the ACC.',
    tags: ['Data Storytelling', 'Python', 'Sports Analytics'],
    tools: ['Python', 'Pandas', 'scikit-learn', 'Recharts', 'Next.js'],
    githubUrl: 'https://github.com/zjzeller/portfolio-website/blob/main/scripts/cal-decade.py',
    thumbnail: '/assets/projects/cal-football.webp',
    thumbnailAlt: 'Cal football team strength by season since 2000, with gold dots for AP-ranked finishes',
  },
  {
    href: '/projects/baby-names',
    title: 'What Your Name Says About When You Were Born',
    description:
      'Predicting birth year from first name with 100+ years of US Social Security data, plus a guess-the-decade game and an animated name time machine.',
    tags: ['Python', 'Data Analysis', 'Interactive'],
    tools: ['Python', 'Pandas', 'Recharts', 'Next.js'],
    githubUrl: 'https://github.com/zjzeller/portfolio-website',
    thumbnail: '/assets/projects/baby-names.webp',
    thumbnailAlt: 'Popularity curves for baby names that faded and came back, with Grace highlighted',
  },
]

export function requireProject(href: string): Project {
  const project = PROJECTS.find((p) => p.href === href)
  if (!project) throw new Error(`${href} project entry missing from PROJECTS`)
  return project
}
