import { Head } from "@inertiajs/react"

import { ConfirmDeleteDialog } from "@/admin/components/confirm-delete-dialog"
import { PageHeader } from "@/admin/components/page-header"
import { BlogForm } from "@/admin/features/blogs/components/blog-form"
import type { BlogDetail, BlogTranslation } from "@/admin/features/blogs/types"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import { adminBlogs } from "@/routes"

interface Props {
  blog: BlogDetail & { id: number }
  translations: BlogTranslation[]
}

export default function BlogEdit({ blog, translations }: Props) {
  const can = useCan()
  const name = blog.name ?? blog.slug

  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Blog", href: adminBlogs.index().url },
        { title: name, href: adminBlogs.edit(blog.id).url },
      ]}
    >
      <Head title={`Edit ${name}`} />

      <div className="space-y-6 p-4">
        <PageHeader
          title={name}
          description={<span className="font-mono">/{blog.slug}</span>}
          actions={
            can("blogs", "delete") && (
              <ConfirmDeleteDialog
                title={`Delete ${name}?`}
                description="The post is removed from the website in every language. This can't be undone."
                action={adminBlogs.destroy(blog.id)}
              />
            )
          }
        />
        <BlogForm
          key={blog.id}
          blog={blog}
          translations={translations}
          action={adminBlogs.update(blog.id)}
          cancelHref={adminBlogs.index().url}
          submitLabel="Save changes"
        />
      </div>
    </AdminLayout>
  )
}
