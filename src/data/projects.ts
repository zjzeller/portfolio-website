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
    href: '/projects/cal-pro-pipeline',
    title: "Cal's Pro Pipeline: Beating the Draft Board",
    description:
      "Which colleges' players beat their draft slot? A model of every NFL and NBA pick since 1980 finds Cal's 2003 to 2013 classes ranked 1st of 41 schools, then stress-tests the result.",
    tags: ['Python', 'scikit-learn', 'Sports Analytics'],
    tools: ['Python', 'Pandas', 'scikit-learn', 'Recharts', 'Next.js'],
    githubUrl: 'https://github.com/zjzeller/portfolio-website/blob/main/scripts/cal-pipeline.py',
  },
  {
    href: '/projects/baby-names',
    title: 'What Your Name Says About When You Were Born',
    description:
      'Predicting birth year from first name with 100+ years of US Social Security data, plus a guess-the-decade game and an animated name time machine.',
    tags: ['Python', 'Data Analysis', 'Interactive'],
    tools: ['Python', 'Pandas', 'Recharts', 'Next.js'],
    githubUrl: 'https://github.com/zjzeller/portfolio-website',
  },
]

export function requireProject(href: string): Project {
  const project = PROJECTS.find((p) => p.href === href)
  if (!project) throw new Error(`${href} project entry missing from PROJECTS`)
  return project
}
