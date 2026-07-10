"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Upload, Plus, Loader2, Trash2, FileText, Download, X, CheckCircle2, AlertTriangle, Sigma, Database, ChevronDown, BookMarked, CheckSquare, Square, Award } from "lucide-react"
import { toast } from "react-hot-toast"
import LatexRenderer from "@/components/LatexRenderer"
import LatexEditor from "@/components/LatexEditor"
import { DraftRowEditor, type Draft } from "@/components/admin/QuestionDraftEditor"

const CSV_TEMPLATE = `question,optionA,optionB,optionC,optionD,correctOption,explanation,explanationVideoUrl
"What is 2 + 2?","3","4","5","6",B,"Basic addition",
"Solve for x: x + 5 = 10","x = 2","x = 5","x = 10","x = 15",B,"Subtract 5 from both sides",`

function QuestionBankPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [subjects, setSubjects] = useState<any[]>([])
  const [loadingSubjects, setLoadingSubjects] = useState(true)
  const [uploadSubjectId, setUploadSubjectId] = useState("")
  const [uploadMarks, setUploadMarks] = useState(1)
  const [filterSubjectId, setFilterSubjectId] = useState(searchParams.get("subjectId") || "")

  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{ imported: number; failed: number; errors: string[] } | null>(null)
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  const [manualFormData, setManualFormData] = useState({
    question: "", options: ["", "", "", ""], correctOption: 0, explanation: "", explanationVideoUrl: ""
  })
  const [drafts, setDrafts] = useState<Draft[] | null>(null)
  const [savingDrafts, setSavingDrafts] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkAssignSubjectId, setBulkAssignSubjectId] = useState("")
  const [assigningBulk, setAssigningBulk] = useState(false)
  const [bulkAssignMarks, setBulkAssignMarks] = useState(1)
  const [assigningMarksBulk, setAssigningMarksBulk] = useState(false)

  useEffect(() => {
    fetch("/api/admin/subjects")
      .then(res => res.json())
      .then(data => setSubjects(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoadingSubjects(false))
  }, [])

  useEffect(() => {
    fetchBank(filterSubjectId)
    router.replace(filterSubjectId ? `/lms/question-bank?subjectId=${filterSubjectId}` : "/lms/question-bank")
  }, [filterSubjectId])

  const fetchBank = async (subjectId?: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/question-bank${subjectId ? `?subjectId=${subjectId}` : ""}`)
      const data = await res.json()
      setQuestions(Array.isArray(data) ? data : [])
      setSelectedIds([])
    } finally {
      setLoading(false)
    }
  }

  const toggleSelected = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    setSelectedIds(prev => prev.length === questions.length ? [] : questions.map(q => q.id))
  }

  const handleBulkAssign = async () => {
    if (selectedIds.length === 0) return
    setAssigningBulk(true)
    try {
      const res = await fetch("/api/admin/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "assign-subject", questionIds: selectedIds, subjectId: bulkAssignSubjectId || null })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Tagged ${data.updated} question(s)`)
        fetchBank(filterSubjectId)
      } else {
        toast.error(data.error || "Failed to assign subject")
      }
    } finally {
      setAssigningBulk(false)
    }
  }

  const handleBulkAssignMarks = async () => {
    if (selectedIds.length === 0) return
    setAssigningMarksBulk(true)
    try {
      const res = await fetch("/api/admin/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "assign-marks", questionIds: selectedIds, marks: bulkAssignMarks })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Updated marks for ${data.updated} question(s)`)
        fetchBank(filterSubjectId)
      } else {
        toast.error(data.error || "Failed to assign marks")
      }
    } finally {
      setAssigningMarksBulk(false)
    }
  }

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadResult(null)
    try {
      const csvText = await file.text()
      const res = await fetch("/api/admin/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "csv-parse", csvText })
      })
      const data = await res.json()
      if (res.ok) {
        setDrafts(data.drafts)
      } else {
        toast.error(data.error || "Could not parse CSV")
      }
    } catch {
      toast.error("Could not read CSV file")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const updateDraft = (index: number, patch: Partial<Draft>) => {
    setDrafts(prev => {
      if (!prev) return prev
      const next = [...prev]
      next[index] = { ...next[index], ...patch }
      return next
    })
  }

  const removeDraft = (index: number) => {
    setDrafts(prev => prev ? prev.filter((_, i) => i !== index) : prev)
  }

  const handleConfirmDrafts = async () => {
    if (!drafts || drafts.length === 0) return
    setSavingDrafts(true)
    try {
      const res = await fetch("/api/admin/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "bulk",
          subjectId: uploadSubjectId || null,
          marks: uploadMarks,
          questions: drafts.map(d => ({
            question: d.question,
            options: d.options.filter(o => o.trim() !== ""),
            correctOption: d.correctOption,
            explanation: d.explanation,
            explanationVideoUrl: d.explanationVideoUrl,
          }))
        })
      })
      const data = await res.json()
      if (res.ok) {
        setUploadResult(data)
        toast.success(`Saved ${data.imported} question(s) to the bank`)
        setDrafts(null)
        fetchBank(filterSubjectId)
      } else {
        toast.error(data.error || "Failed to save questions")
      }
    } finally {
      setSavingDrafts(false)
    }
  }

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "question-bank-template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch("/api/admin/question-bank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "manual", subjectId: uploadSubjectId || null, marks: uploadMarks, ...manualFormData })
    })
    if (res.ok) {
      toast.success("Question added to bank")
      setIsManualModalOpen(false)
      fetchBank(filterSubjectId)
      setManualFormData({ question: "", options: ["", "", "", ""], correctOption: 0, explanation: "", explanationVideoUrl: "" })
    } else {
      toast.error("Failed to add question")
    }
  }

  const handleDelete = async (questionId: string) => {
    if (!confirm("Remove this question from the bank?")) return
    const res = await fetch(`/api/admin/question-bank/${questionId}`, { method: "DELETE" })
    const data = await res.json()
    if (res.ok) {
      toast.success("Removed")
      fetchBank(filterSubjectId)
    } else {
      toast.error(data.error || "Failed to remove")
    }
  }

  return (
    <div className="p-1 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold outfit flex items-center gap-2">
            <Database size={22} className="text-[var(--admin-accent)]" /> Question Bank
          </h2>
          <p className="text-slate-500 mt-1 text-sm">Organized by subject — reuse questions across any MCQ set or live exam, for any course.</p>
        </div>

        <div className="w-full md:w-64">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Filter by Subject</label>
          {loadingSubjects ? (
            <div className="h-12 w-full bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ) : (
            <div className="relative">
              <select
                value={filterSubjectId}
                onChange={e => setFilterSubjectId(e.target.value)}
                className="w-full appearance-none px-5 py-3 pr-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[var(--admin-accent)] outline-none transition-all shadow-sm font-bold text-sm text-slate-800 dark:text-slate-100"
              >
                <option value="">All Subjects</option>
                <option value="__uncategorized__">Uncategorized</option>
                {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          )}
        </div>
      </div>

      {drafts ? (
        <div className="space-y-6">
          <div className="card p-5 border border-[var(--admin-accent)]/30 bg-[var(--admin-accent)]/5 flex items-start gap-3">
            <Sigma size={20} className="text-[var(--admin-accent)] shrink-0 mt-0.5" />
            <div className="text-sm text-slate-600 dark:text-slate-300">
              <p className="font-bold text-slate-800 dark:text-slate-100 mb-1">Review before saving</p>
              <p>Check each parsed question below — fix any LaTeX (<code className="bg-white dark:bg-slate-900 px-1 rounded">$x^2$</code>) or wording issues, then confirm to save them all to the bank. Rows with errors are highlighted and won't be saved until fixed or removed.</p>
            </div>
          </div>

          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{drafts.length} Row{drafts.length !== 1 ? "s" : ""} Parsed</p>

          {drafts.map((draft, i) => (
            <DraftRowEditor
              key={i}
              draft={draft}
              onChange={patch => updateDraft(i, patch)}
              onRemove={() => removeDraft(i)}
            />
          ))}

          <div className="flex gap-3 sticky bottom-0 bg-white dark:bg-slate-950 py-4 border-t border-slate-100 dark:border-slate-800">
            <button onClick={() => setDrafts(null)} className="flex-1 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleConfirmDrafts}
              disabled={savingDrafts || drafts.length === 0 || drafts.some(d => d.errors.length > 0)}
              className="btn-admin-primary flex-[2] disabled:opacity-40"
              title={drafts.some(d => d.errors.length > 0) ? "Fix or remove rows with errors first" : ""}
            >
              {savingDrafts ? <Loader2 className="animate-spin" size={18} /> : `Confirm & Save ${drafts.length} Question${drafts.length !== 1 ? "s" : ""} to Bank`}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="card p-4 mb-4 bg-[var(--admin-accent)]/5 border border-[var(--admin-accent)]/20 rounded-2xl space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <BookMarked size={16} className="text-[var(--admin-accent)] shrink-0" />
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest shrink-0">Tag new questions with subject:</label>
              <select
                value={uploadSubjectId}
                onChange={e => setUploadSubjectId(e.target.value)}
                className="flex-1 min-w-[160px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:border-[var(--admin-accent)] text-sm font-bold text-slate-800 dark:text-slate-100"
              >
                <option value="">Uncategorized</option>
                {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {subjects.length === 0 && (
                <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">No subjects yet — add one on the Subjects page.</span>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Award size={16} className="text-[var(--admin-accent)] shrink-0" />
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest shrink-0">Marks per question:</label>
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1">
                {[1, 2].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setUploadMarks(m)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${uploadMarks === m ? "bg-[var(--admin-accent)] text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
                  >
                    {m} Mark{m !== 1 ? "s" : ""}
                  </button>
                ))}
                <input
                  type="number"
                  min={0.25}
                  step={0.25}
                  value={uploadMarks}
                  onChange={e => setUploadMarks(parseFloat(e.target.value) || 1)}
                  className="w-16 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-[var(--admin-accent)] text-xs font-bold text-center"
                  title="Custom marks value"
                />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <label className={`card p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-[var(--admin-accent)] transition-colors cursor-pointer flex flex-col items-center justify-center text-center gap-2 ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
              {uploading ? <Loader2 className="animate-spin text-[var(--admin-accent)]" size={28} /> : <Upload size={28} className="text-[var(--admin-accent)]" />}
              <span className="font-bold text-sm">Upload CSV</span>
              <span className="text-xs text-slate-400">question, optionA-D, correctOption, explanation</span>
              <input type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
            </label>

            <div className="card p-6 flex flex-col items-center justify-center text-center gap-3">
              <button onClick={downloadTemplate} className="btn-admin-secondary flex items-center gap-2">
                <Download size={16} /> Download CSV Template
              </button>
              <button onClick={() => setIsManualModalOpen(true)} className="text-sm font-bold text-[var(--admin-accent)] hover:opacity-75 transition-opacity flex items-center gap-1.5">
                <Plus size={16} /> Or add one question manually
              </button>
            </div>
          </div>

          {uploadResult && (
            <div className={`card p-5 mb-8 border ${uploadResult.failed > 0 ? "border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900" : "border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900"}`}>
              <div className="flex items-center gap-2 font-bold text-sm mb-2">
                {uploadResult.failed > 0 ? <AlertTriangle size={16} className="text-amber-600" /> : <CheckCircle2 size={16} className="text-green-600" />}
                Imported {uploadResult.imported} question(s), {uploadResult.failed} failed
              </div>
              {uploadResult.errors.length > 0 && (
                <ul className="text-xs text-slate-500 list-disc pl-5 space-y-0.5">
                  {uploadResult.errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-[var(--admin-accent)]" /></div>
          ) : questions.length === 0 ? (
            <div className="card py-20 text-center text-slate-500">
              <FileText size={48} className="mx-auto mb-4 opacity-20" />
              {filterSubjectId ? (
                <p>
                  No questions {filterSubjectId === "__uncategorized__" ? "are uncategorized" : "are tagged with this subject"} yet.{" "}
                  Switch to "All Subjects" above, select some questions, and use the bulk-assign bar to tag them.
                </p>
              ) : (
                <p>The question bank is empty. Upload a CSV or add a question manually to get started.</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <button onClick={toggleSelectAll} className="flex items-center gap-2 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:text-[var(--admin-accent)] transition-colors">
                  {selectedIds.length === questions.length ? <CheckSquare size={16} /> : <Square size={16} />}
                  {questions.length} Question{questions.length !== 1 ? "s" : ""} in Bank {selectedIds.length > 0 ? `— ${selectedIds.length} selected` : ""}
                </button>
              </div>

              {selectedIds.length > 0 && (
                <div className="card p-4 bg-[var(--admin-accent)]/5 border border-[var(--admin-accent)]/20 rounded-2xl space-y-3 sticky top-2 z-10">
                  <div className="flex items-center gap-3 flex-wrap">
                    <BookMarked size={16} className="text-[var(--admin-accent)] shrink-0" />
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest shrink-0">
                      Assign {selectedIds.length} selected to subject:
                    </span>
                    <select
                      value={bulkAssignSubjectId}
                      onChange={e => setBulkAssignSubjectId(e.target.value)}
                      className="flex-1 min-w-[160px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:border-[var(--admin-accent)] text-sm font-bold text-slate-800 dark:text-slate-100"
                    >
                      <option value="">Uncategorized</option>
                      {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <button onClick={handleBulkAssign} disabled={assigningBulk} className="btn-admin-primary !py-2 !px-4 text-sm disabled:opacity-50">
                      {assigningBulk ? <Loader2 className="animate-spin" size={16} /> : "Apply"}
                    </button>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Award size={16} className="text-[var(--admin-accent)] shrink-0" />
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest shrink-0">
                      Set marks for {selectedIds.length} selected:
                    </span>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1">
                      {[1, 2].map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setBulkAssignMarks(m)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${bulkAssignMarks === m ? "bg-[var(--admin-accent)] text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
                        >
                          {m} Mark{m !== 1 ? "s" : ""}
                        </button>
                      ))}
                      <input
                        type="number"
                        min={0.25}
                        step={0.25}
                        value={bulkAssignMarks}
                        onChange={e => setBulkAssignMarks(parseFloat(e.target.value) || 1)}
                        className="w-16 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-[var(--admin-accent)] text-xs font-bold text-center"
                      />
                    </div>
                    <button onClick={handleBulkAssignMarks} disabled={assigningMarksBulk} className="btn-admin-primary !py-2 !px-4 text-sm disabled:opacity-50">
                      {assigningMarksBulk ? <Loader2 className="animate-spin" size={16} /> : "Apply"}
                    </button>
                  </div>
                </div>
              )}

              {questions.map((q, i) => (
                <div key={q.id} className={`card p-5 bg-white dark:bg-slate-900 border rounded-2xl flex items-start justify-between gap-4 transition-colors ${selectedIds.includes(q.id) ? "border-[var(--admin-accent)]/50 bg-[var(--admin-accent)]/5" : "border-slate-100 dark:border-slate-800"}`}>
                  <label className="flex items-start gap-3 min-w-0 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(q.id)}
                      onChange={() => toggleSelected(q.id)}
                      className="mt-1 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-slate-400 font-bold text-xs">#{i + 1}</span>
                        {q.subject ? (
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                            {q.subject.name}
                          </span>
                        ) : (
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            Uncategorized
                          </span>
                        )}
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 px-2 py-0.5 rounded-full">
                          {q.marks} Mark{q.marks !== 1 ? "s" : ""}
                        </span>
                        {q._count?.exams > 0 && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-accent)] bg-[var(--admin-accent)]/10 px-2 py-0.5 rounded-full">
                            Used in {q._count.exams} set{q._count.exams !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2"><LatexRenderer content={q.question} /></p>
                    </div>
                  </label>
                  <button onClick={() => handleDelete(q.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors shrink-0" title="Delete from bank">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold outfit">Add Question to Bank</h3>
              <button onClick={() => setIsManualModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <LatexEditor
                label="Question Text"
                value={manualFormData.question}
                onChange={v => setManualFormData({ ...manualFormData, question: v })}
                placeholder="e.g. Find all values of $x$ such that $x^2 - 5x + 6 = 0$"
                rows={3}
                accentClass="focus:border-[var(--admin-accent)]"
              />
              <div className="grid grid-cols-2 gap-4">
                {manualFormData.options.map((opt, idx) => (
                  <div key={idx}>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Option {String.fromCharCode(65 + idx)}</label>
                    <div className="relative">
                      <input
                        required
                        value={opt}
                        onChange={e => {
                          const newOpts = [...manualFormData.options]
                          newOpts[idx] = e.target.value
                          setManualFormData({ ...manualFormData, options: newOpts })
                        }}
                        className={`w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border transition-all ${
                          manualFormData.correctOption === idx ? "border-green-500 ring-1 ring-green-500" : "border-slate-200 dark:border-slate-700"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setManualFormData({ ...manualFormData, correctOption: idx })}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          manualFormData.correctOption === idx ? "bg-green-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-transparent hover:bg-slate-300 dark:hover:bg-slate-600"
                        }`}
                      >
                        <CheckCircle2 size={14} />
                      </button>
                    </div>
                    {opt.trim() && (
                      <div className="text-xs text-slate-500 px-1 mt-1"><LatexRenderer content={opt} /></div>
                    )}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2 ml-1 text-[var(--admin-accent)]">Video Explanation (YouTube Link)</label>
                  <input
                    value={manualFormData.explanationVideoUrl}
                    onChange={e => setManualFormData({ ...manualFormData, explanationVideoUrl: e.target.value })}
                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-[var(--admin-accent)] transition-all"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
                <LatexEditor
                  label="Explanation Text"
                  value={manualFormData.explanation}
                  onChange={v => setManualFormData({ ...manualFormData, explanation: v })}
                  placeholder="Briefly explain why the correct answer is correct..."
                  rows={2}
                  accentClass="focus:border-[var(--admin-accent)]"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsManualModalOpen(false)} className="flex-1 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="btn-admin-primary flex-1">Add to Bank</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function QuestionBankPage() {
  return (
    <Suspense fallback={<div className="p-6 flex items-center justify-center py-20"><Loader2 className="animate-spin text-[var(--admin-accent)]" /></div>}>
      <QuestionBankPageInner />
    </Suspense>
  )
}
