import { Head } from "@inertiajs/react"

import { SiteFooter } from "@/website/components/site-footer"
import { SiteHeader } from "@/website/components/site-header"
import type { FaqItem } from "@/website/features/faqs/types"

interface Props {
  faqs: FaqItem[]
}

export default function FaqsIndex({ faqs }: Props) {
  return (
    <>
      <Head title="FAQ">
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
          content="Answers to the questions we hear most often."
        />
      </Head>

      <div
        style={{ fontFamily: "'Jost', system-ui, sans-serif" }}
        className="bg-[#F6F1E7] text-[#2B3A32]"
      >
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
          <h1
            style={{ fontFamily: "'Italiana', serif" }}
            className="text-center text-4xl sm:text-5xl"
          >
            Frequently asked questions
          </h1>
          <p className="mt-4 text-center text-[#5B6B5E]">
            Answers to the questions we hear most often.
          </p>

          {faqs.length === 0 ? (
            <p className="mt-12 text-center text-[#5B6B5E]">
              No questions yet. Check back soon.
            </p>
          ) : (
            <div className="mt-12 divide-y divide-[#2B3A32]/15 border-y border-[#2B3A32]/15">
              {faqs.map((faq) => (
                <details key={faq.id} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <span
                      aria-hidden
                      className="text-2xl leading-none transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 whitespace-pre-line text-[#5B6B5E]">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          )}
        </main>
        <SiteFooter />
      </div>
    </>
  )
}
