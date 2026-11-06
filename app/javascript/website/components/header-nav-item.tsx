import { ChevronDown } from "lucide-react"

import { SiteLinkAnchor } from "@/website/features/site-chrome/site-link"
import type { SiteLink } from "@/website/features/site-chrome/types"

const topLinkClass =
  "text-sm tracking-wide text-[#2B3A32] transition-colors hover:text-[#8A6240]"

/** Nested links, indented one step per level. */
function SubLinks({ links, depth = 0 }: { links: SiteLink[]; depth?: number }) {
  return (
    <ul
      className={
        depth > 0
          ? "mt-1 space-y-1 border-l border-[#2B3A32]/10 pl-3"
          : "space-y-1"
      }
    >
      {links.map((link) => (
        <li key={link.id}>
          <SiteLinkAnchor
            link={link}
            className="block py-0.5 text-sm text-[#2B3A32]/80 transition-colors hover:text-[#8A6240]"
          />
          {link.children && link.children.length > 0 && (
            <SubLinks links={link.children} depth={depth + 1} />
          )}
        </li>
      ))}
    </ul>
  )
}

/**
 * A top-level header link. With children it opens a dropdown on hover or
 * keyboard focus: each child becomes a column (its link as the heading, its own
 * children listed below, to any depth), or a plain list when none of them has children.
 */
export function HeaderNavItem({ link }: { link: SiteLink }) {
  const children = link.children ?? []
  if (children.length === 0) {
    return <SiteLinkAnchor link={link} className={topLinkClass} />
  }

  const grouped = children.some((child) => (child.children?.length ?? 0) > 0)

  return (
    <div className="group relative">
      <span className="flex items-center gap-1">
        <SiteLinkAnchor link={link} className={topLinkClass} />
        <ChevronDown
          aria-hidden
          className="size-3.5 text-[#2B3A32]/60 transition-transform group-focus-within:rotate-180 group-hover:rotate-180"
        />
      </span>

      {/* pt-4 bridges the gap so the pointer can travel into the panel. */}
      <div className="invisible absolute top-full left-1/2 z-50 -translate-x-1/2 pt-4 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        <div className="rounded-xl border border-[#2B3A32]/10 bg-[#F6F1E7] p-5 shadow-lg">
          {grouped ? (
            <div
              className="grid gap-x-8 gap-y-5"
              style={{
                gridTemplateColumns: `repeat(${Math.min(children.length, 4)}, minmax(11rem, 1fr))`,
              }}
            >
              {children.map((child) => (
                <div key={child.id}>
                  <SiteLinkAnchor
                    link={child}
                    className="mb-2 block text-sm font-semibold text-[#2B3A32] transition-colors hover:text-[#8A6240]"
                  />
                  {child.children && child.children.length > 0 && (
                    <SubLinks links={child.children} />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="min-w-48">
              <SubLinks links={children} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
