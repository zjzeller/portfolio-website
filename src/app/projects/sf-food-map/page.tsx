'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import PageViewTracker from '@/components/analytics/PageViewTracker'
import SpotDetailPanel from '@/components/map/SpotDetailPanel'
import SpotListItem from '@/components/map/SpotListItem'
import { SF_FOOD_SPOTS } from '@/data/sf-food-spots'

const SFMapClient = dynamic(() => import('@/components/map/SFMapClient'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[var(--bg-elevated)] animate-pulse flex items-center justify-center">
      <span className="text-xs tracking-[0.2em] uppercase text-[var(--text-muted)]">Loading map…</span>
    </div>
  ),
})

export default function SFFoodMapPage() {
  const [activeSpotId, setActiveSpotId] = useState<number | null>(null)

  const activeSpot = SF_FOOD_SPOTS.find((s) => s.id === activeSpotId) ?? null

  function handleSpotClick(id: number) {
    setActiveSpotId((prev) => (prev === id ? null : id))
  }

  function handleClose() {
    setActiveSpotId(null)
  }

  return (
    <div className="container mx-auto px-6 md:px-8 py-16 md:py-24 max-w-6xl">
      <PageViewTracker pagePath="/projects/sf-food-map" pageTitle="Date Night Map" />

      {/* Header */}
      <div className="mb-10 animate-reveal">
        <span className="section-label">Personal</span>
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl mt-4 tracking-tight">
          Date Night<br />
          <span className="text-[var(--accent)]">Map</span>
        </h1>
        <div className="editorial-rule w-16 mt-6" />
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed mt-8 max-w-2xl">
          Five Bay Area restaurants worth the reservation. Click a pin or a row to explore.
        </p>
      </div>

      {/* Map + detail panel */}
      <div className="animate-reveal-delay-1 mb-2">
        <div className="grid lg:grid-cols-[1fr_360px] gap-px bg-[var(--border)] border border-[var(--border)]">
          {/* Map */}
          <div style={{ height: '520px' }} className="relative bg-[var(--bg-surface)]">
            <SFMapClient
              spots={SF_FOOD_SPOTS}
              activeSpotId={activeSpotId}
              onSpotClick={handleSpotClick}
            />
          </div>

          {/* Detail panel */}
          <div className="bg-[var(--bg-surface)] border-t lg:border-t-0 border-[var(--border)]" style={{ height: '520px', overflowY: 'auto' }}>
            <SpotDetailPanel spot={activeSpot} onClose={handleClose} />
          </div>
        </div>
      </div>

      {/* Spot list */}
      <div className="animate-reveal-delay-2 border border-[var(--border)] border-t-0">
        <div className="divide-y divide-[var(--border-subtle)]">
          {SF_FOOD_SPOTS.map((spot) => (
            <SpotListItem
              key={spot.id}
              spot={spot}
              active={spot.id === activeSpotId}
              onClick={() => handleSpotClick(spot.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
