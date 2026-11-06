import { Link } from "@inertiajs/react"

import { blogs as blogsRoute } from "@/routes"
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
        title="Blog — Auto Atelier"
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
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </ul>
          )}

          {pages > 1 && (
            <nav
              aria-label="Pagination"
              className="mt-12 flex items-center justify-center gap-6 text-sm"
            >
              {page > 1 ? (
                <Link href={pageLink(page - 1)} className="font-medium">
                  ← Newer
                </Link>
              ) : (
                <span className="text-[#5B6B5E]/50">← Newer</span>
              )}
              <span className="text-[#5B6B5E]">
                Page {page} of {pages}
              </span>
              {page < pages ? (
                <Link href={pageLink(page + 1)} className="font-medium">
                  Older →
                </Link>
              ) : (
                <span className="text-[#5B6B5E]/50">Older →</span>
              )}
            </nav>
          )}
        </main>
        <SiteFooter />
      </div>
    </>
  )
}
