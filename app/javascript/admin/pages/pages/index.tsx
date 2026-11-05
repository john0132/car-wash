import { Head, Link } from "@inertiajs/react"
import { Pencil, Plus } from "lucide-react"

import { ActivationSwitch } from "@/admin/components/activation-switch"
import { ListFilters } from "@/admin/components/list-filters"
import { PageHeader } from "@/admin/components/page-header"
import { Pagination } from "@/admin/components/pagination"
import type { PageFilters, PageRow } from "@/admin/features/pages/types"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import { formatDate, formatNumber } from "@/admin/lib/format"
import type { Pagination as PaginationData } from "@/admin/types"
import { adminPages } from "@/routes"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"

interface Props {
  pages: PageRow[]
  filters: PageFilters
  pagination: PaginationData
}

export default function PagesIndex({ pages, filters, pagination }: Props) {
  const can = useCan()
  const canUpdate = can("pages", "update")

  return (
    <AdminLayout
      breadcrumbs={[{ title: "Pages", href: adminPages.index().url }]}
    >
      <Head title="Pages" />

      <div className="space-y-6 p-4">
        <PageHeader
          title="Pages"
          description="Website pages, built from sections of reusable components."
          actions={
            can("pages", "create") && (
              <Button asChild>
                <Link href={adminPages.new()}>
                  <Plus /> New page
                </Link>
              </Button>
            )
          }
        />

        <ListFilters
          url={adminPages.index().url}
          filters={filters}
          searchPlaceholder="Search page name…"
        />

        <Card className="py-2">
          <CardContent className="px-2">
            {pages.length === 0 ? (
              <p className="text-muted-foreground py-10 text-center text-sm">
                No pages match these filters.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead>Languages</TableHead>
                    <TableHead className="text-right">Sections</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Published</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => {
                    const name = page.name ?? page.slug
                    return (
                      <TableRow key={page.id}>
                        <TableCell>
                          <div className="space-y-0.5">
                            {canUpdate ? (
                              <Link
                                href={adminPages.edit(page.id)}
                                className="font-medium hover:underline"
                              >
                                {name}
                              </Link>
                            ) : (
                              <span className="font-medium">{name}</span>
                            )}
                            <p className="text-muted-foreground font-mono text-xs">
                              /{page.slug}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="space-x-1">
                          {page.languages.map((code) => (
                            <Badge
                              key={code}
                              variant="secondary"
                              className="uppercase"
                            >
                              {code}
                            </Badge>
                          ))}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(page.sections_count)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(page.updated_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <ActivationSwitch
                            active={page.is_active}
                            name={name}
                            action={adminPages.activation(page.id)}
                            disabled={!canUpdate}
                          />
                        </TableCell>
                        <TableCell>
                          {canUpdate && (
                            <Button variant="ghost" size="icon" asChild>
                              <Link
                                href={adminPages.edit(page.id)}
                                aria-label={`Edit ${name}`}
                              >
                                <Pencil />
                              </Link>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Pagination pagination={pagination} noun="pages" />
      </div>
    </AdminLayout>
  )
}
