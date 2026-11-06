import { usePage } from "@inertiajs/react"

import { Logo } from "@/website/components/brand-mark"
import { SiteLinkAnchor } from "@/website/features/site-chrome/site-link"
import type { SiteSharedProps } from "@/website/features/site-chrome/types"

export function SiteFooter() {
  const { site } = usePage<SiteSharedProps>().props
  const footer = site.footer
  const columns = footer?.columns.filter((c) => c.items.length > 0) ?? []
  const brand = footer?.title ?? "Auto Atelier"

  return (
    <footer className="bg-white px-6 py-14 text-[#5B6B5E]">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xs">
          {footer?.image ? (
            <img
              src={footer.image.url}
              alt=""
              className="mb-4 h-16 w-auto rounded"
            />
          ) : (
            <Logo />
          )}
          {footer?.title && (
            <p className="mt-4 font-medium text-[#2B3A32]">{footer.title}</p>
          )}
          {footer?.description && (
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">
              {footer.description}
            </p>
          )}

          {footer && footer.socials.length > 0 && (
            <ul className="mt-5 flex flex-wrap items-center gap-3">
              {footer.socials.map((social) => (
                <li key={social.id}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="block text-sm transition-colors hover:text-[#8A6240]"
                  >
                    {social.icon ? (
                      <img
                        src={social.icon.url}
                        alt=""
                        className="size-6 object-contain"
                      />
                    ) : (
                      social.name
                    )}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {columns.length > 0 && (
          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.id}>
                <p className="font-medium text-[#2B3A32]">{column.title}</p>
                <ul className="mt-3 flex flex-col gap-2">
                  {column.items.map((link) => (
                    <li key={link.id}>
                      <SiteLinkAnchor
                        link={link}
                        className="hover:text-[#8A6240]"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mx-auto mt-12 max-w-6xl border-t border-[#2B3A32]/10 pt-6 text-xs text-[#5E5D59]">
        © {new Date().getFullYear()} {brand}
      </div>
    </footer>
  )
}
