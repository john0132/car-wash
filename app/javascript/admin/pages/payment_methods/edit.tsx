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
  payment_method: PaymentMethodDetail & { id: number }
  translations: PaymentMethodTranslation[]
  languages: AdminLanguage[]
}

export default function PaymentMethodEdit({
  payment_method,
  translations,
  languages,
}: Props) {
  const title = payment_method.name ?? payment_method.code

  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Payment methods", href: adminPaymentMethods.index().url },
        { title, href: adminPaymentMethods.edit(payment_method.id).url },
      ]}
    >
      <Head title={`Edit ${title}`} />

      <div className="space-y-6 p-4">
        <PageHeader title={`Edit ${title}`} />
        <PaymentMethodForm
          paymentMethod={payment_method}
          translations={translations}
          languages={languages}
          action={adminPaymentMethods.update(payment_method.id)}
          cancelHref={adminPaymentMethods.index().url}
          submitLabel="Save changes"
        />
      </div>
    </AdminLayout>
  )
}
