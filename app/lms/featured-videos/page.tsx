"use client"

import { useState, useEffect } from "react"
import { Play, Plus, Trash2, Loader2, Upload, Video, X } from "lucide-react"
import { toast } from "react-hot-toast"

export default function FeaturedVideosAdmin() {
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: "",
    videoUrl: "",
    thumbnailUrl: ""
  })

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const res = await fetch("/api/admin/featured-videos")
      const data = await res.json()
      if (Array.isArray(data)) {
        setVideos(data)
      } else {
        setVideos([])
        if (data.error) toast.error(data.error)
      }
    } catch (e) {
      toast.error("Failed to fetch videos")
      setVideos([])
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd
      })
      const data = await res.json()
      if (res.ok) {
        setFormData(p => ({ ...p, thumbnailUrl: data.url }))
        toast.success("Thumbnail uploaded")
      }
    } catch (e) {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch("/api/admin/featured-videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    })
    if (res.ok) {
      toast.success("Video added")
      setIsModalOpen(false)
      fetchVideos()
      setFormData({ title: "", videoUrl: "", thumbnailUrl: "" })
    } else {
      const data = await res.json()
      toast.error(data.error || "Failed to add video")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return
    const res = await fetch(`/api/admin/featured-videos?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Deleted")
      fetchVideos()
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold outfit">Featured Sample Videos</h2>
          <p className="text-slate-500 mt-1">Manage videos that appear on the public homepage gallery.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-admin-primary flex items-center gap-2">
          <Plus size={18} /> Add Video
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-[var(--admin-accent)]" /></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(videos) && videos.map((video: any) => (
            <div key={video.id} className="card p-0 overflow-hidden group">
              <div className="h-40 bg-slate-900 relative">
                {video.thumbnailUrl ? (
                  <img src={video.thumbnailUrl} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <Video size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="text-white fill-white" size={40} />
                </div>
                <button 
                  onClick={() => handleDelete(video.id)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="p-5">
                <h3 className="font-bold mb-1">{video.title}</h3>
                <p className="text-xs text-[var(--admin-accent)] font-medium truncate">{video.videoUrl}</p>
              </div>
            </div>
          ))}
          {(!Array.isArray(videos) || videos.length === 0) && (
            <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
              No featured videos added yet.
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold outfit">Add Featured Video</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Video Title</label>
                <input 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-[var(--admin-accent)] transition-all"
                  placeholder="e.g. Introduction to Calculus"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Video URL (YouTube Link)</label>
                <input 
                  required
                  value={formData.videoUrl}
                  onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-[var(--admin-accent)] transition-all"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Thumbnail Image</label>
                <div className="relative h-[52px]">
                  <div className="absolute inset-0 flex items-center justify-between px-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 text-sm truncate pr-10">{formData.thumbnailUrl || "Upload thumbnail..."}</span>
                    <label className="cursor-pointer text-[var(--admin-accent)] font-bold text-xs flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded-lg">
                      {uploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                      {formData.thumbnailUrl ? "Change" : "Upload"}
                      <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="btn-admin-primary flex-1">Add Video</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
