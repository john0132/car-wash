import { router } from "@inertiajs/react"
import { Polygon, Tooltip } from "react-leaflet"

import { BaseMap } from "@/admin/features/areas/components/base-map"
import { ReferencePolygons } from "@/admin/features/areas/components/reference-polygons"
import type {
  GeoJsonPolygon,
  ReferenceArea,
} from "@/admin/features/areas/types"
import { boundsOf, polygonToLatLngs } from "@/admin/features/areas/utils"

export interface MapArea {
  id: number
  name: string
  is_active: boolean
  geofence: GeoJsonPolygon | null
  /** Clicking the polygon visits this URL. */
  href?: string
}

const visit = (href?: string) => {
  if (href) router.visit(href)
}

/** Read-only map of area geofences. Disabled areas are drawn muted. */
export function AreasMap({
  areas,
  referenceAreas = [],
  className,
}: {
  areas: MapArea[]
  /** Neighbouring areas drawn grey behind `areas`. */
  referenceAreas?: ReferenceArea[]
  className?: string
}) {
  const bounds = boundsOf(areas.map((area) => area.geofence))

  return (
    <BaseMap bounds={bounds} className={className}>
      <ReferencePolygons areas={referenceAreas} />
      {areas.map((area) =>
        area.geofence ? (
          <Polygon
            key={area.id}
            positions={polygonToLatLngs(area.geofence)}
            pathOptions={{
              color: area.is_active ? "#2563eb" : "#a1a1aa",
              weight: 2,
              fillOpacity: 0.2,
            }}
            eventHandlers={
              area.href ? { click: () => visit(area.href) } : undefined
            }
          >
            <Tooltip sticky>
              {area.name}
              {area.is_active ? "" : " (disabled)"}
            </Tooltip>
          </Polygon>
        ) : null,
      )}
    </BaseMap>
  )
}
