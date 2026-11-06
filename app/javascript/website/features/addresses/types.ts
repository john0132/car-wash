export interface CustomerAddress {
  id: number
  name: string
  area_id: number
  area: string | null
  city: string | null
  latitude: number
  longitude: number
}

export interface AreaOption {
  id: number
  name: string | null
  city: string | null
}
