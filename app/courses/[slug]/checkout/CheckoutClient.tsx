"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "react-hot-toast"
import { ShoppingCart, Upload, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Clock, BookOpen, Sparkles, ShieldCheck } from "lucide-react"

type Course = {
  id: string
  title: string
  slug: string
  thumbnail: string | null
  rawPrice: number
  displayPrice: number
  isFree: boolean
  isPromoActive: boolean
  discountAmount: number
  paymentQrUrl: string | null
}

export function CheckoutClient({ course, alreadyPending, userName }: { course: Course; alreadyPending: boolean; userName: string }) {
  const router = useRouter()
  const [submitted, setSubmitted] = useState(alreadyPending)
  const [submitting, setSubmitting] = useState(false)

  const [name, setName] = useState(userName)
  const [phone, setPhone] = useState("")
  const [paymentId, setPaymentId] = useState("")
  const [proofFile, setProofFile] = useState<File | null>(null)

  const handleFreeCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) {
      toast.error("Please fill in your name and phone number")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id, name: name.trim(), phone: phone.trim() })
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Registration failed")
      }
      toast.success("You're enrolled! Redirecting to your course...")
      router.push(`/courses/${course.slug}/learn`)
    } catch (error: any) {
      toast.error(error.message || "An error occurred")
      setSubmitting(false)
    }
  }

  const handlePaidCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!proofFile || !paymentId.trim()) {
      toast.error("Please fill all fields")
      return
    }
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("file", proofFile)
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
      if (!uploadRes.ok) {
        const errorData = await uploadRes.json()
        throw new Error(errorData.error || "Upload failed")
      }
      const { url } = await uploadRes.json()

      const paymentRes = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id, proofUrl: url, paymentId: paymentId.trim() })
      })
      if (!paymentRes.ok) {
        const error = await paymentRes.json()
        throw new Error(error.error || "Failed to submit payment")
      }
      setSubmitted(true)
      toast.success("Order placed!")
    } catch (error: any) {
      toast.error(error.message || "An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  // Pending-verification state — shown after a paid submission, or if the
  // student already had a pending payment for this course on page load.
  if (submitted) {
    return (
      <div className="container max-w-2xl mx-auto px-6 pt-32 pb-20">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-400/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-6">
              <Clock size={36} className="text-amber-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black outfit text-slate-900 dark:text-white mb-3">Please wait for verification</h1>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto mb-8">
              Your order for <strong className="text-slate-700 dark:text-slate-200">{course.title}</strong> has been submitted.
              An admin will verify your payment ID and screenshot shortly — you'll get instant access to the course as soon as it's approved.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/dashboard" className="btn-primary inline-flex">
                Go to Dashboard
              </Link>
              <Link href="/courses" className="px-6 py-3 rounded-full font-bold text-sm border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[var(--primary)] transition-colors inline-flex items-center">
                Browse More Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto px-6 pt-28 md:pt-32 pb-20">
      <Link href={`/courses/${course.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[var(--primary)] transition-colors mb-6">
        <ArrowLeft size={16} /> Back to course
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
          <ShoppingCart size={20} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black outfit text-slate-900 dark:text-white">Checkout</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Review your order and complete enrollment.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        {/* Left: payment / registration form */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-6 md:p-8 order-2 lg:order-1">
          {course.isFree ? (
            <form onSubmit={handleFreeCheckout} className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-emerald-500" />
                <h2 className="font-bold text-slate-800 dark:text-slate-100">Your Details</h2>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 -mt-3">This course is free — just confirm your details to get instant access.</p>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-5 py-4 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-[var(--primary)] font-bold text-sm !text-black dark:!text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="98XXXXXXXX"
                  className="w-full px-5 py-4 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-[var(--primary)] font-bold text-sm !text-black dark:!text-white"
                />
              </div>

              <button type="submit" disabled={!name.trim() || !phone.trim() || submitting} className="btn-primary w-full !py-4">
                {submitting ? <Loader2 size={18} className="animate-spin" /> : "Checkout — Rs. 0"}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePaidCheckout} className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[10px] font-black flex items-center justify-center">1</span>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Scan & Pay</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 sm:p-6 text-center">
                  {course.paymentQrUrl ? (
                    <div className="w-40 h-40 sm:w-48 sm:h-48 bg-white rounded-2xl mx-auto flex items-center justify-center p-3 shadow-sm mb-3">
                      <img src={course.paymentQrUrl} alt="Payment QR" className="max-w-full max-h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-40 h-40 sm:w-48 sm:h-48 bg-slate-100 dark:bg-slate-700 rounded-2xl mx-auto flex flex-col items-center justify-center p-6 mb-3">
                      <AlertCircle className="text-slate-300 dark:text-slate-600 mb-2" />
                      <span className="text-[10px] text-slate-400">QR not available — contact support</span>
                    </div>
                  )}
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">eSewa / Khalti / ConnectIPS</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[10px] font-black flex items-center justify-center">2</span>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Submit Verification</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment ID / Transaction ID</label>
                    <input
                      type="text"
                      required
                      value={paymentId}
                      onChange={e => setPaymentId(e.target.value)}
                      placeholder="Enter 10-12 digit ID"
                      className="w-full px-5 py-4 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-[var(--primary)] font-bold text-sm !text-black dark:!text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Screenshot</label>
                    <label className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      proofFile ? "border-green-500 bg-green-50/50 dark:bg-green-500/10" : "border-slate-200 dark:border-slate-800 hover:border-[var(--primary)]"
                    }`}>
                      <Upload size={20} className={`mx-auto mb-2 ${proofFile ? "text-green-500" : "text-slate-400"}`} />
                      <span className="text-xs font-bold text-slate-500 block truncate px-2">
                        {proofFile ? proofFile.name : "Click to select image"}
                      </span>
                      <input type="file" accept="image/*" className="hidden" onChange={e => setProofFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={!proofFile || !paymentId.trim() || submitting} className="btn-primary w-full !py-4">
                {submitting ? <Loader2 size={18} className="animate-spin" /> : `Checkout — Rs. ${course.displayPrice.toLocaleString()}`}
              </button>
            </form>
          )}
        </div>

        {/* Right: order summary */}
        <div className="order-1 lg:order-2">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-6 sticky top-24">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Order Summary</h2>
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-100 dark:border-slate-800">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-xl shrink-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" }}>
                  <BookOpen size={22} className="text-white/80" />
                </div>
              )}
              <div className="min-w-0">
                <div className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-snug line-clamp-2">{course.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">Full course access</div>
              </div>
            </div>

            <div className="space-y-2 text-sm mb-5 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Course price</span>
                <span className={course.isPromoActive ? "line-through" : ""}>{course.isFree ? "Free" : `Rs. ${course.rawPrice.toLocaleString()}`}</span>
              </div>
              {course.isPromoActive && (
                <div className="flex items-center justify-between text-red-500 font-semibold">
                  <span>Promo discount</span>
                  <span>- Rs. {course.discountAmount.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mb-6">
              <span className="font-bold text-slate-800 dark:text-slate-100">Total</span>
              <span className="text-2xl font-black text-[var(--primary)]">
                {course.isFree ? "Rs. 0" : `Rs. ${course.displayPrice.toLocaleString()}`}
              </span>
            </div>

            <div className="flex items-start gap-2 text-xs text-slate-400 leading-relaxed">
              <ShieldCheck size={28} className="shrink-0 text-emerald-500" />
              <span>{course.isFree ? "Instant access — no payment required." : "After checkout, an admin verifies your payment before access is granted."}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
