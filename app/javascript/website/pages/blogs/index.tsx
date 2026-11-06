import { blogs as blogsRoute } from "@/routes"
import { Pagination } from "@/website/components/pagination"
import { BlogCard } from "@/website/features/blogs/components/blog-card"
import type { BlogCardData } from "@/website/features/blogs/types"
import SiteLayout from "@/website/layouts/site-layout"

interface Props {
  blogs: BlogCardData[]
  page: number
  pages: number
}

export default function BlogsIndex({ blogs, page, pages }: Props) {
  const pageLink = (n: number) =>
    blogsRoute({ query: n > 1 ? { page: n } : {} })

  return (
    <SiteLayout
      title={"Blog"}
      description={"Tips, stories and news from the Auto Atelier team."}
      mainClassName="mx-auto max-w-6xl px-6 py-16 sm:py-24"
    >
      <h1 className="font-display text-center text-4xl sm:text-5xl">
        The journal
      </h1>
      <p className="text-sage mt-4 text-center">
        Tips, stories and news from the Auto Atelier team.
      </p>

      {blogs.length === 0 ? (
        <p className="text-sage mt-12 text-center">
          No posts yet. Check back soon.
        </p>
      ) : (
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog, index) => (
            <BlogCard key={blog.id} blog={blog} priority={index < 3} />
          ))}
        </ul>
      )}

      <Pagination
        pagination={{
          page,
          pages,
          total: blogs.length,
          per_page: blogs.length,
        }}
        hrefFor={(n) => pageLink(n).url}
      />
    </SiteLayout>
  )
}
