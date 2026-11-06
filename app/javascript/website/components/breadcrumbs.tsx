import { Link } from "@inertiajs/react"

import { root } from "@/routes"
import { useI18n } from "@/website/lib/i18n"

export interface Crumb {
  label: string
  /** Omit for the current page. */
  href?: string
}

/** "Home / … / Current". Home is implicit; the last crumb is the current page. */
export function Breadcrumbs({
  items,
  className = "",
}: {
  items: Crumb[]
  className?: string
}) {
  const { t } = useI18n()

  return (
    <nav
      aria-label={t("Breadcrumb")}
      className={`text-sage text-sm ${className}`}
    >
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
