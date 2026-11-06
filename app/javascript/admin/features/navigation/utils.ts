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

/** `list` with the entry at `index` moved by `offset` places. */
export function moveItem<T>(list: T[], index: number, offset: number) {
  const next = [...list]
  const [entry] = next.splice(index, 1)
  next.splice(index + offset, 0, entry)
  return next
}

/** "sign_up" → "Sign up" */
export const routeLabel = (key: string) =>
  key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ")

/**
 * Codes of languages with errors, for LanguageSwitcher. Translation errors are
 * keyed `<path>.translations.<language_id>.<attribute>`.
 */
export function navigationErrorLanguageCodes(
  errors: Record<string, unknown>,
  languages: { id: number; code: string }[],
) {
  const codes = new Set<string>()
  for (const key of Object.keys(errors)) {
    const match = /(?:^|\.)translations\.(\d+)\./.exec(key)
    const language = match && languages.find((l) => l.id === Number(match[1]))
    if (language) codes.add(language.code)
  }
  return [...codes]
}
