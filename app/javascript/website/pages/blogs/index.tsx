import { blogs as blogsRoute } from "@/routes"
import { Pagination } from "@/website/components/pagination"
import { SiteFooter } from "@/website/components/site-footer"
import { SiteHeader } from "@/website/components/site-header"
import { BlogCard } from "@/website/features/blogs/components/blog-card"
import { BlogHead } from "@/website/features/blogs/components/blog-head"
import type { BlogCardData } from "@/website/features/blogs/types"

interface Props {
  blogs: BlogCardData[]
  page: number
  pages: number
}

export default function BlogsIndex({ blogs, page, pages }: Props) {
  const pageLink = (n: number) =>
    blogsRoute({ query: n > 1 ? { page: n } : {} })

  return (
    <>
      <BlogHead
        title="Blog"
        description="Tips, stories and news from the Auto Atelier team."
      />

      <div
        style={{ fontFamily: "'Jost', system-ui, sans-serif" }}
        className="bg-[#F6F1E7] text-[#2B3A32]"
      >
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <h1
            style={{ fontFamily: "'Italiana', serif" }}
            className="text-center text-4xl sm:text-5xl"
          >
            The journal
          </h1>
          <p className="mt-4 text-center text-[#5B6B5E]">
            Tips, stories and news from the Auto Atelier team.
          </p>

          {blogs.length === 0 ? (
            <p className="mt-12 text-center text-[#5B6B5E]">
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
        </main>
        <SiteFooter />
      </div>
    </>
  )
}
