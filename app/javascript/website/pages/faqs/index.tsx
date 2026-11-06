import type { FaqItem } from "@/website/features/faqs/types"
import SiteLayout from "@/website/layouts/site-layout"
import { useI18n } from "@/website/lib/i18n"

interface Props {
  faqs: FaqItem[]
}

export default function FaqsIndex({ faqs }: Props) {
  const { t } = useI18n()

  return (
    <SiteLayout
      title={t("FAQ")}
      description={t("Answers to the questions we hear most often.")}
      mainClassName="mx-auto max-w-3xl px-6 py-16 sm:py-24"
    >
      <h1 dir="auto" className="font-display text-center text-4xl sm:text-5xl">
        {t("Frequently asked questions")}
      </h1>
      <p dir="auto" className="text-sage mt-4 text-center">
        {t("Answers to the questions we hear most often.")}
      </p>

      {faqs.length === 0 ? (
        <p dir="auto" className="text-sage mt-12 text-center">
          {t("No questions yet. Check back soon.")}
        </p>
      ) : (
        <div className="divide-pine/15 border-pine/15 mt-12 divide-y border-y">
          {faqs.map((faq) => (
            <details key={faq.id} className="group py-5">
              <summary
                dir="auto"
                className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium [&::-webkit-details-marker]:hidden"
              >
                {faq.question}
                <span
                  aria-hidden
                  className="text-2xl leading-none transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p dir="auto" className="text-sage mt-3 whitespace-pre-line">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      )}
    </SiteLayout>
  )
}
