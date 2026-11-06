import type { Image } from "@/website/lib/types"

/** Website::ServicesController#service_props */
export interface ServiceDetail {
  id: number
  slug: string
  name: string | null
  title: string | null
  description: string | null
  seo_title: string | null
  seo_description: string | null
  price: number
  sale_price: number | null
  duration_minutes: number | null
  category: string | null
  category_slug: string
  image: Image | null
}

/** Website::ServicesController#extras_props: one page of add-on extras. */
export interface ExtraOption {
  id: number
  name: string | null
  price: number
}

export interface ExtrasPage {
  items: ExtraOption[]
  page: number
  pages: number
  total: number
}
