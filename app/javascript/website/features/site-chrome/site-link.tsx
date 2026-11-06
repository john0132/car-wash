import { Link } from "@inertiajs/react"

import type { SiteLink } from "@/website/features/site-chrome/types"

/**
 * A header/footer link. Same-site paths go through Inertia; external links,
 * anchors (`/#services`), `mailto:` and `tel:` are plain anchors.
 */
export function SiteLinkAnchor({
  link,
  className,
}: {
  link: SiteLink
  className?: string
}) {
  const plain = link.external || /^(mailto:|tel:)|#/.test(link.href)

  if (!plain) {
    return (
      <Link href={link.href} className={className}>
        {link.label}
      </Link>
    )
  }

  return (
    <a
      href={link.href}
      className={className}
      {...(link.external && { target: "_blank", rel: "noopener noreferrer" })}
    >
      {link.label}
    </a>
  )
}
