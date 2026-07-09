"use client"

import { useState, useEffect, use } from "react"
import { 
  ChevronLeft, Plus, Trash2, Edit, Save, 
  Loader2, Play, GripVertical, X, Upload, BookOpen
} from "lucide-react"
import { toast } from "react-hot-toast"
import Link from "next/link"

export default function PlaylistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [playlist, setPlaylist] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isUpdatingCourse, setIsUpdatingCourse] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const [lessonForm, setLessonForm] = useState({
    title: "",
    videoUrl: "",
    content: "",
    isFreeSample: false,
    order: 0
  })

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const toastId = toast.loading("Uploading video... This may take a moment for larger files.")
    const fd = new FormData()
    fd.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd
      })
      const data = await res.json()
      if (res.ok) {
        setLessonForm(p => ({ ...p, videoUrl: data.url }))
        toast.success("Video uploaded successfully!", { id: toastId })
      } else {
        toast.error(data.error || "Upload failed", { id: toastId })
      }
    } catch (err: any) {
      toast.error("Upload failed: Network or server error", { id: toastId })
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    fetchPlaylist()
    fetchCourses()
  }, [id])

  const fetchPlaylist = async () => {
    try {
      const res = await fetch(`/api/admin/playlists/${id}`)
      const data = await res.json()
      setPlaylist(data)
      setLoading(false)
    } catch (e) {
      toast.error("Failed to load playlist")
    }
  }

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/admin/courses")
      const data = await res.json()
      setCourses(data)
    } catch {}
  }

  const handleConnectCourse = async (courseId: string) => {
    if (!courseId) return
    setIsUpdatingCourse(true)
    try {
      const res = await fetch(`/api/admin/playlists/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectCourseId: courseId })
      })
      if (res.ok) {
        toast.success("Course assigned successfully!")
        fetchPlaylist()
      } else {
        toast.error("Failed to assign course")
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setIsUpdatingCourse(false)
    }
  }

  const handleDisconnectCourse = async (courseId: string) => {
    if (!confirm("Remove this playlist from this course?")) return
    setIsUpdatingCourse(true)
    try {
      const res = await fetch(`/api/admin/playlists/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disconnectCourseId: courseId })
      })
      if (res.ok) {
        toast.success("Course removed successfully!")
        fetchPlaylist()
      } else {
        toast.error("Failed to remove course")
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setIsUpdatingCourse(false)
    }
  }

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/playlists/${id}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lessonForm, order: playlist.lessons.length + 1 })
      })
      if (res.ok) {
        toast.success("Lesson added!")
        setIsModalOpen(false)
        fetchPlaylist()
        setLessonForm({ title: "", videoUrl: "", content: "", isFreeSample: false, order: 0 })
      }
    } catch (e) {
      toast.error("Failed to add lesson")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Delete this lesson?")) return
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Lesson deleted")
        fetchPlaylist()
      }
    } catch (e) {
      toast.error("Failed to delete")
    }
  }

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[var(--admin-accent)]" /></div>
  if (!playlist) return <div>Playlist not found</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/lms/playlists" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h2 className="text-2xl font-bold outfit">{playlist.title}</h2>
            <p className="text-slate-500 text-sm">Manage videos in this collection.</p>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-admin-primary flex items-center gap-2 px-6">
          <Plus size={18} /> Add Video
        </button>
      </div>

      {/* Course Assignment Section */}
      <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl mb-8">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <BookOpen size={16} className="text-indigo-500" />
          Assigned Courses
        </h3>
        
        <div className="flex flex-wrap items-center gap-3">
          {playlist.courses && playlist.courses.length > 0 ? (
            playlist.courses.map((c: any) => (
              <span 
                key={c.id} 
                className="inline-flex items-center gap-2 text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50"
              >
                {c.title}
                <button 
                  disabled={isUpdatingCourse}
                  onClick={() => handleDisconnectCourse(c.id)}
                  className="hover:bg-indigo-200/50 dark:hover:bg-indigo-900/50 p-0.5 rounded-full text-indigo-500 hover:text-indigo-700 transition-colors"
                  title="Remove Course"
                >
                  <X size={12} />
                </button>
              </span>
            ))
          ) : (
            <span className="text-sm text-slate-400 italic">This playlist is shared and currently unassigned.</span>
          )}
          
          {/* Add course dropdown */}
          {courses.filter(c => !playlist.courses?.some((pc: any) => pc.id === c.id)).length > 0 && (
            <div className="relative ml-auto">
              <select
                disabled={isUpdatingCourse}
                value=""
                onChange={(e) => handleConnectCourse(e.target.value)}
                className="text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 px-3 py-2 rounded-xl outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="" disabled>+ Assign to Course</option>
                {courses
                  .filter(c => !playlist.courses?.some((pc: any) => pc.id === c.id))
                  .map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))
                }
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {playlist.lessons.length === 0 ? (
          <div className="py-20 text-center card border-dashed border-2 bg-slate-50 dark:bg-slate-900/50">
            <Play className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-400 font-bold">This playlist is empty. Add your first video!</p>
          </div>
        ) : (
          playlist.lessons.map((lesson: any, i: number) => (
            <div key={lesson.id} className="card p-4 flex items-center gap-4 group hover:border-indigo-500 transition-all">
              <div className="text-slate-300 cursor-grab"><GripVertical size={20} /></div>
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="font-bold flex items-center gap-2">
                  {lesson.title}
                  {lesson.isFreeSample && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase font-black tracking-tighter">Free</span>}
                </div>
                <div className="text-xs text-slate-400 truncate max-w-md">{lesson.videoUrl || "No video URL"}</div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-slate-400 hover:text-indigo-500"><Edit size={16}/></button>
                <button onClick={() => handleDeleteLesson(lesson.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold outfit">Add Video to Playlist</h3>
              <button onClick={() => setIsModalOpen(false)}><X /></button>
            </div>
            
            <form onSubmit={handleAddLesson} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Video Title</label>
                <input 
                  required
                  value={lessonForm.title}
                  onChange={e => setLessonForm({...lessonForm, title: e.target.value})}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition-all"
                  placeholder="e.g. Introduction to Derivatives"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Video URL (YouTube/Vimeo/Direct)</label>
                  <label className="cursor-pointer text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                    {uploading ? (
                      <>
                        <Loader2 className="animate-spin" size={12} />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={12} />
                        <span>Upload Video (Max 2GB)</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="video/*" 
                      className="hidden" 
                      disabled={uploading}
                      onChange={handleVideoUpload}
                    />
                  </label>
                </div>
                <input 
                  required
                  value={lessonForm.videoUrl}
                  onChange={e => setLessonForm({...lessonForm, videoUrl: e.target.value})}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition-all"
                  placeholder="https://... or select a direct video file to upload"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Description (Optional)</label>
                <textarea 
                  value={lessonForm.content}
                  onChange={e => setLessonForm({...lessonForm, content: e.target.value})}
                  rows={3}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl">
                <input 
                  type="checkbox"
                  checked={lessonForm.isFreeSample}
                  onChange={e => setLessonForm({...lessonForm, isFreeSample: e.target.checked})}
                  className="w-5 h-5 rounded border-slate-300 text-indigo-600"
                />
                <span className="text-sm font-bold text-slate-600">Mark as Free Sample</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold">Cancel</button>
                <button type="submit" disabled={saving} className="btn-admin-primary flex-1">
                  {saving ? <Loader2 className="animate-spin" /> : "Save Video"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
