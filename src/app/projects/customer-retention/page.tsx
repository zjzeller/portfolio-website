import { pageMetadata } from '@/lib/metadata'
import { Github } from 'lucide-react'
import PageViewTracker from '@/components/analytics/PageViewTracker'
import {
  RetentionCurveChart,
  ChannelRepeatChart,
  Month1ByYearChart,
  DataTable,
} from '@/components/charts/RetentionCharts'
import { requireProject } from '@/data/projects'
import data from '@/data/customer-retention.json'

export const metadata = pageMetadata(
  'Customer Retention in dbt',
  'A tested dbt pipeline on BigQuery that measures cohort retention and asks whether acquisition channel predicts repeat buyers. Only 6% reorder within 90 days.',
  '/projects/customer-retention/opengraph-image.png'
)


const project = requireProject('/projects/customer-retention')
const m = data.metadata

// Model layers shown in the lineage diagram, left to right
const LAYERS = [
  { label: 'Sources', note: 'BigQuery public data', models: ['orders', 'order_items', 'products', 'users'] },
  { label: 'Staging', note: 'views', models: ['stg_orders', 'stg_order_items', 'stg_products', 'stg_users'] },
  { label: 'Intermediate', note: 'view', models: ['int_orders_with_revenue'] },
  { label: 'Marts', note: 'tables', models: ['dim_customers', 'fct_cohort_retention', 'fct_repeat_rate_by_segment'] },
]

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 mb-10">
      <span className="section-label">{label}</span>
      <div className="flex-1 h-px bg-[var(--border-subtle)]" />
    </div>
  )
}

function Metric({ children }: { children: React.ReactNode }) {
  return <span className="metric text-[var(--accent)]">{children}</span>
}

