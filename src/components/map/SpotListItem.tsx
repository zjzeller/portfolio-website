import type { FoodSpot } from '@/types/food-spots'

interface SpotListItemProps {
  spot: FoodSpot
  active: boolean
  onClick: () => void
}

export default function SpotListItem({ spot, active, onClick }: SpotListItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left flex items-center gap-4 px-4 py-3 border-l-2 transition-all duration-300
        ${active
          ? 'bg-[var(--bg-elevated)] border-l-[var(--accent)]'
          : 'bg-transparent border-l-transparent hover:bg-[var(--bg-elevated)] hover:border-l-[var(--border)]'
        }
      `}
    >
      {/* Number */}
      <span
        className={`
          font-[family-name:var(--font-dm-mono)] text-sm flex-shrink-0 w-5 text-right transition-colors duration-300
          ${active ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}
        `}
      >
        {spot.id}
      </span>

      {/* Name + cuisine */}
      <div className="flex-1 min-w-0">
        <p
          className={`
            font-[family-name:var(--font-playfair)] text-base leading-tight truncate transition-colors duration-300
            ${active ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}
          `}
        >
          {spot.name}
        </p>
        <p className="text-xs tracking-[0.12em] uppercase text-[var(--text-muted)] mt-0.5">
          {spot.neighborhood} · {spot.cuisine}
        </p>
      </div>
    </button>
  )
}
