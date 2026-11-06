import { useState } from "react"

import { StepCard } from "@/website/features/checkout/components/step-card"
import type { SlotDay } from "@/website/features/checkout/types"

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
      title="Date & time"
      description="When should we come?"
      error={error}
    >
      {!day ? (
        <p className="text-[#5B6B5E]">No times are available right now.</p>
      ) : (
        <>
          <div
            role="group"
            aria-label="Day"
            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2"
          >
            {days.map((d) => (
              <button
                key={d.date}
                type="button"
                aria-pressed={d.date === day.date}
                onClick={() => setDate(d.date)}
                className={`shrink-0 rounded-2xl border px-4 py-2.5 text-sm whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-[#8A6240] focus-visible:outline-none ${
                  d.date === day.date
                    ? "border-[#2B3A32] bg-[#2B3A32] text-[#F6F1E7]"
                    : "border-[#2B3A32]/15 bg-white/60 hover:bg-white"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div
            role="radiogroup"
            aria-label={`Times on ${day.label}`}
            className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4"
          >
            {day.slots.map((slot) => (
              <button
                key={slot.value}
                type="button"
                role="radio"
                aria-checked={slot.value === value}
                onClick={() => onChange(slot.value)}
                className={`rounded-xl border py-2.5 text-sm tabular-nums transition-colors focus-visible:ring-2 focus-visible:ring-[#8A6240] focus-visible:outline-none ${
                  slot.value === value
                    ? "border-[#2B3A32] bg-white font-medium"
                    : "border-[#2B3A32]/15 bg-white/60 hover:bg-white"
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </>
      )}
    </StepCard>
  )
}
