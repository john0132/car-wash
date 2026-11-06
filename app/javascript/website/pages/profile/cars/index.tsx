import { Plus } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { brandButton } from "@/website/components/brand"
import { CarCard } from "@/website/features/cars/components/car-card"
import { CarDialog } from "@/website/features/cars/components/car-dialog"
import type { CustomerCar } from "@/website/features/cars/types"
import { SectionHeading } from "@/website/features/profile/components/profile-card"
import ProfileLayout from "@/website/layouts/profile-layout"
import { useI18n } from "@/website/lib/i18n"

interface Props {
  cars: CustomerCar[]
}

export default function CarsIndex({ cars }: Props) {
  const { t } = useI18n()

  return (
    <ProfileLayout title={t("My cars")}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          title={t("My cars")}
          description={t("The cars you book services for.")}
        />
        <CarDialog
          trigger={
            <Button type="button" className={brandButton}>
              <Plus />
              {t("Add car")}
            </Button>
          }
        />
      </div>

      {cars.length === 0 ? (
        <div className="border-pine/25 rounded-2xl border border-dashed px-6 py-14 text-center">
          <p className="font-medium">{t("No cars yet")}</p>
          <p className="text-sage mt-1 text-sm">
            {t("Add your car to make booking quicker.")}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </ul>
      )}
    </ProfileLayout>
  )
}
