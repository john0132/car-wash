import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import { PaymentMethodForm } from "@/admin/features/payments/components/payment-method-form"
import type {
  PaymentMethodDetail,
  PaymentMethodTranslation,
} from "@/admin/features/payments/types"
import AdminLayout from "@/admin/layouts/admin-layout"
import { adminPaymentMethods } from "@/routes"

interface Props {
  payment_method: PaymentMethodDetail
  translations: PaymentMethodTranslation[]
}

export default function PaymentMethodNew({
  payment_method,
  translations,
}: Props) {
  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Payment methods", href: adminPaymentMethods.index().url },
        { title: "New", href: adminPaymentMethods.new().url },
      ]}
    >
      <Head title="New payment method" />

      <div className="space-y-6 p-4">
        <PageHeader title="New payment method" />
        <PaymentMethodForm
          paymentMethod={payment_method}
          translations={translations}
          action={adminPaymentMethods.create()}
          cancelHref={adminPaymentMethods.index().url}
          submitLabel="Create method"
        />
      </div>
    </AdminLayout>
  )
}
