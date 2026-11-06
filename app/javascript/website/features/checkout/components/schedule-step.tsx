import { useState } from "react"

import { OptionCard } from "@/website/features/checkout/components/option-card"
import { StepCard } from "@/website/features/checkout/components/step-card"
import type { SlotDay } from "@/website/features/checkout/types"
import { useI18n } from "@/website/lib/i18n"

/** A row of days, then that day's hourly slots. The value is the slot's ISO time. */
export function ScheduleStep({
  step,
  days,
  value,
  onChange,
  error,
}: {
  step: number
  days: SlotDay[]
  value: string
  onChange: (slot: string) => void
  error?: string
}) {
  const { t } = useI18n()

  const chosenDay = days.find((day) =>
    day.slots.some((slot) => slot.value === value),
  )
  // Until the customer browses days, show the chosen slot's day (or the first).
  const [browsedDate, setDate] = useState<string | null>(null)
  const date = browsedDate ?? chosenDay?.date
  const day = days.find((d) => d.date === date) ?? days[0]

  return (
    <StepCard
      step={step}
      title={t("Date & time")}
      description={t("When should we come?")}
      error={error}
    >
      {!day ? (
        <p className="text-sage">{t("No times are available right now.")}</p>
      ) : (
        <>
          <div
            role="group"
            aria-label={t("Day")}
            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2"
          >
            {days.map((d) => (
              <button
                key={d.date}
                type="button"
                aria-pressed={d.date === day.date}
                onClick={() => setDate(d.date)}
                className={`focus-visible:ring-bronze shrink-0 rounded-2xl border px-4 py-2.5 text-sm whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                  d.date === day.date
                    ? "border-pine bg-pine text-ivory"
                    : "border-pine/15 bg-white/60 hover:bg-white"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div
            role="radiogroup"
            aria-label={t("Times on {day}", { day: day.label })}
            className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4"
          >
            {day.slots.map((slot) => (
              <OptionCard
                key={slot.value}
                name="scheduled_at"
                checked={slot.value === value}
                onSelect={() => onChange(slot.value)}
                className="justify-center rounded-xl p-0 py-2.5 text-sm tabular-nums"
              >
                {slot.label}
              </OptionCard>
            ))}
          </div>
        </>
      )}
    </StepCard>
  )
}
