"use client"

import { useState, useEffect } from "react"
import { Search, Mail, Phone, Clock, CheckCircle, Trash2 } from "lucide-react"
import { SITE_NAME } from "@/lib/site"

type Message = {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  isRead: boolean
  createdAt: string
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/messages")
      const data = await res.json()
      setMessages(data)
    } catch (e) {
      console.error("Failed to load messages", e)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: !currentStatus }),
      })
      setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: !currentStatus } : m))
    } catch (e) {
      console.error("Failed to mark as read", e)
    }
  }

  const deleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return
    try {
      await fetch(`/api/messages/${id}`, { method: "DELETE" })
      setMessages(prev => prev.filter(m => m.id !== id))
    } catch (e) {
      console.error("Failed to delete message", e)
    }
  }

  const filteredMessages = messages.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.email.toLowerCase().includes(search.toLowerCase())
  )

  const unreadCount = messages.filter(m => !m.isRead).length

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold outfit flex items-center gap-3">
            Inquiries
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {unreadCount} New
              </span>
            )}
          </h2>
          <p className="text-slate-500 mt-1">Manage direct messages sent from the About page.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)] transition-all"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-[var(--border)]">
            <Mail size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold mb-2">No messages found</h3>
            <p className="text-slate-500">Your inbox is completely clear.</p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div 
              key={msg.id} 
              className={`bg-white dark:bg-slate-900 rounded-2xl border p-6 transition-all ${
                msg.isRead ? 'border-[var(--border)] opacity-80' : 'border-[var(--admin-accent)] shadow-sm'
              }`}
            >
              <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                
                {/* Header info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      msg.isRead ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : 'bg-blue-100 dark:bg-blue-900/40 text-[var(--admin-accent)]'
                    }`}>
                      {msg.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{msg.name}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                        <a href={`mailto:${msg.email}`} className="flex items-center gap-1.5 hover:text-[var(--admin-accent)] transition-colors">
                          <Mail size={14} /> {msg.email}
                        </a>
                        {msg.phone && (
                          <a href={`tel:${msg.phone}`} className="flex items-center gap-1.5 hover:text-[var(--admin-accent)] transition-colors">
                            <Phone size={14} /> {msg.phone}
                          </a>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} /> {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Message body */}
                  <div className={`bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-slate-700 dark:text-slate-300 whitespace-pre-wrap text-sm ${msg.isRead ? '' : 'font-medium'}`}>
                    {msg.message}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => markAsRead(msg.id, msg.isRead)}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      msg.isRead 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700' 
                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                    }`}
                  >
                    <CheckCircle size={16} />
                    {msg.isRead ? "Mark Unread" : "Mark Read"}
                  </button>
                  <a 
                    href={`mailto:${msg.email}?subject=Reply from ${SITE_NAME}`}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--admin-accent)] text-white hover:bg-[var(--admin-accent)] transition-colors"
                  >
                    <Mail size={16} /> Reply
                  </a>
                  <button 
                    onClick={() => deleteMessage(msg.id)}
                    className="flex-none p-2 rounded-lg text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
                    title="Delete message"
                  >
                    <Trash2 size={18} className="mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
