import { Form } from "@inertiajs/react"
import { LocateFixed } from "lucide-react"
import type { ReactNode } from "react"
import { useState } from "react"

import { websiteProfileAddresses } from "@/routes"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Spinner } from "@/shared/components/ui/spinner"
import {
  brandButton,
  brandInput,
  brandOutlineButton,
  brandSelect,
} from "@/website/components/brand"
import type {
  AreaOption,
  CustomerAddress,
} from "@/website/features/addresses/types"
import { LocationPicker } from "@/website/features/locations/components/location-picker"
import { useGeolocation } from "@/website/hooks/use-geolocation"
import type { Coordinates } from "@/website/hooks/use-geolocation"
import { useI18n } from "@/website/lib/i18n"

const toErrors = (messages?: string[]) =>
  messages?.map((message) => ({ message }))

interface Props {
  trigger: ReactNode
  areas: AreaOption[]
  /** Present when editing; absent when adding. */
  address?: CustomerAddress
}

export function AddressDialog({ trigger, areas, address }: Props) {
  const { t } = useI18n()

  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({
    latitude: address ? String(address.latitude) : "",
    longitude: address ? String(address.longitude) : "",
  })
  // The map pin and the typed fallback fields are two views of the same two numbers.
  const setPin = (c: Coordinates) =>
    setCoords({
      latitude: c.latitude.toFixed(6),
      longitude: c.longitude.toFixed(6),
    })
  const latitude = Number.parseFloat(coords.latitude)
  const longitude = Number.parseFloat(coords.longitude)
  const pin =
    Number.isFinite(latitude) && Number.isFinite(longitude)
      ? { latitude, longitude }
      : null
  const { locate, locating, error } = useGeolocation(setPin)

  const action = address
    ? websiteProfileAddresses.update(address.id)
    : websiteProfileAddresses.create()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogTitle>
          {address ? t("Edit address") : t("Add an address")}
        </DialogTitle>
        <DialogDescription>
          {t("Where should we come to? Pick your area and pin the location.")}
        </DialogDescription>
        <Form
          action={action}
          options={{ preserveScroll: true }}
          onSuccess={() => setOpen(false)}
          className="space-y-5"
        >
          {({ errors, processing }) => (
            <>
              <Field>
                <FieldLabel htmlFor="address_name">{t("Label")}</FieldLabel>
                <Input
                  className={brandInput}
                  id="address_name"
                  name="name"
                  defaultValue={address?.name}
                  placeholder={t("Home, Work…")}
                  required
                />
                <FieldError errors={toErrors(errors.name)} />
              </Field>

              <Field>
                <FieldLabel htmlFor="address_area">{t("Area")}</FieldLabel>
                <Select
                  name="area_id"
                  defaultValue={address ? String(address.area_id) : undefined}
                  required
                  // With no pin yet, picking an area puts one inside it.
                  onValueChange={(id) => {
                    const area = areas.find((a) => String(a.id) === id)
                    if (
                      !pin &&
                      area?.latitude != null &&
                      area.longitude != null
                    )
                      setPin({
                        latitude: area.latitude,
                        longitude: area.longitude,
                      })
                  }}
                >
                  <SelectTrigger id="address_area" className={brandSelect}>
                    <SelectValue placeholder={t("Choose an area")} />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((area) => (
                      <SelectItem key={area.id} value={String(area.id)}>
                        {area.city ? `${area.city} — ` : ""}
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={toErrors(errors.area ?? errors.area_id)} />
              </Field>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">{t("Location")}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={brandOutlineButton}
                    onClick={locate}
                    disabled={locating}
                  >
                    {locating ? <Spinner /> : <LocateFixed />}
                    {t("Use my current location")}
                  </Button>
                </div>
                {error && (
                  <p role="alert" className="text-danger text-sm">
                    {error}
                  </p>
                )}
                <LocationPicker position={pin} onChange={setPin} />
                <FieldError errors={toErrors(errors.latitude)} />

                {/* The pin fills these in; typing is the fallback. */}
                <details className="text-sm">
                  <summary className="text-sage hover:text-pine cursor-pointer">
                    {t("Enter coordinates instead")}
                  </summary>
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="address_latitude">
                        {t("Latitude")}
                      </FieldLabel>
                      <Input
                        className={brandInput}
                        id="address_latitude"
                        name="latitude"
                        inputMode="decimal"
                        dir="ltr"
                        value={coords.latitude}
                        onChange={(e) =>
                          setCoords((c) => ({ ...c, latitude: e.target.value }))
                        }
                        placeholder="30.0444"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="address_longitude">
                        {t("Longitude")}
                      </FieldLabel>
                      <Input
                        className={brandInput}
                        id="address_longitude"
                        name="longitude"
                        inputMode="decimal"
                        dir="ltr"
                        value={coords.longitude}
                        onChange={(e) =>
                          setCoords((c) => ({
                            ...c,
                            longitude: e.target.value,
                          }))
                        }
                        placeholder="31.2357"
                      />
                    </Field>
                  </div>
                </details>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={brandOutlineButton}
                  >
                    {t("Cancel")}
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  className={brandButton}
                  disabled={processing}
                >
                  {processing && <Spinner />}
                  {address ? t("Save address") : t("Add address")}
                </Button>
              </DialogFooter>
            </>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  )
}
