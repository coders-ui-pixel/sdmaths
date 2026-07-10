"use client"

import { useState, useEffect } from "react"
import { GraduationCap, Plus, Trash2, Loader2, Pencil, X } from "lucide-react"
import { toast } from "react-hot-toast"
import LatexEditor from "@/components/LatexEditor"
import LatexRenderer from "@/components/LatexRenderer"

export default function SyllabusAdminPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ title: "", content: "", order: 0 })

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const res = await fetch("/api/admin/syllabus")
      const data = await res.json()
      setEntries(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Failed to load syllabus entries")
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditingId(null)
    setFormData({ title: "", content: "", order: entries.length })
    setIsModalOpen(true)
  }

  const openEdit = (entry: any) => {
    setEditingId(entry.id)
    setFormData({ title: entry.title, content: entry.content, order: entry.order })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = editingId
        ? await fetch(`/api/admin/syllabus/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
          })
        : await fetch("/api/admin/syllabus", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
          })
      if (res.ok) {
        toast.success(editingId ? "Syllabus entry updated" : "Syllabus entry added")
        setIsModalOpen(false)
        fetchEntries()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to save")
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this syllabus entry?")) return
    const res = await fetch(`/api/admin/syllabus?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Deleted")
      fetchEntries()
    } else {
      toast.error("Failed to delete")
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold outfit flex items-center gap-2">
            <GraduationCap size={22} className="text-[var(--admin-accent)]" /> Syllabus
          </h2>
          <p className="text-slate-500 mt-1 text-sm">Content shown on the public Syllabus page, linked from the navbar. Supports LaTeX ($x^2$).</p>
        </div>
        <button onClick={openCreate} className="btn-admin-primary flex items-center gap-2">
          <Plus size={18} /> Add Section
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-[var(--admin-accent)]" /></div>
      ) : entries.length === 0 ? (
        <div className="card py-20 text-center text-slate-500 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
          <GraduationCap size={40} className="mx-auto mb-4 opacity-20" />
          <p>No syllabus sections yet. Add one to publish the public Syllabus page.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry: any) => (
            <div key={entry.id} className="card p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">#{entry.order}</span>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">{entry.title}</h3>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(entry)} className="p-2 text-slate-400 hover:text-[var(--admin-accent)] transition-colors"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(entry.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3">
                <LatexRenderer content={entry.content} />
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold outfit">{editingId ? "Edit Syllabus Section" : "Add Syllabus Section"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Section Title</label>
                <input
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-[var(--admin-accent)] transition-all"
                  placeholder="e.g. Grade 10 — Algebra"
                />
              </div>
              <LatexEditor
                label="Content"
                value={formData.content}
                onChange={v => setFormData({ ...formData, content: v })}
                placeholder="Write the syllabus content here. LaTeX like $x^2 + 1$ is supported."
                rows={8}
                large
                accentClass="focus:border-[var(--admin-accent)]"
              />
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Display Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-[var(--admin-accent)] transition-all"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="btn-admin-primary flex-1 disabled:opacity-50">
                  {saving ? <Loader2 className="animate-spin mx-auto" size={18} /> : editingId ? "Save Changes" : "Add Section"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
