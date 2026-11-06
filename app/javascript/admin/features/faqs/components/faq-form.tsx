import { useForm } from "@inertiajs/react"

import {
  FormSection,
  SwitchField,
  TextField,
  TextareaField,
  TranslatedSection,
} from "@/admin/components/form-fields"
import { FormLayout } from "@/admin/components/form-layout"
import { LanguageSwitcher } from "@/admin/components/language-switcher"
import { NoLanguages } from "@/admin/components/no-languages"
import type { FaqDetail, FaqTranslation } from "@/admin/features/faqs/types"
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

const FIELDS = ["question", "answer"] as const
type FaqText = Record<(typeof FIELDS)[number], string>

interface FaqFormData {
  sort_order: number
  is_active: boolean
  translations: Record<number, FaqText>
}

/**
 * Create/edit form for an FAQ, one language at a time. Posts
 * `{ faq: { sort_order, is_active, translations: { <language_id>: {...} } } }`.
 */
export function FaqForm({
  faq,
  translations,
  languages,
  action,
  cancelHref,
  submitLabel,
}: {
  faq: FaqDetail
  translations: FaqTranslation[]
  languages: AdminLanguage[]
  action: RouteDefinition<"post" | "patch">
  cancelHref: string
  submitLabel: string
}) {
  const form = useForm<FaqFormData>({
    sort_order: faq.sort_order,
    is_active: faq.is_active,
    translations: translationValues(translations, FIELDS),
  })
  const { data, setData, processing } = form
  const errors = formErrors(form)
  const tabs = useLanguageTabs(languages, errors)
  const { language } = tabs

  form.transform((values) => ({ faq: values }))

  if (!language) return <NoLanguages />

  const current = data.translations[language.id] ?? blankValues(FIELDS)
  const setTranslation = (patch: Partial<FaqText>) =>
    setData((previous) =>
      patchTranslation(previous, language.id, patch, blankValues(FIELDS)),
    )
  const text = { dir: textDirection(language.code), lang: language.code }

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
        title="Question & answer"
        language={language}
        baseError={tabs.baseError}
      >
        <TextField
          id={`question_${language.code}`}
          label="Question"
          value={current.question}
          onChange={(question) => setTranslation({ question })}
          errors={tabs.errorFor("question")}
          required={language.default}
          {...text}
        />
        <TextareaField
          id={`answer_${language.code}`}
          label="Answer"
          rows={4}
          value={current.answer}
          onChange={(answer) => setTranslation({ answer })}
          errors={tabs.errorFor("answer")}
          required={language.default}
          {...text}
        />
      </TranslatedSection>

      <FormSection title="Display" shared>
        <TextField
          id="sort_order"
          label="Sort order"
          type="number"
          inputMode="numeric"
          min="0"
          step="1"
          value={String(data.sort_order)}
          onChange={(value) => setData("sort_order", Number(value))}
          errors={errors.sort_order}
          description="Lower numbers show first on the website."
          className="sm:max-w-40"
        />
        <SwitchField
          id="is_active"
          label="Published"
          description="Unpublished FAQs aren't shown on the website."
          checked={data.is_active}
          onChange={(checked) => setData("is_active", checked)}
        />
      </FormSection>
    </FormLayout>
  )
}
