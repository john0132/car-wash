import { Languages } from "lucide-react"

import { useI18n } from "@/website/lib/i18n"

/**
 * Links to this same page in the other languages. Plain anchors on purpose: a
 * full page load is what updates the document's lang and dir.
 */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { t, locale } = useI18n()
  const others = locale.available.filter((entry) => entry.code !== locale.code)

  if (others.length === 0) return null

  return (
    <nav aria-label={t("Language")} className={className}>
      <ul className="flex items-center gap-3">
        {others.map((entry) => (
          <li key={entry.code}>
            <a
              href={entry.href}
              lang={entry.code}
              hrefLang={entry.code}
              className="text-pine hover:text-bronze focus-visible:ring-bronze inline-flex items-center gap-1.5 rounded-full text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <Languages className="size-4" aria-hidden />
              {entry.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
