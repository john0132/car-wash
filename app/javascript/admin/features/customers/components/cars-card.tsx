import { Car } from "lucide-react"

import type { CustomerCar } from "@/admin/features/customers/types"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"

export function CarsCard({ cars }: { cars: CustomerCar[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cars</CardTitle>
      </CardHeader>
      <CardContent>
        {cars.length === 0 ? (
          <p className="text-muted-foreground text-sm">No saved cars.</p>
        ) : (
          <ul className="divide-y">
            {cars.map((car) => (
              <li
                key={car.id}
                className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
              >
                <Car className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <div className="min-w-0 flex-1 text-sm">
                  <div className="font-medium">
                    {car.make} {car.model}
                  </div>
                  <div className="text-muted-foreground">{car.color}</div>
                </div>
                <span className="font-mono text-xs">{car.license_plate}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
