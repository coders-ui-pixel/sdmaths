"use client"

import { useState, useEffect } from "react"
import { Plus, Play, Trash2, Edit, ListMusic, Loader2, X, BookOpen } from "lucide-react"
import { toast } from "react-hot-toast"
import Link from "next/link"

export default function AdminPlaylistsPage() {
  const [playlists, setPlaylists] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({ title: "", courseId: "" })

  useEffect(() => {
    fetchPlaylists()
    fetchCourses()
  }, [])

  const fetchPlaylists = async () => {
    const res = await fetch("/api/admin/playlists")
    const data = await res.json()
    setPlaylists(data)
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
    const res = await fetch("/api/admin/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    })
    if (res.ok) {
      toast.success("Playlist created")
      setIsModalOpen(false)
      fetchPlaylists()
      setFormData({ title: "", courseId: "" })
    } else {
      toast.error("Failed to create playlist")
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will not delete the videos themselves.")) return
    const res = await fetch(`/api/admin/playlists/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Playlist removed")
      fetchPlaylists()
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold outfit">Video Playlists</h2>
          <p className="text-slate-500 mt-1">Organize your lessons into reusable collections.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-admin-primary flex items-center gap-2">
          <Plus size={18} /> New Playlist
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-[var(--admin-accent)]" /></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist: any) => (
            <div key={playlist.id} className="card hover:border-indigo-500 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600">
                  <Play size={24} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDelete(playlist.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-1">{playlist.title}</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {playlist.courses && playlist.courses.length > 0 ? playlist.courses.map((c: any) => (
                  <span key={c.id} className="text-[10px] px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full font-black uppercase tracking-widest">
                    {c.title}
                  </span>
                )) : (
                  <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full font-black uppercase tracking-widest">
                    Unassigned
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-400">{playlist._count.lessons} Videos</span>
                <Link href={`/lms/playlists/${playlist.id}`} className="text-sm font-bold text-indigo-600 hover:underline">
                  Manage Videos →
                </Link>
              </div>
            </div>
          ))}
          {playlists.length === 0 && (
            <div className="col-span-full py-20 text-center card bg-slate-50 dark:bg-slate-900/50 border-dashed border-2">
              <p className="text-slate-400 font-bold">No playlists found. Create your first one!</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl">
            <h3 className="text-xl font-bold outfit mb-6">Create New Playlist</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Playlist Title</label>
                <input 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition-all"
                  placeholder="e.g. Algebra Fundamentals"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Assign to Course (Optional)</label>
                <select 
                  value={formData.courseId}
                  onChange={e => setFormData({...formData, courseId: e.target.value})}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition-all"
                >
                  <option value="">No course (Shared)</option>
                  {courses.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
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
