import { serviceCategory } from "@/routes"
import { Breadcrumbs } from "@/website/components/breadcrumbs"
import { ImageOrMark } from "@/website/components/image-or-mark"
import { BookingPanel } from "@/website/features/service-detail/components/booking-panel"
import { RelatedServices } from "@/website/features/service-detail/components/related-services"
import type {
  ExtraOption,
  ExtrasPage,
  ServiceDetail,
} from "@/website/features/service-detail/types"
import {
  paragraphs,
  selectedExtrasKey,
} from "@/website/features/service-detail/utils"
import { useSessionState } from "@/website/hooks/use-session-state"
import SiteLayout from "@/website/layouts/site-layout"
import type { ServiceSummary } from "@/website/lib/types"

interface Props {
  service: ServiceDetail
  related: ServiceSummary[]
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
    <SiteLayout
      title={service.seo_title ?? name}
      description={service.seo_description ?? body[0]}
      mainClassName=""
    >
      <article className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 pt-10 pb-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:pt-16">
        <div className="min-w-0 lg:py-6">
          <Breadcrumbs
            items={[
              ...(service.category
                ? [
                    {
                      label: service.category,
                      href: serviceCategory(service.category_slug).url,
                    },
                  ]
                : []),
              { label: name },
            ]}
          />

          <h1 className="font-display mt-6 text-5xl leading-[1.05] text-balance sm:text-6xl lg:text-7xl">
            {heading}
          </h1>

          {service.title && service.title !== name && (
            <p className="text-bronze mt-4 text-lg">{name}</p>
          )}

          {body.length > 0 && (
            <div className="text-moss mt-10 max-w-prose space-y-5 text-lg leading-relaxed">
              {body.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="group border-bronze-light/30 bg-sand aspect-[4/5] overflow-hidden rounded-t-full border p-2.5">
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
    </SiteLayout>
  )
}
