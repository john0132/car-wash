import type { ReactNode } from "react"

/** One numbered checkout section with an optional error line under it. */
export function StepCard({
  step,
  title,
  description,
  error,
  children,
}: {
  step: number
  title: string
  description?: string
  error?: string
  children: ReactNode
}) {
  const headingId = `checkout-step-${step}`

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-3xl border border-[#2B3A32]/10 bg-white/70 p-6 sm:p-7"
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#2B3A32] text-sm font-medium text-[#F6F1E7]"
        >
          {step}
        </span>
        <div>
          <h2
            id={headingId}
            style={{ fontFamily: "'Italiana', serif" }}
            className="text-2xl leading-tight"
          >
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-[#5B6B5E]">{description}</p>
          )}
        </div>
      </div>

      <div className="mt-5">{children}</div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-[#B3261E]">
          {error}
        </p>
      )}
    </section>
  )
}
