import { blogs as blogsRoute } from "@/routes"
import { Breadcrumbs } from "@/website/components/breadcrumbs"
import { BlogCard } from "@/website/features/blogs/components/blog-card"
import type { BlogCardData, BlogDetail } from "@/website/features/blogs/types"
import { formatDate } from "@/website/features/blogs/utils"
import SiteLayout from "@/website/layouts/site-layout"

interface Props {
  blog: BlogDetail
  related: BlogCardData[]
}

export default function BlogShow({ blog, related }: Props) {
  const title = blog.title ?? "Blog"

  return (
    <SiteLayout
      title={blog.seo_title ?? title}
      description={blog.seo_description ?? blog.subtitle}
      mainClassName=""
    >
      <article className="mx-auto max-w-3xl px-6 pt-10 pb-20 lg:pt-16">
        <Breadcrumbs
          items={[{ label: "Blog", href: blogsRoute().url }, { label: title }]}
        />

        <time
          dateTime={blog.published_at}
          className="text-bronze mt-8 block text-xs font-medium tracking-[0.2em] uppercase"
        >
          {formatDate(blog.published_at)}
        </time>
        <h1 className="font-display mt-3 text-4xl sm:text-5xl">{title}</h1>
        {blog.subtitle && (
          <p className="text-sage mt-4 text-lg">{blog.subtitle}</p>
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
            className="prose text-pine [&_a]:text-bronze mt-10 max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.body }}
          />
        )}
      </article>

      {related.length > 0 && (
        <section
          aria-labelledby="more-blogs"
          className="border-pine/10 border-t px-6 py-20"
        >
          <div className="mx-auto max-w-6xl">
            <h2 id="more-blogs" className="font-display text-3xl">
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
    </SiteLayout>
  )
}
