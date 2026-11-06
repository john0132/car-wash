import { Form } from "@inertiajs/react"

import { websiteContacts } from "@/routes"
import { Button } from "@/shared/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Spinner } from "@/shared/components/ui/spinner"
import { Textarea } from "@/shared/components/ui/textarea"
import type { ContactDefaults } from "@/website/features/contact/types"
import type { PageProps } from "@/website/features/page-sections/types"
import MarketingLayout from "@/website/layouts/marketing-layout"

interface Props {
  page: PageProps
  defaults: ContactDefaults
}

export default function ContactShow({ page, defaults }: Props) {
  return (
    <MarketingLayout
      page={page}
      fallbackTitle="Contact us — Auto Atelier"
      emptyMessage=""
      afterHero={
        <section className="mx-auto max-w-2xl px-6 py-16">
          <Form
            action={websiteContacts.create()}
            transform={(data) => ({ contact_message: data })}
            resetOnSuccess
            className="flex flex-col gap-6"
          >
            {({ processing, errors }) => {
              const error = (field: string) =>
                errors[`contact_message.${field}`] ?? errors[field]
              const messages = (field: string) =>
                [error(field)]
                  .flat()
                  .filter(Boolean)
                  .map((message) => ({
                    message: String(message),
                  }))

              return (
                <FieldGroup>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="first_name">First name</FieldLabel>
                      <Input
                        id="first_name"
                        name="first_name"
                        required
                        autoComplete="given-name"
                        defaultValue={defaults.first_name ?? ""}
                      />
                      <FieldError errors={messages("first_name")} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="last_name">Last name</FieldLabel>
                      <Input
                        id="last_name"
                        name="last_name"
                        required
                        autoComplete="family-name"
                        defaultValue={defaults.last_name ?? ""}
                      />
                      <FieldError errors={messages("last_name")} />
                    </Field>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="email">Email address</FieldLabel>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        defaultValue={defaults.email ?? ""}
                      />
                      <FieldError errors={messages("email")} />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="phone">Phone</FieldLabel>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                      />
                      <FieldError errors={messages("phone")} />
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="message">Message</FieldLabel>
                    <Textarea id="message" name="message" rows={6} required />
                    <FieldError errors={messages("message")} />
                  </Field>

                  <Button
                    type="submit"
                    disabled={processing}
                    className="h-11 w-full rounded-full bg-[#2B3A32] text-[#F6F1E7] hover:bg-[#1F2B25]"
                  >
                    {processing && <Spinner />}
                    Send message
                  </Button>
                </FieldGroup>
              )
            }}
          </Form>
        </section>
      }
    />
  )
}
