import { Button } from "@/shared/components/ui/button"
import { SmartLink } from "@/website/components/smart-link"

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
          ? "bg-pine text-ivory px-6 py-20"
          : "text-pine bg-white px-6 py-20"
      }
    >
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        <div className="max-w-lg">
          <h2 dir="auto" className="font-display text-4xl sm:text-5xl">
            {data.heading}
          </h2>
          {data.text && (
            <p
              dir="auto"
              className={`mt-4 text-base leading-relaxed ${primary ? "text-mist" : "text-sage"}`}
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
              ? "bg-ivory text-pine shrink-0 rounded-full px-8 text-base hover:bg-white"
              : "bg-pine text-ivory hover:bg-pine-deep shrink-0 rounded-full px-8 text-base"
          }
        >
          <SmartLink href={data.button_url}>{data.button_label}</SmartLink>
        </Button>
      </div>
    </section>
  )
}
