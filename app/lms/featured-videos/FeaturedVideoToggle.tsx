"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function FeaturedVideoToggle({ lessonId, initialStatus, disabled }: { lessonId: string, initialStatus: boolean, disabled: boolean }) {
  const [isFeatured, setIsFeatured] = useState(initialStatus)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggle() {
    if (disabled) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}/feature`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeaturedSample: !isFeatured })
      })
      if (res.ok) {
        setIsFeatured(!isFeatured)
        router.refresh()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={disabled || loading}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        disabled ? "bg-slate-200 cursor-not-allowed" : isFeatured ? "bg-[var(--admin-accent)]" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          isFeatured ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  )
}
