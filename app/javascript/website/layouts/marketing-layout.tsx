import { usePage } from "@inertiajs/react"
import type { ReactNode } from "react"

import { services } from "@/routes"
import { HeroBlock } from "@/website/features/page-sections/components/hero-block"
import {
  PageSections,
  hasHeading,
} from "@/website/features/page-sections/page-sections"
import type { PageProps } from "@/website/features/page-sections/types"
import type { SiteSharedProps } from "@/website/features/site-chrome/types"
import SiteLayout from "@/website/layouts/site-layout"
import { useI18n } from "@/website/lib/i18n"
import { businessLd } from "@/website/lib/structured-data"

interface MarketingLayoutProps {
  page: PageProps | null
  fallbackTitle: string
  /** Used when the page has no description of its own. */
  fallbackDescription?: string
  /** Describe the business (schema.org AutoWash); for the home and contact pages. */
  business?: boolean
  /** Extra sections shown right under the page's hero. */
  afterHero?: ReactNode
}

// Shared chrome for every CMS-driven public page (home, and any page served
// by Website::PagesController): the site layout plus the section renderer.
// `page` is null only for the home route when no "home" Page has been created
// yet; visitors then get a neutral brand hero, never staff instructions.
// Every page gets exactly one <h1>: the hero's, or the page title when the
// page has no hero.
export default function MarketingLayout({
  page,
  fallbackTitle,
  fallbackDescription,
  business,
  afterHero,
}: MarketingLayoutProps) {
  const { t } = useI18n()
  const { props } = usePage<SiteSharedProps & { seo: { origin: string } }>()
  const name = props.site.footer?.title ?? "Auto Atelier"

  return (
    <SiteLayout
      title={page?.seo.title ?? fallbackTitle}
      description={page?.seo.description ?? fallbackDescription}
      image={page?.seo.image ?? props.site.footer?.image}
      jsonLd={
        business
          ? [businessLd(props.seo.origin, name, props.site.footer?.image)]
          : undefined
      }
      mainClassName=""
    >
      {page ? (
        <>
          {!hasHeading(page) && page.title && (
            <header className="mx-auto max-w-6xl px-6 pt-16 pb-2 lg:pt-24">
              <h1
                dir="auto"
                className="font-display text-pine text-5xl leading-[1.05] text-balance sm:text-6xl"
              >
                {page.title}
              </h1>
            </header>
          )}
          <PageSections
            sections={page.sections}
            components={page.components}
            afterHero={afterHero}
          />
        </>
      ) : (
        <>
          <HeroBlock
            data={{
              heading: "Auto Atelier",
              subheading: t("Hand-Finished Auto Care"),
              button_label: t("Book your visit"),
              button_url: services().url,
              alignment: "center",
            }}
          />
          {afterHero}
        </>
      )}
    </SiteLayout>
  )
}
