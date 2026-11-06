import type { ReactNode } from "react"

import { PageSections } from "@/website/features/page-sections/page-sections"
import type { PageProps } from "@/website/features/page-sections/types"
import SiteLayout from "@/website/layouts/site-layout"

interface MarketingLayoutProps {
  page: PageProps | null
  fallbackTitle: string
  emptyMessage: string
  /** Extra sections shown right under the page's hero. */
  afterHero?: ReactNode
}

// Shared chrome for every CMS-driven public page (home, and any page served
// by Website::PagesController): the site layout plus the section renderer.
// `page` is null only for the home route when no "home" Page has been created
// yet — every other route 404s instead of rendering this empty.
export default function MarketingLayout({
  page,
  fallbackTitle,
  emptyMessage,
  afterHero,
}: MarketingLayoutProps) {
  return (
    <SiteLayout
      title={page?.seo.title ?? fallbackTitle}
      description={page?.seo.description}
      mainClassName=""
    >
      {page ? (
        <PageSections
          sections={page.sections}
          components={page.components}
          afterHero={afterHero}
        />
      ) : (
        <div className="text-sage px-6 py-32 text-center">{emptyMessage}</div>
      )}
    </SiteLayout>
  )
}
