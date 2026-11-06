import { Link } from "@inertiajs/react"

import { blogs as blogsRoute } from "@/routes"
import { BlogCard } from "@/website/features/blogs/components/blog-card"
import type { BlogCardData } from "@/website/features/blogs/types"

/** Homepage teaser: a few blogs plus a "view all" link. Renders nothing when empty. */
export function BlogsSection({ blogs }: { blogs: BlogCardData[] }) {
  if (blogs.length === 0) return null

  return (
    <section
      id="blogs"
      aria-labelledby="blogs-heading"
      className="bg-[#F6F1E7] px-6 py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-xs font-medium tracking-[0.3em] text-[#8A6240] uppercase">
              From the journal
            </p>
            <h2
              id="blogs-heading"
              style={{ fontFamily: "'Italiana', serif" }}
              className="mt-4 text-4xl text-[#2B3A32] sm:text-5xl"
            >
              Notes on caring for your car
            </h2>
          </div>
          <Link
            href={blogsRoute()}
            className="rounded-full border border-[#2B3A32] px-6 py-2.5 text-sm font-medium text-[#2B3A32] transition-colors hover:bg-[#2B3A32] hover:text-[#F6F1E7]"
          >
            View all blogs
          </Link>
        </div>

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </ul>
      </div>
    </section>
  )
}
