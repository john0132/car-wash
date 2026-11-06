import type { ReactNode } from "react"

import { SeoHead } from "@/website/components/seo-head"
import { SiteFooter } from "@/website/components/site-footer"
import { SiteHeader } from "@/website/components/site-header"

interface SiteLayoutProps {
  title: string
  description?: string | null
  noindex?: boolean
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
  noindex,
  mainClassName = "mx-auto max-w-6xl px-6 pt-10 pb-24 lg:pt-16",
  children,
}: SiteLayoutProps) {
  return (
    <>
      <SeoHead title={title} description={description} noindex={noindex} />

      <a
        href="#main"
        className="bg-pine text-ivory focus-visible:ring-bronze sr-only z-50 rounded-full px-5 py-3 text-sm focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus-visible:ring-2 focus-visible:outline-none"
      >
        Skip to content
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
