import { ImagePlus, Trash2 } from "lucide-react"
import { useRef } from "react"

import { IMAGE_ACCEPT, useDirectUpload } from "@/admin/hooks/use-direct-upload"
import type { ImageValue } from "@/admin/types"
import { Button } from "@/shared/components/ui/button"
import { Spinner } from "@/shared/components/ui/spinner"

/** Image picker that direct-uploads the file; the value is the blob's signed id. */
export function ImageUploadField({
  id,
  value,
  onChange,
  invalid,
}: {
  id: string
  value: ImageValue | null
  onChange: (value: ImageValue | null) => void
  invalid?: boolean
}) {
  const input = useRef<HTMLInputElement>(null)
  const { upload, uploading, error } = useDirectUpload()

  return (
    <div className="space-y-2">
      <div
        className="bg-muted/40 aria-invalid:border-destructive flex items-center gap-3 rounded-md border p-2"
        aria-invalid={invalid ? true : undefined}
      >
        {value ? (
          <img
            src={value.url}
            alt=""
            className="size-16 rounded object-cover"
          />
        ) : (
          <div className="text-muted-foreground flex size-16 items-center justify-center rounded border border-dashed">
            <ImagePlus className="size-5" />
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => input.current?.click()}
          >
            {uploading && <Spinner />}
            {value ? "Replace" : "Upload image"}
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(null)}
            >
              <Trash2 /> Remove
            </Button>
          )}
        </div>
        <input
          ref={input}
          id={id}
          type="file"
          accept={IMAGE_ACCEPT}
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ""
            if (file) upload(file).then(onChange, () => undefined)
          }}
        />
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  )
}
