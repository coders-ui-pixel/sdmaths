"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ShoppingCart, UserPlus } from "lucide-react"
import { toast } from "react-hot-toast"
import { useSession } from "next-auth/react"

// `price` is what's shown/charged (may be a promo-discounted amount), while
// `isFree` reflects the course's actual base price — a course discounted down
// to Rs. 0 by a promo is NOT the same as a genuinely free course, and must
// still go through the paid-proof flow (the server enforces this too).
type Course = { id: string; title: string; price: number; isFree: boolean; slug: string; paymentQrUrl?: string | null }

export function EnrollButton({ course }: { course: Course }) {
  const [showStickyBtn, setShowStickyBtn] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()

  const isFree = course.isFree

  useEffect(() => {
    const handleScroll = () => setShowStickyBtn(window.scrollY > 300)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleEnrollClick = () => {
    if (!session) {
      toast.error("Please log in to enroll in this course.")
      router.push(`/login?callbackUrl=/courses/${course.slug}/checkout`)
      return
    }
    router.push(`/courses/${course.slug}/checkout`)
  }

  const stickyLabel = isFree ? "Register — Free" : `Enroll Now — Rs. ${course.price.toLocaleString()}`
  const mainLabel = isFree ? "Register — Free" : `Enroll — Rs. ${course.price.toLocaleString()}`

  return (
    <>
      <button onClick={handleEnrollClick} className="btn-primary w-full mt-2 group">
        {isFree ? <UserPlus size={18} className="group-hover:scale-110 transition-transform" /> : <ShoppingCart size={18} className="group-hover:scale-110 transition-transform" />}
        {mainLabel}
      </button>

      {/* Floating Sticky Enroll Button at bottom-right corner */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-500 transform ${
        showStickyBtn ? "scale-100 translate-y-0 opacity-100 pointer-events-auto" : "scale-75 translate-y-10 opacity-0 pointer-events-none"
      }`}>
        <button
          onClick={handleEnrollClick}
          className="flex items-center gap-3 px-6 py-4 text-white rounded-full font-black outfit text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 group border border-white/20 uppercase tracking-wider"
          style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            boxShadow: '0 10px 25px -3px var(--primary)'
          }}
        >
          {isFree ? <UserPlus size={18} className="group-hover:animate-bounce" /> : <ShoppingCart size={18} className="group-hover:animate-bounce" />}
          {stickyLabel}
        </button>
      </div>
    </>
  )
}
