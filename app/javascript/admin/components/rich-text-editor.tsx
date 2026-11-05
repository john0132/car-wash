import Image from "@tiptap/extension-image"
import { EditorContent, useEditor, useEditorState } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { cn } from "cn"
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  type LucideIcon,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react"
import { useState } from "react"

import { IMAGE_ACCEPT, useDirectUpload } from "@/admin/hooks/use-direct-upload"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Spinner } from "@/shared/components/ui/spinner"

/**
 * WYSIWYG editor producing HTML. Rails sanitizes it on save (HtmlSanitizer),
 * so the toolbar only offers what that allowlist keeps.
 *
 * The editor owns its content after mounting: give it a new `key` to load a
 * different value (e.g. when switching language).
 */
export function RichTextEditor({
  id,
  value,
  onChange,
  dir,
  lang,
  invalid,
}: {
  id: string
  value: string
  onChange: (html: string) => void
  dir?: "rtl"
  lang?: string
  invalid?: boolean
}) {
  const { upload, uploading, error } = useDirectUpload()
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        codeBlock: false,
        link: { openOnClick: false, autolink: true },
      }),
      Image,
    ],
    content: value,
    editorProps: {
      attributes: {
        id,
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-40 px-3 py-2 focus:outline-none",
        ...(dir ? { dir } : {}),
        ...(lang ? { lang } : {}),
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  })

  const state = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor && {
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        underline: editor.isActive("underline"),
        strike: editor.isActive("strike"),
        h2: editor.isActive("heading", { level: 2 }),
        h3: editor.isActive("heading", { level: 3 }),
        bullet: editor.isActive("bulletList"),
        ordered: editor.isActive("orderedList"),
        quote: editor.isActive("blockquote"),
        link: editor.isActive("link"),
        canUndo: editor.can().undo(),
        canRedo: editor.can().redo(),
      },
  })

  if (!editor || !state) return null

  const chain = () => editor.chain().focus()

  const applyLink = () => {
    const url = linkUrl.trim()
    if (url) chain().extendMarkRange("link").setLink({ href: url }).run()
    else chain().extendMarkRange("link").unsetLink().run()
    setLinkOpen(false)
  }

  const tools: {
    label: string
    icon: LucideIcon
    active?: boolean
    disabled?: boolean
    run: () => void
  }[] = [
    {
      label: "Bold",
      icon: Bold,
      active: state.bold,
      run: () => chain().toggleBold().run(),
    },
    {
      label: "Italic",
      icon: Italic,
      active: state.italic,
      run: () => chain().toggleItalic().run(),
    },
    {
      label: "Underline",
      icon: Underline,
      active: state.underline,
      run: () => chain().toggleUnderline().run(),
    },
    {
      label: "Strikethrough",
      icon: Strikethrough,
      active: state.strike,
      run: () => chain().toggleStrike().run(),
    },
    {
      label: "Heading",
      icon: Heading2,
      active: state.h2,
      run: () => chain().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Subheading",
      icon: Heading3,
      active: state.h3,
      run: () => chain().toggleHeading({ level: 3 }).run(),
    },
    {
      label: "Bulleted list",
      icon: List,
      active: state.bullet,
      run: () => chain().toggleBulletList().run(),
    },
    {
      label: "Numbered list",
      icon: ListOrdered,
      active: state.ordered,
      run: () => chain().toggleOrderedList().run(),
    },
    {
      label: "Quote",
      icon: Quote,
      active: state.quote,
      run: () => chain().toggleBlockquote().run(),
    },
    {
      label: "Link",
      icon: Link2,
      active: state.link,
      run: () => {
        setLinkUrl(
          (editor.getAttributes("link").href as string | undefined) ?? "",
        )
        setLinkOpen((open) => !open)
      },
    },
    {
      label: "Insert image",
      icon: ImagePlus,
      disabled: uploading,
      run: () => document.getElementById(`${id}-image`)?.click(),
    },
    {
      label: "Undo",
      icon: Undo2,
      disabled: !state.canUndo,
      run: () => chain().undo().run(),
    },
    {
      label: "Redo",
      icon: Redo2,
      disabled: !state.canRedo,
      run: () => chain().redo().run(),
    },
  ]

  return (
    <div
      className={cn(
        "focus-within:ring-ring/50 focus-within:border-ring rounded-md border focus-within:ring-[3px]",
        invalid && "border-destructive",
      )}
    >
      <div
        role="toolbar"
        aria-label="Formatting"
        className="flex flex-wrap items-center gap-0.5 border-b p-1"
      >
        {tools.map((tool) => (
          <Button
            key={tool.label}
            type="button"
            variant={tool.active ? "secondary" : "ghost"}
            size="icon"
            className="size-8"
            title={tool.label}
            aria-label={tool.label}
            aria-pressed={tool.active}
            disabled={tool.disabled}
            onClick={tool.run}
          >
            <tool.icon />
          </Button>
        ))}
        {uploading && <Spinner className="ml-1" />}
      </div>

      {linkOpen && (
        <div className="flex items-center gap-2 border-b p-2">
          <Input
            autoFocus
            value={linkUrl}
            placeholder="https://… (leave empty to remove the link)"
            aria-label="Link URL"
            className="h-8"
            onChange={(event) => setLinkUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                applyLink()
              } else if (event.key === "Escape") {
                setLinkOpen(false)
              }
            }}
          />
          <Button type="button" size="sm" onClick={applyLink}>
            Apply
          </Button>
        </div>
      )}

      <EditorContent editor={editor} />

      <input
        id={`${id}-image`}
        type="file"
        accept={IMAGE_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ""
          if (!file) return
          upload(file).then(
            ({ url }) => chain().setImage({ src: url, alt: "" }).run(),
            () => undefined,
          )
        }}
      />
      {error && <p className="text-destructive px-3 pb-2 text-sm">{error}</p>}
    </div>
  )
}
