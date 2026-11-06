import { Head } from "@inertiajs/react"

import { ConfirmDeleteDialog } from "@/admin/components/confirm-delete-dialog"
import { Detail } from "@/admin/components/detail"
import { PageHeader } from "@/admin/components/page-header"
import type { ContactMessageRow } from "@/admin/features/contact/types"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import { formatDateTime } from "@/admin/lib/format"
import { adminContactMessages } from "@/routes"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"

interface Props {
  message: ContactMessageRow & { message: string }
}

export default function ContactMessageShow({ message }: Props) {
  const can = useCan()

  return (
    <AdminLayout
      breadcrumbs={[
        {
          title: "Contact messages",
          href: adminContactMessages.index().url,
        },
        {
          title: message.full_name,
          href: adminContactMessages.show(message.id).url,
        },
      ]}
    >
      <Head title={`Message from ${message.full_name}`} />

      <div className="space-y-6 p-4">
        <PageHeader
          title={message.full_name}
          description={`Received ${formatDateTime(message.created_at)}`}
          actions={
            can("contact_messages", "delete") && (
              <ConfirmDeleteDialog
                title="Delete this message?"
                description="This can't be undone."
                action={adminContactMessages.destroy(message.id)}
              />
            )
          }
        />

        <div className="grid max-w-4xl gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Sender</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <Detail label="First name">{message.first_name}</Detail>
                <Detail label="Last name">{message.last_name}</Detail>
                <Detail label="Email">
                  <a href={`mailto:${message.email}`} className="underline">
                    {message.email}
                  </a>
                </Detail>
                <Detail label="Phone">
                  {message.phone ? (
                    <a href={`tel:${message.phone}`} className="underline">
                      {message.phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </Detail>
              </dl>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Message</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{message.message}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
