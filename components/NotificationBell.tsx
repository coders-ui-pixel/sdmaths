"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, X, Check, Sparkles } from "lucide-react"

export function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [show, setShow] = useState(false)
  const [unread, setUnread] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000) // Polling every minute
    return () => clearInterval(interval)
  }, [])

  // Close on click outside
  useEffect(() => {
    if (!show) return
    const handleOutsideClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShow(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [show])

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications")
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
        setUnread(data.filter((n: any) => !n.isRead).length)
      }
    } catch (e) {}
  }

  const markRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" })
    setUnread(0)
    fetchNotifications()
  }

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffMins < 1) return "Just now"
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays === 1) return "Yesterday"
      if (diffDays < 7) return `${diffDays}d ago`
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
    } catch (e) {
      return "Some time ago"
    }
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button 
        onClick={() => { setShow(!show); if (!show) markRead() }}
        className="relative p-2 text-slate-500 hover:text-blue-600 transition-colors bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
        aria-label="View notifications"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
            {unread}
          </span>
        )}
      </button>

      {show && (
        <div className="notif-dropdown-container">
          <div className="notif-header">
            <h4 className="notif-header-title">Notifications</h4>
            <div className="flex items-center gap-3">
              {unread > 0 && (
                <button onClick={markRead} className="notif-mark-read-btn flex items-center gap-1">
                  <Check size={12} /> Mark all read
                </button>
              )}
              <button onClick={() => setShow(false)} className="notif-close-btn" aria-label="Close notifications">
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty-state">
                <div className="notif-empty-icon-wrapper">
                  <Sparkles size={20} />
                </div>
                <h5 className="notif-empty-title">All Caught Up!</h5>
                <p className="notif-empty-subtitle">
                  You have no new notifications or announcements at the moment.
                </p>
              </div>
            ) : (
              notifications.map((n: any) => (
                <div 
                  key={n.id} 
                  className={`notif-item ${!n.isRead ? "notif-item-unread" : ""}`}
                >
                  <p className="notif-item-title">{n.title}</p>
                  <p className="notif-item-message">{n.message}</p>
                  <span className="notif-item-date">
                    {formatTimeAgo(n.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

