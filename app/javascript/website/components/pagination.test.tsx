import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { englishLocale, setPageProps } from "@/test/inertia"
import { Pagination } from "@/website/components/pagination"

vi.mock(
  "@inertiajs/react",
  async () => (await import("@/test/inertia")).inertiaMock,
)

const hrefFor = (page: number) => `/blogs?page=${page}`
const data = (page: number, pages: number) => ({
  page,
  pages,
  total: pages * 9,
  per_page: 9,
})

describe("Pagination", () => {
  it("renders nothing for a single page", () => {
    setPageProps({ locale: englishLocale })
    const { container } = render(
      <Pagination pagination={data(1, 1)} hrefFor={hrefFor} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it("links to the neighbouring pages and marks the current one", () => {
    setPageProps({ locale: englishLocale })
    render(<Pagination pagination={data(2, 3)} hrefFor={hrefFor} />)

    expect(screen.getByRole("link", { name: "Previous page" })).toHaveAttribute(
      "href",
      "/blogs?page=1",
    )
    expect(screen.getByRole("link", { name: "Next page" })).toHaveAttribute(
      "href",
      "/blogs?page=3",
    )
    expect(screen.getByRole("link", { name: "Page 2" })).toHaveAttribute(
      "aria-current",
      "page",
    )
    expect(screen.getByRole("link", { name: "Page 3" })).not.toHaveAttribute(
      "aria-current",
    )
  })

  it("has no previous link on the first page", () => {
    setPageProps({ locale: englishLocale })
    render(<Pagination pagination={data(1, 3)} hrefFor={hrefFor} />)

    expect(
      screen.queryByRole("link", { name: "Previous page" }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Next page" })).toBeInTheDocument()
  })
})
