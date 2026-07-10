"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, XCircle, ChevronRight, ChevronLeft, RefreshCcw, Trophy, FileText, MinusCircle, Percent, Loader2, AlertCircle } from "lucide-react"
import LatexRenderer from "@/components/LatexRenderer"

export default function MCQExamPage({ params }: { params: Promise<{ slug: string, examId: string }> }) {
  const { slug, examId } = use(params)
  const router = useRouter()
  const [exam, setExam] = useState<any>(null)
  const [shuffledQuestions, setShuffledQuestions] = useState<any[]>([])
  const [randomPdf, setRandomPdf] = useState<any>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/exams/${examId}`)
      .then(async res => {
        if (res.status === 401) {
          router.replace(`/login?callbackUrl=/courses/${slug}/learn/mcq/${examId}`)
          return null
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || "Failed to load exam details")
        }
        return res.json()
      })
      .then(data => {
        if (!data) return // redirecting to login
        setExam(data)
        setShuffledQuestions([...data.questions].sort(() => Math.random() - 0.5))

        const allNotes = data.courses?.flatMap((c: any) => c.notes || []) || []
        if (allNotes.length > 0) {
          setRandomPdf(allNotes[Math.floor(Math.random() * allNotes.length)])
        }
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [examId])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-24 text-center">
        <Loader2 className="animate-spin mx-auto text-[var(--primary)]" size={32} />
        <p className="text-slate-500 dark:text-slate-400 mt-4 font-semibold">Loading practice set...</p>
      </div>
    )
  }

  if (error || !exam) {
    return (
      <div className="max-w-lg mx-auto py-16 px-8 text-center bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-3xl">
        <AlertCircle className="mx-auto text-red-500 mb-3" size={32} />
        <p className="text-red-700 dark:text-red-400 font-black text-lg">Failed to Load Practice Set</p>
        <p className="text-red-600/80 dark:text-red-400/70 text-sm mt-1">{error || "Set not found."}</p>
      </div>
    )
  }

  const handleSelect = (qId: string, index: number) => {
    if (result) return
    setSelectedOptions(prev => ({ ...prev, [qId]: index }))
  }

  const handleSubmit = async () => {
    const attempted = Object.keys(selectedOptions).length
    const msg = attempted < shuffledQuestions.length
      ? `You have only attempted ${attempted} of ${shuffledQuestions.length} questions. Are you sure you want to end the test early?`
      : "Are you sure you want to submit and end the test?"

    if (!confirm(msg)) return

    setSubmitting(true)
    const answersToSend: Record<string, number> = {}
    exam.questions.forEach((q: any, idx: number) => {
      if (selectedOptions[q.id] !== undefined) answersToSend[idx.toString()] = selectedOptions[q.id]
    })

    try {
      const res = await fetch(`/api/exams/${examId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answersToSend })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to submit")
      setResult(data)
    } catch (e: any) {
      alert(e.message || "Failed to submit exam")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRetake = () => {
    setSelectedOptions({})
    setResult(null)
    setCurrentQuestion(0)
    setShuffledQuestions([...exam.questions].sort(() => Math.random() - 0.5))
    const allNotes = exam.courses?.flatMap((c: any) => c.notes || []) || []
    if (allNotes.length > 0) setRandomPdf(allNotes[Math.floor(Math.random() * allNotes.length)])
  }

  const scorePercent = result ? Math.max(0, Math.round((result.score / result.total) * 100)) : 0
  const questionsById: Record<string, any> = result ? Object.fromEntries(result.questions.map((q: any) => [q.id, q])) : {}

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 pb-24">
      {randomPdf && (
        <div className="flex items-center justify-between gap-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-3xl px-6 py-5 mb-6 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/40 text-green-600 flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black text-green-600 uppercase tracking-widest block">Recommended Study Resource</span>
              <h4 className="text-sm font-black text-green-900 dark:text-green-300 truncate">{randomPdf.title}</h4>
            </div>
          </div>
          <a
            href={randomPdf.fileUrl?.startsWith("http") ? randomPdf.fileUrl : `https://assets.sdmaths.com${randomPdf.fileUrl?.startsWith("/") ? "" : "/"}${randomPdf.fileUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl text-xs font-black bg-green-600 text-white shrink-0 shadow-sm hover:bg-green-700 transition-colors"
          >
            Open PDF
          </a>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="px-6 sm:px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center gap-4 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="min-w-0">
            <h1 className="text-xl font-black outfit !text-slate-900 dark:!text-white truncate">{exam.title}</h1>
            <p className="text-xs !text-slate-500 dark:!text-slate-400 font-bold mt-0.5">{exam.questions.length} Practice Questions</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {exam.isFree && (
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 px-2.5 py-1 rounded-lg">Free</span>
            )}
            {exam.negativeMarking && (
              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-2.5 py-1 rounded-lg">
                <Percent size={10} /> -5% Marking
              </span>
            )}
          </div>
        </div>

        {result ? (
          <div className="px-6 sm:px-8 py-12 text-center">
            <div className="inline-flex w-36 h-36 rounded-full p-2 mb-6" style={{ background: "conic-gradient(var(--primary) 0%, var(--secondary) 100%)", boxShadow: "0 10px 30px -8px var(--primary-glow)" }}>
              <div className="flex flex-col items-center justify-center w-full h-full rounded-full bg-white dark:bg-slate-900">
                <span className="text-3xl font-black outfit text-slate-900 dark:text-white leading-none">{scorePercent}%</span>
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 mt-1 uppercase">{result.score.toFixed(2)}/{result.total}</span>
                <span className="text-[9px] font-bold text-slate-400 mt-0.5">{Object.keys(selectedOptions).length} of {result.total} Attempted</span>
              </div>
            </div>

            <h2 className="text-2xl font-black outfit text-slate-900 dark:text-white mb-2">
              {scorePercent >= 80 ? "🎉 Excellent Work!" : scorePercent >= 50 ? "👍 Well Done!" : "📚 Keep Practicing!"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8 leading-relaxed">
              {scorePercent >= 80
                ? "You've mastered this practice set — you're well prepared for the real exam."
                : "Review the detailed explanations below to strengthen any weak spots."}
            </p>

            <button onClick={handleRetake} className="btn-primary mx-auto">
              <RefreshCcw size={14} /> Retake Practice Set
            </button>
          </div>
        ) : (
          <div className="px-6 sm:px-8 py-8">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-sm font-bold !text-slate-600 dark:!text-slate-300">
                  Question {currentQuestion + 1} of {shuffledQuestions.length}
                </span>
                <span className="text-sm font-black !text-[var(--primary)]">
                  {Math.round(((currentQuestion + 1) / shuffledQuestions.length) * 100)}%
                </span>
              </div>
              {/* Single scalable progress bar — a dot-per-question row breaks for large sets (e.g. 100 questions) */}
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestion + 1) / shuffledQuestions.length) * 100}%`,
                    background: "linear-gradient(90deg, var(--primary), var(--secondary))",
                  }}
                />
              </div>
            </div>

            {shuffledQuestions.length > 0 && shuffledQuestions[currentQuestion] && (
              <div className="mb-10">
                <h3 className="text-lg font-bold outfit !text-slate-800 dark:!text-slate-100 mb-6 leading-relaxed">
                  <LatexRenderer content={shuffledQuestions[currentQuestion].question} />
                </h3>

                <div className="flex flex-col gap-2.5">
                  {shuffledQuestions[currentQuestion].options.map((option: string, index: number) => {
                    const isSelected = selectedOptions[shuffledQuestions[currentQuestion].id] === index
                    return (
                      <button
                        key={index}
                        onClick={() => handleSelect(shuffledQuestions[currentQuestion].id, index)}
                        className={`w-full text-left px-5 py-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 text-sm transition-all ${
                          isSelected
                            ? "border-[var(--primary)] bg-[var(--primary)]/10 font-bold text-slate-900 dark:text-white"
                            : "border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="opacity-50">{String.fromCharCode(65 + index)}.</span>
                          <LatexRenderer content={option} />
                        </span>
                        {isSelected && <CheckCircle size={16} className="text-[var(--primary)] shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-5">
              <button
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                className="px-4 py-2.5 rounded-xl text-xs font-black border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent flex items-center gap-1 transition-colors"
              >
                <ChevronLeft size={14} /> Previous
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-500/20 disabled:opacity-50 flex items-center gap-1.5"
              >
                {submitting ? <Loader2 className="animate-spin" size={14} /> : "End Test"}
              </button>

              {currentQuestion === shuffledQuestions.length - 1 ? (
                <button onClick={handleSubmit} disabled={submitting} className="btn-primary !py-2.5 !px-5 text-xs disabled:opacity-50">
                  {submitting ? <Loader2 className="animate-spin" size={14} /> : "Submit Exam"}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestion(prev => Math.min(shuffledQuestions.length - 1, prev + 1))}
                  className="btn-primary !py-2.5 !px-5 text-xs"
                >
                  Next <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {result && (
          <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-5 sm:px-8 py-8 flex flex-col gap-4">
            <h3 className="text-lg font-black outfit text-slate-900 dark:text-white">Detailed Question Analysis</h3>

            {shuffledQuestions.map((sq: any, i: number) => {
              const q = questionsById[sq.id]
              if (!q) return null
              const selected = selectedOptions[q.id]
              const isCorrect = selected === q.correctOption
              const isAttempted = selected !== undefined && selected !== null

              return (
                <div key={q.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <div className="flex gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center text-[10px] font-black shrink-0">{i + 1}</span>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-relaxed"><LatexRenderer content={q.question} /></h4>
                    </div>
                    <span className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                      !isAttempted ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-200 dark:border-amber-900"
                      : isCorrect ? "bg-green-50 dark:bg-green-950/20 text-green-600 border-green-200 dark:border-green-900"
                      : "bg-red-50 dark:bg-red-950/20 text-red-600 border-red-200 dark:border-red-900"
                    }`}>
                      {!isAttempted ? <><MinusCircle size={11} /> Skipped</> : isCorrect ? <><CheckCircle size={11} /> Correct</> : <><XCircle size={11} /> Incorrect{exam.negativeMarking ? " (-5%)" : ""}</>}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 mb-4">
                    {q.options.map((opt: string, idx: number) => {
                      const isRight = idx === q.correctOption
                      const isPicked = idx === selected
                      return (
                        <div key={idx} className={`px-4 py-2.5 rounded-xl border text-sm flex items-center justify-between gap-2 ${
                          isRight ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 text-green-700 dark:text-green-400 font-bold"
                          : isPicked ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 font-bold"
                          : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-500"
                        }`}>
                          <span className="flex items-center flex-wrap gap-2">
                            <span className="opacity-50">{String.fromCharCode(65 + idx)}.</span>
                            <LatexRenderer content={opt} />
                            {isRight && <span className="text-[9px] font-black uppercase bg-green-600 text-white px-1.5 py-0.5 rounded">{isPicked ? "Your Choice · Correct" : "Correct Answer"}</span>}
                            {isPicked && !isRight && <span className="text-[9px] font-black uppercase bg-red-600 text-white px-1.5 py-0.5 rounded">Your Choice</span>}
                          </span>
                          {isRight ? <CheckCircle size={14} className="text-green-500 shrink-0" /> : isPicked ? <XCircle size={14} className="text-red-500 shrink-0" /> : null}
                        </div>
                      )
                    })}
                  </div>

                  {q.explanation && (
                    <div className="px-4 py-3 bg-[var(--primary)]/5 border-l-4 border-[var(--primary)] rounded-lg text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      <strong className="block mb-1 text-[10px] uppercase tracking-widest text-[var(--primary)]">Explanation</strong>
                      <LatexRenderer content={q.explanation} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
