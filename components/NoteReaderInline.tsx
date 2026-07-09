"use client"

import { useEffect } from "react"
import LatexRenderer from "@/components/LatexRenderer"

interface NoteReaderInlineProps {
  content?: string | null
  fileUrl?: string | null
}

/**
 * Non-modal, in-page reader for a note's content. Written notes deter casual
 * copying/printing (see components/NoteReader.tsx for the full rationale —
 * same approach, just rendered inline instead of an overlay). PDF notes are
 * shown as-is via the browser's native PDF viewer, unmodified.
 */
export function NoteReaderInline({ content, fileUrl }: NoteReaderInlineProps) {
  useEffect(() => {
    if (fileUrl) return // PDF notes are shown unmodified — no copy/print restrictions

    const blockKeys = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      const isCopyPrintSave = (e.ctrlKey || e.metaKey) && ["c", "p", "s", "u", "x"].includes(key)
      if (isCopyPrintSave || e.key === "PrintScreen") {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    const blockContextMenu = (e: MouseEvent) => e.preventDefault()
    const blockCopy = (e: ClipboardEvent) => e.preventDefault()

    document.addEventListener("keydown", blockKeys, true)
    document.addEventListener("contextmenu", blockContextMenu)
    document.addEventListener("copy", blockCopy)
    document.addEventListener("cut", blockCopy)

    return () => {
      document.removeEventListener("keydown", blockKeys, true)
      document.removeEventListener("contextmenu", blockContextMenu)
      document.removeEventListener("copy", blockCopy)
      document.removeEventListener("cut", blockCopy)
    }
  }, [fileUrl])

  return (
    <>
      {fileUrl ? (
        <iframe
          src={fileUrl}
          className="w-full h-[85vh] border-0"
          title="Note PDF"
        />
      ) : (
        <div
          className="select-none print:hidden"
          style={{ userSelect: "none", WebkitUserSelect: "none" }}
          onCopy={e => e.preventDefault()}
        >
          <div className="prose prose-sm sm:prose-base max-w-none text-slate-700 leading-relaxed">
            <LatexRenderer content={content || ""} className="block whitespace-pre-wrap" />
          </div>
        </div>
      )}

      {!fileUrl && (
        <div className="hidden print:flex fixed inset-0 items-center justify-center text-center p-10 bg-white z-[999]">
          <p className="text-lg font-bold">This note is protected and cannot be printed.</p>
        </div>
      )}
    </>
  )
}
