import { Head, Link } from "@inertiajs/react"
import { Eye } from "lucide-react"

import { ListFilters } from "@/admin/components/list-filters"
import { PageHeader } from "@/admin/components/page-header"
import { Pagination } from "@/admin/components/pagination"
import { ResourceTable } from "@/admin/components/resource-table"
import type {
  ContactMessageFilters,
  ContactMessageRow,
} from "@/admin/features/contact/types"
import AdminLayout from "@/admin/layouts/admin-layout"
import { formatDateTime } from "@/admin/lib/format"
import type { Pagination as PaginationData } from "@/admin/types"
import { adminContactMessages } from "@/routes"
import { Button } from "@/shared/components/ui/button"
import { TableCell, TableHead, TableRow } from "@/shared/components/ui/table"

interface Props {
  messages: ContactMessageRow[]
  filters: ContactMessageFilters
  pagination: PaginationData
}

export default function ContactMessagesIndex({
  messages,
  filters,
  pagination,
}: Props) {
  return (
    <AdminLayout
      breadcrumbs={[
        {
          title: "Contact messages",
          href: adminContactMessages.index().url,
        },
      ]}
    >
      <Head title="Contact messages" />

      <div className="space-y-6 p-4">
        <PageHeader
          title="Contact messages"
          description="Messages sent through the website's contact us form, newest first."
        />

        <ListFilters
          url={adminContactMessages.index().url}
          filters={filters}
          searchPlaceholder="Search name, email, phone or message…"
        />

        <ResourceTable
          items={messages}
          emptyMessage="No messages yet."
          columns={
            <>
              <TableHead>From</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Received</TableHead>
              <TableHead className="w-12" />
            </>
          }
          renderRow={(message) => (
            <TableRow key={message.id}>
              <TableCell>
                <Link
                  href={adminContactMessages.show(message.id)}
                  className="font-medium hover:underline"
                >
                  {message.full_name}
                </Link>
                <div className="text-muted-foreground text-xs">
                  {message.email}
                </div>
              </TableCell>
              <TableCell>{message.phone ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground max-w-xs truncate">
                {message.excerpt}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {formatDateTime(message.created_at)}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" asChild>
                  <Link
                    href={adminContactMessages.show(message.id)}
                    aria-label={`View message from ${message.full_name}`}
                  >
                    <Eye />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          )}
        />

        <Pagination pagination={pagination} noun="messages" />
      </div>
    </AdminLayout>
  )
}
