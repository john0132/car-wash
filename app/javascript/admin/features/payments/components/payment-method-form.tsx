import { useForm } from "@inertiajs/react"

import {
  FormSection,
  SwitchField,
  TextField,
  TranslatedSection,
} from "@/admin/components/form-fields"
import { FormLayout } from "@/admin/components/form-layout"
import { LanguageSwitcher } from "@/admin/components/language-switcher"
import { NoLanguages } from "@/admin/components/no-languages"
import type {
  PaymentMethodDetail,
  PaymentMethodTranslation,
} from "@/admin/features/payments/types"
import { useLanguageTabs } from "@/admin/hooks/use-language-tabs"
import { SUBMIT_OPTIONS, formErrors } from "@/admin/lib/forms"
import { emptyLanguageCodes, textDirection } from "@/admin/lib/languages"
import {
  blankValues,
  patchTranslation,
  translationValues,
} from "@/admin/lib/translations"
import type { AdminLanguage } from "@/admin/types"
import type { RouteDefinition } from "@/routes/runtime"

const FIELDS = ["name"] as const
type PaymentMethodText = Record<(typeof FIELDS)[number], string>

/** Fields posted by PaymentMethodForm as `payment_method[...]`. */
interface PaymentMethodFormData {
  code: string
  is_active: boolean
  translations: Record<number, PaymentMethodText>
}

/** Create/edit form for a payment method, one language at a time. Posts `{ payment_method: {...} }`. */
export function PaymentMethodForm({
  paymentMethod,
  translations,
  languages,
  action,
  cancelHref,
  submitLabel,
}: {
  paymentMethod: PaymentMethodDetail
  translations: PaymentMethodTranslation[]
  languages: AdminLanguage[]
  action: RouteDefinition<"post" | "patch">
  cancelHref: string
  submitLabel: string
}) {
  const form = useForm<PaymentMethodFormData>({
    code: paymentMethod.code,
    is_active: paymentMethod.is_active,
    translations: translationValues(translations, FIELDS),
  })
  const { data, setData, processing } = form
  const errors = formErrors(form)
  const tabs = useLanguageTabs(languages, errors)
  const { language } = tabs

  form.transform((values) => ({ payment_method: values }))

  if (!language) return <NoLanguages />

  const current = data.translations[language.id] ?? blankValues(FIELDS)

  return (
    <FormLayout
      onSubmit={() => form.submit(action, SUBMIT_OPTIONS)}
      tabs={
        <LanguageSwitcher
          languages={languages}
          value={language.code}
          onChange={tabs.setCode}
          errorCodes={tabs.errorCodes}
          emptyCodes={emptyLanguageCodes(data.translations, languages)}
        />
      }
      cancelHref={cancelHref}
      submitLabel={submitLabel}
      processing={processing}
    >
      <TranslatedSection
        title="Name"
        language={language}
        description={
          language.default
            ? "Shown to customers. Required in the default language."
            : undefined
        }
        baseError={tabs.baseError}
      >
        <TextField
          id={`name_${language.code}`}
          label="Name"
          value={current.name}
          onChange={(name) =>
            setData((previous) =>
              patchTranslation(
                previous,
                language.id,
                { name },
                blankValues(FIELDS),
              ),
            )
          }
          errors={tabs.errorFor("name")}
          required={language.default}
          dir={textDirection(language.code)}
          lang={language.code}
        />
      </TranslatedSection>

      <FormSection title="Settings" shared>
        <TextField
          id="code"
          label="Code"
          value={data.code}
          onChange={(code) => setData("code", code)}
          errors={errors.code}
          description="Stable identifier used by the system, e.g. cash, card or wallet."
          className="font-mono"
          placeholder="cash"
          required
        />
        <SwitchField
          id="is_active"
          label="Active"
          description="Disabled methods can't be chosen at checkout; past transactions are kept."
          checked={data.is_active}
          onChange={(checked) => setData("is_active", checked)}
        />
      </FormSection>
    </FormLayout>
  )
}
