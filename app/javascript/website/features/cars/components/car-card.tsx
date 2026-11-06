import { router } from "@inertiajs/react"
import { Car } from "lucide-react"

import { websiteProfileCars } from "@/routes"
import { Button } from "@/shared/components/ui/button"
import { ConfirmRemove } from "@/website/components/confirm-remove"
import { CarDialog } from "@/website/features/cars/components/car-dialog"
import type { CustomerCar } from "@/website/features/cars/types"

export function CarCard({ car }: { car: CustomerCar }) {
  const remove = () => {
    router.delete(websiteProfileCars.destroy(car.id), { preserveScroll: true })
  }

  const outline =
    "h-10 rounded-full border-pine/30 bg-transparent px-5 text-pine hover:bg-pine/5 hover:text-pine"

  return (
    <li className="border-pine/10 flex flex-wrap items-center justify-between gap-4 rounded-[20px] border bg-white/60 p-6">
      <div className="flex items-start gap-4">
        <Car className="text-pine/60 mt-1 size-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-lg font-medium">
            {car.make} {car.model}
          </p>
          <p className="text-sage text-sm">
            {car.color} · <span className="font-mono">{car.license_plate}</span>
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <CarDialog
          car={car}
          trigger={
            <Button type="button" variant="outline" className={outline}>
              Edit
            </Button>
          }
        />
        <ConfirmRemove
          title={`Remove ${car.make} ${car.model}?`}
          description="This car will be removed from your account. Past bookings keep their details."
          onConfirm={remove}
          trigger={
            <Button
              type="button"
              variant="outline"
              className={`${outline} text-danger hover:text-danger`}
            >
              Remove
            </Button>
          }
        />
      </div>
    </li>
  )
}
