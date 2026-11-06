import type { PageProps } from "@/website/features/page-sections/types"
import MarketingLayout from "@/website/layouts/marketing-layout"

interface Props {
  page: PageProps
}

export default function Show({ page }: Props) {
  return (
    <MarketingLayout
      page={page}
      fallbackTitle={page.title ?? "Auto Atelier"}
      emptyMessage=""
    />
  )
}
