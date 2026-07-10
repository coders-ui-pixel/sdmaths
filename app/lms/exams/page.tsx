"use client"

import { useState, useEffect } from "react"
import { Plus, BookOpen, Trash2, Edit, ListChecks, FileText, Loader2, Sparkles, Home, Percent, FileDown } from "lucide-react"
import { toast } from "react-hot-toast"
import Link from "next/link"

export default function AdminExamsPage() {
  const [exams, setExams] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({ title: "", courseId: "", isFree: false, isFeaturedOnHome: false, negativeMarking: false })

  useEffect(() => {
    fetchExams()
    fetchCourses()
  }, [])

  const fetchExams = async () => {
    const res = await fetch("/api/admin/exams?type=PRACTICE")
    const data = await res.json()
    setExams(data)
    setLoading(false)
  }

  const fetchCourses = async () => {
    const res = await fetch("/api/admin/courses")
    const data = await res.json()
    setCourses(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const res = await fetch("/api/admin/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    })
    if (res.ok) {
      toast.success("Exam created")
      setIsModalOpen(false)
      setFormData({ title: "", courseId: "", isFree: false, isFeaturedOnHome: false, negativeMarking: false })
      fetchExams()
    } else {
      toast.error("Failed to create exam")
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will permanently delete the exam set and all its questions.")) return
    const res = await fetch(`/api/admin/exams/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Exam deleted")
      fetchExams()
    } else {
      toast.error("Failed to delete exam")
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold outfit">MCQ Practice Sets</h2>
          <p className="text-slate-500 mt-1">Manage untimed practice sets. For scheduled exams, see Live Exams.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-admin-primary flex items-center gap-2">
          <Plus size={18} /> New Exam
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-[var(--admin-accent)]" /></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam: any) => (
            <div key={exam.id} className="card hover:border-[var(--admin-accent)] transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-[var(--admin-accent)]">
                  <ListChecks size={24} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDelete(exam.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-1">{exam.title}</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {exam.isFree && (
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full font-black uppercase tracking-widest">Free</span>
                )}
                {exam.isFeaturedOnHome && (
                  <span className="text-[10px] px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-full font-black uppercase tracking-widest">On Homepage</span>
                )}
                {exam.negativeMarking && (
                  <span className="text-[10px] px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full font-black uppercase tracking-widest">-5% Marking</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {exam.courses && exam.courses.length > 0 ? exam.courses.map((c: any) => (
                  <span key={c.id} className="text-[10px] px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-[var(--admin-accent)] rounded-full font-black uppercase tracking-widest">
                    {c.title}
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
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl">
            <h3 className="text-xl font-bold outfit mb-6">Create New MCQ Set</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Exam Title</label>
                <input 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-[var(--admin-accent)] transition-all"
                  placeholder="e.g. Midterm Test 1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Assign to Course (Optional)</label>
                <select 
                  value={formData.courseId}
                  onChange={e => setFormData({...formData, courseId: e.target.value})}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-[var(--admin-accent)] transition-all"
                >
                  <option value="">No course (Standalone)</option>
                  {courses.map((c: any) => <option key={c.id} value={c.id}>{c.title} ({c.slug})</option>)}
                </select>
                <p className="text-[10px] text-slate-400 mt-2 px-1">You can assign this set to multiple courses later.</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-3 py-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isFree} onChange={e => setFormData({ ...formData, isFree: e.target.checked, isFeaturedOnHome: e.target.checked ? formData.isFeaturedOnHome : false })} />
                  <Sparkles size={15} className="text-emerald-500" />
                  <span className="text-sm font-bold">Free Practice Set</span>
                </label>
                <label className={`flex items-center gap-3 py-2 ${formData.isFree ? "cursor-pointer" : "opacity-40 pointer-events-none"}`}>
                  <input type="checkbox" checked={formData.isFeaturedOnHome} onChange={e => setFormData({ ...formData, isFeaturedOnHome: e.target.checked })} />
                  <Home size={15} className="text-amber-500" />
                  <span className="text-sm font-bold">Feature on Homepage</span>
                </label>
                <label className="flex items-center gap-3 py-2 cursor-pointer">
                  <input type="checkbox" checked={formData.negativeMarking} onChange={e => setFormData({ ...formData, negativeMarking: e.target.checked })} />
                  <Percent size={15} className="text-red-500" />
                  <span className="text-sm font-bold">Negative Marking (-5% per wrong answer)</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
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
