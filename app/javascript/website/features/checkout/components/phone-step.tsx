import { Field, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { brandInput } from "@/website/components/brand"
import { StepCard } from "@/website/features/checkout/components/step-card"
import { useI18n } from "@/website/lib/i18n"

/** Only shown when the account has no phone yet; saved to the profile on booking. */
export function PhoneStep({
  step,
  value,
  onChange,
  error,
}: {
  step: number
  value: string
  onChange: (phone: string) => void
  error?: string
}) {
  const { t } = useI18n()

  return (
    <StepCard
      step={step}
      title={t("Phone number")}
      description={t(
        "So our team can reach you on the day. We'll save it to your account.",
      )}
      error={error}
    >
      <Field>
        <FieldLabel htmlFor="checkout_phone" className="sr-only">
          {t("Phone number")}
        </FieldLabel>
        <Input
          id="checkout_phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="+20 100 123 4567"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          className={`${brandInput} h-12 px-4`}
          required
        />
      </Field>
    </StepCard>
  )
}
