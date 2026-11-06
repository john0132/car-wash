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
import { useI18n } from "@/website/lib/i18n"

export function AddressCard({
  address,
  areas,
}: {
  address: CustomerAddress
  areas: AreaOption[]
}) {
  const { t } = useI18n()

  const remove = () => {
    router.delete(websiteProfileAddresses.destroy(address.id), {
      preserveScroll: true,
    })
  }

  const outline =
    "h-10 rounded-full border-pine/30 bg-transparent px-5 text-pine hover:bg-pine/5 hover:text-pine"

  return (
    <li className="border-pine/10 flex flex-wrap items-center justify-between gap-4 rounded-[20px] border bg-white/60 p-6">
      <div className="flex items-start gap-4">
        <MapPin
          className="text-pine/60 mt-1 size-5 shrink-0"
          aria-hidden="true"
        />
        <div>
          <p className="text-lg font-medium">{address.name}</p>
          <p className="text-sage text-sm">
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
              {t("Edit")}
            </Button>
          }
        />
        <ConfirmRemove
          title={t("Remove “{name}”?", { name: address.name })}
          description={t("This address will be removed from your account.")}
          onConfirm={remove}
          trigger={
            <Button
              type="button"
              variant="outline"
              className={`${outline} text-danger hover:text-danger`}
            >
              {t("Remove")}
            </Button>
          }
        />
      </div>
    </li>
  )
}
