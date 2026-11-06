import type { ReactNode } from "react"

/** One numbered checkout section with an optional error line under it. */
export function StepCard({
  step,
  title,
  description,
  error,
  field,
  children,
}: {
  step: number
  title: string
  description?: string
  error?: string
  /** The server error key this step reports on, so a failed submit can focus it. */
  field?: string
  children: ReactNode
}) {
  const headingId = `checkout-step-${step}`

  return (
    <section
      aria-labelledby={headingId}
      data-error-field={field}
      className="border-pine/10 rounded-3xl border bg-white/70 p-6 sm:p-7"
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden
          className="bg-pine text-ivory flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium"
        >
          {step}
        </span>
        <div>
          <h2
            id={headingId}
            tabIndex={-1}
            className="font-display text-2xl leading-tight focus:outline-none"
          >
            {title}
          </h2>
          {description && (
            <p className="text-sage mt-1 text-sm">{description}</p>
          )}
        </div>
      </div>

      <div className="mt-5">{children}</div>

      {error && (
        <p role="alert" className="text-danger mt-3 text-sm">
          {error}
        </p>
      )}
    </section>
  )
}
