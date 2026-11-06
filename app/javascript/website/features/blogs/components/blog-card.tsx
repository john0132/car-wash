import { Link } from "@inertiajs/react"

import { blog as blogRoute } from "@/routes"
import { ImageOrMark } from "@/website/components/image-or-mark"
import type { BlogCardData } from "@/website/features/blogs/types"
import { useI18n } from "@/website/lib/i18n"

/** Image-topped card linking to a blog; the whole card is the link. */
export function BlogCard({
  blog,
  priority = false,
}: {
  blog: BlogCardData
  priority?: boolean
}) {
  const { formatDate } = useI18n()

  return (
    <li className="group border-pine/10 relative overflow-hidden rounded-3xl border bg-white transition-shadow duration-300 hover:shadow-[0_24px_48px_-24px_rgba(43,58,50,0.3)]">
      <div className="aspect-[16/10] overflow-hidden">
        <ImageOrMark image={blog.cover_image} priority={priority} />
      </div>
      <div className="p-6">
        <time
          dateTime={blog.published_at}
          className="text-bronze text-xs font-medium tracking-[0.2em] uppercase"
        >
          {formatDate(blog.published_at)}
        </time>
        <h3 dir="auto" className="text-pine mt-2 text-lg font-medium">
          <Link
            href={blogRoute(blog.slug)}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {blog.title}
          </Link>
        </h3>
        {blog.subtitle && (
          <p dir="auto" className="text-sage mt-2 line-clamp-3 text-sm">
            {blog.subtitle}
          </p>
        )}
      </div>
    </li>
  )
}
