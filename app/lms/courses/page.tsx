"use client"

import { useState, useEffect } from "react"
import { Plus, BookOpen, Trash2, Edit, Loader2, X, Upload, Image as ImageIcon } from "lucide-react"
import { toast } from "react-hot-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AdminCoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    price: "",
    discountAmount: "",
    discountLimit: "",
    hasMcqs: true,
    hasVideos: true,
    hasLiveClasses: false,
    hasNotes: true,
    thumbnail: "",
    paymentQrUrl: ""
  })

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    const res = await fetch("/api/admin/courses")
    const data = await res.json()
    setCourses(data)
    setLoading(false)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "thumbnail" | "paymentQrUrl") => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(field)
    const fd = new FormData()
    fd.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd
      })
      const data = await res.json()
      if (res.ok) {
        setFormData(p => ({ ...p, [field]: data.url }))
        toast.success(field === "thumbnail" ? "Thumbnail uploaded" : "QR code uploaded")
      } else {
        toast.error("Upload failed")
      }
    } catch (e) {
      toast.error("Upload failed")
    } finally {
      setUploading(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        toast.success("Course created!")
        setIsModalOpen(false)
        fetchCourses()
        setFormData({
          title: "", slug: "", description: "", price: "",
          discountAmount: "", discountLimit: "",
          hasMcqs: true, hasVideos: true, hasLiveClasses: false, hasNotes: true,
          thumbnail: "", paymentQrUrl: ""
        })
      } else {
        const errorText = await res.text()
        toast.error(errorText || "Failed to create course")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone and will delete all associated payments and assets.")) return
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "DELETE"
      })
      if (res.ok) {
        toast.success("Course deleted successfully")
        fetchCourses()
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to delete course")
      }
    } catch (e) {
      toast.error("Failed to delete course")
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold outfit">Course Management</h2>
          <p className="text-slate-500 mt-1">Create and manage your educational content.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-admin-primary flex items-center gap-2">
          <Plus size={18} /> New Course
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-[var(--admin-accent)]" /></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <div key={course.id} className="card hover:border-[var(--admin-accent)] transition-all group overflow-hidden">
              <div className="h-40 -mx-6 -mt-6 mb-4 bg-slate-100 dark:bg-slate-800 relative">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <BookOpen size={48} />
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/lms/courses/${course.id}`} className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-lg text-slate-600 hover:text-[var(--admin-accent)] transition-all">
                    <Edit size={16}/>
                  </Link>
                  <button 
                    onClick={() => handleDeleteCourse(course.id)}
                    className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-lg text-slate-600 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-1">{course.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4">{course.description}</p>
              <div className="flex flex-col gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-black text-[var(--admin-accent)] text-lg">Rs. {course.price}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{course._count.playlists} Playlists</span>
                </div>
                <div className="flex gap-3 justify-end text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>{course._count.mcqExams} Exams</span>
                  <span>•</span>
                  <span>{course._count.notes || 0} Notes</span>
                  <span>•</span>
                  <span>{course._count.importantQuestions || 0} Q&As</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold outfit">Create New Course</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Course Title</label>
                  <input 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-[var(--admin-accent)] outline-none transition-all"
                    placeholder="e.g. Advanced Calculus"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">URL Slug</label>
                  <input 
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-[var(--admin-accent)] outline-none transition-all"
                    placeholder="e.g. advanced-calculus"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Price (NPR)</label>
                  <input 
                    required
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-[var(--admin-accent)] outline-none transition-all"
                    placeholder="e.g. 5000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Thumbnail</label>
                  <div className="relative h-[52px]">
                    <div className="absolute inset-0 flex items-center justify-between px-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 text-sm truncate pr-10">{formData.thumbnail || "Upload course image..."}</span>
                      <label className="cursor-pointer text-[var(--admin-accent)] font-bold text-xs flex items-center gap-1 hover:bg-[var(--admin-accent)]/10 px-2 py-1 rounded-lg">
                        {uploading === "thumbnail" ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                        {formData.thumbnail ? "Change" : "Upload"}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, "thumbnail")} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Payment QR Code - Optional</label>
                <p className="text-[11px] text-slate-400 ml-1 -mt-1 mb-1">Shown to students paying for this course. Falls back to the site-wide QR if not set.</p>
                <div className="relative h-[52px]">
                  <div className="absolute inset-0 flex items-center justify-between px-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 text-sm truncate pr-10">{formData.paymentQrUrl || "Upload course-specific QR..."}</span>
                    <label className="cursor-pointer text-[var(--admin-accent)] font-bold text-xs flex items-center gap-1 hover:bg-[var(--admin-accent)]/10 px-2 py-1 rounded-lg">
                      {uploading === "paymentQrUrl" ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                      {formData.paymentQrUrl ? "Change" : "Upload"}
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, "paymentQrUrl")} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Early Bird Discount (NPR) - Optional</label>
                  <input 
                    type="number"
                    value={formData.discountAmount}
                    onChange={(e) => setFormData({...formData, discountAmount: e.target.value})}
                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-[var(--admin-accent)] outline-none transition-all"
                    placeholder="e.g. 300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Usage Seat Limit (Students) - Optional</label>
                  <input 
                    type="number"
                    value={formData.discountLimit}
                    onChange={(e) => setFormData({...formData, discountLimit: e.target.value})}
                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-[var(--admin-accent)] outline-none transition-all"
                    placeholder="e.g. 20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-[var(--admin-accent)] outline-none transition-all resize-none"
                  placeholder="Tell students what they will learn..."
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl">
                {Object.keys(formData).filter(k => k.startsWith('has')).map((key) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={(formData as any)[key]}
                      onChange={(e) => setFormData({...formData, [key]: e.target.checked})}
                      className="w-4 h-4 rounded border-slate-300 text-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
                    />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{key.replace('has', '')}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="btn-admin-primary flex-1">Create Course</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
