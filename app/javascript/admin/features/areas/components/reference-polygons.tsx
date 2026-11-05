import { Polygon, Tooltip } from "react-leaflet"

import type { ReferenceArea } from "@/admin/features/areas/types"
import { polygonToLatLngs } from "@/admin/features/areas/utils"

/** Other areas, drawn grey and ignored by the drawing tools. */
export function ReferencePolygons({
  areas,
  highlightCityId,
}: {
  areas: ReferenceArea[]
  /** Areas of this city are drawn darker than the rest. */
  highlightCityId?: number | null
}) {
  return areas.map((area) =>
    area.geofence ? (
      <Polygon
        key={area.id}
        positions={polygonToLatLngs(area.geofence)}
        pmIgnore
        pathOptions={{
          color: area.city_id === highlightCityId ? "#475569" : "#94a3b8",
          weight: 1,
          dashArray: "4 4",
          fillOpacity: 0.12,
        }}
      >
        <Tooltip sticky>{area.name}</Tooltip>
      </Polygon>
    ) : null,
  )
}
