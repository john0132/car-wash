import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import { PaymentMethodForm } from "@/admin/features/payments/components/payment-method-form"
import type {
  PaymentMethodDetail,
  PaymentMethodTranslation,
} from "@/admin/features/payments/types"
import AdminLayout from "@/admin/layouts/admin-layout"
import type { AdminLanguage } from "@/admin/types"
import { adminPaymentMethods } from "@/routes"

interface Props {
  payment_method: PaymentMethodDetail
  translations: PaymentMethodTranslation[]
  languages: AdminLanguage[]
}

export default function PaymentMethodNew({
  payment_method,
  translations,
  languages,
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
          languages={languages}
          action={adminPaymentMethods.create()}
          cancelHref={adminPaymentMethods.index().url}
          submitLabel="Create method"
        />
      </div>
    </AdminLayout>
  )
}
