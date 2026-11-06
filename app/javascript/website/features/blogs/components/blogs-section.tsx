import { Link } from "@inertiajs/react"

import { blogs as blogsRoute } from "@/routes"
import { BlogCard } from "@/website/features/blogs/components/blog-card"
import type { BlogCardData } from "@/website/features/blogs/types"
import { useI18n } from "@/website/lib/i18n"

/** Homepage teaser: a few blogs plus a "view all" link. Renders nothing when empty. */
export function BlogsSection({ blogs }: { blogs: BlogCardData[] }) {
  const { t } = useI18n()

  if (blogs.length === 0) return null

  return (
    <section
      id="blogs"
      aria-labelledby="blogs-heading"
      className="bg-ivory px-6 py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p
              dir="auto"
              className="text-bronze text-xs font-medium tracking-[0.3em] uppercase"
            >
              {t("From the journal")}
            </p>
            <h2
              dir="auto"
              id="blogs-heading"
              className="font-display text-pine mt-4 text-4xl sm:text-5xl"
            >
              {t("Notes on caring for your car")}
            </h2>
          </div>
          <Link
            href={blogsRoute()}
            className="border-pine text-pine hover:bg-pine hover:text-ivory rounded-full border px-6 py-2.5 text-sm font-medium transition-colors"
          >
            {t("View all blogs")}
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
