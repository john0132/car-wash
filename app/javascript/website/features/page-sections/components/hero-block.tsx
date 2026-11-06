import { Link } from "@inertiajs/react"

import { Button } from "@/shared/components/ui/button"
import { BrandMark } from "@/website/components/brand-mark"

export interface HeroData {
  heading: string
  subheading?: string
  button_label?: string
  button_url?: string
  image?: { url: string } | null
  alignment?: string
}

export function HeroBlock({ data }: { data: HeroData }) {
  const centered = data.alignment === "center"

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-[#F6F1E7] px-6 pt-20 pb-24 lg:pt-28 lg:pb-32"
    >
      <div
        className={
          centered
            ? "mx-auto max-w-3xl text-center"
            : "mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]"
        }
      >
        <div>
          <p className="text-xs font-medium tracking-[0.3em] text-[#8A6240] uppercase">
            Hand-Finished Auto Care
          </p>
          <h1
            style={{ fontFamily: "'Italiana', serif" }}
            className="mt-5 text-5xl leading-[1.1] text-[#2B3A32] sm:text-6xl lg:text-7xl"
          >
            {data.heading}
          </h1>
          {data.subheading && (
            <p
              className={`mt-6 text-lg leading-relaxed text-[#5B6B5E] ${centered ? "mx-auto max-w-xl" : "max-w-md"}`}
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
                className="rounded-full bg-[#2B3A32] px-8 text-base text-[#F6F1E7] hover:bg-[#1F2B25]"
              >
                <Link href={data.button_url}>{data.button_label}</Link>
              </Button>
            </div>
          )}
        </div>

        {!centered && (
          <div className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-[#A97C50]/30" />
            <div className="absolute inset-10 overflow-hidden rounded-full bg-white shadow-[0_30px_60px_-20px_rgba(43,58,50,0.25)]">
              {data.image && (
                <img
                  src={data.image.url}
                  alt=""
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
