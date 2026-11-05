import { Head, Link } from "@inertiajs/react"
import {
  CalendarClock,
  CircleCheck,
  ClipboardList,
  Pencil,
  Percent,
  Wallet,
} from "lucide-react"

import { PageHeader } from "@/admin/components/page-header"
import { Pagination } from "@/admin/components/pagination"
import { StatCard } from "@/admin/components/stat-card"
import { BookingStatusFilter } from "@/admin/features/bookings/components/booking-status-filter"
import { BookingsTable } from "@/admin/features/bookings/components/bookings-table"
import type { BookingRow, BookingStatus } from "@/admin/features/bookings/types"
import type { EmployeeStats } from "@/admin/features/employees/types"
import {
  AccountCard,
  Detail,
} from "@/admin/features/users/components/account-card"
import { ActivationSwitch } from "@/admin/features/users/components/activation-switch"
import { DeleteUserDialog } from "@/admin/features/users/components/delete-user-dialog"
import type { ManagedUser } from "@/admin/features/users/types"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import { formatDateTime, formatMoney, formatNumber } from "@/admin/lib/format"
import type { Pagination as PaginationData } from "@/admin/types"
import { adminEmployees } from "@/routes"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"

interface Props {
  employee: ManagedUser & { last_seen_at: string | null }
  stats: EmployeeStats
  bookings: BookingRow[]
  bookings_pagination: PaginationData
  booking_status: BookingStatus | null
}

export default function EmployeeShow({
  employee,
  stats,
  bookings,
  bookings_pagination,
  booking_status,
}: Props) {
  const can = useCan()

  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Employees", href: adminEmployees.index().url },
        {
          title: employee.full_name,
          href: adminEmployees.show(employee.id).url,
        },
      ]}
    >
      <Head title={employee.full_name} />

      <div className="space-y-6 p-4">
        <PageHeader
          title={employee.full_name}
          description={`Employee #${employee.id}`}
          actions={
            <>
              {can("employees", "update") && (
                <Button variant="outline" asChild>
                  <Link href={adminEmployees.edit(employee.id)}>
                    <Pencil /> Edit
                  </Link>
                </Button>
              )}
              {can("employees", "delete") && (
                <DeleteUserDialog
                  name={employee.full_name}
                  action={adminEmployees.destroy(employee.id)}
                />
              )}
            </>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Bookings done"
            icon={CircleCheck}
            value={formatNumber(stats.completed_count)}
            hint={`of ${formatNumber(stats.assigned_count)} assigned`}
          />
          <StatCard
            label="Open bookings"
            icon={ClipboardList}
            value={formatNumber(stats.open_count)}
            hint="Pending, confirmed or in progress"
          />
          <StatCard
            label="Completion rate"
            icon={Percent}
            value={
              stats.completion_rate === null ? "—" : `${stats.completion_rate}%`
            }
            hint="Completed vs. cancelled"
          />
          <StatCard
            label="Revenue delivered"
            icon={Wallet}
            value={formatMoney(stats.completed_revenue)}
            hint="Total of completed bookings"
          />
          <StatCard
            label="Next booking"
            icon={CalendarClock}
            value={
              <span className="text-base">
                {formatDateTime(stats.next_booking_at)}
              </span>
            }
          />
        </div>

        <AccountCard
          user={employee}
          lastSeenAt={employee.last_seen_at}
          activation={
            <ActivationSwitch
              active={employee.is_active}
              name={employee.full_name}
              action={adminEmployees.activation(employee.id)}
              disabled={!can("employees", "update")}
            />
          }
        >
          <Detail label="Total assigned">
            {formatNumber(stats.assigned_count)} bookings
          </Detail>
        </AccountCard>

        <Card>
          <CardHeader>
            <CardTitle>Assigned bookings</CardTitle>
            <CardDescription>
              Pick a status to filter. Newest first.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <BookingStatusFilter
              url={adminEmployees.show(employee.id).url}
              counts={stats.by_status}
              value={booking_status}
            />
            <BookingsTable
              bookings={bookings}
              party="customer"
              emptyMessage={
                booking_status
                  ? "No bookings with this status."
                  : "No bookings assigned yet."
              }
            />
            <Pagination pagination={bookings_pagination} noun="bookings" />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
