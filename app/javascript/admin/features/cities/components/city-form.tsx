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
import { useLanguageTabs } from "@/admin/hooks/use-language-tabs"
import { SUBMIT_OPTIONS, formErrors } from "@/admin/lib/forms"
import { emptyLanguageCodes, textDirection } from "@/admin/lib/languages"
import {
  blankValues,
  patchTranslation,
  translationValues,
} from "@/admin/lib/translations"
import type { AdminLanguage, TranslationEntry } from "@/admin/types"
import type { RouteDefinition } from "@/routes/runtime"

const FIELDS = ["name"] as const
type CityText = Record<(typeof FIELDS)[number], string>

interface CityFormData {
  is_active: boolean
  translations: Record<number, CityText>
}

/**
 * Create/edit form for a city, one language at a time. Posts
 * `{ city: { is_active, translations: { <language_id>: { name } } } }`.
 */
export function CityForm({
  isActive,
  translations,
  languages,
  action,
  cancelHref,
  submitLabel,
}: {
  isActive: boolean
  translations: TranslationEntry[]
  languages: AdminLanguage[]
  action: RouteDefinition<"post" | "patch">
  cancelHref: string
  submitLabel: string
}) {
  const form = useForm<CityFormData>({
    is_active: isActive,
    translations: translationValues(translations, FIELDS),
  })
  const { data, setData, processing } = form
  const errors = formErrors(form)
  const tabs = useLanguageTabs(languages, errors)
  const { language } = tabs

  form.transform((values) => ({ city: values }))

  if (!language) return <NoLanguages />

  const current = data.translations[language.id] ?? blankValues(FIELDS)
  const setTranslation = (patch: Partial<CityText>) =>
    setData((previous) =>
      patchTranslation(previous, language.id, patch, blankValues(FIELDS)),
    )

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
        baseError={tabs.baseError}
      >
        <TextField
          id={`name_${language.code}`}
          label="Name"
          value={current.name}
          onChange={(name) => setTranslation({ name })}
          errors={tabs.errorFor("name")}
          required={language.default}
          dir={textDirection(language.code)}
          lang={language.code}
        />
      </TranslatedSection>

      <FormSection title="Status" shared>
        <SwitchField
          id="is_active"
          label="Active"
          description="Turn off to take the city out of service without deleting it."
          checked={data.is_active}
          onChange={(checked) => setData("is_active", checked)}
        />
      </FormSection>
    </FormLayout>
  )
}
