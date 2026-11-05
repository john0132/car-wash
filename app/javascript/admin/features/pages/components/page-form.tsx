import { Link, useForm } from "@inertiajs/react"
import { useState } from "react"

import {
  ContentMetaFields,
  type ContentMetaValues,
  contentMetaParams,
  contentMetaValues,
} from "@/admin/components/content-meta-fields"
import {
  FormSection,
  TextField,
  asFieldErrors,
  slugify,
} from "@/admin/components/form-fields"
import { LanguageSwitcher } from "@/admin/components/language-switcher"
import type { ComponentOption } from "@/admin/features/components/types"
import { SectionList } from "@/admin/features/pages/components/section-list"
import type {
  PageDetail,
  PageTranslation,
  SectionProps,
  SectionState,
} from "@/admin/features/pages/types"
import { sectionState } from "@/admin/features/pages/utils"
import { errorLanguageCodes } from "@/admin/lib/languages"
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

interface PageFormData {
  slug: string
  is_active: boolean
  translations: Record<number, ContentMetaValues>
}

/**
 * Create/edit form for a page: its slug, per-language text and its ordered
 * sections. One language is edited at a time; everything is saved together as
 * `{ page: { …, translations: { <language_id>: {…} }, sections: [...] } }`.
 */
export function PageForm({
  page,
  translations,
  sections,
  components,
  languages,
  action,
  cancelHref,
  submitLabel,
}: {
  page: PageDetail
  translations: PageTranslation[]
  sections: SectionProps[]
  components: ComponentOption[]
  languages: AdminLanguage[]
  action: RouteDefinition<"post" | "patch">
  cancelHref: string
  submitLabel: string
}) {
  const defaultLanguage = languages.find((l) => l.default) ?? languages[0]
  const [code, setCode] = useState(defaultLanguage?.code ?? "")
  const language = languages.find((l) => l.code === code) ?? defaultLanguage
  const [slugTouched, setSlugTouched] = useState(Boolean(page.slug))

  const form = useForm<PageFormData>({
    slug: page.slug,
    is_active: page.is_active,
    translations: Object.fromEntries(
      translations.map((t) => [t.language_id, contentMetaValues(t)]),
    ),
  })
  // Kept outside useForm: free-form JSON values are too deep for its form-data
  // types. form.transform below adds them to the submitted payload.
  const [sectionStates, setSectionStates] = useState<SectionState[]>(() =>
    sections.map(sectionState),
  )
  const { data, setData, processing } = form
  const errors = form.errors as Record<string, string[] | undefined>

  form.transform((values) => ({
    page: {
      slug: values.slug,
      is_active: values.is_active,
      translations: Object.fromEntries(
        Object.entries(values.translations).map(([id, t]) => [
          id,
          contentMetaParams(t),
        ]),
      ),
      sections: sectionStates.map(
        ({ id, component_id, is_active, settings, content }) => ({
          id,
          component_id,
          is_active,
          settings,
          content,
        }),
      ),
    },
  }))

  if (!language) {
    return (
      <p className="text-muted-foreground text-sm">
        No languages are set up yet. Add a Language record first.
      </p>
    )
  }

  const setTranslation = (patch: Partial<ContentMetaValues>) => {
    const current = data.translations[language.id] ?? contentMetaValues({})
    const next = { ...current, ...patch }
    setData((previous) => ({
      ...previous,
      translations: { ...previous.translations, [language.id]: next },
      slug:
        !slugTouched && language.default && patch.title !== undefined
          ? slugify(patch.title)
          : previous.slug,
    }))
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        // Keep unsaved edits when validation fails; reload fresh ids after a save.
        form.submit(action, { preserveScroll: true, preserveState: "errors" })
      }}
      className="max-w-4xl space-y-6"
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

      <FormSection title="Page">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="slug"
            label="URL slug"
            description="Lowercase letters, numbers and dashes, e.g. about-us."
            value={data.slug}
            onChange={(slug) => {
              setSlugTouched(true)
              setData("slug", slug)
            }}
            errors={errors.slug}
            required
          />
          <Field orientation="horizontal" className="sm:pt-6">
            <Switch
              id="is_active"
              checked={data.is_active}
              onCheckedChange={(checked) => setData("is_active", checked)}
            />
            <FieldContent>
              <FieldLabel htmlFor="is_active">Published</FieldLabel>
              <FieldDescription>
                Unpublished pages aren&apos;t shown on the website.
              </FieldDescription>
            </FieldContent>
          </Field>
        </div>
        <FieldError errors={asFieldErrors(errors.translations)} />
      </FormSection>

      <ContentMetaFields
        key={language.code}
        language={language}
        values={data.translations[language.id] ?? contentMetaValues({})}
        onChange={setTranslation}
        errorFor={(attribute) =>
          errors[`translations.${language.id}.${attribute}`]
        }
        nameDescription="Used in navigation and dashboard lists."
      />

      <section className="space-y-3" aria-labelledby="sections-heading">
        <div className="space-y-1">
          <h2 id="sections-heading" className="font-medium">
            Sections · {language.name}
          </h2>
          <p className="text-muted-foreground text-sm">
            The page is built from these components, top to bottom. Text is
            edited per language; fields marked with a globe are shared by every
            language.
          </p>
          <FieldError errors={asFieldErrors(errors.sections)} />
        </div>
        <SectionList
          sections={sectionStates}
          onChange={setSectionStates}
          components={components}
          language={language}
          multilingual={languages.length > 1}
          errors={errors}
        />
      </section>
    </form>
  )
}
