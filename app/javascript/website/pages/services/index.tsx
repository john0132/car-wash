import { Head, Link } from "@inertiajs/react"

import { root, serviceCategory } from "@/routes"
import { SiteFooter } from "@/website/components/site-footer"
import { SiteHeader } from "@/website/components/site-header"
import { ServiceCard } from "@/website/features/service-detail/components/service-card"
import type { ServicesListCategory } from "@/website/features/services-list/types"

interface Props {
  categories: ServicesListCategory[]
}

export default function ServicesIndex({ categories }: Props) {
  return (
    <>
      <Head title="Our services">
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Italiana&family=Jost:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <meta
          name="description"
          content="Choose a service to book: hand washing, interior detailing and protection."
        />
      </Head>

      <div
        style={{ fontFamily: "'Jost', system-ui, sans-serif" }}
        className="bg-[#F6F1E7] text-[#2B3A32]"
      >
        <SiteHeader />
        <main className="mx-auto min-h-[70vh] max-w-6xl px-6 pt-10 pb-24 lg:pt-16">
          <nav aria-label="Breadcrumb" className="text-sm text-[#5B6B5E]">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href={root()} className="hover:text-[#2B3A32]">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page">Services</li>
            </ol>
          </nav>

          <h1
            style={{ fontFamily: "'Italiana', serif" }}
            className="mt-6 text-5xl leading-[1.05] text-balance sm:text-6xl"
          >
            Our services
          </h1>
          <p className="mt-4 max-w-xl text-[#5B6B5E]">
            Pick the treatment you’d like and we’ll take it from there.
          </p>

          {categories.length === 0 && (
            <div className="mt-12 rounded-3xl border border-dashed border-[#2B3A32]/20 bg-white/50 px-6 py-16 text-center">
              <p className="text-lg">No services are available yet.</p>
            </div>
          )}

          {categories.map((category, categoryIndex) => (
            <section
              key={category.id}
              aria-labelledby={`category-${category.id}`}
              className="mt-14"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h2
                  id={`category-${category.id}`}
                  style={{ fontFamily: "'Italiana', serif" }}
                  className="text-3xl sm:text-4xl"
                >
                  {category.name}
                </h2>
                <Link
                  href={serviceCategory(category.slug)}
                  className="shrink-0 text-sm text-[#8A6240] underline-offset-4 hover:underline"
                >
                  See all {category.name}
                </Link>
              </div>
              <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {category.services.map((service, index) => (
                  <li key={service.id}>
                    <ServiceCard
                      service={service}
                      priority={categoryIndex === 0 && index < 3}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </main>
        <SiteFooter />
      </div>
    </>
  )
}
