import { describe, expect, it } from "vitest"

import { cn } from "@/shared/lib/utils"

describe("cn", () => {
  it("joins class names and drops falsy ones", () => {
    const hidden = Math.random() > 1 // always false
    expect(cn("a", hidden && "b", undefined, "c")).toBe("a c")
  })

  it("lets the later Tailwind class win", () => {
    expect(cn("p-2", "p-4")).toBe("p-4")
  })
})
