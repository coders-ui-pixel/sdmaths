"use client"

import { useState, useEffect, useRef } from "react"
import { Eye, EyeOff, Sigma } from "lucide-react"

interface LatexEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  label?: string
  className?: string
  /** textarea accent color class e.g. "focus:border-blue-500" */
  accentClass?: string
  /** If true, renders in a larger block style suited for long answers */
  large?: boolean
}

/**
 * A textarea that shows a real-time KaTeX preview beneath it.
 * Uses the same CDN KaTeX loader as LatexRenderer.
 * The preview can be toggled on/off.
 */
export default function LatexEditor({
  value,
  onChange,
  placeholder,
  rows = 3,
  label,
  className = "",
  accentClass = "focus:border-blue-500",
  large = false,
}: LatexEditorProps) {
  const [showPreview, setShowPreview] = useState(true)
  const previewRef = useRef<HTMLDivElement>(null)
  const hasContent = value.trim().length > 0

  useEffect(() => {
    if (showPreview && hasContent) {
      renderPreviewInternal(previewRef.current!, value)
    }
  }, [value, showPreview, hasContent])

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label row */}
      {label && (
        <div className="flex items-center justify-between ml-1">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sigma size={11} className="text-violet-400" />
            {label}
          </label>
          <button
            type="button"
            onClick={() => setShowPreview(p => !p)}
            className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-violet-500 transition-colors px-2 py-0.5 rounded-md hover:bg-violet-50 dark:hover:bg-violet-950/20"
          >
            {showPreview ? <EyeOff size={11} /> : <Eye size={11} />}
            {showPreview ? "Hide preview" : "Show preview"}
          </button>
        </div>
      )}

      {/* Textarea */}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={large ? Math.max(rows, 5) : rows}
        className={`w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none ${accentClass} text-sm resize-none font-mono transition-colors`}
      />

      {/* LaTeX syntax hint */}
      <p className="text-[10px] text-slate-400 ml-1 font-medium">
        Use <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-violet-600 dark:text-violet-400">$...$</code> for inline math,{" "}
        <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-violet-600 dark:text-violet-400">$$...$$</code> for display math.
        Example: <span className="text-slate-500">If $x^2 + 1 = 0$, find $x$.</span>
      </p>

      {/* Preview panel */}
      {showPreview && hasContent && (
        <div className="rounded-xl border border-violet-100 dark:border-violet-900/30 bg-violet-50/50 dark:bg-violet-950/10 overflow-hidden">
          <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-violet-100 dark:border-violet-900/30 bg-violet-50 dark:bg-violet-950/20">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            <span className="text-[10px] font-black text-violet-500 uppercase tracking-widest">LaTeX Preview</span>
          </div>
          <div
            ref={previewRef}
            className={`px-4 ${large ? "py-5" : "py-3"} text-sm text-slate-700 dark:text-slate-300 leading-relaxed katex-preview`}
          >
            {/* rendered by effect */}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Inline KaTeX renderer (duplicated from LatexRenderer to avoid circular imports) ───

let _katexPromise: Promise<any> | null = null

function loadKatexForEditor(): Promise<any> {
  if (_katexPromise) return _katexPromise
  if (typeof window !== "undefined" && (window as any).__katex) {
    return Promise.resolve((window as any).__katex)
  }
  _katexPromise = new Promise((resolve, reject) => {
    if (!document.getElementById("katex-css")) {
      const link = document.createElement("link")
      link.id = "katex-css"
      link.rel = "stylesheet"
      link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"
      document.head.appendChild(link)
    }
    const script = document.createElement("script")
    script.src = "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"
    script.async = true
    script.onload = () => {
      const k = (window as any).katex
      ;(window as any).__katex = k
      resolve(k)
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
  return _katexPromise
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>")
}

async function renderPreviewInternal(el: HTMLElement | null, text: string) {
  if (!el) return
  try {
    const katex = await loadKatexForEditor()
    const pattern = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g
    const parts: string[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = pattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(escapeHtml(text.slice(lastIndex, match.index)))
      }
      const raw = match[1]
      const isDisplay = raw.startsWith("$$")
      const inner = isDisplay ? raw.slice(2, -2).trim() : raw.slice(1, -1).trim()
      try {
        parts.push(katex.renderToString(inner, { displayMode: isDisplay, throwOnError: false, strict: false }))
      } catch {
        parts.push(escapeHtml(raw))
      }
      lastIndex = pattern.lastIndex
    }
    if (lastIndex < text.length) parts.push(escapeHtml(text.slice(lastIndex)))
    el.innerHTML = parts.join("")
  } catch {
    el.textContent = text
  }
}
