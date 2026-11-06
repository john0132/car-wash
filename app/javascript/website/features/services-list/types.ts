import type { ServiceSummary } from "@/website/lib/types"

/** Website::ServicesController#index */
export interface ServicesListCategory {
  id: number
  slug: string
  name: string | null
  services: ServiceSummary[]
}
