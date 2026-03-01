import type { FoodSpot } from '@/types/food-spots'
import { ExternalLink, X } from 'lucide-react'

interface SpotDetailPanelProps {
  spot: FoodSpot | null
  onClose: () => void
}

export default function SpotDetailPanel({ spot, onClose }: SpotDetailPanelProps) {
  if (!spot) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--border)] mb-4 flex items-center justify-center">
          <span className="font-[family-name:var(--font-dm-mono)] text-xs text-[var(--text-muted)]">?</span>
        </div>
        <p className="text-[var(--text-muted)] text-sm">Select a pin to explore</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <span className="section-label">{spot.neighborhood}</span>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl mt-2 tracking-tight leading-tight">
            {spot.name}
          </h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Close detail panel"
          className="ml-3 mt-1 flex-shrink-0 w-7 h-7 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors duration-200"
        >
          <X size={14} />
        </button>
      </div>

      <div className="editorial-rule w-12 mb-5" />

      {/* Cuisine */}
      <p className="text-xs tracking-[0.18em] uppercase text-[var(--text-secondary)] mb-4">
        {spot.cuisine}
      </p>

      {/* Blurb */}
      <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
        {spot.blurb}
      </p>

      {/* Favorite dish */}
      <div className="border-t border-[var(--border-subtle)] pt-4 mb-6">
        <p className="text-xs tracking-[0.18em] uppercase text-[var(--text-muted)] mb-2">
          Favorite dish
        </p>
        <p className="font-[family-name:var(--font-dm-mono)] text-sm text-[var(--accent)]">
          {spot.favoriteDish}
        </p>
      </div>

      {/* Address */}
      <div className="mb-6">
        <p className="text-xs tracking-[0.18em] uppercase text-[var(--text-muted)] mb-1">
          Address
        </p>
        <p className="text-[var(--text-secondary)] text-sm">{spot.address}</p>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* External link */}
      <a
        href={spot.website}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] hover:text-[var(--highlight)] transition-colors duration-200 border border-[var(--accent)] hover:border-[var(--highlight)] px-4 py-2.5 rounded-sm"
      >
        Visit website
        <ExternalLink size={13} />
      </a>
    </div>
  )
}
