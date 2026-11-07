import { Form } from "@inertiajs/react"
import { Eye } from "lucide-react"

import type { DemoLogin } from "@/admin/features/sessions/types"
import { adminSessions } from "@/routes"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { Spinner } from "@/shared/components/ui/spinner"

// Public credentials for the portfolio deploy's view-only account, with a one-click sign in.
export function DemoLoginPanel({ email, password }: DemoLogin) {
  return (
    <Alert>
      <Eye />
      <AlertTitle>Portfolio demo</AlertTitle>
      <AlertDescription>
        <p>
          Explore the dashboard with a view-only account: every screen, no
          changes.
        </p>
        <dl className="text-foreground mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
          <dt className="text-muted-foreground">Email</dt>
          <dd className="font-mono break-all select-all">{email}</dd>
          <dt className="text-muted-foreground">Password</dt>
          <dd className="font-mono break-all select-all">{password}</dd>
        </dl>
        <Form action={adminSessions.create()} className="mt-3 w-full">
          {({ processing }) => (
            <>
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="password" value={password} />
              <Button
                type="submit"
                variant="outline"
                size="sm"
                disabled={processing}
              >
                {processing && <Spinner />}
                Sign in with the demo account
              </Button>
            </>
          )}
        </Form>
      </AlertDescription>
    </Alert>
  )
}
