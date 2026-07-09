"use client"

import { useState, useEffect } from "react"
import { Send, Bell, Plus, Trash2, Sparkles, Loader2, Save } from "lucide-react"
import { toast } from "react-hot-toast"

export default function AdminNotificationsPage() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    saveAsTemplate: true
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    const res = await fetch("/api/admin/notifications")
    const data = await res.json()
    setTemplates(data.templates)
    setLoading(false)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        toast.success("Broadcast sent successfully!")
        setFormData({ title: "", message: "", saveAsTemplate: true })
        fetchTemplates()
      } else {
        toast.error("Failed to send broadcast")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setSending(false)
    }
  }

  const handleDeleteTemplate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      const res = await fetch(`/api/admin/notifications?id=${id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        toast.success("Template deleted!")
        fetchTemplates()
      } else {
        toast.error("Failed to delete template")
      }
    } catch (error) {
      toast.error("An error occurred while deleting template")
    }
  }

  const useTemplate = (t: any) => {
    setFormData({ ...formData, title: t.title, message: t.message })
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h2 className="text-3xl font-black outfit flex items-center gap-2.5 tracking-tight text-slate-800 dark:text-slate-100">
          <Bell className="text-[var(--admin-accent)] animate-pulse" size={28} /> Broadcast Notifications
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm font-medium">Send customized messages and daily announcements to all enrolled students.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Send Form */}
        <div className="p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/40 dark:border-slate-800/80 shadow-xl shadow-slate-100/40 dark:shadow-none rounded-[2.5rem]">
          <h3 className="text-lg font-black outfit mb-6 flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <Sparkles size={18} className="text-orange-500 animate-bounce" /> Compose Message
          </h3>
          <form onSubmit={handleSend} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Title</label>
              <input 
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Daily Math Challenge!"
                className="w-full px-5 py-4 admin-input border rounded-2xl outline-none focus:border-[var(--admin-accent)] transition-colors font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Message</label>
              <textarea 
                required
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                placeholder="Time to practice your calculus skills..."
                className="w-full px-5 py-4 admin-textarea border rounded-2xl outline-none focus:border-[var(--admin-accent)] transition-colors font-medium resize-none"
                rows={4}
              />
            </div>
            <div className="flex items-center gap-2 px-1">
              <input 
                type="checkbox" 
                id="saveTemplate"
                checked={formData.saveAsTemplate}
                onChange={e => setFormData({...formData, saveAsTemplate: e.target.checked})}
                className="w-4 h-4 rounded border-slate-300 text-[var(--admin-accent)] focus:ring-[var(--admin-accent)] accent-[var(--admin-accent)] cursor-pointer"
              />
              <label htmlFor="saveTemplate" className="text-xs font-bold text-slate-500 dark:text-slate-400 cursor-pointer select-none">Save as reusable template</label>
            </div>
            <button 
              type="submit" 
              disabled={sending}
              className="w-full btn-admin-primary py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-[var(--admin-accent)]/20 hover:scale-[1.01] transition-transform duration-200"
            >
              {sending ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Broadcast to All</>}
            </button>
          </form>
        </div>

        {/* Templates */}
        <div className="space-y-6">
          <h3 className="text-lg font-black outfit flex items-center gap-2 px-2 text-slate-800 dark:text-slate-100">
            <Save size={18} className="text-[var(--admin-accent)]" /> Saved Templates
          </h3>
          {loading ? (
            <div className="h-40 flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/30 rounded-3xl animate-pulse" />
          ) : templates.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] text-slate-400 dark:text-slate-500 bg-white/30 dark:bg-slate-900/10 backdrop-blur-sm">
              <Bell size={32} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No templates saved yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {templates.map((t: any) => (
                <div 
                  key={t.id} 
                  className="p-5 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-md hover:border-[var(--admin-accent)]/80 hover:translate-x-1 transition-all duration-200 cursor-pointer group flex flex-col gap-2 relative overflow-hidden" 
                  onClick={() => useTemplate(t)}
                >
                  <div className="flex justify-between items-center gap-2">
                    <h4 className="font-bold text-[0.875rem] text-slate-800 dark:text-slate-100 leading-snug truncate pr-6">{t.title}</h4>
                    <button 
                      onClick={(e) => handleDeleteTemplate(e, t.id)}
                      className="p-1.5 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all absolute right-3 top-3"
                      aria-label="Delete template"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 pr-2">{t.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

