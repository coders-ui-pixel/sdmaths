"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Loader2, Download, ArrowLeft } from "lucide-react"
import LatexRenderer from "@/components/LatexRenderer"

export default function ExamPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [exam, setExam] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/exams/${id}`).then(r => r.json()),
      fetch(`/api/admin/exams/${id}/questions`).then(r => r.json()),
    ]).then(([examData, qData]) => {
      setExam(examData)
      setQuestions(Array.isArray(qData) ? qData : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  // KaTeX loads asynchronously from CDN — wait for it (and a short settle delay
  // for the render pass) before enabling the print button, so the PDF never
  // captures raw un-rendered LaTeX source text.
  useEffect(() => {
    if (loading) return
    let cancelled = false
    const check = () => {
      if (cancelled) return
      if ((window as any).__katex) {
        setTimeout(() => { if (!cancelled) setReady(true) }, 400)
      } else {
        setTimeout(check, 150)
      }
    }
    check()
    return () => { cancelled = true }
  }, [loading, questions])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-slate-400" size={28} /></div>
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <style>{`@page { margin: 1.5cm; }`}</style>

      <div className="max-w-3xl mx-auto p-6 sm:p-10">
        <div className="print:hidden flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
          <Link href={`/lms/exams/${id}`} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800">
            <ArrowLeft size={16} /> Back to Set
          </Link>
          <button
            onClick={() => window.print()}
            disabled={!ready}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-colors"
          >
            {ready ? <><Download size={16} /> Download PDF</> : <><Loader2 size={16} className="animate-spin" /> Preparing...</>}
          </button>
        </div>

        <h1 className="text-2xl font-black mb-1">{exam?.title || "Exam Set"}</h1>
        <p className="text-sm text-slate-500 mb-8">{questions.length} Question{questions.length !== 1 ? "s" : ""} with Answer Key</p>

        {questions.length === 0 ? (
          <p className="text-sm text-slate-400">This set has no questions yet.</p>
        ) : (
          <div className="space-y-7">
            {questions.map((q: any, i: number) => (
              <div key={q.id} className="break-inside-avoid">
                <p className="font-bold mb-2 leading-relaxed">
                  <span className="mr-1.5">{i + 1}.</span>
                  <LatexRenderer content={q.question} />
                </p>
                <div className="pl-6 space-y-1 mb-2">
                  {(q.options as string[]).map((opt: string, idx: number) => (
                    <p key={idx} className="text-sm leading-relaxed">
                      <span className="font-semibold mr-1.5">{String.fromCharCode(65 + idx)})</span>
                      <LatexRenderer content={opt} />
                    </p>
                  ))}
                </div>
                <p className="text-sm font-bold text-emerald-700 pl-6">
                  Answer: {String.fromCharCode(65 + q.correctOption)}) <LatexRenderer content={q.options[q.correctOption]} />
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
