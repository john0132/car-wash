import { Form } from "@inertiajs/react"
import type { ReactNode } from "react"
import { useState } from "react"

import { websiteProfileCars } from "@/routes"
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
import { Spinner } from "@/shared/components/ui/spinner"
import type { CustomerCar } from "@/website/features/cars/types"

const toErrors = (messages?: string[]) =>
  messages?.map((message) => ({ message }))

interface Props {
  trigger: ReactNode
  /** Present when editing; absent when adding. */
  car?: CustomerCar
}

export function CarDialog({ trigger, car }: Props) {
  const [open, setOpen] = useState(false)

  const action = car
    ? websiteProfileCars.update(car.id)
    : websiteProfileCars.create()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogTitle>{car ? "Edit car" : "Add a car"}</DialogTitle>
        <DialogDescription>
          Tell us about the car you book services for.
        </DialogDescription>
        <Form
          action={action}
          options={{ preserveScroll: true }}
          onSuccess={() => setOpen(false)}
          className="space-y-5"
        >
          {({ errors, processing }) => (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="car_make">Make</FieldLabel>
                  <Input
                    id="car_make"
                    name="make"
                    defaultValue={car?.make}
                    placeholder="Toyota"
                    required
                  />
                  <FieldError errors={toErrors(errors.make)} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="car_model">Model</FieldLabel>
                  <Input
                    id="car_model"
                    name="model"
                    defaultValue={car?.model}
                    placeholder="Corolla"
                    required
                  />
                  <FieldError errors={toErrors(errors.model)} />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="car_license_plate">
                  License plate
                </FieldLabel>
                <Input
                  id="car_license_plate"
                  name="license_plate"
                  defaultValue={car?.license_plate}
                  placeholder="ABC 1234"
                  required
                />
                <FieldError errors={toErrors(errors.license_plate)} />
              </Field>

              <Field>
                <FieldLabel htmlFor="car_color">Color</FieldLabel>
                <Input
                  id="car_color"
                  name="color"
                  defaultValue={car?.color}
                  placeholder="White"
                  required
                />
                <FieldError errors={toErrors(errors.color)} />
              </Field>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={processing}>
                  {processing && <Spinner />}
                  {car ? "Save car" : "Add car"}
                </Button>
              </DialogFooter>
            </>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  )
}
