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
          I'm a results-driven Senior Data Analyst with 4+ years of experience building GTM reporting
          infrastructure, investigating data quality issues, and delivering actionable insights to
          executive leadership at AAA - Mountain West Group.
        </p>
        <p className="text-gray-700 mb-4">
          My expertise includes automating ETL processes, maintaining cross-system data integrity,
          and leveraging AI tools like Claude to accelerate analytical workflows. I've delivered
          significant business impact, including $120K in annual cost savings through automation and
          identifying revenue-generating opportunities worth thousands in monthly revenue.
        </p>
        <p className="text-gray-700">
          With a Master's degree in Applied Economics from the University of San Francisco and a
          Bachelor's in Economics from Santa Clara University, I bring both technical skills and
          business acumen to translate complex data into clear, strategic recommendations.
        </p>
      </Card>

      <Card className="mb-8 animate-fade-in">
        <h2 className="text-2xl font-semibold mb-4">Skills</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-3 text-blue-600">Data & Analytics</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                SQL (CTEs, Window Functions, 10M+ Rows)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Python (Automation, ETL, scikit-learn)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Tableau (Dashboard Development)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                BigQuery & Data Warehousing
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Claude AI & Workflow Optimization
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3 text-blue-600">Business Tools & Systems</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Salesforce & ConnectSuite CRM
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Data Visualization & Storytelling
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Revenue Analytics & GTM Metrics
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Cross-Functional Collaboration
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Process Automation & Optimization
              </li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="animate-fade-in">
        <h2 className="text-2xl font-semibold mb-4">Interests & Approach</h2>
        <p className="text-gray-700 mb-4">
          I'm passionate about continuous learning and exploring new data tools that can improve
          efficiency and deliver better insights. I particularly enjoy:
        </p>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            Leveraging AI tools like Claude to accelerate workflows and improve code quality
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            Automating repetitive processes to free up time for strategic analysis
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            Data visualization and storytelling to make insights accessible to all stakeholders
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            Mentoring junior analysts and fostering team growth through knowledge sharing
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            Solving complex business problems with data-driven recommendations
          </li>
        </ul>
      </Card>
    </div>
  )
}
