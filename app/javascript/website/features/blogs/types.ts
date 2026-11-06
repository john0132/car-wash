import type { Image } from "@/website/lib/types"

export interface BlogCardData {
  id: number
  slug: string
  title: string | null
  subtitle: string | null
  cover_image: Image | null
  published_at: string
}

export interface BlogDetail extends BlogCardData {
  body: string | null
  seo_title: string | null
  seo_description: string | null
}
