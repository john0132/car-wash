import { Form } from "@inertiajs/react"
import { CircleCheck, Clock, MessageCircle, ShieldCheck } from "lucide-react"
import { useState } from "react"

import { websiteContacts } from "@/routes"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Spinner } from "@/shared/components/ui/spinner"
import { Textarea } from "@/shared/components/ui/textarea"
import { brandInput } from "@/website/components/brand"
import type { ContactDefaults } from "@/website/features/contact/types"
import type { PageProps } from "@/website/features/page-sections/types"
import MarketingLayout from "@/website/layouts/marketing-layout"

const inputClass = `${brandInput} h-12 px-4`

const Required = () => (
  <span className="text-bronze" aria-hidden>
    *
  </span>
)

const reassurances = [
  {
    icon: Clock,
    title: "Quick replies",
    text: "We answer every message within one working day.",
  },
  {
    icon: MessageCircle,
    title: "Real people",
    text: "Talk to the team who will actually care for your car.",
  },
  {
    icon: ShieldCheck,
    title: "No pressure",
    text: "Ask anything — there is no obligation to book.",
  },
]

interface Props {
  page: PageProps
  defaults: ContactDefaults
}

export default function ContactShow({ page, defaults }: Props) {
  const [sent, setSent] = useState(false)

  return (
    <>
      <MarketingLayout
        page={page}
        fallbackTitle="Contact us — Auto Atelier"
        emptyMessage=""
        afterHero={
          <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-5 lg:gap-16 lg:py-24">
            <div className="lg:col-span-2">
              <h2 className="font-display text-pine text-3xl sm:text-4xl">
                Let&apos;s talk about your car
              </h2>
              <p className="text-sage mt-4 leading-relaxed">
                Questions about a service, a custom request or an existing
                booking? Send us a note and we&apos;ll get back to you.
              </p>
              <ul className="mt-8 flex flex-col gap-6">
                {reassurances.map(({ icon: Icon, title, text }) => (
                  <li key={title} className="flex gap-4">
                    <span className="bg-pine/8 text-bronze flex size-11 shrink-0 items-center justify-center rounded-full">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <div>
                      <p className="text-pine font-medium">{title}</p>
                      <p className="text-sage mt-0.5 text-sm">{text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-pine/10 rounded-3xl border bg-white p-6 shadow-sm sm:p-10 lg:col-span-3">
              <Form
                action={websiteContacts.create()}
                transform={(data) => ({ contact_message: data })}
                resetOnSuccess
                onSuccess={() => setSent(true)}
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
                      <div className="absolute -left-[9999px]" aria-hidden>
                        <label htmlFor="website">Leave this field empty</label>
                        <input
                          id="website"
                          name="website"
                          tabIndex={-1}
                          autoComplete="off"
                        />
                      </div>
                      <div className="grid gap-6 sm:grid-cols-2">
                        <Field>
                          <FieldLabel htmlFor="first_name">
                            First name <Required />
                          </FieldLabel>
                          <Input
                            className={inputClass}
                            id="first_name"
                            name="first_name"
                            maxLength={255}
                            required
                            autoComplete="given-name"
                            defaultValue={defaults.first_name ?? ""}
                          />
                          <FieldError errors={messages("first_name")} />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="last_name">
                            Last name <Required />
                          </FieldLabel>
                          <Input
                            className={inputClass}
                            id="last_name"
                            name="last_name"
                            maxLength={255}
                            required
                            autoComplete="family-name"
                            defaultValue={defaults.last_name ?? ""}
                          />
                          <FieldError errors={messages("last_name")} />
                        </Field>
                      </div>

                      <div className="grid gap-6 sm:grid-cols-2">
                        <Field>
                          <FieldLabel htmlFor="email">
                            Email address <Required />
                          </FieldLabel>
                          <Input
                            className={inputClass}
                            id="email"
                            name="email"
                            maxLength={255}
                            type="email"
                            required
                            autoComplete="email"
                            defaultValue={defaults.email ?? ""}
                          />
                          <FieldError errors={messages("email")} />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="phone">
                            Phone <Required />
                          </FieldLabel>
                          <Input
                            className={inputClass}
                            id="phone"
                            name="phone"
                            required
                            maxLength={25}
                            pattern="\+?[0-9\s\-().]{7,25}"
                            title="Enter a valid phone number"
                            type="tel"
                            autoComplete="tel"
                          />
                          <FieldError errors={messages("phone")} />
                        </Field>
                      </div>

                      <Field>
                        <FieldLabel htmlFor="message">
                          Message <Required />
                        </FieldLabel>
                        <Textarea
                          id="message"
                          name="message"
                          rows={6}
                          required
                          minLength={10}
                          maxLength={5000}
                          className={inputClass + " h-auto py-3"}
                        />
                        <FieldError errors={messages("message")} />
                      </Field>

                      <Button
                        type="submit"
                        disabled={processing}
                        className="bg-pine text-ivory hover:bg-pine-deep h-11 w-full rounded-full"
                      >
                        {processing && <Spinner />}
                        Send message
                      </Button>
                    </FieldGroup>
                  )
                }}
              </Form>
            </div>
          </section>
        }
      />
      <Dialog open={sent} onOpenChange={setSent}>
        <DialogContent className="border-pine/10 max-w-md rounded-3xl bg-white p-8 text-center sm:max-w-md">
          <DialogHeader className="items-center text-center sm:text-center">
            <span className="bg-pine/8 text-pine mb-2 flex size-16 items-center justify-center rounded-full">
              <CircleCheck className="size-8" aria-hidden />
            </span>
            <DialogTitle className="font-display text-pine text-2xl">
              Message sent
            </DialogTitle>
            <DialogDescription className="text-sage">
              Thank you for reaching out. We have received your message and will
              get back to you within one working day.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => setSent(false)}
              className="bg-pine text-ivory hover:bg-pine-deep h-11 rounded-full px-10"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
