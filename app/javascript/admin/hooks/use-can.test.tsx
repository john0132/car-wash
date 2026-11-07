import { renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { useCan, useIsSuperAdmin } from "@/admin/hooks/use-can"
import { setPageProps } from "@/test/inertia"

vi.mock(
  "@inertiajs/react",
  async () => (await import("@/test/inertia")).inertiaMock,
)

const withPermissions = (permissions: string[], is_super_admin = false) =>
  setPageProps({ admin: { permissions, is_super_admin } })

describe("useCan", () => {
  it("allows only the permissions the admin was given", () => {
    withPermissions(["bookings.read", "bookings.update"])
    const { result } = renderHook(() => useCan())

    expect(result.current("bookings", "update")).toBe(true)
    expect(result.current("bookings", "delete")).toBe(false)
    expect(result.current("customers", "read")).toBe(false)
  })

  it("allows nothing without permissions", () => {
    withPermissions([])
    const { result } = renderHook(() => useCan())

    expect(result.current("bookings", "read")).toBe(false)
  })
})

describe("useIsSuperAdmin", () => {
  it("reflects the shared prop", () => {
    withPermissions([], true)
    expect(renderHook(() => useIsSuperAdmin()).result.current).toBe(true)

    withPermissions([], false)
    expect(renderHook(() => useIsSuperAdmin()).result.current).toBe(false)
  })
})
