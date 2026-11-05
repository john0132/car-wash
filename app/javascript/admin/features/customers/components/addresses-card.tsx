import { ExternalLink, MapPin } from "lucide-react"

import type { CustomerAddress } from "@/admin/features/customers/types"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"

export function AddressesCard({ addresses }: { addresses: CustomerAddress[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Addresses</CardTitle>
      </CardHeader>
      <CardContent>
        {addresses.length === 0 ? (
          <p className="text-muted-foreground text-sm">No saved addresses.</p>
        ) : (
          <ul className="divide-y">
            {addresses.map((address) => (
              <li
                key={address.id}
                className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
              >
                <MapPin className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <div className="min-w-0 flex-1 text-sm">
                  <div className="font-medium">{address.name}</div>
                  <div className="text-muted-foreground">
                    {[address.area, address.city].filter(Boolean).join(", ")}
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${address.latitude},${address.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
                >
                  Map <ExternalLink className="size-3" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
