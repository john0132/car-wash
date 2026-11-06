import { CheckoutForm } from "@/website/features/checkout/components/checkout-form"
import type { CheckoutProps } from "@/website/features/checkout/types"
import BookingLayout from "@/website/layouts/booking-layout"

export default function CheckoutShow(props: CheckoutProps) {
  const name = props.summary.service.name ?? "your service"

  return (
    <BookingLayout title={`Book ${name} — Auto Atelier`}>
      <header className="mb-8 lg:mb-10">
        <p className="text-sm tracking-[0.2em] text-[#8A6240] uppercase">
          Checkout
        </p>
        <h1
          style={{ fontFamily: "'Italiana', serif" }}
          className="mt-2 text-4xl leading-tight sm:text-5xl"
        >
          Book {name}
        </h1>
      </header>
      <CheckoutForm {...props} />
    </BookingLayout>
  )
}
