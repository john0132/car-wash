import { CheckoutForm } from "@/website/features/checkout/components/checkout-form"
import type { CheckoutProps } from "@/website/features/checkout/types"
import BookingLayout from "@/website/layouts/booking-layout"

export default function CheckoutShow(props: CheckoutProps) {
  const name = props.summary.service.name ?? "your service"

  return (
    <BookingLayout title={`Book ${name}`}>
      <header className="mb-8 lg:mb-10">
        <p className="text-bronze text-sm tracking-[0.2em] uppercase">
          Checkout
        </p>
        <h1 className="font-display mt-2 text-4xl leading-tight sm:text-5xl">
          Book {name}
        </h1>
      </header>
      <CheckoutForm {...props} />
    </BookingLayout>
  )
}
