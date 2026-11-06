import { Link } from "@inertiajs/react"

import { Button } from "@/shared/components/ui/button"

export interface CtaData {
  heading: string
  text?: string
  button_label: string
  button_url: string
  variant?: string
}

export function CtaBlock({ data, id }: { data: CtaData; id?: string }) {
  const primary = data.variant !== "muted"

  return (
    <section
      id={id}
      className={
        primary
          ? "bg-[#2B3A32] px-6 py-20 text-[#F6F1E7]"
          : "bg-white px-6 py-20 text-[#2B3A32]"
      }
    >
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        <div className="max-w-lg">
          <h2
            style={{ fontFamily: "'Italiana', serif" }}
            className="text-4xl sm:text-5xl"
          >
            {data.heading}
          </h2>
          {data.text && (
            <p
              className={`mt-4 text-base leading-relaxed ${primary ? "text-[#E3E6DC]" : "text-[#5B6B5E]"}`}
            >
              {data.text}
            </p>
          )}
        </div>
        <Button
          asChild
          size="lg"
          className={
            primary
              ? "shrink-0 rounded-full bg-[#F6F1E7] px-8 text-base text-[#2B3A32] hover:bg-white"
              : "shrink-0 rounded-full bg-[#2B3A32] px-8 text-base text-[#F6F1E7] hover:bg-[#1F2B25]"
          }
        >
          <Link href={data.button_url}>{data.button_label}</Link>
        </Button>
      </div>
    </section>
  )
}
