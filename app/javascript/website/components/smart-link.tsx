import { Link } from "@inertiajs/react"
import type { ReactNode } from "react"

import { useI18n } from "@/website/lib/i18n"

interface SmartLinkProps {
  href: string
  /** Force a plain anchor that opens in a new tab (staff asked for it, or it leaves the site). */
  external?: boolean
  className?: string
  children: ReactNode
}

// Anything with a scheme (https:, mailto:, tel:), protocol-relative, or a bare #anchor.
const PLAIN = /^([a-z][a-z0-9+.-]*:|\/\/|#)/i

/**
 * A link from staff-written content. Site paths (`/services`, `/#faq`) go
 * through Inertia in the visitor's language (/ar/services); external URLs,
 * `mailto:`, `tel:` and bare anchors are ordinary anchors.
 */
export function SmartLink({
  href,
  external,
  className,
  children,
}: SmartLinkProps) {
  const { href: localize } = useI18n()

  if (external || PLAIN.test(href)) {
    return (
      <a
        href={href}
        className={className}
        {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={localize(href)} className={className}>
      {children}
    </Link>
  )
}
