import { BlogsSection } from "@/website/features/blogs/components/blogs-section"
import type { BlogCardData } from "@/website/features/blogs/types"
import { ServiceCategoriesSection } from "@/website/features/home-catalog/components/service-categories-section"
import { ServicesSection } from "@/website/features/home-catalog/components/services-section"
import type { HomeCategory } from "@/website/features/home-catalog/types"
import type { PageProps } from "@/website/features/page-sections/types"
import MarketingLayout from "@/website/layouts/marketing-layout"
import type { ServiceSummary } from "@/website/lib/types"

interface Props {
  page: PageProps | null
  home_services: ServiceSummary[]
  home_categories: HomeCategory[]
  home_blogs: BlogCardData[]
}

export default function Welcome({
  page,
  home_services: services,
  home_categories: categories,
  home_blogs: blogs,
}: Props) {
  return (
    <MarketingLayout
      page={page}
      fallbackTitle="Auto Atelier — Hand-Finished Auto Care"
      emptyMessage={
        'This page hasn’t been set up yet. Add a "home" page from the dashboard to show content here.'
      }
      afterHero={
        <>
          <ServiceCategoriesSection categories={categories} />
          <ServicesSection services={services} />
          <BlogsSection blogs={blogs} />
        </>
      }
    />
  )
}
