import "@/admin/lib/geoman"

import L from "leaflet"
import { useEffect, useEffectEvent, useState } from "react"
import { useMap } from "react-leaflet"

import { BaseMap } from "@/admin/features/areas/components/base-map"
import { ReferencePolygons } from "@/admin/features/areas/components/reference-polygons"
import type {
  GeoJsonPolygon,
  ReferenceArea,
} from "@/admin/features/areas/types"
import { boundsOf, polygonToLatLngs } from "@/admin/features/areas/utils"

const SHAPE_STYLE: L.PathOptions = { color: "#2563eb", weight: 2 }

/**
 * Map for drawing an area's geofence: one polygon (or rectangle) that can be
 * drawn, edited, dragged and removed. Drawing a new shape replaces the old one.
 * Other areas are shown grey for reference.
 */
export function GeofenceEditor({
  value,
  onChange,
  referenceAreas,
  cityId,
}: {
  value: GeoJsonPolygon | null
  onChange: (value: GeoJsonPolygon | null) => void
  referenceAreas: ReferenceArea[]
  /** The area's city: its other areas are highlighted and framed when there is no shape yet. */
  cityId: number | null
}) {
  // Frame the shape being edited when there is one, otherwise the city's areas.
  // `value` is only read for the initial frame, so editing doesn't move the map.
  const [initialValue] = useState(value)
  const cityAreas = referenceAreas.filter((area) => area.city_id === cityId)
  const bounds =
    boundsOf([initialValue]) ??
    boundsOf(cityAreas.map((area) => area.geofence)) ??
    boundsOf(referenceAreas.map((area) => area.geofence))

  return (
    <BaseMap bounds={bounds}>
      <ReferencePolygons areas={referenceAreas} highlightCityId={cityId} />
      <DrawingLayer initialValue={initialValue} onChange={onChange} />
    </BaseMap>
  )
}

/** Wires leaflet-geoman's toolbar to a single editable polygon. */
function DrawingLayer({
  initialValue,
  onChange,
}: {
  initialValue: GeoJsonPolygon | null
  onChange: (value: GeoJsonPolygon | null) => void
}) {
  const map = useMap()
  const emit = useEffectEvent((layer: L.Polygon | null) =>
    onChange(layer ? (layer.toGeoJSON().geometry as GeoJsonPolygon) : null),
  )

  useEffect(() => {
    let current: L.Polygon | null = null

    const track = (layer: L.Polygon) => {
      current = layer
      layer.setStyle(SHAPE_STYLE)
      layer.on("pm:edit", () => emit(layer))
      layer.on("pm:dragend", () => emit(layer))
    }

    if (initialValue) {
      track(L.polygon(polygonToLatLngs(initialValue)).addTo(map))
    }

    map.pm.setGlobalOptions({
      allowSelfIntersection: false,
      pathOptions: SHAPE_STYLE,
      templineStyle: SHAPE_STYLE,
      hintlineStyle: { ...SHAPE_STYLE, dashArray: "5 5" },
    })
    map.pm.addControls({
      position: "topleft",
      drawPolygon: true,
      drawRectangle: true,
      editMode: true,
      dragMode: true,
      removalMode: true,
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawCircle: false,
      drawText: false,
      cutPolygon: false,
      rotateMode: false,
    })

    const onCreate = (event: { layer: L.Layer }) => {
      if (current) map.removeLayer(current)
      track(event.layer as L.Polygon)
      emit(current)
    }
    const onRemove = (event: { layer: L.Layer }) => {
      if (event.layer !== current) return
      current = null
      emit(null)
    }

    map.on("pm:create", onCreate)
    map.on("pm:remove", onRemove)

    return () => {
      map.off("pm:create", onCreate)
      map.off("pm:remove", onRemove)
      map.pm.disableDraw()
      map.pm.removeControls()
      current?.remove()
    }
  }, [map, initialValue])

  return null
}
