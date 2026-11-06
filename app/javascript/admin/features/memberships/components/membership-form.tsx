import { useForm } from "@inertiajs/react"

import {
  FormSection,
  SwitchField,
  TextField,
  TranslatedSection,
  asFieldErrors,
} from "@/admin/components/form-fields"
import { FormLayout } from "@/admin/components/form-layout"
import { LanguageSwitcher } from "@/admin/components/language-switcher"
import { NoLanguages } from "@/admin/components/no-languages"
import { MembershipBadge } from "@/admin/features/customers/components/membership-badge"
import type {
  MembershipDetail,
  MembershipTranslation,
} from "@/admin/features/memberships/types"
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
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"

const FIELDS = ["name", "description"] as const
type MembershipText = Record<(typeof FIELDS)[number], string>

/** Posted by MembershipForm as `membership[...]`. */
interface MembershipFormData {
  is_active: boolean
  egp_to_points: string
  points_to_egp: string
  background_color: string
  text_color: string
  translations: Record<number, MembershipText>
}

const toHex = (color: string) => (color.startsWith("#") ? color : `#${color}`)

/** Create/edit form for a membership tier, one language at a time. Posts `{ membership: {...} }`. */
export function MembershipForm({
  membership,
  translations,
  languages,
  action,
  cancelHref,
  submitLabel,
}: {
  membership: MembershipDetail
  translations: MembershipTranslation[]
  languages: AdminLanguage[]
  action: RouteDefinition<"post" | "patch">
  cancelHref: string
  submitLabel: string
}) {
  const form = useForm<MembershipFormData>({
    is_active: membership.is_active,
    egp_to_points: String(membership.egp_to_points),
    points_to_egp: String(membership.points_to_egp),
    background_color: toHex(membership.background_color),
    text_color: toHex(membership.text_color),
    translations: translationValues(translations, FIELDS),
  })
  const { data, setData, processing } = form
  const errors = formErrors(form)
  const tabs = useLanguageTabs(languages, errors)
  const { language } = tabs

  form.transform((values) => ({ membership: values }))

  if (!language) return <NoLanguages />

  const current = data.translations[language.id] ?? blankValues(FIELDS)
  const setTranslation = (patch: Partial<MembershipText>) =>
    setData((previous) =>
      patchTranslation(previous, language.id, patch, blankValues(FIELDS)),
    )
  // The badge preview shows this tab's name, else the default language's.
  const defaultLanguage = languages.find((l) => l.default)
  const previewName =
    [
      current.name,
      defaultLanguage ? data.translations[defaultLanguage.id]?.name : "",
    ]
      .map((name) => name?.trim())
      .find(Boolean) ?? "Tier name"
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
        <TextField
          id={`description_${language.code}`}
          label="Description"
          value={current.description}
          onChange={(description) => setTranslation({ description })}
          errors={tabs.errorFor("description")}
          {...text}
        />
      </TranslatedSection>

      <FormSection
        title="Points"
        description="How customers in this tier earn and spend points."
        shared
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="egp_to_points"
            label="Points earned per EGP spent"
            type="number"
            step="0.01"
            min="0"
            value={data.egp_to_points}
            onChange={(value) => setData("egp_to_points", value)}
            errors={errors.egp_to_points}
            required
          />
          <TextField
            id="points_to_egp"
            label="EGP value of one point"
            type="number"
            step="0.01"
            min="0"
            value={data.points_to_egp}
            onChange={(value) => setData("points_to_egp", value)}
            errors={errors.points_to_egp}
            required
          />
        </div>
      </FormSection>

      <FormSection title="Appearance" shared>
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField
            id="background_color"
            label="Background color"
            value={data.background_color}
            onChange={(value) => setData("background_color", value)}
            errors={errors.background_color}
          />
          <ColorField
            id="text_color"
            label="Text color"
            value={data.text_color}
            onChange={(value) => setData("text_color", value)}
            errors={errors.text_color}
          />
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">Preview</span>
          <MembershipBadge
            membership={{
              ...membership,
              name: previewName,
              background_color: data.background_color,
              text_color: data.text_color,
            }}
          />
        </div>
      </FormSection>

      <FormSection title="Status" shared>
        <SwitchField
          id="is_active"
          label="Active"
          description="Inactive tiers can't be assigned to new customers."
          checked={data.is_active}
          onChange={(checked) => setData("is_active", checked)}
        />
      </FormSection>
    </FormLayout>
  )
}

/** Hex color input with a native picker next to it. */
function ColorField({
  id,
  label,
  value,
  onChange,
  errors,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  errors?: string[]
}) {
  return (
    <Field data-invalid={errors ? true : undefined}>
      <FieldLabel htmlFor={id}>
        {label}
        <span aria-hidden className="text-destructive">
          *
        </span>
      </FieldLabel>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} picker`}
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-12 cursor-pointer rounded-md border bg-transparent p-1"
        />
        <Input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={errors ? true : undefined}
          className="font-mono"
        />
      </div>
      <FieldError errors={asFieldErrors(errors)} />
    </Field>
  )
}
