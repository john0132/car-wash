import { Head, Link, usePage } from "@inertiajs/react"

import { root } from "@/routes"
import { useI18n } from "@/website/lib/i18n"

export interface Crumb {
  label: string
  /** Omit for the current page. */
  href?: string
}

/**
 * "Home / … / Current". Home is implicit; the last crumb is the current page.
 * Also tells search engines about the trail (BreadcrumbList).
 */
export function Breadcrumbs({
  items,
  className = "",
}: {
  items: Crumb[]
  className?: string
}) {
  const { t } = useI18n()
  const { origin } = usePage<{ seo: { origin: string } }>().props.seo
  const trail = [{ label: t("Home"), href: root().url }, ...items]

  return (
    <nav
      aria-label={t("Breadcrumb")}
      className={`text-sage text-sm ${className}`}
    >
      <Head>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: trail.map((crumb, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: crumb.label,
              ...(crumb.href && { item: `${origin}${crumb.href}` }),
            })),
          })}
        </script>
      </Head>
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href={root()} className="hover:text-pine">
            {t("Home")}
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <span aria-hidden>/</span>
            {item.href ? (
              <Link href={item.href} className="hover:text-pine">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
