import { Link } from "@inertiajs/react"

import { blogs as blogsRoute, root } from "@/routes"
import { SiteFooter } from "@/website/components/site-footer"
import { SiteHeader } from "@/website/components/site-header"
import { BlogCard } from "@/website/features/blogs/components/blog-card"
import { BlogHead } from "@/website/features/blogs/components/blog-head"
import type { BlogCardData, BlogDetail } from "@/website/features/blogs/types"
import { formatDate } from "@/website/features/blogs/utils"

interface Props {
  blog: BlogDetail
  related: BlogCardData[]
}

export default function BlogShow({ blog, related }: Props) {
  const title = blog.title ?? "Blog"

  return (
    <>
      <BlogHead
        title={blog.seo_title ?? title}
        description={blog.seo_description ?? blog.subtitle}
      />

      <div
        style={{ fontFamily: "'Jost', system-ui, sans-serif" }}
        className="bg-[#F6F1E7] text-[#2B3A32]"
      >
        <SiteHeader />
        <main>
          <article className="mx-auto max-w-3xl px-6 pt-10 pb-20 lg:pt-16">
            <nav aria-label="Breadcrumb" className="text-sm text-[#5B6B5E]">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href={root()} className="hover:text-[#2B3A32]">
                    Home
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li>
                  <Link href={blogsRoute()} className="hover:text-[#2B3A32]">
                    Blog
                  </Link>
                </li>
              </ol>
            </nav>

            <time
              dateTime={blog.published_at}
              className="mt-8 block text-xs font-medium tracking-[0.2em] text-[#8A6240] uppercase"
            >
              {formatDate(blog.published_at)}
            </time>
            <h1
              style={{ fontFamily: "'Italiana', serif" }}
              className="mt-3 text-4xl sm:text-5xl"
            >
              {title}
            </h1>
            {blog.subtitle && (
              <p className="mt-4 text-lg text-[#5B6B5E]">{blog.subtitle}</p>
            )}

            {blog.cover_image && (
              <img
                src={blog.cover_image.url}
                alt=""
                className="mt-10 aspect-[16/9] w-full rounded-3xl object-cover"
              />
            )}

            {blog.body && (
              <div
                className="prose mt-10 max-w-none text-[#2B3A32] [&_a]:text-[#8A6240]"
                dangerouslySetInnerHTML={{ __html: blog.body }}
              />
            )}
          </article>

          {related.length > 0 && (
            <section
              aria-labelledby="more-blogs"
              className="border-t border-[#2B3A32]/10 px-6 py-20"
            >
              <div className="mx-auto max-w-6xl">
                <h2
                  id="more-blogs"
                  style={{ fontFamily: "'Italiana', serif" }}
                  className="text-3xl"
                >
                  Keep reading
                </h2>
                <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((item) => (
                    <BlogCard key={item.id} blog={item} />
                  ))}
                </ul>
              </div>
            </section>
          )}
        </main>
        <SiteFooter />
      </div>
    </>
  )
}
