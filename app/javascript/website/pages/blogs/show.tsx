import { usePage } from "@inertiajs/react"

import { blogs as blogsRoute } from "@/routes"
import { Breadcrumbs } from "@/website/components/breadcrumbs"
import { BlogCard } from "@/website/features/blogs/components/blog-card"
import type { BlogCardData, BlogDetail } from "@/website/features/blogs/types"
import SiteLayout from "@/website/layouts/site-layout"
import { useI18n } from "@/website/lib/i18n"
import { blogPostingLd } from "@/website/lib/structured-data"

interface Props {
  blog: BlogDetail
  related: BlogCardData[]
}

export default function BlogShow({ blog, related }: Props) {
  const { t, formatDate } = useI18n()
  const { origin } = usePage<{ seo: { origin: string } }>().props.seo

  const title = blog.title ?? t("Blog")

  return (
    <SiteLayout
      title={blog.seo_title ?? title}
      description={blog.seo_description ?? blog.subtitle}
      image={blog.cover_image}
      type="article"
      jsonLd={[
        blogPostingLd(origin, "Auto Atelier", {
          title,
          description: blog.seo_description ?? blog.subtitle,
          image: blog.cover_image,
          published_at: blog.published_at,
        }),
      ]}
      mainClassName=""
    >
      <article className="mx-auto max-w-3xl px-6 pt-10 pb-20 lg:pt-16">
        <Breadcrumbs
          items={[
            { label: t("Blog"), href: blogsRoute().url },
            { label: title },
          ]}
        />

        <time
          dateTime={blog.published_at}
          className="text-bronze mt-8 block text-xs font-medium tracking-[0.2em] uppercase"
        >
          {formatDate(blog.published_at)}
        </time>
        <h1 dir="auto" className="font-display mt-3 text-4xl sm:text-5xl">
          {title}
        </h1>
        {blog.subtitle && (
          <p dir="auto" className="text-sage mt-4 text-lg">
            {blog.subtitle}
          </p>
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
            <h2 dir="auto" id="more-blogs" className="font-display text-3xl">
              {t("Keep reading")}
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
