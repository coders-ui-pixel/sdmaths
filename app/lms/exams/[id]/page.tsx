"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Plus, Trash2, Video, FileText, Loader2, Upload, CheckCircle2, ChevronDown, ChevronUp, BookOpen, X, Shuffle, ListChecks, Search, Sparkles, Home, Percent, Sigma, Database, BookMarked, Radio, Calendar, CheckSquare, Square, Award, FileDown } from "lucide-react"
import { toast } from "react-hot-toast"
import LatexRenderer from "@/components/LatexRenderer"
import LatexEditor from "@/components/LatexEditor"
import { DraftRowEditor, type Draft } from "@/components/admin/QuestionDraftEditor"

export default function ManageQuestionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [questions, setQuestions] = useState<any[]>([])
  const [exam, setExam] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [bank, setBank] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [uploadSubjectId, setUploadSubjectId] = useState("")
  const [uploadMarks, setUploadMarks] = useState(1)
  const [pickerSubjectIds, setPickerSubjectIds] = useState<string[]>([])
  const [pickerMarksFilter, setPickerMarksFilter] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isUpdatingCourse, setIsUpdatingCourse] = useState(false)
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [pickerTab, setPickerTab] = useState<"manual" | "random">("manual")
  const [selectedBankIds, setSelectedBankIds] = useState<string[]>([])
  const [bankSearch, setBankSearch] = useState("")
  const [attaching, setAttaching] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [drafts, setDrafts] = useState<Draft[] | null>(null)
  const [savingDrafts, setSavingDrafts] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({ startTime: "", endTime: "" })
  const [savingSchedule, setSavingSchedule] = useState(false)

  // Auto-Random wizard: pick specific subjects (tick marks) or pull from the
  // whole bank, then say how many 1-mark and how many 2-mark questions to grab
  // from each. Processes sequentially so the admin can watch each subject load.
  const [wizardMode, setWizardMode] = useState<"subjects" | "all">("subjects")
  const [wizardSelectedSubjects, setWizardSelectedSubjects] = useState<string[]>([])
  const [wizardCounts, setWizardCounts] = useState<Record<string, { count1: number; count2: number }>>({})
  const [wizardStatus, setWizardStatus] = useState<{ label: string; status: "pending" | "loading" | "done" | "error"; count?: number; message?: string }[]>([])
  const [wizardRunning, setWizardRunning] = useState(false)

  const [manualFormData, setManualFormData] = useState({
    question: "",
    options: ["", "", "", ""],
    correctOption: 0,
    explanation: "",
    explanationVideoUrl: ""
  })

  useEffect(() => {
    fetchQuestions()
    fetchExam()
    fetchCourses()
    fetchBank()
    fetch("/api/admin/subjects").then(res => res.json()).then(data => setSubjects(Array.isArray(data) ? data : [])).catch(() => {})
  }, [id])

  const fetchQuestions = async () => {
    const res = await fetch(`/api/admin/exams/${id}/questions`)
    const data = await res.json()
    setQuestions(data)
    setLoading(false)
  }

  const toLocalInputValue = (iso: string | null) => {
    if (!iso) return ""
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, "0")
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  const fetchExam = async () => {
    try {
      const res = await fetch(`/api/admin/exams/${id}`)
      const data = await res.json()
      setExam(data)
      setScheduleForm({ startTime: toLocalInputValue(data.startTime), endTime: toLocalInputValue(data.endTime) })
    } catch {}
  }

  const handleSaveSchedule = async () => {
    if (scheduleForm.startTime && scheduleForm.endTime && new Date(scheduleForm.endTime) <= new Date(scheduleForm.startTime)) {
      toast.error("End time must be after start time")
      return
    }
    setSavingSchedule(true)
    try {
      const res = await fetch(`/api/admin/exams/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTime: scheduleForm.startTime || null, endTime: scheduleForm.endTime || null })
      })
      if (res.ok) {
        toast.success("Schedule updated")
        fetchExam()
      } else {
        toast.error("Failed to update schedule")
      }
    } finally {
      setSavingSchedule(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/admin/courses")
      const data = await res.json()
      setCourses(data)
    } catch {}
  }

  const fetchBank = async () => {
    try {
      const res = await fetch("/api/admin/question-bank")
      const data = await res.json()
      setBank(Array.isArray(data) ? data : [])
    } catch {}
  }

  const handleConnectCourse = async (newCourseId: string) => {
    if (!newCourseId) return
    setIsUpdatingCourse(true)
    try {
      const res = await fetch(`/api/admin/exams/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectCourseId: newCourseId })
      })
      if (res.ok) {
        toast.success("Course assigned successfully!")
        fetchExam()
      } else {
        toast.error("Failed to assign course")
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setIsUpdatingCourse(false)
    }
  }

  const handleDisconnectCourse = async (cid: string) => {
    if (!confirm("Remove this exam from this course?")) return
    setIsUpdatingCourse(true)
    try {
      const res = await fetch(`/api/admin/exams/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disconnectCourseId: cid })
      })
      if (res.ok) {
        toast.success("Course removed successfully!")
        fetchExam()
      } else {
        toast.error("Failed to remove course")
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setIsUpdatingCourse(false)
    }
  }

  const handleSettingChange = async (field: "isFree" | "isFeaturedOnHome" | "negativeMarking", value: boolean) => {
    setSavingSettings(true)
    try {
      const res = await fetch(`/api/admin/exams/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value })
      })
      if (res.ok) {
        await fetchExam()
      } else {
        toast.error("Failed to update setting")
      }
    } finally {
      setSavingSettings(false)
    }
  }

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
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
          examId: id,
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
        toast.success(`Saved ${data.imported} question(s) to the bank and this set`)
        setDrafts(null)
        fetchQuestions()
        fetchBank()
      } else {
        toast.error(data.error || "Failed to save questions")
      }
    } finally {
      setSavingDrafts(false)
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const bankRes = await fetch("/api/admin/question-bank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "manual", subjectId: uploadSubjectId || null, marks: uploadMarks, ...manualFormData })
    })
    if (!bankRes.ok) {
      toast.error("Failed to create question")
      return
    }
    const created = await bankRes.json()
    await fetch(`/api/admin/exams/${id}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "manual", questionIds: [created.id] })
    })
    toast.success("Question added to bank and set")
    setIsManualModalOpen(false)
    fetchQuestions()
    fetchBank()
    setManualFormData({ question: "", options: ["", "", "", ""], correctOption: 0, explanation: "", explanationVideoUrl: "" })
  }

  const handleAttachSelected = async () => {
    if (selectedBankIds.length === 0) return
    setAttaching(true)
    try {
      const res = await fetch(`/api/admin/exams/${id}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "manual", questionIds: selectedBankIds })
      })
      if (res.ok) {
        toast.success(`Attached ${selectedBankIds.length} question(s)`)
        setSelectedBankIds([])
        setIsPickerOpen(false)
        fetchQuestions()
      } else {
        toast.error("Failed to attach questions")
      }
    } finally {
      setAttaching(false)
    }
  }

  const toggleWizardSubject = (key: string) => {
    setWizardSelectedSubjects(prev => prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key])
  }

  const updateWizardCount = (key: string, field: "count1" | "count2", value: number) => {
    setWizardCounts(prev => ({
      ...prev,
      [key]: { count1: prev[key]?.count1 || 0, count2: prev[key]?.count2 || 0, [field]: value }
    }))
  }

  const runWizard = async () => {
    type Job = { subjectId: string | null | undefined; label: string; marks: number; count: number }
    const jobs: Job[] = []

    const keys = wizardMode === "all" ? ["__all__"] : wizardSelectedSubjects
    keys.forEach(key => {
      const counts = wizardCounts[key] || { count1: 0, count2: 0 }
      const subjectId = key === "__all__" ? undefined : key === "__uncategorized__" ? null : key
      const label = key === "__all__" ? "All Subjects" : key === "__uncategorized__" ? "Uncategorized" : (subjects.find((s: any) => s.id === key)?.name || "Subject")
      if (counts.count1 > 0) jobs.push({ subjectId, label, marks: 1, count: counts.count1 })
      if (counts.count2 > 0) jobs.push({ subjectId, label, marks: 2, count: counts.count2 })
    })

    if (jobs.length === 0) {
      toast.error("Enter at least one question count first")
      return
    }

    setWizardRunning(true)
    setWizardStatus(jobs.map(j => ({ label: `${j.label} — ${j.marks} mark${j.marks !== 1 ? "s" : ""} × ${j.count}`, status: "pending" })))

    let totalAttached = 0
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i]
      setWizardStatus(prev => prev.map((s, idx) => idx === i ? { ...s, status: "loading" } : s))
      try {
        const res = await fetch(`/api/admin/exams/${id}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "random", count: job.count, subjectId: job.subjectId, marks: job.marks })
        })
        const data = await res.json()
        if (res.ok) {
          totalAttached += data.attached
          setWizardStatus(prev => prev.map((s, idx) => idx === i ? { ...s, status: "done", count: data.attached } : s))
        } else {
          setWizardStatus(prev => prev.map((s, idx) => idx === i ? { ...s, status: "error", message: data.error } : s))
        }
      } catch {
        setWizardStatus(prev => prev.map((s, idx) => idx === i ? { ...s, status: "error", message: "Request failed" } : s))
      }
    }

    setWizardRunning(false)
    if (totalAttached > 0) {
      toast.success(`Attached ${totalAttached} question(s) to the set`)
      fetchQuestions()
    }
  }

  const resetWizard = () => {
    setWizardStatus([])
    setWizardSelectedSubjects([])
    setWizardCounts({})
    setIsPickerOpen(false)
  }

  const handleRemoveFromSet = async (questionId: string) => {
    if (!confirm("Remove this question from the set? It will stay in the bank.")) return
    const res = await fetch(`/api/admin/exams/${id}/questions`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId })
    })
    if (res.ok) {
      toast.success("Removed from set")
      fetchQuestions()
    } else {
      toast.error("Failed to remove")
    }
  }

  const togglePickerSubject = (key: string) => {
    setPickerSubjectIds(prev => prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key])
  }

  const togglePickerMarks = (m: number) => {
    setPickerMarksFilter(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
  }

  const attachedIds = new Set(questions.map(q => q.id))
  const availableBank = bank.filter(q => {
    if (attachedIds.has(q.id)) return false
    if (!q.question.toLowerCase().includes(bankSearch.toLowerCase())) return false
    if (pickerMarksFilter.length > 0 && !pickerMarksFilter.includes(q.marks)) return false
    if (pickerSubjectIds.length === 0) return true
    return pickerSubjectIds.some(key => key === "__uncategorized__" ? !q.subjectId : q.subjectId === key)
  })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold outfit">{exam?.title || "Exam Questions"}</h2>
          <p className="text-slate-500 mt-1">Build this set from the course's question bank, or import new questions.</p>
        </div>
        {questions.length > 0 && (
          <Link href={`/lms/exams/${id}/print`} target="_blank" className="btn-admin-secondary flex items-center gap-2 shrink-0">
            <FileDown size={18} /> Download PDF
          </Link>
        )}
      </div>

      {/* Course Assignment Section — controls which courses' students can access this exam.
          The question bank below is subject-organized and independent of course assignment. */}
      {exam && (
        <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl mb-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <BookOpen size={16} className="text-[var(--admin-accent)]" />
            Assigned Courses
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            {exam.courses && exam.courses.length > 0 ? (
              exam.courses.map((c: any) => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-2 text-xs font-bold bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] px-3 py-1.5 rounded-xl border border-[var(--admin-accent)]/20"
                >
                  {c.title} <span className="opacity-50 font-normal">({c.slug})</span>
                  <button
                    disabled={isUpdatingCourse}
                    onClick={() => handleDisconnectCourse(c.id)}
                    className="hover:bg-[var(--admin-accent)]/20 p-0.5 rounded-full transition-colors"
                    title="Remove Course"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">⚠ Unassigned — pick a course below so enrolled students can access this set.</span>
            )}

            {courses.filter(c => !exam.courses?.some((ec: any) => ec.id === c.id)).length > 0 && (
              <div className="relative ml-auto">
                <select
                  disabled={isUpdatingCourse}
                  value=""
                  onChange={(e) => handleConnectCourse(e.target.value)}
                  className="text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 px-3 py-2 rounded-xl outline-none focus:border-[var(--admin-accent)] cursor-pointer"
                >
                  <option value="" disabled>+ Assign to Course</option>
                  {courses
                    .filter(c => !exam.courses?.some((ec: any) => ec.id === c.id))
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.title} ({c.slug})</option>
                    ))
                  }
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-wrap gap-3">
        <button onClick={() => setIsPickerOpen(true)} className="btn-admin-secondary flex items-center gap-2">
          <Database size={18} /> Create from Question Bank
        </button>
        <label className={`btn-admin-primary flex items-center gap-2 cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
          {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
          Upload CSV
          <input type="file" className="hidden" accept=".csv" onChange={handleCsvUpload} />
        </label>
        <button onClick={() => setIsManualModalOpen(true)} className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold flex items-center gap-2 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          <Plus size={18} /> Add Manual
        </button>
      </div>

      {!drafts && (
        <div className="card p-4 mb-6 bg-[var(--admin-accent)]/5 border border-[var(--admin-accent)]/20 rounded-2xl space-y-3">
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
              />
            </div>
          </div>
        </div>
      )}

      {drafts && (
        <div className="space-y-6 mb-8">
          <div className="card p-5 border border-[var(--admin-accent)]/30 bg-[var(--admin-accent)]/5 flex items-start gap-3">
            <Sigma size={20} className="text-[var(--admin-accent)] shrink-0 mt-0.5" />
            <div className="text-sm text-slate-600 dark:text-slate-300">
              <p className="font-bold text-slate-800 dark:text-slate-100 mb-1">Review before saving</p>
              <p>Check each parsed question below — fix any LaTeX (<code className="bg-white dark:bg-slate-900 px-1 rounded">$x^2$</code>) or wording issues, then confirm to add them to both the bank and this set. Rows with errors are highlighted and won't be saved until fixed or removed.</p>
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
              {savingDrafts ? <Loader2 className="animate-spin" size={18} /> : `Confirm & Add ${drafts.length} Question${drafts.length !== 1 ? "s" : ""} to Set`}
            </button>
          </div>
        </div>
      )}

      {!drafts && (
      <>
      {/* Live Exam Schedule */}
      {exam && exam.examType === "LIVE" && (
        <div className="card p-6 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/40 rounded-2xl mb-6">
          <h3 className="text-sm font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Radio size={16} /> Live Exam Schedule
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1 flex items-center gap-1"><Calendar size={11} /> Start Time</label>
              <input
                type="datetime-local"
                value={scheduleForm.startTime}
                onChange={e => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-red-400 text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1 flex items-center gap-1"><Calendar size={11} /> End Time</label>
              <input
                type="datetime-local"
                value={scheduleForm.endTime}
                onChange={e => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-red-400 text-sm"
              />
            </div>
          </div>
          <button onClick={handleSaveSchedule} disabled={savingSchedule} className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50">
            {savingSchedule ? <Loader2 className="animate-spin" size={16} /> : "Save Schedule"}
          </button>
        </div>
      )}

      {/* Set Settings */}
      {exam && (
        <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl mb-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Set Settings</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <SettingToggle
              icon={Sparkles}
              label="Free Practice Set"
              description="Attemptable by any logged-in student, even without enrollment."
              checked={!!exam.isFree}
              disabled={savingSettings}
              onChange={v => handleSettingChange("isFree", v)}
            />
            <SettingToggle
              icon={Home}
              label="Feature on Homepage"
              description="Show this set in the homepage's free practice section."
              checked={!!exam.isFeaturedOnHome}
              disabled={savingSettings || !exam.isFree}
              onChange={v => handleSettingChange("isFeaturedOnHome", v)}
            />
            <SettingToggle
              icon={Percent}
              label="Negative Marking"
              description="Wrong answers deduct 5%. Skipped questions are never penalized."
              checked={!!exam.negativeMarking}
              disabled={savingSettings}
              onChange={v => handleSettingChange("negativeMarking", v)}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-[var(--admin-accent)]" /></div>
      ) : questions.length === 0 ? (
        <div className="card py-20 text-center text-slate-500">
          <FileText size={48} className="mx-auto mb-4 opacity-20" />
          <p>No questions in this set yet. Pick from the bank, upload a document, or add one manually.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q: any, i: number) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={i}
              marks={q.marks ?? 1}
              onRemove={() => handleRemoveFromSet(q.id)}
            />
          ))}
        </div>
      )}
      </>
      )}

      {/* Bank Picker Modal */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold outfit">Pick From Question Bank</h3>
              <button onClick={resetWizard} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-fit">
              <button onClick={() => setPickerTab("manual")} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${pickerTab === "manual" ? "bg-white dark:bg-slate-700 shadow-sm text-[var(--admin-accent)]" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
                <ListChecks size={14} /> Pick Manually
              </button>
              <button onClick={() => setPickerTab("random")} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${pickerTab === "random" ? "bg-white dark:bg-slate-700 shadow-sm text-[var(--admin-accent)]" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
                <Shuffle size={14} /> Auto-Random
              </button>
            </div>

            {pickerTab === "manual" ? (
              <>
                <div className="mb-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Tick which subjects to include</label>
                  <div className="flex flex-wrap gap-2">
                    {[{ id: "__uncategorized__", name: "Uncategorized" }, ...subjects].map((s: any) => (
                      <label
                        key={s.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all text-sm font-bold ${
                          pickerSubjectIds.includes(s.id)
                            ? "border-[var(--admin-accent)] bg-[var(--admin-accent)]/10 text-[var(--admin-accent)]"
                            : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={pickerSubjectIds.includes(s.id)}
                          onChange={() => togglePickerSubject(s.id)}
                          className="sr-only"
                        />
                        {pickerSubjectIds.includes(s.id) ? <CheckSquare size={14} /> : <Square size={14} />}
                        {s.name}
                      </label>
                    ))}
                  </div>
                  {pickerSubjectIds.length === 0 && (
                    <p className="text-xs text-slate-400 mt-2 ml-1">None ticked — showing all subjects.</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Tick which marks to include</label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2].map(m => (
                      <label
                        key={m}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all text-sm font-bold ${
                          pickerMarksFilter.includes(m)
                            ? "border-[var(--admin-accent)] bg-[var(--admin-accent)]/10 text-[var(--admin-accent)]"
                            : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={pickerMarksFilter.includes(m)}
                          onChange={() => togglePickerMarks(m)}
                          className="sr-only"
                        />
                        {pickerMarksFilter.includes(m) ? <CheckSquare size={14} /> : <Square size={14} />}
                        {m} Mark{m !== 1 ? "s" : ""}
                      </label>
                    ))}
                  </div>
                  {pickerMarksFilter.length === 0 && (
                    <p className="text-xs text-slate-400 mt-2 ml-1">None ticked — showing all marks values.</p>
                  )}
                </div>

                <div className="relative mb-4">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={bankSearch}
                    onChange={e => setBankSearch(e.target.value)}
                    placeholder="Search bank questions..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-[var(--admin-accent)] text-sm"
                  />
                </div>

                {availableBank.length > 0 && (
                  <button
                    onClick={() => setSelectedBankIds(prev => prev.length === availableBank.length ? [] : availableBank.map(q => q.id))}
                    className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-[var(--admin-accent)] transition-colors mb-3"
                  >
                    {selectedBankIds.length === availableBank.length ? <CheckSquare size={14} /> : <Square size={14} />}
                    Select all {availableBank.length} filtered
                  </button>
                )}

                <div className="space-y-2 max-h-96 overflow-y-auto mb-6">
                  {availableBank.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-10">No unused bank questions found. Upload or add some first.</p>
                  ) : (
                    availableBank.map(q => (
                      <label key={q.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBankIds.includes(q.id)}
                          onChange={e => setSelectedBankIds(prev => e.target.checked ? [...prev, q.id] : prev.filter(x => x !== q.id))}
                          className="mt-1"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${q.subject ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400" : "text-slate-400 bg-slate-100 dark:bg-slate-800"}`}>
                              {q.subject?.name || "Uncategorized"}
                            </span>
                            <span className="inline-block text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400">
                              {q.marks} Mark{q.marks !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <span className="block text-sm text-slate-700 dark:text-slate-300 line-clamp-2"><LatexRenderer content={q.question} /></span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                <button onClick={handleAttachSelected} disabled={selectedBankIds.length === 0 || attaching} className="btn-admin-primary w-full disabled:opacity-40">
                  {attaching ? <Loader2 className="animate-spin" size={18} /> : `Attach ${selectedBankIds.length || ""} Selected`}
                </button>
              </>
            ) : (
              <RandomWizard
                subjects={subjects}
                bank={bank}
                attachedIds={attachedIds}
                wizardMode={wizardMode}
                setWizardMode={setWizardMode}
                wizardSelectedSubjects={wizardSelectedSubjects}
                toggleWizardSubject={toggleWizardSubject}
                wizardCounts={wizardCounts}
                updateWizardCount={updateWizardCount}
                wizardStatus={wizardStatus}
                wizardRunning={wizardRunning}
                onRun={runWizard}
                onDone={resetWizard}
              />
            )}
          </div>
        </div>
      )}

      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold outfit mb-6">Add Manual Question</h3>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <LatexEditor
                  label="Question Text"
                  value={manualFormData.question}
                  onChange={v => setManualFormData({...manualFormData, question: v})}
                  placeholder="e.g. Find all values of $x$ such that $x^2 - 5x + 6 = 0$"
                  rows={3}
                  accentClass="focus:border-[var(--admin-accent)]"
                />
              </div>

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
                          setManualFormData({...manualFormData, options: newOpts})
                        }}
                        className={`w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border transition-all ${
                          manualFormData.correctOption === idx ? "border-green-500 ring-1 ring-green-500" : "border-slate-200 dark:border-slate-700"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setManualFormData({...manualFormData, correctOption: idx})}
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
                    onChange={e => setManualFormData({...manualFormData, explanationVideoUrl: e.target.value})}
                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-[var(--admin-accent)] transition-all"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
                <div>
                  <LatexEditor
                    label="Explanation Text"
                    value={manualFormData.explanation}
                    onChange={v => setManualFormData({...manualFormData, explanation: v})}
                    placeholder="Briefly explain why the correct answer is correct..."
                    rows={2}
                    accentClass="focus:border-[var(--admin-accent)]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsManualModalOpen(false)} className="flex-1 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="btn-admin-primary flex-1">Add Question</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function SettingToggle({ icon: Icon, label, description, checked, disabled, onChange }: {
  icon: any, label: string, description: string, checked: boolean, disabled?: boolean, onChange: (v: boolean) => void
}) {
  return (
    <label className={`flex items-start gap-3 p-4 rounded-xl border transition-colors cursor-pointer ${
      checked ? "border-[var(--admin-accent)]/40 bg-[var(--admin-accent)]/5" : "border-slate-100 dark:border-slate-800"
    } ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} disabled={disabled} className="sr-only" />
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${checked ? "bg-[var(--admin-accent)] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{label}</div>
        <div className="text-xs text-slate-400 leading-snug mt-0.5">{description}</div>
      </div>
    </label>
  )
}

function RandomWizard({
  subjects, bank, attachedIds,
  wizardMode, setWizardMode,
  wizardSelectedSubjects, toggleWizardSubject,
  wizardCounts, updateWizardCount,
  wizardStatus, wizardRunning, onRun, onDone,
}: {
  subjects: any[]
  bank: any[]
  attachedIds: Set<string>
  wizardMode: "subjects" | "all"
  setWizardMode: (m: "subjects" | "all") => void
  wizardSelectedSubjects: string[]
  toggleWizardSubject: (key: string) => void
  wizardCounts: Record<string, { count1: number; count2: number }>
  updateWizardCount: (key: string, field: "count1" | "count2", value: number) => void
  wizardStatus: { label: string; status: "pending" | "loading" | "done" | "error"; count?: number; message?: string }[]
  wizardRunning: boolean
  onRun: () => void
  onDone: () => void
}) {
  const getAvailable = (key: string, tier: number) => bank.filter(q => {
    if (attachedIds.has(q.id)) return false
    if (q.marks !== tier) return false
    if (key === "__all__") return true
    if (key === "__uncategorized__") return !q.subjectId
    return q.subjectId === key
  }).length

  const keys = wizardMode === "all" ? ["__all__"] : wizardSelectedSubjects
  const totalRequested = keys.reduce((sum, key) => {
    const c = wizardCounts[key] || { count1: 0, count2: 0 }
    return sum + c.count1 + c.count2
  }, 0)

  if (wizardStatus.length > 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
          {wizardRunning ? "Building your set — loading each subject in turn..." : "Done!"}
        </p>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {wizardStatus.map((s, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="shrink-0">
                {s.status === "pending" && <div className="w-5 h-5 rounded-full border-2 border-slate-200 dark:border-slate-700" />}
                {s.status === "loading" && <Loader2 size={20} className="animate-spin text-[var(--admin-accent)]" />}
                {s.status === "done" && <CheckCircle2 size={20} className="text-emerald-500" />}
                {s.status === "error" && <X size={20} className="text-red-500" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{s.label}</div>
                {s.status === "done" && <div className="text-xs text-emerald-600">Added {s.count} question(s)</div>}
                {s.status === "error" && <div className="text-xs text-red-500">{s.message}</div>}
              </div>
            </div>
          ))}
        </div>
        {!wizardRunning && (
          <button onClick={onDone} className="btn-admin-primary w-full">Done</button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">Pick subjects and how many 1-mark / 2-mark questions to randomly grab from each — processed one subject at a time so you can watch it build.</p>

      <div className="flex gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-fit">
        <button onClick={() => setWizardMode("subjects")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${wizardMode === "subjects" ? "bg-white dark:bg-slate-700 shadow-sm text-[var(--admin-accent)]" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
          Specific Subjects
        </button>
        <button onClick={() => setWizardMode("all")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${wizardMode === "all" ? "bg-white dark:bg-slate-700 shadow-sm text-[var(--admin-accent)]" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
          All Subjects Combined
        </button>
      </div>

      {wizardMode === "subjects" && (
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Tick which subjects to include</label>
          <div className="flex flex-wrap gap-2">
            {[{ id: "__uncategorized__", name: "Uncategorized" }, ...subjects].map((s: any) => (
              <label
                key={s.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all text-sm font-bold ${
                  wizardSelectedSubjects.includes(s.id)
                    ? "border-[var(--admin-accent)] bg-[var(--admin-accent)]/10 text-[var(--admin-accent)]"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <input
                  type="checkbox"
                  checked={wizardSelectedSubjects.includes(s.id)}
                  onChange={() => toggleWizardSubject(s.id)}
                  className="sr-only"
                />
                {wizardSelectedSubjects.includes(s.id) ? <CheckSquare size={14} /> : <Square size={14} />}
                {s.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {keys.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">Tick at least one subject above to continue.</p>
        ) : (
          keys.map(key => {
            const label = key === "__all__" ? "All Subjects" : key === "__uncategorized__" ? "Uncategorized" : (subjects.find((s: any) => s.id === key)?.name || "Subject")
            const counts = wizardCounts[key] || { count1: 0, count2: 0 }
            const avail1 = getAvailable(key, 1)
            const avail2 = getAvailable(key, 2)
            return (
              <div key={key} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <h4 className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-3">{label}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">1-Mark Qty ({avail1} available)</label>
                    <input
                      type="number"
                      min={0}
                      max={avail1}
                      value={counts.count1}
                      onChange={e => updateWizardCount(key, "count1", parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-[var(--admin-accent)] text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">2-Mark Qty ({avail2} available)</label>
                    <input
                      type="number"
                      min={0}
                      max={avail2}
                      value={counts.count2}
                      onChange={e => updateWizardCount(key, "count2", parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-[var(--admin-accent)] text-sm"
                    />
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <button onClick={onRun} disabled={totalRequested < 1} className="btn-admin-primary w-full disabled:opacity-40 flex items-center justify-center gap-2">
        <Shuffle size={16} /> Build Set — {totalRequested} Question{totalRequested !== 1 ? "s" : ""}
      </button>
    </div>
  )
}

function QuestionCard({ question, index, marks, onRemove }: { question: any, index: number, marks: number, onRemove: () => void }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="card p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
      <div
        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4 min-w-0">
          <span className="text-slate-400 font-bold w-6 shrink-0">#{index + 1}</span>
          <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full shrink-0 ${question.subject ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400" : "text-slate-400 bg-slate-100 dark:bg-slate-800"}`}>
            {question.subject?.name || "Uncategorized"}
          </span>
          <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full shrink-0 text-[var(--admin-accent)] bg-[var(--admin-accent)]/10">
            {marks} mark{marks !== 1 ? "s" : ""}
          </span>
          <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1"><LatexRenderer content={question.question} /></p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {question.explanationVideoUrl && <Video size={16} className="text-[var(--admin-accent)]" />}
          <button
            onClick={e => { e.stopPropagation(); onRemove() }}
            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
            title="Remove from set"
          >
            <Trash2 size={16} />
          </button>
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {expanded && (
        <div className="px-10 pb-6 pt-2 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-3 mb-6">
            {question.options.map((opt: string, idx: number) => (
              <div key={idx} className={`p-3 rounded-xl border text-sm font-medium ${
                question.correctOption === idx
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
                  : "border-slate-100 dark:border-slate-800 text-slate-500"
              }`}>
                <span className="opacity-40 mr-2">{String.fromCharCode(65 + idx)})</span> <LatexRenderer content={opt} />
              </div>
            ))}
          </div>

          {question.explanation && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 mb-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Explanation</p>
              <p className="text-sm text-slate-600 dark:text-slate-400"><LatexRenderer content={question.explanation} /></p>
            </div>
          )}

          {question.explanationVideoUrl && (
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--admin-accent)] bg-[var(--admin-accent)]/10 w-fit px-3 py-1.5 rounded-lg">
              <Video size={14} /> Video Explanation Attached
            </div>
          )}
        </div>
      )}
    </div>
  )
}
