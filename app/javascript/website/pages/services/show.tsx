import { Head, Link } from "@inertiajs/react"

import { root, serviceCategory } from "@/routes"
import { SiteFooter } from "@/website/components/site-footer"
import { SiteHeader } from "@/website/components/site-header"
import { ImageOrMark } from "@/website/features/home-catalog/components/image-or-mark"
import { BookingPanel } from "@/website/features/service-detail/components/booking-panel"
import { RelatedServices } from "@/website/features/service-detail/components/related-services"
import type {
  ExtraOption,
  ExtrasPage,
  RelatedService,
  ServiceDetail,
} from "@/website/features/service-detail/types"
import {
  paragraphs,
  selectedExtrasKey,
} from "@/website/features/service-detail/utils"
import { useSessionState } from "@/website/hooks/use-session-state"

interface Props {
  service: ServiceDetail
  related: RelatedService[]
  /** Only present after the extras drawer has been opened. */
  extras?: ExtrasPage
}

// Keyed by service so picked extras don't carry over when navigating to another one.
export default function ServiceShow(props: Props) {
  return <ServicePage key={props.service.id} {...props} />
}

const NO_EXTRAS: ExtraOption[] = []

function ServicePage({ service, related, extras }: Props) {
  // Kept for this tab, so a refresh or coming back keeps the picks.
  const [selectedExtras, setSelectedExtras] = useSessionState(
    selectedExtrasKey(service.slug),
    NO_EXTRAS,
  )
  const name = service.name ?? "Service"
  const heading = service.title ?? name
  const body = paragraphs(service.description)

  return (
    <>
      <Head title={service.seo_title ?? name}>
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
        {(service.seo_description ?? body[0]) && (
          <meta
            name="description"
            content={service.seo_description ?? body[0]}
          />
        )}
      </Head>

      <div
        style={{ fontFamily: "'Jost', system-ui, sans-serif" }}
        className="bg-[#F6F1E7] text-[#2B3A32]"
      >
        <SiteHeader />
        <main>
          <article className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 pt-10 pb-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:pt-16">
            <div className="min-w-0 lg:py-6">
              <nav aria-label="Breadcrumb" className="text-sm text-[#5B6B5E]">
                <ol className="flex flex-wrap items-center gap-2">
                  <li>
                    <Link href={root()} className="hover:text-[#2B3A32]">
                      Home
                    </Link>
                  </li>
                  {service.category && (
                    <>
                      <li aria-hidden>/</li>
                      <li>
                        <Link
                          href={serviceCategory(service.category_slug)}
                          className="hover:text-[#2B3A32]"
                        >
                          {service.category}
                        </Link>
                      </li>
                    </>
                  )}
                </ol>
              </nav>

              <h1
                style={{ fontFamily: "'Italiana', serif" }}
                className="mt-6 text-5xl leading-[1.05] text-balance sm:text-6xl lg:text-7xl"
              >
                {heading}
              </h1>

              {service.title && service.title !== name && (
                <p className="mt-4 text-lg text-[#8A6240]">{name}</p>
              )}

              {body.length > 0 && (
                <div className="mt-10 max-w-prose space-y-5 text-lg leading-relaxed text-[#3F4F45]">
                  {body.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="group aspect-[4/5] overflow-hidden rounded-t-full border border-[#A97C50]/30 bg-[#EFE7D6] p-2.5">
                <div className="h-full w-full overflow-hidden rounded-t-full">
                  <ImageOrMark image={service.image} priority />
                </div>
              </div>
              <BookingPanel
                service={service}
                extras={extras}
                selectedExtras={selectedExtras}
                onExtrasChange={setSelectedExtras}
              />
            </div>
          </article>

          <RelatedServices category={service.category} services={related} />
        </main>
        <SiteFooter />
      </div>
    </>
  )
}
