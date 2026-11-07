import { describe, expect, it } from "vitest"

import {
  formatCompact,
  formatDate,
  formatNumber,
  humanize,
  pluralize,
} from "@/admin/lib/format"

describe("humanize", () => {
  it("turns a status key into a label", () => {
    expect(humanize("in_progress")).toBe("In progress")
  })
})

describe("pluralize", () => {
  it("uses the singular for one", () => {
    expect(pluralize(1, "booking")).toBe("1 booking")
  })

  it("adds an s otherwise, with thousands separators", () => {
    expect(pluralize(0, "booking")).toBe("0 bookings")
    expect(pluralize(1284, "booking")).toBe("1,284 bookings")
  })

  it("accepts an irregular plural", () => {
    expect(pluralize(2, "city", "cities")).toBe("2 cities")
  })
})

describe("number formats", () => {
  it("shows small numbers in full and large ones compactly", () => {
    expect(formatNumber(9999)).toBe("9,999")
    expect(formatCompact(9999)).toBe("9,999")
    expect(formatCompact(12_900)).toBe("12.9K")
  })
})

describe("formatDate", () => {
  it("shows a dash for a missing date", () => {
    expect(formatDate(null)).toBe("—")
    expect(formatDate(undefined)).toBe("—")
  })
})
