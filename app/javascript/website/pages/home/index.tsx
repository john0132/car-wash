import type { PageProps } from "@/website/features/page-sections/types"
import MarketingLayout from "@/website/layouts/marketing-layout"

interface Props {
  page: PageProps | null
}

export default function Welcome({ page }: Props) {
  return (
    <MarketingLayout
      page={page}
      fallbackTitle="Auto Atelier — Hand-Finished Auto Care"
      emptyMessage={
        'This page hasn’t been set up yet. Add a "home" page from the dashboard to show content here.'
      }
    />
  )
}
