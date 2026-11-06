import { Car, Plus } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { CarDialog } from "@/website/features/cars/components/car-dialog"
import { OptionCard } from "@/website/features/checkout/components/option-card"
import { StepCard } from "@/website/features/checkout/components/step-card"
import type { CheckoutCar } from "@/website/features/checkout/types"
import { useI18n } from "@/website/lib/i18n"

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
  const { t } = useI18n()

  return (
    <StepCard
      field="car_id"
      step={step}
      title={t("Your car")}
      description={t("Which car are we washing?")}
      error={error}
    >
      {cars.length > 0 && (
        <div
          role="radiogroup"
          aria-label={t("Your cars")}
          className="grid gap-3 sm:grid-cols-2"
        >
          {cars.map((car) => (
            <OptionCard
              key={car.id}
              name="car"
              checked={value === car.id}
              onSelect={() => onChange(car.id)}
            >
              <Car className="text-bronze size-5 shrink-0" aria-hidden />
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
            className="border-pine/30 text-pine hover:text-pine mt-3 rounded-full border-dashed bg-transparent hover:bg-white"
          >
            <Plus aria-hidden />
            {cars.length === 0 ? t("Add your car") : t("Add another car")}
          </Button>
        }
      />
    </StepCard>
  )
}
