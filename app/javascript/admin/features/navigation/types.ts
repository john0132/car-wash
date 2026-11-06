export type LinkType = "page" | "service_category" | "service" | "route" | "url"

export const LINK_TYPES: { value: LinkType; label: string }[] = [
  { value: "page", label: "Page" },
  { value: "service_category", label: "Service category" },
  { value: "service", label: "Service" },
  { value: "route", label: "App screen" },
  { value: "url", label: "Custom URL" },
]

/** Admin::NavigationItems#link_options */
export interface LinkOptions {
  pages: { id: number; slug: string; name: string; is_active: boolean }[]
  service_categories: {
    id: number
    slug: string
    name: string
    is_active: boolean
  }[]
  services: {
    id: number
    slug: string
    name: string
    category: string | null
    is_active: boolean
  }[]
  routes: string[]
}

/** Admin::NavigationItems#link_props */
export interface LinkProps {
  id: number | null
  link_type: LinkType
  page_id: number | null
  service_category_id: number | null
  service_id: number | null
  route_key: string
  url: string
  open_in_new_tab: boolean
  is_active: boolean
  /** Keyed by language id. */
  translations: Record<number, { label: string }>
  /** Header links only: the entries of this link's dropdown, to any depth. */
  children?: LinkProps[]
}

/** A link being edited. `uid` is a stable React key, since new links have no id yet. */
export interface LinkState extends Omit<LinkProps, "children"> {
  uid: string
  children?: LinkState[]
}
