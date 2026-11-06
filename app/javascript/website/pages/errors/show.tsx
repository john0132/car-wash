import { Link } from "@inertiajs/react"

import { root, services } from "@/routes"
import SiteLayout from "@/website/layouts/site-layout"
import { useI18n } from "@/website/lib/i18n"

/** The website's error page (Website::ErrorsController, and Website::BaseController#render_error). */
export default function ErrorsShow({ status }: { status: number }) {
  const { t } = useI18n()
  const missing = status === 404

  return (
    <SiteLayout
      title={missing ? t("Page not found") : t("Something went wrong")}
      noindex
      mainClassName="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-24 text-center"
    >
      <p className="text-bronze text-sm tracking-[0.3em] uppercase">
        {t("Error {status}", { status })}
      </p>
      <h1 className="font-display mt-4 text-5xl leading-[1.05] sm:text-6xl">
        {missing ? t("Page not found") : t("Something went wrong")}
      </h1>
      <p className="text-sage mt-5 max-w-md">
        {missing
          ? t("The page you were looking for doesn't exist or may have moved.")
          : t(
              "We're sorry, something broke on our side. Please try again in a moment.",
            )}
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={root()}
          className="bg-pine text-ivory hover:bg-pine-deep focus-visible:ring-bronze rounded-full px-7 py-3 text-sm font-medium focus-visible:ring-2 focus-visible:outline-none"
        >
          {t("Back to the homepage")}
        </Link>
        <Link
          href={services()}
          className="border-pine/30 text-pine hover:bg-pine/5 focus-visible:ring-bronze rounded-full border px-7 py-3 text-sm font-medium focus-visible:ring-2 focus-visible:outline-none"
        >
          {t("Browse our services")}
        </Link>
      </div>
    </SiteLayout>
  )
}
