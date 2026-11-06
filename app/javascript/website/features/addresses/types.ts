export interface CustomerAddress {
  id: number
  name: string
  area_id: number
  area: string | null
  city: string | null
  latitude: number
  longitude: number
}

/** Website::PublicProps#area_options. `latitude`/`longitude` is a point inside the area. */
export interface AreaOption {
  id: number
  name: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
}
