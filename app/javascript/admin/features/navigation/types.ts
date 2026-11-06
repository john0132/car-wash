export type LinkType = "page" | "route" | "url"

export const LINK_TYPES: { value: LinkType; label: string }[] = [
  { value: "page", label: "Page" },
  { value: "route", label: "App screen" },
  { value: "url", label: "Custom URL" },
]

/** Admin::NavigationItems#link_options */
export interface LinkOptions {
  pages: { id: number; slug: string; name: string; is_active: boolean }[]
  routes: string[]
}

/** Admin::NavigationItems#link_props */
export interface LinkProps {
  id: number | null
  link_type: LinkType
  page_id: number | null
  route_key: string
  url: string
  open_in_new_tab: boolean
  is_active: boolean
  /** Keyed by language id. */
  translations: Record<number, { label: string }>
}

/** A link being edited. `uid` is a stable React key, since new links have no id yet. */
export interface LinkState extends LinkProps {
  uid: string
}
