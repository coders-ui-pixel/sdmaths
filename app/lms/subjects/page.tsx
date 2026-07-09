"use client"

import { useState, useEffect } from "react"
import { BookMarked, Plus, Trash2, Loader2, Pencil, X, Check } from "lucide-react"
import { toast } from "react-hot-toast"

export default function SubjectsAdminPage() {
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      const res = await fetch("/api/admin/subjects")
      const data = await res.json()
      setSubjects(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Failed to load subjects")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await fetch("/api/admin/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Subject added")
        setNewName("")
        fetchSubjects()
      } else {
        toast.error(data.error || "Failed to add subject")
      }
    } finally {
      setCreating(false)
    }
  }

  const startEdit = (s: any) => {
    setEditingId(s.id)
    setEditingName(s.name)
  }

  const saveEdit = async (id: string) => {
    if (!editingName.trim()) return
    const res = await fetch(`/api/admin/subjects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingName })
    })
    const data = await res.json()
    if (res.ok) {
      toast.success("Subject renamed")
      setEditingId(null)
      fetchSubjects()
    } else {
      toast.error(data.error || "Failed to rename")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this subject? Questions tagged with it will become uncategorized.")) return
    const res = await fetch(`/api/admin/subjects?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Subject deleted")
      fetchSubjects()
    } else {
      toast.error("Failed to delete subject")
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold outfit flex items-center gap-2">
          <BookMarked size={22} className="text-[var(--admin-accent)]" /> Subject Management
        </h2>
        <p className="text-slate-500 mt-1">Organize the question bank by subject (e.g. Algebra, Calculus, Geometry) so admins can build subject-wise practice and live exam sets.</p>
      </div>

      <form onSubmit={handleCreate} className="card p-5 flex gap-3 mb-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="e.g. Algebra"
          className="flex-1 px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-[var(--admin-accent)] text-sm"
        />
        <button type="submit" disabled={creating || !newName.trim()} className="btn-admin-primary flex items-center gap-2 disabled:opacity-40">
          {creating ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />} Add Subject
        </button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-[var(--admin-accent)]" /></div>
      ) : subjects.length === 0 ? (
        <div className="card py-20 text-center text-slate-500 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
          <BookMarked size={40} className="mx-auto mb-4 opacity-20" />
          <p>No subjects yet. Add one above to start tagging bank questions.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {subjects.map((s: any) => (
            <div key={s.id} className="card p-4 flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
              {editingId === s.id ? (
                <input
                  autoFocus
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && saveEdit(s.id)}
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-[var(--admin-accent)] outline-none text-sm mr-3"
                />
              ) : (
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{s.name}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {s._count?.questions ?? 0} question{s._count?.questions !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1 shrink-0">
                {editingId === s.id ? (
                  <>
                    <button onClick={() => saveEdit(s.id)} className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg"><Check size={16} /></button>
                    <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><X size={16} /></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(s)} className="p-2 text-slate-400 hover:text-[var(--admin-accent)] transition-colors" title="Rename"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={16} /></button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
