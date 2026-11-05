import { Head, Link } from "@inertiajs/react"
import { ImageOff, Pencil, Plus } from "lucide-react"

import { ActivationSwitch } from "@/admin/components/activation-switch"
import { ListFilters } from "@/admin/components/list-filters"
import { PageHeader } from "@/admin/components/page-header"
import { Pagination } from "@/admin/components/pagination"
import type { BlogFilters, BlogRow } from "@/admin/features/blogs/types"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import { formatDate } from "@/admin/lib/format"
import type { Pagination as PaginationData } from "@/admin/types"
import { adminBlogs } from "@/routes"
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
  blogs: BlogRow[]
  filters: BlogFilters
  pagination: PaginationData
}

export default function BlogsIndex({ blogs, filters, pagination }: Props) {
  const can = useCan()
  const canUpdate = can("blogs", "update")

  return (
    <AdminLayout
      breadcrumbs={[{ title: "Blog", href: adminBlogs.index().url }]}
    >
      <Head title="Blog" />

      <div className="space-y-6 p-4">
        <PageHeader
          title="Blog"
          description="Articles published on the website, in every language."
          actions={
            can("blogs", "create") && (
              <Button asChild>
                <Link href={adminBlogs.new()}>
                  <Plus /> New post
                </Link>
              </Button>
            )
          }
        />

        <ListFilters
          url={adminBlogs.index().url}
          filters={filters}
          searchPlaceholder="Search name or slug…"
        />

        <Card className="py-2">
          <CardContent className="px-2">
            {blogs.length === 0 ? (
              <p className="text-muted-foreground py-10 text-center text-sm">
                No posts match these filters.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Post</TableHead>
                    <TableHead>Languages</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Published</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogs.map((blog) => {
                    const name = blog.title ?? blog.name ?? blog.slug
                    return (
                      <TableRow key={blog.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {blog.cover_image ? (
                              <img
                                src={blog.cover_image.url}
                                alt=""
                                className="size-10 shrink-0 rounded object-cover"
                              />
                            ) : (
                              <div className="text-muted-foreground bg-muted flex size-10 shrink-0 items-center justify-center rounded">
                                <ImageOff className="size-4" />
                              </div>
                            )}
                            <div className="min-w-0 space-y-0.5">
                              {canUpdate ? (
                                <Link
                                  href={adminBlogs.edit(blog.id)}
                                  className="font-medium hover:underline"
                                >
                                  {name}
                                </Link>
                              ) : (
                                <span className="font-medium">{name}</span>
                              )}
                              <p className="text-muted-foreground truncate font-mono text-xs">
                                /{blog.slug}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="space-x-1">
                          {blog.languages.map((code) => (
                            <Badge
                              key={code}
                              variant="secondary"
                              className="uppercase"
                            >
                              {code}
                            </Badge>
                          ))}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(blog.updated_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <ActivationSwitch
                            active={blog.is_active}
                            name={name}
                            action={adminBlogs.activation(blog.id)}
                            disabled={!canUpdate}
                          />
                        </TableCell>
                        <TableCell>
                          {canUpdate && (
                            <Button variant="ghost" size="icon" asChild>
                              <Link
                                href={adminBlogs.edit(blog.id)}
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

        <Pagination pagination={pagination} noun="posts" />
      </div>
    </AdminLayout>
  )
}
