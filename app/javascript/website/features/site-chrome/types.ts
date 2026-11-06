/** One link in the header or a footer column (SiteChrome#link_props). */
export interface SiteLink {
  id: number
  label: string | null
  href: string
  /** Leaves the site, or staff asked for a new tab. */
  external: boolean
}

export interface SiteImage {
  url: string
}

export interface SiteFooterData {
  title: string | null
  description: string | null
  image: SiteImage | null
  socials: { id: number; name: string; url: string; icon: SiteImage | null }[]
  columns: { id: number; title: string | null; items: SiteLink[] }[]
}

/** The `site` prop Website::BaseController shares with every website page (SiteChrome.props). */
export interface SiteChromeProps {
  header: { items: SiteLink[] }
  footer: SiteFooterData | null
}

export interface SiteSharedProps {
  [key: string]: unknown
  site: SiteChromeProps
}
