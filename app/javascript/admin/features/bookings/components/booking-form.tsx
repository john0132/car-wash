import { useForm } from "@inertiajs/react"

import {
  FormSection,
  SelectField,
  TextField,
} from "@/admin/components/form-fields"
import { FormLayout } from "@/admin/components/form-layout"
import {
  BOOKING_STATUSES,
  type BookingDetail,
  type EmployeeOption,
  PAYMENT_STATUSES,
} from "@/admin/features/bookings/types"
import { humanize } from "@/admin/lib/format"
import { SUBMIT_OPTIONS, formErrors } from "@/admin/lib/forms"
import type { RouteDefinition } from "@/routes/runtime"

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
  const { data, setData, processing } = form
  const errors = formErrors(form)

  form.transform(({ employee_id, ...values }) => ({
    booking: {
      ...values,
      employee_id: employee_id === UNASSIGNED ? null : employee_id,
    },
  }))

  return (
    <FormLayout
      onSubmit={() => form.submit(action, SUBMIT_OPTIONS)}
      cancelHref={cancelHref}
      submitLabel="Save changes"
      processing={processing}
    >
      <FormSection title="Booking">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="status"
            label="Status"
            value={data.status}
            onChange={(value) => setData("status", value)}
            options={BOOKING_STATUSES.map((status) => ({
              value: status,
              label: humanize(status),
            }))}
            errors={errors.status}
          />
          <SelectField
            id="payment_status"
            label="Payment status"
            value={data.payment_status}
            onChange={(value) => setData("payment_status", value)}
            options={PAYMENT_STATUSES.map((status) => ({
              value: status,
              label: humanize(status),
            }))}
            errors={errors.payment_status}
          />
          <SelectField
            id="employee_id"
            label="Assigned employee"
            value={data.employee_id}
            onChange={(value) => setData("employee_id", value)}
            options={[
              { value: UNASSIGNED, label: "Unassigned" },
              ...employeeOptions.map((employee) => ({
                value: String(employee.id),
                label: employee.full_name,
              })),
            ]}
            errors={errors.employee_id}
          />
          <TextField
            id="scheduled_at"
            label="Scheduled for"
            type="datetime-local"
            value={data.scheduled_at}
            onChange={(value) => setData("scheduled_at", value)}
            errors={errors.scheduled_at}
          />
        </div>
      </FormSection>
    </FormLayout>
  )
}
