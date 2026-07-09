"use client"

import { AlertTriangle, CheckCircle2, X } from "lucide-react"
import LatexRenderer from "@/components/LatexRenderer"
import LatexEditor from "@/components/LatexEditor"

export type Draft = {
  rowNum: number
  question: string
  options: string[]
  correctOption: number
  explanation: string
  explanationVideoUrl: string
  errors: string[]
}

// Shared row editor used wherever a CSV of MCQ questions needs admin review/editing
// (with LaTeX preview) before being saved — the standalone question bank page and
// the per-exam CSV upload both render one of these per parsed row.
export function DraftRowEditor({ draft, onChange, onRemove }: {
  draft: Draft
  onChange: (patch: Partial<Draft>) => void
  onRemove: () => void
}) {
  const hasErrors = draft.errors.length > 0

  return (
    <div className={`card p-6 rounded-2xl border ${hasErrors ? "border-red-200 dark:border-red-900 bg-red-50/40 dark:bg-red-950/10" : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Row {draft.rowNum}</span>
        <div className="flex items-center gap-3">
          {hasErrors && (
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-600">
              <AlertTriangle size={12} /> {draft.errors.join("; ")}
            </span>
          )}
          <button onClick={onRemove} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors" title="Remove this row">
            <X size={16} />
          </button>
        </div>
      </div>

      <LatexEditor
        label="Question"
        value={draft.question}
        onChange={v => onChange({ question: v })}
        rows={2}
        accentClass="focus:border-[var(--admin-accent)]"
      />

      <div className="grid grid-cols-2 gap-3 mt-4">
        {draft.options.map((opt, idx) => (
          <div key={idx} className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Option {String.fromCharCode(65 + idx)}</label>
            <div className="relative">
              <input
                value={opt}
                onChange={e => {
                  const next = [...draft.options]
                  next[idx] = e.target.value
                  onChange({ options: next })
                }}
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-sm font-mono transition-all ${
                  draft.correctOption === idx ? "border-green-500 ring-1 ring-green-500" : "border-slate-200 dark:border-slate-700"
                }`}
              />
              <button
                type="button"
                onClick={() => onChange({ correctOption: idx })}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                  draft.correctOption === idx ? "bg-green-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-transparent"
                }`}
                title="Mark as correct"
              >
                <CheckCircle2 size={12} />
              </button>
            </div>
            {opt.trim() && (
              <div className="text-xs text-slate-500 px-1"><LatexRenderer content={opt} /></div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Explanation Video URL</label>
          <input
            value={draft.explanationVideoUrl}
            onChange={e => onChange({ explanationVideoUrl: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-[var(--admin-accent)] transition-all text-sm"
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
        <LatexEditor
          label="Explanation"
          value={draft.explanation}
          onChange={v => onChange({ explanation: v })}
          rows={1}
          accentClass="focus:border-[var(--admin-accent)]"
        />
      </div>
    </div>
  )
}
