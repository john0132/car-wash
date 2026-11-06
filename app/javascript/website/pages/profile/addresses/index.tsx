import { Plus } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { AddressCard } from "@/website/features/addresses/components/address-card"
import { AddressDialog } from "@/website/features/addresses/components/address-dialog"
import type {
  AreaOption,
  CustomerAddress,
} from "@/website/features/addresses/types"
import {
  SectionHeading,
  primaryButtonClass,
} from "@/website/features/profile/components/profile-card"
import ProfileLayout from "@/website/layouts/profile-layout"

interface Props {
  addresses: CustomerAddress[]
  areas: AreaOption[]
}

export default function AddressesIndex({ addresses, areas }: Props) {
  return (
    <ProfileLayout title="My addresses">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          title="My addresses"
          description="The places we come to."
        />
        <AddressDialog
          areas={areas}
          trigger={
            <Button type="button" className={primaryButtonClass}>
              <Plus />
              Add address
            </Button>
          }
        />
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#2B3A32]/25 px-6 py-14 text-center">
          <p className="font-medium">No addresses yet</p>
          <p className="mt-1 text-sm text-[#5B6B5E]">
            Add one to book a visit at your door.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {addresses.map((address) => (
            <AddressCard key={address.id} address={address} areas={areas} />
          ))}
        </ul>
      )}
    </ProfileLayout>
  )
}
