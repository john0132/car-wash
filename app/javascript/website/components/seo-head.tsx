import { Head, usePage } from "@inertiajs/react"

import type { LocaleProps } from "@/website/lib/i18n"
import type { Image } from "@/website/lib/types"

interface SeoHeadProps {
  /** The page's own part of the title; the brand is appended (see titleFor). */
  title: string
  description?: string | null
  /** Social preview image (a CMS image, service photo, blog cover…). */
  image?: Image | null
  /** `article` for blog posts. */
  type?: "website" | "article"
  /** Keep the page out of search results (account, auth, checkout…). */
  noindex?: boolean
  /** Query params that change the content and belong in the canonical URL (e.g. `page`). */
  canonicalQuery?: string[]
  /** schema.org objects, rendered as JSON-LD. */
  jsonLd?: Record<string, unknown>[]
}

const BRAND = "Auto Atelier"
const OG_LOCALES: Record<string, string> = { en: "en_US", ar: "ar_AR" }

/**
 * The document head of a website page: title and description, canonical URL
 * (absolute, without tracking/filter params), language alternates, Open Graph
 * and Twitter cards, `noindex`, and structured data.
 */
export function SeoHead({
  title,
  description,
  image,
  type = "website",
  noindex,
  canonicalQuery = [],
  jsonLd = [],
}: SeoHeadProps) {
  const { props, url } = usePage<{
    seo: { origin: string }
    locale: LocaleProps
  }>()
  const { origin } = props.seo
  const { locale } = props

  const [rawPath, search = ""] = url.split("?")
  // "/ar/" and "/ar" are the same page: keep one form.
  const pathname = rawPath.length > 1 ? rawPath.replace(/\/+$/, "") : rawPath
  const kept = new URLSearchParams()
  const params = new URLSearchParams(search)
  for (const key of canonicalQuery) {
    const value = params.get(key)
    if (value) kept.set(key, value)
  }
  const query = kept.toString()
  const canonical = `${origin}${pathname === "/" ? "" : pathname}${query ? `?${query}` : ""}`

  const alternates = locale.available.map((entry) => ({
    code: entry.code,
    href: `${origin}${entry.href.split("?")[0]}`,
  }))
  const fallback = alternates.find((entry) => entry.code === locale.default)
  const imageUrl = image ? `${origin}${image.url}` : null

  return (
    <Head title={title}>
      {description && <meta name="description" content={description} />}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <link rel="canonical" href={canonical} />
      )}
      {!noindex &&
        alternates.map((entry) => (
          <link
            key={entry.code}
            rel="alternate"
            hrefLang={entry.code}
            href={entry.href}
          />
        ))}
      {!noindex && fallback && (
        <link rel="alternate" hrefLang="x-default" href={fallback.href} />
      )}

      <meta property="og:site_name" content={BRAND} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={canonical} />
      <meta
        property="og:locale"
        content={OG_LOCALES[locale.code] ?? locale.code}
      />
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      <meta
        name="twitter:card"
        content={imageUrl ? "summary_large_image" : "summary"}
      />

      {jsonLd.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify({ "@context": "https://schema.org", ...data })}
        </script>
      ))}
    </Head>
  )
}
