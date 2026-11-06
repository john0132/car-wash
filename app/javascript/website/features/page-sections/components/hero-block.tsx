import { Button } from "@/shared/components/ui/button"
import { BrandMark } from "@/website/components/brand-mark"
import { SmartLink } from "@/website/components/smart-link"
import { useI18n } from "@/website/lib/i18n"

export interface HeroData {
  heading: string
  subheading?: string
  button_label?: string
  button_url?: string
  image?: { url: string } | null
  alignment?: string
}

export function HeroBlock({ data }: { data: HeroData }) {
  const { t } = useI18n()

  const centered = data.alignment === "center"

  return (
    <section
      id="top"
      className="bg-ivory relative overflow-hidden px-6 pt-20 pb-24 lg:pt-28 lg:pb-32"
    >
      <div
        className={
          centered
            ? "mx-auto max-w-3xl text-center"
            : "mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]"
        }
      >
        <div>
          <p
            dir="auto"
            className="text-bronze text-xs font-medium tracking-[0.3em] uppercase"
          >
            {t("Hand-Finished Auto Care")}
          </p>
          <h1
            dir="auto"
            className="font-display text-pine mt-5 text-5xl leading-[1.1] sm:text-6xl lg:text-7xl"
          >
            {data.heading}
          </h1>
          {data.subheading && (
            <p
              dir="auto"
              className={`text-sage mt-6 text-lg leading-relaxed ${centered ? "mx-auto max-w-xl" : "max-w-md"}`}
            >
              {data.subheading}
            </p>
          )}
          {data.button_label && data.button_url && (
            <div
              className={`mt-9 flex flex-wrap items-center gap-6 ${centered ? "justify-center" : ""}`}
            >
              <Button
                asChild
                size="lg"
                className="bg-pine text-ivory hover:bg-pine-deep rounded-full px-8 text-base"
              >
                <SmartLink href={data.button_url}>
                  {data.button_label}
                </SmartLink>
              </Button>
            </div>
          )}
        </div>

        {!centered && (
          <div className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center">
            <div className="border-bronze-light/30 absolute inset-0 rounded-full border" />
            <div className="absolute inset-10 overflow-hidden rounded-full bg-white shadow-[0_30px_60px_-20px_rgba(43,58,50,0.25)]">
              {data.image && (
                <img
                  src={data.image.url}
                  alt=""
                  fetchPriority="high"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            {!data.image && <BrandMark className="relative h-28 w-28" />}
          </div>
        )}
      </div>
    </section>
  )
}
