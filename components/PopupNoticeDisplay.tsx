"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X, Megaphone } from "lucide-react"

type Notice = {
  id: string
  title: string
  message: string
  linkUrl: string | null
  linkLabel: string | null
  imageUrl: string | null
  updatedAt: string
}

export function PopupNoticeDisplay() {
  const [notice, setNotice] = useState<Notice | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    fetch("/api/popup-notice")
      .then(res => res.json())
      .then((data: Notice | null) => {
        if (!data) return
        const dismissedKey = `popup-notice-dismissed-${data.id}`
        const dismissedAt = localStorage.getItem(dismissedKey)
        // Re-show if the notice was edited (updatedAt changed) since it was last dismissed.
        if (dismissedAt === data.updatedAt) return
        setNotice(data)
        setVisible(true)
      })
      .catch(() => {})
  }, [])

  if (!notice || !visible) return null

  const dismiss = () => {
    localStorage.setItem(`popup-notice-dismissed-${notice.id}`, notice.updatedAt)
    setVisible(false)
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden">
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 text-white flex items-center justify-center transition-colors"
        >
          <X size={16} />
        </button>

        {notice.imageUrl ? (
          <img src={notice.imageUrl} alt={notice.title} className="w-full aspect-video object-cover" />
        ) : (
          <div className="w-full aspect-[3/1] flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" }}>
            <Megaphone size={40} className="text-white/80" />
          </div>
        )}

        <div className="p-7">
          <h3 className="text-xl font-black outfit text-slate-900 dark:text-white mb-2">{notice.title}</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap mb-5">{notice.message}</p>

          <div className="flex gap-3">
            {notice.linkUrl && (
              <Link
                href={notice.linkUrl}
                onClick={dismiss}
                className="flex-1 text-center py-3 rounded-xl font-bold text-white text-sm"
                style={{ backgroundColor: "var(--primary)" }}
              >
                {notice.linkLabel || "Learn More"}
              </Link>
            )}
            <button
              onClick={dismiss}
              className={`${notice.linkUrl ? "flex-1" : "w-full"} py-3 rounded-xl font-bold text-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300`}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
