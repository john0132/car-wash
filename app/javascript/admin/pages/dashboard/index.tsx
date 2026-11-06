import { Head } from "@inertiajs/react"
import {
  CalendarClock,
  CalendarPlus,
  CircleCheck,
  ClipboardList,
  Percent,
  UserPlus,
  Wallet,
} from "lucide-react"

import { PageHeader } from "@/admin/components/page-header"
import { StatCard } from "@/admin/components/stat-card"
import { BookingsTable } from "@/admin/features/bookings/components/bookings-table"
import type {
  BookingRow,
  BookingStatusCounts,
} from "@/admin/features/bookings/types"
import { PaymentBreakdownCard } from "@/admin/features/dashboard/components/payment-breakdown-card"
import { RevenueTrendChart } from "@/admin/features/dashboard/components/revenue-trend-chart"
import { StatusBreakdownCard } from "@/admin/features/dashboard/components/status-breakdown-card"
import { TopItemsCard } from "@/admin/features/dashboard/components/top-items-card"
import type {
  DashboardKpis,
  PaymentStatusCounts,
  RevenueTrendPoint,
  TopItem,
} from "@/admin/features/dashboard/types"
import type { EmployeeStats } from "@/admin/features/employees/types"
import AdminLayout from "@/admin/layouts/admin-layout"
import { formatMoney, formatNumber } from "@/admin/lib/format"
import { adminDashboard } from "@/routes"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import type { BreadcrumbItem } from "@/shared/types"

type Props =
  | {
      view: "admin"
      kpis: DashboardKpis
      status_breakdown: BookingStatusCounts
      payment_status_breakdown: PaymentStatusCounts
      revenue_trend: RevenueTrendPoint[]
      top_items: TopItem[]
      upcoming_bookings: BookingRow[]
    }
  | {
      view: "employee"
      stats: EmployeeStats
      today_bookings: BookingRow[]
    }

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: adminDashboard.index().url },
]

export default function Dashboard(props: Props) {
  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />

      {props.view === "admin" ? (
        <AdminDashboard {...props} />
      ) : (
        <EmployeeDashboard {...props} />
      )}
    </AdminLayout>
  )
}

function AdminDashboard({
  kpis,
  status_breakdown,
  payment_status_breakdown,
  revenue_trend,
  top_items,
  upcoming_bookings,
}: {
  kpis: DashboardKpis
  status_breakdown: BookingStatusCounts
  payment_status_breakdown: PaymentStatusCounts
  revenue_trend: RevenueTrendPoint[]
  top_items: TopItem[]
  upcoming_bookings: BookingRow[]
}) {
  return (
    <div className="space-y-6 p-4">
      <PageHeader
        title="Dashboard"
        description="Bookings and revenue at a glance."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue this month"
          icon={Wallet}
          value={formatMoney(kpis.revenue_this_month)}
          hint="Paid bookings"
        />
        <StatCard
          label="Scheduled today"
          icon={CalendarClock}
          value={formatNumber(kpis.bookings_today)}
        />
        <StatCard
          label="Open bookings"
          icon={ClipboardList}
          value={formatNumber(kpis.open_bookings)}
          hint="Pending, confirmed or in progress"
        />
        <StatCard
          label="New customers"
          icon={UserPlus}
          value={formatNumber(kpis.new_customers_this_month)}
          hint="This month"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueTrendChart points={revenue_trend} />
        </div>
        <StatusBreakdownCard counts={status_breakdown} windowDays={30} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PaymentBreakdownCard
          counts={payment_status_breakdown}
          windowDays={30}
        />
        <TopItemsCard items={top_items} windowDays={30} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming bookings</CardTitle>
          <CardDescription>
            The next {upcoming_bookings.length} open bookings, soonest first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BookingsTable
            bookings={upcoming_bookings}
            party="both"
            emptyMessage="Nothing scheduled."
          />
        </CardContent>
      </Card>
    </div>
  )
}

function EmployeeDashboard({
  stats,
  today_bookings,
}: {
  stats: EmployeeStats
  today_bookings: BookingRow[]
}) {
  return (
    <div className="space-y-6 p-4">
      <PageHeader title="Dashboard" description="Your assigned bookings." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
          label="Next booking"
          icon={CalendarPlus}
          value={
            stats.next_booking_at
              ? new Date(stats.next_booking_at).toLocaleString("en-GB", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s bookings</CardTitle>
          <CardDescription>
            Assigned to you, scheduled for today.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BookingsTable
            bookings={today_bookings}
            party="customer"
            emptyMessage="Nothing scheduled for today."
          />
        </CardContent>
      </Card>
    </div>
  )
}
