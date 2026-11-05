import type { ReactNode } from "react"

import { Toaster } from "@/shared/components/ui/sonner"
import { useFlash } from "@/shared/hooks/use-flash"

interface PersistentLayoutProps {
  children: ReactNode
}

export default function PersistentLayout({ children }: PersistentLayoutProps) {
  useFlash()
  return (
    <>
      {children}
      <Toaster richColors />
    </>
  )
}
