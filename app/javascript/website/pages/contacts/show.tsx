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
import type { ContactDefaults } from "@/website/features/contact/types"
import type { PageProps } from "@/website/features/page-sections/types"
import MarketingLayout from "@/website/layouts/marketing-layout"

const inputClass =
  "h-12 rounded-xl border border-[#2B3A32]/30 bg-[#FBF8F2] px-4 text-[#2B3A32] shadow-none placeholder:text-[#5B6B5E]/60 hover:border-[#2B3A32]/50 focus-visible:border-[#8A6240] focus-visible:bg-white focus-visible:ring-[#8A6240]/25 dark:bg-[#FBF8F2] autofill:shadow-[inset_0_0_0_1000px_#FBF8F2] autofill:[-webkit-text-fill-color:#2B3A32]"

const Required = () => (
  <span className="text-[#8A6240]" aria-hidden>
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
              <h2
                className="text-3xl text-[#2B3A32] sm:text-4xl"
                style={{ fontFamily: "'Italiana', serif" }}
              >
                Let&apos;s talk about your car
              </h2>
              <p className="mt-4 leading-relaxed text-[#5B6B5E]">
                Questions about a service, a custom request or an existing
                booking? Send us a note and we&apos;ll get back to you.
              </p>
              <ul className="mt-8 flex flex-col gap-6">
                {reassurances.map(({ icon: Icon, title, text }) => (
                  <li key={title} className="flex gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#2B3A32]/8 text-[#8A6240]">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <div>
                      <p className="font-medium text-[#2B3A32]">{title}</p>
                      <p className="mt-0.5 text-sm text-[#5B6B5E]">{text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-[#2B3A32]/10 bg-white p-6 shadow-sm sm:p-10 lg:col-span-3">
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
                        className="h-11 w-full rounded-full bg-[#2B3A32] text-[#F6F1E7] hover:bg-[#1F2B25]"
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
        <DialogContent className="max-w-md rounded-3xl border-[#2B3A32]/10 bg-white p-8 text-center sm:max-w-md">
          <DialogHeader className="items-center text-center sm:text-center">
            <span className="mb-2 flex size-16 items-center justify-center rounded-full bg-[#2B3A32]/8 text-[#2B3A32]">
              <CircleCheck className="size-8" aria-hidden />
            </span>
            <DialogTitle
              className="text-2xl text-[#2B3A32]"
              style={{ fontFamily: "'Italiana', serif" }}
            >
              Message sent
            </DialogTitle>
            <DialogDescription className="text-[#5B6B5E]">
              Thank you for reaching out. We have received your message and will
              get back to you within one working day.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => setSent(false)}
              className="h-11 rounded-full bg-[#2B3A32] px-10 text-[#F6F1E7] hover:bg-[#1F2B25]"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
