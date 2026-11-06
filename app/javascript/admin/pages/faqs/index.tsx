import { Head, Link } from "@inertiajs/react"
import { Plus } from "lucide-react"

import { ActivationSwitch } from "@/admin/components/activation-switch"
import {
  ListFilters,
  PUBLISHED_LABELS,
  hasFilters,
} from "@/admin/components/list-filters"
import { PageHeader } from "@/admin/components/page-header"
import { Pagination } from "@/admin/components/pagination"
import { ResourceTable } from "@/admin/components/resource-table"
import type { FaqFilters, FaqRow } from "@/admin/features/faqs/types"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import { formatNumber } from "@/admin/lib/format"
import type { Pagination as PaginationData } from "@/admin/types"
import { adminFaqs } from "@/routes"
import { Button } from "@/shared/components/ui/button"
import { TableCell, TableHead, TableRow } from "@/shared/components/ui/table"

interface Props {
  faqs: FaqRow[]
  filters: FaqFilters
  pagination: PaginationData
}

export default function FaqsIndex({ faqs, filters, pagination }: Props) {
  const can = useCan()
  const canUpdate = can("faqs", "update")

  return (
    <AdminLayout breadcrumbs={[{ title: "FAQs", href: adminFaqs.index().url }]}>
      <Head title="FAQs" />

      <div className="space-y-6 p-4">
        <PageHeader
          title="FAQs"
          description="Questions and answers shown on the website, in sort order."
          actions={
            can("faqs", "create") && (
              <Button asChild>
                <Link href={adminFaqs.new()}>
                  <Plus /> New FAQ
                </Link>
              </Button>
            )
          }
        />

        <ListFilters
          url={adminFaqs.index().url}
          filters={filters}
          searchPlaceholder="Search question…"
          statusLabels={PUBLISHED_LABELS}
        />

        <ResourceTable
          items={faqs}
          emptyMessage="No FAQs yet."
          emptyFilteredMessage="No FAQs match these filters."
          filtered={hasFilters(filters)}
          columns={
            <>
              <TableHead>Question</TableHead>
              <TableHead className="text-right">Sort order</TableHead>
              <TableHead className="text-right">Published</TableHead>
            </>
          }
          renderRow={(faq) => (
            <TableRow key={faq.id}>
              <TableCell>
                {canUpdate ? (
                  <Link
                    href={adminFaqs.edit(faq.id)}
                    className="font-medium hover:underline"
                  >
                    {faq.question}
                  </Link>
                ) : (
                  <span className="font-medium">{faq.question}</span>
                )}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(faq.sort_order)}
              </TableCell>
              <TableCell className="text-right">
                <ActivationSwitch
                  active={faq.is_active}
                  name={faq.question ?? `FAQ #${faq.id}`}
                  action={adminFaqs.activation(faq.id)}
                  disabled={!canUpdate}
                />
              </TableCell>
            </TableRow>
          )}
        />

        <Pagination pagination={pagination} noun="FAQs" />
      </div>
    </AdminLayout>
  )
}
