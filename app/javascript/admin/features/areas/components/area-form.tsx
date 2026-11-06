import { Link, useForm } from "@inertiajs/react"
import type { ReactNode } from "react"

import { asFieldErrors } from "@/admin/components/form-fields"
import {
  type TranslationEntry,
  TranslationFields,
  translationParams,
} from "@/admin/components/translation-fields"
import { GeofenceEditor } from "@/admin/features/areas/components/geofence-editor"
import type {
  AreaDetail,
  CityOption,
  GeoJsonPolygon,
  ReferenceArea,
} from "@/admin/features/areas/types"
import type { RouteDefinition } from "@/routes/runtime"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Spinner } from "@/shared/components/ui/spinner"
import { Switch } from "@/shared/components/ui/switch"

interface AreaFormData {
  city_id: number | null
  rate: string
  is_active: boolean
  geofence: GeoJsonPolygon | null
  translations: TranslationEntry[]
}

/**
 * Create/edit form for an area. Posts `{ area: {...} }` with the geofence as a
 * GeoJSON Polygon string (Area#geofence_geojson=).
 */
export function AreaForm({
  area,
  cityId,
  translations,
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
    translations,
  })
  const { data, setData, processing } = form
  // Rails also reports `city` (the belongs_to), which isn't a form field.
  const errors = form.errors as Record<string, string[] | undefined>

  form.transform((values) => ({
    area: {
      city_id: values.city_id,
      rate: values.rate,
      is_active: values.is_active,
      geofence: values.geofence ? JSON.stringify(values.geofence) : "",
      translations: translationParams(values.translations),
    },
  }))

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        form.submit(action, { preserveScroll: true })
      }}
      className="space-y-6"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Section title="Details">
          <Field data-invalid={errors.city ? true : undefined}>
            <FieldLabel htmlFor="city_id">City</FieldLabel>
            <Select
              value={data.city_id ? String(data.city_id) : ""}
              onValueChange={(value) => setData("city_id", Number(value))}
            >
              <SelectTrigger
                id="city_id"
                className="w-full"
                aria-invalid={errors.city ? true : undefined}
              >
                <SelectValue placeholder="Choose a city" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={String(city.id)}>
                    {city.name}
                    {city.is_active ? "" : " (disabled)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={asFieldErrors(errors.city)} />
          </Field>

          <TranslationFields
            translations={data.translations}
            onChange={(value) => setData("translations", value)}
            errors={errors.translations}
          />

          <Field data-invalid={errors.rate ? true : undefined}>
            <FieldLabel htmlFor="rate">Rate</FieldLabel>
            <Input
              id="rate"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              value={data.rate}
              onChange={(event) => setData("rate", event.target.value)}
              aria-invalid={errors.rate ? true : undefined}
              required
              className="max-w-40"
            />
            <FieldError errors={asFieldErrors(errors.rate)} />
          </Field>

          <Field orientation="horizontal">
            <Switch
              id="is_active"
              checked={data.is_active}
              onCheckedChange={(checked) => setData("is_active", checked)}
            />
            <FieldContent>
              <FieldLabel htmlFor="is_active">Active</FieldLabel>
              <FieldDescription>
                Turn off to take the area out of service without deleting it.
              </FieldDescription>
            </FieldContent>
          </Field>
        </Section>

        <Section
          title="Coverage"
          description="Draw the area's boundary with the polygon or rectangle tool. Drag the corners to adjust it. Drawing a new shape replaces the current one. Other areas are shown in grey."
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
        </Section>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={processing}>
          {processing && <Spinner />}
          {submitLabel}
        </Button>
        <Button variant="ghost" asChild>
          <Link href={cancelHref}>Cancel</Link>
        </Button>
      </div>
    </form>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <h2 className="font-medium">{title}</h2>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}