export default function CustomerRetentionPage() {
  const firstYear = data.month1ByYear[0]
  const lastFullYear = data.month1ByYear[data.month1ByYear.length - 2]
  const partialYear = data.month1ByYear[data.month1ByYear.length - 1]
  const month1 = data.retentionCurve[0]
  const month24 = data.retentionCurve[data.retentionCurve.length - 1]

  return (
    <div className="container mx-auto px-6 md:px-8 py-16 md:py-24 max-w-4xl">
      <PageViewTracker pagePath="/projects/customer-retention" pageTitle={project.title} />

      {/* HERO */}
      <section className="mb-20 animate-reveal">
        <span className="section-label">Analytics Engineering</span>
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl mt-4 tracking-tight">
          Who Comes Back?<br />
          <span className="text-[var(--accent)]">Customer Retention in dbt</span>
        </h1>
        <div className="editorial-rule w-16 mt-6" />
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed mt-8 max-w-2xl">
          An online clothing store wants more repeat buyers, and the obvious first question is
          which customers are worth chasing. I built a tested dbt pipeline on BigQuery to answer
          it: how many customers return after their first order, and whether where they came
          from or what they bought first predicts it.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 border-t border-[var(--border-subtle)] pt-8">
          {[
            { label: 'Customers modeled', value: m.customers.toLocaleString() },
            { label: 'Reorder within 90 days', value: `${m.repeat90d}%` },
            { label: 'First-year revenue from the first order', value: `${Math.round(m.firstOrderShareOf12MoRevenue)}%` },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="font-[family-name:var(--font-dm-mono)] text-2xl text-[var(--accent)]">{value}</p>
              <p className="text-xs tracking-wider uppercase text-[var(--text-muted)] mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* THE MODEL */}
      <section className="mb-20 animate-reveal">
        <SectionHeader label="The Model" />
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-6 tracking-tight">
          From raw orders to a customer table
        </h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-8 max-w-2xl">
          The data is Google&apos;s public <Metric>thelook</Metric> e-commerce dataset: synthetic
          but realistic orders from <Metric>{m.firstCohort}</Metric> to <Metric>{m.lastCohort}</Metric>.
          Raw tables flow through staging, a shared intermediate model, and three marts. Every
          layer is tested, and the full build passes <Metric>32 of 32</Metric> models and tests.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {LAYERS.map((layer) => (
            <div key={layer.label} className="border border-[var(--border)] bg-[var(--bg-surface)] p-4">
              <p className="text-xs tracking-wider uppercase text-[var(--accent)]">{layer.label}</p>
              <p className="text-xs text-[var(--text-muted)] mb-3">{layer.note}</p>
              <ul className="space-y-1">
                {layer.models.map((model) => (
                  <li key={model} className="font-[family-name:var(--font-dm-mono)] text-xs text-[var(--text-secondary)] break-all">
                    {model}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <ul className="space-y-3 mt-8 text-[var(--text-secondary)] leading-relaxed max-w-2xl list-disc pl-5">
          <li>
            <strong className="text-[var(--text-primary)] font-medium">A fair repeat metric.</strong>{' '}
            A customer who first bought last month hasn&apos;t had time to come back. Counting them
            as &quot;didn&apos;t repeat&quot; would make newer segments look worse, so the 90-day repeat
            flag is left empty until a customer has a full 90 days.
          </li>
          <li>
            <strong className="text-[var(--text-primary)] font-medium">Shared logic in one place.</strong>{' '}
            Order revenue and each customer&apos;s 1st, 2nd, 3rd order sequence live in one
            intermediate model that both marts reuse.
          </li>
          <li>
            <strong className="text-[var(--text-primary)] font-medium">Clean definitions.</strong>{' '}
            Cancelled and returned orders are excluded, the current partial month is dropped, and
            names and emails never leave staging.
          </li>
          <li>
            <strong className="text-[var(--text-primary)] font-medium">Tests beyond the basics.</strong>{' '}
            Custom SQL tests check that each cohort has one row per month and that retention always
            falls between 0% and 100%, with the first month exactly 100%.
          </li>
        </ul>
      </section>

      {/* FINDING 1 */}
      <section className="mb-20 animate-reveal">
        <SectionHeader label="Finding 1" />
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-6 tracking-tight">
          Most customers buy once
        </h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-8 max-w-2xl">
          Only <Metric>{m.repeat90d}%</Metric> of customers place a second order within 90 days.
          In any given month after the first purchase, just <Metric>{month1.retention}%</Metric> of
          a cohort orders again, sliding to <Metric>{month24.retention}%</Metric> by month 24. As a
          result, the first order makes up about <Metric>{Math.round(m.firstOrderShareOf12MoRevenue)}%</Metric> of
          what a customer spends in their first year.
        </p>
        <h3 className="text-sm text-[var(--text-primary)] mb-2">Share of customers ordering in each month after their first order</h3>
        <RetentionCurveChart data={data.retentionCurve} />
        <DataTable
          columns={['Month', 'Ordered', 'Customers observed']}
          rows={data.retentionCurve.map((d) => [d.month, `${d.retention}%`, d.customers.toLocaleString()])}
        />
      </section>

      {/* FINDING 2 */}
      <section className="mb-20 animate-reveal">
        <SectionHeader label="Finding 2" />
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-6 tracking-tight">
          Where customers come from doesn&apos;t predict who returns
        </h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-8 max-w-2xl">
          Every acquisition channel lands between <Metric>5.6%</Metric> and <Metric>6.1%</Metric>, and
          their confidence intervals overlap. A chi-square test finds no real difference
          (<Metric>&chi;&sup2; = {m.chiSquareChannel}</Metric> on {m.chiSquareChannelDf} degrees of
          freedom). First-purchase category looks more interesting at first, ranging
          from <Metric>{m.categoryRange[0]}%</Metric> to <Metric>{m.categoryRange[1]}%</Metric>, but
          with 26 categories a few will look extreme by chance, and the spread is what random noise
          would produce (<Metric>&chi;&sup2; = {m.chiSquareCategory}</Metric> on {m.chiSquareCategoryDf} degrees
          of freedom).
        </p>
        <h3 className="text-sm text-[var(--text-primary)] mb-2">
          90-day repeat rate by acquisition channel (dashed line: all customers, {m.repeat90d}%)
        </h3>
        <ChannelRepeatChart data={data.channels} overall={m.repeat90d} />
        <DataTable
          columns={['Channel', 'Repeat rate', '95% CI', 'Customers']}
          rows={data.channels.map((d) => [d.channel, `${d.rate}%`, `${d.low}% to ${d.high}%`, d.customers.toLocaleString()])}
        />
      </section>

      {/* FINDING 3 */}
      <section className="mb-20 animate-reveal">
        <SectionHeader label="Finding 3" />
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-6 tracking-tight">
          Newer customers come back faster
        </h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-8 max-w-2xl">
          The one thing that is moving: the share of customers who order again the month after
          their first purchase rose from <Metric>{firstYear.retention}%</Metric> for {firstYear.year} customers
          to <Metric>{lastFullYear.retention}%</Metric> for {lastFullYear.year} customers, and{' '}
          <Metric>{partialYear.retention}%</Metric> so far in 2026. Something changed recently,
          and it isn&apos;t the channel mix.
        </p>
        <h3 className="text-sm text-[var(--text-primary)] mb-2">Ordered again the month after their first order, by year of first order</h3>
        <Month1ByYearChart data={data.month1ByYear} />
        <p className="text-xs text-[var(--text-muted)] mt-2">* 2026 includes customers who first ordered January through July.</p>
        <DataTable
          columns={['First order year', 'Ordered next month', 'Customers']}
          rows={data.month1ByYear.map((d) => [d.year, `${d.retention}%`, d.customers.toLocaleString()])}
        />
      </section>

      {/* RECOMMENDATION */}
      <section className="mb-20 animate-reveal">
        <SectionHeader label="Recommendation" />
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mb-6 tracking-tight">
          What I&apos;d tell the business
        </h2>
        <ol className="space-y-4 text-[var(--text-secondary)] leading-relaxed max-w-2xl list-decimal pl-5">
          <li>
            <strong className="text-[var(--text-primary)] font-medium">Don&apos;t move marketing budget based on retention.</strong>{' '}
            Channels bring in customers who behave the same after the first order, so judge
            channels on acquisition cost and first-order value instead.
          </li>
          <li>
            <strong className="text-[var(--text-primary)] font-medium">Build a second-purchase program for every new customer.</strong>{' '}
            With roughly 94% not returning within 90 days, the opportunity is universal, not tied
            to one segment. Launch it as a test with a holdout group so the lift can be measured
            instead of assumed.
          </li>
          <li>
            <strong className="text-[var(--text-primary)] font-medium">Find out what improved in 2024 to 2026.</strong>{' '}
            Early retention has more than doubled since 2023. Before investing in anything new, identify what
            drove it (product mix, promotions, email, site changes) and do more of it.
          </li>
        </ol>
      </section>

      {/* CAVEATS + TOOLS */}
      <section className="mb-10 animate-reveal">
        <SectionHeader label="Caveats" />
        <ul className="space-y-3 text-sm text-[var(--text-secondary)] leading-relaxed max-w-2xl list-disc pl-5">
          <li>
            thelook is synthetic data generated by Google for demos, so the patterns show the
            method rather than a real retailer&apos;s behavior.
          </li>
          <li>
            A customer counts as retained in a month if they place at least one completed order
            that month. Cancelled and returned orders don&apos;t count.
          </li>
          <li>
            Confidence intervals use a normal approximation, which is reasonable at these sample
            sizes.
          </li>
        </ul>

        <div className="border-t border-[var(--border-subtle)] mt-10 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="section-label">Tools Used</span>
            {project.tools.map((tool) => (
              <span
                key={tool}
                className="font-[family-name:var(--font-dm-mono)] text-xs px-3 py-1 rounded border border-[var(--accent)]/20 bg-[var(--accent)]/10 text-[var(--accent)]"
              >
                {tool}
              </span>
            ))}
          </div>
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs tracking-wider uppercase text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-300"
          >
            <Github size={14} aria-hidden="true" />
            View on GitHub
          </a>
        </div>
      </section>
    </div>
  )
}
