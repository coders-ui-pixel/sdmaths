"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Radio, Loader2, Percent, Clock, Calendar, FileDown } from "lucide-react"
import { toast } from "react-hot-toast"
import Link from "next/link"

function getLiveStatus(exam: any): { label: string; className: string } {
  if (!exam.startTime || !exam.endTime) {
    return { label: "Unscheduled", className: "bg-slate-100 dark:bg-slate-800 text-slate-500" }
  }
  const now = Date.now()
  const start = new Date(exam.startTime).getTime()
  const end = new Date(exam.endTime).getTime()
  if (now < start) return { label: "Upcoming", className: "bg-amber-50 dark:bg-amber-900/20 text-amber-600" }
  if (now > end) return { label: "Ended", className: "bg-slate-100 dark:bg-slate-800 text-slate-500" }
  return { label: "Live Now", className: "bg-red-50 dark:bg-red-900/20 text-red-600 animate-pulse" }
}

function formatDateTime(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
}

export default function AdminLiveExamsPage() {
  const [exams, setExams] = useState<any[]>([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({ title: "", courseId: "", startTime: "", endTime: "", negativeMarking: false })

  useEffect(() => {
    fetchExams()
    fetchCourses()
  }, [])

  const fetchExams = async () => {
    const res = await fetch("/api/admin/exams?type=LIVE")
    const data = await res.json()
    setExams(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const fetchCourses = async () => {
    const res = await fetch("/api/admin/courses")
    const data = await res.json()
    setCourses(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.startTime && formData.endTime && new Date(formData.endTime) <= new Date(formData.startTime)) {
      toast.error("End time must be after start time")
      return
    }
    setIsSubmitting(true)
    const res = await fetch("/api/admin/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, examType: "LIVE" })
    })
    if (res.ok) {
      toast.success("Live exam created")
      setIsModalOpen(false)
      setFormData({ title: "", courseId: "", startTime: "", endTime: "", negativeMarking: false })
      fetchExams()
    } else {
      const data = await res.json()
      toast.error(data.error || "Failed to create live exam")
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will permanently delete the live exam and all its questions.")) return
    const res = await fetch(`/api/admin/exams/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Live exam deleted")
      fetchExams()
    } else {
      toast.error("Failed to delete")
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold outfit flex items-center gap-2">
            <Radio size={22} className="text-red-500" /> Live Exams
          </h2>
          <p className="text-slate-500 mt-1">Scheduled exams with a fixed start and end time — attempts are only allowed within the window.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-admin-primary flex items-center gap-2">
          <Plus size={18} /> New Live Exam
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-[var(--admin-accent)]" /></div>
      ) : exams.length === 0 ? (
        <div className="card py-20 text-center text-slate-500">
          <Radio size={48} className="mx-auto mb-4 opacity-20" />
          <p>No live exams scheduled yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam: any) => {
            const status = getLiveStatus(exam)
            return (
              <div key={exam.id} className="card hover:border-[var(--admin-accent)] transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-red-50 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-500">
                    <Radio size={24} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${status.className}`}>{status.label}</span>
                    <button onClick={() => handleDelete(exam.id)} className="p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">{exam.title}</h3>

                <div className="space-y-1 mb-3 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5"><Calendar size={12} /> Starts: {formatDateTime(exam.startTime)}</div>
                  <div className="flex items-center gap-1.5"><Clock size={12} /> Ends: {formatDateTime(exam.endTime)}</div>
                </div>

                {exam.negativeMarking && (
                  <span className="inline-block text-[10px] px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full font-black uppercase tracking-widest mb-3">-5% Marking</span>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  {exam.courses && exam.courses.length > 0 ? exam.courses.map((c: any) => (
                    <span key={c.id} className="text-[10px] px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-[var(--admin-accent)] rounded-full font-black uppercase tracking-widest">
                      {c.title} ({c.slug})
                    </span>
                  )) : (
                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full font-black uppercase tracking-widest">
                      Standalone Set
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-400">{exam._count.questions} Questions</span>
                  <div className="flex items-center gap-3">
                    {exam._count.questions > 0 && (
                      <Link href={`/lms/exams/${exam.id}/print`} target="_blank" className="text-slate-400 hover:text-[var(--admin-accent)]" title="Download PDF">
                        <FileDown size={16} />
                      </Link>
                    )}
                    <Link href={`/lms/exams/${exam.id}`} className="text-sm font-bold text-[var(--admin-accent)] hover:underline">
                      Manage Questions →
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold outfit mb-6">Create New Live Exam</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Exam Title</label>
                <input
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-[var(--admin-accent)] transition-all"
                  placeholder="e.g. Weekly Live Test #1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Assign to Course</label>
                <select
                  value={formData.courseId}
                  onChange={e => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-[var(--admin-accent)] transition-all"
                >
                  <option value="">No course (Standalone)</option>
                  {courses.map((c: any) => <option key={c.id} value={c.id}>{c.title} ({c.slug})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Start Time</label>
                  <input
                    required
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-[var(--admin-accent)] transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">End Time</label>
                  <input
                    required
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-[var(--admin-accent)] transition-all text-sm"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 py-2 cursor-pointer pt-2 border-t border-slate-100 dark:border-slate-800">
                <input type="checkbox" checked={formData.negativeMarking} onChange={e => setFormData({ ...formData, negativeMarking: e.target.checked })} />
                <Percent size={15} className="text-red-500" />
                <span className="text-sm font-bold">Negative Marking (-5% per wrong answer)</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-admin-primary flex-1">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
