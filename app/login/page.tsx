"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LogIn, Mail, Phone, ArrowRight, Eye, EyeOff, CheckCircle } from "lucide-react"
import { toast } from "react-hot-toast"
import { SITE_NAME } from "@/lib/site"

export default function LoginPage() {
  const [tab, setTab] = useState<"email" | "otp">("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"phone" | "verify">("phone")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Forgot Password States
  const [isForgotState, setIsForgotState] = useState(false)
  const [forgotName, setForgotName] = useState("")
  const [forgotStudentId, setForgotStudentId] = useState("")
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState("")

  const router = useRouter()

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotName || !forgotStudentId || !forgotEmail) return
    setForgotLoading(true)
    setForgotError("")
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: forgotName, studentId: forgotStudentId, email: forgotEmail })
      })
      const data = await res.json()
      if (!res.ok) {
        setForgotError(data.error || "Something went wrong. Please try again.")
      } else {
        setForgotSent(true)
        toast.success("Request submitted! Admin will reset your password shortly.")
      }
    } catch {
      setForgotError("Network error. Please check your connection.")
    } finally {
      setForgotLoading(false)
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      setError("Invalid email or password.")
      setLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    // Simulate OTP send (integrate with Firebase/Twilio)
    await new Promise(r => setTimeout(r, 1000))
    setStep("verify")
    setLoading(false)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    // Simulate OTP verify
    await new Promise(r => setTimeout(r, 1000))
    if (otp !== "123456") {
      setError("Invalid OTP. Please try again.")
      setLoading(false)
      return
    }
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-[var(--primary)] opacity-10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-[var(--secondary)] opacity-10 blur-[100px] rounded-full" />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold outfit gradient-text">{SITE_NAME}</Link>
          <p className="mt-2 text-slate-500">Sign in to continue learning</p>
        </div>

        <div className="card p-8">
          {isForgotState ? (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold outfit" style={{ color: "#000000" }}>Forgot Password?</h3>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                  Fill in your details below. Our admin will reset your password and notify you.
                </p>
              </div>

              {forgotSent ? (
                <div className="space-y-4 p-5 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/20 rounded-2xl text-center">
                  <CheckCircle size={36} className="text-green-500 mx-auto mb-2" />
                  <h4 className="text-green-800 dark:text-green-300 font-bold text-sm">Request Submitted!</h4>
                  <p className="text-green-600 dark:text-green-500 text-xs mt-1 leading-relaxed">
                    Your password reset request has been received. The admin will reset your password for <strong>{forgotEmail}</strong> and notify you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotState(false)
                      setForgotSent(false)
                      setForgotName("")
                      setForgotStudentId("")
                      setForgotEmail("")
                      setForgotError("")
                    }}
                    className="w-full btn-primary py-2.5 rounded-xl font-bold text-xs"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={forgotName}
                      onChange={(e) => setForgotName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                      style={{ color: "#000000" }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Student ID / Phone</label>
                    <input
                      type="text"
                      required
                      value={forgotStudentId}
                      onChange={(e) => setForgotStudentId(e.target.value)}
                      placeholder="Your student ID or phone number"
                      className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                      style={{ color: "#000000" }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                      style={{ color: "#000000" }}
                    />
                  </div>
                  {forgotError && (
                    <p className="text-red-500 text-xs bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/20 rounded-lg px-3 py-2">{forgotError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="btn-primary w-full py-2.5 rounded-xl flex items-center justify-center gap-2 mt-1"
                  >
                    {forgotLoading ? "Submitting Request..." : "Submit Reset Request"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotState(false)
                      setForgotError("")
                    }}
                    className="w-full py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
                    style={{ color: "#000000" }}
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
          ) : (
            <>
              {/* Tab Switcher */}
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mb-8">
                <button
                  onClick={() => setTab("email")}
                  className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                    tab === "email" ? "bg-white dark:bg-slate-700 shadow-sm text-[var(--primary)]" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  <span className="flex items-center justify-center gap-2"><Mail size={16}/> Email</span>
                </button>
                <button
                  onClick={() => { setTab("otp"); setStep("phone") }}
                  className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                    tab === "otp" ? "bg-white dark:bg-slate-700 shadow-sm text-[var(--primary)]" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  <span className="flex items-center justify-center gap-2"><Phone size={16}/> Phone OTP</span>
                </button>
              </div>

              {tab === "email" && (
                <div className="space-y-4">
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        required
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium">Password</label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotState(true)
                            setForgotSent(false)
                            setForgotEmail("")
                          }}
                          className="text-xs text-[var(--primary)] hover:underline font-bold"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-4 pr-10 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                      {loading ? "Signing in..." : "Sign In"}
                    </button>
                  </form>

                  <p className="text-center text-sm text-slate-500 mt-4">
                    No account?{" "}
                    <Link href="/register" className="text-[var(--primary)] font-semibold hover:underline">Register</Link>
                  </p>
                </div>
              )}

              {tab === "otp" && (
                <div>
                  {step === "phone" ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone Number</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">+977</span>
                          <input
                            type="tel"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="98XXXXXXXX"
                            className="w-full pl-14 pr-4 py-3 border border-[var(--border)] rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            required
                          />
                        </div>
                      </div>
                      <button type="submit" disabled={loading} className="btn-primary w-full">
                        {loading ? "Sending..." : "Send OTP"}
                        <ArrowRight size={18} />
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Enter OTP sent to +977 {phone}</label>
                        <input
                          type="text"
                          value={otp}
                          onChange={e => setOtp(e.target.value)}
                          placeholder="6-digit OTP"
                          maxLength={6}
                          className="w-full px-4 py-3 border border-[var(--border)] rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-center text-2xl tracking-[1rem] font-bold"
                          required
                        />
                      </div>
                      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                      <button type="submit" disabled={loading} className="btn-primary w-full">
                        {loading ? "Verifying..." : "Verify OTP"}
                        <ArrowRight size={18} />
                      </button>
                      <button type="button" onClick={() => setStep("phone")} className="w-full text-sm text-slate-500 hover:text-[var(--primary)] transition-colors">
                        Change number
                      </button>
                    </form>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
