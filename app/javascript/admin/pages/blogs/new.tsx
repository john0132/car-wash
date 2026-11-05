import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import { BlogForm } from "@/admin/features/blogs/components/blog-form"
import type { BlogDetail, BlogTranslation } from "@/admin/features/blogs/types"
import AdminLayout from "@/admin/layouts/admin-layout"
import { adminBlogs } from "@/routes"

interface Props {
  blog: BlogDetail
  translations: BlogTranslation[]
}

export default function BlogNew({ blog, translations }: Props) {
  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Blog", href: adminBlogs.index().url },
        { title: "New", href: adminBlogs.new().url },
      ]}
    >
      <Head title="New blog post" />

      <div className="space-y-6 p-4">
        <PageHeader title="New blog post" />
        <BlogForm
          blog={blog}
          translations={translations}
          action={adminBlogs.create()}
          cancelHref={adminBlogs.index().url}
          submitLabel="Create post"
        />
      </div>
    </AdminLayout>
  )
}
