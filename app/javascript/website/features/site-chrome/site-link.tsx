import { SmartLink } from "@/website/components/smart-link"
import type { SiteLink } from "@/website/features/site-chrome/types"

/** A header/footer link (see SmartLink for how each kind of URL is treated). */
export function SiteLinkAnchor({
  link,
  className,
}: {
  link: SiteLink
  className?: string
}) {
  return (
    <SmartLink href={link.href} external={link.external} className={className}>
      {link.label}
    </SmartLink>
  )
}
