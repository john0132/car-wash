import { useForm } from "@inertiajs/react"

import {
  FormSection,
  SelectField,
  SwitchField,
  TextField,
  TranslatedSection,
  asFieldErrors,
} from "@/admin/components/form-fields"
import { FormLayout } from "@/admin/components/form-layout"
import { LanguageSwitcher } from "@/admin/components/language-switcher"
import { NoLanguages } from "@/admin/components/no-languages"
import { GeofenceEditor } from "@/admin/features/areas/components/geofence-editor"
import type {
  AreaDetail,
  CityOption,
  GeoJsonPolygon,
  ReferenceArea,
} from "@/admin/features/areas/types"
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
import {
  Field,
  FieldDescription,
  FieldError,
} from "@/shared/components/ui/field"

const FIELDS = ["name"] as const
type AreaText = Record<(typeof FIELDS)[number], string>

interface AreaFormData {
  city_id: number | null
  rate: string
  is_active: boolean
  geofence: GeoJsonPolygon | null
  translations: Record<number, AreaText>
}

/**
 * Create/edit form for an area, one language at a time. Posts `{ area: {...} }`
 * with the geofence as a GeoJSON Polygon string (Area#geofence_geojson=).
 */
export function AreaForm({
  area,
  cityId,
  translations,
  languages,
  cities,
  referenceAreas,
  action,
  cancelHref,
  submitLabel,
}: {
  area: AreaDetail | null
  /** Preselected city for a new area. */
  cityId: number | null
  translations: TranslationEntry[]
  languages: AdminLanguage[]
  cities: CityOption[]
  referenceAreas: ReferenceArea[]
  action: RouteDefinition<"post" | "patch">
  cancelHref: string
  submitLabel: string
}) {
  const form = useForm<AreaFormData>({
    city_id: area?.city.id ?? cityId,
    rate: area ? String(area.rate) : "1.00",
    is_active: area?.is_active ?? true,
    geofence: area?.geofence ?? null,
    translations: translationValues(translations, FIELDS),
  })
  const { data, setData, processing } = form
  // Rails also reports `city` (the belongs_to), which isn't a form field.
  const errors = formErrors(form)
  const tabs = useLanguageTabs(languages, errors)
  const { language } = tabs

  form.transform((values) => ({
    area: {
      ...values,
      geofence: values.geofence ? JSON.stringify(values.geofence) : "",
    },
  }))

  if (!language) return <NoLanguages />

  const current = data.translations[language.id] ?? blankValues(FIELDS)
  const setTranslation = (patch: Partial<AreaText>) =>
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
      width="full"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="space-y-6">
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

          <FormSection title="Details" shared>
            <SelectField
              id="city_id"
              label="City"
              value={data.city_id ? String(data.city_id) : ""}
              onChange={(value) => setData("city_id", Number(value))}
              placeholder="Choose a city"
              options={cities.map((city) => ({
                value: String(city.id),
                label: city.is_active ? city.name : `${city.name} (disabled)`,
              }))}
              errors={errors.city}
              required
            />
            <TextField
              id="rate"
              label="Rate"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              value={data.rate}
              onChange={(value) => setData("rate", value)}
              errors={errors.rate}
              required
              className="max-w-40"
            />
            <SwitchField
              id="is_active"
              label="Active"
              description="Turn off to take the area out of service without deleting it."
              checked={data.is_active}
              onChange={(checked) => setData("is_active", checked)}
            />
          </FormSection>
        </div>

        <FormSection
          title="Coverage"
          description="Draw the area's boundary with the polygon or rectangle tool. Drag the corners to adjust it. Drawing a new shape replaces the current one. Other areas are shown in grey."
          shared
        >
          <Field data-invalid={errors.geofence ? true : undefined}>
            <GeofenceEditor
              value={data.geofence}
              onChange={(value) => setData("geofence", value)}
              referenceAreas={referenceAreas}
              cityId={data.city_id}
            />
            <FieldDescription>
              {data.geofence
                ? `${data.geofence.coordinates[0].length - 1} points`
                : "No boundary drawn yet."}
            </FieldDescription>
            <FieldError errors={asFieldErrors(errors.geofence)} />
          </Field>
        </FormSection>
      </div>
    </FormLayout>
  )
}
