import { router } from "@inertiajs/react"
import { MapPin } from "lucide-react"

import { websiteProfileAddresses } from "@/routes"
import { Button } from "@/shared/components/ui/button"
import { ConfirmRemove } from "@/website/components/confirm-remove"
import { AddressDialog } from "@/website/features/addresses/components/address-dialog"
import type {
  AreaOption,
  CustomerAddress,
} from "@/website/features/addresses/types"

export function AddressCard({
  address,
  areas,
}: {
  address: CustomerAddress
  areas: AreaOption[]
}) {
  const remove = () => {
    router.delete(websiteProfileAddresses.destroy(address.id), {
      preserveScroll: true,
    })
  }

  const outline =
    "h-10 rounded-full border-[#2B3A32]/30 bg-transparent px-5 text-[#2B3A32] hover:bg-[#2B3A32]/5 hover:text-[#2B3A32]"

  return (
    <li className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-[#2B3A32]/10 bg-white/60 p-6">
      <div className="flex items-start gap-4">
        <MapPin
          className="mt-1 size-5 shrink-0 text-[#2B3A32]/60"
          aria-hidden="true"
        />
        <div>
          <p className="text-lg font-medium">{address.name}</p>
          <p className="text-sm text-[#5B6B5E]">
            {[address.area, address.city].filter(Boolean).join(", ")}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <AddressDialog
          address={address}
          areas={areas}
          trigger={
            <Button type="button" variant="outline" className={outline}>
              Edit
            </Button>
          }
        />
        <ConfirmRemove
          title={`Remove "${address.name}"?`}
          description="This address will be removed from your account."
          onConfirm={remove}
          trigger={
            <Button
              type="button"
              variant="outline"
              className={`${outline} text-[#B3261E] hover:text-[#B3261E]`}
            >
              Remove
            </Button>
          }
        />
      </div>
    </li>
  )
}
