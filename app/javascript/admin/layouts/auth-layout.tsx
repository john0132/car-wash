import type { ReactNode } from "react"

import { adminSignIn } from "@/routes"
import AuthSimpleLayout from "@/shared/layouts/auth/auth-simple-layout"

export default function AuthLayout({
  children,
  title,
  description,
}: {
  children: ReactNode
  title: string
  description: string
}) {
  return (
    <AuthSimpleLayout
      title={title}
      description={description}
      logoHref={adminSignIn().url}
    >
      {children}
    </AuthSimpleLayout>
  )
}
