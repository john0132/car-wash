import { BrandMark } from "@/website/components/brand-mark"
import type { HomeImage } from "@/website/features/home-catalog/types"

/** The record's uploaded image, or the brand mark on a sand tile when it has none. */
export function ImageOrMark({
  image,
  className = "",
}: {
  image: HomeImage | null
  className?: string
}) {
  if (image) {
    return (
      <img
        src={image.url}
        alt=""
        loading="lazy"
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
