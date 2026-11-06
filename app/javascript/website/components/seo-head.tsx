import { Head } from "@inertiajs/react"

interface SeoHeadProps {
  /** The page's own part of the title; the brand is appended (see titleFor). */
  title: string
  description?: string | null
  /** Keep the page out of search results (account, auth, checkout…). */
  noindex?: boolean
}

/** The document head for a website page. One place to grow canonical and social tags. */
export function SeoHead({ title, description, noindex }: SeoHeadProps) {
  return (
    <Head title={title}>
      {description && <meta name="description" content={description} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
    </Head>
  )
}
