import type { ListFilterValues } from "@/admin/components/list-filters"
import type { TranslationEntry } from "@/admin/types"

/** GeoJSON Polygon geometry ([lng, lat] positions), as Area#geofence_geojson returns it. */
export interface GeoJsonPolygon {
  type: "Polygon"
  coordinates: [number, number][][]
}

export interface CityOption {
  id: number
  name: string
  is_active: boolean
}

/** Admin::AreasController#area_props */
export interface AreaDetail {
  id: number
  name: string
  rate: number
  is_active: boolean
  geofence: GeoJsonPolygon | null
  translations: TranslationEntry[]
  city: { id: number; name: string }
  created_at: string
}

/** Admin::CitiesController#area_summary_props */
export interface AreaSummary {
  id: number
  name: string
  rate: number
  is_active: boolean
  geofence: GeoJsonPolygon | null
}

/** Other areas drawn grey behind the editor (Admin::AreasController#reference_areas). */
export interface ReferenceArea {
  id: number
  name: string
  city_id: number
  geofence: GeoJsonPolygon | null
}

export type AreaFilters = ListFilterValues & { city_id: number | null }
