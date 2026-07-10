"use client"

import { useState, useEffect } from "react"
import { FileText, Plus, Trash2, Loader2, X, Pencil, CheckSquare, Square, BookOpen, File, Type, UploadCloud } from "lucide-react"
import { toast } from "react-hot-toast"
import LatexEditor from "@/components/LatexEditor"
import LatexRenderer from "@/components/LatexRenderer"

type NoteType = "content" | "pdf"

export default function NotesAdminPage() {
  const [notes, setNotes] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [noteType, setNoteType] = useState<NoteType>("content")
  const [formData, setFormData] = useState({ title: "", content: "", fileUrl: "", courseIds: [] as string[] })

  useEffect(() => {
    fetchNotes()
    fetch("/api/admin/courses").then(r => r.json()).then(data => setCourses(Array.isArray(data) ? data : [])).catch(() => {})
  }, [])

  const fetchNotes = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/notes")
      const data = await res.json()
      setNotes(Array.isArray(data) ? data : [])
    } catch {
      toast.error("Failed to load notes")
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditingId(null)
    setNoteType("content")
    setFormData({ title: "", content: "", fileUrl: "", courseIds: [] })
    setIsModalOpen(true)
  }

  const openEdit = (note: any) => {
    setEditingId(note.id)
    setNoteType(note.fileUrl ? "pdf" : "content")
    setFormData({ title: note.title, content: note.content || "", fileUrl: note.fileUrl || "", courseIds: note.courses.map((c: any) => c.id) })
    setIsModalOpen(true)
  }

  const toggleCourse = (id: string) => {
    setFormData(prev => ({
      ...prev,
      courseIds: prev.courseIds.includes(id) ? prev.courseIds.filter(c => c !== id) : [...prev.courseIds, id]
    }))
  }

  const handlePdfUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file")
      return
    }
    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (res.ok) {
        setFormData(p => ({ ...p, fileUrl: data.url }))
        toast.success("PDF uploaded")
      } else {
        toast.error(data.error || "Upload failed")
      }
    } catch {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error("Title is required")
      return
    }
    if (noteType === "content" && !formData.content.trim()) {
      toast.error("Write the note content, or switch to PDF upload")
      return
    }
    if (noteType === "pdf" && !formData.fileUrl.trim()) {
      toast.error("Upload a PDF file, or switch to written content")
      return
    }
    setSaving(true)
    try {
      const payload = noteType === "content"
        ? { title: formData.title, content: formData.content, fileUrl: "", courseIds: formData.courseIds }
        : { title: formData.title, content: "", fileUrl: formData.fileUrl, courseIds: formData.courseIds }

      const res = editingId
        ? await fetch(`/api/admin/notes/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          })
        : await fetch("/api/admin/notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          })
      if (res.ok) {
        toast.success(editingId ? "Note updated" : "Note created")
        setIsModalOpen(false)
        fetchNotes()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to save note")
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this note? It will be removed from every course it's assigned to.")) return
    const res = await fetch(`/api/admin/notes/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Note deleted")
      fetchNotes()
    } else {
      toast.error("Failed to delete")
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold outfit flex items-center gap-2">
            <FileText size={22} className="text-[var(--admin-accent)]" /> Notes
          </h2>
          <p className="text-slate-500 mt-1 text-sm">Shown on-screen for students — not downloadable files. Write content directly or upload a PDF. Assign one note to as many courses as you like.</p>
        </div>
        <button onClick={openCreate} className="btn-admin-primary flex items-center gap-2">
          <Plus size={18} /> Create Note
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-[var(--admin-accent)]" /></div>
      ) : notes.length === 0 ? (
        <div className="card py-20 text-center text-slate-500 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
          <FileText size={40} className="mx-auto mb-4 opacity-20" />
          <p>No notes yet. Create one and assign it to a course to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note: any) => (
            <div key={note.id} className="card p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">{note.title}</h3>
                  {note.fileUrl ? (
                    <span className="text-[9px] font-black uppercase tracking-widest text-red-600 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full flex items-center gap-1"><File size={9} /> PDF</span>
                  ) : (
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-full flex items-center gap-1"><Type size={9} /> Written</span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(note)} className="p-2 text-slate-400 hover:text-[var(--admin-accent)] transition-colors"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(note.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {note.courses.map((c: any) => (
                  <span key={c.id} className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-accent)] bg-[var(--admin-accent)]/10 px-2 py-0.5 rounded-full">
                    {c.title} ({c.slug})
                  </span>
                ))}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                {note.fileUrl ? <span className="italic">PDF document — {note.fileUrl.split("/").pop()}</span> : <LatexRenderer content={note.content} />}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold outfit">{editingId ? "Edit Note" : "Create Note"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Note Title</label>
                <input
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none focus:border-[var(--admin-accent)] transition-all"
                  placeholder="e.g. Calculus Basics Cheat Sheet"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Note Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNoteType("content")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                      noteType === "content"
                        ? "border-[var(--admin-accent)] bg-[var(--admin-accent)]/10 text-[var(--admin-accent)]"
                        : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    <Type size={14} /> Written Content
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoteType("pdf")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                      noteType === "pdf"
                        ? "border-[var(--admin-accent)] bg-[var(--admin-accent)]/10 text-[var(--admin-accent)]"
                        : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    <File size={14} /> Upload PDF
                  </button>
                </div>
              </div>

              {noteType === "content" ? (
                <LatexEditor
                  label="Content (supports LaTeX)"
                  value={formData.content}
                  onChange={v => setFormData({ ...formData, content: v })}
                  placeholder={"Write the full note content here.\nExample: The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$"}
                  rows={10}
                  large
                  accentClass="focus:border-[var(--admin-accent)]"
                />
              ) : (
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">PDF File</label>
                  {formData.fileUrl ? (
                    <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 min-w-0">
                        <File size={18} className="text-red-500 shrink-0" />
                        <span className="text-sm font-semibold truncate">{formData.fileUrl.split("/").pop()}</span>
                      </div>
                      <button type="button" onClick={() => setFormData(p => ({ ...p, fileUrl: "" }))} className="text-xs font-bold text-red-500 hover:text-red-600 shrink-0">Remove</button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 cursor-pointer hover:border-[var(--admin-accent)] transition-all text-center">
                      {uploading ? (
                        <Loader2 size={22} className="animate-spin text-[var(--admin-accent)]" />
                      ) : (
                        <UploadCloud size={22} className="text-slate-400" />
                      )}
                      <span className="text-sm font-bold text-slate-500">{uploading ? "Uploading..." : "Click to upload a PDF"}</span>
                      <span className="text-[10px] text-slate-400">Displayed on-screen to students, not offered as a download</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        disabled={uploading}
                        onChange={e => e.target.files?.[0] && handlePdfUpload(e.target.files[0])}
                      />
                    </label>
                  )}
                </div>
              )}

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1 flex items-center gap-1.5">
                  <BookOpen size={12} /> Assign to Courses <span className="normal-case font-semibold text-slate-400">(optional)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {courses.map((c: any) => (
                    <label
                      key={c.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all text-sm font-bold ${
                        formData.courseIds.includes(c.id)
                          ? "border-[var(--admin-accent)] bg-[var(--admin-accent)]/10 text-[var(--admin-accent)]"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <input type="checkbox" checked={formData.courseIds.includes(c.id)} onChange={() => toggleCourse(c.id)} className="sr-only" />
                      {formData.courseIds.includes(c.id) ? <CheckSquare size={14} /> : <Square size={14} />}
                      {c.title} <span className="opacity-50 font-normal">({c.slug})</span>
                    </label>
                  ))}
                </div>
                {courses.length === 0 && <p className="text-xs text-slate-400 mt-2">No courses yet — create one first.</p>}
                {courses.length > 0 && formData.courseIds.length === 0 && (
                  <p className="text-xs text-slate-400 mt-2">Not assigned to any course yet — the note is saved but won't show to students until you assign one.</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" disabled={saving || uploading} className="btn-admin-primary flex-1 disabled:opacity-50">
                  {saving ? <Loader2 className="animate-spin mx-auto" size={18} /> : editingId ? "Save Changes" : "Create Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
