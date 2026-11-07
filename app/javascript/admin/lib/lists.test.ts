import { describe, expect, it } from "vitest"

import { moveItem } from "@/admin/lib/lists"

describe("moveItem", () => {
  it("moves an entry down", () => {
    expect(moveItem(["a", "b", "c"], 0, 1)).toEqual(["b", "a", "c"])
  })

  it("moves an entry up", () => {
    expect(moveItem(["a", "b", "c"], 2, -1)).toEqual(["a", "c", "b"])
  })

  it("returns a new list and leaves the original alone", () => {
    const list = ["a", "b"]
    expect(moveItem(list, 0, 1)).not.toBe(list)
    expect(list).toEqual(["a", "b"])
  })
})
