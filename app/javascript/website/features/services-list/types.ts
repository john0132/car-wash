import type { CategoryService } from "@/website/features/category-detail/types"

/** Website::ServicesController#index */
export interface ServicesListCategory {
  id: number
  slug: string
  name: string | null
  services: CategoryService[]
}
