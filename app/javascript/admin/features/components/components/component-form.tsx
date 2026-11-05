import { Link, useForm } from "@inertiajs/react"
import { useState } from "react"

import {
  FormSection,
  TextField,
  TextareaField,
  asFieldErrors,
} from "@/admin/components/form-fields"
import { LanguageSwitcher } from "@/admin/components/language-switcher"
import { FieldListEditor } from "@/admin/features/components/components/field-list-editor"
import type {
  ComponentDetail,
  ComponentTranslation,
  FieldDraft,
} from "@/admin/features/components/types"
import { fieldKey, fromDraft, toDraft } from "@/admin/features/components/utils"
import { SectionFields } from "@/admin/features/pages/components/section-fields"
import type { FieldValues } from "@/admin/features/pages/types"
import { errorLanguageCodes, textDirection } from "@/admin/lib/languages"
import type { AdminLanguage } from "@/admin/types"
import type { RouteDefinition } from "@/routes/runtime"
import { Button } from "@/shared/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field"
import { Spinner } from "@/shared/components/ui/spinner"
import { Switch } from "@/shared/components/ui/switch"

interface ComponentFormData {
  key: string
  is_active: boolean
  translations: Record<number, { name: string; description: string }>
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
  const defaultLanguage = languages.find((l) => l.default) ?? languages[0]
  const [code, setCode] = useState(defaultLanguage?.code ?? "")
  const language = languages.find((l) => l.code === code) ?? defaultLanguage
  const [keyTouched, setKeyTouched] = useState(Boolean(component.key))

  const form = useForm<ComponentFormData>({
    key: component.key,
    is_active: component.is_active,
    translations: Object.fromEntries(
      translations.map((t) => [
        t.language_id,
        { name: t.name, description: t.description },
      ]),
    ),
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
  const errors = form.errors as Record<string, string[] | undefined>
  const schema = fields.map(fromDraft).filter((f) => f.key)

  form.transform((values) => ({
    component: { ...values, fields: fields.map(fromDraft) },
  }))

  if (!language) {
    return (
      <p className="text-muted-foreground text-sm">
        No languages are set up yet. Add a Language record first.
      </p>
    )
  }

  const translation = data.translations[language.id] ?? {
    name: "",
    description: "",
  }
  const setTranslation = (patch: Partial<typeof translation>) =>
    setData((previous) => ({
      ...previous,
      translations: {
        ...previous.translations,
        [language.id]: { ...translation, ...patch },
      },
      key:
        !keyTouched && language.default && patch.name !== undefined
          ? fieldKey(patch.name)
          : previous.key,
    }))
  const translationError = (attribute: string) =>
    errors[`translations.${language.id}.${attribute}`]

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        form.submit(action, { preserveScroll: true, preserveState: "errors" })
      }}
      className="space-y-6"
    >
      <div className="bg-background/95 supports-backdrop-filter:bg-background/80 sticky top-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur">
        <LanguageSwitcher
          languages={languages}
          value={language.code}
          onChange={setCode}
          errorCodes={errorLanguageCodes(errors, languages)}
        />
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href={cancelHref}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={processing}>
            {processing && <Spinner />}
            {submitLabel}
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
        <div className="space-y-6">
          <FormSection title="Component">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                id={`name_${language.code}`}
                label={`Name (${language.name})`}
                value={translation.name}
                onChange={(name) => setTranslation({ name })}
                errors={translationError("name")}
                required={language.default}
                dir={textDirection(language.code)}
                lang={language.code}
              />
              <TextField
                id="key"
                label="Key"
                className="font-mono"
                description={
                  component.in_use
                    ? "Locked: pages use this component."
                    : "How the website identifies it, e.g. testimonials."
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
            </div>
            <TextareaField
              id={`description_${language.code}`}
              label={`Description (${language.name})`}
              description="Helps editors pick the right component."
              rows={2}
              value={translation.description}
              onChange={(description) => setTranslation({ description })}
              errors={translationError("description")}
              dir={textDirection(language.code)}
              lang={language.code}
            />
            <Field orientation="horizontal">
              <Switch
                id="is_active"
                checked={data.is_active}
                onCheckedChange={(checked) => setData("is_active", checked)}
              />
              <FieldContent>
                <FieldLabel htmlFor="is_active">Active</FieldLabel>
                <FieldDescription>
                  Disabled components can&apos;t be added to pages. Pages
                  already using them keep them.
                </FieldDescription>
              </FieldContent>
            </Field>
            <FieldError errors={asFieldErrors(errors.translations)} />
          </FormSection>

          <FormSection
            title="Fields"
            description="What editors fill in for each section. Text marked “different in each language” is translated; everything else is shared by all languages."
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
    </form>
  )
}
