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
import type {
  AreaOption,
  CustomerAddress,
} from "@/website/features/addresses/types"

const toErrors = (messages?: string[]) =>
  messages?.map((message) => ({ message }))

interface Props {
  trigger: ReactNode
  areas: AreaOption[]
  /** Present when editing; absent when adding. */
  address?: CustomerAddress
}

export function AddressDialog({ trigger, areas, address }: Props) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({
    latitude: address ? String(address.latitude) : "",
    longitude: address ? String(address.longitude) : "",
  })
  const [locating, setLocating] = useState(false)

  const useMyLocation = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords: c }) => {
        setCoords({
          latitude: c.latitude.toFixed(6),
          longitude: c.longitude.toFixed(6),
        })
        setLocating(false)
      },
      () => setLocating(false),
    )
  }

  const action = address
    ? websiteProfileAddresses.update(address.id)
    : websiteProfileAddresses.create()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogTitle>{address ? "Edit address" : "Add an address"}</DialogTitle>
        <DialogDescription>
          Where should we come to? Pick your area and pin the location.
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
                <FieldLabel htmlFor="address_name">Label</FieldLabel>
                <Input
                  id="address_name"
                  name="name"
                  defaultValue={address?.name}
                  placeholder="Home, Work…"
                  required
                />
                <FieldError errors={toErrors(errors.name)} />
              </Field>

              <Field>
                <FieldLabel htmlFor="address_area">Area</FieldLabel>
                <Select
                  name="area_id"
                  defaultValue={address ? String(address.area_id) : undefined}
                  required
                >
                  <SelectTrigger id="address_area" className="w-full">
                    <SelectValue placeholder="Choose an area" />
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

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="address_latitude">Latitude</FieldLabel>
                  <Input
                    id="address_latitude"
                    name="latitude"
                    inputMode="decimal"
                    value={coords.latitude}
                    onChange={(e) =>
                      setCoords((c) => ({ ...c, latitude: e.target.value }))
                    }
                    placeholder="30.0444"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="address_longitude">Longitude</FieldLabel>
                  <Input
                    id="address_longitude"
                    name="longitude"
                    inputMode="decimal"
                    value={coords.longitude}
                    onChange={(e) =>
                      setCoords((c) => ({ ...c, longitude: e.target.value }))
                    }
                    placeholder="31.2357"
                    required
                  />
                </Field>
                <div className="col-span-2 -mt-2">
                  <FieldError errors={toErrors(errors.latitude)} />
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={useMyLocation}
                disabled={locating}
              >
                {locating ? <Spinner /> : <LocateFixed />}
                Use my current location
              </Button>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={processing}>
                  {processing && <Spinner />}
                  {address ? "Save address" : "Add address"}
                </Button>
              </DialogFooter>
            </>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  )
}
