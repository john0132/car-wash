import type { Image } from "@/website/lib/types"

// schema.org objects for SeoHead's `jsonLd`. They only state what the page
// already shows, built from data staff edit in the dashboard.

const absolute = (origin: string, image?: Image | null) =>
  image ? `${origin}${image.url}` : undefined

/** The business itself, for the home and contact pages. */
export function businessLd(
  origin: string,
  name: string,
  image?: Image | null,
): Record<string, unknown> {
  return {
    "@type": "AutoWash",
    name,
    url: origin,
    image: absolute(origin, image),
  }
}

/** A bookable service with its current price. */
export function serviceLd(
  origin: string,
  provider: string,
  service: {
    name: string
    description?: string | null
    image?: Image | null
    price: number
    sale_price: number | null
  },
): Record<string, unknown> {
  return {
    "@type": "Service",
    name: service.name,
    description: service.description ?? undefined,
    image: absolute(origin, service.image),
    provider: { "@type": "AutoWash", name: provider, url: origin },
    offers: {
      "@type": "Offer",
      price: service.sale_price ?? service.price,
      priceCurrency: "EGP",
      availability: "https://schema.org/InStock",
    },
  }
}

export function blogPostingLd(
  origin: string,
  publisher: string,
  post: {
    title: string
    description?: string | null
    image?: Image | null
    published_at: string
  },
): Record<string, unknown> {
  return {
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description ?? undefined,
    image: absolute(origin, post.image),
    datePublished: post.published_at,
    author: { "@type": "Organization", name: publisher },
    publisher: { "@type": "Organization", name: publisher },
  }
}
