import { useForm } from "@inertiajs/react"
import { useState } from "react"

import {
  FormSection,
  SwitchField,
  TextField,
  TextareaField,
  TranslatedSection,
  asFieldErrors,
} from "@/admin/components/form-fields"
import { FormLayout } from "@/admin/components/form-layout"
import { LanguageSwitcher } from "@/admin/components/language-switcher"
import { NoLanguages } from "@/admin/components/no-languages"
import { FieldListEditor } from "@/admin/features/components/components/field-list-editor"
import type {
  ComponentDetail,
  ComponentTranslation,
  FieldDraft,
} from "@/admin/features/components/types"
import { fieldKey, fromDraft, toDraft } from "@/admin/features/components/utils"
import { SectionFields } from "@/admin/features/pages/components/section-fields"
import type { FieldValues } from "@/admin/features/pages/types"
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
import { FieldError } from "@/shared/components/ui/field"

const FIELDS = ["name", "description"] as const
type ComponentText = Record<(typeof FIELDS)[number], string>

interface ComponentFormData {
  key: string
  is_active: boolean
  translations: Record<number, ComponentText>
}

/**
 * Create/edit form for a component type: its key, names and field schema,
 * with a live preview of the section editor pages will get. Posts
 * `{ component: { key, is_active, fields: [...], translations: {...} } }`.
 */
export function ComponentForm({
  component,
  translations,
  languages,
  action,
  cancelHref,
  submitLabel,
}: {
  component: ComponentDetail
  translations: ComponentTranslation[]
  languages: AdminLanguage[]
  action: RouteDefinition<"post" | "patch">
  cancelHref: string
  submitLabel: string
}) {
  const [keyTouched, setKeyTouched] = useState(Boolean(component.key))

  const form = useForm<ComponentFormData>({
    key: component.key,
    is_active: component.is_active,
    translations: translationValues(translations, FIELDS),
  })
  // Kept outside useForm (nested drafts are too deep for its types); added in transform.
  const [fields, setFields] = useState<FieldDraft[]>(() =>
    component.fields.map(toDraft),
  )
  const [preview, setPreview] = useState<{
    settings: FieldValues
    content: Record<number, FieldValues>
  }>({ settings: {}, content: {} })
  const [previewImages, setPreviewImages] = useState<Record<string, string>>({})

  const { data, setData, processing } = form
  const errors = formErrors(form)
  const tabs = useLanguageTabs(languages, errors)
  const { language } = tabs
  const schema = fields.map(fromDraft).filter((f) => f.key)

  form.transform((values) => ({
    component: { ...values, fields: fields.map(fromDraft) },
  }))

  if (!language) return <NoLanguages />

  const current = data.translations[language.id] ?? blankValues(FIELDS)
  const setTranslation = (patch: Partial<ComponentText>) =>
    setData((previous) => ({
      ...patchTranslation(previous, language.id, patch, blankValues(FIELDS)),
      // The key follows the default name until it's edited by hand.
      key:
        !keyTouched && language.default && patch.name !== undefined
          ? fieldKey(patch.name)
          : previous.key,
    }))
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
      width="full"
    >
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
        <div className="space-y-6">
          <TranslatedSection
            title="Name & description"
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
              {...text}
            />
            <TextareaField
              id={`description_${language.code}`}
              label="Description"
              description="Helps editors pick the right component."
              rows={2}
              value={current.description}
              onChange={(description) => setTranslation({ description })}
              errors={tabs.errorFor("description")}
              {...text}
            />
          </TranslatedSection>

          <FormSection title="Settings" shared>
            <TextField
              id="key"
              label="Key"
              className="font-mono sm:max-w-sm"
              description={
                component.in_use
                  ? "Locked: pages use this component."
                  : `How the website identifies it, e.g. testimonials.${keyTouched ? "" : " Follows the default language's name until you edit it."}`
              }
              value={data.key}
              disabled={component.in_use}
              onChange={(key) => {
                setKeyTouched(true)
                setData("key", key)
              }}
              errors={errors.key}
              required
            />
            <SwitchField
              id="is_active"
              label="Active"
              description="Disabled components can't be added to pages. Pages already using them keep them."
              checked={data.is_active}
              onChange={(checked) => setData("is_active", checked)}
            />
          </FormSection>

          <FormSection
            title="Fields"
            description="What editors fill in for each section. Text marked “different in each language” is translated; everything else is shared by all languages."
            shared
          >
            <FieldListEditor
              fields={fields}
              onChange={setFields}
              locked={component.locked_fields}
            />
            <FieldError errors={asFieldErrors(errors.fields)} />
          </FormSection>
        </div>

        <div className="xl:sticky xl:top-20">
          <FormSection
            title="Preview"
            description="The editor pages get for this component. Values typed here aren't saved."
          >
            <SectionFields
              idPrefix="preview"
              fields={schema}
              language={language}
              multilingual={languages.length > 1}
              settings={preview.settings}
              content={preview.content[language.id] ?? {}}
              imageUrls={previewImages}
              onImageUploaded={(image) =>
                setPreviewImages((urls) => ({
                  ...urls,
                  [image.signed_id]: image.url,
                }))
              }
              onChange={(settings, content) =>
                setPreview((current) => ({
                  settings,
                  content: { ...current.content, [language.id]: content },
                }))
              }
            />
          </FormSection>
        </div>
      </div>
    </FormLayout>
  )
}
