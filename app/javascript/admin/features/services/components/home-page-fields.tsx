import { asFieldErrors } from "@/admin/components/form-fields"
import { ImageUploadField } from "@/admin/components/image-upload-field"
import type { ImageValue } from "@/admin/types"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field"
import { Switch } from "@/shared/components/ui/switch"

/** Image + "Display on Homepage" switch, shared by the service and category forms. */
export function HomePageFields({
  noun,
  image,
  onImageChange,
  display,
  onDisplayChange,
  errors,
}: {
  /** "service" or "category", for the help text. */
  noun: string
  image: ImageValue | null
  onImageChange: (image: ImageValue | null) => void
  display: boolean
  onDisplayChange: (display: boolean) => void
  errors: { image?: string[]; display_in_home_page?: string[] }
}) {
  return (
    <>
      <Field data-invalid={errors.image ? true : undefined}>
        <FieldLabel htmlFor="image">Image</FieldLabel>
        <ImageUploadField
          id="image"
          value={image}
          onChange={onImageChange}
          invalid={Boolean(errors.image)}
        />
        <FieldDescription>
          Shown on the homepage card. A landscape photo works best.
        </FieldDescription>
        <FieldError errors={asFieldErrors(errors.image)} />
      </Field>

      <Field
        orientation="horizontal"
        data-invalid={errors.display_in_home_page ? true : undefined}
      >
        <Switch
          id="display_in_home_page"
          checked={display}
          onCheckedChange={onDisplayChange}
        />
        <FieldContent>
          <FieldLabel htmlFor="display_in_home_page">
            Display on Homepage
          </FieldLabel>
          <FieldDescription>
            Features this {noun} on the public homepage. Disabled {noun}s are
            never shown, whatever this is set to.
          </FieldDescription>
          <FieldError errors={asFieldErrors(errors.display_in_home_page)} />
        </FieldContent>
      </Field>
    </>
  )
}
