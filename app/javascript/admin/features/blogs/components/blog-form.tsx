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
import { ImageUploadField } from "@/admin/components/image-upload-field"
import { LanguageSwitcher } from "@/admin/components/language-switcher"
import { RichTextEditor } from "@/admin/components/rich-text-editor"
import type { BlogDetail, BlogTranslation } from "@/admin/features/blogs/types"
import { errorLanguageCodes, textDirection } from "@/admin/lib/languages"
import type { AdminLanguage, ImageValue } from "@/admin/types"
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

type BlogTranslationValues = ContentMetaValues & { body: string }

interface BlogFormData {
  slug: string
  is_active: boolean
  cover_image: ImageValue | null
  translations: Record<number, BlogTranslationValues>
}

const translationValues = (
  t: Partial<BlogTranslation>,
): BlogTranslationValues => ({ ...contentMetaValues(t), body: t.body ?? "" })

/**
 * Create/edit form for a blog post, one language at a time. Posts
 * `{ blog: { slug, is_active, cover_image, translations: { <language_id>: {…} } } }`.
 */
export function BlogForm({
  blog,
  translations,
  action,
  cancelHref,
  submitLabel,
}: {
  blog: BlogDetail
  translations: BlogTranslation[]
  action: RouteDefinition<"post" | "patch">
  cancelHref: string
  submitLabel: string
}) {
  const languages: AdminLanguage[] = translations.map((t) => ({
    id: t.language_id,
    code: t.code,
    name: t.language,
    default: t.default,
  }))
  const defaultLanguage = languages.find((l) => l.default) ?? languages[0]
  const [code, setCode] = useState(defaultLanguage?.code ?? "")
  const language = languages.find((l) => l.code === code) ?? defaultLanguage
  const [slugTouched, setSlugTouched] = useState(Boolean(blog.slug))

  const form = useForm<BlogFormData>({
    slug: blog.slug,
    is_active: blog.is_active,
    cover_image: blog.cover_image,
    translations: Object.fromEntries(
      translations.map((t) => [t.language_id, translationValues(t)]),
    ),
  })
  const { data, setData, processing } = form
  const errors = form.errors as Record<string, string[] | undefined>

  form.transform((values) => ({
    blog: {
      slug: values.slug,
      is_active: values.is_active,
      cover_image: values.cover_image?.signed_id ?? "",
      translations: Object.fromEntries(
        Object.entries(values.translations).map(([id, t]) => [
          id,
          contentMetaParams(t),
        ]),
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

  const current = data.translations[language.id] ?? translationValues({})
  const errorFor = (attribute: string) =>
    errors[`translations.${language.id}.${attribute}`]

  const setTranslation = (patch: Partial<BlogTranslationValues>) =>
    setData((previous) => ({
      ...previous,
      translations: {
        ...previous.translations,
        [language.id]: {
          ...(previous.translations[language.id] ?? translationValues({})),
          ...patch,
        },
      },
      slug:
        !slugTouched && language.default && patch.title !== undefined
          ? slugify(patch.title)
          : previous.slug,
    }))

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
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

      <FormSection title="Post">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="slug"
            label="URL slug"
            description="Lowercase letters, numbers and dashes."
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
                Unpublished posts aren&apos;t shown on the website.
              </FieldDescription>
            </FieldContent>
          </Field>
        </div>
        <Field data-invalid={errors.cover_image ? true : undefined}>
          <FieldLabel htmlFor="cover_image">Cover image</FieldLabel>
          <ImageUploadField
            id="cover_image"
            value={data.cover_image}
            onChange={(image) => setData("cover_image", image)}
            invalid={Boolean(errors.cover_image)}
          />
          <FieldDescription>Shared by every language.</FieldDescription>
          <FieldError errors={asFieldErrors(errors.cover_image)} />
        </Field>
        <FieldError errors={asFieldErrors(errors.translations)} />
      </FormSection>

      <ContentMetaFields
        key={`meta-${language.code}`}
        language={language}
        values={current}
        onChange={setTranslation}
        errorFor={errorFor}
        nameDescription="A short label for dashboard lists."
      />

      <FormSection title={`Body · ${language.name}`}>
        <Field data-invalid={errorFor("body") ? true : undefined}>
          <FieldLabel htmlFor={`body_${language.code}`} className="sr-only">
            Body
          </FieldLabel>
          <RichTextEditor
            key={`body-${language.code}`}
            id={`body_${language.code}`}
            value={current.body}
            onChange={(body) => setTranslation({ body })}
            dir={textDirection(language.code)}
            lang={language.code}
            invalid={Boolean(errorFor("body"))}
          />
          <FieldError errors={asFieldErrors(errorFor("body"))} />
        </Field>
      </FormSection>
    </form>
  )
}
