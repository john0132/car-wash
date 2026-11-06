import { ServiceCategoriesSection } from "@/website/features/home-catalog/components/service-categories-section"
import { ServicesSection } from "@/website/features/home-catalog/components/services-section"
import type {
  HomeCategory,
  HomeService,
} from "@/website/features/home-catalog/types"
import type { PageProps } from "@/website/features/page-sections/types"
import MarketingLayout from "@/website/layouts/marketing-layout"

interface Props {
  page: PageProps | null
  home_services: HomeService[]
  home_categories: HomeCategory[]
}

export default function Welcome({
  page,
  home_services: services,
  home_categories: categories,
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
        </>
      }
    />
  )
}
