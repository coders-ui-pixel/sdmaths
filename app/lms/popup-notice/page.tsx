"use client"

import { useState, useEffect } from "react"
import { Megaphone, Plus, Trash2, Loader2, Pencil, X, Upload, CheckCircle2 } from "lucide-react"
import { toast } from "react-hot-toast"

export default function PopupNoticeAdminPage() {
  const [notices, setNotices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({ title: "", message: "", linkUrl: "", linkLabel: "", imageUrl: "", isActive: false })

  useEffect(() => {
    fetchNotices()
  }, [])

  const fetchNotices = async () => {
    try {
      const res = await fetch("/api/admin/popup-notice")
      const data = await res.json()
      setNotices(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Failed to load popup notices")
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditingId(null)
    setFormData({ title: "", message: "", linkUrl: "", linkLabel: "", imageUrl: "", isActive: notices.length === 0 })
    setIsModalOpen(true)
  }

  const openEdit = (n: any) => {
    setEditingId(n.id)
    setFormData({ title: n.title, message: n.message, linkUrl: n.linkUrl || "", linkLabel: n.linkLabel || "", imageUrl: n.imageUrl || "", isActive: n.isActive })
    setIsModalOpen(true)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (res.ok) {
        setFormData(p => ({ ...p, imageUrl: data.url }))
        toast.success("Image uploaded")
      }
    } catch {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = editingId
        ? await fetch(`/api/admin/popup-notice/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
          })
        : await fetch("/api/admin/popup-notice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
          })
      if (res.ok) {
        toast.success(editingId ? "Notice updated" : "Notice created")
        setIsModalOpen(false)
        fetchNotices()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to save")
      }
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (n: any) => {
    const res = await fetch(`/api/admin/popup-notice/${n.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !n.isActive })
    })
    if (res.ok) {
      toast.success(!n.isActive ? "Notice activated" : "Notice deactivated")
      fetchNotices()
    } else {
      toast.error("Failed to update")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this popup notice?")) return
    const res = await fetch(`/api/admin/popup-notice?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Deleted")
      fetchNotices()
    } else {
      toast.error("Failed to delete")
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold outfit flex items-center gap-2">
            <Megaphone size={22} className="text-[var(--admin-accent)]" /> Popup Notice
          </h2>
          <p className="text-slate-500 mt-1 text-sm">Shown as a dismissible popup to every site visitor. Only one notice can be active at a time.</p>
        </div>
        <button onClick={openCreate} className="btn-admin-primary flex items-center gap-2">
          <Plus size={18} /> New Notice
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-[var(--admin-accent)]" /></div>
      ) : notices.length === 0 ? (
        <div className="card py-20 text-center text-slate-500 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
          <Megaphone size={40} className="mx-auto mb-4 opacity-20" />
          <p>No popup notices yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map((n: any) => (
            <div key={n.id} className={`card p-5 bg-white dark:bg-slate-900 border rounded-2xl ${n.isActive ? "border-emerald-300 dark:border-emerald-800" : "border-slate-100 dark:border-slate-800"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate">{n.title}</h3>
                    {n.isActive && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <CheckCircle2 size={10} /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{n.message}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleActive(n)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${n.isActive ? "bg-slate-100 dark:bg-slate-800 text-slate-500" : "bg-emerald-500 text-white hover:bg-emerald-600"}`}
                  >
                    {n.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => openEdit(n)} className="p-2 text-slate-400 hover:text-[var(--admin-accent)] transition-colors"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(n.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold outfit">{editingId ? "Edit Notice" : "New Notice"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Title</label>
                <input
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-[var(--admin-accent)] transition-all"
                  placeholder="e.g. New Batch Starting Soon!"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Message</label>
                <textarea
                  required
                  rows={3}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-[var(--admin-accent)] transition-all resize-none"
                  placeholder="Enrollment for the new batch closes on..."
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Image (optional)</label>
                <div className="relative h-[52px]">
                  <div className="absolute inset-0 flex items-center justify-between px-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 text-sm truncate pr-10">{formData.imageUrl || "Upload an image..."}</span>
                    <label className="cursor-pointer text-[var(--admin-accent)] font-bold text-xs flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded-lg">
                      {uploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                      {formData.imageUrl ? "Change" : "Upload"}
                      <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                    </label>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Link URL (optional)</label>
                  <input
                    value={formData.linkUrl}
                    onChange={e => setFormData({ ...formData, linkUrl: e.target.value })}
                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-[var(--admin-accent)] transition-all"
                    placeholder="/courses/some-course"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Button Label</label>
                  <input
                    value={formData.linkLabel}
                    onChange={e => setFormData({ ...formData, linkLabel: e.target.value })}
                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-[var(--admin-accent)] transition-all"
                    placeholder="Learn More"
                  />
                </div>
              </div>
              <label className="flex items-center gap-3 py-2 cursor-pointer">
                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
                <span className="text-sm font-bold">Make this the active popup (deactivates any other active notice)</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="btn-admin-primary flex-1 disabled:opacity-50">
                  {saving ? <Loader2 className="animate-spin mx-auto" size={18} /> : editingId ? "Save Changes" : "Create Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
