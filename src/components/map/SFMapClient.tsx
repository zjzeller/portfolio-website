'use client'

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import type { FoodSpot } from '@/types/food-spots'
import { MAP_CENTER, MAP_ZOOM } from '@/data/sf-food-spots'

// ---------------------------------------------------------------------------
// Custom marker factory
// ---------------------------------------------------------------------------

function makeMarkerIcon(num: number, active: boolean): L.DivIcon {
  const bg = active ? '#a9c5ea' : '#8fb3e0'
  const size = active ? 36 : 32

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:${size}px;
        height:${size}px;
        background:${bg};
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        display:flex;
        align-items:center;
        justify-content:center;
        box-shadow:0 2px 8px rgba(0,0,0,0.3);
        transition:all 0.2s ease;
      ">
        <span style="
          transform:rotate(45deg);
          color:#0f1419;
          font-family:'DM Mono',monospace;
          font-size:${active ? 14 : 12}px;
          font-weight:500;
          line-height:1;
        ">${num}</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  })
}

// ---------------------------------------------------------------------------
// MapFlyTo — animates the map camera when activeSpotId changes
// ---------------------------------------------------------------------------

interface MapFlyToProps {
  spot: FoodSpot | undefined
}

function MapFlyTo({ spot }: MapFlyToProps) {
  const map = useMap()

  useEffect(() => {
    if (spot) {
      map.flyTo([spot.lat, spot.lng], 14, { duration: 1 })
    } else {
      map.flyTo(MAP_CENTER, MAP_ZOOM, { duration: 1 })
    }
  }, [spot, map])

  return null
}

// ---------------------------------------------------------------------------
// SFMapClient
// ---------------------------------------------------------------------------

interface SFMapClientProps {
  spots: FoodSpot[]
  activeSpotId: number | null
  onSpotClick: (id: number) => void
}

export default function SFMapClient({ spots, activeSpotId, onSpotClick }: SFMapClientProps) {
  const activeSpot = spots.find((s) => s.id === activeSpotId)

  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_ZOOM}
      scrollWheelZoom={false}
      style={{ width: '100%', height: '100%' }}
      className="z-0"
    >
      {/*
        Esri Dark Gray Canvas: free, no API key, matches the dark theme.
        CARTO basemaps now return an "API KEY REQUIRED" placeholder without a key.
        Two layers: the base map, then place labels on top.
        Esri's URL order is {z}/{y}/{x} (row before column), unlike most tile services.
      */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
        attribution="Tiles &copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors"
        maxZoom={16}
      />
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
        maxZoom={16}
      />

      {spots.map((spot) => (
        <Marker
          key={spot.id}
          position={[spot.lat, spot.lng]}
          icon={makeMarkerIcon(spot.id, spot.id === activeSpotId)}
          eventHandlers={{
            click: () => onSpotClick(spot.id),
          }}
        />
      ))}

      <MapFlyTo spot={activeSpot} />
    </MapContainer>
  )
}
