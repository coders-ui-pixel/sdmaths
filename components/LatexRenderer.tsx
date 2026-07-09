"use client"

import { useEffect, useRef, memo } from "react"

interface LatexRendererProps {
  content: string
  className?: string
  /** If true, forces block (display) mode for the whole string */
  block?: boolean
}

/**
 * Renders a string that may contain LaTeX delimiters:
 *   - $...$ for inline math
 *   - $$...$$ for display/block math
 * Falls back to plain text gracefully if KaTeX is unavailable.
 *
 * KaTeX is loaded once from CDN and cached on window.__katex.
 */
const LatexRenderer = memo(function LatexRenderer({ content, className, block }: LatexRendererProps) {
  const containerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!content || !containerRef.current) return
    renderLatex(containerRef.current, content, block)
  }, [content, block])

  return (
    <span
      ref={containerRef}
      className={className}
      suppressHydrationWarning
    >
      {content}
    </span>
  )
})

export default LatexRenderer

// ─── KaTeX loader (singleton) ────────────────────────────────────────────────

let katexLoadPromise: Promise<any> | null = null

function loadKatex(): Promise<any> {
  if (katexLoadPromise) return katexLoadPromise
  if (typeof window !== "undefined" && (window as any).__katex) {
    return Promise.resolve((window as any).__katex)
  }

  katexLoadPromise = new Promise((resolve, reject) => {
    // Inject CSS once
    if (!document.getElementById("katex-css")) {
      const link = document.createElement("link")
      link.id = "katex-css"
      link.rel = "stylesheet"
      link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"
      document.head.appendChild(link)
    }

    // Inject JS
    const script = document.createElement("script")
    script.src = "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"
    script.async = true
    script.onload = () => {
      const katex = (window as any).katex
      ;(window as any).__katex = katex
      resolve(katex)
    }
    script.onerror = reject
    document.head.appendChild(script)
  })

  return katexLoadPromise
}

// ─── Render logic ─────────────────────────────────────────────────────────────

async function renderLatex(el: HTMLElement, content: string, forceBlock = false) {
  try {
    const katex = await loadKatex()

    if (forceBlock) {
      el.innerHTML = katex.renderToString(content, {
        displayMode: true,
        throwOnError: false,
        strict: false,
      })
      return
    }

    // Check if content has any LaTeX at all
    if (!content.includes("$")) {
      el.textContent = content
      return
    }

    el.innerHTML = parseAndRender(katex, content)
  } catch {
    // KaTeX failed — just show plain text
    el.textContent = content
  }
}

/**
 * Splits `text` into runs of plain text and LaTeX segments,
 * renders each LaTeX segment with KaTeX, and returns combined HTML.
 *
 * Priority: $$...$$ (display) is checked before $...$ (inline).
 */
function parseAndRender(katex: any, text: string): string {
  // Regex: match $$...$$ first, then $...$
  // Uses non-greedy matching; avoids capturing empty groups
  const pattern = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g
  const parts: string[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    // Plain text before this match
    if (match.index > lastIndex) {
      parts.push(escapeHtml(text.slice(lastIndex, match.index)))
    }

    const raw = match[1]
    const isDisplay = raw.startsWith("$$")
    const inner = isDisplay ? raw.slice(2, -2).trim() : raw.slice(1, -1).trim()

    try {
      parts.push(
        katex.renderToString(inner, {
          displayMode: isDisplay,
          throwOnError: false,
          strict: false,
        })
      )
    } catch {
      parts.push(escapeHtml(raw))
    }

    lastIndex = pattern.lastIndex
  }

  // Remaining plain text
  if (lastIndex < text.length) {
    parts.push(escapeHtml(text.slice(lastIndex)))
  }

  return parts.join("")
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br/>")
}

// ─── Helper: check if a string contains LaTeX ────────────────────────────────
export function hasLatex(text: string): boolean {
  return /\$[\s\S]+?\$/.test(text)
}
