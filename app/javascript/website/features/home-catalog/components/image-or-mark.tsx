import { BrandMark } from "@/website/components/brand-mark"
import type { HomeImage } from "@/website/features/home-catalog/types"

/** The record's uploaded image, or the brand mark on a sand tile when it has none. */
export function ImageOrMark({
  image,
  className = "",
  priority = false,
}: {
  image: HomeImage | null
  className?: string
  /** Above-the-fold image (the likely LCP): fetched eagerly with high priority. */
  priority?: boolean
}) {
  if (image) {
    return (
      <img
        src={image.url}
        alt=""
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${className}`}
      />
    )
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-[#E9E0CC]">
      <BrandMark className="h-14 w-14 opacity-40" />
    </div>
  )
}
