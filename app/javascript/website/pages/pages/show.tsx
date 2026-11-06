import type { PageProps } from "@/website/features/page-sections/types"
import MarketingLayout from "@/website/layouts/marketing-layout"
import { useI18n } from "@/website/lib/i18n"

interface Props {
  page: PageProps
}

export default function Show({ page }: Props) {
  const { t } = useI18n()

  return (
    <MarketingLayout
      page={page}
      fallbackTitle={page.title ?? t("Auto Atelier")}
      emptyMessage=""
    />
  )
}
