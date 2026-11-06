import { Link } from "@inertiajs/react"

import { blog as blogRoute } from "@/routes"
import type { BlogCardData } from "@/website/features/blogs/types"
import { formatDate } from "@/website/features/blogs/utils"
import { ImageOrMark } from "@/website/features/home-catalog/components/image-or-mark"

/** Image-topped card linking to a blog; the whole card is the link. */
export function BlogCard({ blog }: { blog: BlogCardData }) {
  return (
    <li className="group relative overflow-hidden rounded-3xl border border-[#2B3A32]/10 bg-white transition-shadow duration-300 hover:shadow-[0_24px_48px_-24px_rgba(43,58,50,0.3)]">
      <div className="aspect-[16/10] overflow-hidden">
        <ImageOrMark image={blog.cover_image} />
      </div>
      <div className="p-6">
        <time
          dateTime={blog.published_at}
          className="text-xs font-medium tracking-[0.2em] text-[#8A6240] uppercase"
        >
          {formatDate(blog.published_at)}
        </time>
        <h3 className="mt-2 text-lg font-medium text-[#2B3A32]">
          <Link
            href={blogRoute(blog.slug)}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {blog.title}
          </Link>
        </h3>
        {blog.subtitle && (
          <p className="mt-2 line-clamp-3 text-sm text-[#5B6B5E]">
            {blog.subtitle}
          </p>
        )}
      </div>
    </li>
  )
}
