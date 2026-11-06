import { Head } from "@inertiajs/react"
import type { ReactNode } from "react"

/** Page <Head> with the site fonts, shared by the blog pages. */
export function BlogHead({
  title,
  description,
  children,
}: {
  title: string
  description?: string | null
  children?: ReactNode
}) {
  return (
    <Head title={title}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Italiana&family=Jost:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      {description && <meta name="description" content={description} />}
      {children}
    </Head>
  )
}
