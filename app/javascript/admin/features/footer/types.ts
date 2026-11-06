import type { LinkProps, LinkState } from "@/admin/features/navigation/types"
import type { ImageValue } from "@/admin/types"

/** Keyed by language id. */
export type FooterTranslations = Record<
  number,
  { title: string; description: string }
>

export interface SocialLinkProps {
  id: number | null
  name: string
  url: string
  is_active: boolean
  icon: ImageValue | null
}

export interface SocialLinkState extends SocialLinkProps {
  uid: string
}

export interface ColumnProps {
  id: number | null
  is_active: boolean
  /** Keyed by language id. */
  translations: Record<number, { title: string }>
  items: LinkProps[]
}

export interface ColumnState extends Omit<ColumnProps, "items"> {
  uid: string
  items: LinkState[]
}
