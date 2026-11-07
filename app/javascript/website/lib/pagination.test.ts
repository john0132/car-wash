import { describe, expect, it } from "vitest"

import { pageWindow } from "@/website/lib/pagination"

describe("pageWindow", () => {
  it("lists every page when there are few", () => {
    expect(pageWindow(2, 3)).toEqual([1, 2, 3])
  })

  it("keeps the first, last and neighbouring pages, with gaps between", () => {
    expect(pageWindow(5, 10)).toEqual([1, null, 4, 5, 6, null, 10])
  })

  it("closes the gap when pages are adjacent", () => {
    expect(pageWindow(2, 10)).toEqual([1, 2, 3, null, 10])
  })

  it("handles a single page", () => {
    expect(pageWindow(1, 1)).toEqual([1])
  })
})
