import { CheckoutForm } from "@/website/features/checkout/components/checkout-form"
import type { CheckoutProps } from "@/website/features/checkout/types"
import BookingLayout from "@/website/layouts/booking-layout"
import { useI18n } from "@/website/lib/i18n"

export default function CheckoutShow(props: CheckoutProps) {
  const { t } = useI18n()

  const name = props.summary.service.name ?? t("your service")

  return (
    <BookingLayout title={t("Book {name}", { name })}>
      <header className="mb-8 lg:mb-10">
        <p className="text-bronze text-sm tracking-[0.2em] uppercase">
          {t("Checkout")}
        </p>
        <h1 className="font-display mt-2 text-4xl leading-tight sm:text-5xl">
          {t("Book {name}", { name })}
        </h1>
      </header>
      <CheckoutForm {...props} />
    </BookingLayout>
  )
}
