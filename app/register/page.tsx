"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { SITE_NAME } from "@/lib/site"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || "Registration failed")
        setLoading(false)
        return
      }

      // Automatically sign in after successful registration
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (signInRes?.error) {
        setError("Login failed after registration. Please log in manually.")
        setLoading(false)
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      setError("An unexpected error occurred.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-[var(--primary)] opacity-10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-[var(--secondary)] opacity-10 blur-[100px] rounded-full" />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold outfit gradient-text">{SITE_NAME}</Link>
          <p className="mt-2 text-slate-500">Create an account to start learning</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                required
              />
            </div>
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
              <label className="block text-sm font-medium mb-1">Password</label>
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
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--primary)] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
