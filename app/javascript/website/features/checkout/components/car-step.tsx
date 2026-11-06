import { Car, Plus } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { CarDialog } from "@/website/features/cars/components/car-dialog"
import { OptionCard } from "@/website/features/checkout/components/option-card"
import { StepCard } from "@/website/features/checkout/components/step-card"
import type { CheckoutCar } from "@/website/features/checkout/types"

/** Pick one of the customer's cars, or add one without leaving checkout. */
export function CarStep({
  step,
  cars,
  value,
  onChange,
  error,
}: {
  step: number
  cars: CheckoutCar[]
  value: number | null
  onChange: (carId: number) => void
  error?: string
}) {
  return (
    <StepCard
      step={step}
      title="Your car"
      description="Which car are we washing?"
      error={error}
    >
      {cars.length > 0 && (
        <div
          role="radiogroup"
          aria-label="Your cars"
          className="grid gap-3 sm:grid-cols-2"
        >
          {cars.map((car) => (
            <OptionCard
              key={car.id}
              name="car"
              checked={value === car.id}
              onSelect={() => onChange(car.id)}
            >
              <Car className="size-5 shrink-0 text-[#8A6240]" aria-hidden />
              <span className="min-w-0 text-[15px]">{car.description}</span>
            </OptionCard>
          ))}
        </div>
      )}

      <CarDialog
        trigger={
          <Button
            type="button"
            variant="outline"
            className="mt-3 rounded-full border-dashed border-[#2B3A32]/30 bg-transparent text-[#2B3A32] hover:bg-white hover:text-[#2B3A32] dark:border-[#2B3A32]/30 dark:bg-transparent dark:hover:bg-white"
          >
            <Plus aria-hidden />
            {cars.length === 0 ? "Add your car" : "Add another car"}
          </Button>
        }
      />
    </StepCard>
  )
}
