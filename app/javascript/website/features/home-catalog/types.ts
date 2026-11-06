export interface HomeImage {
  url: string
}

/** Website::HomeController#home_services */
export interface HomeService {
  id: number
  slug: string
  name: string | null
  price: number
  sale_price: number | null
  category: string | null
  image: HomeImage | null
}

/** Website::HomeController#home_categories */
export interface HomeCategory {
  id: number
  slug: string
  name: string | null
  services_count: number
  image: HomeImage | null
}
