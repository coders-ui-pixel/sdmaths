"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles, ChevronRight, GraduationCap } from "lucide-react"
import { toast } from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

export default function LmsLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        toast.error(`Access Denied: ${res.error}`)
      } else {
        toast.success("Identity Verified. Redirecting to LMS...")
        router.push("/") 
      }
    } catch (error) {
      toast.error("A system error occurred during authentication")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex bg-white dark:bg-[#020617] overflow-hidden">
      {/* Left Panel: Visual Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#020617] items-center justify-center overflow-hidden">
        {/* Dynamic Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-30 scale-110 blur-[2px]"
          style={{ backgroundImage: 'url("/images/admin-login-bg.png")' }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-tr from-blue-900/40 via-transparent to-indigo-900/20" />
        
        {/* Animated Grid Overlay */}
        <div className="absolute inset-0 z-10 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-20 p-20 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-[var(--admin-accent)]/10 border border-[var(--admin-accent)]/20 text-blue-400 text-xs font-black uppercase tracking-[0.4em] mb-12">
            <Sparkles size={14} className="animate-pulse" />
            Next-Gen Education
          </div>
          
          <h1 className="text-8xl font-black text-white outfit leading-[0.9] tracking-tighter mb-8">
            MATH <br />
            <span className="text-[var(--admin-accent)]">LMS</span>
          </h1>
          
          <p className="text-xl text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
            Manage your institution with absolute precision and world-class administrative tools.
          </p>

          <div className="mt-20 flex justify-center gap-8 opacity-40">
            <div className="text-4xl font-serif text-white italic">∑</div>
            <div className="text-4xl font-serif text-white italic">∫</div>
            <div className="text-4xl font-serif text-white italic">π</div>
            <div className="text-4xl font-serif text-white italic">∞</div>
          </div>
        </motion.div>

        {/* Floating Decorative Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--admin-accent)]/20 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-20 relative">
        {/* Mobile Background (Only visible on small screens) */}
        <div className="lg:hidden absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-slate-50 dark:bg-[#020617]" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--admin-accent)]/5 blur-3xl rounded-full" />
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="flex flex-col mb-12">
            <div className="w-16 h-16 rounded-2xl bg-[var(--admin-accent)] text-white flex items-center justify-center shadow-xl shadow-[var(--admin-accent)]/30 mb-8 lg:hidden">
              <GraduationCap size={32} />
            </div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white outfit tracking-tight mb-3">
              Administrator Login
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Enter your credentials to access the management portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                Admin Email
              </label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--admin-accent)] transition-colors" size={20} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 focus:border-[var(--admin-accent)] rounded-2xl outline-none transition-all font-bold text-black shadow-sm placeholder:text-slate-400"
                    placeholder="admin@schoolofmath.com"
                  />
                </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                Access Password
              </label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--admin-accent)] transition-colors" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-14 py-5 bg-white border-2 border-slate-100 focus:border-[var(--admin-accent)] rounded-2xl outline-none transition-all font-bold text-black shadow-sm placeholder:text-slate-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-5 h-5 border-2 border-slate-200 dark:border-slate-800 rounded-md peer-checked:bg-[var(--admin-accent)] peer-checked:border-[var(--admin-accent)] transition-all" />
                  <CheckIcon className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-sm font-bold text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">Remember device</span>
              </label>
              <button 
                type="button" 
                onClick={() => toast("Please contact the system owner for password reset assistance.", { icon: '🔒' })}
                className="text-sm font-bold text-[var(--admin-accent)] hover:text-[var(--admin-accent-hover)] transition-colors"
              >
                Forgot access?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
              className="w-full py-5 hover:bg-[var(--admin-accent-hover)] rounded-2xl font-black text-xl shadow-xl shadow-[var(--admin-accent)]/20 transition-all transform active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-4 group"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                <span className="text-lg sm:text-xl uppercase tracking-tighter">Authenticate Access</span>
                <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </>
              )}
            </button>
          </form>

          <div className="mt-20 pt-10 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                End-to-End <br /> Encrypted
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em]">
              V 16.2.6
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
