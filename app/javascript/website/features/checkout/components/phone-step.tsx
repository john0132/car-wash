import { Field, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { StepCard } from "@/website/features/checkout/components/step-card"

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
  return (
    <StepCard
      step={step}
      title="Phone number"
      description="So our team can reach you on the day. We'll save it to your account."
      error={error}
    >
      <Field>
        <FieldLabel htmlFor="checkout_phone" className="sr-only">
          Phone number
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
          className="h-12 rounded-xl border-[#2B3A32]/25 bg-white px-4 text-[#2B3A32] dark:bg-white"
          required
        />
      </Field>
    </StepCard>
  )
}
