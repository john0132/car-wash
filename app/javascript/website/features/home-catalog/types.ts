import type { Image } from "@/website/lib/types"

/** Website::HomeController#home_categories */
export interface HomeCategory {
  id: number
  slug: string
  name: string | null
  services_count: number
  image: Image | null
}
