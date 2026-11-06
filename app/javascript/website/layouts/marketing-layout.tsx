import { Head } from "@inertiajs/react"
import type { ReactNode } from "react"

import { SiteFooter } from "@/website/components/site-footer"
import { SiteHeader } from "@/website/components/site-header"
import { PageSections } from "@/website/features/page-sections/page-sections"
import type { PageProps } from "@/website/features/page-sections/types"

interface MarketingLayoutProps {
  page: PageProps | null
  fallbackTitle: string
  emptyMessage: string
  /** Extra sections shown right under the page's hero. */
  afterHero?: ReactNode
}

// Shared chrome for every CMS-driven public page (home, and any page served
// by Website::PagesController): fonts, header, footer and the section
// renderer. `page` is null only for the home route when no "home" Page has
// been created yet — every other route 404s instead of rendering this empty.
export default function MarketingLayout({
  page,
  fallbackTitle,
  emptyMessage,
  afterHero,
}: MarketingLayoutProps) {
  return (
    <>
      <Head title={page?.seo.title ?? fallbackTitle}>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Italiana&family=Jost:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        {page?.seo.description && (
          <meta name="description" content={page.seo.description} />
        )}
      </Head>

      <div
        style={{ fontFamily: "'Jost', system-ui, sans-serif" }}
        className="bg-[#F6F1E7] text-[#2B3A32]"
      >
        <SiteHeader />
        <main>
          {page ? (
            <PageSections
              sections={page.sections}
              components={page.components}
              afterHero={afterHero}
            />
          ) : (
            <div className="px-6 py-32 text-center text-[#5B6B5E]">
              {emptyMessage}
            </div>
          )}
        </main>
        <SiteFooter />
      </div>
    </>
  )
}
