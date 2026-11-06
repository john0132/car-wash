import { cn } from "cn"
import { Plus } from "lucide-react"

import { TextField, asFieldErrors } from "@/admin/components/form-fields"
import { ImageUploadField } from "@/admin/components/image-upload-field"
import { ReorderButtons } from "@/admin/components/reorder-buttons"
import type { SocialLinkState } from "@/admin/features/footer/types"
import { newUid } from "@/admin/features/navigation/utils"
import type { FormErrors } from "@/admin/lib/forms"
import { moveItem } from "@/admin/lib/lists"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { FieldError } from "@/shared/components/ui/field"
import { Switch } from "@/shared/components/ui/switch"

/** The footer's social links: name, URL and icon each, in display order. */
export function SocialLinksEditor({
  links,
  onChange,
  errors,
}: {
  links: SocialLinkState[]
  onChange: (links: SocialLinkState[]) => void
  errors: FormErrors
}) {
  const update = (uid: string, patch: Partial<SocialLinkState>) =>
    onChange(links.map((l) => (l.uid === uid ? { ...l, ...patch } : l)))

  return (
    <div className="space-y-3">
      {links.map((link, index) => {
        const error = (attribute: string) =>
          errors[`social_links.${index}.${attribute}`]
        return (
          <Card
            key={link.uid}
            className={cn("gap-0 py-0", !link.is_active && "opacity-70")}
          >
            <CardContent className="space-y-3 p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  id={`social-name-${link.uid}`}
                  label="Name"
                  value={link.name}
                  onChange={(name) => update(link.uid, { name })}
                  errors={error("name")}
                  placeholder="Instagram"
                  required
                />
                <TextField
                  id={`social-url-${link.uid}`}
                  label="URL"
                  value={link.url}
                  onChange={(url) => update(link.uid, { url })}
                  errors={error("url")}
                  placeholder="https://instagram.com/…"
                  inputMode="url"
                  required
                />
              </div>
              <ImageUploadField
                id={`social-icon-${link.uid}`}
                value={link.icon}
                onChange={(icon) => update(link.uid, { icon })}
              />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={link.is_active}
                    onCheckedChange={(is_active) =>
                      update(link.uid, { is_active })
                    }
                  />
                  Visible
                </label>
                <div className="ml-auto">
                  <ReorderButtons
                    index={index}
                    count={links.length}
                    noun="social link"
                    onMove={(offset) =>
                      onChange(moveItem(links, index, offset))
                    }
                    onRemove={() =>
                      onChange(links.filter((l) => l.uid !== link.uid))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          onChange([
            ...links,
            {
              uid: newUid(),
              id: null,
              name: "",
              url: "",
              is_active: true,
              icon: null,
            },
          ])
        }
      >
        <Plus /> Add social link
      </Button>
      <FieldError errors={asFieldErrors(errors.social_links)} />
    </div>
  )
}
