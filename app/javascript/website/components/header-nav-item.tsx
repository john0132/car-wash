import { router } from "@inertiajs/react"
import { ChevronDown } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"

import { SiteLinkAnchor } from "@/website/features/site-chrome/site-link"
import type { SiteLink } from "@/website/features/site-chrome/types"
import { useI18n } from "@/website/lib/i18n"

const topLinkClass =
  "text-sm tracking-wide text-pine transition-colors hover:text-bronze"

/** Nested links, indented one step per level. */
function SubLinks({ links, depth = 0 }: { links: SiteLink[]; depth?: number }) {
  return (
    <ul
      className={
        depth > 0 ? "border-pine/10 mt-1 space-y-1 border-s ps-3" : "space-y-1"
      }
    >
      {links.map((link) => (
        <li key={link.id}>
          <SiteLinkAnchor
            link={link}
            className="text-pine/80 hover:text-bronze block py-0.5 text-sm transition-colors"
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
 * A top-level header link. With children it gets a chevron button that opens a
 * dropdown (disclosure pattern: `aria-expanded`, Escape and outside click close
 * it). A mouse pointer also opens it on hover; touch and keyboard use the button.
 * Each child becomes a column (its link as the heading, its own children listed
 * below, to any depth), or a plain list when none of them has children.
 */
export function HeaderNavItem({ link }: { link: SiteLink }) {
  const { t } = useI18n()
  const children = link.children ?? []
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return

    const close = () => setOpen(false)
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) close()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      close()
      button.current?.focus()
    }

    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    const offNavigate = router.on("navigate", close)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
      offNavigate()
    }
  }, [open])

  if (children.length === 0) {
    return <SiteLinkAnchor link={link} className={topLinkClass} />
  }

  const grouped = children.some((child) => (child.children?.length ?? 0) > 0)

  return (
    <div
      ref={root}
      className="relative"
      onPointerEnter={(event) => event.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(event) =>
        event.pointerType === "mouse" && setOpen(false)
      }
      onBlur={(event) => {
        if (!root.current?.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      <span className="flex items-center gap-1">
        <SiteLinkAnchor link={link} className={topLinkClass} />
        <button
          ref={button}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={t("{name} submenu", { name: link.label })}
          onClick={() => setOpen((value) => !value)}
          className="text-pine/60 hover:text-bronze focus-visible:ring-bronze -m-1 rounded-full p-1 focus-visible:ring-2 focus-visible:outline-none"
        >
          <ChevronDown
            aria-hidden
            className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </span>

      {open && (
        // pt-4 bridges the gap so the pointer can travel into the panel.
        <div
          id={panelId}
          className="absolute start-1/2 top-full z-50 -translate-x-1/2 pt-4 rtl:translate-x-1/2"
        >
          <div className="border-pine/10 bg-ivory rounded-xl border p-5 shadow-lg">
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
                      className="text-pine hover:text-bronze mb-2 block text-sm font-semibold transition-colors"
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
      )}
    </div>
  )
}
