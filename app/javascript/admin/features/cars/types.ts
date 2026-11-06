/** Admin::CarsController#index row */
export interface CarRow {
  id: number
  make: string
  model: string
  license_plate: string
  color: string
  customer: { id: number; full_name: string; email: string }
  created_at: string
}

export interface CarFilters {
  q: string | null
}
