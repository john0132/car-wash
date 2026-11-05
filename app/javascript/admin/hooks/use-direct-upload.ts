import { DirectUpload } from "@rails/activestorage"
import { useCallback, useState } from "react"

import type { ImageValue } from "@/admin/types"
import { adminDirectUploads } from "@/routes"

export const IMAGE_ACCEPT =
  "image/png,image/jpeg,image/webp,image/gif,image/avif"

/**
 * Uploads a file straight to storage through Admin::DirectUploadsController
 * and resolves with its signed id (what forms submit) and a URL to preview it.
 */
export function useDirectUpload() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback((file: File) => {
    setUploading(true)
    setError(null)

    return new Promise<ImageValue>((resolve, reject) => {
      new DirectUpload(file, adminDirectUploads.create().url).create(
        (failure, blob) => {
          setUploading(false)
          if (failure || !blob) {
            const message =
              typeof failure === "string" && failure.includes("422")
                ? "Upload a PNG, JPEG, WebP, GIF or AVIF image up to 10 MB."
                : "The upload failed. Try again."
            setError(message)
            reject(new Error(message))
          } else {
            const { url } = blob as typeof blob & { url?: string }
            resolve({
              signed_id: blob.signed_id,
              url: url ?? URL.createObjectURL(file),
            })
          }
        },
      )
    })
  }, [])

  return { upload, uploading, error }
}
