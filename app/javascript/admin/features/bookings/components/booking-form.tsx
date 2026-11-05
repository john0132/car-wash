import { Link, useForm } from "@inertiajs/react"

import {
  BOOKING_STATUSES,
  type BookingDetail,
  type EmployeeOption,
  PAYMENT_STATUSES,
} from "@/admin/features/bookings/types"
import { humanize } from "@/admin/lib/format"
import type { RouteDefinition } from "@/routes/runtime"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
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

const UNASSIGNED = "unassigned"

/** ISO datetime -> value a <input type="datetime-local"> accepts. */
const toLocalInput = (value: string | null) => {
  if (!value) return ""
  const date = new Date(value)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

interface BookingFormData {
  status: string
  payment_status: string
  employee_id: string
  scheduled_at: string
}

/**
 * Edits only status, payment status, employee assignment and schedule.
 * The items, address and amounts the customer entered aren't editable here.
 */
export function BookingForm({
  booking,
  employeeOptions,
  action,
  cancelHref,
}: {
  booking: BookingDetail
  employeeOptions: EmployeeOption[]
  action: RouteDefinition<"patch">
  cancelHref: string
}) {
  const form = useForm<BookingFormData>({
    status: booking.status,
    payment_status: booking.payment_status,
    employee_id: booking.employee ? String(booking.employee.id) : UNASSIGNED,
    scheduled_at: toLocalInput(booking.scheduled_at),
  })
  const { data, setData, errors, processing } = form
  const fieldErrors = errors as Record<string, string[] | undefined>

  form.transform(({ employee_id, ...values }) => ({
    booking: {
      ...values,
      employee_id: employee_id === UNASSIGNED ? null : employee_id,
    },
  }))

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        form.submit(action, { preserveScroll: true })
      }}
      className="max-w-2xl space-y-6"
    >
      <Card>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={fieldErrors.status ? true : undefined}>
              <FieldLabel htmlFor="status">Status</FieldLabel>
              <Select
                value={data.status}
                onValueChange={(value) => setData("status", value)}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BOOKING_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {humanize(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError
                errors={fieldErrors.status?.map((message) => ({ message }))}
              />
            </Field>

            <Field data-invalid={fieldErrors.payment_status ? true : undefined}>
              <FieldLabel htmlFor="payment_status">Payment status</FieldLabel>
              <Select
                value={data.payment_status}
                onValueChange={(value) => setData("payment_status", value)}
              >
                <SelectTrigger id="payment_status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {humanize(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError
                errors={fieldErrors.payment_status?.map((message) => ({
                  message,
                }))}
              />
            </Field>

            <Field data-invalid={fieldErrors.employee_id ? true : undefined}>
              <FieldLabel htmlFor="employee_id">Assigned employee</FieldLabel>
              <Select
                value={data.employee_id}
                onValueChange={(value) => setData("employee_id", value)}
              >
                <SelectTrigger id="employee_id" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                  {employeeOptions.map((employee) => (
                    <SelectItem key={employee.id} value={String(employee.id)}>
                      {employee.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError
                errors={fieldErrors.employee_id?.map((message) => ({
                  message,
                }))}
              />
            </Field>

            <Field data-invalid={fieldErrors.scheduled_at ? true : undefined}>
              <FieldLabel htmlFor="scheduled_at">Scheduled for</FieldLabel>
              <Input
                id="scheduled_at"
                type="datetime-local"
                value={data.scheduled_at}
                onChange={(event) =>
                  setData("scheduled_at", event.target.value)
                }
                aria-invalid={fieldErrors.scheduled_at ? true : undefined}
              />
              <FieldError
                errors={fieldErrors.scheduled_at?.map((message) => ({
                  message,
                }))}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={processing}>
          {processing && <Spinner />}
          Save changes
        </Button>
        <Button variant="ghost" asChild>
          <Link href={cancelHref}>Cancel</Link>
        </Button>
      </div>
    </form>
  )
}
