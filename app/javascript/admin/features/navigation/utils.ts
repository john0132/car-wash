import type { LinkProps, LinkState } from "@/admin/features/navigation/types"

let counter = 0

/** A client-side key for a list entry that has no database id yet. */
export const newUid = () => `new-${++counter}`

export const toLinkState = ({ children, ...link }: LinkProps): LinkState => ({
  ...link,
  uid: `link-${link.id}`,
  ...(children && { children: children.map(toLinkState) }),
})

export const newLink = (): LinkState => ({
  uid: newUid(),
  id: null,
  link_type: "page",
  page_id: null,
  service_category_id: null,
  service_id: null,
  route_key: "",
  url: "",
  open_in_new_tab: false,
  is_active: true,
  translations: {},
})

/** `value` without its client-side `uid`, for submitting. */
export const withoutUid = <T extends { uid: string }>(value: T) =>
  Object.fromEntries(
    Object.entries(value).filter(([key]) => key !== "uid"),
  ) as Omit<T, "uid">

/** What Admin::NavigationItems#assign_link expects. */
export const linkPayload = ({ children, ...link }: LinkState): LinkProps => ({
  ...withoutUid(link),
  ...(children && { children: children.map(linkPayload) }),
})

/** "sign_up" → "Sign up" */
export const routeLabel = (key: string) =>
  key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ")
