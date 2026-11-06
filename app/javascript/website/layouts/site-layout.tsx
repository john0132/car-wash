import type { ReactNode } from "react"

import { SeoHead } from "@/website/components/seo-head"
import { SiteFooter } from "@/website/components/site-footer"
import { SiteHeader } from "@/website/components/site-header"
import { useI18n } from "@/website/lib/i18n"
import type { Image } from "@/website/lib/types"

interface SiteLayoutProps {
  title: string
  description?: string | null
  image?: Image | null
  type?: "website" | "article"
  noindex?: boolean
  canonicalQuery?: string[]
  jsonLd?: Record<string, unknown>[]
  /** Classes for <main>; pass "" when sections manage their own width (CMS pages). */
  mainClassName?: string
  children: ReactNode
}

/**
 * The public website's page chrome: document head, skip link, header, <main>
 * and footer. Every website page renders inside this (directly, or through
 * MarketingLayout / BookingLayout / ProfileLayout).
 */
export default function SiteLayout({
  title,
  description,
  image,
  type,
  noindex,
  canonicalQuery,
  jsonLd,
  mainClassName = "mx-auto max-w-6xl px-6 pt-10 pb-24 lg:pt-16",
  children,
}: SiteLayoutProps) {
  const { t } = useI18n()

  return (
    <>
      <SeoHead
        title={title}
        description={description}
        image={image}
        type={type}
        noindex={noindex}
        canonicalQuery={canonicalQuery}
        jsonLd={jsonLd}
      />

      <a
        href="#main"
        className="bg-pine text-ivory focus-visible:ring-bronze sr-only z-50 rounded-full px-5 py-3 text-sm focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus-visible:ring-2 focus-visible:outline-none"
      >
        {t("Skip to content")}
      </a>

      <div className="bg-ivory text-pine min-h-svh">
        <SiteHeader />
        <main
          id="main"
          tabIndex={-1}
          className={`${mainClassName} focus:outline-none`}
        >
          {children}
        </main>
        <SiteFooter />
      </div>
    </>
  )
}
