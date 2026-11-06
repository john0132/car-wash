import { Link, useForm } from "@inertiajs/react"
import { useState } from "react"

import {
  FormSection,
  TextField,
  TextareaField,
  asFieldErrors,
} from "@/admin/components/form-fields"
import { LanguageSwitcher } from "@/admin/components/language-switcher"
import type { FaqDetail, FaqTranslation } from "@/admin/features/faqs/types"
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
import { Input } from "@/shared/components/ui/input"
import { Spinner } from "@/shared/components/ui/spinner"
import { Switch } from "@/shared/components/ui/switch"

interface FaqFormData {
  sort_order: number
  is_active: boolean
  translations: Record<number, { question: string; answer: string }>
}

const EMPTY_TRANSLATION = { question: "", answer: "" }

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
  const defaultLanguage = languages.find((l) => l.default) ?? languages[0]
  const [code, setCode] = useState(defaultLanguage?.code ?? "")
  const language = languages.find((l) => l.code === code) ?? defaultLanguage

  const form = useForm<FaqFormData>({
    sort_order: faq.sort_order,
    is_active: faq.is_active,
    translations: Object.fromEntries(
      translations.map((t) => [
        t.language_id,
        { question: t.question, answer: t.answer },
      ]),
    ),
  })
  const { data, setData, processing } = form
  const errors = form.errors as Record<string, string[] | undefined>

  form.transform((values) => ({ faq: values }))

  if (!language) {
    return (
      <p className="text-muted-foreground text-sm">
        No languages are set up yet. Add a Language record first.
      </p>
    )
  }

  const translation = data.translations[language.id] ?? EMPTY_TRANSLATION
  const setTranslation = (patch: Partial<typeof translation>) =>
    setData((previous) => ({
      ...previous,
      translations: {
        ...previous.translations,
        [language.id]: { ...translation, ...patch },
      },
    }))
  const translationError = (attribute: string) =>
    errors[`translations.${language.id}.${attribute}`]

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        form.submit(action, { preserveScroll: true, preserveState: "errors" })
      }}
      className="max-w-3xl space-y-6"
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

      <FormSection title={`Question & answer · ${language.name}`}>
        <TextField
          id={`question_${language.code}`}
          label="Question"
          value={translation.question}
          onChange={(question) => setTranslation({ question })}
          errors={translationError("question")}
          required={language.default}
          dir={textDirection(language.code)}
          lang={language.code}
        />
        <TextareaField
          id={`answer_${language.code}`}
          label="Answer"
          rows={4}
          value={translation.answer}
          onChange={(answer) => setTranslation({ answer })}
          errors={translationError("answer")}
          required={language.default}
          dir={textDirection(language.code)}
          lang={language.code}
        />
        <FieldError errors={asFieldErrors(errors.translations)} />
      </FormSection>

      <FormSection title="Display">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={errors.sort_order ? true : undefined}>
            <FieldLabel htmlFor="sort_order">Sort order</FieldLabel>
            <Input
              id="sort_order"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={data.sort_order}
              onChange={(event) =>
                setData("sort_order", Number(event.target.value))
              }
              aria-invalid={errors.sort_order ? true : undefined}
            />
            <FieldDescription>
              Lower numbers show first on the website.
            </FieldDescription>
            <FieldError errors={asFieldErrors(errors.sort_order)} />
          </Field>

          <Field orientation="horizontal" className="sm:pt-6">
            <Switch
              id="is_active"
              checked={data.is_active}
              onCheckedChange={(checked) => setData("is_active", checked)}
            />
            <FieldContent>
              <FieldLabel htmlFor="is_active">Active</FieldLabel>
              <FieldDescription>
                Unpublished FAQs aren&apos;t shown on the website.
              </FieldDescription>
            </FieldContent>
          </Field>
        </div>
      </FormSection>
    </form>
  )
}
